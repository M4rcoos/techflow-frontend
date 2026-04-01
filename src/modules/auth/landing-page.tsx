import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  CheckCircle,
  Users,
  TrendingUp,
  Shield,
  Bell,
  ArrowRight,
  BarChart3,
  FileText,
  Clock,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Navbar } from '../../components/navbar';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-none mb-6">
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Gerencie orçamentos e ordens de serviço
              </span>
              <br />
              <span className="text-foreground">com controle total e mais lucro</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Um sistema completo para assistências técnicas e prestadores de serviço
              organizarem clientes, orçamentos, ordens de serviço e financeiro em um só lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button
                  size="lg"
                  className="rounded-full bg-primary hover:bg-primary/90 px-8 py-6 text-lg font-semibold"
                >
                  Criar Conta Grátis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-lg font-semibold">
                  Entrar
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1769763227060-726b7b926bf2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHw0fHxlbGVjdHJvbmljcyUyMHJlcGFpciUyMHRlY2huaWNpYW58ZW58MHx8fHwxNzcwMjE1MDczfDA&ixlib=rb-4.1.0&q=85"
                alt="TechFlow Dashboard"
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-4 bg-slate-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Benefícios do TechFlow
            </h2>
            <p className="text-lg text-muted-foreground">
              Tudo que você precisa para gerenciar sua assistência técnica
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: 'Controle total de orçamentos e OS',
                description: 'Crie, edite e acompanhe orçamentos e ordens de serviço de forma profissional',
              },
              {
                icon: CheckCircle,
                title: 'Fluxo profissional de aprovação',
                description: 'Sistema automatizado de aprovação de orçamentos com geração automática de OS',
              },
              {
                icon: Clock,
                title: 'Histórico por cliente',
                description: 'Acesse todo histórico de serviços e orçamentos de cada cliente',
              },
              {
                icon: BarChart3,
                title: 'Dashboard financeiro em tempo real',
                description: 'Visualize faturamento, lucros e métricas importantes instantaneamente',
              },
              {
                icon: Shield,
                title: 'Controle de permissões por funcionário',
                description: 'Defina exatamente o que cada colaborador pode acessar',
              },
              {
                icon: Bell,
                title: 'Notificações automáticas por e-mail',
                description: 'Seus clientes recebem atualizações automáticas sobre seus serviços',
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="rounded-3xl border bg-card/50 p-8 hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Como Funciona</h2>
            <p className="text-lg text-muted-foreground">Simples, rápido e eficiente</p>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            {[
              { step: '1', title: 'Cadastre sua empresa', icon: Users },
              { step: '2', title: 'Crie clientes e orçamentos', icon: FileText },
              { step: '3', title: 'Envie para aprovação', icon: CheckCircle },
              { step: '4', title: 'Gere ordens de serviço', icon: Zap },
              { step: '5', title: 'Acompanhe status e faturamento', icon: TrendingUp },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Comece agora e organize sua empresa
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Junte-se a centenas de assistências técnicas que já usam o TechFlow
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button
                  size="lg"
                  className="rounded-full bg-white text-indigo-600 hover:bg-white/90 px-8 py-6 text-lg font-semibold"
                >
                  Criar Conta
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full bg-white/10 border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-6 text-lg font-semibold"
                >
                  Login
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 px-4 bg-slate-900 text-white">
        <div className="container mx-auto max-w-7xl text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">TechFlow SaaS</span>
          </div>
          <p className="text-slate-400">© 2026 TechFlow. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
