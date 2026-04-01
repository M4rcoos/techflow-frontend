import { translateStatus, getStatusColor } from '../lib/utils';

interface StatusBadgeProps {
  status?: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  if (!status) return null;
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)} ${className}`}>
      {translateStatus(status)}
    </span>
  );
}