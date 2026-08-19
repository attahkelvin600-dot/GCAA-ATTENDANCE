import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth service
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => api.post('/auth/login', { email, password }),
  verifyLoginCode: (challengeToken, code) => api.post('/auth/login/verify-code', { challengeToken, code }),
};

// Attendance service
export const attendanceService = {
  checkIn: (personnel_id, location, notes, latitude = null, longitude = null, location_name = null) =>
    api.post('/attendance/check-in', {
      personnel_id,
      location,
      notes,
      latitude,
      longitude,
      location_name
    }),
  checkOut: (personnel_id, notes) =>
    api.post('/attendance/check-out', { personnel_id, notes }),
  getRecords: (filters) => api.get('/attendance/records', { params: filters }),
  getDailyReport: (date) => api.get('/attendance/daily-report', { params: { date } })
};

// Personnel service
export const personnelService = {
  getAll: () => api.get('/personnel'),
  getById: (id) => api.get(`/personnel/${id}`),
  update: (id, data) => api.put(`/personnel/${id}`, data),
  delete: (id) => api.delete(`/personnel/${id}`)
};

export default api;
