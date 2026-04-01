import { useState } from 'react';
import { Shield, Calendar, FileText, Printer, Wrench } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { useWarranty, useCreateWarranty } from '../../hooks/use-warranty';
import { formatDate } from '../../lib/utils';

interface BudgetItem {
  id: string;
  name: string;
  model?: string | null;
  mark?: string | null;
  services?: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

interface ServiceOrder {
  id: string;
  code: string;
  status: {
    name: string;
  };
  budget: {
    items: BudgetItem[];
  };
}

interface WarrantySectionProps {
  serviceOrder: ServiceOrder;
}

export function WarrantySection({ serviceOrder }: WarrantySectionProps) {
  const { warranty, isLoading: isLoadingWarranty, refetch } = useWarranty(serviceOrder.id);
  const createWarranty = useCreateWarranty();
  
  const [showForm, setShowForm] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [days, setDays] = useState(90);
  const [termsText, setTermsText] = useState(
    'Este serviço possui garantia de {DAYS} dias, contados a partir da data de conclusão. A garantia cobre exclusivamente os serviços descritos neste documento e não se aplica a mau uso, quedas, intervenções de terceiros ou problemas não relacionados ao serviço executado.'
  );

  const isCompleted = serviceOrder.status?.name === 'COMPLETED';
  const canCreateWarranty = isCompleted && !warranty && !isLoadingWarranty;

  const items = serviceOrder.budget?.items || [];
  const allServices = items.flatMap((item) => 
    (item.services || []).map((service) => ({
      ...service,
      itemName: item.name,
    }))
  );

  const handleToggleItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleToggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSelectAllItems = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item.id));
    }
  };

  const handleSelectAllServices = () => {
    if (selectedServices.length === allServices.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(allServices.map((s) => s.id));
    }
  };

  const handleCreateWarranty = async () => {
    if (selectedItems.length === 0 && selectedServices.length === 0) return;
    
    const finalTerms = termsText.replace('{DAYS}', String(days));
    
    try {
      await createWarranty.mutateAsync({
        serviceOrderId: serviceOrder.id,
        data: {
          item_ids: selectedItems,
          service_ids: selectedServices,
          days,
          terms_text: finalTerms,
        },
      });
      setShowForm(false);
      setSelectedItems([]);
      setSelectedServices([]);
      refetch();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handlePrint = () => {
    if (!warranty) return;
    
    const baseUrl = window.location.origin;
    const printUrl = `${baseUrl}/warranty/print/${serviceOrder.id}`;
    
    window.open(printUrl, '_blank');
  };

  if (isLoadingWarranty) {
    return (
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="text-center text-muted-foreground">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  if (warranty) {
    const hasServices = warranty.services && warranty.services.length > 0;
    
    return (
      <Card className="mb-6 border-green-200 bg-green-50/50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-800">Garantia Gerada</h3>
            </div>
            <Button size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimir Garantia
            </Button>
          </div>
          
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Dias de garantia:</span>
              <span className="font-medium">{warranty.days} dias</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Válida até:</span>
              <span className="font-medium text-green-700">
                {formatDate(warranty.expires_at)}
              </span>
            </div>
          </div>

          {warranty.items && warranty.items.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Itens cobertos:</span>
              </div>
              <div className="space-y-1">
                {warranty.items.map((item) => (
                  <div key={item.id} className="text-sm pl-6">
                    • {item.name}
                    {item.model && ` - ${item.model}`}
                    {item.mark && ` (${item.mark})`}
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasServices && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Serviços cobertos:</span>
              </div>
              <div className="space-y-1">
                {warranty.services.map((service) => (
                  <div key={service.id} className="text-sm pl-6">
                    • {service.name}
                    <span className="text-muted-foreground text-xs ml-1">
                      ({service.budget_item_name})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!canCreateWarranty && !showForm) {
    return null;
  }

  if (showForm) {
    const hasServices = allServices.length > 0;
    const canSubmit = selectedItems.length > 0 || selectedServices.length > 0;
    
    return (
      <Card className="mb-6 border-blue-200 bg-blue-50/50">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Gerar Termo de Garantia</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Selecione os itens executados</label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleSelectAllItems}
                >
                  {selectedItems.length === items.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </Button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2 bg-white">
                {items.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleToggleItem(item.id)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">
                      {item.name}
                      {item.model && ` - ${item.model}`}
                      {item.mark && ` (${item.mark})`}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {hasServices && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Selecione os serviços executados</label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleSelectAllServices}
                  >
                    {selectedServices.length === allServices.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                  </Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2 bg-white">
                  {allServices.map((service) => (
                    <label
                      key={service.id}
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service.id)}
                        onChange={() => handleToggleService(service.id)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">
                        <Wrench className="w-3 h-3 inline mr-1" />
                        {service.name}
                        <span className="text-muted-foreground text-xs ml-1">
                          ({service.itemName})
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {!canSubmit && (
              <p className="text-xs text-red-500">
                Selecione pelo menos um item ou serviço
              </p>
            )}

            <div>
              <label className="text-sm font-medium mb-1 block">Dias de garantia</label>
              <input
                type="number"
                min="1"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 0)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Termo de garantia</label>
              <textarea
                value={termsText.replace('{DAYS}', String(days))}
                onChange={(e) => setTermsText(e.target.value)}
                className="flex min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Digite o termo de garantia..."
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreateWarranty}
                disabled={!canSubmit || createWarranty.isPending}
              >
                {createWarranty.isPending ? 'Criando...' : 'Gerar Garantia'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setSelectedItems([]);
                  setSelectedServices([]);
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-6">
      <Button onClick={() => setShowForm(true)}>
        <Shield className="w-4 h-4 mr-2" />
        Gerar Garantia
      </Button>
    </div>
  );
}
