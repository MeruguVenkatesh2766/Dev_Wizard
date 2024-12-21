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
        self.openai_key = os.getenv("OPENAI_API_KEY") or config['openai_key']
        self.openai_api_base = os.getenv("OPENAI_API_BASE") or config['openai_api_base']
        self.proxy = config['proxy']

    async def conversation(self, conversation_request: ConversationRequest):
        try:
            _conversation = conversation_request.meta['content']['conversation']
            prompt = conversation_request.meta['content']['parts'][0]
            current_date = datetime.now().strftime("%Y-%m-%d")
            system_message = f'You are a helpful assistant.'

            conversation = [{'role': 'system', 'content': system_message}] + _conversation + [prompt]

            url = f"{self.openai_api_base}/v1/chat/completions"

            proxies = None
            if self.proxy['enable']:
                proxies = {'http': self.proxy['http'], 'https': self.proxy['https']}

            # Make the POST request to OpenAI's API
            gpt_resp = requests.post(
                url=url,
                proxies=proxies,
                headers={'Authorization': f'Bearer {self.openai_key}'},
                json={'model': conversation_request.meta['content']['model'], 'messages': conversation, 'stream': True},
                stream=True
            )

            if gpt_resp.status_code >= 400:
                error_data = gpt_resp.json().get('error', {})
                error_code = error_data.get('code', None)
                error_message = error_data.get('message', "An error occurred")
                raise HTTPException(status_code=gpt_resp.status_code, detail=error_message)

            def stream():
                for chunk in gpt_resp.iter_lines():
                    try:
                        decoded_line = chunk.decode("utf-8").split("data: ")[1]
                        token = json.loads(decoded_line)["choices"][0]['delta'].get('content')

                        if token:
                            yield token
                    except Exception as e:
                        continue

            return StreamingResponse(stream(), media_type="text/plain")

        except Exception as e:
            raise HTTPException(status_code=400, detail=f"An error occurred: {str(e)}")

# Instantiate BackendAPI
backend_api = BackendAPI(config)

# Route for conversation API
@backend_router.post("/v2/conversation")
async def conversation(conversation_request: ConversationRequest):
    return await backend_api.conversation(conversation_request)
