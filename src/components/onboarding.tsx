import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '../hooks/use-auth';
import { userService } from '../services/user.service';
import { cookieStorage } from '../lib/cookie-utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  Wrench,
  CheckCircle,
  X,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    path: string;
  };
}

const steps: OnboardingStep[] = [
  {
    id: 'dashboard',
    title: 'Bem-vindo ao Dashboard',
    description: 'Aqui você tem uma visão geral do seu negócio. Acompanhe orçamentos, clientes e faturamento em um só lugar.',
    icon: <LayoutDashboard className="w-12 h-12 text-primary" />,
    action: {
      label: 'Ver Dashboard',
      path: '/dashboard',
    },
  },
  {
    id: 'clients',
    title: 'Gerencie Clientes',
    description: 'Cadastre e gerencie todos os seus clientes.keep histórico de atendimentos e facilite o contato.',
    icon: <Users className="w-12 h-12 text-primary" />,
    action: {
      label: 'Cadastrar Cliente',
      path: '/clients',
    },
  },
  {
    id: 'budgets',
    title: 'Crie Orçamentos',
    description: 'Crie orçamentos detalhados para seus clientes. Acompanhe o status e adicione serviços e peças.',
    icon: <FileText className="w-12 h-12 text-primary" />,
    action: {
      label: 'Criar Orçamento',
      path: '/budgets',
    },
  },
  {
    id: 'service-orders',
    title: 'Ordens de Serviço',
    description: 'Após aprovado, o orçamento vira uma ordem de serviço. Acompanhe a execução e finalize com delivery.',
    icon: <Wrench className="w-12 h-12 text-primary" />,
    action: {
      label: 'Ver Ordens de Serviço',
      path: '/service-orders',
    },
  },
];

const ONBOARDING_KEY = 'has_seen_onboarding';

export function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.has_seen_onboarding || cookieStorage.get(ONBOARDING_KEY) === 'true') {
      setIsOpen(false);
    }
  }, [user]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    cookieStorage.set(ONBOARDING_KEY, 'true');
    try {
      await userService.updateOnboarding(true);
    } catch {
      // Silent fail
    }
    setIsOpen(false);
    toast.success('Onboarding concluído!');
  };

  const handleFinish = async () => {
    cookieStorage.set(ONBOARDING_KEY, 'true');
    try {
      await userService.updateOnboarding(true);
    } catch {
      // Silent fail
    }
    setIsOpen(false);
    toast.success('Bem-vindo ao TechFlow!');
  };

  const handleAction = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  if (!isOpen || !user) {
    return null;
  }

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="relative">
          <div className="absolute top-4 right-4">
            <button
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="h-2 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-primary/10 rounded-full">
                {step.icon}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center mb-3">
              {step.title}
            </h2>

            <p className="text-muted-foreground text-center mb-8">
              {step.description}
            </p>

            {step.action && (
              <div className="flex justify-center mb-6">
                <Button
                  variant="outline"
                  onClick={() => handleAction(step.action!.path)}
                  className="gap-2"
                >
                  {step.action.label}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </Button>

              <div className="flex gap-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep
                        ? 'bg-primary'
                        : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>

              {isLastStep ? (
                <Button onClick={handleFinish} className="gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Concluir
                </Button>
              ) : (
                <Button onClick={handleNext} className="gap-1">
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
