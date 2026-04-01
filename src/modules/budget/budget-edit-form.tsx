import { useState, useEffect } from 'react';
import { Plus, Save, X, AlertTriangle, Check, Wrench } from 'lucide-react';
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
  const [addingServiceId, setAddingServiceId] = useState<string | null>(null);
  const [currentDiagnosed, setCurrentDiagnosed] = useState<string>('');
  
  const [newService, setNewService] = useState({
    name: '',
    quantity: 1,
    price: 0,
    diagnosed_problem: '',
  });

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    if (editingDiagnosedId) {
      const item = items.find(i => i.id === editingDiagnosedId);
      setCurrentDiagnosed(item?.diagnosed_problem || '');
    }
  }, [editingDiagnosedId, items]);

  useEffect(() => {
    if (addingServiceId) {
      const item = items.find(i => i.id === addingServiceId);
      setCurrentDiagnosed(item?.diagnosed_problem || '');
      setNewService(prev => ({
        ...prev,
        diagnosed_problem: item?.diagnosed_problem || ''
      }));
    }
  }, [addingServiceId, items]);

  const refreshItems = async () => {
    const { budgetService } = await import('../../services/budget.service');
    const updated = await budgetService.getById(budgetId);
    setItems((updated.items as BudgetItem[]) || []);
  };

  const addService = async (itemId: string) => {
    if (!newService.name || !newService.price || newService.price <= 0) {
      toast.error('Nome e preço são obrigatórios');
      return;
    }

    setIsSaving(true);
    try {
      const { budgetService } = await import('../../services/budget.service');
      const price = parseFloat(String(newService.price));
      await budgetService.addService(budgetId, itemId, {
        name: newService.name,
        quantity: newService.quantity || 1,
        price: price,
      });

      if (currentDiagnosed.trim()) {
        await budgetService.updateItem(budgetId, itemId, {
          diagnosed_problem: currentDiagnosed
        });
      }
      
      await refreshItems();
      
      setNewService({ name: '', quantity: 1, price: 0, diagnosed_problem: '' });
      setCurrentDiagnosed('');
      setAddingServiceId(itemId);
      toast.success('Serviço adicionado');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Erro ao adicionar serviço');
    } finally {
      setIsSaving(false);
    }
  };

  const saveDiagnosed = async (itemId: string, text: string) => {
    if (!text.trim()) return;

    setIsSaving(true);
    try {
      const { budgetService } = await import('../../services/budget.service');
      await budgetService.updateItem(budgetId, itemId, { diagnosed_problem: text });
      await refreshItems();
      setCurrentDiagnosed('');
      setEditingDiagnosedId(null);
      setAddingServiceId(null);
      toast.success('Diagnóstico salvo');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Erro ao salvar');
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

  const hasItemsWithoutDiagnosis = items.some(
    item => item.services && item.services.length > 0 && !item.diagnosed_problem
  );

  return (
    <Card className="border-purple-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-semibold text-lg">Editar Orçamento</h3>
            <p className="text-sm text-muted-foreground">
              Adicione serviços/peças e faça o diagnóstico
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} disabled={isSaving}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={onSave} 
              disabled={isSaving || hasItemsWithoutDiagnosis}
              className={hasItemsWithoutDiagnosis ? 'opacity-50' : ''}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>

        {hasItemsWithoutDiagnosis && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="text-sm text-amber-800">
              Preencha o diagnóstico (campo obrigatório) em todos os itens com serviço antes de salvar
            </span>
          </div>
        )}

        <div className="space-y-4">
          {items.map((item) => {
            const needsDiagnosis = item.services && item.services.length > 0 && !item.diagnosed_problem;
            const isEditingDiagnosed = editingDiagnosedId === item.id;
            const isAddingService = addingServiceId === item.id;
            const total = calculateItemTotal(item);

            return (
              <div 
                key={item.id} 
                className={`bg-white rounded-lg border p-4 transition-all ${
                  needsDiagnosis ? 'border-amber-300 bg-amber-50/30' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{item.name}</h4>
                      {needsDiagnosis && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          Precisa diagnóstico
                        </span>
                      )}
                      {!needsDiagnosis && item.services && item.services.length > 0 && (
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
                  <div className="mb-3 bg-white rounded border p-2">
                    <div className="text-xs font-medium text-muted-foreground mb-2">SERVIÇOS/PEÇAS:</div>
                    {item.services.map((service) => (
                      <div key={service.id} className="flex justify-between items-center py-1 text-sm">
                        <div>
                          <span>{service.name}</span>
                          <span className="text-muted-foreground ml-2">
                            ({service.quantity}x {formatCurrency(service.price)})
                          </span>
                        </div>
                        <span className="font-medium">{formatCurrency(service.total)}</span>
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
                      <Button size="sm" onClick={() => {
                        if (item.id && currentDiagnosed.trim()) {
                          saveDiagnosed(item.id, currentDiagnosed);
                        }
                        setEditingDiagnosedId(null);
                      }}>
                        Salvar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingDiagnosedId(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : isAddingService ? (
                  <div className="space-y-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    {!item.diagnosed_problem && (
                      <div>
                        <label className="text-xs font-medium text-purple-700 block mb-1">
                          DIAGNÓSTICO TÉCNICO (obrigatório para item com serviço)
                        </label>
                        <Input
                          placeholder="Descreva o problema identificado no equipamento"
                          value={currentDiagnosed}
                          onChange={(e) => setCurrentDiagnosed(e.target.value)}
                          className="bg-white border-purple-200"
                        />
                      </div>
                    )}
                    
                    <div className={!item.diagnosed_problem ? "border-t border-purple-200 pt-3" : ""}>
                      <label className="text-xs font-medium text-muted-foreground block mb-2">
                        ADICIONAR SERVIÇO/PEÇA
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="col-span-2">
                          <Input
                            placeholder="Ex: Troca de tela"
                            value={newService.name}
                            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                            autoFocus
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            placeholder="Qtd"
                            value={newService.quantity || ''}
                            onChange={(e) => setNewService({ ...newService, quantity: parseInt(e.target.value) || 1 })}
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            placeholder="R$"
                            value={newService.price || ''}
                            onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {newService.name && newService.price > 0 ? (
                        <Button size="sm" onClick={() => addService(item.id || '')} disabled={isSaving}>
                          <Plus className="w-4 h-4 mr-1" />
                          Add Serviço
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          Add Serviço
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => {
                        if (item.id && currentDiagnosed.trim()) {
                          saveDiagnosed(item.id, currentDiagnosed);
                        }
                        setAddingServiceId(null);
                      }}>
                        {!item.diagnosed_problem ? 'Salvar Diagnóstico' : 'Fechar'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {item.diagnosed_problem ? (
                      <>
                        <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-sm flex-1">
                          <span className="font-medium text-green-800">Diagnóstico: </span>
                          <span className="text-green-700">{item.diagnosed_problem}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingDiagnosedId(item.id || null)}
                        >
                          <Wrench className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      </>
                    ) : null}
                    <Button
                      size="sm"
                      variant={needsDiagnosis ? "default" : "outline"}
                      className={needsDiagnosis ? "bg-amber-600 hover:bg-amber-700" : ""}
                      onClick={() => setAddingServiceId(item.id || null)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Serviço
                    </Button>
                  </div>
                )}
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
