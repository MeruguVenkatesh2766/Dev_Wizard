from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.db import models_collection

# FastAPI Router
models_router = APIRouter()

# Pydantic Models
class ChildModel(BaseModel):
    model_name: str
    model_id: str
    model_capabilities: list
    model_endpoint: str

class ModelSource(BaseModel):
    source_name: str
    children_models: list[ChildModel]

# Fetch All Models Route
@models_router.get("/models", response_model=list[ModelSource])
async def get_all_models():
    models_collect = models_collection.find({})
    models = await models_collect.to_list(length=None)

    if not models:
        raise HTTPException(status_code=404, detail="No models found")
    
    return models
