import type { Client } from '../types';
import { Card, CardContent } from './ui/card';

interface ClientCardProps {
  client: Client;
  onClick: () => void;
}

export function ClientCard({ client, onClick }: ClientCardProps) {
  return (
    <Card
      className="hover:border-primary/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="py-4 md:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex-1 w-full">
            <h3 className="font-semibold text-base md:text-lg">
              {client.client_name || client.company_name}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
              <p className="text-xs md:text-sm text-muted-foreground">{client.email}</p>
              <p className="text-xs md:text-sm text-muted-foreground">{client.phone}</p>
            </div>
            {client.cpf && (
              <p className="text-xs text-muted-foreground mt-1">CPF: {client.cpf}</p>
            )}
            {client.cnpj && (
              <p className="text-xs text-muted-foreground mt-1">CNPJ: {client.cnpj}</p>
            )}
          </div>
          <div className="text-xs md:text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {client.client_type?.name}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}