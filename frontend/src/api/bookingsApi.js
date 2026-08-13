import apiClient from "./client";

{/* публичные */}
export const createBooking = (payload) => apiClient.post('/bookings/', payload);
export const getBookingByCode = (code) => apiClient.get(`/bookings/code/${code}/`);
export const getBookingTicket = (bookingId) => apiClient.get(`/bookings/${bookingId}/ticket/`);
export const getBookingQr = (bookingId) => apiClient.get(`/bookings/${bookingId}/qr/`, {
  responseType: 'blob',
});

{/* админские */}
export const getAdminBookings = () =>
  apiClient.get('/admin/bookings/');

export const updateBookingStatus = (bookingId, status) =>
  apiClient.patch(`/admin/bookings/${bookingId}/status/`, {
    status,
  });