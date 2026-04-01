import type { BudgetListItem } from '../types';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { formatCurrency, formatDate, translateRole, calculateUrgency, generateWhatsAppLink } from '../lib/utils';
import { Pencil, Send, Check, X, User, Printer, AlertTriangle, Clock, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { getUser } from '../lib/api';
import type { User as UserType } from '../types';

interface BudgetCardProps {
  budget: BudgetListItem;
  onClick: () => void;
  onEdit?: () => void;
  onStartAnalysis?: () => void;
  onSend?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onPrint?: () => void;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  DRAFT: { label: 'Aguardando orçamento', color: 'text-slate-700', bgColor: 'bg-slate-100' },
  IN_ANALYSIS: { label: 'Em análise', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  SENT: { label: 'Aguardando resposta', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  APPROVED: { label: 'Aprovado', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  REJECTED: { label: 'Rejeitado', color: 'text-red-700', bgColor: 'bg-red-100' },
};

function getUrgencyBadge(validUntil: string | null | undefined, status: string) {
  const urgency = calculateUrgency(validUntil, status);
  
  if (urgency === 'EXPIRED') {
    return { label: 'Expirado', color: 'text-red-700', bgColor: 'bg-red-100', icon: AlertTriangle };
  }
  if (urgency === 'DUE_TODAY') {
    return { label: 'Vence hoje', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: Clock };
  }
  return null;
}

export function BudgetCard({ budget, onClick, onEdit, onStartAnalysis, onSend, onApprove, onReject, onPrint }: BudgetCardProps) {
  const lastUpdatedBy = budget.updatedBy;
  const createdBy = budget.createdBy;
  
  const currentConfig = statusConfig[budget.status] || { label: budget.status, color: 'text-gray-700', bgColor: 'bg-gray-100' };
  const urgencyBadge = getUrgencyBadge(budget.validUntil, budget.status);

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!budget.client.phone) {
      toast.error('Cliente sem telefone');
      return;
    }
    const currentUser = getUser<UserType>();
    const waLink = generateWhatsAppLink({
      phone: budget.client.phone,
      name: budget.client.name,
      code: budget.code,
      token: budget.public_token,
      status: budget.status,
      userName: currentUser?.name,
      companyName: currentUser?.company_name,
    });
    if (waLink) {
      window.open(waLink, '_blank');
    } else {
      toast.error('Não foi possível gerar link do WhatsApp');
    }
  };

  return (
    <Card
      className="hover:border-primary/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="py-4 md:py-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-2">
              <h3 className="font-semibold text-base md:text-lg">{budget.code}</h3>
              <span className={cn("text-xs px-2 py-1 rounded-full font-medium", currentConfig.bgColor, currentConfig.color)}>
                {currentConfig.label}
              </span>
              {urgencyBadge && (
                <span className={cn("text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1", urgencyBadge.bgColor, urgencyBadge.color)}>
                  <urgencyBadge.icon className="w-3 h-3" />
                  {urgencyBadge.label}
                </span>
              )}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">
              Cliente: {budget.client.name}
            </p>
            {budget.equipmentPreview.length > 0 && (
              <p className="text-xs md:text-sm text-muted-foreground">
                {budget.equipmentPreview.join(', ')}
                {budget.itemsCount > 2 && ` +${budget.itemsCount - 2} item(s)`}
              </p>
            )}
            <p className="text-xs md:text-sm text-muted-foreground">
              {budget.itemsCount} item(ns) • {formatDate(budget.createdAt)}
            </p>
            {budget.validUntil && (
              <p className="text-xs md:text-sm text-muted-foreground">
                Válido até: {formatDate(budget.validUntil)}
              </p>
            )}
            {(lastUpdatedBy || createdBy) && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                <span>
                  {lastUpdatedBy 
                    ? `${translateRole(lastUpdatedBy.role)}: ${lastUpdatedBy.name} atualizou`
                    : `${translateRole('ATTENDANT')}: ${createdBy?.name || 'Sistema'} criou`
                  }
                </span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            {budget.total > 0 && (
              <p className="text-xl md:text-2xl font-bold text-green-500">
                {formatCurrency(budget.total)}
              </p>
            )}
            
            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              {budget.status === 'DRAFT' && onStartAnalysis && (
                <Button size="sm" onClick={(e) => { e.stopPropagation(); onStartAnalysis?.(); }}>
                  <Send className="w-4 h-4 mr-1" />
                  Iniciar Análise
                </Button>
              )}
              {budget.status === 'DRAFT' && onReject && (
                <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); onReject?.(); }}>
                  <X className="w-4 h-4 mr-1" />
                  Rejeitar
                </Button>
              )}

              {budget.status === 'IN_ANALYSIS' && onEdit && (
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
                  <Pencil className="w-4 h-4 mr-1" />
                  Editar
                </Button>
              )}
              {budget.status === 'IN_ANALYSIS' && onSend && (
                <Button size="sm" onClick={(e) => { e.stopPropagation(); onSend?.(); }}>
                  <Send className="w-4 h-4 mr-1" />
                  Enviar
                </Button>
              )}

              {onPrint && (
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onPrint?.(); }}>
                  <Printer className="w-4 h-4 mr-1" />
                  Imprimir
                </Button>
              )}

              {budget.client.phone && (
                <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700" onClick={handleWhatsApp}>
                  <MessageCircle className="w-4 h-4 mr-1" />
                  WhatsApp
                </Button>
              )}

              {budget.status === 'SENT' && onApprove && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={(e) => { e.stopPropagation(); onApprove?.(); }}>
                  <Check className="w-4 h-4 mr-1" />
                  Aprovar
                </Button>
              )}
              {budget.status === 'SENT' && onReject && (
                <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); onReject?.(); }}>
                  <X className="w-4 h-4 mr-1" />
                  Rejeitar
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
