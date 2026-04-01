import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { clientService } from '../../services/client.service';
import { useClients } from '../../hooks';
import { useCep } from '../../hooks/use-cep';
import type { CreateClientData, ClientType } from '../../types';
import { X, Loader2 } from 'lucide-react';

interface ClientFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (client: { id: string; client_name?: string; company_name?: string; email?: string; phone?: string }) => void;
  prefillDoc?: string;
  onDocFilled?: (doc: string) => void;
  editClientId?: string | null;
}

interface FormData {
  client_type_id: string;
  client_name: string;
  company_name: string;
  email: string;
  phone: string;
  cpf: string;
  cnpj: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
}

export function ClientFormModal({ open, onOpenChange, onSuccess, prefillDoc, onDocFilled }: ClientFormModalProps) {
  const [clientTypes, setClientTypes] = useState<ClientType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const { createClient, isCreating } = useClients();

  useEffect(() => {
    if (open) {
      setLoadingTypes(true);
      clientService.getClientTypes()
        .then(setClientTypes)
        .catch(() => setClientTypes([]))
        .finally(() => setLoadingTypes(false));
    }
  }, [open]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm<FormData>();

  const { searchCep, isLoading: isCepLoading } = useCep();
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

  const selectedTypeId = watch('client_type_id');
  const selectedType = clientTypes.find(t => t.id === selectedTypeId);
  const isPessoaFisica = selectedType?.name?.toLowerCase().includes('física');
  const isPessoaJuridica = selectedType?.name?.toLowerCase().includes('jurídica');

  const cleanDoc = prefillDoc?.replace(/\D/g, '') || '';
  const isDocCpf = cleanDoc.length <= 11;

  useEffect(() => {
    if (clientTypes.length > 0 && prefillDoc) {
      const cleanDoc = prefillDoc.replace(/\D/g, '');
      const isCpf = cleanDoc.length <= 11;
      
      if (isCpf) {
        const pfType = clientTypes.find(t => t.name.toLowerCase().includes('física'));
        if (pfType) {
          setValue('client_type_id', pfType.id);
        }
      } else {
        const pjType = clientTypes.find(t => t.name.toLowerCase().includes('jurídica'));
        if (pjType) {
          setValue('client_type_id', pjType.id);
        }
      }
    }
  }, [clientTypes, prefillDoc, setValue]);

  useEffect(() => {
    if (prefillDoc && onDocFilled) {
      onDocFilled(prefillDoc);
    }
  }, [prefillDoc, onDocFilled]);

  const cpfValue = watch('cpf');
  const cnpjValue = watch('cnpj');
  const cpfDigits = cpfValue?.replace(/\D/g, '') || '';
  const cnpjDigits = cnpjValue?.replace(/\D/g, '') || '';
  const autoDetectedPf = cpfDigits.length >= 7 && cpfDigits.length <= 11;
  const autoDetectedPj = cnpjDigits.length >= 12;
  const showCpf = !selectedTypeId ? (autoDetectedPf || cpfDigits.length > 0) : isPessoaFisica;
  const showCnpj = !selectedTypeId ? (autoDetectedPj || cnpjDigits.length > 0) : isPessoaJuridica;

  const defaultPfType = clientTypes.find(t => t.name.toLowerCase().includes('física'));

  const onSubmit = (data: FormData) => {
    const payload: CreateClientData = {
      client_type_id: data.client_type_id || defaultPfType?.id || clientTypes[0]?.id || '',
      client_name: data.client_name || undefined,
      company_name: data.company_name || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      cpf: (isPessoaFisica && prefillDoc) ? prefillDoc : (data.cpf || undefined),
      cnpj: (isPessoaJuridica && prefillDoc) ? prefillDoc : (data.cnpj || undefined),
      address: data.street ? {
        street: data.street,
        number: parseInt(data.number) || 0,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        cep: data.cep,
      } : undefined,
    };

    createClient(payload, {
      onSuccess: (newClient) => {
        reset();
        onOpenChange(false);
        if (onSuccess) {
          onSuccess(newClient);
        }
      },
    });
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </button>
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
          <DialogDescription>Cadastre um novo cliente no sistema</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="client_type_id">Tipo de Cliente *</Label>
            <select
              id="client_type_id"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm text-foreground"
              {...register('client_type_id')}
            >
              <option value="" className="text-muted-foreground">Selecione...</option>
              {clientTypes.map((type) => (
                <option key={type.id} value={type.id} className="text-foreground">
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_name">
                {isPessoaJuridica ? 'Nome do Responsável' : 'Nome do Cliente'}
              </Label>
              <Input 
                id="client_name" 
                placeholder={isPessoaJuridica ? "João Silva" : "João Silva"} 
                {...register('client_name')} 
              />
            </div>
            <div>
              <Label htmlFor="company_name">
                {isPessoaJuridica ? 'Nome da Empresa' : 'Nome Fantasia'}
              </Label>
              <Input 
                id="company_name" 
                placeholder={isPessoaJuridica ? "Empresa Ltda" : "TechFix"} 
                {...register('company_name')} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="email@exemplo.com" {...register('email')} />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" placeholder="(11) 99999-9999" {...register('phone')} />
            </div>
          </div>

          {selectedTypeId ? (
            <>
              {isPessoaFisica && (
                <div>
                  <Label htmlFor="cpf">
                    CPF {prefillDoc && isDocCpf && <span className="text-green-600">(prévio)</span>}
                  </Label>
                  <Input 
                    id="cpf" 
                    placeholder="000.000.000-00" 
                    {...register('cpf')}
                    defaultValue={prefillDoc && isDocCpf ? prefillDoc : undefined}
                    disabled={!!(prefillDoc && isDocCpf)}
                  />
                </div>
              )}
              {isPessoaJuridica && (
                <div>
                  <Label htmlFor="cnpj">
                    CNPJ {prefillDoc && !isDocCpf && <span className="text-green-600">(prévio)</span>}
                  </Label>
                  <Input 
                    id="cnpj" 
                    placeholder="00.000.000/0001-00" 
                    {...register('cnpj')}
                    defaultValue={prefillDoc && !isDocCpf ? prefillDoc : undefined}
                    disabled={!!(prefillDoc && !isDocCpf)}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {showCpf && (
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input 
                    id="cpf" 
                    placeholder="000.000.000-00" 
                    {...register('cpf')}
                  />
                </div>
              )}
              {showCnpj && (
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input 
                    id="cnpj" 
                    placeholder="00.000.000/0001-00" 
                    {...register('cnpj')}
                  />
                </div>
              )}
            </div>
          )}

          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-3">Endereço (opcional)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cep">CEP</Label>
                <div className="relative">
                  <Input id="cep" placeholder="01000-000" {...register('cep')} onBlur={handleCepBlur} />
                  {isCepLoading && (
                    <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>
              <div className="col-span-2">
                <Label htmlFor="street">Rua</Label>
                <Input id="street" placeholder="Rua Principal" {...register('street')} />
              </div>
              <div>
                <Label htmlFor="number">Número</Label>
                <Input id="number" placeholder="100" {...register('number')} />
              </div>
              <div>
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input id="neighborhood" placeholder="Centro" {...register('neighborhood')} />
              </div>
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" placeholder="São Paulo" {...register('city')} />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input id="state" placeholder="SP" maxLength={2} {...register('state')} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating || loadingTypes}>
              {isCreating ? 'Salvando...' : 'Salvar Cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}