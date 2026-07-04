import client from './client';

export const metaApi = {
  compoundCounts: () =>
    client.get('/meta/compound-counts').then(r => r.data),

  progenitorsPublic: () =>
    client.get('/meta/progenitors-public').then(r => r.data),

  progenitors: () =>
    client.get('/meta/progenitors').then(r => r.data),

  memberSearch: query =>
    client.get('/meta/member-search', {params: {q: query}}).then(r => r.data),

  relationship: (fromMemberId, toMemberId) =>
    client.get('/meta/relationship', {
      params: {from_member_id: fromMemberId, to_member_id: toMemberId},
    }).then(r => r.data),

  compounds: () =>
    client.get('/compounds').then(r => r.data),
};
