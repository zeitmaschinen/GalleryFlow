from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, Index, Boolean
from sqlalchemy.orm import relationship
from .database import Base


class Folder(Base):
    __tablename__ = "folders"

    id = Column(Integer, primary_key=True, index=True)
    path = Column(String, unique=True, index=True, nullable=False)
    # Relationship to images
    images = relationship("Image", back_populates="folder", cascade="all, delete-orphan")


class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True, nullable=False)
    full_path = Column(String, unique=True, index=True, nullable=False)
    last_modified = Column(DateTime, nullable=False)
    metadata_ = Column('metadata', JSON)
    folder_id = Column(Integer, ForeignKey("folders.id"), nullable=False)

    # Performance optimization fields
    width = Column(Integer)  # Image dimensions for aspect ratio
    height = Column(Integer)
    file_size = Column(Integer)  # File size in bytes
    thumbnail_path = Column(String)  # Path to generated thumbnail
    has_thumbnail = Column(Boolean, default=False)  # Quick check if thumbnail exists

    # Relationship back to folder
    folder = relationship("Folder", back_populates="images")

    # Add indices for performance
    __table_args__ = (
        Index('idx_image_full_path', full_path),
        Index('idx_image_folder_filename', folder_id, filename),
        Index('idx_image_folder_modified', folder_id, last_modified),
        Index('idx_image_has_thumbnail', has_thumbnail),
    )