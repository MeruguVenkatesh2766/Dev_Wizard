import os
import google.generativeai as genai
from werkzeug.security import generate_password_hash, check_password_hash

def get_response_from_chatgpt(data):

    # Securely hash the GEMINI_API_KEY (for demonstration purposes)
    hashed_api_key = generate_password_hash(data.api_key)
    genai.configure(api_key=hashed_api_key)

    # Create the model
    generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
    }

    model = genai.GenerativeModel(
    model_name=data.model_name,
    generation_config=generation_config,
    )

    chat_session = model.start_chat(
    history=data.history
    )

    response = chat_session.send_message(data.prompt)

    return response.text