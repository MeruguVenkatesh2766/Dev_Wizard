from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required
from src.db import db
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from src.app import app
from src.models import User  # Import the User class

auth_bp = Blueprint('auth', __name__)

# Initialize Limiter
limiter = Limiter(get_remote_address, app=app)

# SignUp Route
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Check if user already exists
    if User.get_user(username) != "User not found.":
        return jsonify({'message': 'User already exists'}), 400

    # Hash the password and create a new user
    hashed_password = generate_password_hash(password)
    new_user = User(username=username, password=hashed_password)
    user_id = new_user.create_user()

    return jsonify({'message': 'User created successfully', 'user_id': user_id}), 201

# Login Route
@auth_bp.route('/login', methods=['POST'])
@limiter.limit("5 per minute")  # Limits the login attempts
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Find user in MongoDB using User class
    user = User.get_user(username)

    if user != "User not found." and check_password_hash(user['password'], password):
        access_token = create_access_token(identity=user['user_id'])
        return jsonify({'access_token': access_token}), 200

    return jsonify({'message': 'Invalid credentials'}), 401
