import axios from 'axios';
import { getApiBaseUrl } from './appConfig';

const API = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestURL = error.config?.url || '';
      const isAuthRequest =
        requestURL.includes('/auth/login') ||
        requestURL.includes('/auth/register') ||
        requestURL.includes('/auth/google');

      if (isAuthRequest) {
        return Promise.reject(error);
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;

// Auth APIs
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  updateProfileImage: (formData) =>
    API.put('/auth/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  updatePassword: (data) => API.put('/auth/password', data)
};

// Parking APIs
export const parkingAPI = {
  getAll: (params) => API.get('/parking', { params }),
  getById: (id) => API.get(`/parking/${id}`),
  create: (data) => API.post('/parking', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => API.put(`/parking/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => API.delete(`/parking/${id}`),
  getMy: () => API.get('/parking/my/spots'),
  getCities: () => API.get('/parking/cities')
};

// Booking APIs
export const bookingAPI = {
  create: (data) => API.post('/bookings', data),
  verifyPayment: (data) => API.post('/bookings/verify-payment', data),
  getMy: () => API.get('/bookings/my'),
  getPaymentHistory: () => API.get('/bookings/payments/history'),
  getInvoice: (id) => API.get(`/bookings/${id}/invoice`),
  complete: (id) => API.put(`/bookings/${id}/complete`),
  getById: (id) => API.get(`/bookings/${id}`),
  cancel: (id, data) => API.put(`/bookings/${id}/cancel`, data),
  getAll: () => API.get('/bookings')
};

// Review APIs
export const reviewAPI = {
  create: (data) => API.post('/reviews', data),
  getParkingReviews: (parkingId) => API.get(`/reviews/parking/${parkingId}`),
  getMy: () => API.get('/reviews/my'),
  reply: (id, data) => API.put(`/reviews/${id}/reply`, data)
};

// Complaint APIs
export const complaintAPI = {
  create: (data) => API.post('/complaints', data),
  getMy: () => API.get('/complaints/my'),
  getAll: () => API.get('/complaints'),
  update: (id, data) => API.put(`/complaints/${id}`, data)
};

// Notification APIs
export const notificationAPI = {
  getMy: () => API.get('/notifications'),
  markRead: (id) => API.put(`/notifications/${id}/read`),
  markAllRead: () => API.put('/notifications/read-all')
};

// Car APIs
export const carAPI = {
  getAll: () => API.get('/cars'),
  getById: (id) => API.get(`/cars/${id}`),
  create: (data) => API.post('/cars', data),
  update: (id, data) => API.put(`/cars/${id}`, data),
  delete: (id) => API.delete(`/cars/${id}`),
  setDefault: (id) => API.put(`/cars/${id}/default`)
};

// Favorite APIs
export const favoriteAPI = {
  getMy: () => API.get('/favorites'),
  add: (parkingId) => API.post(`/favorites/${parkingId}`),
  remove: (parkingId) => API.delete(`/favorites/${parkingId}`)
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getUsers: (params) => API.get('/admin/users', { params }),
  updateUser: (id, data) => API.put(`/admin/users/${id}`, data),
  suspendUser: (id, suspend = true) => API.put(`/admin/users/${id}/suspend`, { suspend }),
  verifyOwner: (id) => API.put(`/admin/users/${id}/verify-owner`),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  approveParkingSpot: (id) => API.put(`/admin/parking/${id}/approve`),
  removeParkingSpot: (id) => API.delete(`/admin/parking/${id}`),
  getTransactions: (params) => API.get('/admin/transactions', { params }),
  getPendingApprovals: (params) => API.get('/admin/pending', { params }),
  getSettings: () => API.get('/admin/settings'),
  updateCommission: (commissionPercent) => API.put('/admin/settings/commission', { commissionPercent }),
  getComplaints: () => API.get('/admin/complaints'),
  getWithdrawals: (params) => API.get('/admin/withdrawals', { params }),
  processWithdrawal: (id, data) => API.put(`/admin/withdrawals/${id}`, data)
};

// Owner APIs
export const ownerAPI = {
  getDashboard: () => API.get('/owner/dashboard'),
  getBookings: (params) => API.get('/owner/bookings', { params }),
  decideBooking: (id, data) => API.put(`/owner/bookings/${id}/decision`, data),
  setMaintenance: (parkingId, data) => API.put(`/owner/parking/${parkingId}/maintenance`, data),
  requestWithdrawal: (data) => API.post('/owner/withdrawals', data),
  getWithdrawals: () => API.get('/owner/withdrawals'),
  getTransactions: () => API.get('/owner/transactions')
};
