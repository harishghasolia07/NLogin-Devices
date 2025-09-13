from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

from config.settings import CORS_ORIGINS
from database.connection import setup_database
from routes.health import router as health_router
from routes.sessions import router as sessions_router

# Create FastAPI application
app = FastAPI(
    title="N-Device Login API",
    version="1.0.0",
    description="Multi-device session management API with device limits"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(sessions_router, prefix="/sessions", tags=["sessions"])


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    await setup_database()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)