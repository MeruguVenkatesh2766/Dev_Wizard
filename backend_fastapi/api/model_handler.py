from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
from datetime import datetime
from typing import List, AsyncGenerator
from kafka import KafkaProducer, KafkaConsumer
import threading
import asyncio

from core.ai_controllers.chatgpt import get_response_from_chatgpt
from core.ai_controllers.qwen import qwen_req_res_controller

# Load config.json file
with open('config.json', 'r') as f:
    config = json.load(f)

backend_router = APIRouter()

# This will store the events for streaming to frontend
event_stream = []

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
        self.kafka_producer = KafkaProducer(
            bootstrap_servers=config['kafka']['broker'],
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        self.kafka_topic = config['kafka']['topic']

    async def conversation(self, conversation_request: ConversationRequest):
        try:
            # Validate if model source is supported
            model_source = conversation_request.model_source
            if model_source not in self.model_handlers:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported model source: {model_source}"
                )

            # Prepare event payload
            event_payload = {
                'api_key': conversation_request.api_key,
                'model_id': conversation_request.model_id,
                'model_name': conversation_request.model_name,
                'model_source': model_source,
                'chat_history': conversation_request.chat_history,
                'prompt': conversation_request.prompt,
                'clear_history': conversation_request.clear_history,
                'response_type_needed': conversation_request.response_type_needed,
                'timestamp': datetime.utcnow().isoformat()
            }

            # Send event to Kafka
            self.kafka_producer.send(self.kafka_topic, event_payload)
            self.kafka_producer.flush()
            # Start Kafka consumer in a separate thread
            consumer_thread = threading.Thread(target=kafka_consumer_thread, args=(config,), daemon=True)
            consumer_thread.start()

            # Returning a 200 status here. The actual data will be streamed via /v2/conversation-stream
            return {"message": "Conversation request is being processed."}

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while processing the request: {str(e)}"
            )

# Kafka consumer thread that processes events and appends results to the event_stream
def kafka_consumer_thread(config):
    consumer = KafkaConsumer(
        config['kafka']['topic'],
        bootstrap_servers=config['kafka']['broker'],
        value_deserializer=lambda v: json.loads(v.decode('utf-8'))
    )

    for message in consumer:
        event = message.value
        print(f"Received event: {event}")  # For debugging purposes

        model_source = event['model_source']
        if model_source in backend_api.model_handlers:
            try:
                # Call the appropriate model handler
                response = backend_api.model_handlers[model_source](
                    model_name=event['model_name'],
                    chat_history=event['chat_history'],
                    prompt=event['prompt'],
                    response_type_needed=event['response_type_needed'],
                    clear_history=event['clear_history']
                )

                print(f"Processed response: {response}")
                # Append the processed response to the event stream
                event_stream.append(response)

            except Exception as e:
                print(f"Error processing event: {str(e)}")


# Instantiate BackendAPI
backend_api = BackendAPI(config)

# Route for conversation API
@backend_router.post("/v2/conversation")
async def conversation(conversation_request: ConversationRequest):
    return await backend_api.conversation(conversation_request)

# Route for streaming the conversation response using StreamingResponse
@backend_router.get("/v2/conversation-stream")
async def conversation_stream():
    async def event_generator() -> AsyncGenerator[str, None]:
        while True:
            if event_stream:
                # Send the first event and remove it from the list
                response = event_stream.pop(0)
                # Yield formatted event string (data field)
                yield f"data: {response}\n\n"
            else:
                # No event in the stream, wait for new data
                await asyncio.sleep(1)

    # Use StreamingResponse to stream the events
    return StreamingResponse(event_generator(), media_type="text/event-stream")

