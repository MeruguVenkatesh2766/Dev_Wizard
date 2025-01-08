import json
import re
from typing import Union

from json_repair import repair_json


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
