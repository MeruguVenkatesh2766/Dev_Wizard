from fastapi import FastAPI
from api.auth import auth_router
from api.chat import backend_router

app = FastAPI()

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(backend_router, prefix="/api", tags=["Backend"])
