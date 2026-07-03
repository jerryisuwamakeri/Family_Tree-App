import client from './client';

export const membersApi = {
  list: (params = {}) =>
    client.get('/members', {params}).then(r => r.data),

  get: id =>
    client.get(`/members/${id}`).then(r => r.data),

  create: payload =>
    client.post('/members', payload).then(r => r.data),

  update: (id, payload) =>
    client.put(`/members/${id}`, payload).then(r => r.data),

  delete: id =>
    client.delete(`/members/${id}`).then(r => r.data),

  tree: id =>
    client.get(`/members/${id}/tree`).then(r => r.data),

  chart: id =>
    client.get(`/members/${id}/chart`).then(r => r.data),

  uploadPhoto: (id, formData) =>
    client.post(`/members/${id}/photo`, formData, {
      headers: {'Content-Type': 'multipart/form-data'},
    }).then(r => r.data),

  uploadDocument: (id, formData) =>
    client.post(`/members/${id}/documents`, formData, {
      headers: {'Content-Type': 'multipart/form-data'},
    }).then(r => r.data),

  addMarriage: (id, payload) =>
    client.post(`/members/${id}/marriage`, payload).then(r => r.data),

  addChildren: (id, payload) =>
    client.post(`/members/${id}/children`, payload).then(r => r.data),

  stats: () =>
    client.get('/stats').then(r => r.data),

  feed: () =>
    client.get('/feed').then(r => r.data),
};
