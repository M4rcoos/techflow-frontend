import { api } from '../lib/api';
import type { User } from '../types';

interface CreateUser {
  name: string;
  email: string;
  password: string;
  role: string;
  department_id: string;
  contact?: string;
}

export interface UpdateUser {
  name?: string;
  email?: string;
  role?: string;
  contact?: string;
  active?: boolean;
}

interface ListUsersResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const userService = {
  async list(page = 1, limit = 10): Promise<ListUsersResponse> {
    const response = await api.get('/api/users', { params: { page, limit } });
    return response.data.data;
  },

  async getById(id: string): Promise<User> {
    const response = await api.get(`/api/users/${id}`);
    return response.data.data;
  },

  async create(data: CreateUser): Promise<User> {
    const response = await api.post('/api/users', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateUser): Promise<User> {
    const response = await api.put(`/api/users/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/users/${id}`);
  },

  async getRoles(): Promise<string[]> {
    const response = await api.get('/api/users/roles');
    return response.data.data;
  },

  async updateOnboarding(hasSeen: boolean): Promise<void> {
    await api.patch('/api/users/onboarding', { has_seen_onboarding: hasSeen });
  },

  async resetPassword(id: string, password: string): Promise<{ message: string }> {
    const response = await api.post<{ data: { message: string } }>(`/api/users/${id}/reset-password`, { password });
    return response.data.data;
  },
};
