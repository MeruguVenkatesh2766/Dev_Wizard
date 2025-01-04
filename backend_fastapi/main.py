from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.auth import auth_router
from models.ai_models_model import models_router
from api.chat import backend_router
from dotenv import load_dotenv
from database.db import init_models_database
import os

# Load environment variables from the .env file
load_dotenv()

# Get the domain and route prefixes from environment variables
DOMAIN = os.getenv("DOMAIN", "http://localhost:8000/")
AUTH_PREFIX = os.getenv("AUTH_PREFIX", "/auth")
API_PREFIX = os.getenv("API_PREFIX", "/api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    # Startup: Initialize the database with models
    await init_models_database()
    print("Models initialized in database")
    yield
    # Shutdown: Add any cleanup code here if needed
    print("Shutting down...")

# Create FastAPI app with lifespan
app = FastAPI(
    title="FastAPI App", 
    description=f"Hosted on {DOMAIN}",
    lifespan=lifespan
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change "*" to specific origins if needed for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with custom prefixes
app.include_router(auth_router, prefix="/backend-api", tags=["Auth"])
app.include_router(models_router, prefix="/backend-api", tags=["Models"])
app.include_router(backend_router, prefix="/backend-api", tags=["Backend"])

# Root route to test the domain
@app.get("/")
def read_root():
    return {"message": f"Welcome to the API hosted at {DOMAIN}"}