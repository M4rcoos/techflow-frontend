import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '../services/auth.service';
import type { User, LoginCredentials, RegisterData } from '../types';
import { getToken, getUser, setUser, clearAuth } from '../lib/api';

export const useAuth = () => {
  const navigate = useNavigate();
  
  const getInitialUser = (): User | null => {
    const hasToken = !!getToken();
    if (!hasToken) return null;
    
    const storedUser = getUser<User>();
    if (storedUser) {
      return storedUser;
    }
    return null;
  };

  const [user, setUserState] = useState<User | null>(getInitialUser);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsSubmitting(true);
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      setUserState(data.user);
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      const err = error as Error & { message?: string };
      if (err.message && !['Usuário não encontrado', 'Email não verificado'].includes(err.message)) {
        toast.error(err.message || 'Erro ao fazer login');
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsSubmitting(true);
    try {
      const response = await authService.register(data);
      if (response.pendingVerification) {
        toast.success(response.message || 'Cadastro realizado! Verifique seu email.');
        navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
      } else {
        setUser(response.user);
        setUserState(response.user);
        toast.success('Cadastro realizado com sucesso!');
        navigate('/dashboard');
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Erro ao cadastrar');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = () => {
    authService.logout();
    clearAuth();
    setUserState(null);
    window.location.href = '/login';
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    isLoggingIn: isSubmitting,
    isRegistering: isSubmitting,
  };
};
