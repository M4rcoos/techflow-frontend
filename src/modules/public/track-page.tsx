import { useState, useEffect } from 'react';
import { useSearchParams, Link, useParams } from 'react-router-dom';
import { 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Wrench,
  Phone,
  Printer,
  RefreshCw,
  Truck,
  MapPin,
  Mail
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { publicService, type PublicServiceOrder } from '../../services/public.service';
import { toast } from 'sonner';
import { maskCNPJ } from '../../lib/cookie-utils';

const statusConfig: Record<string, { 
  label: string; 
  color: string; 
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: any 
}> = {
  DRAFT: { label: 'Recebido', color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200', icon: Package },
  IN_ANALYSIS: { label: 'Em Análise', color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200', icon: Wrench },
  SENT: { label: 'Aguardando Aprovação', color: 'bg-orange-500', bgColor: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-200', icon: Clock },
  APPROVED: { label: 'Aprovado', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200', icon: CheckCircle },
  REJECTED: { label: 'Rejeitado', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200', icon: XCircle },
  CREATED: { label: 'Serviço Agendado', color: 'bg-purple-500', bgColor: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-200', icon: Clock },
  IN_PROGRESS: { label: 'Em Serviço', color: 'bg-indigo-500', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700', borderColor: 'border-indigo-200', icon: Wrench },
  PAUSED: { label: 'Pausado', color: 'bg-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200', icon: Clock },
  READY: { label: 'Pronto para Retirada', color: 'bg-cyan-500', bgColor: 'bg-cyan-50', textColor: 'text-cyan-700', borderColor: 'border-cyan-200', icon: Truck },
  PAID: { label: 'Pago', color: 'bg-green-600', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200', icon: CheckCircle },
  COMPLETED: { label: 'Entregue', color: 'bg-emerald-500', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200', icon: CheckCircle },
  CANCELED: { label: 'Cancelado', color: 'bg-gray-500', bgColor: 'bg-gray-50', textColor: 'text-gray-700', borderColor: 'border-gray-200', icon: XCircle },
};

const steps = [
  { key: 'DRAFT', label: 'Recebido' },
  { key: 'IN_ANALYSIS', label: 'Análise' },
  { key: 'SENT', label: 'Aguardando' },
  { key: 'APPROVED', label: 'Aprovado' },
  { key: 'IN_PROGRESS', label: 'Trabalhando' },
  { key: 'READY', label: 'Pronto' },
  { key: 'COMPLETED', label: 'Entregue' },
];

const stepIndex: Record<string, number> = {
  DRAFT: 0,
  IN_ANALYSIS: 1,
  SENT: 2,
  APPROVED: 3,
  CREATED: 3,
  IN_PROGRESS: 4,
  PAUSED: 4,
  READY: 5,
  PAID: 5,
  COMPLETED: 6,
  REJECTED: -1,
  CANCELED: -1,
};

export function TrackPage() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  
  const tokenFromQuery = searchParams.get('token');
  const tokenFromParams = params.token;
  const token = tokenFromQuery || tokenFromParams;
  
  const [data, setData] = useState<PublicServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await publicService.getServiceOrder(token!);
      setData(result);
    } catch {
      toast.error('Orçamento não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setApproving(true);
      await publicService.approveBudget(token!);
      toast.success('Orçamento aprovado com sucesso!');
      setShowApproveModal(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao aprovar orçamento');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    try {
      setRejecting(true);
      await publicService.rejectBudget(token!, rejectReason);
      toast.success('Orçamento rejeitado');
      setShowRejectModal(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao rejeitar orçamento');
    } finally {
      setRejecting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const handleWhatsApp = () => {
    if (!data?.owner.phone) return;
    const phone = data.owner.phone.replace(/\D/g, '');
    const message = `Olá, estou acompanhando o serviço ${data.code} e tenho uma dúvida.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Orçamento não encontrado</h1>
          <p className="text-gray-600 mb-4">Verifique o link ou tente novamente.</p>
          <Link to="/">
            <Button>Voltar ao início</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isServiceOrder = data.type === 'service_order';
  const currentStep = isServiceOrder 
    ? (stepIndex[data.status] ?? 3) 
    : (stepIndex[data.budget_status] ?? stepIndex[data.status] ?? 0);
  const isRejected = data.status === 'REJECTED' || data.budget_status === 'REJECTED';
  const isCanceled = data.status === 'CANCELED';
  const canApprove = data.budget_status === 'SENT' && !isServiceOrder;
  const statusInfo = isServiceOrder 
    ? (statusConfig[data.status] || statusConfig.CREATED)
    : (statusConfig[data.budget_status] || statusConfig[data.status] || statusConfig.DRAFT);

  const items = data.budget?.items || data.items || [];
  const finalAmount = data.serviceOrder?.final_amount || data.budget?.total || data.total || 0;
  const observation = data.serviceOrder?.observation;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 px-4 no-print">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{data.owner.company_name}</h1>
              <p className="text-white/80">Acompanhamento de Serviço</p>
            </div>
            <Button
              variant="outline"
              onClick={handlePrint}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Código</p>
              <h2 className="text-2xl font-bold text-gray-900">{data.code}</h2>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm ${statusInfo.color}`}>
              <statusInfo.icon className="w-4 h-4" />
              {statusInfo.label}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Cliente: <strong>{data.client.name}</strong>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-start gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <MapPin className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{data.owner.company_name}</h3>
              {data.owner.cnpj && (
                <p className="text-sm text-gray-500">CNPJ: {maskCNPJ(data.owner.cnpj)}</p>
              )}
              {data.owner.email && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <Mail className="w-3 h-3" />
                  {data.owner.email}
                </p>
              )}
              {data.owner.phone && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <Phone className="w-3 h-3" />
                  {data.owner.phone}
                </p>
              )}
              {data.owner.address && (
                <p className="text-sm text-gray-500 mt-2">
                  {data.owner.address.street}, {data.owner.address.number}
                  {data.owner.address.complement && `, ${data.owner.address.complement}`}
                  <br />
                  {data.owner.address.neighborhood} - {data.owner.address.city}/{data.owner.address.state}
                  <br />
                  CEP: {data.owner.address.zip_code}
                </p>
              )}
            </div>
          </div>
        </div>

        {!isRejected && !isCanceled ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Andamento</h3>
              {isServiceOrder && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  Ordem de Serviço
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10"></div>
              <div 
                className="absolute top-5 left-0 h-1 bg-indigo-600 -z-10 transition-all"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              ></div>
              <div className="flex justify-between">
                {steps.map((step, index) => {
                  const isCompleted = index <= currentStep;
                  const isCurrent = index === currentStep;
                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-indigo-200' : ''}`}
                      >
                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : <span className="text-sm">{index + 1}</span>}
                      </div>
                      <span className={`text-xs mt-2 text-center ${isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <h3 className="font-semibold text-red-700">
              {isCanceled ? 'Ordem de Serviço Cancelada' : 'Orçamento Rejeitado'}
            </h3>
            <p className="text-sm text-red-600 mt-1">Entre em contato para mais informações.</p>
          </div>
        )}

        {data.budget_status === 'SENT' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Detalhes do Serviço</h3>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.model && <p className="text-sm text-gray-500">Modelo: {item.model}</p>}
                      {item.mark && <p className="text-sm text-gray-500">Marca: {item.mark}</p>}
                    </div>
                    <p className="font-medium">{formatCurrency(item.total)}</p>
                  </div>
                  {item.reported_problem && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <p className="text-gray-500">Problema:</p>
                      <p>{item.reported_problem}</p>
                    </div>
                  )}
                  {item.diagnosed_problem && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                      <p className="text-blue-600">Diagnóstico:</p>
                      <p>{item.diagnosed_problem}</p>
                    </div>
                  )}
                  {item.services && item.services.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-600">Serviços:</p>
                      {item.services.map((service, i) => (
                        <div key={i} className="flex justify-between text-sm ml-2 mt-1">
                          <span>{service.name} (x{service.quantity})</span>
                          <span className="text-gray-600">{formatCurrency(service.total)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="font-semibold text-lg">Total</span>
              <span className="text-2xl font-bold text-indigo-600">
                {formatCurrency(finalAmount)}
              </span>
            </div>
          </div>
        )}

        {(data.status === 'DRAFT' || data.budget_status === 'DRAFT' || data.status === 'IN_ANALYSIS' || data.budget_status === 'IN_ANALYSIS') && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <Clock className="w-12 h-12 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-700 mb-2">Em Preparação</h3>
            <p className="text-sm text-blue-600">
              Estamos preparando o orçamento detalhado para você. Em breve estará pronto para aprovação.
            </p>
          </div>
        )}

        {canApprove && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 no-print">
            <h3 className="font-semibold text-orange-800 mb-2">Sua Ação é Necessária</h3>
            <p className="text-sm text-orange-700 mb-4">
              O orçamento está pronto! Por favor, aprove ou rejeite para darmos continuidade.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setShowApproveModal(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprovar Orçamento
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRejectModal(true)}
                className="border-orange-300 text-orange-600 hover:bg-orange-100"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Rejeitar
              </Button>
              <Button
                variant="outline"
                onClick={handleWhatsApp}
                className="ml-auto"
              >
                <Phone className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </div>
          </div>
        )}

        {observation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Observação Técnica</h3>
            <p className="text-sm text-blue-700 whitespace-pre-wrap">{observation}</p>
          </div>
        )}

        {isServiceOrder && data.serviceOrder && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Detalhes do Serviço</h3>
            <div className="space-y-3">
              {data.budget?.items?.map((item, index) => (
                <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.model && <p className="text-sm text-gray-500">Modelo: {item.model}</p>}
                      {item.mark && <p className="text-sm text-gray-500">Marca: {item.mark}</p>}
                    </div>
                  </div>
                  {item.reported_problem && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <p className="text-gray-500">Problema relatado:</p>
                      <p>{item.reported_problem}</p>
                    </div>
                  )}
                  {item.diagnosed_problem && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                      <p className="text-blue-600">Diagnóstico técnico:</p>
                      <p>{item.diagnosed_problem}</p>
                    </div>
                  )}
                  {item.service_performed && (
                    <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                      <p className="text-green-600">Serviço realizado:</p>
                      <p>{item.service_performed}</p>
                    </div>
                  )}
                  {item.services && item.services.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-600">Serviços executados:</p>
                      {item.services.map((service, i) => (
                        <div key={i} className="flex justify-between text-sm ml-2 mt-1">
                          <span>{service.name} (x{service.quantity})</span>
                          <span className="text-gray-600">{formatCurrency(service.total)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {data.serviceOrder.discount > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="text-gray-600">{formatCurrency(finalAmount + data.serviceOrder.discount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Desconto:</span>
                  <span className="text-green-600">-{formatCurrency(data.serviceOrder.discount)}</span>
                </div>
              </div>
            )}
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="font-semibold text-lg">Total</span>
              <span className="text-2xl font-bold text-indigo-600">
                {formatCurrency(finalAmount)}
              </span>
            </div>
            {data.serviceOrder.delivered_at && (
              <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Equipamento entregue em {new Date(data.serviceOrder.delivered_at).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </div>
        )}

        {data.timeline && data.timeline.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Histórico</h3>
            <div className="space-y-3">
              {data.timeline.map((event, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{event.description}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(event.date).toLocaleDateString('pt-BR')} às {new Date(event.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!canApprove && !isRejected && !isCanceled && data.owner.phone && (
          <Button
            variant="outline"
            onClick={handleWhatsApp}
            className="w-full no-print"
          >
            <Phone className="w-4 h-4 mr-2" />
            Falar no WhatsApp
          </Button>
        )}

        <Button variant="link" onClick={loadData} className="w-full no-print">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar Status
        </Button>
      </div>

      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirmar Aprovação</h3>
            <p className="text-gray-600 mb-4">
              Você está prestes a aprovar o orçamento no valor de{' '}
              <strong>{formatCurrency(finalAmount)}</strong>.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Ao confirmar, você autoriza o início do serviço.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowApproveModal(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleApprove} disabled={approving} className="flex-1 bg-green-600 hover:bg-green-700">
                {approving ? 'Aprovando...' : 'Confirmar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Rejeitar Orçamento</h3>
            <p className="text-gray-600 mb-4">
              Deseja rejeitar o orçamento? Se preferir, deixe um motivo:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Motivo da rejeição (opcional)"
              className="w-full border rounded-lg p-3 mb-6 h-24 resize-none"
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowRejectModal(false)} className="flex-1">
                Cancelar
              </Button>
              <Button 
                onClick={handleReject} 
                disabled={rejecting} 
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {rejecting ? 'Rejeitando...' : 'Rejeitar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
