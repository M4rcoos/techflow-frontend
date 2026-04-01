import { useEffect, useState } from 'react';
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
import { useBudget, useBudgets } from '../../hooks';
import { Save, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

interface BudgetEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetId: string | null;
  onSuccess?: () => void;
}

interface ItemForm {
  id?: string;
  name: string;
  model: string;
  mark: string;
  quantity: number;
  reported_problem: string;
  diagnosed_problem: string;
  services: {
    id?: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}

interface FormData {
  items: ItemForm[];
}

export function BudgetEditModal({ open, onOpenChange, budgetId, onSuccess }: BudgetEditModalProps) {
  const { data: budget, isLoading } = useBudget(budgetId);
  const { updateBudget } = useBudgets();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, control } = useForm<FormData>();

  const isInAnalysis = budget?.status?.name === 'IN_ANALYSIS';

  const { fields: itemFields, remove: removeItem } = useFieldArray({
    control,
    name: 'items',
  });

  const items = watch('items');

  useEffect(() => {
    if (!open) {
      reset({ items: [] });
    }
  }, [open, reset]);

  useEffect(() => {
    if (budget?.items && budgetId) {
      reset({
        items: budget.items.map((item) => ({
          id: item.id,
          name: item.name || '',
          model: item.model || '',
          mark: item.mark || '',
          quantity: item.quantity || 1,
          reported_problem: item.reported_problem || '',
          diagnosed_problem: item.diagnosed_problem || '',
          services: item.services?.map((s) => ({
            id: s.id,
            name: s.name || '',
            quantity: s.quantity || 1,
            price: Number(s.price) || 0,
          })) || [],
        })),
      });
    }
  }, [budget, budgetId, reset]);

  const onSubmit = async (data: FormData) => {
    if (!budgetId) return;
    
    setSaving(true);
    try {
      const itemsData = data.items.map((item) => ({
        name: item.name,
        model: item.model || null,
        mark: item.mark || null,
        quantity: item.quantity || 1,
        reported_problem: item.reported_problem,
        diagnosed_problem: isInAnalysis ? item.diagnosed_problem : null,
        services: item.services?.map((svc) => ({
          name: svc.name,
          quantity: svc.quantity || 1,
          price: svc.price,
        })) || [],
      }));

      await new Promise<void>((resolve, reject) => {
        updateBudget({
          id: budgetId,
          data: {
            client_id: budget!.client_id,
            items: itemsData,
          },
        }, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Erro ao salvar orçamento');
    } finally {
      setSaving(false);
    }
  };

  const addService = (itemIndex: number) => {
    const currentServices = items[itemIndex]?.services || [];
    setValue(`items.${itemIndex}.services`, [...currentServices, { name: '', quantity: 1, price: 0 }]);
  };

  const removeService = (itemIndex: number, serviceIndex: number) => {
    const currentServices = items[itemIndex]?.services || [];
    if (currentServices.length > 1) {
      const newServices = currentServices.filter((_: unknown, i: number) => i !== serviceIndex);
      setValue(`items.${itemIndex}.services`, newServices);
    }
  };

  const calculateItemTotal = (services: { quantity: number; price: number }[]) => {
    return services.reduce((sum, svc) => sum + (svc.quantity || 0) * (svc.price || 0), 0);
  };

  const calculateTotal = () => {
    if (!items) return 0;
    return items.reduce((sum, item) => sum + calculateItemTotal(item.services || []), 0);
  };

  if (!budget) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </button>
        <DialogHeader>
          <DialogTitle>
            {isInAnalysis ? 'Adicionar Valores e Diagnóstico' : `Editar Orçamento - ${budget.code}`}
          </DialogTitle>
          <DialogDescription>
            {isInAnalysis 
              ? 'Preencha o preço e o problema encontrado para cada item antes de enviar ao cliente.'
              : 'Atualize as informações do orçamento.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="col-span-1 sm:col-span-2">
                    <Label>Equipamento</Label>
                    <Input
                      placeholder="iPhone 15, Notebook, etc"
                      {...register(`items.${itemIndex}.name` as const)}
                      disabled={isInAnalysis}
                    />
                  </div>
                  <div>
                    <Label>Modelo</Label>
                    <Input
                      placeholder="A15"
                      {...register(`items.${itemIndex}.model` as const)}
                      disabled={isInAnalysis}
                    />
                  </div>
                  <div>
                    <Label>Marca</Label>
                    <Input
                      placeholder="Apple"
                      {...register(`items.${itemIndex}.mark` as const)}
                      disabled={isInAnalysis}
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <Label>Problema Relatado</Label>
                    <Input
                      placeholder="Tela quebrada"
                      {...register(`items.${itemIndex}.reported_problem` as const)}
                      disabled={isInAnalysis}
                    />
                  </div>
                  {isInAnalysis && (
                    <div className="col-span-1 sm:col-span-2">
                      <Label>Problema Encontrado (Diagnóstico)</Label>
                      <Input
                        placeholder="Tela trincada, necessidade de troca"
                        {...register(`items.${itemIndex}.diagnosed_problem` as const)}
                        required={isInAnalysis}
                      />
                    </div>
                  )}
                </div>

                <div className="border-t pt-3">
                  {isInAnalysis ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium">Serviços/Peças</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addService(itemIndex)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          <span className="text-xs">Adicionar</span>
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {items[itemIndex]?.services?.map((_: unknown, svcIndex: number) => (
                          <div key={svcIndex} className="flex gap-2 items-end flex-wrap sm:flex-nowrap">
                            <div className="flex-1 min-w-[120px]">
                              <Input
                                placeholder="Serviço ou peça"
                                {...register(`items.${itemIndex}.services.${svcIndex}.name` as const)}
                                required={isInAnalysis}
                              />
                            </div>
                            <div className="w-14 sm:w-16">
                              <Input
                                type="number"
                                min={1}
                                placeholder="Qtd"
                                {...register(`items.${itemIndex}.services.${svcIndex}.quantity` as const, { valueAsNumber: true })}
                              />
                            </div>
                            <div className="w-20 sm:w-24">
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="R$ 0,00"
                                {...register(`items.${itemIndex}.services.${svcIndex}.price` as const)}
                                required={isInAnalysis}
                              />
                            </div>
                            {(items[itemIndex]?.services?.length ?? 0) > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeService(itemIndex, svcIndex)}
                                className="text-red-500 p-1 flex-shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Adicione os serviços e peças ao enviar para análise
                    </p>
                  )}
                  
                  <div className="mt-2 text-right">
                    <span className="text-sm font-medium">
                      Total: R$ {calculateItemTotal(items[itemIndex]?.services || []).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-3xl font-bold text-primary">
                  R$ {calculateTotal().toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
