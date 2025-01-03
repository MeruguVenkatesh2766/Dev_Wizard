# server/db.py
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv
from config import models

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

def init_models_database():
    """Initialize the models collection with the configuration from config.py"""
    try:
        # First, check if models already exist
        existing_models = models_collection.count_documents({})
        
        if existing_models == 0:
            # If no models exist, insert the entire configuration
            result = models_collection.insert_many(models)
            print(f"Successfully initialized {len(result.inserted_ids)} model sources")
        else:
            # If models exist, update them
            for model_source in models:
                # Update or insert each model source
                result = models_collection.update_one(
                    {"source_name": model_source["source_name"]},
                    {"$set": model_source},
                    upsert=True
                )
                print(f"Updated/inserted model source: {model_source['source_name']}")
        
        print("Models database initialization completed successfully")
    except Exception as e:
        print(f"Error initializing models database: {e}")
        raise