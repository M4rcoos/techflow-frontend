import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Copy, Check, QrCode, User, Phone, Mail, Calendar, FileText, Wrench } from 'lucide-react';
import { formatDate, formatCurrency } from '../../lib/utils';
import { useUpdateServiceOrderObservation } from '../../hooks/use-service-orders';

interface ServiceOrderDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceOrder: any;
}

const statusLabels: Record<string, string> = {
  CREATED: 'Criada',
  IN_PROGRESS: 'Em Concerto',
  PAUSED: 'Pausado',
  READY: 'Pronto',
  PAID: 'Pago',
  COMPLETED: 'Finalizado',
  CANCELED: 'Cancelado',
};

export function ServiceOrderDetailModal({ open, onOpenChange, serviceOrder }: ServiceOrderDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [observation, setObservation] = useState('');
  const [isEditingObservation, setIsEditingObservation] = useState(false);
  
  const updateObservation = useUpdateServiceOrderObservation();

  useEffect(() => {
    if (open && serviceOrder) {
      setObservation(serviceOrder.observation || '');
      setIsEditingObservation(!!serviceOrder.observation);
    }
  }, [open, serviceOrder]);

  if (!serviceOrder) return null;

  const baseUrl = window.location.origin;
  const trackUrl = serviceOrder.budget?.public_token 
    ? `${baseUrl}/track?token=${serviceOrder.budget.public_token}`
    : `${baseUrl}/track?token=${serviceOrder.public_token}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(trackUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveObservation = async () => {
    try {
      await updateObservation.mutateAsync({
        id: serviceOrder.id,
        observation,
      });
      setIsEditingObservation(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const clientName = serviceOrder.budget?.client?.client_name || serviceOrder.budget?.client?.company_name || '-';
    const items = serviceOrder.budget?.items || [];

    const generateLabels = () => {
      if (items.length === 0) {
        return `
          <div class="label-card">
            <div class="label-header">ETIQUETA PARA EQUIPAMENTO 1</div>
            <div class="label-code">OS-${serviceOrder.code.split('-')[1] || serviceOrder.code}-01</div>
            <div class="label-row"><span class="label">Cliente:</span><span class="value">${clientName}</span></div>
            <div class="label-row"><span class="label">Equip:</span><span class="value">Equipamento sem identificação</span></div>
            <div class="label-footer">OS: ${serviceOrder.code}</div>
          </div>
          <div class="label-card">
            <div class="label-header">ETIQUETA PARA EQUIPAMENTO 2</div>
            <div class="label-code">OS-${serviceOrder.code.split('-')[1] || serviceOrder.code}-02</div>
            <div class="label-row"><span class="label">Cliente:</span><span class="value">${clientName}</span></div>
            <div class="label-row"><span class="label">Equip:</span><span class="value">Equipamento sem identificação</span></div>
            <div class="label-footer">OS: ${serviceOrder.code}</div>
          </div>
        `;
      }
      return items.map((item: any, index: number) => `
        <div class="label-card">
          <div class="label-header">ETIQUETA PARA EQUIPAMENTO ${index + 1}</div>
          <div class="label-code">${item.model ? `EQP-${serviceOrder.code.split('-')[1] || serviceOrder.code}-${String(index + 1).padStart(2, '0')}` : `OS-${serviceOrder.code.split('-')[1] || serviceOrder.code}-${String(index + 1).padStart(2, '0')}`}</div>
          <div class="label-row"><span class="label">Cliente:</span><span class="value">${clientName}</span></div>
          <div class="label-row"><span class="label">Equip:</span><span class="value">${item.name}${item.model ? ` ${item.model}` : ''}</span></div>
          ${item.mark ? `<div class="label-row"><span class="label">Marca:</span><span class="value">${item.mark}</span></div>` : ''}
          ${item.reported_problem ? `<div class="label-row"><span class="label">Obs:</span><span class="value">${item.reported_problem.substring(0, 50)}${item.reported_problem.length > 50 ? '...' : ''}</span></div>` : ''}
          <div class="label-footer">OS: ${serviceOrder.code}</div>
        </div>
      `).join('');
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>OS ${serviceOrder.code}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 15px; font-size: 12px; }
          .header { text-align: center; margin-bottom: 12px; border-bottom: 2px solid #333; padding-bottom: 8px; }
          .company { font-size: 20px; font-weight: bold; }
          .os { font-size: 14px; margin-top: 5px; }
          .section { margin: 10px 0; }
          .section h3 { font-size: 12px; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-bottom: 6px; }
          .row { display: flex; justify-content: space-between; margin: 3px 0; font-size: 11px; }
          .label { font-weight: bold; }
          .qr-section { text-align: center; margin-top: 10px; padding-top: 10px; border-top: 2px dashed #ccc; }
          .qr-section p { margin-top: 5px; font-size: 10px; }
          .cut-line { border-top: 2px dashed #999; margin: 15px 0 10px 0; text-align: center; position: relative; }
          .cut-line::before { content: '✂️ RECORTE AQUI - COLE A ETIQUETA NO EQUIPAMENTO'; font-size: 9px; color: #999; background: white; padding: 0 10px; position: absolute; top: -8px; left: 50%; transform: translateX(-50%); white-space: nowrap; }
          .labels-container { display: flex; gap: 10px; justify-content: center; }
          .label-card { border: 2px solid #333; padding: 8px; width: 48%; min-height: 120px; }
          .label-header { font-weight: bold; font-size: 11px; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 6px; text-align: center; background: #f5f5f5; }
          .label-code { font-size: 14px; font-weight: bold; text-align: center; margin-bottom: 6px; color: #333; }
          .label-row { display: flex; margin: 2px 0; font-size: 10px; }
          .label-row .label { font-weight: bold; width: 50px; }
          .label-row .value { flex: 1; }
          .label-footer { margin-top: 6px; padding-top: 4px; border-top: 1px dashed #ccc; font-size: 9px; color: #666; text-align: center; font-weight: bold; }
          @media print {
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
          <div class="company">${serviceOrder.owner?.company_name || 'TechFlow'}</div>
          <div class="os">Ordem de Serviço: ${serviceOrder.code}</div>
        </div>
        
        <div class="section">
          <h3>Dados do Cliente</h3>
          <div class="row"><span class="label">Nome:</span> <span>${clientName}</span></div>
          <div class="row"><span class="label">Telefone:</span> <span>${serviceOrder.budget?.client?.phone || '-'}</span></div>
        </div>

        <div class="section">
          <h3>Equipamento</h3>
          ${items.length > 0 ? items.map((item: any) => `
            <div class="row"><span class="label">${item.name}${item.model ? ` - ${item.model}` : ''}${item.mark ? ` (${item.mark})` : ''}</span></div>
            <div class="row"><span class="label">Problema:</span> <span>${item.reported_problem || '-'}</span></div>
          `).join('') : '<div class="row"><span>Sem equipamentos cadastrados</span></div>'}
        </div>

        <div class="section">
          <h3>Status</h3>
          <div class="row"><span class="label">Status:</span> <span>${serviceOrder.status?.name || '-'}</span></div>
          <div class="row"><span class="label">Entrada:</span> <span>${new Date(serviceOrder.created_at).toLocaleDateString('pt-BR')}</span></div>
          ${serviceOrder.delivered_at ? `<div class="row"><span class="label">Entrega:</span> <span>${new Date(serviceOrder.delivered_at).toLocaleDateString('pt-BR')}</span></div>` : ''}
        </div>

        ${serviceOrder.observation ? `
        <div class="section">
          <h3>Observações</h3>
          <p style="font-size: 10px;">${serviceOrder.observation}</p>
        </div>
        ` : ''}

        <div class="qr-section">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(trackUrl)}" alt="QR Code" />
          <p>Escaneie para acompanhar sua OS | ${trackUrl}</p>
        </div>

        <div class="cut-line"></div>

        <div class="labels-container">
          ${generateLabels()}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const budgetItems = serviceOrder.budget?.items || [];
  const totalBudget = budgetItems.reduce((sum: number, item: any) => {
    const itemServices = item.services || [];
    return sum + itemServices.reduce((svcSum: number, svc: any) => svcSum + Number(svc.total || 0), 0);
  }, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Ordem de Serviço {serviceOrder.code}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status e Datas */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {statusLabels[serviceOrder.status?.name] || serviceOrder.status?.name}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Criado em: {formatDate(serviceOrder.created_at)}
            </div>
            {serviceOrder.delivered_at && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Entrega: {formatDate(serviceOrder.delivered_at)}
              </div>
            )}
          </div>

          {/* Dados do Cliente */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Dados do Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Nome:</span>
                <p className="font-medium">{serviceOrder.budget?.client?.client_name || serviceOrder.budget?.client?.company_name || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tipo:</span>
                <p className="font-medium">{serviceOrder.budget?.client?.client_type?.name || '-'}</p>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span>{serviceOrder.budget?.client?.email || '-'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Telefone:</span>
                <span>{serviceOrder.budget?.client?.phone || '-'}</span>
              </div>
            </div>
          </div>

          {/* Orçamento de Origem */}
          {serviceOrder.budget && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Orçamento de Origem
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Código:</span>
                  <span className="font-medium ml-1">{serviceOrder.budget.code}</span>
                </div>
                {(serviceOrder.budget.total || totalBudget) > 0 && (
                  <div>
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium ml-1 text-green-600">{formatCurrency(serviceOrder.budget.total || totalBudget)}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Status do Orçamento:</span>
                  <span className="font-medium ml-1">{serviceOrder.budget.status?.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Criado por:</span>
                  <span className="font-medium ml-1">{serviceOrder.budget.createdBy?.name || '-'}</span>
                </div>
                {serviceOrder.budget.updatedBy && (
                  <div className="md:col-span-2">
                    <span className="text-muted-foreground">Aprovado por:</span>
                    <span className="font-medium ml-1">{serviceOrder.budget.updatedBy.name} ({serviceOrder.budget.updatedBy.role})</span>
                  </div>
                )}
              </div>
              {serviceOrder.budget.notes && (
                <div className="mt-3 pt-3 border-t">
                  <span className="text-muted-foreground text-sm">Observações do orçamento:</span>
                  <p className="text-sm mt-1">{serviceOrder.budget.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Serviços a Executar */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Serviços a Executar
            </h3>
            <div className="space-y-3">
              {budgetItems.map((item: any, index: number) => (
                <div key={item.id || index} className="bg-slate-50 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.model && `${item.model} • `}
                        {item.mark && `${item.mark} • `}
                        Qtd: {item.quantity}
                      </p>
                    </div>
                  </div>
                  {item.reported_problem && (
                    <div className="mb-2">
                      <span className="text-xs text-muted-foreground">Problema relatado:</span>
                      <p className="text-sm">{item.reported_problem}</p>
                    </div>
                  )}
                  {item.diagnosed_problem && (
                    <div className="mb-2">
                      <span className="text-xs text-muted-foreground">Diagnóstico:</span>
                      <p className="text-sm">{item.diagnosed_problem}</p>
                    </div>
                  )}
                  {item.services && item.services.length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground">Serviços/Peças:</span>
                      <ul className="mt-1 space-y-1">
                        {item.services.map((svc: any, svcIndex: number) => (
                          <li key={svcIndex} className="flex justify-between text-sm">
                            <span>{svc.name} (x{svc.quantity})</span>
                            <span className="font-medium">{formatCurrency(svc.total)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Observações da OS */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Observações Técnicas
            </h3>
            {isEditingObservation ? (
              <div className="space-y-2">
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={observation}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setObservation(e.target.value)}
                  placeholder="Adicione observações sobre o serviço..."
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={handleSaveObservation}
                    disabled={updateObservation.isPending}
                  >
                    {updateObservation.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setObservation(serviceOrder.observation || '');
                      setIsEditingObservation(false);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {serviceOrder.observation || 'Nenhuma observação adicionada.'}
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setIsEditingObservation(true)}
                >
                  {serviceOrder.observation ? 'Editar Observação' : 'Adicionar Observação'}
                </Button>
              </div>
            )}
          </div>

          {/* QR Code e Links */}
          <div className="flex flex-col items-center gap-4 pt-4 border-t">
            <div className="p-4 bg-white border rounded-lg">
              <QRCodeSVG value={trackUrl} size={150} />
            </div>

            <div className="w-full">
              <Label className="text-xs text-muted-foreground">Link de Acompanhamento</Label>
              <div className="flex gap-2">
                <Input value={trackUrl} readOnly className="text-xs" />
                <Button size="icon" variant="outline" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="flex gap-2 w-full">
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
