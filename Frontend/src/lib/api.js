import axios from 'axios';
import { cookieStorage, scrubStorage } from './utils';
import { useToast } from './toastStore';

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
  withCredentials: true, // Critical: This sends cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Better Auth uses session cookies automatically
// No need to manually add Authorization header
api.interceptors.request.use(
  (config) => {
    // Better Auth manages authentication via httpOnly cookies
    // The browser automatically sends cookies with withCredentials: true
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
    // Get the request URL to check if it's an auth request
    const requestUrl = error.config?.url || '';
    // Better Auth endpoints pattern
    const isAuthRequest = requestUrl.includes('/auth/sign-in') ||
      requestUrl.includes('/auth/sign-up') ||
      requestUrl.includes('/auth/');

    // Handle Rate Limiting (429 Too Many Requests)
    if (error.response?.status === 429) {
      const serverMessage = error.response.data?.message || error.response.data?.error || (typeof error.response.data === 'string' ? error.response.data : null);
      const message = serverMessage || 'Daily limit reached. slow down, legend.';
      error.isHandled = true;
      // We use the store outside of a component, so we access it via getState()
      useToast.getState().addToast(message, 'warning');
    }

    // Handle Server Errors (500)
    if (error.response?.status >= 500) {
      error.isHandled = true;
      useToast.getState().addToast('Server error. something went wrong on our end.', 'error');
    }

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
    // Better Auth uses unified endpoint
    const response = await api.post('/auth/sign-in/email', { email, password });
    return response.data;
  },

  signup: async (email, password, confirmPassword, fullName) => {
    // Better Auth signup with role
    const response = await api.post('/auth/sign-up/email', {
      email,
      password,
      name: fullName,
      role: 'Employee'
    });
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
    // Better Auth logout endpoint
    const response = await api.post('/auth/sign-out');
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
    // Better Auth handles verification via callback URL
    // This is typically handled automatically by clicking email link
    const response = await api.get(`/auth/verify-email?token=${token}`);
    return response.data;
  },

  resendVerification: async (email) => {
    // Better Auth unified resend endpoint
    const response = await api.post('/auth/send-verification-email', { email });
    return response.data;
  },
};

// Recruiter API endpoints
export const recruiterAPI = {
  login: async (email, password) => {
    // Better Auth uses unified endpoint
    const response = await api.post('/auth/sign-in/email', { email, password });
    return response.data;
  },

  signup: async (email, password, confirmPassword, fullName) => {
    // Better Auth signup with role
    const response = await api.post('/auth/sign-up/email', {
      email,
      password,
      name: fullName,
      role: 'Recruiter'
    });
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
    // Better Auth logout endpoint
    const response = await api.post('/auth/sign-out');
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
    // Better Auth handles verification via callback URL
    const response = await api.get(`/auth/verify-email?token=${token}`);
    return response.data;
  },
  resendVerification: async (email) => {
    // Better Auth unified resend endpoint
    const response = await api.post('/auth/send-verification-email', { email });
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

// Auto-Apply API endpoints
export const autoApplyAPI = {
  getStatus: async () => {
    const response = await api.get('/auto-apply/status');
    return response.data;
  },

  toggle: async (enabled) => {
    const response = await api.post('/auto-apply/toggle', { enabled });
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/auto-apply/history');
    return response.data;
  }
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

// Admin API endpoints
export const adminAPI = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
  getUsers: async (params) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  updateUserStatus: async (id, data) => {
    const response = await api.patch(`/admin/users/${id}/status`, data);
    return response.data;
  },
  getJobs: async (params) => {
    const response = await api.get('/admin/jobs', { params });
    return response.data;
  },
  updateJobStatus: async (id, data) => {
    const response = await api.patch(`/admin/jobs/${id}`, data);
    return response.data;
  },
  deleteJob: async (id) => {
    const response = await api.delete(`/admin/jobs/${id}`);
    return response.data;
  },
};

export default api;
