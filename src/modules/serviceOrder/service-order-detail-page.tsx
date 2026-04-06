import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, User, Calendar, FileText, Wrench, CreditCard, MessageCircle, Check, X, Edit3, Save, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { useServiceOrder } from '../../hooks/use-service-orders';
import { WarrantySection } from './warranty-section';
import { useUpdateServiceOrderObservation, useUpdateServiceOrderStatus, useRegisterPayment, useUpdateServiceOrderDeliveryDate } from '../../hooks/use-service-orders';
import { formatDate, formatCurrency, translatePaymentType, generateWhatsAppLink } from '../../lib/utils';
import { toast } from 'sonner';
import { getUser } from '../../lib/api';
import type { User as UserType } from '../../types';
const statusLabels: Record<string, string> = {
  CREATED: 'Criada',
  IN_PROGRESS: 'Em Concerto',
  PAUSED: 'Pausado',
  READY: 'Pronto',
  PAID: 'Pago',
  COMPLETED: 'Finalizado',
  CANCELED: 'Cancelado',
};

export function ServiceOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { serviceOrder, isLoading, refetch } = useServiceOrder(id || '');
  const updateObservation = useUpdateServiceOrderObservation();
  const updateStatus = useUpdateServiceOrderStatus();
  const registerPayment = useRegisterPayment();
  const updateDeliveryDate = useUpdateServiceOrderDeliveryDate();
  const [observation, setObservation] = useState('');
  const [isEditingObservation, setIsEditingObservation] = useState(false);
  const [showPaymentSection, setShowPaymentSection] = useState(false);
  const [isEditingDeliveryDate, setIsEditingDeliveryDate] = useState(false);
  const [newDeliveryDate, setNewDeliveryDate] = useState('');
  const observationRef = useRef<HTMLTextAreaElement>(null);
  const justSavedRef = useRef(false);

  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('FIXED');
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentType, setPaymentType] = useState<'CASH' | 'PIX' | 'CREDIT' | 'DEBIT' | 'BANK_SLIP'>('PIX');

  useEffect(() => {
    if (serviceOrder) {
      setObservation(serviceOrder.observation || '');
      if (!justSavedRef.current) {
        setIsEditingObservation(!!serviceOrder.observation);
      }
      justSavedRef.current = false;
    }
  }, [serviceOrder]);

  useEffect(() => {
    if (serviceOrder?.budget?.total) {
      setPaidAmount(serviceOrder.budget.total);
    }
  }, [serviceOrder]);

  useEffect(() => {
    if (serviceOrder?.delivery_date) {
      const date = new Date(serviceOrder.delivery_date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setNewDeliveryDate(`${year}-${month}-${day}`);
    }
  }, [serviceOrder?.delivery_date]);

  const handleSaveDeliveryDate = async () => {
    if (!id || !newDeliveryDate) return;
    try {
      await updateDeliveryDate.mutateAsync({ id, delivery_date: newDeliveryDate });
      setIsEditingDeliveryDate(false);
      refetch();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleSaveObservation = async () => {
    if (!id) return;
    try {
      await updateObservation.mutateAsync({ id, observation });
      justSavedRef.current = true;
      setIsEditingObservation(false);
      observationRef.current?.blur();
      refetch();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    try {
      await updateStatus.mutateAsync({ id, data: { status: newStatus } });
      refetch();
    } catch (error) {
      // Error handled in hook
    }
  };

  const calculateFinalAmount = () => {
    const total = serviceOrder?.budget?.total || 0;
    if (!discount || discount <= 0) return total;
    if (discountType === 'PERCENTAGE') {
      return total - (total * (discount / 100));
    }
    return total - discount;
  };

  const handleRegisterPayment = async () => {
    if (!id || !serviceOrder?.budget?.total) return;
    
    try {
      await registerPayment.mutateAsync({
        id,
        data: {
          final_amount: serviceOrder.budget.total,
          discount: discount || undefined,
          discount_type: discount || undefined ? discountType : undefined,
          paid_amount: paidAmount,
          payment_type: paymentType,
        },
      });
      setShowPaymentSection(false);
      refetch();
    } catch (error) {
      // Error handled in hook
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  const so = serviceOrder as any;

  const handlePrint = () => {
    if (!so) return;
    const baseUrl = window.location.origin;
    const trackUrl = `${baseUrl}/track?token=${so.public_token}`;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const clientName = so.budget?.client?.client_name || so.budget?.client?.company_name || '-';
    const items = so.budget?.items || [];

    const generateLabels = () => {
      if (items.length === 0) {
        return `
          <div class="label-card">
            <div class="label-header">ETIQUETA PARA EQUIPAMENTO 1</div>
            <div class="label-code">OS-${so.code.split('-')[1] || so.code}-01</div>
            <div class="label-row"><span class="label">Cliente:</span><span class="value">${clientName}</span></div>
            <div class="label-row"><span class="label">Equip:</span><span class="value">Equipamento sem identificação</span></div>
            <div class="label-footer">OS: ${so.code}</div>
          </div>
          <div class="label-card">
            <div class="label-header">ETIQUETA PARA EQUIPAMENTO 2</div>
            <div class="label-code">OS-${so.code.split('-')[1] || so.code}-02</div>
            <div class="label-row"><span class="label">Cliente:</span><span class="value">${clientName}</span></div>
            <div class="label-row"><span class="label">Equip:</span><span class="value">Equipamento sem identificação</span></div>
            <div class="label-footer">OS: ${so.code}</div>
          </div>
        `;
      }
      return items.map((item: any, index: number) => `
        <div class="label-card">
          <div class="label-header">ETIQUETA PARA EQUIPAMENTO ${index + 1}</div>
          <div class="label-code">${item.model ? `EQP-${so.code.split('-')[1] || so.code}-${String(index + 1).padStart(2, '0')}` : `OS-${so.code.split('-')[1] || so.code}-${String(index + 1).padStart(2, '0')}`}</div>
          <div class="label-row"><span class="label">Cliente:</span><span class="value">${clientName}</span></div>
          <div class="label-row"><span class="label">Equip:</span><span class="value">${item.name}${item.model ? ` ${item.model}` : ''}</span></div>
          ${item.mark ? `<div class="label-row"><span class="label">Marca:</span><span class="value">${item.mark}</span></div>` : ''}
          ${item.reported_problem ? `<div class="label-row"><span class="label">Obs:</span><span class="value">${item.reported_problem.substring(0, 50)}${item.reported_problem.length > 50 ? '...' : ''}</span></div>` : ''}
          <div class="label-footer">OS: ${so.code}</div>
        </div>
      `).join('');
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>OS ${so.code}</title>
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
          <div class="company">${so.owner?.company_name || 'TechFlow'}</div>
          <div class="os">Ordem de Serviço: ${so.code}</div>
        </div>
        
        <div class="section">
          <h3>Dados do Cliente</h3>
          <div class="row"><span class="label">Nome:</span> <span>${clientName}</span></div>
          <div class="row"><span class="label">Telefone:</span> <span>${so.budget?.client?.phone || '-'}</span></div>
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
          <div class="row"><span class="label">Status:</span> <span>${statusLabels[so.status?.name] || so.status?.name || '-'}</span></div>
          <div class="row"><span class="label">Entrada:</span> <span>${new Date(so.created_at).toLocaleDateString('pt-BR')}</span></div>
        </div>

        ${so.observation ? `
        <div class="section">
          <h3>Observações</h3>
          <p style="font-size: 10px;">${so.observation}</p>
        </div>
        ` : ''}

        <div class="qr-section">
          <img src="https://quickchart.io/qr?size=100&text=${encodeURIComponent(trackUrl)}" alt="QR Code" onload="this.style.display='block'" style="display:none;" />
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

  if (!serviceOrder) {
    return (
      <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-2">Ordem de Serviço não encontrada</h2>
        <Button onClick={() => navigate('/service-orders')}>Voltar para Ordens de Serviço</Button>
      </div>
    );
  }

  const budgetItems = so?.budget?.items || [];

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/service-orders')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <h1 className="text-2xl font-semibold">OS {serviceOrder.code}</h1>
              <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-800">
                {statusLabels[serviceOrder.status?.name] || serviceOrder.status?.name}
              </span>
            </div>
            <p className="text-muted-foreground">
              Cliente: {serviceOrder.budget?.client?.client_name || serviceOrder.budget?.client?.company_name || '-'}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
              onClick={() => {
                const clientName = so?.budget?.client?.client_name || so?.budget?.client?.company_name || 'Cliente';
                const currentUser = getUser<UserType>();
                const waLink = generateWhatsAppLink({
                  phone: so?.budget?.client?.phone,
                  name: clientName,
                  code: so?.code,
                  token: so?.public_token,
                  status: so?.status?.name,
                  userName: currentUser?.name,
                  companyName: currentUser?.company_name,
                  type: 'service_order',
                  serviceOrderCode: so?.code,
                  finalAmount: so?.final_amount || so?.budget?.total,
                });
                if (waLink) {
                  window.open(waLink, '_blank');
                } else {
                  toast.error('Cliente sem telefone cadastrado');
                }
              }}
              title="Enviar atualização via WhatsApp"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {serviceOrder.status?.name === 'CREATED' && (
            <Button size="sm" onClick={() => handleStatusChange('IN_PROGRESS')}>
              Iniciar Serviço
            </Button>
          )}
          {serviceOrder.status?.name === 'IN_PROGRESS' && (
            <>
              <Button size="sm" variant="outline" onClick={() => handleStatusChange('PAUSED')}>
                Pausar
              </Button>
              <Button size="sm" onClick={() => handleStatusChange('READY')}>
                Marcar Pronto
              </Button>
            </>
          )}
          {serviceOrder.status?.name === 'PAUSED' && (
            <Button size="sm" onClick={() => handleStatusChange('IN_PROGRESS')}>
              Retomar
            </Button>
          )}
          {serviceOrder.status?.name === 'READY' && !showPaymentSection && (
            <Button size="sm" onClick={() => setShowPaymentSection(true)}>
              <CreditCard className="w-4 h-4 mr-2" />
              Confirmar Pagamento
            </Button>
          )}
          {serviceOrder.status?.name === 'PAID' && (
            <Button size="sm" onClick={() => handleStatusChange('COMPLETED')}>
              Finalizar OS
            </Button>
          )}
        </div>

        <WarrantySection serviceOrder={so} />

        {showPaymentSection && serviceOrder.status?.name === 'READY' && (
          <Card className="mb-6 border-green-200 bg-green-50/50">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Registrar Pagamento</h3>
              </div>
              
              <div className="grid gap-4">
                {(serviceOrder.budget?.total || 0) > 0 && (
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <span className="text-sm text-muted-foreground">Valor Total</span>
                    <span className="font-semibold text-lg">{formatCurrency(serviceOrder.budget?.total || 0)}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Desconto</label>
                    <div className="flex">
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as 'PERCENTAGE' | 'FIXED')}
                        className="w-20 rounded-l-md border border-r-0 bg-background px-2 py-2 text-sm"
                      >
                        <option value="FIXED">R$</option>
                        <option value="PERCENTAGE">%</option>
                      </select>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={discount || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^\d.]/g, '');
                          setDiscount(parseFloat(val) || 0);
                        }}
                        placeholder={discountType === 'PERCENTAGE' ? '0' : '0,00'}
                        className="flex-1 rounded-r-md border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Valor Pago</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={paidAmount || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^\d.]/g, '');
                        setPaidAmount(parseFloat(val) || 0);
                      }}
                      placeholder="0,00"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Forma de Pagamento</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as typeof paymentType)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="PIX">PIX</option>
                    <option value="CASH">Dinheiro</option>
                    <option value="CREDIT">Cartão de Crédito</option>
                    <option value="DEBIT">Cartão de Débito</option>
                    <option value="BANK_SLIP">Boleto</option>
                  </select>
                </div>

                {discount > 0 && (
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <span className="text-sm text-muted-foreground">
                      Total com Desconto ({discountType === 'PERCENTAGE' ? `${discount}%` : formatCurrency(discount)})
                    </span>
                    <span className="font-semibold text-lg text-green-600">
                      {formatCurrency(calculateFinalAmount())}
                    </span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={handleRegisterPayment}
                    disabled={registerPayment.isPending}
                  >
                    {registerPayment.isPending ? 'Registrando...' : 'Confirmar Pagamento'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowPaymentSection(false);
                      setDiscount(0);
                      setPaidAmount(serviceOrder.budget?.total || 0);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Dados do Cliente</span>
              </div>
              <p className="text-lg">{so?.budget?.client?.client_name || so?.budget?.client?.company_name || '-'}</p>
              <p className="text-sm text-muted-foreground">{so?.budget?.client?.email}</p>
              <p className="text-sm text-muted-foreground">{so?.budget?.client?.phone}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Datas</span>
              </div>
              <p className="text-sm">Criado em: {formatDate(so?.created_at)}</p>
              {isEditingDeliveryDate ? (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={newDeliveryDate}
                    onChange={(e) => setNewDeliveryDate(e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  />
                  <Button size="sm" onClick={handleSaveDeliveryDate} disabled={updateDeliveryDate.isPending}>
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditingDeliveryDate(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-sm">
                    Previsão de entrega: {so?.delivery_date ? formatDate(so?.delivery_date) : 'Não definida'}
                  </p>
                  <button
                    onClick={() => setIsEditingDeliveryDate(true)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Editar data de entrega"
                  >
                    <Edit3 className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              )}
              {so?.delivered_at && (
                <p className="text-sm">Entregue em: {formatDate(so?.delivered_at)}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {serviceOrder.budget && (
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4" />
                <span className="font-medium">Orçamento de Origem</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Código:</span>
                  <span className="ml-1">{serviceOrder.budget.code}</span>
                </div>
                {(serviceOrder.budget.total || 0) > 0 && (
                  <div>
                    <span className="text-muted-foreground">Total:</span>
                    <span className="ml-1 font-medium text-green-600">{formatCurrency(serviceOrder.budget.total || 0)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Wrench className="w-5 h-5" />
          Serviços a Executar
        </h2>

        <div className="space-y-4 mb-6">
          {budgetItems.map((item: any, index: number) => (
            <Card key={item.id || index}>
              <CardContent className="py-4">
                <div className="mb-2">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.model && `${item.model} • `}
                    {item.mark && `${item.mark} • `}
                    Qtd: {item.quantity}
                  </p>
                </div>
                {item.reported_problem && (
                  <div className="mb-2">
                    <span className="text-xs text-muted-foreground">Problema:</span>
                    <p className="text-sm">{item.reported_problem}</p>
                  </div>
                )}
                {item.services && item.services.length > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground">Serviços:</span>
                    <ul className="mt-1 space-y-1">
                      {item.services.map((svc: any, i: number) => (
                        <li key={i} className="flex justify-between text-sm">
                          <span>{svc.name} (x{svc.quantity})</span>
                          <span>{formatCurrency(svc.total)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-6 border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="font-medium text-slate-700">Observações Técnicas</span>
              </div>
              {!updateObservation.isPending && (
                isEditingObservation ? (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleSaveObservation}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 px-2"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setObservation(serviceOrder?.observation || '');
                        setIsEditingObservation(false);
                      }}
                      className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 h-8 px-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingObservation(true)}
                    className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 h-8 px-2"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                )
              )}
            </div>

            {updateObservation.isPending ? (
              <div className="flex items-center justify-center py-8 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Salvando...</span>
              </div>
            ) : isEditingObservation ? (
              <div className="space-y-2">
                <textarea
                  ref={observationRef}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  rows={4}
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="Descreva observações técnicas, diagnósticos, procedimentos realizados..."
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {observation.length} caracteres
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setObservation(serviceOrder?.observation || '');
                        setIsEditingObservation(false);
                      }}
                      className="h-8"
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveObservation}
                      className="h-8 bg-blue-600 hover:bg-blue-700"
                      disabled={observation === (serviceOrder?.observation || '')}
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Salvar
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                className="min-h-[60px] rounded-lg bg-slate-50 p-3 cursor-text transition-colors hover:bg-slate-100"
                onClick={() => setIsEditingObservation(true)}
              >
                {serviceOrder?.observation ? (
                  <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {serviceOrder.observation}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    Clique para adicionar observações técnicas...
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-50">
          <CardContent className="py-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(serviceOrder.final_amount || serviceOrder.budget?.total || 0)}
              </span>
            </div>
            {serviceOrder.discount && serviceOrder.discount > 0 && (
              <p className="text-sm text-muted-foreground text-right">
                Desconto: {formatCurrency(serviceOrder.discount)}
              </p>
            )}
            {serviceOrder.paid_amount && serviceOrder.paid_amount > 0 && (
              <p className="text-sm text-emerald-600 font-medium text-right">
                Pago: {formatCurrency(serviceOrder.paid_amount)}
                {serviceOrder.payment_type && (
                  <span className="text-muted-foreground ml-2">
                    ({translatePaymentType(serviceOrder.payment_type)})
                  </span>
                )}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
