from typing import Optional, Dict, List, Union
from datetime import datetime
from beanie import Document, Link
from pydantic import Field
from models.user_model import User

class MessageContent(Document):
    content: str
    role: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "messages"
        use_revision = True

class Chat(Document):
    user: Link[User] = Field(..., description="Reference to the user who owns this chat")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    conversation: List[MessageContent] = Field(default_factory=list)
    model_source: str = Field(default="")
    model: str = Field(default="")
    selected_capability: str = Field(default="")
    is_active: bool = Field(default=True)
    last_updated: datetime = Field(default_factory=datetime.utcnow)

    @classmethod
    async def create_chat(cls, chat_data: Dict) -> 'Chat':
        """
        Create a new chat.
        
        Args:
            chat_data: Dictionary containing chat information
            
        Returns:
            Chat: Created chat object
        """
        chat = cls(**chat_data)
        await chat.insert()
        return chat

    @classmethod
    async def read_chat(cls, chat_id: str, user_id: str) -> Optional['Chat']:
        """
        Read a chat by ID and user ID.
        
        Args:
            chat_id: ID of the chat to find
            user_id: ID of the user who owns the chat
            
        Returns:
            Optional[Chat]: Chat object if found, None otherwise
        """
        return await cls.find_one(
            cls.id == chat_id,
            cls.user.id == user_id
        )

    async def update_chat(self, updated_fields: Dict) -> bool:
        """
        Update chat information.
        
        Args:
            updated_fields: Dictionary containing fields to update
            
        Returns:
            bool: True if update was successful
        """
        if not isinstance(updated_fields, dict):
            raise ValueError("updated_fields must be a dictionary.")
            
        updated_fields['last_updated'] = datetime.utcnow()
        await self.update({"$set": updated_fields})
        return True

    async def add_message(self, content: str, role: str) -> bool:
        """
        Add a new message to the conversation.
        
        Args:
            content: Message content
            role: Role of the message sender (user/assistant)
            
        Returns:
            bool: True if message was added successfully
        """
        message = MessageContent(content=content, role=role)
        self.conversation.append(message)
        self.last_updated = datetime.utcnow()
        await self.save()
        return True

    async def delete_chat(self) -> bool:
        """
        Delete the chat.
        
        Returns:
            bool: True if deletion was successful
        """
        await self.delete()
        return True

    async def soft_delete(self) -> bool:
        """
        Soft delete the chat by setting is_active to False.
        
        Returns:
            bool: True if soft deletion was successful
        """
        self.is_active = False
        self.last_updated = datetime.utcnow()
        await self.save()
        return True

    @classmethod
    async def get_user_chats(cls, user_id: str) -> List['Chat']:
        """
        Retrieve all chats for a specific user.
        
        Args:
            user_id: ID of the user
            
        Returns:
            List[Chat]: List of chat objects
        """
        return await cls.find(
            cls.user.id == user_id,
            cls.is_active == True
        ).to_list()

    @classmethod
    async def get_chat_count_by_user(cls, user_id: str) -> int:
        """
        Get the total number of active chats for a specific user.
        
        Args:
            user_id: ID of the user
            
        Returns:
            int: Number of chats
        """
        return await cls.find(
            cls.user.id == user_id,
            cls.is_active == True
        ).count()

    def to_dict(self) -> Dict:
        """
        Convert Chat instance to dictionary.
        
        Returns:
            Dict: Chat data as dictionary
        """
        return {
            "id": str(self.id),
            "user_id": str(self.user.id),
            "created_at": self.created_at,
            "conversation": [
                {
                    "content": msg.content,
                    "role": msg.role,
                    "timestamp": msg.timestamp
                }
                for msg in self.conversation
            ],
            "model_source": self.model_source,
            "model": self.model,
            "selected_capability": self.selected_capability,
            "is_active": self.is_active,
            "last_updated": self.last_updated
        }