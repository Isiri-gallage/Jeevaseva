import axios from 'axios';

// Configured at build time via frontend/.env (see .env.example).
// Falls back to the local dev backend so `npm start` works with no setup.
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// ws:// for http, wss:// for https — derived so deploys don't need a second var.
export const chatSocketUrl = (ticket) => {
  const url = new URL(`${API_BASE_URL}/chat/ws`, window.location.origin);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.searchParams.set('ticket', ticket);
  return url.toString();
};

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
  updateProfile: (data) => api.patch('/auth/me', data),
  // Sent in the request body — query params end up in server and proxy logs.
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    }),
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
  getDonation: (id) => api.get(`/donors/donations/${id}`),
  getDonationByRequest: (requestId) => api.get(`/donors/by-request/${requestId}`),
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
  getKidneyHistory: (matchId) => api.get(`/chat/history/kidney/${matchId}`),
  getUnreadCount: () => api.get('/chat/unread-count'),
  // Short-lived credential for opening the chat socket.
  getWsTicket: () => api.post('/chat/ws-ticket'),
};


export const kidneyAPI = {
  // Requests
  createRequest: (data) => api.post('/kidney/requests', data),
  getAllRequests: () => api.get('/kidney/requests'),
  getMyRequests: () => api.get('/kidney/requests/my'),
  updateRequest: (id, data) => api.patch(`/kidney/requests/${id}`, data),
  deleteRequest: (id) => api.delete(`/kidney/requests/${id}`),

  // Donors
  registerDonor: (data) => api.post('/kidney/donors/register', data),
  getAllDonors: () => api.get('/kidney/donors'),
  getMyDonorProfile: () => api.get('/kidney/donors/my'),
  updateAvailability: (isAvailable) =>
    api.patch(`/kidney/donors/availability?is_available=${isAvailable}`),

  // Matches
  respondToRequest: (data) => api.post('/kidney/matches/respond', data),
  getMyMatches: () => api.get('/kidney/matches/my'),
  getMatchDetails: (id) => api.get(`/kidney/matches/${id}`),
  updateMatchStatus: (id, status) => api.patch(`/kidney/matches/${id}/status`, { status }),
};
export default api;