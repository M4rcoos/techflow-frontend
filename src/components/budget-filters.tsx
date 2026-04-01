import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Filter } from 'lucide-react';
import { translateStatus } from '../lib/utils';
import type { BudgetStatus } from '../types';

interface BudgetFiltersProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  onClear: () => void;
  budgetStatuses: BudgetStatus[];
  resultCount: number;
  expiring?: boolean;
  onExpiringChange?: (value: boolean) => void;
}

export function BudgetFilters({
  statusFilter,
  onStatusChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onClear,
  budgetStatuses,
  resultCount,
  expiring,
  onExpiringChange,
}: BudgetFiltersProps) {
  const hasFilters = statusFilter !== 'ALL' || startDate || endDate || expiring;

  return (
    <Card className="mb-6">
      <CardContent className="py-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm text-foreground"
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
            >
              <option value="ALL" className="text-muted-foreground">Todos</option>
              {budgetStatuses.map((status) => (
                <option key={status.id} value={status.name} className="text-foreground">
                  {translateStatus(status.name)}
                </option>
              ))}
            </select>
          </div>
          {onExpiringChange && (
            <div className="flex items-end">
              <label className="flex items-center gap-2 h-9 cursor-pointer">
                <input
                  type="checkbox"
                  checked={expiring || false}
                  onChange={(e) => onExpiringChange(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Vence Hoje</span>
              </label>
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-2 block">Data Inicial</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Data Final</label>
            <Input type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)} />
          </div>
        </div>
        {hasFilters && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
            >
              Limpar Filtros
            </Button>
            <span className="ml-4 text-sm text-muted-foreground">
              {resultCount} orçamento(s) encontrado(s)
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}