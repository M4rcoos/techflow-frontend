import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warrantyService } from '../services/warranty.service';
import type { CreateWarrantyData, WarrantyResponse } from '../services/warranty.service';
import { toast } from 'sonner';
import { getToken } from '../lib/api';

export const useWarranty = (serviceOrderId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['warranty', serviceOrderId],
    queryFn: () => warrantyService.getByServiceOrder(serviceOrderId),
    enabled: !!serviceOrderId && !!getToken(),
  });

  return {
    warranty: data?.data as WarrantyResponse | null,
    isLoading,
    error,
    refetch,
  };
};

export const useCreateWarranty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceOrderId, data }: { serviceOrderId: string; data: CreateWarrantyData }) =>
      warrantyService.create(serviceOrderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranty'] });
      queryClient.invalidateQueries({ queryKey: ['serviceOrder'] });
      toast.success('Garantia criada com sucesso!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Erro ao criar garantia';
      toast.error(message);
    },
  });
};
