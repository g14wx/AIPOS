import axios from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Every caller gets an Error with a readable message and the HTTP status.
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = new Error(error.response?.data?.message ?? error.message);
    normalized.status = error.response?.status ?? 0;
    return Promise.reject(normalized);
  },
);
