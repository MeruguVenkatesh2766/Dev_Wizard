from pymongo import MongoClient
import os
import uuid
from src.db import db
import uuid

# MongoDB connection setup
mongo_uri = os.getenv('MONGO_URI') or 'your-mongo-uri-here'
client = MongoClient(mongo_uri)

class User:
    def __init__(self, username, password, user_id=None):
        self.username = username
        self.password = password
        self.user_id = user_id or str(uuid.uuid4())  # Generate a new UUID if not provided

    def to_dict(self):
        return {
            'user_id': self.user_id,
            'username': self.username,
            'password': self.password
        }

    def create_user(self):
        """Creates a new user in the database."""
        user_data = self.to_dict()
        result = db['users'].insert_one(user_data)
        return self.user_id  # Return the user's unique ID

    # Read (retrieve) a user
    @staticmethod
    def get_user(username):
        """Retrieve a user by their username."""
        user = db['users'].find_one({'username': username})
        if user:
            return user
        return "User not found."

    # Update an existing user's password
    @staticmethod
    def update_user(username, new_password):
        """Update the password of an existing user."""
        result = db['users'].update_one(
            {'username': username},
            {'$set': {'password': new_password}}
        )
        if result.matched_count > 0:
            return "User updated successfully."
        return "User not found."

    # Delete a user
    @staticmethod
    def delete_user(username):
        """Delete a user from the database."""
        result = db['users'].delete_one({'username': username})
        if result.deleted_count > 0:
            return "User deleted successfully."
        return "User not found."


class Chat:
    def __init__(self, user_question, gpt_response, chat_id=None):
        self.chat_id = chat_id  # If `chat_id` is not provided, it's considered a new chat
        self.user_question = user_question
        self.gpt_response = gpt_response

    def to_dict(self):
        return {
            'user_question': self.user_question,
            'gpt_response': self.gpt_response
        }

    # Create a new chat
    def create_new_chat(self):
        """Creates a new chat with a generated chat_id and stores it in the database."""
        self.chat_id = str(uuid.uuid4())  # Generate a new UUID for chat_id
        chat_data = {
            'chat_id': self.chat_id,
            'conversations': [self.to_dict()]  # Store the first conversation
        }
        result = db['chat'].insert_one(chat_data)
        return f"New chat created with chat_id: {self.chat_id}"

    # Read (retrieve) a chat by its chat_id
    @staticmethod
    def get_chat_by_id(chat_id):
        """Retrieve a chat by its chat_id."""
        chat = db['chat'].find_one({'chat_id': chat_id})
        if chat:
            return chat
        return "Chat not found."

    # Update an existing chat by adding a new conversation
    def update_existing_chat(self):
        """Updates an existing chat by adding a new conversation to the conversations array."""
        if not self.chat_id:
            raise ValueError("chat_id is required to update an existing chat.")

        # Check if the chat exists in the database
        existing_chat = db['chat'].find_one({'chat_id': self.chat_id})

        if existing_chat:
            # Chat exists, append the new conversation to the 'conversations' array
            db['chat'].update_one(
                {'chat_id': self.chat_id},
                {'$push': {'conversations': self.to_dict()}}
            )
            return f"Chat {self.chat_id} updated successfully."
        else:
            return f"Chat with chat_id {self.chat_id} does not exist."

    # Delete a chat by its chat_id
    @staticmethod
    def delete_chat(chat_id):
        """Delete a chat from the database."""
        result = db['chat'].delete_one({'chat_id': chat_id})
        if result.deleted_count > 0:
            return f"Chat {chat_id} deleted successfully."
        return "Chat not found."
