import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const QUERY_KEYS = {
  dashboard: ['dashboard'] as const,
  paymentStats: ['payment-stats'] as const,
  urgent: ['urgent'] as const,
  budgets: ['budgets'] as const,
  budget: ['budget'] as const,
  serviceOrders: ['serviceOrders'] as const,
  serviceOrder: ['serviceOrder'] as const,
  clients: ['clients'] as const,
  client: ['client'] as const,
} as const;

export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  const invalidateDashboard = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.paymentStats });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.urgent });
  }, [queryClient]);

  const invalidateServiceOrders = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.serviceOrders });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.serviceOrder });
  }, [queryClient]);

  const invalidateBudgets = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.budgets });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.budget });
  }, [queryClient]);

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  return {
    invalidateDashboard,
    invalidateServiceOrders,
    invalidateBudgets,
    invalidateAll,
    queryClient,
  };
}
