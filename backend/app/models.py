from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, Index
from sqlalchemy.orm import relationship
from .database import Base


class Folder(Base):
    __tablename__ = "folders"

    id = Column(Integer, primary_key=True, index=True)
    path = Column(String, unique=True, index=True, nullable=False)
    # Relationship to images (optional but good practice)
    images = relationship("Image", back_populates="folder", cascade="all, delete-orphan")


class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True, nullable=False)  # Just the filename, not the full path
    full_path = Column(String, unique=True, index=True, nullable=False)  # Absolute path
    last_modified = Column(DateTime, nullable=False)
    metadata_ = Column('metadata', JSON)  # Storing extracted metadata as JSON. Renamed column to avoid conflict.
    folder_id = Column(Integer, ForeignKey("folders.id"), nullable=False)

    # Relationship back to folder
    folder = relationship("Folder", back_populates="images")

    # Add indices for commonly queried columns
    __table_args__ = (
        Index('idx_image_full_path', full_path),
        Index('idx_image_folder_filename', folder_id, filename),
    )