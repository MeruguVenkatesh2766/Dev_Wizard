from fastapi import FastAPI
from api.auth import auth_router
from api.chat import backend_router
from dotenv import load_dotenv
import os

# Load environment variables from the .env file
load_dotenv()

# Get the domain and route prefixes from environment variables
DOMAIN = os.getenv("DOMAIN", "http://localhost:8000/")
AUTH_PREFIX = os.getenv("AUTH_PREFIX", "/auth")
API_PREFIX = os.getenv("API_PREFIX", "/api")

app = FastAPI(title="FastAPI App", description=f"Hosted on {DOMAIN}")

# Include routers with custom prefixes
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(backend_router, prefix="/backend-api", tags=["Backend"])

# Root route to test the domain
@app.get("/")
def read_root():
    return {"message": f"Welcome to the API hosted at {DOMAIN}"}
