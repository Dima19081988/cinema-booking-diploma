import apiClient from "./client";

export const loginToken = (payload) => apiClient.post('/auth/login/', payload);
export const refreshToken = (payload) => apiClient.post('/auth/refresh/', payload);
export const getMe = () => apiClient.get('/auth/me/');