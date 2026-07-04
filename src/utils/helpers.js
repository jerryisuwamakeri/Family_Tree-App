import {AVATAR_COLORS} from './theme';

export function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'});
}

export function getAge(dateStr) {
  if (!dateStr) return null;
  const birth = new Date(dateStr);
  if (isNaN(birth)) return null;
  const diff = Date.now() - birth.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('');
}

export function truncate(str, max = 80) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

// Stable color per person so an avatar doesn't change between renders.
export function colorForName(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function getRoleBadgeColor(role) {
  const map = {
    super_admin: '#8B5CF6',
    family_admin: '#00B14F',
    branch_manager: '#3B82F6',
    registered_member: '#FF7A1A',
    contributor: '#667085',
    public_viewer: '#98A2B3',
  };
  return map[role] || '#667085';
}

export function getRoleLabel(role) {
  const map = {
    super_admin: 'Super Admin',
    family_admin: 'Family Admin',
    branch_manager: 'Branch Manager',
    registered_member: 'Member',
    contributor: 'Contributor',
    public_viewer: 'Public Viewer',
  };
  return map[role] || role;
}

export function isAdmin(user) {
  return user && ['super_admin', 'family_admin'].includes(user.role);
}

export function isSuperAdmin(user) {
  return user && user.role === 'super_admin';
}

export function isBranchManager(user) {
  return user && ['super_admin', 'family_admin', 'branch_manager'].includes(user.role);
}
