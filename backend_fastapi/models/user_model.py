from bson.objectid import ObjectId
from typing import Optional, Dict
from passlib.context import CryptContext
from database.db import users_collection

# Password hashing setup (using Passlib)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User:
    def __init__(self, user_name: str,user_email: str, password: str):
        self.user_name = user_name
        self.user_email = user_email
        self.password = password

    def to_dict(self) -> Dict[str, str]:
        """Convert User instance to dictionary."""
        return {
            'user_name': self.user_name,
            'user_email': self.user_email,
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
    def read_user(user_email: str) -> Optional['User']:
        """Read a user by user_email."""
        user_data = users_collection.find_one({'user_email': user_email})
        if user_data:
            return User(user_email=user_data['user_email'], password=user_data['password'])
        return None

    @staticmethod
    def update_user(user_email: str, updated_fields: Dict) -> bool:
        """Update user information."""
        if not isinstance(updated_fields, dict):
            raise ValueError("updated_fields must be a dictionary.")
        result = users_collection.update_one({'user_email': user_email}, {'$set': updated_fields})
        return result.modified_count > 0

    @staticmethod
    def delete_user(user_email: str) -> bool:
        """Delete a user by user_email."""
        result = users_collection.delete_one({'user_email': user_email})
        return result.deleted_count > 0