import { api } from '../lib/api';
import type { Budget, BudgetListItem, BudgetStatus, CreateBudgetData } from '../types';
import type { ApiResponse } from '../types/api-response';

interface ListResponse {
  budgets: BudgetListItem[];
  pagination?: { page: number; limit: number; total: number; pages: number };
}

interface BudgetItem {
  id?: string;
  name: string;
  model?: string;
  mark?: string;
  quantity: number;
  reported_problem: string;
  diagnosed_problem?: string;
  services: {
    id?: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
}

export const budgetService = {
  async list(page = 1, limit = 10, search = '', filters?: { expiring?: boolean; expired?: boolean }): Promise<ListResponse> {
    const params: any = { page, limit, search };
    if (filters?.expiring) params.expiring = 'true';
    if (filters?.expired) params.expired = 'true';
    const response = await api.get<ApiResponse<{ budgets: BudgetListItem[]; pagination: ListResponse['pagination'] }>>('/api/budgets', { params });
    const data = response.data.data || { budgets: [], pagination: undefined };
    return {
      budgets: data.budgets || [],
      pagination: data.pagination,
    };
  },

  async getById(id: string): Promise<Budget> {
    const response = await api.get<ApiResponse<Budget>>(`/api/budgets/${id}`);
    return response.data.data!;
  },

  async create(data: CreateBudgetData): Promise<Budget> {
    const response = await api.post<ApiResponse<Budget>>('/api/budgets', data);
    return response.data.data!;
  },

  async update(id: string, data: CreateBudgetData): Promise<Budget> {
    const response = await api.put<ApiResponse<Budget>>(`/api/budgets/${id}`, data);
    return response.data.data!;
  },

  async updateStatus(id: string, status: string): Promise<Budget> {
    const response = await api.patch<ApiResponse<Budget>>(`/api/budgets/${id}/status`, { status });
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/budgets/${id}`);
  },

  async getBudgetStatuses(): Promise<BudgetStatus[]> {
    const response = await api.get<ApiResponse<BudgetStatus[]>>('/api/budgets/statuses');
    return response.data.data || [];
  },

  async reenviarExpired(id: string, action: 'REVIEW' | 'RESEND'): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{ message: string }>>(`/api/budgets/${id}/reenviar`, { action });
    return response.data.data!;
  },

  async updateValidUntil(id: string, validUntil: Date): Promise<Budget> {
    const response = await api.patch<ApiResponse<Budget>>(`/api/budgets/${id}/valid-until`, { valid_until: validUntil.toISOString() });
    return response.data.data!;
  },

  async addItem(budgetId: string, item: Omit<BudgetItem, 'id'>): Promise<BudgetItem> {
    const response = await api.post<ApiResponse<BudgetItem>>(`/api/budgets/${budgetId}/items`, item);
    return response.data.data!;
  },

  async updateItem(budgetId: string, itemId: string, item: Partial<BudgetItem>): Promise<BudgetItem> {
    const response = await api.put<ApiResponse<BudgetItem>>(`/api/budgets/${budgetId}/items/${itemId}`, item);
    return response.data.data!;
  },

  async deleteItem(budgetId: string, itemId: string): Promise<void> {
    await api.delete(`/api/budgets/${budgetId}/items/${itemId}`);
  },

  async addService(budgetId: string, itemId: string, service: { name: string; quantity: number; price: number }): Promise<BudgetItem['services'][0]> {
    const response = await api.post<ApiResponse<BudgetItem['services'][0]>>(`/api/budgets/${budgetId}/items/${itemId}/services`, service);
    return response.data.data!;
  },

  async updateService(budgetId: string, itemId: string, serviceId: string, service: Partial<{ name: string; quantity: number; price: number }>): Promise<BudgetItem['services'][0]> {
    const response = await api.put<ApiResponse<BudgetItem['services'][0]>>(`/api/budgets/${budgetId}/items/${itemId}/services/${serviceId}`, service);
    return response.data.data!;
  },

  async deleteService(budgetId: string, itemId: string, serviceId: string): Promise<void> {
    await api.delete(`/api/budgets/${budgetId}/items/${itemId}/services/${serviceId}`);
  },
};