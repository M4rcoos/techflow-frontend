import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Check, X, Send, User, Calendar, Pencil, Play, MessageCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { useBudget, useBudgets } from '../../hooks/use-budgets';
import { formatDate, formatCurrency, calculateUrgency, generateWhatsAppLink } from '../../lib/utils';
import { toast } from 'sonner';
import { BudgetEditForm } from './budget-edit-form';
import { getUser } from '../../lib/api';
import type { User as UserType } from '../../types';
import { useRoleAccess } from '../../hooks/use-role-access';
import { ClientDetailModal } from '../client/client-detail-modal';

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  DRAFT: { label: 'Rascunho', color: 'text-slate-700 dark:text-slate-300', bgColor: 'bg-slate-100 dark:bg-slate-800' },
  IN_ANALYSIS: { label: 'Em Análise', color: 'text-blue-700 dark:text-blue-300', bgColor: 'bg-blue-100 dark:bg-blue-900/40' },
  SENT: { label: 'Enviado', color: 'text-orange-700 dark:text-orange-300', bgColor: 'bg-orange-100 dark:bg-orange-900/40' },
  APPROVED: { label: 'Aprovado', color: 'text-green-700 dark:text-green-300', bgColor: 'bg-green-100 dark:bg-green-900/40' },
  REJECTED: { label: 'Rejeitado', color: 'text-red-700 dark:text-red-300', bgColor: 'bg-red-100 dark:bg-red-900/40' },
};

