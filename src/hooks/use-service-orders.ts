import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceOrderService } from '../services/service-order.service';
import { toast } from 'sonner';
import { getToken } from '../lib/api';

export const useServiceOrders = (page = 1, limit = 10, status?: string, search?: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['serviceOrders', page, limit, status, search],
    queryFn: () => serviceOrderService.list(page, limit, status, search),
    enabled: !!getToken(),
    staleTime: 1000 * 30,
  });

  return {
    serviceOrders: data?.serviceOrders || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
};

export const useServiceOrder = (id: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['serviceOrder', id],
    queryFn: () => serviceOrderService.getById(id),
    enabled: !!id && !!getToken(),
  });

  return {
    serviceOrder: data,
    isLoading,
    error,
    refetch,
  };
};

interface UpdateServiceOrderData {
  status: string;
  final_amount?: number;
  discount?: number;
  discount_type?: 'PERCENTAGE' | 'FIXED';
  paid_amount?: number;
  payment_type?: 'CASH' | 'PIX' | 'CREDIT' | 'DEBIT' | 'BANK_SLIP';
  paid_at?: string;
  delivered_at?: string;
}

export const useUpdateServiceOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceOrderData }) => 
      serviceOrderService.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
      queryClient.invalidateQueries({ queryKey: ['serviceOrder'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['payment-stats'] });
      queryClient.invalidateQueries({ queryKey: ['urgent'] });
      toast.success('Status atualizado com sucesso!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Erro ao atualizar status';
      toast.error(message);
    },
  });
};

export const useUpdateServiceOrderObservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, observation }: { id: string; observation: string }) => 
      serviceOrderService.updateObservation(id, observation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
      queryClient.invalidateQueries({ queryKey: ['serviceOrder'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Observação atualizada com sucesso!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Erro ao atualizar observação';
      toast.error(message);
    },
  });
};

interface RegisterPaymentData {
  final_amount: number;
  discount?: number;
  discount_type?: 'PERCENTAGE' | 'FIXED';
  paid_amount: number;
  payment_type: 'CASH' | 'PIX' | 'CREDIT' | 'DEBIT' | 'BANK_SLIP';
}

export const useRegisterPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RegisterPaymentData }) => 
      serviceOrderService.registerPayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
      queryClient.invalidateQueries({ queryKey: ['serviceOrder'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['payment-stats'] });
      queryClient.invalidateQueries({ queryKey: ['urgent'] });
      toast.success('Pagamento registrado com sucesso!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Erro ao registrar pagamento';
      toast.error(message);
    },
  });
};

export const useUpdateServiceOrderDeliveryDate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, delivery_date }: { id: string; delivery_date: string }) => 
      serviceOrderService.updateDeliveryDate(id, delivery_date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
      queryClient.invalidateQueries({ queryKey: ['serviceOrder'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['urgent'] });
      toast.success('Data de entrega atualizada com sucesso!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Erro ao atualizar data de entrega';
      toast.error(message);
    },
  });
};
