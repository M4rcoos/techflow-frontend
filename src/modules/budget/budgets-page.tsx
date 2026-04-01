import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FileText, Search } from 'lucide-react';
import { Pagination } from '../../components/ui/pagination';
import { Input } from '../../components/ui/input';
import { PageHeader, EmptyState, BudgetCard, BudgetFilters } from '../../components';
import { useBudgets } from '../../hooks';
import { useRoleAccess } from '../../hooks/use-role-access';
import { BudgetFormModal } from './budget-form-modal';
import { PrintConfirmModal } from './print-confirm-modal';
import { useRealTimeSync } from '../../hooks/use-real-time';

const STATUS_LABELS: Record<string, string> = {
  ALL: 'Orçamentos',
  DRAFT: 'Aguardando orçamento',
  IN_ANALYSIS: 'Em análise',
  SENT: 'Aguardando resposta',
  APPROVED: 'Aprovados',
  REJECTED: 'Rejeitados',
  EXPIRED: 'Expirados',
};

export function BudgetsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const statusFilter = searchParams.get('status') || 'ALL';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const expiring = searchParams.get('expiring') === 'true';
  const expired = searchParams.get('expired') === 'true';

  useRealTimeSync(true, 5000);

  const { budgets, pagination, isLoading, updateBudgetStatus, budgetStatuses } = useBudgets(page, 10, search, { expiring, expired });
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [newlyCreatedBudgetId, setNewlyCreatedBudgetId] = useState<string | null>(null);
  const { canApproveBudget, canEditTechnical } = useRoleAccess();

  const handleBudgetCreated = (_budgetId: string) => {
    setNewlyCreatedBudgetId(_budgetId);
    setShowPrintConfirm(true);
  };

  const handleClosePrintConfirm = () => {
    setShowPrintConfirm(false);
    setNewlyCreatedBudgetId(null);
  };

  const pageTitle = statusFilter !== 'ALL' 
    ? STATUS_LABELS[statusFilter] || 'Orçamentos'
    : expiring 
      ? 'Orçamentos Vencendo Hoje'
      : expired 
        ? 'Orçamentos Vencidos'
        : 'Orçamentos';

  const updateFilters = (newFilters: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'ALL') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    setSearchParams(params);
    setPage(1);
  };

  const handleStatusChange = (status: string) => {
    updateFilters({ status, expiring: null, expired: null });
  };

  const handleStartDateChange = (date: string) => {
    updateFilters({ startDate: date });
  };

  const handleEndDateChange = (date: string) => {
    updateFilters({ endDate: date });
  };

  const handleExpiringChange = (value: boolean) => {
    updateFilters({ expiring: value ? 'true' : null, expired: null, status: 'ALL' });
  };

  const clearFilters = () => {
    setSearch('');
    setSearchParams({});
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
        <PageHeader
          title={pageTitle}
          description={pagination ? `${pagination.total} orçamento(s)` : 'Gerencie seus orçamentos'}
          action={canApproveBudget ? {
            label: 'Novo Orçamento',
            onClick: () => setShowBudgetModal(true),
          } : undefined}
        />

        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por código, cliente ou equipamento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        <BudgetFilters
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          startDate={startDate}
          onStartDateChange={handleStartDateChange}
          endDate={endDate}
          onEndDateChange={handleEndDateChange}
          onClear={clearFilters}
          budgetStatuses={budgetStatuses}
          resultCount={budgets.length}
          expiring={expiring}
          onExpiringChange={handleExpiringChange}
        />

        {isLoading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : budgets.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-12 h-12" />}
            title={budgets.length === 0 ? 'Nenhum orçamento criado ainda' : 'Nenhum orçamento encontrado'}
            description={budgets.length === 0 ? 'Comece criando seu primeiro orçamento.' : 'Tente ajustar os filtros para encontrar o que procura.'}
            actionLabel={budgets.length === 0 ? 'Criar Primeiro Orçamento' : undefined}
            onAction={budgets.length === 0 ? () => setShowBudgetModal(true) : undefined}
          />
        ) : (
          <>
            <div className="grid gap-4">
              {budgets.map((budget: any) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  onClick={() => navigate(`/budget/${budget.id}`)}
                  onStartAnalysis={canEditTechnical && budget.status === 'DRAFT' ? () => updateBudgetStatus({ id: budget.id, status: 'IN_ANALYSIS' }) : undefined}
                  onSend={canEditTechnical && budget.status === 'IN_ANALYSIS' ? () => updateBudgetStatus({ id: budget.id, status: 'SENT' }) : undefined}
                  onApprove={canApproveBudget && budget.status === 'SENT' ? () => updateBudgetStatus({ id: budget.id, status: 'APPROVED' }) : undefined}
                  onReject={canEditTechnical || canApproveBudget ? () => updateBudgetStatus({ id: budget.id, status: 'REJECTED' }) : undefined}
                />
              ))}
            </div>

            {pagination && pagination.pages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={pagination.pages}
                onPageChange={setPage}
              />
            )}
          </>
        )}

      <BudgetFormModal open={showBudgetModal} onOpenChange={setShowBudgetModal} onSuccess={handleBudgetCreated} />
      <PrintConfirmModal
        open={showPrintConfirm}
        onOpenChange={handleClosePrintConfirm}
        budgetId={newlyCreatedBudgetId}
        onClose={handleClosePrintConfirm}
      />
    </div>
  );
}