import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleAccess } from '../../hooks/use-role-access';
import { settingsService } from '../../services/settings.service';
import type { SettingsData } from '../../services/settings.service';
import { Navbar } from '../../components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Building2, MapPin, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsPage() {
  const { canManageUsers } = useRoleAccess();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [companyData, setCompanyData] = useState<SettingsData>({
    company_name: '',
    phone: '',
    email: '',
    address: {
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      cep: '',
      complement: '',
    },
  });

  useEffect(() => {
    if (!canManageUsers) {
      navigate('/dashboard');
      return;
    }

    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const data = await settingsService.get();
        setCompanyData(data);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        toast.error('Erro ao carregar configurações');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [canManageUsers, navigate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsService.update(companyData);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  if (!canManageUsers) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar showNavigation />
      <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações da sua empresa</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informações da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company_name">Nome da Empresa</Label>
              <Input
                id="company_name"
                value={companyData.company_name}
                onChange={(e) => setCompanyData({ ...companyData, company_name: e.target.value })}
                placeholder="Nome da sua empresa"
              />
            </div>
            <div>
              <Label htmlFor="email">Email de Contato</Label>
              <Input
                id="email"
                type="email"
                value={companyData.email}
                disabled
                placeholder="contato@empresa.com"
              />
              <p className="text-xs text-muted-foreground mt-1">O email não pode ser alterado</p>
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={companyData.phone}
                onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="street">Rua</Label>
                <Input
                  id="street"
                  value={companyData.address.street}
                  onChange={(e) => setCompanyData({
                    ...companyData,
                    address: { ...companyData.address, street: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={companyData.address.number}
                  onChange={(e) => setCompanyData({
                    ...companyData,
                    address: { ...companyData.address, number: e.target.value }
                  })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                value={companyData.address.neighborhood}
                onChange={(e) => setCompanyData({
                  ...companyData,
                  address: { ...companyData.address, neighborhood: e.target.value }
                })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={companyData.address.city}
                  onChange={(e) => setCompanyData({
                    ...companyData,
                    address: { ...companyData.address, city: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={companyData.address.state}
                  onChange={(e) => setCompanyData({
                    ...companyData,
                    address: { ...companyData.address, state: e.target.value }
                  })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={companyData.address.cep}
                onChange={(e) => setCompanyData({
                  ...companyData,
                  address: { ...companyData.address, cep: e.target.value }
                })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Configurações de Segurança</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Autenticação de Dois Fatores</h4>
                <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança à sua conta</p>
              </div>
              <Button variant="outline" disabled>Em breve</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Alterar Senha</h4>
                <p className="text-sm text-muted-foreground">Altere sua senha de acesso</p>
              </div>
              <Button variant="outline" disabled>Em breve</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
      </div>
    </div>
  );
}
