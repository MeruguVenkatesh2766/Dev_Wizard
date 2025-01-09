import axios from 'axios';

// API base URL (assuming the FastAPI server is running locally)
const API_URL = 'http://localhost:8000';

// Create a new chat
export const createChat = async (chatData) => {
    try {
        const response = await axios.post(`${API_URL}/chats`, chatData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Failed to create chat.");
    }
};

// Get a chat by its ID
export const getChat = async (chatId) => {
    try {
        const response = await axios.get(`${API_URL}/chats/${chatId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Chat not found.");
    }
};

// Update a chat by its ID
export const updateChat = async (chatId, updatedFields) => {
    try {
        const response = await axios.put(`${API_URL}/chats/${chatId}`, updatedFields);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Failed to update chat.");
    }
};

// Delete a chat by its ID
export const deleteChat = async (chatId) => {
    try {
        const response = await axios.delete(`${API_URL}/chats/${chatId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Failed to delete chat.");
    }
};

// Get all chats
export const getAllChats = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/chats/${userId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Failed to fetch chats.");
    }
};
