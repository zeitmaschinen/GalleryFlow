import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Define the path for the SQLite database file
# It will be created in the 'backend' directory, one level up from 'app'
DATABASE_URL = "sqlite+aiosqlite:///../galleryflow.db" 

# Create the SQLAlchemy engine
engine = create_async_engine(DATABASE_URL, echo=True)  # echo=True logs SQL queries, useful for debugging

# Create a configured "Session" class
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Create a Base class for our models to inherit from
Base = declarative_base()

# Dependency to get DB session
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# Function to create database tables (will be called on app startup)
async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)