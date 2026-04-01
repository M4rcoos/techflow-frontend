import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Copy, Check, QrCode } from 'lucide-react';
import { sanitizeForHtml } from '../../lib/cookie-utils';

interface BudgetPrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: any;
}

export function BudgetPrintModal({ open, onOpenChange, budget }: BudgetPrintModalProps) {
  const [copied, setCopied] = useState(false);

  if (!budget) return null;

  const baseUrl = window.location.origin;
  const trackUrl = `${baseUrl}/track?token=${budget.public_token}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(trackUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const clientName = sanitizeForHtml(budget.client?.client_name || budget.client?.company_name) || '-';
    const items = budget.items || [];

    const generateLabels = () => {
      if (items.length === 0) {
        return `
          <div class="label-card">
            <div class="label-header">ETIQUETA PARA EQUIPAMENTO 1</div>
            <div class="label-code">ORC-${budget.code.split('-')[1] || budget.code}-01</div>
            <div class="label-row"><span class="label">Cliente:</span><span class="value">${clientName}</span></div>
            <div class="label-row"><span class="label">Equip:</span><span class="value">Equipamento sem identificação</span></div>
            <div class="label-footer">ORÇAMENTO: ${budget.code}</div>
          </div>
          <div class="label-card">
            <div class="label-header">ETIQUETA PARA EQUIPAMENTO 2</div>
            <div class="label-code">ORC-${budget.code.split('-')[1] || budget.code}-02</div>
            <div class="label-row"><span class="label">Cliente:</span><span class="value">${clientName}</span></div>
            <div class="label-row"><span class="label">Equip:</span><span class="value">Equipamento sem identificação</span></div>
            <div class="label-footer">ORÇAMENTO: ${budget.code}</div>
          </div>
        `;
      }
      return items.map((item: any, index: number) => `
        <div class="label-card">
          <div class="label-header">ETIQUETA PARA EQUIPAMENTO ${index + 1}</div>
          <div class="label-code">${item.model ? `EQP-${budget.code.split('-')[1] || budget.code}-${String(index + 1).padStart(2, '0')}` : `ORC-${budget.code.split('-')[1] || budget.code}-${String(index + 1).padStart(2, '0')}`}</div>
          <div class="label-row"><span class="label">Cliente:</span><span class="value">${clientName}</span></div>
          <div class="label-row"><span class="label">Equip:</span><span class="value">${sanitizeForHtml(item.name)}${item.model ? ` ${sanitizeForHtml(item.model)}` : ''}</span></div>
          ${item.mark ? `<div class="label-row"><span class="label">Marca:</span><span class="value">${sanitizeForHtml(item.mark)}</span></div>` : ''}
          ${item.reported_problem ? `<div class="label-row"><span class="label">Obs:</span><span class="value">${sanitizeForHtml(item.reported_problem).substring(0, 50)}${item.reported_problem.length > 50 ? '...' : ''}</span></div>` : ''}
          <div class="label-footer">ORÇAMENTO: ${budget.code}</div>
        </div>
      `).join('');
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Orçamento ${budget.code}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 15px; font-size: 12px; }
          .header { text-align: center; margin-bottom: 12px; border-bottom: 2px solid #333; padding-bottom: 8px; }
          .company { font-size: 18px; font-weight: bold; }
          .company-phone { font-size: 12px; margin-top: 3px; }
          .budget-code { font-size: 14px; margin-top: 8px; font-weight: bold; }
          .section { margin: 10px 0; }
          .section h3 { font-size: 12px; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-bottom: 6px; }
          .row { display: flex; justify-content: space-between; margin: 3px 0; font-size: 11px; }
          .label { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10px; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total-section { margin-top: 15px; text-align: right; font-size: 16px; }
          .qr-section { text-align: center; margin-top: 10px; padding-top: 10px; border-top: 2px dashed #ccc; }
          .qr-section p { margin-top: 5px; font-size: 10px; }
          .footer { margin-top: 10px; font-size: 10px; text-align: center; color: #666; }
          .cut-line { border-top: 2px dashed #999; margin: 15px 0 10px 0; text-align: center; position: relative; }
          .cut-line::before { content: '✂️ RECORTE AQUI - COLE A ETIQUETA NO EQUIPAMENTO'; font-size: 9px; color: #999; background: white; padding: 0 10px; position: absolute; top: -8px; left: 50%; transform: translateX(-50%); white-space: nowrap; }
          .labels-container { display: flex; gap: 10px; justify-content: center; }
          .label-card { border: 2px solid #333; padding: 8px; width: 48%; min-height: 110px; }
          .label-header { font-weight: bold; font-size: 11px; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 6px; text-align: center; background: #f5f5f5; }
          .label-code { font-size: 14px; font-weight: bold; text-align: center; margin-bottom: 6px; color: #333; }
          .label-row { display: flex; margin: 2px 0; font-size: 10px; }
          .label-row .label { font-weight: bold; width: 50px; }
          .label-row .value { flex: 1; }
          .label-footer { margin-top: 6px; padding-top: 4px; border-top: 1px dashed #ccc; font-size: 9px; color: #666; text-align: center; font-weight: bold; }
          .print-btn { display: block; margin: 15px auto; padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; }
          .print-btn:hover { background: #4338ca; }
          @media print {
            .print-btn { display: none; }
            body { padding: 10px; }
            .cut-line::before { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .label-card { border-color: #000 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .label-header { background: #eee !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          @page { size: A4; margin: 0.5cm; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company">${sanitizeForHtml(budget.owner?.company_name) || 'TechFlow'}</div>
          ${budget.owner?.phone ? `<div class="company-phone">${sanitizeForHtml(budget.owner.phone)}</div>` : ''}
          <div class="budget-code">Orçamento: ${budget.code}</div>
          <div style="font-size: 11px;">Data: ${new Date(budget.created_at).toLocaleDateString('pt-BR')} ${budget.valid_until ? ` | Validade: ${new Date(budget.valid_until).toLocaleDateString('pt-BR')}` : ''}</div>
        </div>
        
        <div class="section">
          <h3>Dados do Cliente</h3>
          <div class="row"><span class="label">Nome:</span> <span>${clientName}</span></div>
          <div class="row"><span class="label">Telefone:</span> <span>${sanitizeForHtml(budget.client?.phone) || '-'}</span></div>
        </div>

        <div class="section">
          <h3>Itens do Orçamento</h3>
          <table>
            <thead>
              <tr>
                <th>Equipamento</th>
                <th>Problema</th>
                <th>Svc</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item: any) => `
                <tr>
                  <td>${sanitizeForHtml(item.name)}${item.model ? ` (${sanitizeForHtml(item.model)})` : ''}</td>
                  <td>${sanitizeForHtml(item.reported_problem) || '-'}</td>
                  <td>${item.services?.length || 0}</td>
                  <td>R$ ${Number(item.total || 0).toFixed(2)}</td>
                </tr>
              `).join('') || '<tr><td colspan="4">Sem itens</td></tr>'}
            </tbody>
          </table>
        </div>

        ${(budget.total || 0) > 0 ? `
        <div class="total-section">
          <strong>TOTAL:</strong> R$ ${Number(budget.total || 0).toFixed(2)}
        </div>
        ` : ''}

        ${budget.notes ? `
        <div class="section">
          <h3>Observações</h3>
          <p style="font-size: 10px;">${sanitizeForHtml(budget.notes)}</p>
        </div>
        ` : ''}

        <div class="qr-section">
          <img src="https://quickchart.io/qr?size=100&text=${encodeURIComponent(trackUrl)}" alt="QR Code" onload="this.style.display='block'" style="display:none;" />
          <p>Escaneie para acompanhar online | ${trackUrl}</p>
        </div>

        <div class="footer">
          Acompanhe o status do seu orçamento através do QR Code acima
        </div>

        <button class="print-btn" onclick="window.print()">Imprimir</button>

        <div class="cut-line"></div>

        <div class="labels-container">
          ${generateLabels()}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} disableCloseOutside>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Imprimir Orçamento {budget.code}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-white border rounded-lg">
              <QRCodeSVG value={trackUrl} size={150} level="H" />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Link de Acompanhamento</Label>
            <div className="flex gap-2">
              <Input value={trackUrl} readOnly className="text-xs" />
              <Button size="icon" variant="outline" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(trackUrl, '_blank')}
              className="flex-1"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Ver Página
            </Button>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            O cliente pode escanear o QR Code ou acessar o link para aprovar/rejeitar o orçamento online.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
