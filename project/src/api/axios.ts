import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Accept': 'application/json',
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Log request details
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data instanceof FormData ? 
        'FormData' : 
        config.data
    });

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', { 
      url: response.config.url,
      status: response.status,
      data: response.data 
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
); 