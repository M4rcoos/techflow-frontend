import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export const STATUS_TRANSLATIONS: Record<string, string> = {
  DRAFT: 'Rascunho',
  IN_ANALYSIS: 'Em Análise',
  SENT: 'Enviado',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  EXPIRED: 'Expirado',
  CREATED: 'Criada',
  IN_PROGRESS: 'Em Concerto',
  PAUSED: 'Pausado',
  READY: 'Pronto',
  PAID: 'Pago',
  COMPLETED: 'Finalizado',
  CANCELED: 'Cancelado',
};

export const ROLE_TRANSLATIONS: Record<string, string> = {
  OWNER: 'Dono',
  ADMIN: 'Admin',
  ATTENDANT: 'Atendente',
  TECHNICIAN: 'Técnico',
};

export const PAYMENT_TYPE_TRANSLATIONS: Record<string, string> = {
  CASH: 'Dinheiro',
  PIX: 'PIX',
  CREDIT: 'Cartão de Crédito',
  DEBIT: 'Cartão de Débito',
  BANK_SLIP: 'Boleto',
};

export const translatePaymentType = (type: string | undefined | null): string => {
  if (!type) return type || '';
  return PAYMENT_TYPE_TRANSLATIONS[type] || type;
};

export const translateRole = (role: string): string => {
  return ROLE_TRANSLATIONS[role] || role;
};

