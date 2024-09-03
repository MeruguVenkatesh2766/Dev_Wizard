# server/db.py
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os

def get_db():
    uri = os.getenv('MONGO_URI') or "mongo-uri"
    client = MongoClient(uri, server_api=ServerApi('1'))
    try:
        client.admin.command('ping')
        print("Pinged your deployment. Successfully connected to MongoDB!")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
    return client

db_client = get_db()
db = db_client['devs_chatgpt_db_1']  # Select your MongoDB database
