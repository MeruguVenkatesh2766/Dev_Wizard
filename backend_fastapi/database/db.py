from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from config import models

# Load environment variables from .env file
load_dotenv()

# MongoDB connection setup (singleton pattern for Motor)
class AsyncMongoDBClient:
    _client = None

    @classmethod
    def get_client(cls):
        """Return the async MongoDB client instance."""
        if cls._client is None:
            # Check if the URI is being loaded correctly
            uri = os.getenv('MONGO_URI') or "your-mongo-uri-here"
            print(f"MONGO_URI: {uri}")
            cls._client = AsyncIOMotorClient(uri)
        return cls._client

# Get the MongoDB client
db_client = AsyncMongoDBClient.get_client()

# Get the database (use the client)
db = db_client['devs_chatgpt_db_1']
users_collection = db.get_collection('users')
chats_collection = db.get_collection('chat')
models_collection = db.get_collection('models')

async def init_models_database():
    """Initialize the models collection with the configuration from config.py"""
    try:
        # First, check if models already exist
        existing_models = await models_collection.count_documents({})

        if existing_models == 0:
            # If no models exist, insert the entire configuration
            result = await models_collection.insert_many(models)
            print(f"Successfully initialized {len(result.inserted_ids)} model sources")
        else:
            # If models exist, update them
            for model_source in models:
                # Update or insert each model source
                result = await models_collection.update_one(
                    {"source_name": model_source["source_name"]},
                    {"$set": model_source},
                    upsert=True
                )
                print(f"Updated/inserted model source: {model_source['source_name']}")

        print("Models database initialization completed successfully")
    except Exception as e:
        print(f"Error initializing models database: {e}")
        raise
