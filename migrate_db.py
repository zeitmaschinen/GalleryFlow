#!/usr/bin/env python3
"""
Simple database migration script for adding performance fields.
This can be run safely on existing databases.
"""

import sqlite3
import os
from pathlib import Path

def migrate_database(db_path: str = "galleryflow.db"):
    """Add performance fields to existing database if they don't exist."""
    
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found. It will be created automatically when you start the application.")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if new columns already exist
        cursor.execute("PRAGMA table_info(images)")
        columns = [column[1] for column in cursor.fetchall()]
        
        new_columns = {
            'width': 'INTEGER',
            'height': 'INTEGER', 
            'file_size': 'INTEGER',
            'thumbnail_path': 'TEXT',
            'has_thumbnail': 'BOOLEAN DEFAULT 0'
        }
        
        for column_name, column_type in new_columns.items():
            if column_name not in columns:
                print(f"Adding column: {column_name}")
                cursor.execute(f"ALTER TABLE images ADD COLUMN {column_name} {column_type}")
            else:
                print(f"Column {column_name} already exists")
        
        # Create new indices if they don't exist
        indices = {
            'idx_image_folder_modified': 'CREATE INDEX IF NOT EXISTS idx_image_folder_modified ON images (folder_id, last_modified)',
            'idx_image_has_thumbnail': 'CREATE INDEX IF NOT EXISTS idx_image_has_thumbnail ON images (has_thumbnail)'
        }
        
        for index_name, sql in indices.items():
            print(f"Creating index: {index_name}")
            cursor.execute(sql)
        
        conn.commit()
        print("Done: database migration completed successfully.")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    # Look for database in current directory
    db_path = Path("galleryflow.db")
    if not db_path.exists():
        # Try in parent directory (if running from backend/app)
        db_path = Path("../../galleryflow.db")
    
    migrate_database(str(db_path))
