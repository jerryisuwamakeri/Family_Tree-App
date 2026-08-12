import client from './client';

export const messagesApi = {
  getBranchMessages: () =>
    client.get('/messages/branch').then(r => r.data),

  sendBranchMessage: payload =>
    client.post('/messages/branch', payload).then(r => r.data),

  // Backend models direct messages as one thread per recipient, not a flat
  // inbox -- recipient_id is required.
  getDirectMessages: recipientId =>
    client.get('/messages/direct', {params: {recipient_id: recipientId}}).then(r => r.data),

  sendDirectMessage: (recipientId, body) =>
    client.post('/messages/direct', {recipient_id: recipientId, body}).then(r => r.data),

  memberSearch: query =>
    client.get('/messages/member-search', {params: {q: query}}).then(r => r.data),
};
