import client from './client';

export const announcementsApi = {
  list: () =>
    client.get('/announcements').then(r => r.data),

  create: payload =>
    client.post('/announcements', payload).then(r => r.data),

  update: (id, payload) =>
    client.put(`/announcements/${id}`, payload).then(r => r.data),

  delete: id =>
    client.delete(`/announcements/${id}`).then(r => r.data),

  addAttachment: (id, formData) =>
    client.post(`/announcements/${id}/attachments`, formData, {
      headers: {'Content-Type': 'multipart/form-data'},
    }).then(r => r.data),

  deleteAttachment: (announcementId, attachmentId) =>
    client.delete(`/announcements/${announcementId}/attachments/${attachmentId}`).then(r => r.data),
};
