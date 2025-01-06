from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
import os
import json
import requests
from datetime import datetime

# Load config.json file (for OpenAI config)
with open('config.json', 'r') as f:
    config = json.load(f)

# Pydantic Models for input validation
class ConversationRequest(BaseModel):
    jailbreak: bool
    meta: dict

backend_router = APIRouter()

class BackendAPI:
    def __init__(self, config: dict):
        self.proxy = config['proxy']

    async def conversation(self, conversation_request: ConversationRequest):
        try:
            proxies = None
            if self.proxy['enable']:
                proxies = {'http': self.proxy['http'], 'https': self.proxy['https']}

            

        except Exception as e:
            raise HTTPException(status_code=400, detail=f"An error occurred: {str(e)}")

# Instantiate BackendAPI
backend_api = BackendAPI(config)

# Route for conversation API
@backend_router.post("/v2/conversation")
async def conversation(conversation_request: ConversationRequest):
    return await backend_api.conversation(conversation_request)
