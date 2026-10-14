import api from './api';

export const fetchCheckinList = (params) => api.get('/checkins/', { params }).then((r) => r.data);

export const fetchCheckinStats = (invitationId) =>
  api.get('/checkins/stats/', { params: { invitation_id: invitationId } }).then((r) => r.data);

export const exportCheckins = async (invitationId) => {
  const res = await api.get('/checkins/export/', {
    params: { invitation_id: invitationId },
    responseType: 'blob',
  });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `checkins-${invitationId}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};