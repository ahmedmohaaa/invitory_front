import api from './api';

/** (Staff) تجميد دعوة كقالب قابل لإعادة الاستخدام */
export const saveAsTemplate = (payload) =>
  api.post('/template-snapshot/', payload).then((r) => r.data);

/** هل للقالب لقطة تصميم؟ */
export const templateSnapshotInfo = (templateId) =>
  api.get('/template-snapshot/', { params: { template_id: templateId } }).then((r) => r.data);


/** اللقطة الكاملة للمعاينة الحية */
export const fetchTemplatePreview = (templateId) =>
  api.get('/template-snapshot/preview/', { params: { template_id: templateId } }).then((r) => r.data);

/** بيانات صور الكروت (أول خلفية + أسماء) */
export const fetchTemplateCards = () =>
  api.get('/template-snapshot/cards/').then((r) => r.data);