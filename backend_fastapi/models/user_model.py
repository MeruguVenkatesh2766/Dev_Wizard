from bson.objectid import ObjectId
from typing import Optional, Dict
from passlib.context import CryptContext
from database.db import users_collection

# Password hashing setup (using Passlib)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User:
    def __init__(self, username: str, password: str):
        self.username = username
        self.password = password

    def to_dict(self) -> Dict[str, str]:
        """Convert User instance to dictionary."""
        return {
            'username': self.username,
            'password': self.password
        }

    def hash_password(self) -> str:
        """Hash the user's password."""
        return pwd_context.hash(self.password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify if the provided password matches the hashed password."""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def create_user(user: 'User') -> Optional[str]:
        """Create a new user."""
        if not isinstance(user, User):
            raise ValueError("Input must be an instance of the User class.")
        user.password = user.hash_password()  # Hash the password before saving
        result = users_collection.insert_one(user.to_dict())
        return str(result.inserted_id)  # Return the inserted user ID as a string

    @staticmethod
    def read_user(username: str) -> Optional['User']:
        """Read a user by username."""
        user_data = users_collection.find_one({'username': username})
        if user_data:
            return User(username=user_data['username'], password=user_data['password'])
        return None

    @staticmethod
    def update_user(username: str, updated_fields: Dict) -> bool:
        """Update user information."""
        if not isinstance(updated_fields, dict):
            raise ValueError("updated_fields must be a dictionary.")
        result = users_collection.update_one({'username': username}, {'$set': updated_fields})
        return result.modified_count > 0

    @staticmethod
    def delete_user(username: str) -> bool:
        """Delete a user by username."""
        result = users_collection.delete_one({'username': username})
        return result.deleted_count > 0