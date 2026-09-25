import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from config import settings

Base = declarative_base()

# Try PostgreSQL first, fall back to SQLite if PostgreSQL connection fails
engine = None
_session_maker = None

class _AsyncSessionProxy:
    def __call__(self, *args, **kwargs):
        if _session_maker is None:
            raise RuntimeError("Database not initialized")
        return _session_maker(*args, **kwargs)

AsyncSessionLocal = _AsyncSessionProxy()

def normalize_db_url(raw_url: str) -> str:
    url = (raw_url or "").strip()
    if not url:
        return settings.FALLBACK_DATABASE_URL
    # If running in cloud (Render) and default URL is localhost, immediately use SQLite
    is_cloud = bool(os.environ.get("RENDER") or os.environ.get("PORT"))
    if is_cloud and ("localhost" in url or "127.0.0.1" in url):
        return settings.FALLBACK_DATABASE_URL
    # Render PostgreSQL URLs start with postgres:// or postgresql://
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+asyncpg://", 1)
    if url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url

def init_db(url: str):
    global engine, _session_maker
    clean_url = normalize_db_url(url)
    connect_args = {}
    if clean_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
    engine = create_async_engine(clean_url, echo=False, connect_args=connect_args)
    _session_maker = async_sessionmaker(
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
    global engine, _session_maker
    # Import all models so Base.metadata knows about them
    import models
    try:
        async def _init_schemas():
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
        # Timeout after 4 seconds to never block server startup
        await asyncio.wait_for(_init_schemas(), timeout=4.0)
        print(f"Database tables initialized using {engine.url.drivername}.")
    except Exception as pg_err:
        print(f"Primary database connection note ({pg_err}). Switching to SQLite fallback...")
        init_db(settings.FALLBACK_DATABASE_URL)
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            print("Database tables initialized using SQLite fallback.")
        except Exception as sqlite_err:
            print(f"SQLite fallback initialization note: {sqlite_err}")


