import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '../../lib/utils';

interface PaymentStats {
  payment_type: string;
  total_amount: number;
  count: number;
}

interface PaymentMethodsBarChartProps {
  data: PaymentStats[];
}

const paymentMethodLabels: Record<string, string> = {
  CASH: 'Dinheiro',
  PIX: 'PIX',
  CREDIT: 'Crédito',
  DEBIT: 'Débito',
  BANK_SLIP: 'Boleto',
  OUTROS: 'Outros',
  UNKNOWN: 'Outros',
};

const barColors = [
  '#6366f1',
  '#22c55e', 
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
];

export function PaymentMethodsBarChart({ data }: PaymentMethodsBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Nenhuma OS concluída no período
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: paymentMethodLabels[item.payment_type] || item.payment_type,
    amount: item.total_amount,
    count: item.count,
    type: item.payment_type,
  }));

  const totalAmount = data.reduce((sum, item) => sum + item.total_amount, 0);

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis 
              type="number" 
              tickFormatter={(value) => formatCurrency(value).replace('R$', '').trim()}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={70}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm z-50">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-muted-foreground">
                        Total: {formatCurrency(item.amount)}
                      </p>
                      <p className="text-muted-foreground">
                        Quantidade: {item.count}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="amount" radius={[0, 4, 4, 0]} maxBarSize={40}>
              {chartData.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={barColors[index % barColors.length]} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {chartData.map((item, index) => (
          <div 
            key={item.type}
            className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
          >
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: barColors[index % barColors.length] }} 
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground truncate">{item.name}</p>
              <p className="font-medium text-sm">{formatCurrency(item.amount)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-2 border-t">
        <p className="text-sm text-muted-foreground">Total Concluído</p>
        <p className="text-xl font-bold text-primary">{formatCurrency(totalAmount)}</p>
      </div>
    </div>
  );
}

export default PaymentMethodsBarChart;
