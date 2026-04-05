import { api } from '../lib/api';

export type UrgencyStatus = 'EXPIRED' | 'DUE_TODAY' | 'NONE';
export type ItemType = 'BUDGET' | 'SERVICE_ORDER';

export interface UrgentItem {
  id: string;
  code: string;
  client: string;
  status: string;
  type: ItemType;
  urgencyStatus: UrgencyStatus;
  dueDate: string | null;
  total?: number;
}

export interface UrgentData {
  budgets: UrgentItem[];
  serviceOrders: UrgentItem[];
  counts: {
    totalExpired: number;
    totalDueToday: number;
  };
}

export interface DashboardData {
  totalClients: number;
  totalBudgets: number;
  budgetsDraft: number;
  budgetsInAnalysis: number;
  budgetsAwaitingApproval: number;
  budgetsExpiringToday: number;
  budgetsApproved: number;
  budgetsRejected: number;
  urgentBudgets: number;
  totalRevenue: number;
  paymentMethods: Record<string, number>;
  serviceOrdersByStatus: Record<string, number>;
  latestBudgets: Array<{
    id: string;
    code: string;
    client: { name: string };
    status: string;
    total: number;
    validUntil: string | null;
    createdAt: string;
    createdBy: string | undefined;
  }>;
}

export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
}

export interface PaymentStats {
  payment_type: string;
  total_amount: number;
  count: number;
}

export const dashboardService = {
  async getDashboard(filters?: DashboardFilters): Promise<DashboardData> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const response = await api.get('/api/dashboard', { 
      params: Object.fromEntries(params)
    });
    return response.data.data;
  },

  async getUrgent(filter?: 'expired' | 'due_today'): Promise<UrgentData> {
    const params = new URLSearchParams();
    if (filter) params.append('filter', filter);
    
    const response = await api.get('/api/dashboard/urgent', { 
      params: Object.fromEntries(params)
    });
    return response.data.data;
  },

  async getPaymentStats(filters?: DashboardFilters): Promise<PaymentStats[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const response = await api.get('/api/service-orders/payment-stats', { 
      params: Object.fromEntries(params)
    });
    return response.data.data;
  },
};
