from pymongo import MongoClient
import os
from src.db import db

# MongoDB connection setup
mongo_uri = os.getenv('MONGO_URI') or 'your-mongo-uri-here'
client = MongoClient(mongo_uri)
db = client.get_database('your-database-name')
users_collection = db.get_collection('users')

class User:
    def __init__(self, username, password):
        self.username = username
        self.password = password

    def to_dict(self):
        return {
            'username': self.username,
            'password': self.password
        }

    @staticmethod
    def create_user(user):
        """Create a new user."""
        if not isinstance(user, User):
            raise ValueError("Input must be an instance of the User class.")
        result = users_collection.insert_one(user.to_dict())
        return str(result.inserted_id)

    @staticmethod
    def read_user(username):
        """Read a user by username."""
        user_data = users_collection.find_one({'username': username})
        if user_data:
            return User(username=user_data['username'], password=user_data['password'])
        return None

    @staticmethod
    def update_user(username, updated_fields):
        """Update user information."""
        if not isinstance(updated_fields, dict):
            raise ValueError("updated_fields must be a dictionary.")
        result = users_collection.update_one({'username': username}, {'$set': updated_fields})
        return result.modified_count > 0

    @staticmethod
    def delete_user(username):
        """Delete a user by username."""
        result = users_collection.delete_one({'username': username})
        return result.deleted_count > 0

class Chat:
    def __init__(self, user_question, gpt_response):
        self.user_question = user_question
        self.gpt_response = gpt_response

    def to_dict(self):
        return {
            'user_question': self.user_question,
            'gpt_response': self.gpt_response
        }

    def save_chat(self):
        """Save a chat document to the MongoDB collection."""
        chat_data = self.to_dict()
        result = db['chat'].insert_one(chat_data)
        return str(result.inserted_id)  # Return the inserted chat's ID as a string

    @staticmethod
    def read_chat(chat_id):
        """Read a chat document by its ID."""
        from bson.objectid import ObjectId
        chat_data = db['chat'].find_one({'_id': ObjectId(chat_id)})
        if chat_data:
            return Chat(user_question=chat_data['user_question'], gpt_response=chat_data['gpt_response'])
        return None

    @staticmethod
    def update_chat(chat_id, updated_fields):
        """Update a chat document by its ID."""
        from bson.objectid import ObjectId
        if not isinstance(updated_fields, dict):
            raise ValueError("updated_fields must be a dictionary.")
        result = db['chat'].update_one({'_id': ObjectId(chat_id)}, {'$set': updated_fields})
        return result.modified_count > 0

    @staticmethod
    def delete_chat(chat_id):
        """Delete a chat document by its ID."""
        from bson.objectid import ObjectId
        result = db['chat'].delete_one({'_id': ObjectId(chat_id)})
        return result.deleted_count > 0