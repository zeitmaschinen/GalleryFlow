import logging

logging.basicConfig(
    level=logging.WARNING,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

import os
import platform
import subprocess
from pathlib import Path
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Query, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict
import json
import asyncio
import threading
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import uuid
import datetime

from . import crud, models, schemas, database

logger = logging.getLogger(__name__)
app = FastAPI(
    title="GalleryFlow API",
    version="1.3.0",
    description="API for browsing and managing ComfyUI-generated images with advanced metadata support"
)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
watchdog_observers = {}

# Store the main event loop for cross-thread scheduling
MAIN_EVENT_LOOP = None

# Global event queue for watchdog events (initialized in on_startup)
watchdog_event_queue = None

async def watchdog_event_consumer():
    from . import crud, database
    while True:
        folder_id, folder_path = await watchdog_event_queue.get()
        scan_id = str(uuid.uuid4())
        logger.info(f"Processing folder scan: id={folder_id}, path={folder_path}")
        async with database.AsyncSessionLocal() as db:
            try:
                folder = await crud.get_folder(db, folder_id)
                if folder:
                    scan_result = await crud.scan_folder_and_update_db(db, folder)
                    logger.info(f"Scan complete for folder_id={folder_id}")
                    await broadcast_progress(folder_id, {"event": "folder_change", "folder_id": folder_id, "scan_id": scan_id})
                else:
                    logger.warning(f"No folder found in DB for folder_id={folder_id} during watchdog-triggered scan.")
            except Exception as e:
                logger.error(f"Error during watchdog-triggered scan for folder_id={folder_id}: {e}", exc_info=True)
        watchdog_event_queue.task_done()

class FolderWatchdogHandler(FileSystemEventHandler):
    def __init__(self, folder_id, folder_path):
        self.folder_id = folder_id
        self.folder_path = folder_path
        super().__init__()

    def on_any_event(self, event):
        global watchdog_event_queue
        if not event.is_directory:
            logger.info(f"Watchdog event detected for folder_id={self.folder_id}: {event.event_type} {event.src_path}")
            logger.debug(f"[DEBUG] Watchdog event details: {event}")
            asyncio.run_coroutine_threadsafe(
                watchdog_event_queue.put((self.folder_id, self.folder_path)), MAIN_EVENT_LOOP
            )

async def start_watchdog_for_folder(folder_id, folder_path):
    if folder_id in watchdog_observers:
        return  # Already watching
    event_handler = FolderWatchdogHandler(folder_id, folder_path)
    observer = Observer()
    observer.schedule(event_handler, folder_path, recursive=True)
    observer.daemon = True
    observer.start()
    watchdog_observers[folder_id] = observer
    logger.info(f"Started watchdog for folder {folder_path} (ID: {folder_id})")

async def stop_all_watchdogs():
    for observer in watchdog_observers.values():
        observer.stop()
        observer.join()
    watchdog_observers.clear()
    logger.info("Stopped all watchdog observers.")

@app.on_event("startup")
async def on_startup():
    global MAIN_EVENT_LOOP, watchdog_event_queue
    MAIN_EVENT_LOOP = asyncio.get_running_loop()
    watchdog_event_queue = asyncio.Queue()
    
    logger.info("Initializing application...")
    await database.create_db_and_tables()
    
    # Start watchdogs for all folders in DB
    db_gen = database.get_db()
    db = await db_gen.__anext__()
    try:
        folders = await crud.get_folders(db)
        for folder in folders:
            await start_watchdog_for_folder(folder.id, folder.path)
    finally:
        await db_gen.aclose()
    
    # Start the watchdog event consumer task
    asyncio.create_task(watchdog_event_consumer())
    logger.info("Application startup complete")

@app.on_event("shutdown")
async def on_shutdown():
    await stop_all_watchdogs()

# Store active WebSocket connections
active_connections: Dict[int, List[WebSocket]] = {}

@app.websocket("/ws/scan-progress/{folder_id}")
async def websocket_endpoint(websocket: WebSocket, folder_id: int):
    await websocket.accept()
    logger.debug(f"WebSocket connection opened for folder_id={folder_id}")
    if folder_id not in active_connections:
        active_connections[folder_id] = []
    active_connections[folder_id].append(websocket)
    try:
        while True:
            # Accept any message (text or binary) to keep the connection alive
            try:
                await websocket.receive_text()
            except Exception:
                try:
                    await websocket.receive_bytes()
                except Exception:
                    # If neither text nor bytes, just continue to keep alive
                    await asyncio.sleep(10)
    except Exception:
        logger.debug(f"WebSocket connection closed for folder_id={folder_id}")
    finally:
        active_connections[folder_id].remove(websocket)
        if not active_connections[folder_id]:
            del active_connections[folder_id]

async def broadcast_progress(folder_id: int, data: dict):
    if folder_id in active_connections:
        for connection in active_connections[folder_id][:]:
            try:
                await connection.send_json(data)
            except Exception as e:
                msg = str(e)
                if "after sending 'websocket.close'" in msg or "already completed" in msg:
                    logger.debug(f"WebSocket connection already closed: {e}")
                else:
                    logger.error(f"WebSocket send failed: {e}")
                active_connections[folder_id].remove(connection)
        if not active_connections[folder_id]:
            del active_connections[folder_id]

# --- API Endpoints ---

# --- Keep Folder Endpoints (/api/folders, /api/folders/{id}/scan, etc.) ---
@app.post("/api/folders", response_model=schemas.Folder, status_code=201)
async def add_folder(
    folder_in: schemas.FolderCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(database.get_db)
):
    logger.info(f"Received request to add folder: {folder_in.path}")
    folder_path = Path(folder_in.path)
    
    # Improved error checks with user-friendly messages
    if not folder_path.is_absolute():
        raise HTTPException(
            status_code=400, 
            detail="The folder path must be an absolute path (e.g., /Users/name/folder or C:\\Users\\name\\folder)"
        )
        
    try:
        # Test if path exists and is accessible
        folder_path.resolve(strict=True)
    except FileNotFoundError:
        raise HTTPException(
            status_code=404, 
            detail=f"The folder '{folder_path}' does not exist. Please check the path and try again."
        )
    except PermissionError:
        raise HTTPException(
            status_code=403, 
            detail=f"Cannot access the folder '{folder_path}'. Please check your permissions and try again."
        )
    except Exception as e:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid folder path: {str(e)}"
        )

    if not folder_path.is_dir():
        raise HTTPException(
            status_code=400, 
            detail=f"The path '{folder_path}' exists but is not a directory. Please provide a valid folder path."
        )

    resolved_path_str = str(folder_path.resolve())
    existing_folder = await crud.get_folder_by_path(db, resolved_path_str)
    if existing_folder:
        raise HTTPException(
            status_code=409, 
            detail=f"This folder is already in your library. You cannot add the same folder twice."
        )

    try:
        created_folder = await crud.create_folder(db, schemas.FolderCreate(path=resolved_path_str))
        logger.info(f"Folder added to database: {created_folder.path} (ID: {created_folder.id})")
        background_tasks.add_task(crud.scan_folder_and_update_db, db, created_folder)
        # Start watchdog for new folder
        await start_watchdog_for_folder(created_folder.id, created_folder.path)
        return created_folder
    except Exception as e:
        logger.error(f"Failed to add folder: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to add the folder to the library. Please try again or contact support if the problem persists."
        )

