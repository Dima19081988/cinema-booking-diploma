import apiClient from "./client";

export const loginToken = (credentials) => apiClient.post('/auth/login/', credentials);
export const refreshToken = (credentials) => apiClient.post('/auth/refresh/', credentials);
export const getMe = () => apiClient.get('/auth/me/');