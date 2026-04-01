import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const QUERY_KEYS = {
  budgets: 'budgets',
  budget: 'budget',
  serviceOrders: 'serviceOrders',
  serviceOrder: 'serviceOrder',
  dashboard: 'dashboard',
  urgent: 'urgent',
};

export function useRealTimeSync(enabled = true, intervalMs = 5000) {
  const queryClient = useQueryClient();

  const refreshAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.budgets] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.budget] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.serviceOrders] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.serviceOrder] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dashboard] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.urgent] });
  }, [queryClient]);

  const refreshBudgets = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.budgets] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.budget] });
  }, [queryClient]);

  const refreshServiceOrders = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.serviceOrders] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.serviceOrder] });
  }, [queryClient]);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      refreshAll();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [enabled, intervalMs, refreshAll]);

  return {
    refreshAll,
    refreshBudgets,
    refreshServiceOrders,
  };
}
