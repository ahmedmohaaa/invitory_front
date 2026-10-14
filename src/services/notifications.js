import api from './api';

/**
 * 🔔 خدمات التنبيهات — المسار الجديد /rsvp-notifications/
 * لا يتعارض مع NotificationViewSet القديم
 */
export const fetchUnread = async () => {
  try {
    const res = await api.get('/rsvp-notifications/unread/', {
      validateStatus: (status) => status < 500,
    });
    if (res.status === 200 && res.data) {
      return res.data;
    }
    return { total: 0, items: [] };
  } catch {
    return { total: 0, items: [] };
  }
};

export const markRead = async (invitationId) => {
  try {
    const res = await api.post(`/rsvp-notifications/mark-read/${invitationId}/`, {}, {
      validateStatus: (status) => status < 500,
    });
    return res.status === 200 ? (res.data || { ok: true }) : { ok: false };
  } catch {
    return { ok: false };
  }
};