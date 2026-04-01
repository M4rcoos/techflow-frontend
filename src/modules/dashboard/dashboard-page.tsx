import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  FileText, 
  DollarSign, 
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Plus,
  Wrench,
  CreditCard
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { StatCard } from '../../components/stat-card';
import { BudgetStatusChart, ServiceOrderStatusChart } from '../../components/charts/status-chart';
import { PaymentMethodsBarChart } from '../../components/charts/payment-methods-bar-chart';
import { useAuth, useDashboard, useUrgent, usePaymentStats } from '../../hooks';
import { useRoleAccess } from '../../hooks/use-role-access';
import { formatCurrency } from '../../lib/utils';
import { cn } from '../../lib/utils';

export function DashboardPage() {
  const { user } = useAuth();
  const { isOwner, isAdmin } = useRoleAccess();
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
    status?: string | null;
  }>({});

  const { dashboard, isLoading, refetch } = useDashboard({
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  const { urgent } = useUrgent();
  const { paymentStats } = usePaymentStats({
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  const canViewRevenue = isOwner || isAdmin;

  const expiredItems = urgent?.budgets.filter(i => i.urgencyStatus === 'EXPIRED') || [];
  const dueTodayItems = urgent?.budgets.filter(i => i.urgencyStatus === 'DUE_TODAY') || [];
  const expiredOS = urgent?.serviceOrders.filter(i => i.urgencyStatus === 'EXPIRED') || [];
  const dueTodayOS = urgent?.serviceOrders.filter(i => i.urgencyStatus === 'DUE_TODAY') || [];

  const urgentCount = (urgent?.counts.totalExpired || 0) + (urgent?.counts.totalDueToday || 0);

  const urgentItems = [
    ...expiredItems.slice(0, 2),
    ...expiredOS.slice(0, 1),
    ...dueTodayItems.slice(0, 2 - expiredItems.slice(0, 2).length),
    ...dueTodayOS.slice(0, 1 - expiredOS.slice(0, 1).length),
  ].slice(0, 5);

  const stats = useMemo(() => {
    if (!dashboard) return [];
    return [
      { 
        title: 'Clientes', 
        value: dashboard.totalClients || 0, 
        icon: Users, 
        onClick: () => navigate('/clients'),
        description: 'Total de clientes cadastrados no sistema',
      },
      { 
        title: 'Orçamentos', 
        value: dashboard.totalBudgets || 0, 
        icon: FileText, 
        onClick: () => navigate('/budgets'),
        description: 'Total de orçamentos criados no período',
      },
      { 
        title: 'Faturamento', 
        value: formatCurrency(dashboard.totalRevenue || 0), 
        icon: DollarSign, 
        onClick: () => navigate('/service-orders?status=COMPLETED'),
        description: 'Valor total de Ordens de Serviço concluídas',
        hidden: !canViewRevenue,
      },
      { 
        title: 'Urgentes', 
        value: urgentCount, 
        icon: AlertCircle, 
        onClick: () => navigate('/urgent'),
        description: 'Itens vencidos ou vencendo hoje',
      },
    
    ].filter(s => !s.hidden);
  }, [dashboard, canViewRevenue, navigate, urgentCount]);

  const budgetStatuses = useMemo(() => ({
    DRAFT: dashboard?.budgetsDraft || 0,
    IN_ANALYSIS: dashboard?.budgetsInAnalysis || 0,
    SENT: dashboard?.budgetsAwaitingApproval || 0,
    APPROVED: dashboard?.budgetsApproved || 0,
    REJECTED: dashboard?.budgetsRejected || 0,
    EXPIRED: dashboard?.urgentBudgets || 0,
  }), [dashboard]);

  const handleStatusClick = (status: string) => {
    if (status === 'EXPIRED') {
      navigate('/budgets?status=EXPIRED');
    } else {
      navigate(`/budgets?status=${status}`);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Olá, {user?.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Resumo do seu negócio
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
              Atualizar
            </Button>
            <Button size="sm" onClick={() => navigate('/budgets')}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Orçamento
            </Button>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-1 block">Data Inicial</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-1 block">Data Final</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground text-sm"
              />
            </div>
            <div className="flex items-end">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setFilters({})}
              >
                Limpar filtros
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <StatCard {...stat} />
                </motion.div>
              ))}
            </div>

            {urgentCount > 0 && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardHeader className="py-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-medium flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-4 h-4" />
                    Atenção: {urgentCount} item(s) urgentes
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-red-600"
                    onClick={() => navigate('/urgents')}
                  >
                    Ver todos <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="space-y-2">
                    {urgentItems.map((item: any, index: number) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-2 bg-white rounded cursor-pointer hover:bg-slate-50"
                        onClick={() => navigate(item.type === 'budget' ? `/budget/${item.id}` : `/service-order/${item.id}`)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${item.type === 'budget' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                            {item.type === 'budget' ? (
                              <FileText className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Wrench className="w-4 h-4 text-purple-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{item.code}</p>
                            <p className="text-xs text-muted-foreground">{item.client}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="border">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#1e40af]" />
                    Orçamentos por Status
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => navigate('/budgets')}
                  >
                    Ver todos <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <BudgetStatusChart 
                    data={budgetStatuses} 
                    onStatusClick={handleStatusClick}
                    selectedStatus={filters.status}
                  />
                </CardContent>
              </Card>

              {canViewRevenue && (
                <Card className="border">
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#1e40af]" />
                      Ordens de Serviço
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => navigate('/service-orders')}
                    >
                      Ver todos <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ServiceOrderStatusChart 
                      data={dashboard?.serviceOrdersByStatus || {}}
                      onStatusClick={(status) => navigate(`/service-orders?status=${status}`)}
                    />
                  </CardContent>
                </Card>
              )}

              {canViewRevenue && (
                <Card className="border">
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#1e40af]" />
                      Formas de Pagamento
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => navigate('/service-orders?status=COMPLETED')}
                    >
                      Ver concluídas <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <PaymentMethodsBarChart data={paymentStats || []} />
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#1e40af]" />
                    Urgentes
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {dashboard?.budgetsExpiringToday || 0} vencendo hoje
                  </span>
                </CardHeader>
                <CardContent>
                  {dashboard?.budgetsExpiringToday && dashboard.budgetsExpiringToday > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Você tem {dashboard.budgetsExpiringToday} orçamento(s) vencendo hoje!
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/budgets?expiring=true')}
                      >
                        Ver orçamentos <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum orçamento vencendo hoje
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#1e40af]" />
                    Últimos Orçamentos
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => navigate('/budgets')}
                  >
                    Ver todos <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {dashboard?.latestBudgets && dashboard.latestBudgets.length > 0 ? (
                    <div className="space-y-2">
                      {dashboard.latestBudgets.slice(0, 5).map((budget) => (
                        <div 
                          key={budget.id} 
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => navigate(`/budgets?detail=${budget.id}`)}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{budget.code}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {budget.client.name}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            {budget.total > 0 && (
                              <p className="text-sm font-medium">
                                {formatCurrency(budget.total)}
                              </p>
                            )}
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded",
                              budget.status === 'APPROVED' && "bg-emerald-100 text-emerald-700",
                              budget.status === 'REJECTED' && "bg-red-100 text-red-700",
                              budget.status === 'SENT' && "bg-orange-100 text-orange-700",
                              budget.status === 'DRAFT' && "bg-slate-100 text-slate-700",
                              budget.status === 'IN_ANALYSIS' && "bg-amber-100 text-amber-700",
                              budget.status === 'EXPIRED' && "bg-gray-100 text-gray-500",
                            )}>
                              {budget.status === 'APPROVED' && 'Aprovado'}
                              {budget.status === 'REJECTED' && 'Rejeitado'}
                              {budget.status === 'SENT' && 'Aguardando resposta'}
                              {budget.status === 'DRAFT' && 'Aguardando orçamento'}
                              {budget.status === 'IN_ANALYSIS' && 'Em análise'}
                              {budget.status === 'EXPIRED' && 'Expirado'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FileText className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">Nenhum orçamento ainda</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="mt-3"
                        onClick={() => navigate('/budgets')}
                      >
                        Criar primeiro orçamento
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
