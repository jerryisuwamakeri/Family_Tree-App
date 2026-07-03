import axios from 'axios';
import {storage} from '../utils/storage';

// Change this to your production server URL
export const BASE_URL = 'https://imammalikiabdullahifamiilytree.com';
export const API_URL = `${BASE_URL}/api`;

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
