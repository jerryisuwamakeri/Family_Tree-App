import client from './client';

export const authApi = {
  login: (email, password) =>
    client.post('/auth/login', {email, password}).then(r => r.data),

  register: payload =>
    client.post('/auth/register', payload).then(r => r.data),

  logout: () =>
    client.post('/auth/logout').then(r => r.data),

  me: () =>
    client.get('/auth/me').then(r => r.data),

  updatePassword: payload =>
    client.post('/auth/update-password', payload).then(r => r.data),

  forgotPassword: email =>
    client.post('/auth/forgot-password', {email}).then(r => r.data),

  resetPassword: payload =>
    client.post('/auth/reset-password', payload).then(r => r.data),
};