export const getStatusColor = (status: string | undefined) => {
  switch (status) {
    case 'APPROVED':
    case 'COMPLETED':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'SENT':
    case 'READY':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'IN_ANALYSIS':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'REJECTED':
    case 'CANCELED':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'EXPIRED':
      return 'bg-muted text-muted-foreground border-border';
    case 'DRAFT':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'CREATED':
      return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    case 'IN_PROGRESS':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'PAUSED':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'PAID':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

export const translateStatus = (status: string | undefined) => {
  if (!status) return status;
  return STATUS_TRANSLATIONS[status] || status;
};

export const formatCurrency = (value: number | undefined | null) => {
  if (value === undefined || value === null) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const parseToLocalDate = (dateString: string): Date => {
  if (!dateString) return new Date();
  
  if (dateString.includes('/')) {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  }
  
  const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const formatDate = (date: string | undefined) => {
  if (!date) return '';
  
  if (date.includes('/')) {
    return date;
  }
  
  const localDate = parseToLocalDate(date);
  return localDate.toLocaleDateString('pt-BR');
};

export const formatDateToInput = (date: Date | string): string => {
  let localDate: Date;
  if (date instanceof Date) {
    localDate = date;
  } else {
    localDate = parseToLocalDate(date);
  }
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const addBusinessDays = (days: number): Date => {
  const result = new Date();
  let added = 0;
  
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      added++;
    }
  }
  
  return result;
};

export type UrgencyType = 'EXPIRED' | 'DUE_TODAY' | null;

export const STATUSES_THAT_NEED_ACTION = ['DRAFT', 'IN_ANALYSIS'];

export function getDateStr(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function calculateUrgency(validUntil: string | Date | null | undefined, status: string): UrgencyType {
  if (!validUntil) return null;
  if (!STATUSES_THAT_NEED_ACTION.includes(status)) return null;
  
  const todayStr = getTodayStr();
  const dueDateStr = getDateStr(validUntil);
  
  if (dueDateStr < todayStr) return 'EXPIRED';
  if (dueDateStr === todayStr) return 'DUE_TODAY';
  return null;
}

export function isExpiring(validUntil: string | Date | null | undefined, status: string): boolean {
  return calculateUrgency(validUntil, status) === 'DUE_TODAY';
}

export function isExpired(validUntil: string | Date | null | undefined, status: string): boolean {
  return calculateUrgency(validUntil, status) === 'EXPIRED';
}

export function shouldShowUrgencyBadge(validUntil: string | Date | null | undefined, status: string): boolean {
  return calculateUrgency(validUntil, status) !== null;
}

export function generateWhatsAppLink({
  phone,
  name,
  code,
  token,
  status,
  userName,
  companyName,
  type = 'budget',
  serviceOrderCode,
  finalAmount,
}: {
  phone: string | null | undefined;
  name: string | null | undefined;
  code: string | null | undefined;
  token: string | null | undefined;
  status?: string | null | undefined;
  userName?: string | null | undefined;
  companyName?: string | null | undefined;
  type?: 'budget' | 'service_order';
  serviceOrderCode?: string | null | undefined;
  finalAmount?: number | null | undefined;
}): string | null {
  if (!phone || !name || !code) return null;

  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  const phoneWithDDI = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

  const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
  
  const getPublicUrl = () => {
    if (token) {
      return `${frontendUrl}/track/${token}`;
    }
    return `${frontendUrl}/budget/${code}`;
  };

  const publicUrl = getPublicUrl();
  const firstName = userName ? userName.split(' ')[0] : 'nossa equipe';
  const storeName = companyName || 'nossa loja';

  const getMessage = () => {
    const baseGreeting = `Olá, aqui é ${firstName} da ${storeName} 👋`;
    
    if (type === 'service_order') {
      const osCode = serviceOrderCode || code;
      const amountFormatted = finalAmount ? formatCurrency(finalAmount) : null;
      
      switch (status) {
        case 'CREATED':
          return `${baseGreeting}

Recebemos seu equipamento e ele já está em nossa bancada! 🔧

Aguardando análise técnica para identificar o problema.

Você pode acompanhar o status da sua OS pelo link abaixo:
${publicUrl}

Qualquer dúvida, fico à disposição 🙂`;

        case 'IN_PROGRESS':
          return `${baseGreeting}

Boas notícias! Já começamos o concerto do seu equipamento 🔧

Nossa equipe técnica está trabalhando nele.

Acompanhe o andamento pelo link abaixo:
${publicUrl}

Qualquer dúvida, fico à disposição 🙂`;

        case 'PAUSED':
          return `${baseGreeting}

Informamos que o serviço do seu equipamento foi pausado ⏸️

Isso pode ocorrer por diversos motivos, como aguardando peças ou retorno do cliente.

Acompanhe o andamento pelo link abaixo:
${publicUrl}

Qualquer dúvida, fico à disposição 🙂`;

        case 'READY':
          return `${baseGreeting}

Seu equipamento está pronto! 🎉

Valor total: ${amountFormatted || 'a combinar'}

Acompanhe pelo link abaixo:
${publicUrl}

Qualquer dúvida, fico à disposição 🙂`;

        case 'PAID':
          return `${baseGreeting}

Pagamento confirmado! ✅

Obrigado pela preferência! 😊

Acompanhe os detalhes pelo link abaixo:
${publicUrl}

Qualquer dúvida, fico à disposição 🙂`;

        case 'COMPLETED':
          return `${baseGreeting}

Seu equipamento foi entregue com sucesso! ✅

Foi um prazer te atender!

Caso precise de algo no futuro, estamos à disposição.

Acompanhe os detalhes pelo link abaixo:
${publicUrl}

Até a próxima! 👋`;

        case 'CANCELED':
          return `${baseGreeting}

Sua ordem de serviço foi cancelada.

Caso tenha alguma dúvida ou queira remarcar, estou à disposição.

Acompanhe os detalhes pelo link abaixo:
${publicUrl}`;

        default:
          return `${baseGreeting}

Segue o link para acompanhamento da sua OS ${osCode}:

${publicUrl}

Qualquer dúvida, fico à disposição 🙂`;
      }
    }

    switch (status) {
      case 'DRAFT':
        return `${baseGreeting}

Recebemos o seu equipamento e estamos preparando o orçamento.

Você pode acompanhar o status e andamento pelo link abaixo:
${publicUrl}

Qualquer dúvida, fico à disposição 🙂`;
      
      case 'IN_ANALYSIS':
        return `${baseGreeting}

Estamos finalizando o diagnóstico do seu equipamento.

Em breve você receberá o orçamento completo com os serviços e peças necessários.

Acompanhe pelo link abaixo:
${publicUrl}

Qualquer dúvida, fico à disposição 🙂`;
      
      case 'SENT':
        return `${baseGreeting}

Seu orçamento já está pronto! 📋

Você pode visualizar e aprovar pelo link abaixo:
${publicUrl}

Qualquer dúvida, fico à disposição 🙂`;
      
      case 'APPROVED':
        return `${baseGreeting}

Ótima notícia! Seu orçamento foi aprovado ✅

Já estamos agendando o serviço para o seu equipamento.

Acompanhe o andamento pelo link abaixo:
${publicUrl}

Qualquer dúvida, fico à disposição 🙂`;
      
      case 'REJECTED':
        return `${baseGreeting}

Recebemos a rejeição do orçamento.

Se precisar de mais informações ou quiser discutir outras opções, estou à disposição.

Acompanhe os detalhes pelo link abaixo:
${publicUrl}`;
      
      case 'EXPIRED':
        return `${baseGreeting}

Seu orçamento expirou e precisa ser atualizado.

Por favor, entre em contato para que possamos reenviar o orçamento atualizado.

Acompanhe pelo link abaixo:
${publicUrl}

Qualquer dúvida, fico à disposição 🙂`;
      
      default:
        return `${baseGreeting}

Seu orçamento #{${code}} já está disponível.

Você pode acompanhar o status e andamento pelo link abaixo:
${publicUrl}

Qualquer dúvida, fico à disposição 🙂`;
    }
  };

  const message = getMessage();

  return `https://wa.me/${phoneWithDDI}?text=${encodeURIComponent(message)}`;
}
