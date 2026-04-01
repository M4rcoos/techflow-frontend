import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { useBudget, useBudgets } from '../../hooks';
import { useRoleAccess } from '../../hooks/use-role-access';
import { translateStatus, getStatusColor, formatCurrency, formatDate } from '../../lib/utils';
import { X } from 'lucide-react';

interface BudgetDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetId: string | null;
}

export function BudgetDetailModal({ open, onOpenChange, budgetId }: BudgetDetailModalProps) {
  const { data: budget, isLoading } = useBudget(budgetId);
  const { deleteBudget, isDeleting } = useBudgets();
  const { canDelete } = useRoleAccess();

  const handleDelete = () => {
    if (budgetId && confirm('Tem certeza que deseja excluir este orçamento?')) {
      deleteBudget(budgetId, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </button>
        <DialogHeader>
          <DialogTitle>Detalhes do Orçamento</DialogTitle>
          <DialogDescription>Informações completas do orçamento</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center">Carregando...</div>
        ) : budget ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">{budget.code}</h3>
                <p className="text-muted-foreground">
                  Cliente: {budget.client?.client_name || budget.client?.company_name}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(budget.status?.name)}`}
              >
                {translateStatus(budget.status?.name)}
              </span>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Itens</CardTitle>
              </CardHeader>
              <CardContent>
                {budget.items && budget.items.length > 0 ? (
                  <div className="space-y-4">
                    {budget.items.map((item) => (
                      <div key={item.id} className="p-3 bg-muted rounded-lg">
                        <div className="mb-2">
                          <p className="font-medium">{item.name}</p>
                          {item.model && (
                            <p className="text-sm text-muted-foreground">
                              Modelo: {item.model}
                            </p>
                          )}
                          {item.mark && (
                            <p className="text-sm text-muted-foreground">Marca: {item.mark}</p>
                          )}
                          {item.diagnosed_problem && (
                            <p className="text-sm text-orange-600 mt-1">
                              Diagnóstico: {item.diagnosed_problem}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            Problema: {item.reported_problem}
                          </p>
                        </div>
                        
                        {item.services && item.services.length > 0 && (
                          <div className="border-t pt-2 mt-2">
                            <p className="text-sm font-medium mb-1">Serviços/Peças:</p>
                            {item.services.map((svc, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span>{svc.name} {svc.quantity > 1 && `(x${svc.quantity})`}</span>
                                <span>{formatCurrency(Number(svc.total))}</span>
                              </div>
                            ))}
                            <div className="flex justify-between text-sm font-medium mt-1 border-t pt-1">
                              <span>Total</span>
                              <span>{formatCurrency(Number(item.total))}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum item</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                {(budget.total || 0) > 0 ? (
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-green-500">{formatCurrency(budget.total)}</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">Orçamento sem itens</p>
                )}
              </CardContent>
            </Card>

            {budget.notes && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{budget.notes}</p>
                </CardContent>
              </Card>
            )}

            <div className="text-sm text-muted-foreground">
              <p>Criado em: {formatDate(budget.created_at)}</p>
              {budget.valid_until && <p>Validade até: {formatDate(budget.valid_until)}</p>}
            </div>

            <DialogFooter>
              {canDelete && (
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Excluindo...' : 'Excluir'}
                </Button>
              )}
            </DialogFooter>
          </div>
        ) : (
          <div className="py-8 text-center">Orçamento não encontrado</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
