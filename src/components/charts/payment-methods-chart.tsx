import { formatCurrency } from '../../lib/utils';

interface PaymentMethodData {
  label: string;
  value: number;
  color: string;
}

interface PaymentMethodsChartProps {
  data: Record<string, number>;
}

const paymentMethodLabels: Record<string, string> = {
  DINHEIRO: 'Dinheiro',
  PIX: 'PIX',
  CREDITO: 'Cartão de Crédito',
  DEBITO: 'Cartão de Débito',
  TRANSFERENCIA: 'Transferência',
  OUTROS: 'Outros',
};

const colors = [
  '#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'
];

export function PaymentMethodsChart({ data }: PaymentMethodsChartProps) {
  const total = Object.values(data).reduce((sum, val) => sum + val, 0);
  
  if (total === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum pagamento registrado ainda
      </div>
    );
  }

  const chartData: PaymentMethodData[] = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .map(([key, value], index) => ({
      label: paymentMethodLabels[key] || key,
      value,
      color: colors[index % colors.length],
    }));

  let cumulativePercentage = 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <div className="relative w-40 h-40 rounded-full overflow-hidden" style={{ background: '#e5e7eb' }}>
          {chartData.map((item, index) => {
            const percentage = (item.value / total) * 100;
            cumulativePercentage += percentage;
            
            return (
              <div
                key={index}
                className="absolute inset-0"
                style={{
                  background: `conic-gradient(${item.color} 0deg ${percentage * 3.6}deg, transparent ${percentage * 3.6}deg)`,
                }}
              />
            );
          })}
        </div>
      </div>
      
      <div className="space-y-2">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.label}</span>
            </div>
            <span className="font-medium">
              {formatCurrency(item.value)} ({(item.value / total * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PaymentMethodsChart;
