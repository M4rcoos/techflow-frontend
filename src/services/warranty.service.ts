import { api } from '../lib/api';

export interface CreateWarrantyData {
  item_ids: string[];
  service_ids: string[];
  days: number;
  terms_text?: string;
}

export interface WarrantyResponse {
  id: string;
  service_order_id: string;
  days: number;
  expires_at: string;
  terms_text: string;
  created_at: string;
  created_by: {
    id: string;
    name: string;
  };
  items: Array<{
    id: string;
    name: string;
    model: string | null;
    mark: string | null;
  }>;
  services: Array<{
    id: string;
    name: string;
    budget_item_name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

export const warrantyService = {
  async create(serviceOrderId: string, data: CreateWarrantyData): Promise<{ data: WarrantyResponse }> {
    const response = await api.post(`/api/warranties/service-orders/${serviceOrderId}/warranty`, data);
    return response.data;
  },

  async getByServiceOrder(serviceOrderId: string): Promise<{ data: WarrantyResponse | null }> {
    const response = await api.get(`/api/warranties/service-orders/${serviceOrderId}/warranty`);
    return response.data;
  },
};
