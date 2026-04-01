import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clientService } from '../services/client.service';
import type { CreateClientData } from '../types';
import { toast } from 'sonner';
import { getToken } from '../lib/api';

export const useClients = (page = 1, limit = 10) => {
  const queryClient = useQueryClient();
  const hasAuth = !!getToken();

  const { data, isLoading } = useQuery({
    queryKey: ['clients', page, limit],
    queryFn: () => clientService.list(page, limit),
    retry: 1,
    enabled: hasAuth,
  });

  const { data: clientTypes } = useQuery({
    queryKey: ['clientTypes'],
    queryFn: () => clientService.getClientTypes(),
    retry: 1,
    enabled: hasAuth,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateClientData) => clientService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Cliente criado com sucesso!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Erro ao criar cliente';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateClientData }) => 
      clientService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client'] });
      toast.success('Cliente atualizado com sucesso!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Erro ao atualizar cliente';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Cliente excluído com sucesso!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Erro ao excluir cliente';
      toast.error(message);
    },
  });

  return {
    clients: data?.clients || [],
    pagination: data?.pagination,
    clientTypes: clientTypes || [],
    isLoading,
    createClient: createMutation.mutate,
    updateClient: updateMutation.mutate,
    deleteClient: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useClient = (id: string | null) => {
  const hasAuth = !!getToken();
  
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => clientService.getById(id!),
    enabled: !!id && hasAuth,
    retry: 1,
  });
};
