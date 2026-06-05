export const ROLES = ['Admin', 'Manager', 'Sales Executive'];

export function canViewAllLeads(user) {
  return user?.role === 'Admin' || user?.role === 'Manager';
}

export function canManageTeam(user) {
  return user?.role === 'Admin';
}

export function canAssignLeads(user) {
  return user?.role === 'Admin' || user?.role === 'Manager';
}

export function canDeleteLeads(user) {
  return user?.role === 'Admin';
}

export function canSyncTradeIndia(user) {
  return user?.role === 'Admin' || user?.role === 'Manager';
}

export function canViewTeamStats(user) {
  return Boolean(user);
}

export function roleBadgeClass(role) {
  switch (role) {
    case 'Admin':
      return 'bg-purple-500/15 text-purple-400 border-purple-500/20';
    case 'Manager':
      return 'bg-blue-500/15 text-blue-400 border-blue-500/20';
    default:
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
  }
}