@app.get("/api/folders", response_model=List[schemas.Folder])
async def list_folders(db: AsyncSession = Depends(database.get_db)):
    logger.info("Received request to list folders")
    folders = await crud.get_folders(db)
    return folders

@app.post("/api/folders/{folder_id}/scan", response_model=schemas.ScanStatus)
async def refresh_folder(
    folder_id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(database.get_db)
):
    logger.info(f"Received request to refresh folder ID: {folder_id}")
    folder = await crud.get_folder(db, folder_id)
    if not folder:
        raise HTTPException(status_code=404, detail=f"Folder with ID {folder_id} not found")

    async def progress_callback(data: dict):
        await broadcast_progress(folder_id, {**data, 'folder_id': folder_id})

    try:
        scan_result = await crud.scan_folder_and_update_db(
            db, 
            folder,
            progress_callback=progress_callback
        )
        logger.info(f"Manual scan completed for folder ID {folder_id}")
        return scan_result
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error during manual scan for folder ID {folder_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")

@app.delete("/api/folders/{folder_id}", status_code=204)
async def remove_folder(folder_id: int, db: AsyncSession = Depends(database.get_db)):
    logger.info(f"Received request to delete folder ID: {folder_id}")
    success = await crud.delete_folder(db, folder_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Folder with ID {folder_id} not found")
    # Stop watchdog for deleted folder
    observer = watchdog_observers.pop(folder_id, None)
    if observer:
        observer.stop()
        observer.join()
        logger.info(f"Stopped watchdog for folder ID: {folder_id}")
    logger.info(f"Folder ID {folder_id} deleted successfully.")
    return

# --- UPDATE Image List Endpoint ---
@app.get("/api/images", response_model=schemas.ImageListResponse) # Use new response model
async def list_images(
    folder_id: int,
    skip: int = Query(0, ge=0), # Add skip query param, >= 0
    limit: int = Query(100, ge=1, le=1000), # Add limit query param, 1 <= limit <= 1000
    sort_by: str = Query("filename", description="Field to sort by (filename, date)"),
    sort_dir: str = Query("asc", description="Sort direction (asc, desc)"),
    file_types: Optional[List[str]] = Query(None, description="Filter by file extensions (e.g., .png, .jpg)"),
    db: AsyncSession = Depends(database.get_db)
):
    """Lists cached images for a specific folder with pagination, sorting, and filtering."""
    logger.info(f"[DEBUG] /api/images called with folder_id={folder_id}, skip={skip}, limit={limit}, sort_by={sort_by}, sort_dir={sort_dir}, file_types={file_types}")
    logger.info(f"Request images: folder={folder_id}, skip={skip}, limit={limit}, sort={sort_by} {sort_dir}, types={file_types}")

    if sort_by not in ["filename", "date", "folder"]:
        sort_by = "filename"
    if sort_dir.lower() not in ["asc", "desc"]:
        sort_dir = "asc"

    folder = await crud.get_folder(db, folder_id)
    if not folder:
        logger.warning(f"[DEBUG] Folder with ID {folder_id} not found.")
        raise HTTPException(status_code=404, detail=f"Folder with ID {folder_id} not found")

    image_response = await crud.get_images_by_folder(
        db,
        folder_id=folder_id,
        skip=skip,
        limit=limit,
        sort_by=sort_by,
        sort_dir=sort_dir,
        file_types=file_types
    )
    logger.info(f"[DEBUG] Returning image response: {image_response}")
    return image_response


# --- Keep Image Serving Endpoint (/api/image) ---
@app.get("/api/image")
async def get_image_file(
    file_path: str = Query(..., description="Absolute path to the image file"),
    cache: bool = Query(False, description="Enable browser caching for this image"),
    db: AsyncSession = Depends(database.get_db)
):
    logger.info(f"Received request for image file: {file_path}")
    requested_path = Path(file_path)
    if not requested_path.is_absolute():
        raise HTTPException(status_code=400, detail="File path must be absolute.")
    try:
        resolved_requested_path = requested_path.resolve(strict=True)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Image file not found at the specified path.")
    except Exception as e:
        logger.warning(f"Error resolving path '{file_path}': {e}")
        raise HTTPException(status_code=400, detail="Invalid file path.")

    mapped_folders = await crud.get_folders(db)
    is_allowed = False
    for folder in mapped_folders:
        try:
            mapped_folder_path = Path(folder.path).resolve()
            if resolved_requested_path.is_relative_to(mapped_folder_path):
                is_allowed = True
                break
        except Exception as e:
             logger.warning(f"Error resolving mapped folder path '{folder.path}': {e}")
             continue

    if not is_allowed:
        logger.warning(f"Access denied for image path: {resolved_requested_path}. Not within any mapped folder.")
        raise HTTPException(status_code=403, detail="Access denied: File path is not within a registered folder.")

    if not resolved_requested_path.is_file():
        raise HTTPException(status_code=404, detail="Image file not found.")

    media_type = f'image/{resolved_requested_path.suffix.lstrip(".")}'
    if resolved_requested_path.suffix.lower() == '.jpg':
        media_type = 'image/jpeg'

    logger.info(f"Serving image: {resolved_requested_path} with media type {media_type}, cache={cache}")
    response = FileResponse(str(resolved_requested_path), media_type=media_type)
    
    # Add cache control headers if caching is requested
    if cache:
        # Cache for 7 days (604800 seconds)
        response.headers["Cache-Control"] = "public, max-age=604800, immutable"
        # Add ETag based on file modification time for cache validation
        file_stat = resolved_requested_path.stat()
        etag = f"\"{hash(str(file_stat.st_mtime) + str(file_stat.st_size))}\""
        response.headers["ETag"] = etag
    else:
        # Prevent caching if not explicitly requested
        response.headers["Cache-Control"] = "no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
    

    return response

@app.post("/api/reveal-in-explorer", status_code=200)
async def reveal_file(
    file_path: str = Query(..., description="Absolute path to the image file to reveal"),
    db: AsyncSession = Depends(database.get_db)
):
    """
    Attempts to reveal the specified file in the operating system's file explorer.
    SECURITY: Verifies the path is within a mapped folder first.
    """
    logger.info(f"Received request to reveal file: {file_path}")

    # --- CRITICAL SECURITY CHECK ---
    requested_path = Path(file_path)
    if not requested_path.is_absolute():
        logger.warning(f"Reveal access denied: Path not absolute: {file_path}")
        raise HTTPException(status_code=400, detail="File path must be absolute.")

    try:
        resolved_requested_path = requested_path.resolve(strict=False)
    except Exception as e:
        logger.warning(f"Error resolving path for reveal '{file_path}': {e}")
        raise HTTPException(status_code=400, detail="Invalid file path provided.")

    mapped_folders = await crud.get_folders(db)
    is_allowed = False
    if not mapped_folders:
         logger.warning("Reveal access denied: No folders mapped.")
         raise HTTPException(status_code=403, detail="Access denied: No folders are mapped.")

    for folder in mapped_folders:
        try:
            mapped_folder_path = Path(folder.path).resolve(strict=True)
            if resolved_requested_path == mapped_folder_path or resolved_requested_path.is_relative_to(mapped_folder_path):
                is_allowed = True
                break
        except FileNotFoundError:
             logger.warning(f"Mapped folder path not found during validation: '{folder.path}'")
             continue
        except Exception as e:
             logger.warning(f"Error resolving mapped folder path '{folder.path}' during validation: {e}")
             continue

    if not is_allowed:
        logger.warning(f"Reveal access denied for path: {resolved_requested_path}. Not within any mapped folder.")
        raise HTTPException(status_code=403, detail="Access denied: File path is not within a registered folder.")

    if not resolved_requested_path.is_file():
        logger.error(f"Cannot reveal file: File not found at resolved path: {resolved_requested_path}")
        raise HTTPException(status_code=404, detail="File not found at the specified path.")

    system = platform.system()
    command = []
    resolved_path_str = str(resolved_requested_path)

    try:
        if system == "Darwin":
            command = ["open", "-R", resolved_path_str]
            process = subprocess.run(command, check=True, capture_output=True, text=True)
            logger.info(f"Executed 'open -R': {process.args}. Return code: {process.returncode}")
        elif system == "Windows":
            command = ["explorer", "/select," + resolved_path_str]
            process = subprocess.run(command, check=True, capture_output=True, text=True, shell=False)
            logger.info(f"Executed 'explorer /select,': {process.args}. Return code: {process.returncode}")
        elif system == "Linux":
            containing_dir = str(resolved_requested_path.parent)
            command = ["xdg-open", containing_dir]
            process = subprocess.run(command, check=True, capture_output=True, text=True)
            logger.info(f"Executed 'xdg-open': {process.args}. Return code: {process.returncode}")
        else:
            logger.warning(f"Unsupported operating system for reveal: {system}")
            raise HTTPException(status_code=501, detail=f"Reveal function not implemented for OS: {system}")

        return {"message": "File location opened in Finder/Explorer."}

    except FileNotFoundError:
        logger.error(f"Reveal command not found: '{command[0]}' is likely not in the system PATH.")
        raise HTTPException(status_code=500, detail=f"File manager command ('{command[0]}') not found.")
    except subprocess.CalledProcessError as e:
        logger.error(f"Error executing reveal command: {e}. Stderr: {e.stderr}")
        raise HTTPException(status_code=500, detail=f"Failed to reveal file: Command execution failed.")
    except Exception as e:
        logger.error(f"Unexpected error revealing file '{resolved_path_str}': {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred during the reveal process.")

# --- Keep Root Endpoint ---
@app.get("/")
async def root():
    return {"message": "GalleryFlow Backend is running!"}