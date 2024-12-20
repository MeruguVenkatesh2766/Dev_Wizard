import time
from typing import Union
from json_repair import repair_json
import requests
import config
import re, json, os, sys

def get_json_content(response: Union[str, dict]) -> str:
    if isinstance(response, str):
        content = response  # Assume response is already a JSON-formatted string
    elif isinstance(response, dict):
        # Access the 'text' key from the dictionary
        content = response.get('text', "No 'text' field found in the response.")
        if(type(json.dumps(content)) == str):
            content = content.strip()
    else:
        try:
            content = response.text  # Get the text content from the response object
        except AttributeError:
            print("Invalid response format.")
            return None
    
    # Check if the content is wrapped in ```json``` and extract JSON content
    if "```json" in content:
        pattern = r'```json\s*(.*?)\s*```'
        match = re.search(pattern, content, re.DOTALL)
        if match:
            content = match.group(1)
    
    content = content.strip()
    # content = clean_json_string(content)
    content = repair_json(content)
    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        # print(f"Content: {content}")
        return None
    except Exception as e:
        print(f"Error processing response: {e}")
        return None


chat_history = config.CHAT_HISTORY_FOR_CHATGPT
chat_history = config.CHAT_HISTORY_FOR_QWEN

def chatgpt_req_res_controller(prompt:str = "",text_based_prompts:list = [],clear_history = False, max_last_prompt:str = "", max_retries:int = 5) -> Union[dict, None]:
    retries = 0
    chat_history = config.CHAT_HISTORY_FOR_CHATGPT
     # Check if chat_history has reached or is reaching its maximum size
    if clear_history:
        print('\n\nHISTORY CLEARED\n\n')
        chat_history.clear()  # Clear chat history to avoid exceeding context length
    # Check if chat_history has reached or is reaching its maximum size
    if prompt == max_last_prompt:
        print('\nHISTORY CLEARED\n')
        chat_history.clear()  # Clear chat history to avoid exceeding context length
    
    chat_history.append({
        "role": "user",
        "content": prompt
    })
    
    data = {
        "model": "gpt-4o-mini",
        "messages": chat_history,
        "frequency_penalty": 0.5,
        "presence_penalty": 0.5
    }
    print('MODEL',data['model'])
    print('PROMPT',prompt)

    
    while retries < max_retries:
        try:
            response = requests.post(config.OPENAI_URL, headers=config.HEADERS, json=data)
            if response.status_code == 200:
                result_content = response.json()['choices'][0]['message']['content']
                chat_history.append({
                    "role": "assistant",
                    "content": result_content
                })
                print('result_content',result_content)
                # Attempt to parse the JSON content for prompts other than promptConcept
                if prompt in text_based_prompts:
                    return result_content
                else:
                    parsed_content = get_json_content(result_content)
                    if parsed_content is not None:
                        return parsed_content
            else:
                print("Error:", response.status_code, response.text)
                if response.status_code == 429:
                    sys.exit(0)
        except Exception as e:
            print(f"An error occurred: {e}")
        retries += 1
        time.sleep(60)
    return None

def qwen_req_res_controller(prompt:str = "", text_based_prompts:list = [], clear_history=False, max_last_prompt:str = "", max_retries:int = 5) -> Union[dict, None]:
    retries = 0
    global chat_history
    if clear_history or prompt == max_last_prompt:
        print('\n\nHISTORY CLEARED\n\n')
        chat_history = []
        cleared_session = config.CLIENT.predict(api_name="/clear_session")  # Clear chat history to avoid exceeding context length

    print('PROMPT', prompt)

    while retries < max_retries:
        try:
            print("CHAT HISTORY", chat_history)
            # Send prompt to the Qwen model via Gradio config.CLIENT
            processor = config.CLIENT.predict(
                                query= prompt,
                                history= chat_history,
                                system="You are a helpful assistant.",
                                radio='72B',
                                api_name="/model_chat"
                            )

            # Process and accumulate the results
            result_content = processor[1][0][1] if clear_history else processor[1][1][1]
            print('result_content', result_content)

            # Attempt to parse the JSON content for prompts other than text-based prompts
            if prompt in text_based_prompts:
                chat_history = [[
                    prompt,
                    str(result_content)
                ]]
                return str(result_content)
            else:
                parsed_content = get_json_content(result_content)
                if parsed_content is not None:
                    chat_history = [[
                    prompt,
                    parsed_content
                ]]
                    return parsed_content

        except Exception as e:
            print(f"An error occurred: {e}")
            retries += 1
            time.sleep(60)
    return None
