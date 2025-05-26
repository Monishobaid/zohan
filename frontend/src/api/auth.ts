import api from './client';
import { AuthResponse, User } from '../types';

export const authApi = {
  // Check authentication status
  checkAuth: async (): Promise<AuthResponse> => {
    const response = await api.get('/auth/check');
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<{ success: boolean; user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout
  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Google OAuth login (redirects to backend)
  loginWithGoogle: () => {
    window.location.href = `${api.defaults.baseURL}/auth/google`;
  },
}; 