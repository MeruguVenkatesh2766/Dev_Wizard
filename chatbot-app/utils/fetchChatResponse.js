// chat.js
import { API_URL } from "../config";

export async function fetchChatResponse(api_key, model_id, model_name, model_source, model_capabilities, chat_history, prompt, clear_history, response_type_needed, create_time) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ api_key, model_id, model_name, model_source, model_capabilities, chat_history, prompt, clear_history, response_type_needed, create_time }),
    };

    try {
        const response = await fetch(`${API_URL}/v2/conversation`, options);

        if (response.ok) {
            const data = await response.json();
            return data.choices[0].message;
        }

        if (response.status === 429) {
            throw new Error('Too many requests, please try again later.');
        }

        const errorData = await response.json();
        throw new Error(errorData.error ? errorData.error.message : 'An unknown error occurred.');
    } catch (error) {
        if (error.name === 'TypeError') {
            throw new Error('Network error, please check your connection.');
        }
        throw error;
    }
}
