import { api } from '../lib/api';
import type { Client, ClientType, CreateClientData } from '../types';
import type { ApiResponse } from '../types/api-response';

interface ListResponse {
  clients: Client[];
  pagination?: { page: number; limit: number; total: number; pages: number };
}

export const clientService = {
  async list(page = 1, limit = 10): Promise<ListResponse> {
    const response = await api.get<ApiResponse<{ clients: Client[]; pagination: ListResponse['pagination'] }>>('/api/clients', { params: { page, limit } });
    const data = response.data.data || { clients: [], pagination: undefined };
    return {
      clients: data.clients || [],
      pagination: data.pagination,
    };
  },

  async getById(id: string): Promise<Client> {
    const response = await api.get<ApiResponse<Client>>(`/api/clients/${id}`);
    return response.data.data!;
  },

  async create(data: CreateClientData): Promise<Client> {
    const response = await api.post<ApiResponse<Client>>('/api/clients', data);
    return response.data.data!;
  },

  async update(id: string, data: CreateClientData): Promise<Client> {
    const response = await api.put<ApiResponse<Client>>(`/api/clients/${id}`, data);
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/clients/${id}`);
  },

  async getClientTypes(): Promise<ClientType[]> {
    const response = await api.get<ApiResponse<ClientType[]>>('/api/clients/types');
    return response.data.data || [];
  },
};