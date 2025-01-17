from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
import json
from datetime import datetime
from typing import List, Optional

from core.ai_controllers.chatgpt import get_response_from_chatgpt
from core.ai_controllers.qwen import qwen_req_res_controller

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
    prompt: str
    clear_history: bool
    response_type_needed: str

class BackendAPI:
    def __init__(self, config: dict):
        self.proxy = config['proxy']
        self.model_handlers = {
            'chatgpt': get_response_from_chatgpt,
            'qwen': qwen_req_res_controller
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
                'chat_history': conversation_request.chat_history,
                'prompt': conversation_request.prompt,
                'clear_history': conversation_request.clear_history,
                'response_type_needed': conversation_request.response_type_needed
            }
            # Call appropriate model handler
            response = self.model_handlers[model_source](
                model_name=model_data["model_name"],
                chat_history=model_data.get("chat_history", []),
                prompt=model_data.get("prompt", ""),
                response_type_needed=model_data.get("response_type_needed", "text-based"),
                clear_history=model_data.get("clear_history", True)
            )
            print("RESPONSE", response)
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