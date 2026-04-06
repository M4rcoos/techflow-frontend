import { useState, useEffect } from 'react';
import { Plus, Save, X, AlertTriangle, Check, Wrench, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'sonner';

interface Service {
  id?: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface BudgetItem {
  id?: string;
  name: string;
  model?: string;
  mark?: string;
  quantity: number;
  reported_problem: string;
  diagnosed_problem?: string;
  services?: Service[];
}

interface NewService {
  name: string;
  quantity: number;
  price: number;
}

interface BudgetEditFormProps {
  budgetId: string;
  budgetStatus: string;
  initialItems: BudgetItem[];
  onSave: () => void;
  onCancel: () => void;
}

export function BudgetEditForm({ budgetId, initialItems, onSave, onCancel }: BudgetEditFormProps) {
  const [items, setItems] = useState<BudgetItem[]>(initialItems);
  const [isSaving, setIsSaving] = useState(false);
  const [editingDiagnosedId, setEditingDiagnosedId] = useState<string | null>(null);
  const [currentDiagnosed, setCurrentDiagnosed] = useState<string>('');
  const [newServices, setNewServices] = useState<Record<string, NewService>>({});
  const [pendingDiagnoses, setPendingDiagnoses] = useState<Record<string, string>>({});
  
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    if (editingDiagnosedId) {
      const item = items.find(i => i.id === editingDiagnosedId);
      setCurrentDiagnosed(item?.diagnosed_problem || '');
    }
  }, [editingDiagnosedId, items]);

  const refreshItems = async () => {
    const { budgetService } = await import('../../services/budget.service');
    const updated = await budgetService.getById(budgetId);
    setItems((updated.items as BudgetItem[]) || []);
  };

  const addServiceInline = async (itemId: string) => {
    const newSvc = newServices[itemId];
    if (!newSvc?.name?.trim() || !newSvc?.price || newSvc.price <= 0) {
      toast.error('Nome e preço são obrigatórios');
      return;
    }

    setIsSaving(true);
    try {
      const { budgetService } = await import('../../services/budget.service');
      await budgetService.addService(budgetId, itemId, {
        name: newSvc.name,
        quantity: newSvc.quantity || 1,
        price: parseFloat(String(newSvc.price)),
      });

      const diagnosis = pendingDiagnoses[itemId];
      if (diagnosis?.trim()) {
        await budgetService.updateItem(budgetId, itemId, { diagnosed_problem: diagnosis });
      }
      
      await refreshItems();
      setNewServices(prev => ({ ...prev, [itemId]: { name: '', quantity: 1, price: 0 } }));
      setPendingDiagnoses(prev => ({ ...prev, [itemId]: '' }));
      toast.success('Serviço adicionado');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Erro ao adicionar serviço');
    } finally {
      setIsSaving(false);
    }
  };

  const saveDiagnosed = async (itemId: string, text: string) => {
    setIsSaving(true);
    try {
      const { budgetService } = await import('../../services/budget.service');
      await budgetService.updateItem(budgetId, itemId, { diagnosed_problem: text });
      await refreshItems();
      setCurrentDiagnosed('');
      setEditingDiagnosedId(null);
      setPendingDiagnoses(prev => ({ ...prev, [itemId]: text }));
      toast.success('Diagnóstico salvo');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveWithPendingDiagnoses = async () => {
    setIsSaving(true);
    try {
      const { budgetService } = await import('../../services/budget.service');
      
      for (const [itemId, diagnosis] of Object.entries(pendingDiagnoses)) {
        if (diagnosis?.trim()) {
          await budgetService.updateItem(budgetId, itemId, { diagnosed_problem: diagnosis });
        }
      }
      
      for (const [itemId, newSvc] of Object.entries(newServices)) {
        if (newSvc?.name?.trim() && newSvc?.price > 0) {
          await budgetService.addService(budgetId, itemId, {
            name: newSvc.name,
            quantity: newSvc.quantity || 1,
            price: parseFloat(String(newSvc.price)),
          });
          toast.success(`Serviço "${newSvc.name}" adicionado`);
        }
      }
      
      onSave();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteService = async (itemId: string, serviceId: string) => {
    if (!confirm('Deseja excluir este serviço/peça?')) return;
    
    setIsSaving(true);
    try {
      const { budgetService } = await import('../../services/budget.service');
      await budgetService.deleteService(budgetId, itemId, serviceId);
      await refreshItems();
      toast.success('Serviço removido');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Erro ao remover serviço');
    } finally {
      setIsSaving(false);
    }
  };

  const calculateItemTotal = (item: BudgetItem) => {
    if (!item.services) return 0;
    return item.services.reduce((sum, svc) => sum + Number(svc.total || 0), 0);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const itemsWithoutDiagnosis = items.filter(
    item => item.services && item.services.length > 0 && !item.diagnosed_problem && !pendingDiagnoses[item.id || '']
  );

  const hasItemsWithoutDiagnosis = itemsWithoutDiagnosis.length > 0;

  return (
    <Card className="border-purple-200">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <div>
            <h3 className="font-semibold text-lg">Editar Orçamento</h3>
            <p className="text-sm text-muted-foreground">
              Adicione serviços/peças e faça o diagnóstico
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onCancel} disabled={isSaving}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveWithPendingDiagnoses} 
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Tudo
            </Button>
          </div>
        </div>

        {hasItemsWithoutDiagnosis && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="text-sm text-amber-800">
              {itemsWithoutDiagnosis.length} item(s) precisa(m) de diagnóstico antes de enviar o orçamento
            </span>
          </div>
        )}

        <div className="space-y-4">
          {items.map((item) => {
            const isEditingDiagnosed = editingDiagnosedId === item.id;
            const currentDiagnosis = pendingDiagnoses[item.id || ''] || item.diagnosed_problem || '';
            const total = calculateItemTotal(item);

            return (
              <div 
                key={item.id} 
                className="bg-white rounded-lg border p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{item.name}</h4>
                      {!currentDiagnosis && item.services && item.services.length > 0 && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          Precisa diagnóstico
                        </span>
                      )}
                      {currentDiagnosis && item.services && item.services.length > 0 && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Completo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.model && `${item.model} • `}
                      {item.mark && `${item.mark} • `}
                      Qtd: {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-green-600">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                {item.services && item.services.length > 0 && (
                  <div className="mb-4 bg-gray-50 rounded border p-3">
                    <div className="text-xs font-medium text-muted-foreground mb-2">SERVIÇOS/PEÇAS ADICIONADOS:</div>
                    {item.services.map((service) => (
                      <div key={service.id} className="flex justify-between items-center py-2 text-sm border-b border-gray-200 last:border-0">
                        <div className="flex-1">
                          <span className="font-medium">{service.name}</span>
                          <span className="text-muted-foreground ml-2">
                            ({service.quantity}x {formatCurrency(service.price)})
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{formatCurrency(service.total)}</span>
                          <button
                            onClick={() => deleteService(item.id || '', service.id || '')}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            disabled={isSaving}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isEditingDiagnosed ? (
                  <div className="space-y-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div>
                      <label className="text-xs font-medium text-purple-700 block mb-1">
                        DIAGNÓSTICO TÉCNICO
                      </label>
                      <Input
                        placeholder="Descreva o problema identificado no equipamento"
                        value={currentDiagnosed}
                        onChange={(e) => setCurrentDiagnosed(e.target.value)}
                        className="bg-white border-purple-200"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => {
                          if (item.id) {
                            saveDiagnosed(item.id, currentDiagnosed);
                          }
                          setEditingDiagnosedId(null);
                        }}
                      >
                        Salvar Diagnóstico
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingDiagnosedId(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    {currentDiagnosis ? (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-green-50 border border-green-200 rounded text-sm flex-1">
                          <span className="font-medium text-green-800">Diagnóstico: </span>
                          <span className="text-green-700">{currentDiagnosis}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingDiagnosedId(item.id || null)}
                        >
                          <Wrench className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    ) : (
                      <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="text-sm text-amber-800">
                            Este item precisa de um diagnóstico técnico
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-amber-300 text-amber-700 hover:bg-amber-100 flex-shrink-0"
                            onClick={() => setEditingDiagnosedId(item.id || null)}
                          >
                            <Wrench className="w-4 h-4 mr-1" />
                            Adicionar Diagnóstico
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      ADICIONAR SERVIÇO/PEÇA:
                    </div>
                    <span className="text-xs text-muted-foreground">
                      (será salvo ao clicar em "Salvar" abaixo)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="sm:col-span-2">
                      <Input
                        placeholder="Ex: Troca de tela"
                        value={newServices[item.id || '']?.name || ''}
                        onChange={(e) => setNewServices(prev => ({ 
                          ...prev, 
                          [item.id || '']: { ...prev[item.id || ''], name: e.target.value, quantity: 1, price: 0 }
                        }))}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Qtd"
                        min={1}
                        value={newServices[item.id || '']?.quantity || ''}
                        onChange={(e) => setNewServices(prev => ({ 
                          ...prev, 
                          [item.id || '']: { ...prev[item.id || ''] || { name: '', quantity: 1, price: 0 }, quantity: parseInt(e.target.value) || 1 }
                        }))}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Valor R$"
                        value={newServices[item.id || '']?.price || ''}
                        onChange={(e) => setNewServices(prev => ({ 
                          ...prev, 
                          [item.id || '']: { ...prev[item.id || ''] || { name: '', quantity: 1, price: 0 }, price: parseFloat(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => addServiceInline(item.id || '')}
                      disabled={isSaving || !newServices[item.id || '']?.name || !newServices[item.id || '']?.price}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-purple-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-muted-foreground">Total</span>
            <span className="text-2xl font-bold text-green-600">{formatCurrency(calculateTotal())}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BudgetEditForm;
