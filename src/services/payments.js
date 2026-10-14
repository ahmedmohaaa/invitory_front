import api from './api';

/** 💳 إنشاء معاملة دفع */
export const createPayment = (data) => api.post('/checkout/create/', data).then((r) => r.data);

/** 🔎 بيانات معاملة (لبوابة المحاكاة) */
export const getTransaction = (tranRef) => api.get(`/checkout/transaction/${tranRef}/`).then((r) => r.data);

/** 🧪 محاكاة نتيجة الدفع (mock فقط) */
export const mockPay = (tranRef, success) => api.post(`/checkout/mock-pay/${tranRef}/`, { success }).then((r) => r.data);

/** 📜 سجل المعاملات */
export const paymentHistory = () => api.get('/checkout/history/').then((r) => r.data);