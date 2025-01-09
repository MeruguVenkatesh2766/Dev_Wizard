from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, List, Optional, Union
from models.chat_model import Chat
from database.db import users_collection

chat_router = APIRouter()  # Use APIRouter for modularity

# Dependency to get user_id (in a real-world app, this could come from JWT)
async def get_current_user(user_id: str):
    user = await users_collection.find_one({'_id': ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user_id

# Create Chat Route
@chat_router.post("/chats", response_model=Dict[str, str])
async def create_chat(chat: Chat, user_id: str = Depends(get_current_user)):
    chat.user_id = user_id  # Ensure user_id is set to the current user's ID
    chat_id = await chat.save_chat()
    return {"chat_id": chat_id}

# Get Chat by ID Route
@chat_router.get("/chats/{chat_id}", response_model=Optional[Chat])
async def get_chat(chat_id: str, user_id: str = Depends(get_current_user)):
    chat = await Chat.read_chat(chat_id, user_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat

# Update Chat Route
@chat_router.put("/chats/{chat_id}", response_model=bool)
async def update_chat(chat_id: str, updated_fields: Dict[str, Union[str, List[Dict[str, str]]]], user_id: str = Depends(get_current_user)):
    updated = await Chat.update_chat(chat_id, user_id, updated_fields)
    if not updated:
        raise HTTPException(status_code=404, detail="Chat not found or no changes made")
    return True

# Delete Chat Route
@chat_router.delete("/chats/{chat_id}", response_model=bool)
async def delete_chat(chat_id: str, user_id: str = Depends(get_current_user)):
    deleted = await Chat.delete_chat(chat_id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Chat not found")
    return True

# Get All Chats for User Route
@chat_router.get("/chats", response_model=List[Chat])
async def get_all_chats(user_id: str = Depends(get_current_user)):
    chats = await Chat.get_user_chats(user_id)
    return chats
