import axios from 'axios';

// Create an Axios instance pointing to the API via our Vite proxy
const rawBaseUrl = String(import.meta.env.VITE_API_BASE_URL || '/api').trim();
const normalizedBaseUrl = rawBaseUrl.endsWith('/') && rawBaseUrl.length > 1
  ? rawBaseUrl.slice(0, -1)
  : rawBaseUrl;

const api = axios.create({
  baseURL: normalizedBaseUrl,
  withCredentials: true, // Crucial for sending/receiving httpOnly cookies
  timeout: 15000,
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