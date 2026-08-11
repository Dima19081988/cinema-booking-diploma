import apiClient from "./client";

{/* публичные */}
export const getMovies = () => apiClient.get('/movies/');

{/* админские */}
export const getAdminMovies = () => apiClient.get('/admin/movies/')

export const createMovie = (payload) =>
    apiClient.post("/admin/movies/", payload);

export const updateMovie = (movieId, payload) => 
    apiClient.patch(`/admin/movies/${movieId}/`, payload);

export const deleteMovie = (movieId) =>
    apiClient.delete(`/admin/movies/${movieId}/`);