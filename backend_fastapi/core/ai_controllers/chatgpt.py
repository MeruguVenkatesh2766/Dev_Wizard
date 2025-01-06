import openai

def get_response_from_chatgpt(data):
    openai.api_key = data.api_key
    response = openai.ChatCompletion.create(
        model=data.model,
        messages=data.history,
        temperature=1,
        max_tokens=16383,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )
    return response.choices[0].message['content']
