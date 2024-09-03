from pymongo import MongoClient
import os
from src.db import db

# MongoDB connection setup
mongo_uri = os.getenv('MONGO_URI') or 'your-mongo-uri-here'
client = MongoClient(mongo_uri) 
class User:
    def __init__(self, username, password):
        self.username = username
        self.password = password

    def to_dict(self):
        return {
            'username': self.username,
            'password': self.password
        }

class Chat:
    def __init__(self, user_question, gpt_response):
        self.user_question = user_question
        self.gpt_response = gpt_response

    def to_dict(self):
        return {
            'user_question': self.user_question,
            'gpt_response': self.gpt_response
        }

    # Example method to insert a chat document into MongoDB
    def save(self):
        chat_data = self.to_dict()
        result = db['chat'].insert_one(chat_data)
        return str(result.inserted_id)  # Return the inserted chat's ID as a string
