import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '../../components/ui/button';
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
import { Card, CardContent } from '../../components/ui/card';
import { useBudgets, useClients } from '../../hooks';
import { clientService } from '../../services/client.service';
import { ClientFormModal } from '../client/client-form-modal';
import type { CreateBudgetData, Client } from '../../types';
import { Search, User, Plus, Trash2, HelpCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { addBusinessDays, formatDateToInput } from '../../lib/utils';

interface BudgetItemService {
  name: string;
  quantity: number;
  price: number;
}

interface BudgetItem {
  name: string;
  model: string;
  mark: string;
  quantity: number;
  reported_problem: string;
  services: BudgetItemService[];
}

interface BudgetFormData {
  client_id: string;
  notes?: string;
  valid_until?: string;
  items: BudgetItem[];
}

interface BudgetFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (budgetId: string) => void;
}

export function BudgetFormModal({ open, onOpenChange, onSuccess }: BudgetFormModalProps) {
  const { createBudget, isCreating } = useBudgets();
  const { clients } = useClients();

  const [searchDoc, setSearchDoc] = useState('');
  const [searchingClient, setSearchingClient] = useState(false);
  const [clientFound, setClientFound] = useState<Client | null>(null);
  const [showClientForm, setShowClientForm] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
  } = useForm<BudgetFormData>({
    defaultValues: {
      valid_until: formatDateToInput(addBusinessDays(3)),
      items: [
        {
          name: '',
          model: '',
          mark: '',
          quantity: 1,
          reported_problem: '',
          services: [{ name: '', quantity: 1, price: 0 }],
        },
      ],
    },
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control,
    name: 'items',
  });

  const searchClient = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchDoc.trim()) {
      toast.error('Digite um CPF ou CNPJ');
      return;
    }

    setSearchingClient(true);
    try {
      const data = await clientService.list(1, 1000);
      const cleanDoc = searchDoc.replace(/\D/g, '');
      const found = data.clients.find(
        (c: Client) =>
          c.cpf?.replace(/\D/g, '') === cleanDoc || c.cnpj?.replace(/\D/g, '') === cleanDoc
      );

      if (found) {
        setClientFound(found);
        setValue('client_id', found.id);
        
        if (found.phone) {
          setValue('items.0.reported_problem', `Telefone: ${found.phone}`);
        }
        
        toast.success('Cliente encontrado!');
      } else {
        toast.error('Cliente não encontrado');
        setClientFound(null);
        setShowClientForm(true);
      }
    } catch (error) {
      toast.error('Erro ao buscar cliente');
    } finally {
      setSearchingClient(false);
    }
  };

  const onSubmit = (data: BudgetFormData) => {
    if (!clientFound?.id) {
      toast.error('Selecione um cliente primeiro');
      return;
    }

    const validItems = data.items.filter(
      (item) => item.name && item.reported_problem
    );

    if (validItems.length === 0) {
      toast.error('Adicione pelo menos um item com nome e problema');
      return;
    }

    const payload: CreateBudgetData = {
      client_id: clientFound.id,
      notes: data.notes,
      valid_until: data.valid_until || undefined,
      items: data.items
        .filter((item) => item.name)
        .map((item) => ({
          name: item.name,
          model: item.model || null,
          mark: item.mark || null,
          quantity: item.quantity || 1,
          reported_problem: item.reported_problem,
          services: item.services
            ?.filter((s) => s.name)
            .map((svc) => ({
              name: svc.name,
              quantity: svc.quantity || 1,
              price: svc.price,
            })),
        })),
    };

    createBudget(payload, {
      onSuccess: (data) => {
        reset();
        setClientFound(null);
        setSearchDoc('');
        onOpenChange(false);
        if (onSuccess && data?.id) {
          onSuccess(data.id);
        }
      },
    });
  };

  const handleClose = () => {
    reset();
    setClientFound(null);
    setSearchDoc('');
    onOpenChange(false);
  };

  const handleClientSelect = (clientId: string) => {
    const client = clients.find((c: Client) => c.id === clientId);
    if (client) {
      setClientFound(client);
      setValue('client_id', clientId);
    }
  };

  const handleClientCreated = (newClient: { id: string; client_name?: string; company_name?: string; email?: string; phone?: string }) => {
    setClientFound(newClient as Client);
    setValue('client_id', newClient.id);
    setShowClientForm(false);
    toast.success('Cliente cadastrado! Continue o orçamento.');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose} disableCloseOutside>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </button>
          <DialogHeader>
            <DialogTitle>Novo Orçamento</DialogTitle>
            <DialogDescription>Crie um novo orçamento para um cliente</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Card className="bg-muted">
              <CardContent className="pt-6">
                <Label className="mb-2 block">Buscar Cliente por CPF/CNPJ *</Label>
                <div className="flex gap-2">
                  <Input
                    value={searchDoc}
                    onChange={(e) => setSearchDoc(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchClient(e)}
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                    className="flex-1"
                  />
                  <Button type="button" onClick={() => searchClient()} disabled={searchingClient}>
                    <Search className="w-4 h-4 mr-2" />
                    {searchingClient ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>

                {clientFound && clientFound.id && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-green-900">
                          {clientFound.client_name || clientFound.company_name}
                        </p>
                        <p className="text-sm text-green-700">{clientFound.email}</p>
                        <p className="text-sm text-green-700">{clientFound.phone}</p>
                      </div>
                    </div>
                  </div>
                )}

                {(!clientFound || !clientFound.id) && (
                  <div className="mt-4">
                    <Label className="mb-2 block text-orange-600">Nenhum cliente selecionado</Label>
                    <p className="text-sm text-muted-foreground mb-2">Busque por CPF/CNPJ ou selecione da lista abaixo:</p>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm text-foreground"
                      onChange={(e) => handleClientSelect(e.target.value)}
                      value=""
                    >
                      <option value="" className="text-muted-foreground">Selecione um cliente...</option>
                      {clients.map((client: Client) => (
                        <option key={client.id} value={client.id} className="text-foreground">
                          {client.client_name || client.company_name} - {client.email}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </CardContent>
            </Card>

            {clientFound && clientFound.id && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-lg font-semibold">Equipamentos</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendItem({
                          name: '',
                          model: '',
                          mark: '',
                          quantity: 1,
                          reported_problem: '',
                          services: [{ name: '', quantity: 1, price: 0 }],
                        })
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Equipamento
                    </Button>
                  </div>

                  <div className="space-y-6 max-h-[400px] overflow-y-auto">
                    {itemFields.map((field, itemIndex) => (
                      <div key={field.id} className="p-4 border rounded-lg bg-muted">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium text-sm">Equipamento {itemIndex + 1}</span>
                          {itemFields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(itemIndex)}
                              className="text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="col-span-2">
                            <Label>Equipamento</Label>
                            <Input
                              placeholder="iPhone 15, Notebook Dell, etc"
                              {...register(`items.${itemIndex}.name` as const, { required: 'Nome é obrigatório' })}
                            />
                          </div>
                          <div>
                            <Label>Modelo</Label>
                            <Input
                              placeholder="A15"
                              {...register(`items.${itemIndex}.model` as const)}
                            />
                          </div>
                          <div>
                            <Label>Marca</Label>
                            <Input
                              placeholder="Apple"
                              {...register(`items.${itemIndex}.mark` as const)}
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Problema Relatado</Label>
                            <Input
                              placeholder="Tela quebrada, nãoliga, etc"
                              {...register(`items.${itemIndex}.reported_problem` as const, { required: 'Problema é obrigatório' })}
                            />
                          </div>
                        </div>

                        <div className="border-t pt-3">
                          <p className="text-sm text-muted-foreground">
                            Os serviços e valores serão adicionados após a análise técnica.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="notes">Observações</Label>
                    <textarea
                      id="notes"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                      placeholder="Observações gerais..."
                      {...register('notes')}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Label htmlFor="valid_until">Válido até</Label>
                      <div className="group relative inline-block">
                        <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                          Data limite para entregar o orçamento
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-popover" />
                        </div>
                      </div>
                    </div>
                    <Input id="valid_until" type="date" {...register('valid_until')} />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? 'Salvando...' : 'Criar Orçamento'}
                  </Button>
                </DialogFooter>
              </>
            )}

            {(!clientFound || !clientFound.id) && (
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
              </DialogFooter>
            )}
          </form>
        </DialogContent>
      </Dialog>

      <ClientFormModal
        open={showClientForm}
        onOpenChange={setShowClientForm}
        onSuccess={handleClientCreated}
        prefillDoc={searchDoc}
      />
    </>
  );
}