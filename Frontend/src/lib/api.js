import axios from 'axios';
import { cookieStorage, scrubStorage } from './utils';

// ✅ Use environment variable in production, relative path in development
const getBaseURL = () => {
  // In production, use the backend Railway URL
  if (process.env.NEXT_PUBLIC_API_URL) {
    return `${process.env.NEXT_PUBLIC_API_URL}/api`;
  }
  // In development, use Next.js proxy
  return '/api';
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token from cookies if available
api.interceptors.request.use(
  (config) => {
    // Manually extract token from cookies if browser doesn't send it or backend needs header
    const token = cookieStorage.getItem('token');
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Get the request URL to check if it's a login/signup request
    const requestUrl = error.config?.url || '';
    const isAuthRequest = requestUrl.includes('/login') || requestUrl.includes('/signup');

    if (error.response?.status === 401 && !isAuthRequest) {
      // Don't auto-logout for profile requests - might be a backend route mismatch
      // Only scrub and redirect if we're NOT on the login page already
      const isProfileRequest = requestUrl.includes('/profile');
      const isLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';

      if (!isProfileRequest && !isLoginPage) {
        scrubStorage();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Employee API endpoints
export const employeeAPI = {
  login: async (email, password) => {
    const response = await api.post('/employee/login', { email, password });
    return response.data;
  },

  signup: async (email, password, confirmPassword, fullName) => {
    const response = await api.post('/employee/signup', { email, password, confirmPassword, fullName });
    return response.data;
  },

  getProfile: async () => {
    try {
      const response = await api.get('/employee/profile');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 403) {
        // Fallback for potential route variations
        const response = await api.get('/candidate/profile');
        return response.data;
      }
      throw error;
    }
  },

  logout: async () => {
    const response = await api.post('/employee/logout');
    return response.data;
  },
  updateProfilePicture: async (formData) => {
    const response = await api.post('/employee/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateResume: async (formData) => {
    const response = await api.post('/employee/profile/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProfile: async (id, data) => {
    const response = await api.put(`/employee/profile/${id}`, data);
    return response.data;
  },

  getRecommendations: async () => {
    const response = await api.get('/employee/recommendations');
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await api.get(`/employee/verify-email/${token}`);
    return response.data;
  },

  resendVerification: async (email) => {
    const response = await api.post('/employee/resend-verification', { email });
    return response.data;
  },
};

// Recruiter API endpoints
export const recruiterAPI = {
  login: async (email, password) => {
    const response = await api.post('/recruiter/login', { email, password });
    return response.data;
  },

  signup: async (email, password, confirmPassword, fullName) => {
    const response = await api.post('/recruiter/signup', { email, password, confirmPassword, fullName });
    return response.data;
  },

  getProfile: async () => {
    try {
      const response = await api.get('/recruiter/profile');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 403) {
        // Fallback to correct spelling just in case
        const response = await api.get('/recruiter/profile');
        return response.data;
      }
      throw error;
    }
  },

  logout: async () => {
    const response = await api.post('/recruiter/logout');
    return response.data;
  },
  updateProfile: async (id, data) => {
    const response = await api.put(`/recruiter/profile/${id}`, data);
    return response.data;
  },

  updateProfilePicture: async (formData) => {
    const response = await api.post('/recruiter/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateResume: async (formData) => {
    const response = await api.post('/recruiter/profile/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getTalents: async () => {
    const response = await api.get('/recruiter/talents');
    return response.data;
  },

  updateApplicationStatus: async (jobId, applicationId, status) => {
    const response = await api.put(`/recruiter/update/${applicationId}/status`, {
      status
    });
    return response.data;
  },
  verifyEmail: async (token) => {
    const response = await api.get(`/recruiter/verify-email/${token}`);
    return response.data;
  },
  resendVerification: async (email) => {
    const response = await api.post('/recruiter/resend-verification', { email });
    return response.data;
  },
};

// Jobs API endpoints
export const jobsAPI = {
  getAll: async () => {
    const response = await api.get('/jobs');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/job/${id}`);
    return response.data;
  },

  scoreResume: async (id, formData) => {
    const response = await api.post(`/job/score/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  apply: async (id, formData) => {
    const response = await api.post(`/job/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/job/${id}`, data);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/job/create', data);
    return response.data;
  },
};

// Notification API endpoints
export const notificationAPI = {
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};

// Try/Tools API endpoints
export const tryAPI = {
  roastResume: async (formData) => {
    const response = await api.post('/try/roast-my-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api;
