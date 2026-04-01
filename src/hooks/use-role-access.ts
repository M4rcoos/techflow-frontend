import { useMemo } from 'react';
import { useAuth } from './use-auth';

type Role = 'OWNER' | 'ADMIN' | 'TECHNICIAN' | 'ATTENDANT';

const roleHierarchy: Record<Role, number> = {
  OWNER: 4,
  ADMIN: 3,
  TECHNICIAN: 2,
  ATTENDANT: 1,
};

export const useRoleAccess = () => {
  const { user } = useAuth();

  const currentRole = useMemo(() => {
    return user?.role as Role | undefined;
  }, [user]);

  const hasRole = (requiredRole: Role): boolean => {
    if (!currentRole) return false;
    return roleHierarchy[currentRole] >= roleHierarchy[requiredRole];
  };

  const isOwner = useMemo(() => currentRole === 'OWNER', [currentRole]);
  const isAdmin = useMemo(() => currentRole === 'ADMIN', [currentRole]);
  const isTechnician = useMemo(() => currentRole === 'TECHNICIAN', [currentRole]);
  const isAttendant = useMemo(() => currentRole === 'ATTENDANT', [currentRole]);

  const canManageUsers = useMemo(() => isOwner || isAdmin, [isOwner, isAdmin]);
  const canDelete = useMemo(() => isOwner || isAdmin, [isOwner, isAdmin]);
  const canEditTechnical = useMemo(() => isOwner || isAdmin || isTechnician, [isOwner, isAdmin, isTechnician]);
  const canEditBudget = useMemo(() => isOwner || isAdmin, [isOwner, isAdmin]);
  const canCreateClient = useMemo(() => isOwner || isAdmin || isAttendant, [isOwner, isAdmin, isAttendant]);
  const canEditClient = useMemo(() => isOwner || isAdmin || isAttendant, [isOwner, isAdmin, isAttendant]);
  const canApproveBudget = useMemo(() => isOwner || isAdmin || isAttendant, [isOwner, isAdmin, isAttendant]);

  return {
    currentRole,
    hasRole,
    isOwner,
    isAdmin,
    isTechnician,
    isAttendant,
    canManageUsers,
    canDelete,
    canEditTechnical,
    canEditBudget,
    canCreateClient,
    canEditClient,
    canApproveBudget,
  };
};
