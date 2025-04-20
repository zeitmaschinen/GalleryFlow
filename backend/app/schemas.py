# File: backend/app/schemas.py

from pydantic import BaseModel
from typing import Optional, Dict, Any, List # Add List
from datetime import datetime

# --- Folder Schemas --- (Keep existing Folder schemas)
class FolderBase(BaseModel):
    path: str

class FolderCreate(FolderBase):
    pass

class Folder(FolderBase):
    id: int
    class Config:
        from_attributes = True

# --- Image Schemas --- (Keep existing Image schemas)
class ImageBase(BaseModel):
    filename: str
    full_path: str
    last_modified: datetime
    metadata_: Optional[Dict[str, Any]] = None
    folder_id: int

class ImageCreate(ImageBase):
    pass

class Image(ImageBase):
    id: int
    class Config:
        from_attributes = True

# --- Scan Status Schema --- (Keep existing ScanStatus schema)
class ScanStatus(BaseModel):
    message: str
    added_count: int = 0
    updated_count: int = 0
    removed_count: int = 0
    skipped_count: int = 0
    processed_count: int = 0
    total_files: int = 0

# --- NEW: Schema for Paginated Image List Response ---
class ImageListResponse(BaseModel):
    images: List[Image]
    total_count: int

# --- NEW: Schema for Scan Progress ---
class ScanProgress(BaseModel):
    folder_id: int
    current: int
    total: int
    added_count: int = 0
    updated_count: int = 0
    removed_count: int = 0
    skipped_count: int = 0
    processed_count: int = 0

# --- NEW: Schema for Image Filter Options ---
class ImageFilterOptions(BaseModel):
    file_types: Optional[List[str]] = None