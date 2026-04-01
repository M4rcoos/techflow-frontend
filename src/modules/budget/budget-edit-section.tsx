import { useState } from 'react';
import { Plus, Trash2, Save, Pencil } from 'lucide-react';
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
  services: Service[];
}

interface BudgetEditSectionProps {
  budgetStatus: string;
  items: BudgetItem[];
  onSave: () => void;
  onRefetch: () => void;
  addItem: (item: Omit<BudgetItem, 'id'>) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  addService: (itemId: string, service: { name: string; quantity: number; price: number }) => Promise<void>;
  deleteService: (itemId: string, serviceId: string) => Promise<void>;
}

export function BudgetEditSection({
  budgetStatus,
  items,
  onSave,
  onRefetch,
  addItem,
  deleteItem,
  addService,
  deleteService,
}: BudgetEditSectionProps) {
  const [isEditing, setIsEditing] = useState(budgetStatus === 'IN_ANALYSIS');
  const [newItem, setNewItem] = useState<Partial<BudgetItem>>({
    name: '',
    model: '',
    mark: '',
    quantity: 1,
    reported_problem: '',
    diagnosed_problem: '',
    services: [],
  });
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [newServiceItemId, setNewServiceItemId] = useState<string | null>(null);
  const [newService, setNewService] = useState<Partial<Service>>({
    name: '',
    quantity: 1,
    price: 0,
  });
  const [isSaving, setIsSaving] = useState(false);

  const canEdit = budgetStatus === 'DRAFT' || budgetStatus === 'IN_ANALYSIS';

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.reported_problem) {
      toast.error('Nome e problema são obrigatórios');
      return;
    }

    setIsSaving(true);
    try {
      await addItem({
        name: newItem.name,
        model: newItem.model,
        mark: newItem.mark,
        quantity: newItem.quantity || 1,
        reported_problem: newItem.reported_problem,
        diagnosed_problem: newItem.diagnosed_problem,
        services: [],
      });
      setNewItem({
        name: '',
        model: '',
        mark: '',
        quantity: 1,
        reported_problem: '',
        diagnosed_problem: '',
        services: [],
      });
      setShowNewItemForm(false);
      onRefetch();
      toast.success('Item adicionado com sucesso');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao adicionar item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    
    setIsSaving(true);
    try {
      await deleteItem(itemId);
      onRefetch();
      toast.success('Item removido');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao remover item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddService = async (itemId: string) => {
    if (!newService.name || !newService.price) {
      toast.error('Nome e preço são obrigatórios');
      return;
    }

    setIsSaving(true);
    try {
      await addService(itemId, {
        name: newService.name,
        quantity: newService.quantity || 1,
        price: newService.price,
      });
      setNewService({ name: '', quantity: 1, price: 0 });
      setNewServiceItemId(null);
      onRefetch();
      toast.success('Serviço adicionado');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao adicionar serviço');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteService = async (itemId: string, serviceId: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;

    setIsSaving(true);
    try {
      await deleteService(itemId, serviceId);
      onRefetch();
      toast.success('Serviço removido');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao remover serviço');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    onSave();
  };

  const calculateItemTotal = (item: BudgetItem) => {
    return item.services.reduce((sum, svc) => sum + (svc.total || 0), 0);
  };

  if (!canEdit) return null;

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50/50">
      <CardContent className="py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Itens do Orçamento</h3>
          </div>
          {!isEditing && (
            <Button size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="w-4 h-4 mr-2" />
              Editar Itens
            </Button>
          )}
          {isEditing && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </div>
          )}
        </div>

        {isEditing && (
          <>
            <div className="space-y-4 mb-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg border p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.model && `${item.model} • `}
                        {item.mark && `${item.mark} • `}
                        Qtd: {item.quantity}
                      </p>
                      {item.reported_problem && (
                        <p className="text-sm mt-1 p-2 bg-slate-50 rounded">
                          <span className="font-medium text-xs">Problema:</span> {item.reported_problem}
                        </p>
                      )}
                      {item.diagnosed_problem && (
                        <p className="text-sm mt-1 p-2 bg-blue-50 rounded">
                          <span className="font-medium text-xs">Diagnóstico:</span> {item.diagnosed_problem}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-green-600">
                        {formatCurrency(calculateItemTotal(item))}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => item.id && handleDeleteItem(item.id)}
                        disabled={isSaving}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-3 mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Serviços/Peças:</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-600"
                        onClick={() => setNewServiceItemId(newServiceItemId === item.id ? null : (item.id || null))}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>

                    {item.services.map((service) => (
                      <div key={service.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div className="flex-1">
                          <span className="text-sm">{service.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {service.quantity}x {formatCurrency(service.price)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{formatCurrency(service.total)}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                            onClick={() => service.id && handleDeleteService(item.id || '', service.id)}
                            disabled={isSaving}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {newServiceItemId === item.id && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                        <div className="grid grid-cols-4 gap-2 mb-2">
                          <Input
                            placeholder="Nome do serviço"
                            value={newService.name || ''}
                            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                            className="col-span-2"
                          />
                          <Input
                            type="number"
                            placeholder="Qtd"
                            value={newService.quantity || 1}
                            onChange={(e) => setNewService({ ...newService, quantity: parseInt(e.target.value) || 1 })}
                          />
                          <Input
                            type="number"
                            placeholder="Preço"
                            value={newService.price || ''}
                            onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleAddService(item.id || '')} disabled={isSaving}>
                            Adicionar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setNewServiceItemId(null)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {showNewItemForm ? (
              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-medium mb-3">Novo Item</h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Input
                    placeholder="Nome do equipamento *"
                    value={newItem.name || ''}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                  <Input
                    placeholder="Modelo"
                    value={newItem.model || ''}
                    onChange={(e) => setNewItem({ ...newItem, model: e.target.value })}
                  />
                  <Input
                    placeholder="Marca"
                    value={newItem.mark || ''}
                    onChange={(e) => setNewItem({ ...newItem, mark: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Quantidade"
                    value={newItem.quantity || 1}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <Input
                  placeholder="Problema relatado pelo cliente *"
                  value={newItem.reported_problem || ''}
                  onChange={(e) => setNewItem({ ...newItem, reported_problem: e.target.value })}
                  className="mb-3"
                />
                <Input
                  placeholder="Diagnóstico/Falha identificada"
                  value={newItem.diagnosed_problem || ''}
                  onChange={(e) => setNewItem({ ...newItem, diagnosed_problem: e.target.value })}
                  className="mb-3"
                />
                <div className="flex gap-2">
                  <Button onClick={handleAddItem} disabled={isSaving}>
                    Adicionar Item
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewItemForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div></div>
              // <Button
              //   variant="outline"
              //   className="w-full"
              //   onClick={() => setShowNewItemForm(true)}
              // >
              //   <Plus className="w-4 h-4 mr-2" />
              //   Adicionar Item
              // </Button>
            )}
          </>
        )}

        {!isEditing && items.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            Nenhum item adicionado. Clique em "Editar Itens" para adicionar.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default BudgetEditSection;
