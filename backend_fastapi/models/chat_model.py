from bson import ObjectId
from typing import Optional, Dict, List, Union
from datetime import datetime
from pydantic import BaseModel, Field
from database.db import chats_collection

class Chat(BaseModel):
    chat_id: str = ""
    user_id: str = Field(..., description="Reference to the user who owns this chat")
    created_at: str = ""
    conversation: List[Dict[str, Union[str, datetime]]] = []
    model_source: str = ""
    model: str = ""
    selected_capability: str = ""

    class Config:
        json_encoders = {
            ObjectId: str
        }

    def to_dict(self) -> Dict[str, Union[str, List[Dict[str, str]]]]:
        """Convert Chat instance to dictionary."""
        return {
            'chat_id': self.chat_id,
            'user_id': self.user_id,  # Include user_id in the dictionary
            'created_at': self.created_at,
            'conversation': self.conversation,
            'model_source': self.model_source,
            'model': self.model,
            'selected_capability': self.selected_capability
        }

    async def save_chat(self) -> str:
        """Save a chat document to the MongoDB collection asynchronously."""
        chat_data = self.dict()
        result = await chats_collection.insert_one(chat_data)
        return str(result.inserted_id)

    @staticmethod
    async def read_chat(chat_id: str, user_id: str) -> Optional['Chat']:
        """Read a chat document by its ID and user_id asynchronously."""
        chat_data = await chats_collection.find_one({
            '_id': ObjectId(chat_id),
            'user_id': user_id  # Add user_id to query for security
        })
        if chat_data:
            return Chat(
                chat_id=str(chat_data['_id']),
                user_id=chat_data['user_id'],
                created_at=chat_data['created_at'],
                conversation=chat_data['conversation'],
                model_source=chat_data['model_source'],
                model=chat_data['model'],
                selected_capability=chat_data['selected_capability']
            )
        return None

    @staticmethod
    async def update_chat(chat_id: str, user_id: str, updated_fields: Dict) -> bool:
        """Update a chat document by its ID and user_id asynchronously."""
        if not isinstance(updated_fields, dict):
            raise ValueError("updated_fields must be a dictionary.")
        result = await chats_collection.update_one(
            {
                '_id': ObjectId(chat_id),
                'user_id': user_id  # Add user_id to query for security
            },
            {'$set': updated_fields}
        )
        return result.modified_count > 0

    @staticmethod
    async def delete_chat(chat_id: str, user_id: str) -> bool:
        """Delete a chat document by its ID and user_id asynchronously."""
        result = await chats_collection.delete_one({
            '_id': ObjectId(chat_id),
            'user_id': user_id  # Add user_id to query for security
        })
        return result.deleted_count > 0

    @staticmethod
    async def get_user_chats(user_id: str) -> List[Dict[str, Union[str, List[Dict[str, str]]]]]:
        """Retrieve all chat documents for a specific user asynchronously."""
        chats_cursor = chats_collection.find({'user_id': user_id})
        chats = await chats_cursor.to_list(length=None)
        return [
            {
                'chat_id': str(chat['_id']),
                'user_id': chat['user_id'],
                'created_at': chat['created_at'],
                'conversation': chat['conversation'],
                'model_source': chat['model_source'],
                'model': chat['model'],
                'selected_capability': chat['selected_capability']
            }
            for chat in chats
        ]

    @staticmethod
    async def get_chat_count_by_user(user_id: str) -> int:
        """Get the total number of chats for a specific user."""
        return await chats_collection.count_documents({'user_id': user_id})