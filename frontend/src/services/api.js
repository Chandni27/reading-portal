import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: `${BASE_URL}/api/v1` });

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

export const booksAPI = {
  list: () => api.get('/books/'),
  create: (formData) => api.post('/books/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/books/${id}`),
};

export const assignmentsAPI = {
  list: (studentId) => api.get('/assignments/', { params: studentId ? { student_id: studentId } : {} }),
  create: (data) => api.post('/assignments/', data),
  updateProgress: (id, data) => api.patch(`/assignments/${id}/progress`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
};

export const studentsAPI = {
  list: () => api.get('/students/'),
};

export const dashboardAPI = {
  get: () => api.get('/dashboard/'),
};

export default api;
