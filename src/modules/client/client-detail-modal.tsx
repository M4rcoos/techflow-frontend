import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { useClient, useClients } from '../../hooks';
import { useRoleAccess } from '../../hooks/use-role-access';
import { useCep } from '../../hooks/use-cep';
import { X, Pencil, Loader2 } from 'lucide-react';
import type { CreateClientData } from '../../types';
import { formatCPF, formatCNPJ, validateCPF, validateCNPJ } from '../../lib/validators';

interface ClientDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string | null;
}

interface FormData {
  client_name: string;
  company_name: string;
  email: string;
  phone: string;
  cpf: string;
  cnpj: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
}

export function ClientDetailModal({ open, onOpenChange, clientId }: ClientDetailModalProps) {
  const { data: client, isLoading, refetch } = useClient(clientId);
  const { deleteClient, isDeleting, updateClient } = useClients();
  const { canDelete, canEditClient } = useRoleAccess();
  const [isEditing, setIsEditing] = useState(false);
  const [cpfError, setCpfError] = useState('');
  const [cnpjError, setCnpjError] = useState('');

  const { searchCep, isLoading: isCepLoading } = useCep();
  const { register, handleSubmit, reset, watch, setValue } = useForm<FormData>();

  useEffect(() => {
    if (open) {
      setIsEditing(false);
      setCpfError('');
      setCnpjError('');
    }
  }, [open]);

  useEffect(() => {
    setCpfError('');
    setCnpjError('');
    if (isEditing && client) {
      reset({
        client_name: client.client_name || '',
        company_name: client.company_name || '',
        email: client.email || '',
        phone: client.phone || '',
        cpf: client.cpf || '',
        cnpj: client.cnpj || '',
        street: client.address?.street || '',
        number: client.address?.number?.toString() || '',
        neighborhood: client.address?.neighborhood || '',
        city: client.address?.city || '',
        state: client.address?.state || '',
        cep: client.address?.cep || '',
      });
    }
  }, [isEditing, client, reset]);

  const handleCepBlur = async () => {
    const cep = watch('cep');
    if (cep) {
      const result = await searchCep(cep);
      if (result) {
        setValue('street', result.logradouro);
        setValue('neighborhood', result.bairro);
        setValue('city', result.cidade);
        setValue('state', result.uf);
      }
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setValue('cpf', formatted);
    if (cpfError) setCpfError('');
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setValue('cnpj', formatted);
    if (cnpjError) setCnpjError('');
  };

  const handleDelete = () => {
    if (clientId && confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteClient(clientId, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    }
  };

  const onSubmit = (data: FormData) => {
    if (!clientId) return;

    const isPessoaFisica = client?.client_type?.name?.toLowerCase().includes('física') || client?.client_type?.name?.toLowerCase().includes('fisica');
    const cpfDigits = data.cpf.replace(/\D/g, '');
    const cnpjDigits = data.cnpj.replace(/\D/g, '');

    if (isPessoaFisica) {
      if (cpfDigits.length > 0 && cpfDigits.length < 11) {
        setCpfError('CPF deve ter 11 dígitos');
        return;
      }
      if (cpfDigits.length > 0 && !validateCPF(data.cpf)) {
        setCpfError('CPF inválido');
        return;
      }
    } else {
      if (cnpjDigits.length > 0 && cnpjDigits.length < 14) {
        setCnpjError('CNPJ deve ter 14 dígitos');
        return;
      }
      if (cnpjDigits.length > 0 && !validateCNPJ(data.cnpj)) {
        setCnpjError('CNPJ inválido');
        return;
      }
    }

    const payload: CreateClientData = {
      client_type_id: client?.client_type_id || '',
      client_name: data.client_name,
      company_name: data.company_name,
      email: data.email,
      phone: data.phone,
      cpf: isPessoaFisica ? (cpfDigits.length > 0 ? data.cpf : undefined) : undefined,
      cnpj: !isPessoaFisica ? (cnpjDigits.length > 0 ? data.cnpj : undefined) : undefined,
      address: {
        street: data.street,
        number: parseInt(data.number) || 0,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        cep: data.cep,
      },
    };

    updateClient({ id: clientId, data: payload }, {
      onSuccess: () => {
        setIsEditing(false);
        refetch();
      },
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCpfError('');
    setCnpjError('');
  };

  const isPessoaFisica = client?.client_type?.name?.toLowerCase().includes('física') || client?.client_type?.name?.toLowerCase().includes('fisica');

  if (isEditing) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>Atualize os dados do cliente</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="client_name">Nome</Label>
                <Input {...register('client_name')} placeholder="Nome completo" />
              </div>
              <div className="col-span-2">
                <Label htmlFor="company_name">Nome da Empresa</Label>
                <Input {...register('company_name')} placeholder="Nome da empresa (opcional)" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input {...register('email')} type="email" placeholder="email@exemplo.com" />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input {...register('phone')} placeholder="(11) 99999-9999" />
              </div>
              {isPessoaFisica ? (
                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input 
                    {...register('cpf')} 
                    placeholder="000.000.000-00"
                    onChange={handleCpfChange}
                    maxLength={14}
                  />
                  {cpfError && <p className="text-xs text-red-500 mt-1">{cpfError}</p>}
                </div>
              ) : (
                <div>
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input 
                    {...register('cnpj')} 
                    placeholder="00.000.000/0001-00"
                    onChange={handleCnpjChange}
                    maxLength={18}
                  />
                  {cnpjError && <p className="text-xs text-red-500 mt-1">{cnpjError}</p>}
                </div>
              )}
              <div>
                <Label htmlFor="cep">CEP</Label>
                <div className="flex gap-2">
                  <Input {...register('cep')} placeholder="00000-000" className="flex-1" onBlur={handleCepBlur} />
                  {isCepLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                </div>
              </div>
              <div>
                <Label htmlFor="street">Rua</Label>
                <Input {...register('street')} placeholder="Rua" />
              </div>
              <div>
                <Label htmlFor="number">Número</Label>
                <Input {...register('number')} placeholder="123" />
              </div>
              <div>
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input {...register('neighborhood')} placeholder="Bairro" />
              </div>
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input {...register('city')} placeholder="Cidade" />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input {...register('state')} placeholder="SP" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancelEdit}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!!cpfError || !!cnpjError}>
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </button>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Detalhes do Cliente</DialogTitle>
            {canEditClient && (
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                <Pencil className="w-4 h-4 mr-1" />
                Editar
              </Button>
            )}
          </div>
          <DialogDescription>Informações completas do cliente</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center">Carregando...</div>
        ) : client ? (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {client.client_name || client.company_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span>{client.client_type?.name}</span>
                </div>
                {client.email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Telefone:</span>
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.cpf && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CPF:</span>
                    <span>{client.cpf}</span>
                  </div>
                )}
                {client.cnpj && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CNPJ:</span>
                    <span>{client.cnpj}</span>
                  </div>
                )}
                {client.address && (
                  <>
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-1">Endereço</p>
                      <p className="text-sm text-muted-foreground">
                        {client.address.street}, {client.address.number}
                        <br />
                        {client.address.neighborhood}
                        <br />
                        {client.address.city} - {client.address.state}
                        <br />
                        CEP: {client.address.cep}
                      </p>
                    </div>
                  </>
                )}
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">Criado em:</span>
                  <span>{new Date(client.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              {canDelete && (
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Excluindo...' : 'Excluir'}
                </Button>
              )}
            </DialogFooter>
          </div>
        ) : (
          <div className="py-8 text-center">Cliente não encontrado</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
