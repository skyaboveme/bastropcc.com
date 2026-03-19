import axios from 'axios';

// Explicitly set the production API URL to guarantee connection
const baseURL = 'https://bastropcc-api.skyabove.workers.dev/api/v1';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Optionally handle global 401s (redirect to login)
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/login') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// We rely on httpOnly cookies for session state, but we can also set the bearer if the API returns one explicitly
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};
