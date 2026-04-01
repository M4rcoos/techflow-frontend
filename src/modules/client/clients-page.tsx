import { useState } from 'react';
import { Users } from 'lucide-react';
import { Pagination } from '../../components/ui/pagination';
import { PageHeader, EmptyState, ClientCard } from '../../components';
import { useClients } from '../../hooks';
import { useRoleAccess } from '../../hooks/use-role-access';
import { ClientFormModal } from './client-form-modal';
import { ClientDetailModal } from './client-detail-modal';

export function ClientsPage() {
  const [page, setPage] = useState(1);
  const { clients, pagination, isLoading } = useClients(page, 10);
  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const { canCreateClient } = useRoleAccess();

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
        <PageHeader
          title="Clientes"
          description={pagination ? `${pagination.total} cliente(s) cadastrado(s)` : 'Gerencie seus clientes'}
          action={canCreateClient ? {
            label: 'Novo Cliente',
            onClick: () => setShowClientModal(true),
          } : undefined}
        />

        {isLoading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : clients.length === 0 ? (
          <EmptyState
            icon={<Users className="w-12 h-12" />}
            title="Nenhum cliente cadastrado ainda"
            description="Comece adicionando seus primeiros clientes para gerenciá-los."
            actionLabel="Adicionar Primeiro Cliente"
            onAction={() => setShowClientModal(true)}
          />
        ) : (
          <>
            <div className="grid gap-4">
              {clients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onClick={() => setSelectedClientId(client.id)}
                />
              ))}
            </div>

            {pagination && pagination.pages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={pagination.pages}
                onPageChange={setPage}
              />
            )}
          </>
        )}

      <ClientFormModal open={showClientModal} onOpenChange={setShowClientModal} />
      <ClientDetailModal
        open={!!selectedClientId}
        onOpenChange={(open) => !open && setSelectedClientId(null)}
        clientId={selectedClientId}
      />
    </div>
  );
}
