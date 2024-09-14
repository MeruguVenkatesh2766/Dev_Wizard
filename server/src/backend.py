from flask import Blueprint, Response, app, request, jsonify
from requests import post
from datetime import datetime
import os
import json
from src.models import Chat

# Load config.json file
with open('config.json', 'r') as f:
    config = json.load(f)

backend_bp = Blueprint('backend', __name__)

class Backend_Api:
    def __init__(self, config: dict) -> None:
        self.openai_key = os.getenv("OPENAI_API_KEY") or config['openai_key']
        self.openai_api_base = os.getenv("OPENAI_API_BASE") or config['openai_api_base']
        self.proxy = config['proxy']
    
    @staticmethod
    @backend_bp.route('/backend-api/v2/conversation', methods=['POST'])
    def conversation():
        try:
            _conversation = request.json['meta']['content']['conversation']
            prompt = request.json['meta']['content']['parts'][0]
            system_message = 'You are a helpful assistant.'

            conversation = [{'role': 'system', 'content': system_message}] + _conversation + [prompt]

            openai_api_base = os.getenv("OPENAI_API_BASE") or config['openai_api_base']
            openai_key = os.getenv("OPENAI_API_KEY") or config['openai_key']

            url = f"{openai_api_base}/v1/chat/completions"

            proxies = None
            if config['proxy']['enable']:
                proxies = {'http': config['proxy']['http'], 'https': config['proxy']['https']}

            gpt_resp = post(
                url=url,
                proxies=proxies,
                headers={'Authorization': f'Bearer {openai_key}'},
                json={'model': request.json['model'], 'messages': conversation, 'stream': True},
                stream=True
            )

            if gpt_resp.status_code >= 400:
                error_data = gpt_resp.json().get('error', {})
                error_code = error_data.get('code', None)
                error_message = error_data.get('message', "An error occurred")
                return jsonify({'success': False, 'error_code': error_code, 'message': error_message}), gpt_resp.status_code
            
            def stream():
                full_response = ""
                for chunk in gpt_resp.iter_lines():
                    if chunk:
                        try:
                            decoded_line = chunk.decode("utf-8").split("data: ")[1]
                            token = json.loads(decoded_line)["choices"][0]['delta'].get('content')
                            if token:
                                full_response += token
                                yield token
                        except Exception as e:
                            continue
                
                # Save the chat to the database after the full response is received
                chat_id = request.json.get('conversation_id')
                user_question = prompt['content']
                chat = Chat(user_question, full_response, chat_id)
                if chat_id:
                    chat.update_existing_chat()
                else:
                    chat.create_new_chat()

            return Response(stream(), mimetype='text/event-stream')

        except Exception as e:
            return jsonify({'error': f"An error occurred: {str(e)}"}), 400
