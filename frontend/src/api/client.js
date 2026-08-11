import axios from 'axios';

let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token;
}

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1',
});


apiClient.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

export default apiClient;