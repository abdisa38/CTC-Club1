import axios from 'axios';

const configuredApiBaseUrl = String(import.meta.env.VITE_API_BASE_URL || '/api').trim();

// Create an Axios instance pointing to the API via env-configured URL or local proxy
const api = axios.create({
  baseURL: configuredApiBaseUrl || '/api',
  withCredentials: true, // Crucial for sending/receiving httpOnly cookies
});

// Configure Axios interceptors if needed
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access globally (e.g., clear localStorage, redirect to login)
      localStorage.removeItem('userInfo');
    }
    return Promise.reject(error);
  }
);

export default api;