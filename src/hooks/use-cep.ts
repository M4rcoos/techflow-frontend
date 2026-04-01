import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface CEPResponse {
  logradouro: string;
  bairro: string;
  localizacao: string;
  cidade: string;
  uf: string;
}

export function useCep() {
  const [isLoading, setIsLoading] = useState(false);

  const searchCep = useCallback(async (cep: string): Promise<CEPResponse | null> => {
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      return null;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        toast.error('CEP não encontrado. Preencha o endereço manualmente.');
        return null;
      }

      return {
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        localizacao: data.localizacao || '',
        cidade: data.localidade || '',
        uf: data.uf || '',
      };
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro ao buscar CEP. Preencha o endereço manualmente.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { searchCep, isLoading };
}
