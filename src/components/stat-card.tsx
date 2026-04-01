import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  onClick?: () => void;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({ title, value, icon: Icon, onClick, description, trend }: StatCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className={cn(
        "bg-card border rounded-lg p-5 transition-all cursor-pointer relative",
        onClick && "hover:border-[#1e40af]/50 hover:shadow-sm"
      )}
      onClick={onClick}
      onMouseEnter={() => description && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
        </div>
        <div className="p-2 bg-muted rounded-lg">
          <Icon className="w-5 h-5 text-[#1e40af]" />
        </div>
      </div>
      
      {trend && (
        <div className="mt-2">
          <span className={cn(
            "text-xs font-medium",
            trend === 'up' && "text-emerald-600",
            trend === 'down' && "text-red-600",
            trend === 'neutral' && "text-muted-foreground"
          )}>
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trend === 'neutral' && '→'}
          </span>
        </div>
      )}
       
      {showTooltip && description && (
        <div className="absolute top-full left-0 mt-2 z-50 w-64 p-3 bg-popover border rounded-lg shadow-lg text-sm">
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
      )}
    </div>
  );
}
