import axios from 'axios';
import {storage} from '../utils/storage';
import {BASE_URL, API_URL} from '../config/env';

// Re-export so callers can keep pulling these off the client.
export {BASE_URL, API_URL};

const client = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Attach token to every request
client.interceptors.request.use(async config => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error normalisation
client.interceptors.response.use(
  res => res,
  err => {
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  },
);

export default client;
