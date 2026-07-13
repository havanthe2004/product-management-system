import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.request.use(
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

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh token logic for authentication endpoints (login, forgot, reset, refresh)
    if (originalRequest.url?.includes('/auth/')) {
      return Promise.reject(error);
    }

    // Check if the error is 401 (Unauthorized) and has not been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refreshing is in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshTok = localStorage.getItem('refreshToken');
      if (refreshTok) {
        try {
          const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
          
          // Make direct post request using raw axios to avoid interceptor loop & circular dependency
          const res = await axios.post(`${baseUrl}/auth/refresh`, { refreshToken: refreshTok });
          const { accessToken, refreshToken: newRefreshToken } = res.data.data;

          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Update header for the current request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          processQueue(null, accessToken);
          isRefreshing = false;

          // Retry original request
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;

          // Clear auth data and force reload to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.reload();

          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available, force logout
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.reload();
      }
    }

    return Promise.reject(error);
  }
);

export default api;
