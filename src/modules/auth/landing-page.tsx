import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  CheckCircle,
  ArrowRight,
  FileText,
  Smartphone,
  AlertTriangle,
  MousePointerClick,
  QrCode,
  MessageSquare,
  Wrench,
  Target,
  Heart,
  Star,
  ArrowUpRight,
  Check,
} from 'lucide-react';
import { Button } from '../../components/ui/button';

const benefits = [
  {
    icon: FileText,
    title: 'Aprovação Instantânea',
    description: 'Cliente aprova orçamento pelo link em 1 clique. Sem conversa, sem enrolação.',
    highlight: true,
  },
  {
    icon: QrCode,
    title: 'Acompanhamento pelo Cliente',
    description: 'Cada orçamento/OS tem QR Code e link para rastreio. Cliente acompanha em tempo real.',
    highlight: true,
  },
  {
    icon: AlertTriangle,
    title: 'Nunca Perca um Prazo',
    description: 'Página de urgentes mostra tudo que precisa de atenção imediata. Organize seu dia.',
    highlight: true,
  },
  {
    icon: MousePointerClick,
    title: 'Um Clique, Aprovado',
    description: 'Aprovação via WhatsApp ou link. Cliente clica, você recebe, OS é gerada automaticamente.',
    highlight: false,
  },
  {
    icon: Smartphone,
    title: 'Múltiplas Formas de Pagamento',
    description: 'PIX, cartão, boleto. Registre pagamentos facilmente e controle seu financeiro.',
    highlight: false,
  },
  {
    icon: MessageSquare,
    title: 'Comunicação Automática',
    description: 'Cliente recebe email a cada mudança de status. Menos ligações, mais foco no serviço.',
    highlight: false,
  },
];

const stats = [
  { value: '100%', label: 'Online' },
  { value: '<1min', label: 'Prazo de Aprovação' },
  { value: '0', label: 'Software para Instalar' },
  { value: '24/7', label: 'Acesso' },
];

const testimonials = [
  {
    name: 'Carlos Silva',
    role: 'Dono da Tech Repair',
    content: 'Antes perdia 30% dos orçamentos por falta de resposta. Agora com o link de rastreio, meus clientes aprovam em minutos.',
    rating: 5,
  },
  {
    name: 'Ana Beatriz',
    role: 'Gerente Info Center',
    content: 'A página de urgentes salvou minha vida. Chego de manhã e já sei exatamente o que precisa de atenção.',
    rating: 5,
  },
  {
    name: 'Roberto Santos',
    role: 'Técnico Cell Tech',
    content: 'Minhas aprovações quadruplicaram. O cliente clica no WhatsApp e já era. Praticidade que vende sozinha.',
    rating: 5,
  },
];

const steps = [
  {
    number: '1',
    title: 'Crie o Orçamento',
    description: 'Adicione itens, serviços, preços. Tudo rápido e profissional.',
  },
  {
    number: '2',
    title: 'Envie para o Cliente',
    description: 'Link é enviado por email e WhatsApp automaticamente.',
  },
  {
    number: '3',
    title: 'Cliente Aprova em 1 Clique',
    description: 'Sem enrolação. Aprovou? OS gerada automaticamente.',
  },
  {
    number: '4',
    title: 'Acompanhe e Fature',
    description: 'Dashboard mostra tudo. Página de urgentes mantém você no caminho.',
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">TechFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Grátis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <CheckCircle className="w-4 h-4" />
              Para Assistências Técnicas
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              <span className="text-foreground">Seu cliente aprova,</span>
              <br />
              <span className="text-primary">você ganha</span>
              <span className="text-foreground">.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Sistema de gestão feito para assistências técnicas. 
              <strong className="text-foreground"> Aprovação em 1 clique</strong>, 
              <strong className="text-foreground"> rastreio pelo cliente</strong>, 
              <strong className="text-foreground"> urgentes na mão</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 px-8 py-6 text-lg font-semibold">
                  Começar Grátis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-6 text-lg font-semibold">
                  Demonstração
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-16">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-4 rounded-2xl bg-muted/50"
              >
                <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Hero Image/Demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative max-w-5xl mx-auto"
          >
            <div className="rounded-2xl overflow-hidden border shadow-2xl shadow-primary/10">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Demo Card 1 */}
                  <div className="bg-card rounded-xl p-6 border shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <div className="font-semibold">Urgentes</div>
                        <div className="text-sm text-muted-foreground">3 itens precisam de você</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">#ORG-0234</span>
                        </div>
                        <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-2 py-1 rounded-full">Vence hoje</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium">#OS-0892</span>
                        </div>
                        <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full">Aguardando peça</span>
                      </div>
                    </div>
                  </div>

                  {/* Demo Card 2 */}
                  <div className="bg-card rounded-xl p-6 border shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="font-semibold">Aprovação Rápida</div>
                        <div className="text-sm text-muted-foreground">Link direto para cliente</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                        <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">WhatsApp</div>
                          <div className="text-xs text-muted-foreground">Cliente aprova pelo chat</div>
                        </div>
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">QR Code</div>
                          <div className="text-xs text-muted-foreground">Escaneia e aprova</div>
                        </div>
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Feito para quem vende serviço
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Cada recurso foi pensado para aumentar suas aprovações e facilitar seu dia
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`rounded-2xl p-6 transition-all ${
                  benefit.highlight 
                    ? 'bg-primary/5 border-2 border-primary/20 hover:border-primary/40' 
                    : 'bg-card border'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  benefit.highlight 
                    ? 'bg-primary/10' 
                    : 'bg-muted'
                }`}>
                  <benefit.icon className={`w-6 h-6 ${benefit.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
                {benefit.highlight && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-primary font-medium">
                    <Star className="w-3 h-3" />
                    Mais procurado
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Simples assim
            </h2>
            <p className="text-lg text-muted-foreground">
              De orçamento a faturamento em minutos
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Heart className="w-4 h-4" />
              O que dizem nossos clientes
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Quem usa, aprova
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-2xl p-6 border shadow-sm"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary via-primary to-primary/90 rounded-3xl p-8 md:p-12 text-primary-foreground"
          >
            <Target className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Sua assistência merece crescer
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8 max-w-xl mx-auto">
              Comece hoje, grátis. Sem cartão de crédito, sem instalações. 
              Em 5 minutos você já está gerenciando orçamentos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg font-semibold"
                >
                  Criar Conta Grátis
                  <ArrowUpRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/80">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Gratuito para sempre</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Sem compromisso</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Suporte incluso</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">TechFlow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 TechFlow SaaS. Gestão inteligente para assistências técnicas.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link to="/login" className="hover:text-foreground">Login</Link>
              <Link to="/register" className="hover:text-foreground">Cadastro</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
