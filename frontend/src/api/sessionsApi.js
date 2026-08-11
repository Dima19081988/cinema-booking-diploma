import apiClient from './client';

{/* публичные */}
export const getSessions = (movieId = null) => 
    apiClient.get('/sessions/', {
        params: movieId ? { movie_id: movieId } : {},
    });
export const getSessionById = (id) => apiClient.get(`/sessions/${id}/`);
export const getHallSchema = (id) => apiClient.get(`/sessions/${id}/hall-schema/`);

{/* админские */}
export const getAdminSessions = () =>
    apiClient.get("/admin/sessions/");

export const getAdminHalls = () =>
    apiClient.get("/admin/halls/");

export const createSession = (payload) =>
    apiClient.post("/admin/sessions/", payload);

export const updateSession = (sessionId, payload) =>
    apiClient.patch(`/admin/sessions/${sessionId}/`, payload);

export const deleteSession = (sessionId) =>
    apiClient.delete(`/admin/sessions/${sessionId}/`);