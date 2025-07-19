"""Add performance optimization fields to images table

Revision ID: add_image_performance_fields
Revises: base
Create Date: 2025-01-20

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'add_image_performance_fields'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """Add performance optimization fields to images table."""
    # Add new columns to images table
    op.add_column('images', sa.Column('width', sa.Integer, nullable=True))
    op.add_column('images', sa.Column('height', sa.Integer, nullable=True))
    op.add_column('images', sa.Column('file_size', sa.Integer, nullable=True))
    op.add_column('images', sa.Column('thumbnail_path', sa.String, nullable=True))
    op.add_column('images', sa.Column('has_thumbnail', sa.Boolean, default=False, nullable=True))

    # Add new indices for performance
    op.create_index('idx_image_folder_modified', 'images', ['folder_id', 'last_modified'])
    op.create_index('idx_image_has_thumbnail', 'images', ['has_thumbnail'])


def downgrade():
    """Remove performance optimization fields from images table."""
    # Remove indices
    op.drop_index('idx_image_has_thumbnail', 'images')
    op.drop_index('idx_image_folder_modified', 'images')

    # Remove columns
    op.drop_column('images', 'has_thumbnail')
    op.drop_column('images', 'thumbnail_path')
    op.drop_column('images', 'file_size')
    op.drop_column('images', 'height')
    op.drop_column('images', 'width')
