# server/db.py
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# MongoDB connection setup (singleton pattern)
class MongoDBClient:
    _client = None

    @classmethod
    def get_client(cls):
        """Return the MongoDB client instance."""
        if cls._client is None:
            # Check if the URI is being loaded correctly
            uri = os.getenv('MONGO_URI') or "your-mongo-uri-here"
            print(f"MONGO_URI: {uri}")
            cls._client = MongoClient(uri, server_api=ServerApi('1'))
            try:
                # Ping MongoDB to check connection
                cls._client.admin.command('ping')
                print("Pinged your deployment. Successfully connected to MongoDB!")
            except Exception as e:
                print(f"Error connecting to MongoDB: {e}")
                raise ConnectionError("Unable to connect to MongoDB.")
        return cls._client

# Get the MongoDB client
db_client = MongoDBClient.get_client()

# Get the database (use the client)
db = db_client['devs_chatgpt_db_1']
users_collection = db.get_collection('users')
chats_collection = db.get_collection('chat')
models_collection = db.get_collection('models')
