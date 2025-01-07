from gradio_client import Client

async def get_response_from_qwen(data: dict):
    # Create client with the model name from the dictionary
    client = Client(data['model_name'])
    
    # Use dictionary access instead of attribute access
    result = client.predict(
        query=data['prompt'],
        history=data['history'],
        system="You are Qwen, created by Alibaba Cloud. You are a helpful assistant.",
        api_name="/model_chat"
    )
    return result