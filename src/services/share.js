import api from './api';

/** 🎉 جلب بيانات المشاركة */
export const fetchShareData = (id) => api.get(`/share/${id}/`).then((r) => r.data);

/** 🔁 توليد slug جديد */
export const regenerateSlug = (id) => api.post(`/share/${id}/regenerate/`).then((r) => r.data);

/** ✏️ تفعيل/إيقاف التعديل بعد الدفع */
export const toggleEditAllowed = (id, allowed) =>
  api.put(`/share/${id}/toggle-edit/`, { allowed }).then((r) => r.data);