import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface StatusData {
  name: string;
  value: number;
  color: string;
}

interface BudgetStatusChartProps {
  data: Record<string, number>;
  onStatusClick?: (status: string) => void;
  selectedStatus?: string | null;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Aguardando orçamento', color: '#94a3b8' },
  IN_ANALYSIS: { label: 'Em análise', color: '#f59e0b' },
  SENT: { label: 'Aguardando resposta', color: '#f97316' },
  APPROVED: { label: 'Aprovados', color: '#22c55e' },
  REJECTED: { label: 'Rejeitados', color: '#ef4444' },
  EXPIRED: { label: 'Expirados', color: '#9ca3af' },
};

export function BudgetStatusChart({ data, onStatusClick, selectedStatus }: BudgetStatusChartProps) {
  const chartData: StatusData[] = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: key,
      value,
      color: statusConfig[key]?.color || '#6366f1',
    }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum orçamento no período
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6">
      <div className="relative w-36 h-36">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={65}
              paddingAngle={2}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={selectedStatus === entry.name ? '#fff' : 'transparent'}
                  strokeWidth={selectedStatus === entry.name ? 3 : 0}
                  style={{ cursor: onStatusClick ? 'pointer' : 'default', filter: selectedStatus && selectedStatus !== entry.name ? 'opacity(0.5)' : 'none' }}
                  onClick={() => onStatusClick?.(entry.name)}
                />
              ))}
            </Pie>
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as StatusData;
                  return (
                    <div className="bg-popover border rounded-lg shadow-lg p-2 text-sm z-50">
                      <p className="font-medium">{statusConfig[item.name]?.label || item.name}</p>
                      <p className="text-muted-foreground">
                        {item.value} ({((item.value / total) * 100).toFixed(1)}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold">{total}</span>
          <span className="text-[10px] text-muted-foreground">Total</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
        <AnimatePresence mode="popLayout">
          {chartData.map((item, index) => (
            <motion.button
              key={item.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onStatusClick?.(item.name)}
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg border transition-all hover:bg-muted/50",
                selectedStatus === item.name ? "border-[#1e40af] bg-[#1e40af]/5" : "border-transparent"
              )}
            >
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              />
              <div className="text-left min-w-0">
                <p className="text-[10px] text-muted-foreground truncate">
                  {statusConfig[item.name]?.label || item.name}
                </p>
                <p className="font-semibold text-sm">{item.value}</p>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface ServiceOrderStatusChartProps {
  data: Record<string, number>;
  onStatusClick?: (status: string) => void;
  selectedStatus?: string | null;
}

const serviceOrderStatusConfig: Record<string, { label: string; color: string }> = {
  CREATED: { label: 'Criada', color: '#8b5cf6' },
  IN_PROGRESS: { label: 'Em Serviço', color: '#3b82f6' },
  PAUSED: { label: 'Pausado', color: '#f59e0b' },
  READY: { label: 'Pronto', color: '#06b6d4' },
  PAID: { label: 'Pago', color: '#22c55e' },
  COMPLETED: { label: 'Entregue', color: '#10b981' },
  CANCELED: { label: 'Cancelado', color: '#ef4444' },
};

export function ServiceOrderStatusChart({ data, onStatusClick, selectedStatus }: ServiceOrderStatusChartProps) {
  const chartData: StatusData[] = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: key,
      value,
      color: serviceOrderStatusConfig[key]?.color || '#6366f1',
    }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma OS no período
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6">
      <div className="relative w-36 h-36">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={65}
              paddingAngle={2}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={selectedStatus === entry.name ? '#fff' : 'transparent'}
                  strokeWidth={selectedStatus === entry.name ? 3 : 0}
                  style={{ cursor: onStatusClick ? 'pointer' : 'default', filter: selectedStatus && selectedStatus !== entry.name ? 'opacity(0.5)' : 'none' }}
                  onClick={() => onStatusClick?.(entry.name)}
                />
              ))}
            </Pie>
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as StatusData;
                  return (
                    <div className="bg-popover border rounded-lg shadow-lg p-2 text-sm z-50">
                      <p className="font-medium">{serviceOrderStatusConfig[item.name]?.label || item.name}</p>
                      <p className="text-muted-foreground">
                        {item.value} ({((item.value / total) * 100).toFixed(1)}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold">{total}</span>
          <span className="text-[10px] text-muted-foreground">Total</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
        <AnimatePresence mode="popLayout">
          {chartData.map((item, index) => (
            <motion.button
              key={item.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onStatusClick?.(item.name)}
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg border transition-all hover:bg-muted/50",
                selectedStatus === item.name ? "border-[#1e40af] bg-[#1e40af]/5" : "border-transparent"
              )}
            >
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              />
              <div className="text-left min-w-0">
                <p className="text-[10px] text-muted-foreground truncate">
                  {serviceOrderStatusConfig[item.name]?.label || item.name}
                </p>
                <p className="font-semibold text-sm">{item.value}</p>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
