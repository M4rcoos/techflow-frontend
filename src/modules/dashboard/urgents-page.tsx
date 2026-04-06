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
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-semibold text-foreground flex items-center gap-2">
            <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
            Urgentes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Itens que precisam de atenção imediata
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 md:mb-6">
          <Button
            variant={activeTab === 'urgent' ? 'default' : 'outline'}
            onClick={() => handleTabChange('urgent')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Vencidos</span>
            <span className="sm:hidden">Venc.</span>
            {getCount('urgent') > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {getCount('urgent')}
              </span>
            )}
          </Button>
          <Button
            variant={activeTab === 'expiring' ? 'default' : 'outline'}
            onClick={() => handleTabChange('expiring')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Vencendo Hoje</span>
            <span className="sm:hidden">Hoje</span>
            {getCount('expiring') > 0 && (
              <span className="bg-amber-500 text-white text-xs rounded-full px-2 py-0.5">
                {getCount('expiring')}
              </span>
            )}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
          <Button
            variant={typeFilter === 'all' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('all')}
            className="text-xs md:text-sm"
          >
            Todos ({getCount(activeTab)})
          </Button>
          <Button
            variant={typeFilter === 'BUDGET' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('BUDGET')}
            className="text-xs md:text-sm"
          >
            <FileText className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            <span className="hidden sm:inline">Orçamentos</span>
            <span className="sm:hidden">Orçam.</span>
            ({getCount(activeTab, 'BUDGET')})
          </Button>
          <Button
            variant={typeFilter === 'SERVICE_ORDER' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('SERVICE_ORDER')}
            className="text-xs md:text-sm"
          >
            <Wrench className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            <span className="hidden sm:inline">Ordens de Serviço</span>
            <span className="sm:hidden">OS</span>
            ({getCount(activeTab, 'SERVICE_ORDER')})
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-10 h-10 md:w-12 md:h-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-base md:text-lg font-medium mb-2">Nenhum item encontrado</h3>
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
                <CardContent className="py-3 md:py-4 px-3 md:px-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className={`p-1.5 md:p-2 rounded-lg ${item.type === 'BUDGET' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                        {item.type === 'BUDGET' ? (
                          <FileText className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                        ) : (
                          <Wrench className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 md:gap-2">
                          <h3 className="font-semibold text-sm md:text-base">{item.code}</h3>
                          <span className="text-xs px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {statusLabels[item.status] || item.status}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full ${item.urgencyStatus === 'EXPIRED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {item.urgencyStatus === 'EXPIRED' ? 'Vencido' : 'Vence hoje'}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">{item.client}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground sm:text-right">
                      <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                      <span>{formatDate(item.dueDate || undefined)}</span>
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
