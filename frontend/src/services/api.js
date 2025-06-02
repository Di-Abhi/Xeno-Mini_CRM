import axios from 'axios';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';

/**
 * 🌐 API Service - Your gateway to the backend
 *
 * This service handles all communication with the backend API.
 * It includes automatic error handling, authentication, and
 * user-friendly error messages.
 */

// Create axios instance with optimized configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 15000, // Increased timeout for better UX
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Track request count for loading states
let activeRequests = 0;

// Custom loading toast ID to prevent multiple toasts
let loadingToastId = null;

// 🔐 Request interceptor - Adds authentication and loading states
api.interceptors.request.use(
  (config) => {
    // Add authentication token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Track active requests for loading states
    activeRequests++;

    // Show loading toast for long requests (but not for frequent ones)
    if (activeRequests === 1 && !config.url?.includes('/health')) {
      loadingToastId = toast.loading('Processing...', {
        duration: Infinity,
        style: {
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        }
      });
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };

    return config;
  },
  (error) => {
    activeRequests--;
    if (loadingToastId) {
      toast.dismiss(loadingToastId);
      loadingToastId = null;
    }
    return Promise.reject(error);
  }
);

// 📥 Response interceptor - Handles responses and errors gracefully
api.interceptors.response.use(
  (response) => {
    // Decrease active request count
    activeRequests--;

    // Dismiss loading toast when all requests complete
    if (activeRequests === 0 && loadingToastId) {
      toast.dismiss(loadingToastId);
      loadingToastId = null;
    }

    // Log response time for debugging
    if (response.config.metadata) {
      const duration = new Date() - response.config.metadata.startTime;
      if (duration > 2000) { // Log slow requests
        console.warn(`🐌 Slow API request: ${response.config.url} took ${duration}ms`);
      }
    }

    return response;
  },
  (error) => {
    // Decrease active request count
    activeRequests--;

    // Dismiss loading toast
    if (activeRequests === 0 && loadingToastId) {
      toast.dismiss(loadingToastId);
      loadingToastId = null;
    }

    // Get human-friendly error message
    const message = getErrorMessage(error);

    // Handle specific error cases with appropriate actions
    if (error.response?.status === 401) {
      // 🔒 Unauthorized - Session expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('🔒 Your session has expired. Please login again.');
    } else if (error.response?.status === 403) {
      // 🚫 Forbidden - Insufficient permissions
      toast.error('🚫 Access denied. You don\'t have permission for this action.');
    } else if (error.response?.status === 404) {
      // 🔍 Not found
      toast.error('🔍 The requested resource was not found.');
    } else if (error.response?.status >= 500) {
      // 🔧 Server error
      toast.error('🔧 Server error. Our team has been notified. Please try again later.');
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      // 🌐 Network error
      toast.error('🌐 Network error. Please check your internet connection.');
    } else {
      // 💥 Other errors
      toast.error(`💥 ${message}`);
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getProfile: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
  changePassword: (data) => api.post('/api/auth/change-password', data),
  logout: () => api.post('/api/auth/logout'),
};

// Customers API
export const customersAPI = {
  getAll: (params) => api.get('/api/customers', { params }),
  create: (data) => api.post('/api/customers', data),
  getById: (id) => api.get(`/api/customers/${id}`),
  update: (id, data) => api.put(`/api/customers/${id}`, data),
  delete: (id) => api.delete(`/api/customers/${id}`),
  getStats: () => api.get('/api/customers/stats/overview'),
};

// Orders API
export const ordersAPI = {
  getAll: (params) => api.get('/api/orders', { params }),
  create: (data) => api.post('/api/orders', data),
  getById: (id) => api.get(`/api/orders/${id}`),
  update: (id, data) => api.put(`/api/orders/${id}`, data),
  getStats: () => api.get('/api/orders/stats/overview'),
};

// Campaigns API
export const campaignsAPI = {
  getAll: (params) => api.get('/api/campaigns', { params }),
  create: (data) => api.post('/api/campaigns', data),
  getById: (id) => api.get(`/api/campaigns/${id}`),
  update: (id, data) => api.put(`/api/campaigns/${id}`, data),
  launch: (id) => api.post(`/api/campaigns/${id}/launch`),
  previewAudience: (data) => api.post('/api/campaigns/preview', data),
};

// Utility functions
export const handleApiError = (error) => {
  const message = error.response?.data?.message || error.message || 'An error occurred';
  const errors = error.response?.data?.errors || [];

  return {
    message,
    errors,
    status: error.response?.status,
  };
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export default api;
