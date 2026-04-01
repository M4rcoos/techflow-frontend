import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { budgetService } from '../services/budget.service';
import type { CreateBudgetData } from '../types';
import { toast } from 'sonner';
import { getToken } from '../lib/api';

export const useBudgets = (page = 1, limit = 10, search = '', filters?: { expiring?: boolean; expired?: boolean }) => {
  const queryClient = useQueryClient();
  const hasAuth = !!getToken();

  const { data, isLoading } = useQuery({
    queryKey: ['budgets', page, limit, search, filters],
    queryFn: () => budgetService.list(page, limit, search, filters),
    retry: 1,
    enabled: hasAuth,
  });

  const { data: budgetStatuses } = useQuery({
    queryKey: ['budgetStatuses'],
    queryFn: () => budgetService.getBudgetStatuses(),
    retry: 1,
    enabled: hasAuth,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateBudgetData) => budgetService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['urgent'] });
      toast.success('Orçamento criado com sucesso! Email enviado ao cliente.');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Erro ao criar orçamento';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateBudgetData }) =>
      budgetService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['urgent'] });
      toast.success('Orçamento atualizado com sucesso!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Erro ao atualizar orçamento';
      toast.error(message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      budgetService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
      queryClient.invalidateQueries({ queryKey: ['serviceOrder'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['urgent'] });
      toast.success('Status atualizado com sucesso!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string; error?: string } } };
      const message = err.response?.data?.message || err.response?.data?.error || 'Erro ao atualizar status';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => budgetService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['urgent'] });
      toast.success('Orçamento excluído com sucesso!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Erro ao excluir orçamento';
      toast.error(message);
    },
  });

  return {
    budgets: data?.budgets || [],
    pagination: data?.pagination,
    budgetStatuses: budgetStatuses || [],
    isLoading,
    createBudget: createMutation.mutate,
    updateBudget: updateMutation.mutate,
    updateBudgetStatus: updateStatusMutation.mutate,
    deleteBudget: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useBudget = (id: string | null) => {
  const hasAuth = !!getToken();
  
  return useQuery({
    queryKey: ['budget', id],
    queryFn: () => budgetService.getById(id!),
    enabled: !!id && hasAuth,
    retry: 1,
  });
};
