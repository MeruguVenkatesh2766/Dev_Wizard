from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta, timezone
import jwt
from models.user_model import User

# OAuth2PasswordBearer is used for obtaining JWT token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Pydantic Models
class User(BaseModel):
    user_name: str
    user_email: str
    password: str

# FastAPI Router
auth_router = APIRouter()

# Secret key for JWT encoding and decoding
SECRET_KEY = "mysecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Helper function to create JWT token
def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=15)):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta  # Add timedelta to current datetime
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# SignUp Route
@auth_router.post("/signup")
async def signup(user: User):
    # Use User class method to check for existing user
    existing_user = await User.read_user(user.user_email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create a new user using the User class method
    new_user = User(user_name=user.user_name, user_email=user.user_email, password=user.password)
    user_id = await User.create_user(new_user)  # Use create_user method to save user
    
    return {"message": "User created successfully", "user_id": user_id}

# Login Route
@auth_router.post("/login")
async def login(user: User):
    # Use User class method to read the user
    db_user = await User.read_user(user.user_email)
    
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password using the User class method
    if not User.verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create JWT token after successful login
    access_token = create_access_token(data={"sub": db_user.user_email})
    return {"access_token": access_token, "token_type": "bearer"}
