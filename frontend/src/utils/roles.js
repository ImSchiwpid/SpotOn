export const normalizeRole = (role) => (role === 'user' ? 'customer' : role);

export const formatRoleLabel = (role) =>
  normalizeRole(role || 'customer')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
