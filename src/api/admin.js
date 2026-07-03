import client from './client';

export const adminApi = {
  // Users
  getUsers: () =>
    client.get('/admin/users').then(r => r.data),

  updateUserRole: (userId, role) =>
    client.put(`/admin/users/${userId}/role`, {role}).then(r => r.data),

  updateUserApproval: (userId, approved) =>
    client.put(`/admin/users/${userId}/approval`, {approved}).then(r => r.data),

  deleteUser: userId =>
    client.delete(`/admin/users/${userId}`).then(r => r.data),

  // Compounds
  getCompounds: () =>
    client.get('/admin/compounds').then(r => r.data),

  createCompound: payload =>
    client.post('/admin/compounds', payload).then(r => r.data),

  updateCompound: (id, payload) =>
    client.put(`/admin/compounds/${id}`, payload).then(r => r.data),

  deleteCompound: id =>
    client.delete(`/admin/compounds/${id}`).then(r => r.data),

  // Progenitors
  getProgenitors: () =>
    client.get('/admin/progenitors').then(r => r.data),

  createProgenitor: payload =>
    client.post('/admin/progenitors', payload).then(r => r.data),

  updateProgenitor: (id, payload) =>
    client.put(`/admin/progenitors/${id}`, payload).then(r => r.data),

  // Imports
  importMembers: formData =>
    client.post('/admin/import-members', formData, {
      headers: {'Content-Type': 'multipart/form-data'},
    }).then(r => r.data),

  getLastImport: () =>
    client.get('/admin/import-members/last').then(r => r.data),

  rollbackImport: importId =>
    client.post(`/admin/import-members/${importId}/rollback`).then(r => r.data),

  purgeAllImports: () =>
    client.post('/admin/import-members/purge-all').then(r => r.data),

  // Tools
  purgeDemoMembers: () =>
    client.post('/admin/purge-demo-members').then(r => r.data),

  fixParentLinks: () =>
    client.post('/admin/fix-parent-links').then(r => r.data),

  cleanNameDates: () =>
    client.post('/admin/clean-name-dates').then(r => r.data),

  seedStandardProgenitors: () =>
    client.post('/admin/seed-standard-progenitors').then(r => r.data),

  uploadLogo: formData =>
    client.post('/admin/logo', formData, {
      headers: {'Content-Type': 'multipart/form-data'},
    }).then(r => r.data),
};
