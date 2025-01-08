import time
from typing import Union
from gradio_client import Client

from utils.helper import get_json_content

def qwen_req_res_controller(model_name:str="",chat_history:list=[], prompt:str = "", response_type_needed:str = "text-based", create_time:str="", clear_history=True, max_retries:int = 5) -> Union[dict, None]:
        print("MODLE_DATA", model_name)
        retries = 0
        if clear_history:
                print('\n\nHISTORY CLEARED\n\n')
                chat_history = []
                cleared_session = Client(model_name).predict(api_name="/clear_session")  # Clear chat history to avoid exceeding context length

        while retries < max_retries:
                try:
                        # Send prompt to the Qwen model via Gradio client
                        processor = Client(model_name).predict(
                                query= prompt,
                                history= chat_history,
                                system="You are a helpful assistant.",
                                api_name="/model_chat"
                            )

                        print("Processor Output:", clear_history, processor)  # Debugging output

                        # Check if the response structure matches expectations
                        result_content = processor[1][-1][1]


                        # Attempt to parse the JSON content for prompts other than text-based prompts
                        if response_type_needed == "text-based":
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
                        time.sleep(5)
        return None
