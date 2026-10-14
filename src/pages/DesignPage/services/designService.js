import api from '../../../services/api';

/** 🌐 كتالوج المناسبات من الباك اند */
export const fetchOccasions = () => api.get('/design/occasions/').then((r) => r.data);

/** 💾 جلب حمولة المصمم لدعوة موجودة */
export const fetchDesign = (id) => api.get(`/design/${id}/`).then((r) => r.data);

/** 💾 حفظ حمولة المصمم (Upsert + رفع الإصدار) */
export const saveDesign = (id, data) => api.put(`/design/${id}/`, { data }).then((r) => r.data);

/** 🆕 إنشاء مسودة دعوة جديدة (زر Create New) */
export const createDraft = () => api.post('/design/draft/').then((r) => r.data);

/** 🔤 كتالوج الخطوط من الباك اند */
export const fetchFonts = () => api.get('/design/fonts/').then((r) => r.data);

/** 🖼️ رفع أصل (خلفية صفحة) — Multipart حقيقي */
export const uploadAsset = (file, { kind = 'BACKGROUND', invitationId = null } = {}) => {
  const form = new FormData();
  form.append('file', file);
  form.append('kind', kind);
  if (invitationId) form.append('invitation_id', invitationId);
  return api
    .post('/design/assets/', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data);
};

/** 🗑️ حذف أصل مرفوع */
export const deleteAsset = (id) => api.delete(`/design/assets/${id}/`).then((r) => r.data);
export const fetchCountries = () => api.get('/design/countries/').then((r) => r.data);
export const fetchDetails = () => api.get('/design/details/').then((r) => r.data);

/** 🖼️ رفع صورة للمعرض */
export const uploadGalleryPhoto = (invitationId, file, caption = '') => {
  const form = new FormData();
  form.append('file', file);
  form.append('caption', caption);
  return api
    .post(`/design/${invitationId}/gallery/upload/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

/** 📋 جلب صور المعرض */
export const fetchGalleryPhotos = (invitationId) =>
  api.get(`/design/${invitationId}/gallery/`).then((r) => r.data);

/** 🗑️ حذف صورة من المعرض */
export const deleteGalleryPhoto = (invitationId, photoId) =>
  api.delete(`/design/${invitationId}/gallery/${photoId}/`).then((r) => r.data);

/** 🔀 إعادة ترتيب الصور */
export const reorderGalleryPhotos = (invitationId, orderMap) =>
  api.post(`/design/${invitationId}/gallery/reorder/`, { order: orderMap }).then((r) => r.data);

/** 📞 إضافة جهة اتصال */
export const createContact = (invitationId, data) =>
  api.post(`/design/${invitationId}/contacts/create/`, data).then((r) => r.data);

/** 📋 جلب جهات الاتصال */
export const fetchContacts = (invitationId) =>
  api.get(`/design/${invitationId}/contacts/`).then((r) => r.data);

/** 🗑️ حذف جهة اتصال */
export const deleteContact = (invitationId, contactId) =>
  api.delete(`/design/${invitationId}/contacts/${contactId}/`).then((r) => r.data);


/** 🎼 مكتبة المنصة الموسيقية (المفعلة فقط) */
export const fetchMusicLibrary = (params = {}) =>
  api.get('/music/', { params: { is_active: 'true', page_size: '50', ...params } })
    .then((r) => r.data.results || r.data || []);

/** 🎵 رفع ملف موسيقى خاص بالدعوة */
export const uploadInvitationMusic = (invitationId, file) => {
  const form = new FormData();
  form.append('file', file);
  return api
    .post(`/design/${invitationId}/music/upload/`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data);
};

/** 🗑️ حذف ملف الموسيقى الخاص */
export const deleteInvitationMusic = (invitationId, fileId) =>
  api.delete(`/design/${invitationId}/music/${fileId}/`).then((r) => r.data);

/** 🎁 إعدادات الهدية */
export const fetchGiftSettings = (invitationId) =>
  api.get(`/design/${invitationId}/gift/`).then((r) => r.data);

export const updateGiftSettings = (invitationId, data) => {
  const form = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v !== null && v !== undefined) form.append(k, v);
  });
  return api.put(`/design/${invitationId}/gift/`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
};

/** 🎁 قائمة الأمنيات */
export const fetchWishlist = (invitationId) =>
  api.get(`/design/${invitationId}/wishlist/`).then((r) => r.data);

export const createWishlistItem = (invitationId, formData) =>
  api.post(`/design/${invitationId}/wishlist/create/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);

export const deleteWishlistItem = (invitationId, itemId) =>
  api.delete(`/design/${invitationId}/wishlist/${itemId}/`).then((r) => r.data);


/** 📷 إعدادات الكاميرا */
export const fetchCameraSettings = (invitationId) =>
  api.get(`/design/${invitationId}/camera/`).then((r) => r.data);

export const updateCameraSettings = (invitationId, data) => {
  const form = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v !== null && v !== undefined) form.append(k, v);
  });
  return api.put(`/design/${invitationId}/camera/`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
};

/** 🔐 نظام QR للضيوف */
export const fetchQRSettings = (invitationId) =>
  api.get(`/design/${invitationId}/qr-settings/`).then((r) => r.data);

export const updateQRSettings = (invitationId, data) => {
  const form = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v !== null && v !== undefined) form.append(k, v === true ? 'true' : v === false ? 'false' : v);
  });
  return api.put(`/design/${invitationId}/qr-settings/`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
};

export const fetchCheckinStats = (invitationId) =>
  api.get(`/design/${invitationId}/checkins/stats/`).then((r) => r.data);
/** 💌 إعدادات RSVP + إحصائياته */
export const fetchRSVPSettings = (invitationId) =>
  api.get(`/design/${invitationId}/rsvp-settings/`).then((r) => r.data);

export const updateRSVPSettings = (invitationId, data) => {
  const form = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v !== null && v !== undefined) form.append(k, v === true ? 'true' : v === false ? 'false' : v);
  });
  return api.put(`/design/${invitationId}/rsvp-settings/`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
};

export const fetchRSVPStats = (invitationId) =>
  api.get(`/design/${invitationId}/rsvps/stats/`).then((r) => r.data);

export const submitPublicRSVP = (token, data) =>
  api.post(`/rsvp/${token}/submit/`, data).then((r) => r.data);

/** ✅ إنهاء التصميم */
export const completeDesign = (invitationId) =>
  api.post(`/design/${invitationId}/complete/`).then((r) => r.data);



