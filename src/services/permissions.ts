import { useMemo } from 'react';
import { loadSettings } from './settingsService';

export type Role = 'Owner' | 'Admin' | 'Manager' | 'Employee' | 'Viewer';

const ROLE_HIERARCHY: Record<Role, number> = {
  Owner: 100,
  Admin: 80,
  Manager: 60,
  Employee: 40,
  Viewer: 20,
};

type PermissionCheck = {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageTeam: boolean;
  canManageSettings: boolean;
  canExport: boolean;
  canManageWorkflows: boolean;
  canManageAI: boolean;
  canViewActivity: boolean;
};

const PERMISSION_MATRIX: Record<Role, PermissionCheck> = {
  Owner: {
    canCreate: true, canEdit: true, canDelete: true,
    canManageTeam: true, canManageSettings: true, canExport: true,
    canManageWorkflows: true, canManageAI: true, canViewActivity: true,
  },
  Admin: {
    canCreate: true, canEdit: true, canDelete: true,
    canManageTeam: true, canManageSettings: true, canExport: true,
    canManageWorkflows: true, canManageAI: true, canViewActivity: true,
  },
  Manager: {
    canCreate: true, canEdit: true, canDelete: false,
    canManageTeam: false, canManageSettings: false, canExport: true,
    canManageWorkflows: true, canManageAI: false, canViewActivity: true,
  },
  Employee: {
    canCreate: true, canEdit: true, canDelete: false,
    canManageTeam: false, canManageSettings: false, canExport: false,
    canManageWorkflows: false, canManageAI: false, canViewActivity: true,
  },
  Viewer: {
    canCreate: false, canEdit: false, canDelete: false,
    canManageTeam: false, canManageSettings: false, canExport: false,
    canManageWorkflows: false, canManageAI: false, canViewActivity: false,
  },
};

export function getCurrentRole(): Role {
  try {
    const settings = loadSettings();
    const role = settings.profile.role as Role;
    if (PERMISSION_MATRIX[role]) return role;
  } catch { /* fallback */ }
  return 'Viewer';
}

export function getPermissions(role?: Role): PermissionCheck {
  const r = role || getCurrentRole();
  return PERMISSION_MATRIX[r] || PERMISSION_MATRIX.Viewer;
}

export function roleAtLeast(userRole: Role, minimum: Role): boolean {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[minimum] || 0);
}

export function usePermissions(): PermissionCheck & { role: Role } {
  const perms = useMemo(() => {
    const role = getCurrentRole();
    return { ...getPermissions(role), role };
  }, []);
  return perms;
}
