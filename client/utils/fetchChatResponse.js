// chat.js
export async function fetchChatResponse(message) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': import.meta.env.VITE_AUTH_TOKEN,
        },
        body: JSON.stringify({ message }),
    };

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/completions`, options);

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
