# File: backend/app/crud.py

import os
import logging
from pathlib import Path
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import delete, func, asc, desc, or_ # Import func for count and sorting
from sqlalchemy.dialects.sqlite import insert
from typing import List, Optional, Set

from . import models, schemas, metadata_extractor

logger = logging.getLogger(__name__)

# --- Folder CRUD --- (Keep existing folder functions)
# ... get_folder_by_path, get_folder, get_folders, create_folder, delete_folder ...

async def get_folder_by_path(db: AsyncSession, path: str) -> models.Folder | None:
    result = await db.execute(select(models.Folder).filter(models.Folder.path == path))
    return result.scalars().first()

async def get_folder(db: AsyncSession, folder_id: int) -> models.Folder | None:
    result = await db.execute(select(models.Folder).filter(models.Folder.id == folder_id))
    return result.scalars().first()

async def get_folders(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[models.Folder]:
    result = await db.execute(select(models.Folder).offset(skip).limit(limit))
    return result.scalars().all()

async def create_folder(db: AsyncSession, folder: schemas.FolderCreate) -> models.Folder:
    db_folder = models.Folder(path=folder.path)
    db.add(db_folder)
    await db.commit()
    await db.refresh(db_folder)
    return db_folder

async def delete_folder(db: AsyncSession, folder_id: int) -> bool:
    folder = await get_folder(db, folder_id)
    if folder:
        await db.delete(folder)
        await db.commit()
        return True
    return False


# --- Image CRUD --- (Modify get_images_by_folder)

# UPDATE this function
SUPPORTED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp'}
BATCH_SIZE = 500  # For batch processing

async def get_images_by_folder(
    db: AsyncSession,
    folder_id: int,
    skip: int = 0,
    limit: int = 200,
    sort_by: str = "filename",
    sort_dir: str = "asc",
    file_types: Optional[List[str]] = None
) -> schemas.ImageListResponse:
    folder = await get_folder(db, folder_id)
    if not folder:
        return schemas.ImageListResponse(images=[], total_count=0)
    
    folder_path = str(Path(folder.path).resolve())

    allowed_sort_fields = {
        "filename": models.Image.filename,
        "date": models.Image.last_modified,
        "folder": models.Image.full_path  # Add folder sorting
    }
    sort_column = allowed_sort_fields.get(sort_by, models.Image.filename)
    sort_direction = desc if sort_dir.lower() == "desc" else asc

    # Base query with file type filtering
    base_query = select(models.Image).filter(models.Image.full_path.like(f"{folder_path}%"))
    
    if file_types:
        # Convert extensions to lowercase for comparison
        file_types = [ext.lower() for ext in file_types]
        
        # Create OR conditions for each file type
        file_type_conditions = [
            func.lower(models.Image.filename).endswith(ext)
            for ext in file_types
        ]
        base_query = base_query.filter(or_(*file_type_conditions))

    # Get total count
    count_query = select(func.count()).select_from(base_query.subquery())
    count_result = await db.execute(count_query)
    total_count = count_result.scalar_one_or_none() or 0

    # Get paginated and sorted results
    images_query = (
        base_query
        .order_by(sort_direction(sort_column))
        .offset(skip)
        .limit(limit)
    )
    
    images_result = await db.execute(images_query)
    images = images_result.scalars().all()

    return schemas.ImageListResponse(images=images, total_count=total_count)

# --- Keep other image functions (get_image_by_path, create_or_update_image, remove_image_by_path) ---
async def get_image_by_path(db: AsyncSession, full_path: str) -> models.Image | None:
    result = await db.execute(select(models.Image).filter(models.Image.full_path == full_path))
    return result.scalars().first()

async def create_or_update_image(db: AsyncSession, image_data: schemas.ImageCreate) -> models.Image:
    existing_image = await get_image_by_path(db, image_data.full_path)
    if existing_image:
        # Update existing image if modified time or metadata changed
        update_data = image_data.model_dump(exclude_unset=True)
        needs_update = False
        if update_data.get('last_modified') and update_data['last_modified'] > existing_image.last_modified:
             existing_image.last_modified = update_data['last_modified']
             needs_update = True
        if 'metadata_' in update_data:
            existing_image.metadata_ = update_data['metadata_']
            needs_update = True

        if needs_update:
            await db.commit()
            await db.refresh(existing_image)
        return existing_image
    else:
        # Create new image entry
        db_image = models.Image(**image_data.model_dump())
        db.add(db_image)
        await db.commit()
        await db.refresh(db_image)
        return db_image

async def remove_image_by_path(db: AsyncSession, full_path: str):
    await db.execute(delete(models.Image).where(models.Image.full_path == full_path))
    await db.commit()


# --- Scan Logic --- (Modify scan_folder_and_update_db)
async def scan_folder_and_update_db(
    db: AsyncSession, 
    folder: models.Folder,
    progress_callback = None
) -> schemas.ScanStatus:
    logger.info(f"Starting scan for folder: {folder.path}")
    base_path = Path(folder.path)
    if not base_path.is_dir():
        logger.error(f"Folder path does not exist or is not a directory: {folder.path}")
        raise FileNotFoundError(f"Directory not found: {folder.path}")

    stats = {
        'added_count': 0,
        'updated_count': 0,
        'removed_count': 0,
        'skipped_count': 0,
        'processed_count': 0,
        'total_files': 0
    }

    # Get existing images for this folder
    result = await db.execute(
        select(models.Image.full_path, models.Image.last_modified)
        .filter(models.Image.folder_id == folder.id)
    )
    existing_db_images = {row.full_path: row.last_modified for row in result.all()}
    found_on_disk = set()
    
    # First, count total files for progress tracking
    stats['total_files'] = sum(1 for _ in base_path.rglob('*') if _.is_file() and _.suffix.lower() in SUPPORTED_EXTENSIONS)
    
    # Process files in batches
    batch = []
    try:
        for item in base_path.rglob('*'):
            stats['processed_count'] += 1
            
            if progress_callback:
                await progress_callback({
                    'current': stats['processed_count'],
                    'total': stats['total_files'],
                    **stats
                })

            if item.is_file() and item.suffix.lower() in SUPPORTED_EXTENSIONS:
                full_path_str = str(item.resolve())
                found_on_disk.add(full_path_str)
                try:
                    last_modified_timestamp = item.stat().st_mtime
                    # Always use UTC-aware datetime for comparison
                    last_modified_dt = datetime.fromtimestamp(last_modified_timestamp, tz=timezone.utc)
                    existing_mod_time = existing_db_images.get(full_path_str)
                    # If DB time is naive, make it aware (assume UTC)
                    if existing_mod_time is not None and existing_mod_time.tzinfo is None:
                        existing_mod_time = existing_mod_time.replace(tzinfo=timezone.utc)
                    if existing_mod_time is None or last_modified_dt > existing_mod_time:
                        metadata = metadata_extractor.extract_comfyui_metadata(full_path_str)
                        image_data = schemas.ImageCreate(
                            filename=item.name,
                            full_path=full_path_str,
                            last_modified=last_modified_dt,
                            metadata_=metadata,
                            folder_id=folder.id
                        )
                        batch.append(image_data)
                        if existing_mod_time is None:
                            stats['added_count'] += 1
                        else:
                            stats['updated_count'] += 1
                        # Process batch if it reaches the size limit
                        if len(batch) >= BATCH_SIZE:
                            await process_image_batch(db, batch)
                            batch = []
                    else:
                        stats['skipped_count'] += 1
                except Exception as e:
                    logger.error(f"Error processing file {item}: {e}")
                    stats['skipped_count'] += 1
        
        # Process any remaining items in the batch
        if batch:
            await process_image_batch(db, batch)

        # Remove images that no longer exist on disk
        db_paths = set(existing_db_images.keys())
        paths_to_remove = db_paths - found_on_disk
        if paths_to_remove:
            logger.info(f"Removing {len(paths_to_remove)} images no longer found on disk.")
            # Process deletions in batches
            for i in range(0, len(paths_to_remove), BATCH_SIZE):
                batch_paths = list(paths_to_remove)[i:i + BATCH_SIZE]
                await db.execute(
                    delete(models.Image).where(models.Image.full_path.in_(batch_paths))
                )
                await db.commit()
            stats['removed_count'] = len(paths_to_remove)

    except Exception as e:
        logger.error(f"Error during scan of {folder.path}: {e}")
        raise

    logger.info(
        f"Scan complete for {folder.path}. "
        f"Added: {stats['added_count']}, "
        f"Updated: {stats['updated_count']}, "
        f"Removed: {stats['removed_count']}, "
        f"Skipped: {stats['skipped_count']}"
    )
    
    return schemas.ScanStatus(
        message="Scan completed successfully",
        **stats
    )

async def process_image_batch(db: AsyncSession, batch: List[schemas.ImageCreate]):
    """Process a batch of images for database insertion/update, avoiding UNIQUE constraint errors."""
    # --- Deduplicate batch by full_path ---
    unique_images = {}
    for img in batch:
        unique_images[img.full_path] = img
    batch = list(unique_images.values())

    for image_data in batch:
        stmt = insert(models.Image).values(**image_data.model_dump())
        stmt = stmt.on_conflict_do_update(
            index_elements=['full_path'],
            set_={
                "last_modified": image_data.last_modified,
                "metadata": image_data.metadata_,  # Use correct column name for DB
                "folder_id": image_data.folder_id,
                "filename": image_data.filename,
            }
        )
        await db.execute(stmt)
    try:
        await db.commit()
    except Exception as e:
        logger.error(f"[process_image_batch] Error committing batch: {e}")
        await db.rollback()
        raise

# --- Keep other scan logic ---