import api from './api';

/** 📊 لوحة الضيوف */
export const fetchRSVPList = (params) => api.get('/rsvps/', { params }).then((r) => r.data);

export const fetchRSVPStats = (invitationId) =>
  api.get('/rsvps/stats/', { params: { invitation_id: invitationId } }).then((r) => r.data);

export const updateRSVP = (id, data) => api.put(`/rsvps/${id}/`, data).then((r) => r.data);

export const deleteRSVP = (id) => api.delete(`/rsvps/${id}/`).then((r) => r.data);

/** 📥 تصدير CSV مع تنزيل مباشر */
export const exportRSVPs = async (invitationId) => {
  const res = await api.get('/rsvps/export/', {
    params: { invitation_id: invitationId },
    responseType: 'blob',
  });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rsvp-${invitationId}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};