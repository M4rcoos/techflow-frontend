import { api, setToken, getToken } from '../lib/api';
import type { AuthResponse, LoginCredentials, RegisterData } from '../types';
import type { ApiResponse } from '../types/api-response';

type AuthApiResponse = ApiResponse<AuthResponse>;

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/register', data);
      return response.data.data!;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || 'Erro ao registrar');
    }
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthApiResponse>('/api/auth/login', credentials);
      const responseData = response.data.data;
      if (responseData?.token) {
        setToken(responseData.token);
      }
      return responseData!;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || 'Erro ao fazer login');
    }
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post<ApiResponse<{ message: string }>>('/api/auth/forgot-password', { email });
      return response.data.data!;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || 'Erro ao solicitar recuperação');
    }
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    try {
      const response = await api.post<ApiResponse<{ message: string }>>('/api/auth/reset-password', { token, password });
      return response.data.data!;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || 'Erro ao redefinir senha');
    }
  },

  logout() {
    setToken(null);
  },

  isAuthenticated(): boolean {
    return !!getToken();
  },
};