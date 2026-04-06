import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleAccess } from '../../hooks/use-role-access';
import { useAuth } from '../../hooks/use-auth';
import { useUsers, useCreateUser, useDeleteUser, useUpdateUser } from '../../hooks/use-users';
import { userService } from '../../services/user.service';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Pagination } from '../../components/ui/pagination';
import { PageHeader } from '../../components/page-header';
import { Users, Plus, Edit, Trash2, X, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '../../types';

export function UsersPage() {
  const { canManageUsers } = useRoleAccess();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { users, pagination, isLoading } = useUsers(page, 10);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'TECHNICIAN' as string,
    department_id: '00000000-0000-0000-0000-000000000001',
  });

  const [editUser, setEditUser] = useState({
    name: '',
    email: '',
    role: 'TECHNICIAN' as string,
    active: true,
  });

  const [newPassword, setNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  useEffect(() => {
    if (!canManageUsers) {
      navigate('/dashboard');
    }
  }, [canManageUsers, navigate]);

  if (!canManageUsers) {
    return null;
  }

  const handleCreateUser = async () => {
    try {
      await createUser.mutateAsync(newUser);
      setShowCreateModal(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'TECHNICIAN',
        department_id: '00000000-0000-0000-0000-000000000001',
      });
      toast.success('Funcionário criado com sucesso!');
    } catch (error) {
      // Error already handled by hook
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      name: user.name,
      email: user.email || '',
      role: user.role || 'TECHNICIAN',
      active: true,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      await updateUser.mutateAsync({
        id: selectedUser.id,
        data: editUser,
      });
      setShowEditModal(false);
      setSelectedUser(null);
      toast.success('Funcionário atualizado com sucesso!');
    } catch (error) {
      // Error already handled by hook
    }
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await deleteUser.mutateAsync(selectedUser.id);
      setShowDeleteDialog(false);
      setSelectedUser(null);
      toast.success('Funcionário excluído com sucesso!');
    } catch (error) {
      // Error already handled by hook
    }
  };

  const handleResetPasswordClick = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowResetPasswordDialog(true);
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword || newPassword.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    setIsResettingPassword(true);
    try {
      await userService.resetPassword(selectedUser.id, newPassword);
      setShowResetPasswordDialog(false);
      setSelectedUser(null);
      setNewPassword('');
      toast.success('Senha redefinida com sucesso!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao redefinir senha');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const canEditUser = (user: User) => {
    if (currentUser?.role === 'OWNER') return true;
    if (user.role === 'OWNER') return false;
    return true;
  };

  const canDeleteUser = (user: User) => {
    if (currentUser?.role === 'OWNER') return true;
    if (user.role === 'OWNER') return false;
    return true;
  };

  const canResetPassword = (user: User) => {
    if (currentUser?.role === 'OWNER') return true;
    if (user.role === 'OWNER') return false;
    return true;
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, string> = {
      OWNER: 'bg-purple-100 text-purple-800',
      ADMIN: 'bg-blue-100 text-blue-800',
      TECHNICIAN: 'bg-green-100 text-green-800',
      ATTENDANT: 'bg-orange-100 text-orange-800',
    };
    return badges[role] || 'bg-gray-100 text-gray-800';
  };

  const translateRole = (role: string) => {
    const roles: Record<string, string> = {
      OWNER: 'Dono',
      ADMIN: 'Administrador',
      TECHNICIAN: 'Técnico',
      ATTENDANT: 'Atendente',
    };
    return roles[role] || role;
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <PageHeader
          title="Funcionários"
          description={pagination ? `${pagination.total} funcionário(s) cadastrado(s)` : 'Gerencie os funcionários da sua empresa'}
          action={{
            label: 'Novo Funcionário',
            onClick: () => setShowCreateModal(true),
          }}
        />

      {isLoading ? (
        <div className="text-center py-12">Carregando funcionários...</div>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhum funcionário cadastrado</h3>
              <p className="text-muted-foreground mb-4">Comece adicionando funcionários para sua empresa</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Funcionário
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="py-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role || 'ATTENDANT')}`}>
                        {translateRole(user.role || 'ATTENDANT')}
                      </span>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleResetPasswordClick(user)}
                          disabled={!canResetPassword(user)}
                          title="Resetar senha"
                        >
                          <KeyRound className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditClick(user)}
                          disabled={!canEditUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteClick(user)}
                          disabled={!canDeleteUser(user)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={page}
                totalPages={pagination.pages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <button
            onClick={() => setShowCreateModal(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </button>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Funcionário</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Nome do funcionário"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            
            <div>
              <Label htmlFor="role">Função</Label>
              <select
                id="role"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="ADMIN">
                  Administrador
                </option>
                <option value="TECHNICIAN">
                  Técnico
                </option>
                <option value="ATTENDANT">
                  Atendente
                </option>
              </select>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Permissões da função:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {newUser.role === 'ADMIN' && (
                  <>
                    <li>• Criar e gerenciar usuários (exceto Owner)</li>
                    <li>• Acesso total a orçamentos e clientes</li>
                    <li>• Pode excluir registros</li>
                  </>
                )}
                {newUser.role === 'TECHNICIAN' && (
                  <>
                    <li>• Visualizar e editar orçamentos técnicos</li>
                    <li>• Atualizar status de ordens de serviço</li>
                    <li>• Não pode excluir registros</li>
                  </>
                )}
                {newUser.role === 'ATTENDANT' && (
                  <>
                    <li>• Criar clientes e orçamentos</li>
                    <li>• Aprovar orçamentos</li>
                    <li>• Não pode editar valores técnicos</li>
                  </>
                )}
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} disabled={createUser.isPending}>
              {createUser.isPending ? 'Criando...' : 'Criar Funcionário'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <button
            onClick={() => setShowEditModal(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </button>
          <DialogHeader>
            <DialogTitle>Editar Funcionário</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Nome Completo</Label>
              <Input
                id="edit-name"
                value={editUser.name}
                onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                placeholder="Nome do funcionário"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-role">Função</Label>
              <select
                id="edit-role"
                value={editUser.role}
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
              >
                <option value="ADMIN">Administrador</option>
                <option value="TECHNICIAN">Técnico</option>
                <option value="ATTENDANT">Atendente</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateUser} disabled={updateUser.isPending}>
              {updateUser.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <button
            onClick={() => setShowDeleteDialog(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </button>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-muted-foreground">
              Tem certeza que deseja excluir o funcionário <strong>{selectedUser?.name}</strong>?
              Esta ação não pode ser desfeita.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleDeleteUser} 
              disabled={deleteUser.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteUser.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <button
            onClick={() => setShowResetPasswordDialog(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </button>
          <DialogHeader>
            <DialogTitle>Resetar Senha</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <p className="text-muted-foreground">
              Digite a nova senha para <strong>{selectedUser?.name}</strong>:
            </p>
            <div>
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetPasswordDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleResetPassword} 
              disabled={isResettingPassword || newPassword.length < 6}
            >
              {isResettingPassword ? 'Salvando...' : 'Salvar Nova Senha'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </main>
    </div>
  );
}
