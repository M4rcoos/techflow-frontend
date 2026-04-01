import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, type UpdateUser } from '../services/user.service';
import { toast } from 'sonner';
import { getToken } from '../lib/api';

export const useUsers = (page = 1, limit = 10) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users', page, limit],
    queryFn: () => userService.list(page, limit),
    enabled: !!getToken(),
  });

  return {
    users: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
  };
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário criado com sucesso!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Erro ao criar usuário';
      toast.error(message);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUser }) => userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário atualizado com sucesso!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Erro ao atualizar usuário';
      toast.error(message);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário excluído com sucesso!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Erro ao excluir usuário';
      toast.error(message);
    },
  });
};
