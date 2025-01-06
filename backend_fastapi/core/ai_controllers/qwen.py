from gradio_client import Client

def get_response_from_chatgpt(data):

    client = Client(data.model_name)
    result = client.predict(
            query=data.prompt,
            history=data.history,
            system="You are Qwen, created by Alibaba Cloud. You are a helpful assistant.",
            api_name="/model_chat"
    )
    return result