export function BudgetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: budget, isLoading, refetch } = useBudget(id || null);
  const { updateBudgetStatus } = useBudgets();
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);

  const { canEditClient } = useRoleAccess();

  const currentConfig = budget ? statusConfig[budget.status.name] || { label: budget.status.name, color: 'text-gray-700 dark:text-gray-300', bgColor: 'bg-gray-100 dark:bg-gray-800' } : null;
  const canEdit = budget?.status.name === 'IN_ANALYSIS';
  const canStartAnalysis = budget?.status.name === 'DRAFT';
  const canSend = budget?.status.name === 'IN_ANALYSIS';
  const canApprove = budget?.status.name === 'SENT';

  const urgencyBadge = (() => {
    if (!budget) return null;
    const urgency = calculateUrgency(budget.valid_until, budget.status.name);
    if (urgency === 'EXPIRED') return { label: 'Expirado', color: 'text-red-700 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/40' };
    if (urgency === 'DUE_TODAY') return { label: 'Vence hoje', color: 'text-amber-700 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/40' };
    return null;
  })();

  const handleStartAnalysis = async () => {
    if (!id) return;
    try {
      await updateBudgetStatus({ id, status: 'IN_ANALYSIS' });
      toast.success('Análise iniciada!');
      refetch();
    } catch (error) {
      toast.error('Erro ao iniciar análise');
    }
  };

  const validateBeforeSend = () => {
    if (!budget || !budget.items || budget.items.length === 0) {
      toast.error('Adicione pelo menos um item antes de enviar');
      return false;
    }
    
    const hasValidServices = budget.items.some(item => 
      item.services && item.services.length > 0 && 
      item.services.every(svc => svc.price > 0)
    );
    
    if (!hasValidServices) {
      toast.error('Cada item deve ter pelo menos um serviço com preço maior que zero');
      return false;
    }
    
    return true;
  };

  const formatCurrencyPrint = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handlePrint = () => {
    if (!budget) return;
    const baseUrl = window.location.origin;
    const trackUrl = `${baseUrl}/track?token=${budget.public_token}`;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let totalGeral = 0;

    const itemsHtml = budget.items?.map((item: any, index: number) => {
      const itemTotal = Number(item.total) || 0;
      totalGeral += itemTotal;

      const servicesHtml = item.services?.map((svc: any) => `
        <tr>
          <td>${svc.name}</td>
          <td style="text-align: center;">${svc.quantity}</td>
          <td style="text-align: right;">${formatCurrencyPrint(Number(svc.price) || 0)}</td>
          <td style="text-align: right;">${formatCurrencyPrint(Number(svc.total) || 0)}</td>
        </tr>
      `).join('') || '<tr><td colspan="4" style="color: #999; font-style: italic;">Nenhum serviço/peça adicionado</td></tr>';

      const equipmentInfo = [
        item.mark,
        item.model,
        item.quantity > 1 ? `Qtd: ${item.quantity}` : null
      ].filter(Boolean).join(' | ');

      return `
        <div class="item-container">
          <div class="item-header-bar"></div>
          <div class="item-header-content">
            <div class="item-title">
              <span class="item-number">#${index + 1}</span>
              <span class="item-name">${item.name}</span>
            </div>
            ${equipmentInfo ? `<div class="item-equipment">${equipmentInfo}</div>` : ''}
          </div>
          
          <div class="item-details">
            ${item.reported_problem ? `
              <div class="detail-section problem-reported">
                <div class="detail-label">⚠️ Problema Relatado pelo Cliente</div>
                <div class="detail-text">${item.reported_problem}</div>
              </div>
            ` : ''}
            
            ${item.diagnosed_problem ? `
              <div class="detail-section problem-diagnosed">
                <div class="detail-label">🔧 Diagnóstico Técnico</div>
                <div class="detail-text">${item.diagnosed_problem}</div>
              </div>
            ` : ''}
            
            ${item.services && item.services.length > 0 ? `
              <div class="services-section">
                <table class="services-table">
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th style="width: 60px;">Qtd</th>
                      <th style="width: 100px;">Valor Unit.</th>
                      <th style="width: 100px;">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${servicesHtml}
                  </tbody>
                </table>
              </div>
            ` : ''}
          </div>
          
          ${itemTotal > 0 ? `
            <div class="item-footer">
              <span class="item-total-label">Total do Item:</span>
              <span class="item-total-value">${formatCurrencyPrint(itemTotal)}</span>
            </div>
          ` : ''}
        </div>
      `;
    }).join('') || '<div class="no-items">Nenhum item adicionado ao orçamento</div>';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Orçamento ${budget.code}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; font-size: 12px; line-height: 1.5; color: #333; }
          .header { text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 3px solid #1e40af; }
          .company { font-size: 24px; font-weight: bold; color: #1e40af; letter-spacing: 1px; }
          .company-cnpj { font-size: 11px; color: #666; margin-top: 5px; font-weight: 500; }
          .company-address { font-size: 10px; color: #888; margin-top: 4px; }
          .company-contact { font-size: 11px; color: #666; margin-top: 8px; }
          .budget-info { margin-top: 15px; padding: 12px; background: #f8fafc; border-radius: 6px; }
          .budget-info-row { display: flex; justify-content: center; gap: 30px; font-size: 13px; }
          .budget-info-label { color: #666; }
          .budget-info-value { font-weight: bold; color: #1e40af; }
          
          .client-section { margin-bottom: 20px; }
          .section-title { font-size: 13px; font-weight: bold; color: #1e40af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #e2e8f0; }
          .client-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
          .client-field { padding: 8px 12px; background: #f8fafc; border-radius: 4px; }
          .client-field-label { font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; }
          .client-field-value { font-size: 12px; font-weight: 500; color: #333; margin-top: 2px; }
          
          .items-container { margin-bottom: 20px; }
          .item-container { border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px; overflow: hidden; background: #fff; }
          .item-header-bar { height: 4px; background: linear-gradient(90deg, #1e40af, #3b82f6); }
          .item-header-content { padding: 15px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
          .item-title { display: flex; align-items: center; gap: 10px; }
          .item-number { background: #1e40af; color: white; font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 4px; }
          .item-name { font-size: 16px; font-weight: bold; color: #1e1e1e; }
          .item-equipment { font-size: 11px; color: #64748b; margin-top: 6px; padding-left: 40px; }
          
          .item-details { padding: 15px; }
          .detail-section { margin-bottom: 15px; }
          .detail-section:last-child { margin-bottom: 0; }
          .detail-label { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
          .problem-reported .detail-label { color: #d97706; }
          .problem-reported .detail-text { background: #fef3c7; padding: 10px; border-radius: 6px; border-left: 3px solid #f59e0b; }
          .problem-diagnosed .detail-label { color: #2563eb; }
          .problem-diagnosed .detail-text { background: #eff6ff; padding: 10px; border-radius: 6px; border-left: 3px solid #3b82f6; }
          .detail-text { font-size: 12px; color: #1e293b; }
          
          .services-section { margin-top: 15px; }
          .services-table { width: 100%; border-collapse: collapse; font-size: 11px; }
          .services-table th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; border-bottom: 2px solid #e2e8f0; }
          .services-table td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; }
          .services-table tr:hover { background: #f8fafc; }
          
          .item-footer { padding: 12px 15px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; align-items: center; gap: 15px; }
          .item-total-label { font-size: 12px; color: #64748b; }
          .item-total-value { font-size: 18px; font-weight: bold; color: #16a34a; }
          
          .totals-section { margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); border-radius: 8px; color: white; }
          .totals-grid { display: flex; justify-content: flex-end; }
          .total-final { text-align: right; }
          .total-final-label { font-size: 12px; opacity: 0.9; }
          .total-final-value { font-size: 28px; font-weight: bold; }
          
          .footer { margin-top: 30px; padding-top: 20px; border-top: 2px dashed #e2e8f0; text-align: center; }
          .qr-section { display: inline-block; padding: 15px; background: #f8fafc; border-radius: 8px; }
          .qr-section img { width: 100px; }
          .qr-text { font-size: 11px; color: #666; margin-top: 8px; }
          .footer-note { margin-top: 15px; font-size: 10px; color: #999; }
          
          .no-items { text-align: center; padding: 40px; color: #999; font-style: italic; }
          
          @media print { 
            body { padding: 10px; }
            .item-container { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company">${budget.owner?.company_name || 'TechFlow'}</div>
          ${budget.owner?.cnpj ? `<div class="company-cnpj">CNPJ: ${budget.owner.cnpj}</div>` : ''}
          ${budget.owner?.address ? `<div class="company-address">${budget.owner.address.street ? budget.owner.address.street + ', ' : ''}${budget.owner.address.number ? budget.owner.address.number + ' - ' : ''}${budget.owner.address.neighborhood ? budget.owner.address.neighborhood : ''}${budget.owner.address.city ? ' - ' + budget.owner.address.city : ''}${budget.owner.address.state ? ', ' + budget.owner.address.state : ''}${budget.owner.address.zip_code ? ' - CEP: ' + budget.owner.address.zip_code : ''}</div>` : ''}
          <div class="company-contact">
            ${budget.owner?.phone ? `${budget.owner.phone}` : ''}
            ${budget.owner?.email ? ` • ${budget.owner.email}` : ''}
          </div>
          <div class="budget-info">
            <div class="budget-info-row">
              <div>
                <span class="budget-info-label">Orçamento: </span>
                <span class="budget-info-value">${budget.code}</span>
              </div>
              <div>
                <span class="budget-info-label">Data: </span>
                <span class="budget-info-value">${new Date(budget.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              ${budget.valid_until ? `
                <div>
                  <span class="budget-info-label">Validade: </span>
                  <span class="budget-info-value">${new Date(budget.valid_until).toLocaleDateString('pt-BR')}</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
        
        <div class="client-section">
          <div class="section-title">Dados do Cliente</div>
          <div class="client-grid">
            <div class="client-field">
              <div class="client-field-label">Nome</div>
              <div class="client-field-value">${budget.client.client_name || budget.client.company_name || '-'}</div>
            </div>
            <div class="client-field">
              <div class="client-field-label">Telefone</div>
              <div class="client-field-value">${budget.client.phone || '-'}</div>
            </div>
            <div class="client-field">
              <div class="client-field-label">Email</div>
              <div class="client-field-value">${budget.client.email || '-'}</div>
            </div>
          </div>
        </div>
        
        <div class="items-container">
          <div class="section-title">Itens do Orçamento</div>
          ${itemsHtml}
          
          ${totalGeral > 0 ? `
            <div class="totals-section">
              <div class="totals-grid">
                <div class="total-final">
                  <div class="total-final-label">VALOR TOTAL DO ORÇAMENTO</div>
                  <div class="total-final-value">${formatCurrencyPrint(totalGeral)}</div>
                </div>
              </div>
            </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <div class="qr-section">
            <img src="https://quickchart.io/qr?size=150&text=${encodeURIComponent(trackUrl)}" alt="QR Code" />
            <p class="qr-text">Escaneie para visualizar o orçamento online</p>
          </div>
          <p class="footer-note">Este documento é apenas uma estimativa e pode sofrer alterações após análise técnica.</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const handleApprove = async () => {
    if (!id) return;
    try {
      await updateBudgetStatus({ id, status: 'APPROVED' });
      toast.success('Orçamento aprovado!');
      refetch();
    } catch (error) {
      toast.error('Erro ao aprovar orçamento');
    }
  };

  const handleReject = async () => {
    if (!id) return;
    try {
      await updateBudgetStatus({ id, status: 'REJECTED' });
      toast.success('Orçamento rejeitado');
      refetch();
    } catch (error) {
      toast.error('Erro ao rejeitar orçamento');
    }
  };

  const handleSend = async () => {
    if (!id || !validateBeforeSend()) return;
    try {
      await updateBudgetStatus({ id, status: 'SENT' });
      toast.success('Orçamento enviado ao cliente!');
      setShowSendConfirm(false);
      refetch();
    } catch (error) {
      toast.error('Erro ao enviar orçamento');
    }
  };

  const handleSaveEdit = () => {
    if (!budget) return;

    const itemsWithoutDiagnosed = (budget.items || []).filter(
      (item: any) => item.services && item.services.length > 0 && !item.diagnosed_problem
    );

    if (itemsWithoutDiagnosed.length > 0) {
      const itemNames = itemsWithoutDiagnosed.map((item: any) => item.name).join(', ');
      toast.error(`Preencha o "Problema identificado" para: ${itemNames}`);
      return;
    }

    setIsEditing(false);
    refetch();
    toast.success('Alterações salvas com sucesso!');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-2">Orçamento não encontrado</h2>
        <Button onClick={() => navigate('/budgets')}>Voltar para Orçamentos</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/budgets')} className="mb-3 md:mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Voltar</span>
        </Button>

        <div className="flex flex-col gap-4 mb-4 md:mb-6">
          <div>
            <div className="flex items-start flex-wrap gap-2 mb-2">
              <h1 className="text-xl md:text-2xl font-semibold">{budget.code}</h1>
              <span className={`text-xs px-1.5 py-0.5 md:px-2 md:py-1 rounded-full font-medium ${currentConfig?.bgColor} ${currentConfig?.color}`}>
                {currentConfig?.label}
              </span>
              {urgencyBadge && (
                <span className={`text-xs px-1.5 py-0.5 md:px-2 md:py-1 rounded-full font-medium ${urgencyBadge.bgColor} ${urgencyBadge.color}`}>
                  {urgencyBadge.label}
                </span>
              )}
              {isEditing && (
                <span className="text-xs px-1.5 py-0.5 md:px-2 md:py-1 rounded-full font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                  Modo Edição
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Cliente: {budget.client.client_name || budget.client.company_name}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
              {!isEditing && canStartAnalysis && (
                <Button size="sm" onClick={handleStartAnalysis}>
                  <Play className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Iniciar Análise</span>
                </Button>
              )}
              {!isEditing && canEdit && (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Pencil className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
              )}
              {!isEditing && canSend && (
                <Button size="sm" onClick={handleSend}>
                  <Send className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Enviar</span>
                </Button>
              )}
              {!isEditing && canApprove && (
                <>
                  <Button size="sm" variant="outline" onClick={handleReject}>
                    <X className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Rejeitar</span>
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500" onClick={handleApprove}>
                    <Check className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Aprovar</span>
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-300"
                onClick={() => {
                  const clientName = budget.client.client_name || budget.client.company_name || 'Cliente';
                  const currentUser = getUser<UserType>();
                  const waLink = generateWhatsAppLink({
                    phone: budget.client.phone,
                    name: clientName,
                    code: budget.code,
                    token: budget.public_token,
                    status: budget.status.name,
                    userName: currentUser?.name,
                    companyName: currentUser?.company_name,
                  });
                  if (waLink) {
                    window.open(waLink, '_blank');
                  } else {
                    toast.error('Cliente sem telefone');
                  }
                }}
              >
                <MessageCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">WhatsApp</span>
              </Button>
              <Button size="sm" variant="outline" onClick={handlePrint}>
                <Printer className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Imprimir</span>
              </Button>
            </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Cliente</span>
                </div>
                {canEditClient && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setShowClientModal(true)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <p className="text-lg">{budget.client.client_name || budget.client.company_name}</p>
              <p className="text-sm text-muted-foreground">{budget.client.email}</p>
              <p className="text-sm text-muted-foreground">{budget.client.phone}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Datas</span>
              </div>
              <p className="text-sm">Criado em: {formatDate(budget.created_at)}</p>
              {budget.valid_until && (
                <p className="text-sm">Válido até: {formatDate(budget.valid_until)}</p>
              )}
              {budget.updatedBy && (
                <p className="text-sm text-muted-foreground">
                  Editado por: {budget.updatedBy.name} em {formatDate(budget.updated_at)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {isEditing ? (
          <BudgetEditForm
            budgetId={budget.id}
            budgetStatus={budget.status.name}
            initialItems={budget.items || []}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-4">Itens do Orçamento</h2>
            
            {(!budget.items || budget.items.length === 0) ? (
              <Card className="mb-6">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    Nenhum item adicionado. Clique em "Editar Orçamento" para adicionar itens.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 mb-6">
                {budget.items.map((item, index) => (
                  <Card key={item.id || index} className="overflow-hidden border-l-4 border-l-[#1e40af]">
                    <CardContent className="p-0">
                      <div className="bg-gradient-to-r from-muted to-card p-4 border-b dark:border-slate-700">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="bg-[#1e40af] dark:bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                                #{index + 1}
                              </span>
                              <h3 className="font-semibold text-lg">{item.name}</h3>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.mark && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                                  {item.mark}
                                </span>
                              )}
                              {item.model && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                                  {item.model}
                                </span>
                              )}
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                Qtd: {item.quantity}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(item.total)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-3">
                        {item.reported_problem && (
                          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <span className="text-amber-600 dark:text-amber-400 mt-0.5">⚠️</span>
                              <div>
                                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide">Problema Relatado</p>
                                <p className="text-sm text-amber-900 dark:text-amber-200 mt-1">{item.reported_problem}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {item.diagnosed_problem && (
                          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <span className="text-blue-600 dark:text-blue-400 mt-0.5">🔧</span>
                              <div>
                                <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wide">Problema Identificado</p>
                                <p className="text-sm text-blue-900 dark:text-blue-200 mt-1">{item.diagnosed_problem}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {item.services && item.services.length > 0 && (
                          <div className="bg-muted dark:bg-slate-800/50 rounded-lg p-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1">
                              <span>🔧</span> Serviços/Peças
                            </p>
                            <div className="space-y-2">
                              {item.services.map((svc, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 bg-secondary dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground">
                                      {svc.quantity}x
                                    </span>
                                    <span className="text-sm font-medium text-foreground">{svc.name}</span>
                                  </div>
                                  <span className="text-sm font-semibold text-foreground">{formatCurrency(svc.total)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {budget.notes && (
              <Card className="mb-6">
                <CardContent className="py-4">
                  <h3 className="font-medium mb-2">Observações</h3>
                  <p className="text-sm whitespace-pre-wrap">{budget.notes}</p>
                </CardContent>
              </Card>
            )}

            {(budget.total || 0) > 0 && (
              <Card className="bg-muted dark:bg-slate-800/50">
                <CardContent className="py-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(budget.total)}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {showSendConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <CardContent className="py-6">
                <h3 className="text-lg font-semibold mb-4">Enviar Orçamento ao Cliente?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  O cliente receberá um email com o link para visualizar e aprovar o orçamento.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowSendConfirm(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button onClick={handleSend} className="flex-1">
                    Confirmar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <ClientDetailModal
        open={showClientModal}
        onOpenChange={setShowClientModal}
        clientId={budget?.client?.id || null}
      />
    </div>
  );
}
