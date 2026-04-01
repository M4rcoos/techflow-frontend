import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Wrench, QrCode, MessageCircle } from 'lucide-react';
import { Pagination } from '../../components/ui/pagination';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { SearchFilter } from '../../components/search-filter';
import { formatDate, formatCurrency, generateWhatsAppLink } from '../../lib/utils';
import { useServiceOrders } from '../../hooks/use-service-orders';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { getUser } from '../../lib/api';
import type { User } from '../../types';
import { useRealTimeSync } from '../../hooks/use-real-time';

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  CREATED: { label: 'Criada', color: 'text-slate-700', bgColor: 'bg-slate-100' },
  IN_PROGRESS: { label: 'Em Concerto', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  PAUSED: { label: 'Pausado', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  READY: { label: 'Pronto', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
  PAID: { label: 'Pago', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  COMPLETED: { label: 'Finalizado', color: 'text-green-700', bgColor: 'bg-green-100' },
  CANCELED: { label: 'Cancelado', color: 'text-red-700', bgColor: 'bg-red-100' },
};

export function ServiceOrdersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  
  const statusParam = searchParams.get('status');
  const [statusFilter, setStatusFilter] = useState<string>(statusParam || '');
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');

  useRealTimeSync(true, 5000);

  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    if (statusFromUrl !== statusFilter) {
      setStatusFilter(statusFromUrl || '');
    }
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl !== searchValue) {
      setSearchValue(searchFromUrl || '');
    }
  }, [searchParams]);

  const handleStatusFilter = useCallback((status: string) => {
    setStatusFilter(status);
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (status) {
      newParams.set('status', status);
    } else {
      newParams.delete('status');
    }
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleSearchChange = useCallback((search: string) => {
    setSearchValue(search);
    setPage(1);
    
    const newParams = new URLSearchParams(searchParams);
    if (search.length >= 3) {
      newParams.set('search', search);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const { serviceOrders, pagination, isLoading } = useServiceOrders(
    page, 
    10, 
    statusFilter || undefined, 
    searchValue || undefined
  );

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Ordens de Serviço</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {pagination ? `${pagination.total} OS encontrada(s)` : 'Gerencie suas ordens de serviço'}
            </p>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchFilter
                placeholder="Buscar por OS, cliente ou equipamento..."
                onSearch={handleSearchChange}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={statusFilter === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStatusFilter('')}
          >
            Todos
          </Button>
          {Object.entries(statusConfig).map(([key, config]) => (
            <Button
              key={key}
              variant={statusFilter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter(key)}
            >
              {config.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : serviceOrders.length === 0 ? (
          <Card className="border">
            <CardContent className="py-12 text-center">
              <Wrench className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma ordem de serviço encontrada</h3>
              <p className="text-sm text-muted-foreground">
                Ordens de serviço são criadas automaticamente quando um orçamento é aprovado.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {serviceOrders.map((order) => {
                const currentConfig = statusConfig[order.status.name] || { label: order.status.name, color: 'text-gray-700', bgColor: 'bg-gray-100' };
                
                return (
                  <Card 
                    key={order.id} 
                    className="border hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => navigate(`/service-order/${order.id}`)}
                  >
                    <CardContent className="py-4">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-foreground">{order.code}</h3>
                            <span className={cn("text-xs px-2 py-1 rounded-full font-medium", currentConfig.bgColor, currentConfig.color)}>
                              {currentConfig.label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {order.budget?.client?.client_name || order.budget?.client?.company_name || 'Cliente não vinculado'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.budget?.code ? `Orçamento: ${order.budget.code}` : 'Sem orçamento vinculado'}
                            {order.budget?.total ? ` - ${formatCurrency(order.budget.total)}` : ''}
                          </p>
                          {order.final_amount && (
                            <p className="text-sm font-medium mt-1">
                              Total: {formatCurrency(order.final_amount)}
                              {order.discount ? ` (-${formatCurrency(order.discount)})` : ''}
                            </p>
                          )}
                          {order.paid_amount && order.paid_amount > 0 && (
                            <p className="text-sm text-emerald-600 font-medium">
                              Pago: {formatCurrency(order.paid_amount)}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground hidden lg:block">
                            {formatDate(order.created_at)}
                          </span>

                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              const clientName = order.budget?.client?.client_name || order.budget?.client?.company_name || 'Cliente';
                              const currentUser = getUser<User>();
                              const waLink = generateWhatsAppLink({
                                phone: order.budget?.client?.phone,
                                name: clientName,
                                code: order.budget?.code,
                                token: order.budget?.public_token,
                                userName: currentUser?.name,
                                companyName: currentUser?.company_name,
                              });
                              if (waLink) {
                                window.open(waLink, '_blank');
                              } else {
                                toast.error('Cliente sem telefone ou orçamento não encontrado');
                              }
                            }}
                            title="Enviar orçamento via WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            WhatsApp
                          </Button>
                           
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/service-order/${order.id}`);
                            }}
                          >
                            <QrCode className="w-4 h-4 mr-1" />
                            Detalhes
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={page}
                  totalPages={pagination.pages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
