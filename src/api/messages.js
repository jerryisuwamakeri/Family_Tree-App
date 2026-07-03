import client from './client';

export const messagesApi = {
  getBranchMessages: () =>
    client.get('/messages/branch').then(r => r.data),

  sendBranchMessage: payload =>
    client.post('/messages/branch', payload).then(r => r.data),

  getDirectMessages: () =>
    client.get('/messages/direct').then(r => r.data),

  sendDirectMessage: payload =>
    client.post('/messages/direct', payload).then(r => r.data),

  memberSearch: query =>
    client.get('/messages/member-search', {params: {q: query}}).then(r => r.data),
};
