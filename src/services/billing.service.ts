import { api } from '../lib/api';
import type { Plan, BillingInfo } from '../types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface CheckoutResult {
  checkoutId: string;
  type: 'PIX' | 'CHECKOUT' | 'DEMO';
  status?: string;
  url?: string | null;
  amount?: number;
  brCode?: string;
  brCodeBase64?: string;
  expiresAt?: string;
  message?: string;
  subscription?: any;
}

export interface PixStatus {
  id: string;
  status: 'PENDING' | 'EXPIRED' | 'CANCELLED' | 'PAID' | 'UNDER_DISPUTE' | 'REFUNDED' | 'REDEEMED' | 'APPROVED' | 'FAILED';
  amount: number;
  expiresAt?: string;
}

export const billingService = {
  async getBillingInfo(): Promise<BillingInfo> {
    const response = await api.get<ApiResponse<BillingInfo>>('/api/billing/info');
    return response.data.data;
  },

  async getPlans(): Promise<Plan[]> {
    const response = await api.get<ApiResponse<Plan[]>>('/api/billing/plans');
    return response.data.data;
  },

  async activateSubscription(planId: string): Promise<{ checkoutUrl?: string }> {
    const response = await api.post<ApiResponse<{ checkoutUrl?: string }>>('/api/billing/activate', {
      plan_id: planId,
    });
    return response.data.data;
  },

  async cancelSubscription(): Promise<void> {
    await api.post('/api/billing/cancel');
  },

  async checkLimit(type: 'BUDGET' | 'OS' | 'EMPLOYEE'): Promise<{
    allowed: boolean;
    current?: number;
    limit?: number;
    message?: string;
  }> {
    const response = await api.get<ApiResponse<{
      allowed: boolean;
      current?: number;
      limit?: number;
      message?: string;
    }>>('/api/billing/check-limit', {
      params: { type },
    });
    return response.data.data;
  },

  async createCheckout(planId: string, method?: 'PIX' | 'CARD'): Promise<CheckoutResult> {
    const response = await api.post<ApiResponse<CheckoutResult>>('/api/billing/checkout', {
      plan_id: planId,
      method: method || 'CARD',
    });
    return response.data.data;
  },

  async createPix(planId: string): Promise<CheckoutResult> {
    const response = await api.post<ApiResponse<CheckoutResult>>('/api/billing/checkout/pix', {
      plan_id: planId,
    });
    return response.data.data;
  },

  async getCheckoutStatus(checkoutId: string): Promise<{
    id: string;
    status: string;
    amount: number;
    paidAmount: number | null;
    url: string | null;
  }> {
    const response = await api.get<ApiResponse<{
      id: string;
      status: string;
      amount: number;
      paidAmount: number | null;
      url: string | null;
    }>>(`/api/billing/checkout/${checkoutId}/status`);
    return response.data.data;
  },

  async getPixStatus(pixId: string): Promise<PixStatus> {
    const response = await api.get<ApiResponse<PixStatus>>(`/api/billing/pix/${pixId}/status`);
    return response.data.data;
  },
};
