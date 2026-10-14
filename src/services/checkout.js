import api from './api';

/** يبدأ عملية دفع لباقة مختارة — method اختياري (VISA/WALLET/…) */
export const startCheckout = ({ invitationId, packageId, method }) =>
  api.post('/checkout/start/', {
    invitation_id: invitationId,
    package_id: packageId,
    method: method || 'VISA',
  }).then((r) => r.data);

export const mockPay = (tranRef, fail = false) =>
  api.post(`/checkout/mock-pay/${tranRef}/`, { fail }).then((r) => r.data);

export const paymentHistory = () =>
  api.get('/checkout/history/').then((r) => r.data);