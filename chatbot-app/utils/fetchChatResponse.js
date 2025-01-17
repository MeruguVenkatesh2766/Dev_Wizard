// chat.js
import { API_URL } from "../config";

export async function fetchChatResponse(api_key, model_id, model_name, model_source, model_capabilities, chat_history, prompt, clear_history, response_type_needed, create_time) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
            api_key,
            model_id,
            model_name,
            model_source,
            model_capabilities,
            chat_history,
            prompt,
            clear_history,
            response_type_needed,
            create_time,
        }),
    };

    try {
        const response = await fetch(`${API_URL}/v2/conversation`, options);

        if (response.ok) {
            // Response is successfully sent, now handle the EventSource for streaming
            const eventSource = new EventSource(`${API_URL}/v2/conversation-stream`);

            eventSource.onmessage = function (event) {
                const response = event.data;
                // Process and handle the response here
                console.log("Received response: ", response);
                // You can update the chat history and the UI with the response
            };

            eventSource.onerror = function (error) {
                console.error('Error receiving stream data:', error);
                eventSource.close(); // Close the stream if there's an error
            };

            // Optionally handle the event source closing manually after some time or other conditions
            // eventSource.close(); // You can close the stream when the conversation is complete
        } else {
            if (response.status === 429) {
                throw new Error('Too many requests, please try again later.');
            }

            const errorData = await response.json();
            throw new Error(errorData.error ? errorData.error.message : 'An unknown error occurred.');
        }
    } catch (error) {
        if (error.name === 'TypeError') {
            throw new Error('Network error, please check your connection.');
        }
        throw error;
    }
}
