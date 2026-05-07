import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const requestsAPI = {
  create: (data) => api.post('/requests/', data),
  getAll: (params) => api.get('/requests/', { params }),
  getMyRequests: () => api.get('/requests/my-requests'),
  getById: (id) => api.get(`/requests/${id}`),
  update: (id, data) => api.patch(`/requests/${id}`, data),
  delete: (id) => api.delete(`/requests/${id}`),
};

export const donorsAPI = {
  respond: (data) => api.post('/donors/respond', data),
  getMyDonations: () => api.get('/donors/my-donations'),
  getMatchingRequests: () => api.get('/donors/matching-requests'),
  updateAvailability: (isAvailable) =>
    api.patch(`/donors/update-availability?is_available=${isAvailable}`),
  updateDonation: (id, data) => api.patch(`/donors/donations/${id}`, data),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getAllUsers: () => api.get('/admin/users'),
  verifyUser: (id) => api.patch(`/admin/users/${id}/verify`),
  banUser: (id) => api.patch(`/admin/users/${id}/ban`),
  unbanUser: (id) => api.patch(`/admin/users/${id}/unban`),
  getAllRequests: () => api.get('/admin/requests'),
  deleteRequest: (id) => api.delete(`/admin/requests/${id}`),
  makeAdmin: (id) => api.patch(`/admin/users/${id}/make-admin`),
};

export const chatAPI = {
  getHistory: (donationId) => api.get(`/chat/history/${donationId}`),
  getUnreadCount: () => api.get('/chat/unread-count'),
};

export default api;