import logging
from pathlib import Path
from PIL import Image as PILImage
from PIL import ImageOps
from typing import Tuple, Optional

logger = logging.getLogger(__name__)


class ThumbnailGenerator:
    def __init__(self, thumbnail_dir: str = "thumbnails", max_size: Tuple[int, int] = (300, 300)):
        self.thumbnail_dir = Path(thumbnail_dir)
        self.max_size = max_size
        self.thumbnail_dir.mkdir(exist_ok=True)
        # Create subdirectories for different sizes
        (self.thumbnail_dir / "small").mkdir(exist_ok=True)  # 150x150
        (self.thumbnail_dir / "medium").mkdir(exist_ok=True)  # 300x300

    def generate_thumbnail(self, image_path: str, size: str = "medium") -> Optional[str]:
        """Generate thumbnail for an image and return the thumbnail path."""
        try:
            source_path = Path(image_path)
            if not source_path.exists() or not source_path.is_file():
                logger.warning(f"Source image not found: {image_path}")
                return None
            # Determine thumbnail size
            if size == "small":
                thumb_size = (150, 150)
                size_dir = "small"
            else:
                thumb_size = (300, 300)
                size_dir = "medium"
            # Generate thumbnail filename
            thumb_filename = f"{source_path.stem}_{source_path.stat().st_mtime:.0f}.webp"
            thumb_path = self.thumbnail_dir / size_dir / thumb_filename
            # Skip if thumbnail already exists and is newer than source
            if thumb_path.exists():
                thumb_mtime = thumb_path.stat().st_mtime
                source_mtime = source_path.stat().st_mtime
                if thumb_mtime >= source_mtime:
                    return str(thumb_path)
            # Open and process image
            with PILImage.open(source_path) as img:
                # Convert to RGB if necessary (handles RGBA, P mode, etc.)
                if img.mode in ('RGBA', 'LA', 'P'):
                    # Create white background for transparent images
                    background = PILImage.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                    img = background
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                # Generate thumbnail with proper aspect ratio
                img.thumbnail(thumb_size, PILImage.Resampling.LANCZOS)
                # Add slight sharpening for better thumbnail quality
                img = ImageOps.exif_transpose(img)  # Handle EXIF rotation
                # Save as WebP for better compression
                img.save(thumb_path, 'WEBP', quality=85, optimize=True)
                logger.info(f"Generated thumbnail: {thumb_path}")
                return str(thumb_path)
        except Exception as e:
            logger.error(f"Failed to generate thumbnail for {image_path}: {e}")
            return None

    def get_image_dimensions(self, image_path: str) -> Tuple[Optional[int], Optional[int]]:
        """Get image dimensions without loading the full image."""
        try:
            with PILImage.open(image_path) as img:
                return img.width, img.height
        except Exception as e:
            logger.error(f"Failed to get dimensions for {image_path}: {e}")
            return None, None

    def get_file_size(self, image_path: str) -> Optional[int]:
        """Get file size in bytes."""
        try:
            return Path(image_path).stat().st_size
        except Exception as e:
            logger.error(f"Failed to get file size for {image_path}: {e}")
            return None

    def cleanup_orphaned_thumbnails(self, valid_image_paths: set):
        """Remove thumbnails for images that no longer exist."""
        try:
            for size_dir in ["small", "medium"]:
                thumb_dir = self.thumbnail_dir / size_dir
                if not thumb_dir.exists():
                    continue
                for thumb_file in thumb_dir.glob("*.webp"):
                    # Extract original filename from thumbnail name
                    thumb_name = thumb_file.stem
                    if '_' in thumb_name:
                        original_name = '_'.join(thumb_name.split('_')[:-1])
                        # Check if any valid image matches this thumbnail
                        is_orphaned = True
                        for image_path in valid_image_paths:
                            if Path(image_path).stem == original_name:
                                is_orphaned = False
                                break
                        if is_orphaned:
                            thumb_file.unlink()
                            logger.info(f"Removed orphaned thumbnail: {thumb_file}")
        except Exception as e:
            logger.error(f"Error during thumbnail cleanup: {e}")


# Global thumbnail generator instance
thumbnail_generator = ThumbnailGenerator()