import apiClient from "./client";

export const getMovies = () => apiClient.get('/movies/');