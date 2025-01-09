import axios from 'axios';

// API base URL (assuming the FastAPI server is running locally)
const API_URL = 'http://localhost:8000';

export const signup = async (username, password) => {
    try {
        const response = await axios.post(`${API_URL}/signup`, {
            username,
            password,
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.detail || 'Signup failed');
    }
};

export const login = async (username, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, {
            username,
            password,
        });
        // Store JWT token in localStorage or sessionStorage
        localStorage.setItem('access_token', response.data.access_token);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.detail || 'Login failed');
    }
};

export const getAuthToken = () => {
    return localStorage.getItem('access_token');
};

export const logout = () => {
    localStorage.removeItem('access_token');
};
