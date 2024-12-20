from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from werkzeug.security import generate_password_hash, check_password_hash
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta, timezone
import jwt
from database.db import users_collection

# OAuth2PasswordBearer is used for obtaining JWT token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Pydantic Models
class User(BaseModel):
    username: str
    password: str

class UserInDB(User):
    hashed_password: str

# FastAPI Router
auth_router = APIRouter()

# Secret key for JWT encoding and decoding
SECRET_KEY = "mysecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Helper function to create JWT token
def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=15)):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc).strftime("%Y-%m-%d") + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# SignUp Route
@auth_router.post("/signup")
async def signup(user: User):
    existing_user = users_collection.find_one({'username': user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    hashed_password = generate_password_hash(user.password)
    new_user = {'username': user.username, 'password': hashed_password}

    users_collection.insert_one(new_user)
    return {"message": "User created successfully"}

# Login Route
@auth_router.post("/login")
async def login(user: User):
    db_user = users_collection.find_one({'username': user.username})
    if not db_user or not check_password_hash(db_user['password'], user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": db_user['username']})
    return {"access_token": access_token, "token_type": "bearer"}
