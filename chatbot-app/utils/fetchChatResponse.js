// chat.js
import { API_URL } from "../config";
export async function fetchChatResponse(message) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('access_token'),
        },
        body: JSON.stringify({ message }),
    };

    try {
        const response = await fetch(`${API_URL}/v2/conversation`, options);

        if (response.status === 429) {
            throw new Error('Too many requests, please try again later.');
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        return data.choices[0].message;
    } catch (error) {
        throw error;
    }
}
