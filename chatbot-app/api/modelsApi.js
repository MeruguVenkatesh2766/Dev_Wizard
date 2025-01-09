import axios from 'axios';

// API base URL (assuming the FastAPI server is running locally)
const API_URL = 'http://localhost:8000';

// Fetch all models
export const getAllModels = async () => {
    try {
        const response = await axios.get(`${API_URL}/models`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Failed to fetch models.");
    }
};
