import { api } from './api';
import { jwtDecode } from 'jwt-decode';

// Check if running on client side
const isClient = typeof window !== 'undefined';

// Get token from localStorage
export const getToken = () => {
  if (!isClient) return null;
  return localStorage.getItem('token');
};

// Set token in localStorage
export const setToken = (token) => {
  if (!isClient) return;
  localStorage.setItem('token', token);
};

// Remove token from localStorage
export const removeToken = () => {
  if (!isClient) return;
  localStorage.removeItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  if (!isClient) return false;
  
  const token = getToken();
  if (!token) return false;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Token validation error:', error);
    removeToken();
    return false;
  }
};

// Get current user from token
export const getCurrentUser = () => {
  if (!isClient) return null;
  
  const token = getToken();
  if (!token) return null;
  
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
};

// Authentication API calls
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    if (response.token) {
      setToken(response.token);
    }
    return response;
  },
  
  register: async (userData) => {
    return api.post('/api/auth/signup', userData);
  },
  
  logout: () => {
    removeToken();
    // Optional: Call logout endpoint if needed
    // return api.post('/api/auth/logout');
  },
  
  getProfile: async () => {
    return api.get('/api/user/profile');
  },
}; 