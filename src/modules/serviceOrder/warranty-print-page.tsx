import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { warrantyService } from '../../services/warranty.service';
import type { WarrantyResponse } from '../../services/warranty.service';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';

interface ServiceOrderData {
  id: string;
  code: string;
  created_at: string;
  budget: {
    code: string;
    client: {
      client_name?: string;
      company_name?: string;
      phone?: string;
      email?: string;
      address?: {
        street?: string;
        number?: number;
        neighborhood?: string;
        city?: string;
        state?: string;
        cep?: string;
      } | null;
    };
  };
  owner: {
    company_name: string;
    cnpj?: string | null;
    phone?: string;
    email?: string;
    address?: {
      street?: string;
      number?: number;
      neighborhood?: string;
      city?: string;
      state?: string;
      cep?: string;
    } | null;
  };
}

export function WarrantyPrintPage() {
  const { id } = useParams<{ id: string }>();
  const [warranty, setWarranty] = useState<WarrantyResponse | null>(null);
  const [serviceOrder, setServiceOrder] = useState<ServiceOrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const warrantyData = await warrantyService.getByServiceOrder(id);
        const soRes = await api.get(`/api/service-orders/${id}`);

        setWarranty(warrantyData.data || null);
        setServiceOrder(soRes.data.data);
      } catch (err) {
        setError('Erro ao carregar dados da garantia');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (warranty && !isLoading) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [warranty, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (error || !warranty || !serviceOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error || 'Garantia não encontrada'}</p>
      </div>
    );
  }

  const clientName = serviceOrder.budget?.client?.client_name || serviceOrder.budget?.client?.company_name || '-';
  const clientAddress = serviceOrder.budget?.client?.address;
  const ownerAddress = serviceOrder.owner?.address;
  const ownerCnpj = serviceOrder.owner?.cnpj;
  const hasServices = warranty.services && warranty.services.length > 0;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Termo de Garantia - OS ${serviceOrder.code}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      padding: 20px; 
      font-size: 12px;
      line-height: 1.4;
    }
    .page {
      max-width: 210mm;
      margin: 0 auto;
      padding: 15mm;
      min-height: 297mm;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 2px solid #333;
      padding-bottom: 15px;
    }
    .company-name {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .company-info {
      font-size: 11px;
      color: #555;
    }
    .os-code {
      font-size: 18px;
      font-weight: bold;
      margin-top: 10px;
      color: #333;
    }
    .section {
      margin: 15px 0;
    }
    .section-title {
      font-size: 13px;
      font-weight: bold;
      border-bottom: 1px solid #ccc;
      padding-bottom: 5px;
      margin-bottom: 10px;
      background: #f5f5f5;
      padding: 5px 8px;
    }
    .row {
      display: flex;
      margin: 5px 0;
      font-size: 12px;
    }
    .label {
      font-weight: bold;
      width: 120px;
      color: #555;
    }
    .value {
      flex: 1;
    }
    .items-list {
      margin-left: 20px;
    }
    .item {
      margin: 8px 0;
      padding: 8px;
      background: #f9f9f9;
      border-left: 3px solid #333;
    }
    .item-name {
      font-weight: bold;
      font-size: 12px;
    }
    .item-details {
      font-size: 11px;
      color: #666;
      margin-top: 3px;
    }
    .warranty-box {
      background: #f0f7ff;
      border: 2px solid #0066cc;
      padding: 15px;
      margin: 20px 0;
      text-align: center;
    }
    .warranty-days {
      font-size: 28px;
      font-weight: bold;
      color: #0066cc;
    }
    .warranty-expires {
      font-size: 12px;
      color: #333;
      margin-top: 5px;
    }
    .terms {
      text-align: justify;
      font-size: 11px;
      line-height: 1.6;
      margin: 15px 0;
      padding: 10px;
      background: #fafafa;
      border: 1px solid #ddd;
    }
    .signature {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
    }
    .signature-box {
      width: 45%;
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #333;
      margin-top: 40px;
      padding-top: 5px;
      font-size: 11px;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 10px;
      color: #888;
      border-top: 1px solid #ddd;
      padding-top: 10px;
    }
    @media print {
      body { 
        padding: 0; 
      }
      .page {
        padding: 10mm;
      }
    }
    @page { 
      size: A4; 
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="company-name">${serviceOrder.owner?.company_name || 'TechFlow'}</div>
      <div class="company-info">
        ${ownerCnpj ? `CNPJ: ${ownerCnpj}<br/>` : ''}
        ${ownerAddress ? `${ownerAddress.street || ''}, ${ownerAddress.number || ''} - ${ownerAddress.neighborhood || ''}<br/>` : ''}
        ${ownerAddress ? `${ownerAddress.city || ''}-${ownerAddress.state || ''} - CEP: ${ownerAddress.cep || ''}<br/>` : ''}
        ${serviceOrder.owner?.phone || ''} ${serviceOrder.owner?.email ? `| ${serviceOrder.owner.email}` : ''}
      </div>
      <div class="os-code">TERMO DE GARANTIA - OS ${serviceOrder.code}</div>
    </div>

    <div class="section">
      <div class="section-title">DADOS DO CLIENTE</div>
      <div class="row">
        <span class="label">Nome:</span>
        <span class="value">${clientName}</span>
      </div>
      ${clientAddress ? `
      <div class="row">
        <span class="label">Endereço:</span>
        <span class="value">${clientAddress.street || ''}, ${clientAddress.number || ''} - ${clientAddress.neighborhood || ''}</span>
      </div>
      <div class="row">
        <span class="label">Cidade:</span>
        <span class="value">${clientAddress.city || ''}-${clientAddress.state || ''}</span>
      </div>
      ` : ''}
      <div class="row">
        <span class="label">Telefone:</span>
        <span class="value">${serviceOrder.budget?.client?.phone || '-'}</span>
      </div>
      <div class="row">
        <span class="label">Orçamento:</span>
        <span class="value">${serviceOrder.budget?.code || '-'}</span>
      </div>
    </div>

    <div class="section">
      <div class="section-title">ITENS/SERVIÇOS COBERTOS PELA GARANTIA</div>
      <div class="items-list">
        ${warranty.items && warranty.items.length > 0 ? warranty.items.map(item => `
          <div class="item">
            <div class="item-name">${item.name}</div>
            <div class="item-details">
              ${item.model ? `Modelo: ${item.model}` : ''}
              ${item.model && item.mark ? ' | ' : ''}
              ${item.mark ? `Marca: ${item.mark}` : ''}
            </div>
          </div>
        `).join('') : ''}
        ${hasServices ? warranty.services.map(service => `
          <div class="item">
            <div class="item-name">Serviço: ${service.name}</div>
            <div class="item-details">
              Item: ${service.budget_item_name} | Qtd: ${service.quantity} | Valor: R$ ${service.total.toFixed(2)}
            </div>
          </div>
        `).join('') : ''}
      </div>
    </div>

    <div class="warranty-box">
      <div class="warranty-days">${warranty.days} DIAS</div>
      <div class="warranty-expires">
        Garantia válida até: ${formatDate(warranty.expires_at)}
      </div>
    </div>

    <div class="section">
      <div class="section-title">TERMOS DE GARANTIA</div>
      <div class="terms">
        ${warranty.terms_text}
      </div>
    </div>

    <div class="signature">
      <div class="signature-box">
        <div class="signature-line">
          Assinatura do Cliente
        </div>
      </div>
      <div class="signature-box">
        <div class="signature-line">
          Assinatura da Empresa
        </div>
      </div>
    </div>

    <div class="footer">
      Documento gerado em ${new Date().toLocaleDateString('pt-BR')} | OS ${serviceOrder.code}
    </div>
  </div>
</body>
</html>
  `;

  return (
    <div>
      <div className="p-4 bg-yellow-50 border-b border-yellow-200 print:hidden">
        <p className="text-sm text-yellow-800">
          A impressão será aberta automaticamente. Caso não abra, clique no botão abaixo.
        </p>
        <button
          onClick={() => window.print()}
          className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Imprimir
        </button>
      </div>
      <iframe
        srcDoc={html}
        title="Garantia"
        style={{ width: '100%', height: 'calc(100vh - 100px)', border: 'none' }}
      />
    </div>
  );
}
