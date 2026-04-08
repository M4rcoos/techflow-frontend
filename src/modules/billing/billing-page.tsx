import { useState, useEffect, useCallback } from 'react';
import { billingService, type CheckoutResult } from '../../services/billing.service';
import type { Plan, BillingInfo } from '../../types';
import { 
  Check, 
  CreditCard, 
  Crown, 
  Users, 
  FileText, 
  Wrench,
  Calendar,
  TrendingUp,
  AlertCircle,
  Loader2,
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
  X,
  QrCode,
  Copy,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';

const PLAN_FEATURES = {
  BASIC: {
    os: '50 Ordens de Serviço/mês',
    budgets: '50 Orçamentos/mês',
    employees: 'Até 2 funcionários',
    clients: 'Gestão completa de clientes',
    onlineApproval: 'Aprovação online por link',
    printing: 'Impressão de OS e garantia',
    dashboard: 'Dashboard com visão completa',
    realtime: 'Acompanhe OS em tempo real',
    budgetsControl: 'Controle total dos orçamentos',
    billing: 'Visualização do faturamento',
    clarity: 'Clareza do que entra e sai',
  },
  PRO: {
    os: '200 Ordens de Serviço/mês',
    budgets: '200 Orçamentos/mês',
    employees: 'Até 10 funcionários',
    clients: 'Gestão completa de clientes',
    onlineApproval: 'Aprovação online por link',
    printing: 'Impressão de OS e garantia',
    dashboard: 'Dashboard avançado com métricas',
    realtime: 'Acompanhe OS em tempo real',
    budgetsControl: 'Controle total dos orçamentos',
    billing: 'Visualização detalhada do faturamento',
    clarity: 'Relatórios financeiros completos',
    priority: 'Suporte prioritário',
    api: 'Acesso à API',
  },
  ENTERPRISE: {
    os: 'Ordens de Serviço ilimitadas',
    budgets: 'Orçamentos ilimitados',
    employees: 'Funcionários ilimitados',
    clients: 'Gestão completa de clientes',
    onlineApproval: 'Aprovação online por link',
    printing: 'Impressão de OS e garantia',
    dashboard: 'Dashboard enterprise',
    realtime: 'Acompanhe OS em tempo real',
    budgetsControl: 'Controle total dos orçamentos',
    billing: 'Faturamento e relatórios avançados',
    clarity: 'BI completo e personalizado',
    priority: 'Suporte 24/7',
    api: 'Acesso completo à API',
    whiteLabel: 'White label disponível',
    custom: 'Customizações exclusivas',
  },
};

export function BillingPage() {
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [billing, plansData] = await Promise.all([
        billingService.getBillingInfo(),
        billingService.getPlans(),
      ]);
      setBillingInfo(billing);
      setPlans(plansData);
    } catch (error) {
      console.error('[Billing] Erro ao carregar dados:', error);
      toast.error('Erro ao carregar informações de billing');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowCheckoutModal(true);
  };

  const handleCancelSubscription = async () => {
    try {
      setProcessing(true);
      await billingService.cancelSubscription();
      toast.success('Assinatura cancelada com sucesso');
      setShowCancelModal(false);
      loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erro ao cancelar assinatura');
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const isCurrentPlan = (planId: string) => {
    return billingInfo?.subscription?.plan?.id === planId;
  };

  const getPlanFeatures = (planName: string) => {
    const key = planName.toUpperCase() as keyof typeof PLAN_FEATURES;
    return PLAN_FEATURES[key] || PLAN_FEATURES.BASIC;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasActiveSubscription = billingInfo?.subscription?.status === 'ACTIVE';
  const currentPlan = billingInfo?.subscription?.plan;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Planos e Assinatura</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seu plano e acompanhe seu uso
        </p>
      </div>

      {hasActiveSubscription && billingInfo && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                  <Crown className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plano Atual</p>
                  <h2 className="text-2xl font-bold">{currentPlan?.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(Number(currentPlan?.price))}/mês
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => setShowCancelModal(true)}>
                  Cancelar Assinatura
                </Button>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <UsageCard
                title="Ordens de Serviço"
                used={billingInfo.usage.os_count}
                limit={currentPlan?.maxOs || 0}
                icon={<Wrench className="w-5 h-5" />}
              />
              <UsageCard
                title="Orçamentos"
                used={billingInfo.usage.budget_count}
                limit={currentPlan?.maxBudgets || 0}
                icon={<FileText className="w-5 h-5" />}
              />
              <UsageCard
                title="Funcionários"
                used={billingInfo.usage.employees_count}
                limit={currentPlan?.maxEmployees || 0}
                icon={<Users className="w-5 h-5" />}
              />
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Reseta em: {new Date(billingInfo.usage.reset_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-6">Escolha seu Plano</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const features = getPlanFeatures(plan.name);
            const isCurrent = isCurrentPlan(plan.id);
            const isBasic = plan.name.toUpperCase() === 'BASIC';

            return (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  isCurrent ? 'border-primary ring-2 ring-primary/20' : ''
                } ${isBasic ? 'border-primary' : ''}`}
              >
                {isBasic && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                    Mais Popular
                  </div>
                )}

                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Crown className={`w-5 h-5 ${isBasic ? 'text-primary' : 'text-muted-foreground'}`} />
                    {plan.name}
                  </CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">{formatPrice(Number(plan.price))}</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                  {plan.description && (
                    <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <Button 
                    className="w-full" 
                    variant={isCurrent ? 'outline' : isBasic ? 'default' : 'outline'}
                    disabled={isCurrent}
                    onClick={() => !isCurrent && handleSelectPlan(plan)}
                  >
                    {isCurrent ? (
                      'Plano Atual'
                    ) : (
                      <>
                        Selecionar Plano <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <div className="space-y-3 pt-4 border-t">
                    <FeatureItem 
                      icon={<Wrench className="w-4 h-4" />} 
                      text={features.os}
                    />
                    <FeatureItem 
                      icon={<FileText className="w-4 h-4" />} 
                      text={features.budgets}
                    />
                    <FeatureItem 
                      icon={<Users className="w-4 h-4" />} 
                      text={features.employees}
                    />
                    <FeatureItem 
                      icon={<Users className="w-4 h-4" />} 
                      text={features.clients}
                    />
                    <FeatureItem 
                      icon={<Check className="w-4 h-4" />} 
                      text={features.onlineApproval}
                    />
                    <FeatureItem 
                      icon={<FileText className="w-4 h-4" />} 
                      text={features.printing}
                    />
                    <FeatureItem 
                      icon={<BarChart3 className="w-4 h-4" />} 
                      text={features.dashboard}
                    />
                    <FeatureItem 
                      icon={<Zap className="w-4 h-4" />} 
                      text={features.realtime}
                    />
                    <FeatureItem 
                      icon={<TrendingUp className="w-4 h-4" />} 
                      text={features.budgetsControl}
                    />
                    <FeatureItem 
                      icon={<CreditCard className="w-4 h-4" />} 
                      text={features.billing}
                    />
                    <FeatureItem 
                      icon={<Shield className="w-4 h-4" />} 
                      text={features.clarity}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Pagamento Seguro</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Seus pagamentos são processados pela AbacatePay, uma plataforma segura e confiável.
                Aceitamos cartão de crédito e PIX.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Cancelar Assinatura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos recursos
                do plano {currentPlan?.name} no final do período já pago.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowCancelModal(false)}
                  disabled={processing}
                >
                  Manter Assinatura
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={handleCancelSubscription}
                  disabled={processing}
                >
                  {processing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    'Cancelar'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showCheckoutModal && selectedPlan && (
        <CheckoutModal
          plan={selectedPlan}
          onClose={() => {
            setShowCheckoutModal(false);
            setSelectedPlan(null);
          }}
          onSuccess={() => {
            setShowCheckoutModal(false);
            setSelectedPlan(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

interface CheckoutModalProps {
  plan: Plan;
  onClose: () => void;
  onSuccess: () => void;
}

function CheckoutModal({ plan, onClose, onSuccess }: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'PIX'>('PIX');
  const [loading, setLoading] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'approved' | 'expired' | 'failed'>('pending');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setCheckoutResult(null);

      let result: CheckoutResult;

      if (paymentMethod === 'PIX') {
        result = await billingService.createPix(plan.id);
      } else {
        result = await billingService.createCheckout(plan.id, 'CARD');
      }

      if (result.type === 'DEMO') {
        toast.success('Plano ativado com sucesso! (Modo demo)');
        onSuccess();
        return;
      }

      setCheckoutResult(result);

      if (result.type === 'CHECKOUT' && result.url) {
        window.open(result.url, '_blank');
      }

      if (result.type === 'PIX' && result.brCode) {
        toast.success('QR Code PIX gerado! Efetue o pagamento.');
        startPolling(result.checkoutId);
      }
    } catch (error: any) {
      console.error('[Checkout] Erro:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = useCallback((pixId: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await billingService.getPixStatus(pixId);
        
        if (status.status === 'PAID' || status.status === 'REDEEMED' || status.status === 'APPROVED') {
          clearInterval(interval);
          setPaymentStatus('approved');
          toast.success('Pagamento confirmado! Plano ativado.');
          setTimeout(onSuccess, 2000);
        } else if (status.status === 'EXPIRED') {
          clearInterval(interval);
          setPaymentStatus('expired');
          toast.error('QR Code expirado. Gere um novo.');
        } else if (status.status === 'CANCELLED' || status.status === 'FAILED') {
          clearInterval(interval);
          setPaymentStatus('failed');
        }
      } catch (error) {
        console.error('[Checkout] Erro ao verificar status:', error);
      }
    }, 5000);

    setTimeout(() => clearInterval(interval), 30 * 60 * 1000);
  }, [onSuccess]);

  const copyPixCode = () => {
    if (checkoutResult?.brCode) {
      navigator.clipboard.writeText(checkoutResult.brCode);
      setPixCopied(true);
      toast.success('Código copiado!');
      setTimeout(() => setPixCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Finalizar Assinatura</CardTitle>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">{plan.name}</p>
                <p className="text-sm text-muted-foreground">Assinatura mensal</p>
              </div>
              <p className="text-2xl font-bold">{formatPrice(Number(plan.price))}</p>
            </div>
          </div>

          {!checkoutResult ? (
            <>
              <div>
                <p className="font-medium mb-3">Escolha a forma de pagamento:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('PIX')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'PIX' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <QrCode className={`w-8 h-8 mx-auto mb-2 ${paymentMethod === 'PIX' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className={`font-medium ${paymentMethod === 'PIX' ? 'text-primary' : ''}`}>PIX</p>
                    <p className="text-xs text-muted-foreground">Aprovação instantânea</p>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'CARD' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <CreditCard className={`w-8 h-8 mx-auto mb-2 ${paymentMethod === 'CARD' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className={`font-medium ${paymentMethod === 'CARD' ? 'text-primary' : ''}`}>Cartão</p>
                    <p className="text-xs text-muted-foreground">Crédito ou débito</p>
                  </button>
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : paymentMethod === 'PIX' ? (
                  <QrCode className="w-5 h-5 mr-2" />
                ) : (
                  <CreditCard className="w-5 h-5 mr-2" />
                )}
                {loading ? 'Processando...' : `Pagar com ${paymentMethod === 'PIX' ? 'PIX' : 'Cartão'}`}
              </Button>
            </>
          ) : checkoutResult.type === 'PIX' ? (
            <div className="space-y-4">
              {paymentStatus === 'pending' && (
                <>
                  <div className="flex items-center justify-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="text-yellow-800 font-medium">
                      Aguardando pagamento PIX
                      {checkoutResult.expiresAt && (
                        <span className="ml-2">
                          (expira às {formatTime(new Date(checkoutResult.expiresAt))})
                        </span>
                      )}
                    </span>
                  </div>

                  {checkoutResult.brCodeBase64 && (
                    <div className="flex flex-col items-center">
                      <img 
                        src={checkoutResult.brCodeBase64} 
                        alt="QR Code PIX" 
                        className="w-48 h-48 border rounded-lg"
                      />
                      <p className="text-sm text-muted-foreground mt-2">Escaneie o QR Code acima</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Código PIX (copia e cola):</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={checkoutResult.brCode || ''}
                        className="flex-1 px-3 py-2 text-sm bg-muted rounded-lg border truncate"
                      />
                      <Button size="sm" variant="outline" onClick={copyPixCode}>
                        {pixCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    <p>Após realizar o pagamento, a confirmação pode levar alguns segundos.</p>
                    <p className="mt-1">O plano será ativado automaticamente.</p>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setCheckoutResult(null);
                      setPaymentStatus('pending');
                    }}
                  >
                    Gerar novo PIX
                  </Button>
                </>
              )}

              {paymentStatus === 'approved' && (
                <div className="flex flex-col items-center p-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-green-600 mb-2">Pagamento Confirmado!</h3>
                  <p className="text-muted-foreground">Seu plano foi ativado com sucesso.</p>
                </div>
              )}

              {paymentStatus === 'expired' && (
                <div className="flex flex-col items-center p-8">
                  <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-bold text-yellow-600 mb-2">QR Code Expirado</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    O tempo limite foi atingido. Clique abaixo para gerar um novo PIX.
                  </p>
                  <Button 
                    onClick={() => {
                      setCheckoutResult(null);
                      setPaymentStatus('pending');
                    }}
                  >
                    Gerar novo PIX
                  </Button>
                </div>
              )}
            </div>
          ) : checkoutResult.type === 'CHECKOUT' && checkoutResult.url ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <ExternalLink className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">
                  Checkout aberto em nova aba
                </span>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Complete o pagamento na página da AbacatePay que foi aberta.
                <br />
                Após o pagamento, esta página será atualizada automaticamente.
              </p>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open(checkoutResult.url!, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir checkout novamente
              </Button>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setCheckoutResult(null);
                }}
              >
                Escolher outro método
              </Button>
            </div>
          ) : null}

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t">
            <Shield className="w-4 h-4" />
            <span>Pagamento seguro processado pela AbacatePay</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UsageCard({ 
  title, 
  used, 
  limit, 
  icon 
}: { 
  title: string; 
  used: number; 
  limit: number; 
  icon: React.ReactNode;
}) {
  const percentage = getUsagePercentage(used, limit);
  const isWarning = percentage >= 80;
  const isDanger = percentage >= 95;

  return (
    <div className="bg-background/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{title}</span>
        </div>
        <span className={`text-sm ${isDanger ? 'text-destructive' : isWarning ? 'text-yellow-600' : 'text-muted-foreground'}`}>
          {used}/{limit}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all ${
            isDanger ? 'bg-destructive' : isWarning ? 'bg-yellow-500' : 'bg-primary'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-primary">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function getUsagePercentage(used: number, limit: number): number {
  if (limit === 0) return 0;
  return Math.min((used / limit) * 100, 100);
}
