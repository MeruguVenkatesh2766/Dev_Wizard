from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required
from pymongo import MongoClient
import os
from src.db import db

auth_bp = Blueprint('auth', __name__)

# Set up MongoDB connection
mongo_uri = os.getenv('MONGO_URI') or 'your-mongo-uri-here'
client = MongoClient(mongo_uri)
users_collection = db.get_collection('users')
print("DB", users_collection)

# SignUp Route
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    print("DATA", data)
    username = data.get('username')
    password = data.get('password')

    # Check if user already exists
    if users_collection.find_one({'username': username}):
        return jsonify({'message': 'User already exists'}), 400

    hashed_password = generate_password_hash(password)
    new_user = {'username': username, 'password': hashed_password}

    # Insert new user into MongoDB
    users_collection.insert_one(new_user)

    return jsonify({'message': 'User created successfully'}), 201

# Login Route
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Find user in MongoDB
    user = users_collection.find_one({'username': username})

    if user and check_password_hash(user['password'], password):
        access_token = create_access_token(identity=str(user['_id']))
        return jsonify({'access_token': access_token}), 200

    return jsonify({'message': 'Invalid credentials'}), 401
