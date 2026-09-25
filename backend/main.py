from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import create_tables
from routes import api_router
from config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await create_tables()
        print("Database tables verified.")
    except Exception as e:
        print(f"Database connection note (using fallback state): {e}")
    yield

app = FastAPI(title="SAHAAY AI Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "SAHAAY AI Backend API",
        "health": "/health",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "SAHAAY AI Backend"}

if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)

