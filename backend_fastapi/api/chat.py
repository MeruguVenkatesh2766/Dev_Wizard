from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
import os
import json
import requests
from datetime import datetime
from typing import List, Optional

from core.ai_controllers.chatgpt import get_response_from_chatgpt
from core.ai_controllers.qwen import get_response_from_qwen

# Load config.json file
with open('config.json', 'r') as f:
    config = json.load(f)

backend_router = APIRouter()

class ConversationRequest(BaseModel):
    api_key: str
    model_id: str
    model_name: str
    model_source: str
    model_capabilities: List[str]
    chat_history: List[dict] = []

class BackendAPI:
    def __init__(self, config: dict):
        self.proxy = config['proxy']
        self.model_handlers = {
            'chatgpt': get_response_from_chatgpt,
            'qwen': get_response_from_qwen
        }

    async def conversation(self, conversation_request: ConversationRequest):
        try:
            # Set up proxies if enabled
            proxies = None
            if self.proxy['enable']:
                proxies = {
                    'http': self.proxy['http'],
                    'https': self.proxy['https']
                }

            # Extract model source and relevant data
            model_source = conversation_request.model_source

            # Validate if model source is supported
            if model_source not in self.model_handlers:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported model source: {model_source}"
                )

            # Modified: Pass the entire conversation_request object
            model_data = {
                'api_key': conversation_request.api_key,
                'model_id': conversation_request.model_id,
                'model_name': conversation_request.model_name,
                'history': conversation_request.chat_history,
                'prompt': conversation_request.chat_history[-1]['content'] if conversation_request.chat_history else ""
            }

            # Call appropriate model handler
            response = await self.model_handlers[model_source](model_data)

            return {
                'response': response,
                'timestamp': datetime.utcnow().isoformat(),
                'model_source': model_source
            }

        except Exception as e:
            # Enhanced error handling
            error_msg = str(e)
            if "'dict' object has no attribute" in error_msg:
                error_msg = "Invalid data structure in model handler. Please check the model data format."
            raise HTTPException(
                status_code=400,
                detail=f"An error occurred: {error_msg}"
            )

# Instantiate BackendAPI
backend_api = BackendAPI(config)

# Route for conversation API
@backend_router.post("/v2/conversation")
async def conversation(conversation_request: ConversationRequest):
    return await backend_api.conversation(conversation_request)