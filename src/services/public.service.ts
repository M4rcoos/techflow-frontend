import { api } from '../lib/api';

export interface PublicServiceOrder {
  type: 'budget' | 'service_order';
  code: string;
  status: string;
  budget_status: string;
  client: {
    name: string;
    email: string;
    phone: string;
  };
  owner: {
    company_name: string;
    phone?: string;
    email?: string;
    cnpj?: string;
    address?: {
      street: string;
      number: number;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zip_code: string;
    };
  };
  budget?: {
    items: Array<{
      name: string;
      model?: string;
      mark?: string;
      quantity: number;
      price: number;
      total: number;
      reported_problem: string;
      diagnosed_problem?: string;
      service_performed?: string;
      services: Array<{
        name: string;
        quantity: number;
        price: number;
        total: number;
      }>;
    }>;
    total: number;
  };
  items?: Array<{
    name: string;
    model?: string;
    mark?: string;
    quantity: number;
    price: number;
    total: number;
    reported_problem: string;
    diagnosed_problem?: string;
    service_performed?: string;
    services: Array<{
      name: string;
      quantity: number;
      price: number;
      total: number;
    }>;
  }>;
  total?: number;
  serviceOrder?: {
    final_amount: number;
    discount: number;
    observation?: string;
    created_at: string;
    delivered_at?: string;
  };
  notes?: string;
  valid_until?: string;
  created_at: string;
  timeline?: Array<{
    status: string;
    date: Date;
    description: string;
  }>;
}

export const publicService = {
  async getServiceOrder(token: string): Promise<PublicServiceOrder> {
    const response = await api.get<{ data: PublicServiceOrder }>('/api/public/service-orders', {
      params: { token },
    });
    return response.data.data;
  },

  async approveBudget(token: string): Promise<void> {
    await api.post('/api/public/service-orders/approve', { token });
  },

  async rejectBudget(token: string, reason?: string): Promise<void> {
    await api.post('/api/public/service-orders/reject', { token, reason });
  },
};
