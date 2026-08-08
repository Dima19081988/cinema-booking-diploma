import apiClient from './client';

export const getSessions = (movieId = null) => 
    apiClient.get('/sessions/', {
        params: movieId ? { movie_id: movieId } : {},
    });
export const getSessionById = (id) => apiClient.get(`/sessions/${id}/`);
export const getHallSchema = (id) => apiClient.get(`/sessions/${id}/hall-schema/`);