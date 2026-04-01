import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { dashboardService, type DashboardData, type DashboardFilters, type PaymentStats } from '../services/dashboard.service';
import { getToken } from '../lib/api';

const REFETCH_INTERVAL = 30000;

export const useDashboard = (filters?: DashboardFilters) => {
  const previousDataRef = useRef<DashboardData | null>(null);
  
  const { data, isLoading, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['dashboard', filters],
    queryFn: () => dashboardService.getDashboard(filters),
    enabled: !!getToken(),
    refetchInterval: REFETCH_INTERVAL,
    staleTime: 5000,
  });

  useEffect(() => {
    if (data && previousDataRef.current) {
      const prev = previousDataRef.current;
      
      if (prev.totalBudgets !== data.totalBudgets) {
        const diff = data.totalBudgets - prev.totalBudgets;
        if (diff > 0) {
          toast.success(`${diff} novo${diff > 1 ? 's' : ''} orçament${diff > 1 ? 'os' : 'o'} criado${diff > 1 ? 's' : ''}!`, {
            duration: 4000,
          });
        }
      }
      
      if (prev.budgetsExpiringToday !== data.budgetsExpiringToday) {
        if (data.budgetsExpiringToday > prev.budgetsExpiringToday!) {
          toast.warning(`${data.budgetsExpiringToday - prev.budgetsExpiringToday} orçamento(s) vencendo hoje!`, {
            duration: 5000,
          });
        }
      }
      
      if (prev.budgetsApproved !== data.budgetsApproved) {
        const diff = data.budgetsApproved - prev.budgetsApproved;
        if (diff > 0) {
          toast.success(`${diff} orçament${diff > 1 ? 'os' : 'o'} aprovado${diff > 1 ? 's' : ''}!`, {
            duration: 4000,
          });
        }
      }
      
      if (prev.budgetsRejected !== data.budgetsRejected) {
        const diff = data.budgetsRejected - prev.budgetsRejected;
        if (diff > 0) {
          toast.error(`${diff} orçament${diff > 1 ? 'os' : 'o'} rejeitado${diff > 1 ? 's' : ''}!`, {
            duration: 4000,
          });
        }
      }
    }
    
    previousDataRef.current = data || null;
  }, [data, dataUpdatedAt]);

  return {
    dashboard: data,
    isLoading,
    error,
    refetch,
  };
};

export const useInvalidateDashboard = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };
};

export const useUrgent = (filter?: 'expired' | 'due_today') => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['urgent', filter],
    queryFn: () => dashboardService.getUrgent(filter),
    enabled: !!getToken(),
    staleTime: 5000,
  });

  return {
    urgent: data,
    isLoading,
    refetch,
  };
};

export const usePaymentStats = (filters?: DashboardFilters) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['payment-stats', filters],
    queryFn: () => dashboardService.getPaymentStats(filters),
    enabled: !!getToken(),
    staleTime: 5000,
  });

  return {
    paymentStats: data as PaymentStats[] | undefined,
    isLoading,
    error,
    refetch,
  };
};
