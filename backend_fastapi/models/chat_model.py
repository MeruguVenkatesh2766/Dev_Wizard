from bson.objectid import ObjectId
from typing import Optional, Dict
from database.db import chats_collection

class Chat:
    def __init__(self, user_question: str, gpt_response: str):
        self.user_question = user_question
        self.gpt_response = gpt_response

    def to_dict(self) -> Dict[str, str]:
        """Convert Chat instance to dictionary."""
        return {
            'user_question': self.user_question,
            'gpt_response': self.gpt_response
        }

    def save_chat(self) -> str:
        """Save a chat document to the MongoDB collection."""
        chat_data = self.to_dict()
        result = chats_collection.insert_one(chat_data)
        return str(result.inserted_id)  # Return the inserted chat's ID as a string

    @staticmethod
    def read_chat(chat_id: str) -> Optional['Chat']:
        """Read a chat document by its ID."""
        chat_data = chats_collection.find_one({'_id': ObjectId(chat_id)})
        if chat_data:
            return Chat(user_question=chat_data['user_question'], gpt_response=chat_data['gpt_response'])
        return None

    @staticmethod
    def update_chat(chat_id: str, updated_fields: Dict) -> bool:
        """Update a chat document by its ID."""
        if not isinstance(updated_fields, dict):
            raise ValueError("updated_fields must be a dictionary.")
        result = chats_collection.update_one({'_id': ObjectId(chat_id)}, {'$set': updated_fields})
        return result.modified_count > 0

    @staticmethod
    def delete_chat(chat_id: str) -> bool:
        """Delete a chat document by its ID."""
        result = chats_collection.delete_one({'_id': ObjectId(chat_id)})
        return result.deleted_count > 0
