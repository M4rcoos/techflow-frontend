import { api } from '../lib/api';

export interface ServiceOrder {
  id: string;
  code: string;
  budget: {
    id: string;
    code: string;
    total: number;
    public_token?: string;
    items: Array<{
      id: string;
      name: string;
      model?: string | null;
      mark?: string | null;
      services: Array<{
        id: string;
        name: string;
        quantity: number;
        price: number;
        total: number;
      }>;
    }>;
    client?: {
      id: string;
      client_name: string;
      company_name: string;
      phone?: string;
      email?: string;
      address?: {
        street?: string;
        number?: number;
        neighborhood?: string;
        city?: string;
        state?: string;
        cep?: string;
      } | null;
    };
  };
  status: {
    id: string;
    name: string;
  };
  owner?: {
    company_name: string;
    cnpj?: string | null;
    phone?: string;
    email?: string;
    address?: {
      street?: string;
      number?: number;
      neighborhood?: string;
      city?: string;
      state?: string;
      cep?: string;
    } | null;
  };
  observation?: string;
  final_amount?: number;
  discount?: number;
  discount_type?: 'PERCENTAGE' | 'FIXED';
  paid_amount?: number;
  payment_type?: 'CASH' | 'PIX' | 'CREDIT' | 'DEBIT' | 'BANK_SLIP';
  paid_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

interface ListResponse {
  serviceOrders: ServiceOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const serviceOrderService = {
  async list(page = 1, limit = 10, status?: string, search?: string): Promise<ListResponse> {
    const params: any = { page, limit };
    if (status) params.status = status;
    if (search) params.search = search;
    
    const response = await api.get('/api/service-orders', { params });
    return {
      serviceOrders: response.data.data?.serviceOrders || [],
      pagination: response.data.data?.pagination || { page, limit, total: 0, pages: 0 },
    };
  },

  async getById(id: string): Promise<ServiceOrder> {
    const response = await api.get(`/api/service-orders/${id}`);
    return response.data.data;
  },

  async updateStatus(id: string, data: {
    status: string;
    final_amount?: number;
    discount?: number;
    discount_type?: 'PERCENTAGE' | 'FIXED';
    paid_amount?: number;
    payment_type?: 'CASH' | 'PIX' | 'CREDIT' | 'DEBIT' | 'BANK_SLIP';
    paid_at?: string;
    delivered_at?: string;
  }): Promise<ServiceOrder> {
    const response = await api.patch(`/api/service-orders/${id}/status`, data);
    return response.data.data;
  },

  async updateObservation(id: string, observation: string): Promise<ServiceOrder> {
    const response = await api.patch(`/api/service-orders/${id}/observation`, { observation });
    return response.data.data;
  },

  async registerPayment(id: string, data: {
    final_amount: number;
    discount?: number;
    discount_type?: 'PERCENTAGE' | 'FIXED';
    paid_amount: number;
    payment_type: 'CASH' | 'PIX' | 'CREDIT' | 'DEBIT' | 'BANK_SLIP';
  }): Promise<ServiceOrder> {
    const response = await api.post(`/api/service-orders/${id}/payment`, data);
    return response.data.data;
  },
};
