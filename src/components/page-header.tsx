import type { ReactNode } from 'react';
import { Button } from './ui/button';

interface ActionButtonProps {
  label: string;
  onClick: () => void;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ActionButtonProps | ReactNode;
  children?: ReactNode;
}

function isActionButton(action: unknown): action is ActionButtonProps {
  return typeof action === 'object' && action !== null && 'label' in action && 'onClick' in action;
}

export function PageHeader({ title, description, action, children }: PageHeaderProps) {
  const renderAction = () => {
    if (!action) return null;
    if (isActionButton(action)) {
      return <Button className="rounded-full w-full sm:w-auto" onClick={action.onClick}>{action.label}</Button>;
    }
    return action;
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{title}</h1>
          {description && <p className="text-sm md:text-base text-muted-foreground">{description}</p>}
        </div>
        {renderAction()}
      </div>
      {children}
    </div>
  );
}
