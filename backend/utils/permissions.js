const ROLES = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  SALES: "Sales Executive",
};

function canViewAllLeads(user) {
  return user.role === ROLES.ADMIN || user.role === ROLES.MANAGER;
}

function canManageUsers(user) {
  return user.role === ROLES.ADMIN;
}

function canAssignLeads(user) {
  return user.role === ROLES.ADMIN || user.role === ROLES.MANAGER;
}

function canDeleteLeads(user) {
  return user.role === ROLES.ADMIN;
}

function canSyncTradeIndia(user) {
  return user.role === ROLES.ADMIN || user.role === ROLES.MANAGER;
}

function buildLeadQuery(user) {
  if (canViewAllLeads(user)) return {};
  return { assignedTo: user._id };
}

function canAccessLead(user, lead) {
  if (canViewAllLeads(user)) return true;
  if (!lead.assignedTo) return false;
  return String(lead.assignedTo) === String(user._id);
}

function actorFromUser(user) {
  if (!user) return null;
  return {
    userId: user._id,
    userName: user.name,
    userRole: user.role,
  };
}

module.exports = {
  ROLES,
  canViewAllLeads,
  canManageUsers,
  canAssignLeads,
  canDeleteLeads,
  canSyncTradeIndia,
  buildLeadQuery,
  canAccessLead,
  actorFromUser,
};
