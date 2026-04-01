import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface ServiceOrderStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetTotal: number;
  currentStatus: string;
  onSubmit: (data: {
    status: string;
    final_amount?: number;
    discount?: number;
    paid_amount?: number;
    payment_method?: string;
    paid_at?: string;
    delivered_at?: string;
  }) => void;
  isLoading?: boolean;
}

const statusFlow: Record<string, { label: string; next: string | null }> = {
  CREATED: { label: 'Criada', next: 'IN_PROGRESS' },
  IN_PROGRESS: { label: 'Em Concerto', next: 'PAUSED' },
  PAUSED: { label: 'Pausado', next: 'IN_PROGRESS' },
  READY: { label: 'Pronto', next: 'PAID' },
  PAID: { label: 'Pago', next: 'COMPLETED' },
  COMPLETED: { label: 'Finalizado', next: null },
  CANCELED: { label: 'Cancelado', next: null },
};

export function ServiceOrderStatusModal({
  open,
  onOpenChange,
  budgetTotal,
  currentStatus,
  onSubmit,
  isLoading,
}: ServiceOrderStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [finalAmount, setFinalAmount] = useState<number>(budgetTotal);
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (open) {
      setSelectedStatus(currentStatus);
      setFinalAmount(budgetTotal);
      setDiscount(0);
      setPaidAmount(0);
      setPaymentMethod('');
      setPaidAt(new Date().toISOString().split('T')[0]);
    }
  }, [open, currentStatus, budgetTotal]);

  const handleSubmit = () => {
    if (!selectedStatus || selectedStatus === currentStatus) {
      toast.error('Selecione um novo status');
      return;
    }

    const finalData: any = {
      status: selectedStatus,
    };

    if (selectedStatus === 'PAID') {
      if (!finalAmount || finalAmount <= 0) {
        toast.error('Informe o valor total');
        return;
      }
      if (!paidAmount || paidAmount <= 0) {
        toast.error('Informe o valor pago');
        return;
      }
      if (!paymentMethod) {
        toast.error('Informe a forma de pagamento');
        return;
      }

      finalData.final_amount = finalAmount;
      finalData.discount = discount;
      finalData.paid_amount = paidAmount;
      finalData.payment_type = paymentMethod;
      finalData.paid_at = paidAt;
    }

    if (selectedStatus === 'COMPLETED') {
      finalData.final_amount = finalAmount;
      finalData.delivered_at = new Date().toISOString();
    }

    onSubmit(finalData);
    onOpenChange(false);
  };

  const getAvailableStatuses = () => {
    const available = [];

    if (currentStatus === 'CREATED' || currentStatus === 'PAUSED') {
      available.push({ value: 'IN_PROGRESS', label: 'Em Concerto' });
      available.push({ value: 'CANCELED', label: 'Cancelar OS' });
    } else if (currentStatus === 'IN_PROGRESS') {
      available.push({ value: 'PAUSED', label: 'Pausar' });
      available.push({ value: 'READY', label: 'Marcar como Pronto' });
    } else if (currentStatus === 'READY') {
      available.push({ value: 'PAID', label: 'Confirmar Pagamento' });
    } else if (currentStatus === 'PAID') {
      available.push({ value: 'COMPLETED', label: 'Finalizar OS' });
    }

    return available;
  };

  const availableStatuses = getAvailableStatuses();
  const showPaymentFields = selectedStatus === 'PAID';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </button>
        <DialogHeader>
          <DialogTitle>Atualizar Status da OS</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-slate-100 p-3 rounded-lg">
            <span className="text-sm text-muted-foreground">Status atual: </span>
            <span className="font-medium">{statusFlow[currentStatus]?.label || currentStatus}</span>
          </div>

          <div>
            <Label>Novo Status</Label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value={currentStatus}>Selecione...</option>
              {availableStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {showPaymentFields && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Valor Total (R$)</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={finalAmount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d.]/g, '');
                      setFinalAmount(parseFloat(val) || 0);
                    }}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <Label>Desconto (R$)</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={discount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d.]/g, '');
                      setDiscount(parseFloat(val) || 0);
                    }}
                    placeholder="0,00"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Total a pagar: R$ {((finalAmount || 0) - (discount || 0)).toFixed(2)}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Valor Pago (R$)</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={paidAmount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d.]/g, '');
                      setPaidAmount(parseFloat(val) || 0);
                    }}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <Label>Data do Pagamento</Label>
                  <Input
                    type="date"
                    value={paidAt}
                    onChange={(e) => setPaidAt(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Forma de Pagamento</Label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Selecione...</option>
                  <option value="PIX">PIX</option>
                  <option value="CASH">Dinheiro</option>
                  <option value="DEBIT">Débito</option>
                  <option value="CREDIT">Crédito</option>
                  <option value="BANK_SLIP">Boleto</option>
                </select>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || selectedStatus === currentStatus}>
            {isLoading ? 'Salvando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
