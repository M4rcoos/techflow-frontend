import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, AlertCircle, FileText, Wrench, Calendar } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';

type UrgencyStatus = 'EXPIRED' | 'DUE_TODAY' | 'NONE';
type ItemType = 'BUDGET' | 'SERVICE_ORDER';

interface UrgentItem {
  id: string;
  code: string;
  client: string;
  status: string;
  type: ItemType;
  urgencyStatus: UrgencyStatus;
  dueDate: string | null;
  total?: number;
}

interface UrgentData {
  budgets: UrgentItem[];
  serviceOrders: UrgentItem[];
  counts: {
    totalExpired: number;
    totalDueToday: number;
  };
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Rascunho',
  IN_ANALYSIS: 'Em Análise',
  SENT: 'Enviado',
  CREATED: 'Criada',
  IN_PROGRESS: 'Em Concerto',
  PAUSED: 'Pausado',
  READY: 'Pronto',
  PAID: 'Pago',
  COMPLETED: 'Finalizado',
  CANCELED: 'Cancelado',
};

export function UrgentsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlFilter = searchParams.get('filter');
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<'expiring' | 'urgent'>(
    urlFilter === 'due_today' ? 'expiring' : 'urgent'
  );
  const [typeFilter, setTypeFilter] = useState<'all' | ItemType>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['urgent'],
    queryFn: async () => {
      const response = await api.get<{ data: UrgentData }>('/api/dashboard/urgent');
      return response.data.data;
    },
    staleTime: 0,
  });

  const handleTabChange = (tab: 'expiring' | 'urgent') => {
    setActiveTab(tab);
    queryClient.invalidateQueries({ queryKey: ['urgent'] });
  };

  const budgetsExpired = data?.budgets.filter(i => i.urgencyStatus === 'EXPIRED') || [];
  const budgetsDueToday = data?.budgets.filter(i => i.urgencyStatus === 'DUE_TODAY') || [];
  const serviceOrdersExpired = data?.serviceOrders.filter(i => i.urgencyStatus === 'EXPIRED') || [];
  const serviceOrdersDueToday = data?.serviceOrders.filter(i => i.urgencyStatus === 'DUE_TODAY') || [];

  const getItems = (): UrgentItem[] => {
    let items: UrgentItem[] = [];
    
    if (activeTab === 'expiring') {
      items = [...budgetsDueToday, ...serviceOrdersDueToday];
    } else {
      items = [...budgetsExpired, ...serviceOrdersExpired];
    }

    if (typeFilter === 'BUDGET') {
      return items.filter(i => i.type === 'BUDGET');
    }
    if (typeFilter === 'SERVICE_ORDER') {
      return items.filter(i => i.type === 'SERVICE_ORDER');
    }
    return items;
  };

  const items = getItems();

  const getCount = (tab: 'expiring' | 'urgent', type?: ItemType) => {
    let budgets = tab === 'expiring' ? budgetsDueToday : budgetsExpired;
    let orders = tab === 'expiring' ? serviceOrdersDueToday : serviceOrdersExpired;
    
    if (type === 'BUDGET') return budgets.length;
    if (type === 'SERVICE_ORDER') return orders.length;
    return budgets.length + orders.length;
  };

  const handleItemClick = (item: UrgentItem) => {
    if (item.type === 'BUDGET') {
      navigate(`/budget/${item.id}`);
    } else {
      navigate(`/service-order/${item.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-500" />
            Urgentes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Itens que precisam de atenção imediata
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === 'urgent' ? 'default' : 'outline'}
            onClick={() => handleTabChange('urgent')}
            className="flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            Vencidos
            {getCount('urgent') > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {getCount('urgent')}
              </span>
            )}
          </Button>
          <Button
            variant={activeTab === 'expiring' ? 'default' : 'outline'}
            onClick={() => handleTabChange('expiring')}
            className="flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Vencendo Hoje
            {getCount('expiring') > 0 && (
              <span className="bg-amber-500 text-white text-xs rounded-full px-2 py-0.5">
                {getCount('expiring')}
              </span>
            )}
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={typeFilter === 'all' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('all')}
          >
            Todos ({getCount(activeTab)})
          </Button>
          <Button
            variant={typeFilter === 'BUDGET' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('BUDGET')}
          >
            <FileText className="w-4 h-4 mr-1" />
            Orçamentos ({getCount(activeTab, 'BUDGET')})
          </Button>
          <Button
            variant={typeFilter === 'SERVICE_ORDER' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('SERVICE_ORDER')}
          >
            <Wrench className="w-4 h-4 mr-1" />
            Ordens de Serviço ({getCount(activeTab, 'SERVICE_ORDER')})
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum item encontrado</h3>
              <p className="text-sm text-muted-foreground">
                Não há itens {activeTab === 'expiring' ? 'vencendo hoje' : 'vencidos'} no momento.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Card 
                key={`${item.type}-${item.id}`} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleItemClick(item)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${item.type === 'BUDGET' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                        {item.type === 'BUDGET' ? (
                          <FileText className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Wrench className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{item.code}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {statusLabels[item.status] || item.status}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${item.urgencyStatus === 'EXPIRED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {item.urgencyStatus === 'EXPIRED' ? 'Vencido' : 'Vence hoje'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.client}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {item.dueDate && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {formatDate(item.dueDate)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
