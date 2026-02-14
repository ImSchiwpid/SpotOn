import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
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
  getById: (id) => API.get(`/bookings/${id}`),
  cancel: (id, data) => API.put(`/bookings/${id}/cancel`, data),
  getAll: () => API.get('/bookings')
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

// Admin APIs
export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getUsers: () => API.get('/admin/users'),
  updateUser: (id, data) => API.put(`/admin/users/${id}`, data),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  approveParkingSpot: (id) => API.put(`/admin/parking/${id}/approve`),
  getTransactions: () => API.get('/admin/transactions'),
  getPendingApprovals: () => API.get('/admin/pending')
};
