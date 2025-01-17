from typing import Optional, Dict
from beanie import Document
from pydantic import EmailStr, Field, BaseModel
from passlib.context import CryptContext
from datetime import datetime
from typing import Annotated

# Password hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Document):
    user_name: str = Field(..., min_length=2, max_length=50)
    user_email: Annotated[EmailStr, Field(index=True, unique=True)]
    password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)
    
    def hash_password(self) -> str:
        """Hash the user's password."""
        return pwd_context.hash(self.password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify if the provided password matches the hashed password."""
        return pwd_context.verify(plain_password, hashed_password)

    @classmethod
    async def create_user(cls, user_data: Dict) -> Optional['User']:
        """
        Create a new user.
        
        Args:
            user_data: Dictionary containing user information
            
        Returns:
            User: Created user object
        """
        user = cls(**user_data)
        user.password = user.hash_password()
        await user.insert()
        return user

    @classmethod
    async def read_user(cls, user_email: str) -> Optional['User']:
        """
        Read a user by email.
        
        Args:
            user_email: Email of the user to find
            
        Returns:
            Optional[User]: User object if found, None otherwise
        """
        return await cls.find_one(cls.user_email == user_email)

    @classmethod
    async def read_user_by_id(cls, user_id: str) -> Optional['User']:
        """
        Read a user by ID.
        
        Args:
            user_id: ID of the user to find
            
        Returns:
            Optional[User]: User object if found, None otherwise
        """
        return await cls.get(user_id)

    async def update_user(self, updated_fields: Dict) -> bool:
        """
        Update user information.
        
        Args:
            updated_fields: Dictionary containing fields to update
            
        Returns:
            bool: True if update was successful, False otherwise
        """
        if not isinstance(updated_fields, dict):
            raise ValueError("updated_fields must be a dictionary.")
            
        # Don't allow direct password updates through this method
        if 'password' in updated_fields:
            raise ValueError("Password cannot be updated through this method")
            
        updated_fields['updated_at'] = datetime.utcnow()
        
        # Update the document
        await self.update({"$set": updated_fields})
        return True

    async def change_password(self, current_password: str, new_password: str) -> bool:
        """
        Change user's password.
        
        Args:
            current_password: Current password for verification
            new_password: New password to set
            
        Returns:
            bool: True if password was changed successfully
        """
        if not self.verify_password(current_password, self.password):
            raise ValueError("Current password is incorrect")
            
        self.password = pwd_context.hash(new_password)
        self.updated_at = datetime.utcnow()
        await self.save()
        return True

    async def delete_user(self) -> bool:
        """
        Delete the user.
        
        Returns:
            bool: True if deletion was successful
        """
        await self.delete()
        return True

    async def soft_delete(self) -> bool:
        """
        Soft delete the user by setting is_active to False.
        
        Returns:
            bool: True if soft deletion was successful
        """
        self.is_active = False
        self.updated_at = datetime.utcnow()
        await self.save()
        return True

    def to_dict(self) -> Dict:
        """
        Convert User instance to dictionary (excluding sensitive fields).
        
        Returns:
            Dict: User data as dictionary
        """
        return {
            "id": str(self.id),
            "user_name": self.user_name,
            "user_email": self.user_email,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "is_active": self.is_active
        }