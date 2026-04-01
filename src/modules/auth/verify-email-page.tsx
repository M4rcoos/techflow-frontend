import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { api, setToken, setUser } from '../../lib/api';
import { toast } from 'sonner';

const verifySchema = z.object({
  email: z.string().email('Email inválido'),
  code: z.string().length(6, 'Código deve ter 6 dígitos'),
});

type VerifyFormData = z.infer<typeof verifySchema>;

interface VerifyResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    owner_id: string;
    company_name: string;
    role: string;
    permissions: string[];
    has_seen_onboarding: boolean;
  };
}

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const emailFromParam = searchParams.get('email') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      email: emailFromParam,
    },
  });

  const onSubmit = async (data: VerifyFormData) => {
    setIsVerifying(true);
    try {
      const response = await api.post<{ data: VerifyResponse }>('/api/auth/verify-email', {
        email: data.email,
        code: data.code,
      });

      const responseData = response.data.data;
      if (responseData?.token) {
        setToken(responseData.token);
        setUser(responseData.user);
        toast.success('Email verificado com sucesso!');
        navigate('/dashboard');
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Código inválido ou expirado');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!emailFromParam) {
      toast.error('Email não encontrado');
      return;
    }
    setIsResending(true);
    try {
      await api.post('/api/auth/resend-code', { email: emailFromParam });
      toast.success('Código reenviado para o email!');
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Erro ao reenviar código');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-white max-w-lg"
        >
          <h2 className="text-4xl font-bold mb-4">Verifique seu email</h2>
          <p className="text-xl text-white/90">
            Enviamos um código de verificação para sua caixa de entrada
          </p>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">TechFlow</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Verificar Email</h1>
            <p className="text-muted-foreground">
              Digite o código de 6 dígitos enviado para seu email
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10 h-12 rounded-lg"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="code" className="text-sm font-medium">
                Código de Verificação
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="code"
                  placeholder="000000"
                  className="pl-10 h-12 rounded-lg text-center text-2xl tracking-[0.5em]"
                  maxLength={6}
                  {...register('code')}
                />
              </div>
              {errors.code && (
                <p className="text-sm text-red-500 mt-1">{errors.code.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold mt-6"
              disabled={isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Button
              variant="link"
              onClick={handleResendCode}
              disabled={isResending}
              className="text-primary"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Não recebeu o código? Reenviar'
              )}
            </Button>

            <div>
              <Link
                to="/register"
                className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao cadastro
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
