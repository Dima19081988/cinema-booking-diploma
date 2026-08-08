import apiClient from "./client";

export const createBooking = (payload) => apiClient.post('/bookings/', payload);
export const getBookingByCode = (code) => apiClient.get(`/bookings/code/${code}/`);
export const getBookingTicket = (bookingId) => apiClient.get(`/bookings/${bookingId}/ticket/`);
export const getBookingQr = (bookingId) => apiClient.get(`/bookings/${bookingId}/qr/`, {
  responseType: 'blob',
});