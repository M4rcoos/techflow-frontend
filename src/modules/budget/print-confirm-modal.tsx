import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { useBudget } from '../../hooks';
import { Printer, X } from 'lucide-react';
import { BudgetPrintModal } from './budget-print-modal';

interface PrintConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetId: string | null;
  onClose: () => void;
}

export function PrintConfirmModal({ open, onOpenChange, budgetId, onClose }: PrintConfirmModalProps) {
  const [showPrintModal, setShowPrintModal] = useState(false);
  const { data: budget } = useBudget(budgetId);

  const handleOpenPrint = () => {
    setShowPrintModal(true);
  };

  const handleClosePrint = () => {
    setShowPrintModal(false);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} disableCloseOutside>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Orçamento Criado!</DialogTitle>
            <DialogDescription>
              O orçamento foi criado com sucesso. Deseja imprimir agora?
            </DialogDescription>
          </DialogHeader>

          {budget && (
            <div className="py-4">
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <p className="font-medium">Código: {budget.code}</p>
                <p className="text-sm text-muted-foreground">
                  Cliente: {budget.client?.client_name || budget.client?.company_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Equipamento: {budget.items.map(item => item.name)}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                A impressão incluirá um QR Code para o cliente acompanhar o serviço online e aprovar o orçamento.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Mais Tarde
            </Button>
            <Button onClick={handleOpenPrint}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimir Agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showPrintModal && budget && (
        <BudgetPrintModal
          open={showPrintModal}
          onOpenChange={handleClosePrint}
          budget={budget}
        />
      )}
    </>
  );
}
