from flask import Blueprint, request
from requests import post
from datetime import datetime
import os
import json

# Load config.json file
with open('config.json', 'r') as f:
    config = json.load(f)

backend_bp = Blueprint('backend', __name__)

class Backend_Api:
    def __init__(self, config: dict) -> None:
        self.openai_key = os.getenv("OPENAI_API_KEY") or config['openai_key']
        self.openai_api_base = os.getenv("OPENAI_API_BASE") or config['openai_api_base']
        self.proxy = config['proxy']
        # Define routes here with their methods
        self.routes = {
            '/backend-api/v2/conversation': {
                'function': self.conversation,
                'methods': ['POST']
            },
            # Add other routes with their respective methods
            # '/another-route': {
            #     'function': self.another_function,
            #     'methods': ['GET', 'POST']
            # }
        }
    def conversation():
        try:
            jailbreak = request.json['jailbreak']
            internet_access = request.json['meta']['content']['internet_access']
            _conversation = request.json['meta']['content']['conversation']
            prompt = request.json['meta']['content']['parts'][0]
            current_date = datetime.now().strftime("%Y-%m-%d")
            system_message = f'You are a helpful assistant.'

            conversation = [{'role': 'system', 'content': system_message}] + _conversation + [prompt]

            # Environment variables are prioritized, fallback to config if not available
            openai_api_base = os.getenv("OPENAI_API_BASE") or config['openai_api_base']
            openai_key = os.getenv("OPENAI_API_KEY") or config['openai_key']

            url = f"{openai_api_base}/v1/chat/completions"

            proxies = None
            if config['proxy']['enable']:
                proxies = {'http': config['proxy']['http'], 'https': config['proxy']['https']}

            gpt_resp = post(
                url     = url,
                proxies = proxies,
                headers = {'Authorization': f'Bearer {openai_key}'},  # Using environment variable or config
                json    = {'model': request.json['model'], 'messages': conversation, 'stream': True},
                stream  = True
            )

            if gpt_resp.status_code >= 400:
                error_data = gpt_resp.json().get('error', {})
                error_code = error_data.get('code', None)
                error_message = error_data.get('message', "An error occurred")
                return {'success': False, 'error_code': error_code, 'message': error_message}, gpt_resp.status_code

            def stream():
                for chunk in gpt_resp.iter_lines():
                    try:
                        decoded_line = chunk.decode("utf-8").split("data: ")[1]
                        token = json.loads(decoded_line)["choices"][0]['delta'].get('content')  # Fixed undefined loads

                        if token:
                            yield token
                    except Exception as e:
                        continue
            return stream(), 200

        except Exception as e:
            return {'error': f"An error occurred: {str(e)}"}, 400
