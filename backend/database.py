import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from config import settings

Base = declarative_base()

# Try PostgreSQL first, fall back to SQLite if PostgreSQL connection fails
engine = None
AsyncSessionLocal = None

def init_db(url: str):
    global engine, AsyncSessionLocal
    engine = create_async_engine(url, echo=False)
    AsyncSessionLocal = async_sessionmaker(
        engine, expire_on_commit=False, class_=AsyncSession
    )

init_db(settings.DATABASE_URL)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def create_tables():
    global engine, AsyncSessionLocal
    # Import all models so Base.metadata knows about them
    import models
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print(f"Database tables initialized using {engine.url.drivername}.")
    except Exception as pg_err:
        print(f"PostgreSQL connection failed ({pg_err}). Switching to SQLite fallback...")
        init_db(settings.FALLBACK_DATABASE_URL)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("Database tables initialized using SQLite fallback.")
