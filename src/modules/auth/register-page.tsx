import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Zap, User, Building2, MapPin, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../hooks';
import { useCep } from '../../hooks/use-cep';
import type { RegisterData } from '../../types';
import { formatCNPJ, validateCNPJ } from '../../lib/validators';

const registerSchema = z.object({
  company_name: z.string().min(3, 'Nome da empresa deve ter no mínimo 3 caracteres'),
  cnpj: z.string().optional(),
  phone: z.string().optional(),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  street: z.string().min(3, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  neighborhood: z.string().min(2, 'Bairro é obrigatório'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 letras'),
  cep: z.string().min(8, 'CEP inválido'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { register: registerUser, isRegistering } = useAuth();
  const { searchCep, isLoading: isCepLoading } = useCep();
  const [cnpjError, setCnpjError] = useState('');
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const cepValue = watch('cep', '');

  const handleCepBlur = async () => {
    const result = await searchCep(cepValue);
    if (result) {
      setValue('street', result.logradouro);
      setValue('neighborhood', result.bairro);
      setValue('city', result.cidade);
      setValue('state', result.uf);
    }
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setValue('cnpj', formatted);
    if (cnpjError) setCnpjError('');
  };

  const onSubmit = (data: RegisterFormData) => {
    const cnpjDigits = data.cnpj?.replace(/\D/g, '') || '';
    
    if (cnpjDigits.length > 0) {
      if (cnpjDigits.length < 14) {
        setCnpjError('CNPJ deve ter 14 dígitos');
        return;
      }
      if (!validateCNPJ(data.cnpj || '')) {
        setCnpjError('CNPJ inválido');
        return;
      }
    }

    const payload: RegisterData = {
      company_name: data.company_name,
      cnpj: cnpjDigits.length > 0 ? data.cnpj : undefined,
      phone: data.phone,
      name: data.name,
      email: data.email,
      password: data.password,
      address: {
        street: data.street,
        number: parseInt(data.number, 10),
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state.toUpperCase(),
        cep: data.cep.replace(/\D/g, ''),
      },
    };
    registerUser(payload);
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
          <h2 className="text-4xl font-bold mb-4">Começar é grátis!</h2>
          <p className="text-xl text-white/90">
            Crie sua conta e comece a gerenciar sua assistência técnica de forma profissional
          </p>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
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
            <span className="font-bold text-xl text-foreground">
              TechFlow
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Criar conta</h1>
            <p className="text-muted-foreground">Preencha os dados para começar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg border">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Dados da Empresa
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="company_name" className="text-sm font-medium">
                    Nome da Empresa *
                  </Label>
                  <Input
                    id="company_name"
                    placeholder="TechFix Assistência"
                    className="h-10 rounded-lg mt-1"
                    {...register('company_name')}
                  />
                  {errors.company_name && (
                    <p className="text-sm text-red-500 mt-1">{errors.company_name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="cnpj" className="text-sm font-medium">
                      CNPJ
                    </Label>
                    <Input
                      id="cnpj"
                      placeholder="00.000.000/0001-00"
                      className="h-10 rounded-lg mt-1"
                      maxLength={18}
                      {...register('cnpj')}
                      onChange={handleCnpjChange}
                    />
                    {cnpjError && <p className="text-xs text-red-500 mt-1">{cnpjError}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Telefone
                    </Label>
                    <Input
                      id="phone"
                      placeholder="(11) 99999-9999"
                      className="h-10 rounded-lg mt-1"
                      {...register('phone')}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Seus Dados
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    Seu Nome *
                  </Label>
                  <Input
                    id="name"
                    placeholder="João Silva"
                    className="h-10 rounded-lg mt-1"
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="h-10 rounded-lg mt-1"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium">
                    Senha *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="h-10 rounded-lg mt-1"
                    {...register('password')}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Endereço da Empresa
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="cep" className="text-sm font-medium">
                    CEP
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="cep"
                      placeholder="01000-000"
                      className="h-10 rounded-lg pr-10"
                      {...register('cep')}
                      onBlur={handleCepBlur}
                    />
                    {isCepLoading && (
                      <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {errors.cep && (
                    <p className="text-sm text-red-500 mt-1">{errors.cep.message}</p>
                  )}
                </div>

                <div className="col-span-2">
                  <Label htmlFor="street" className="text-sm font-medium">
                    Rua
                  </Label>
                  <Input
                    id="street"
                    placeholder="Rua Principal"
                    className="h-10 rounded-lg mt-1"
                    {...register('street')}
                  />
                  {errors.street && (
                    <p className="text-sm text-red-500 mt-1">{errors.street.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="number" className="text-sm font-medium">
                    Número
                  </Label>
                  <Input
                    id="number"
                    placeholder="100"
                    className="h-10 rounded-lg mt-1"
                    {...register('number')}
                  />
                  {errors.number && (
                    <p className="text-sm text-red-500 mt-1">{errors.number.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="neighborhood" className="text-sm font-medium">
                    Bairro
                  </Label>
                  <Input
                    id="neighborhood"
                    placeholder="Centro"
                    className="h-10 rounded-lg mt-1"
                    {...register('neighborhood')}
                  />
                  {errors.neighborhood && (
                    <p className="text-sm text-red-500 mt-1">{errors.neighborhood.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="city" className="text-sm font-medium">
                    Cidade
                  </Label>
                  <Input
                    id="city"
                    placeholder="São Paulo"
                    className="h-10 rounded-lg mt-1"
                    {...register('city')}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="state" className="text-sm font-medium">
                    Estado
                  </Label>
                  <Input
                    id="state"
                    placeholder="SP"
                    maxLength={2}
                    className="h-10 rounded-lg mt-1"
                    {...register('state')}
                  />
                  {errors.state && (
                    <p className="text-sm text-red-500 mt-1">{errors.state.message}</p>
                  )}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold mt-6"
              disabled={isRegistering || !!cnpjError}
            >
              {isRegistering ? 'Criando conta...' : 'Criar Conta Grátis'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Fazer login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
