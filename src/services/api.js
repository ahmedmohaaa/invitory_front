// src/services/api.js
import axios from 'axios';

// ✅ استخدام مسار نسبى لتستفيد من توجيه Vercel (Rewrites) ويتجنب مشكلة الـ Mixed Content
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/* ============================================================
   1) العميل المُصادَق (لوحة التحكم Admin)
   ============================================================ */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// إضافة التوكن تلقائياً لكل طلب (مع دعم localStorage و sessionStorage)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// التعامل مع انتهاء صلاحية التوكن (فقط إذا كان هناك توكن أصلاً)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && (localStorage.getItem('access_token') || sessionStorage.getItem('access_token'))) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/* ============================================================
   2) العميل العام (Landing Page — بدون مصادقة)
   ============================================================ */
const publicClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/** فك تغليف استجابات DRF المُرقّمة → إرجاع مصفوفة مباشرة */
const unwrap = (data) => data?.results ?? data ?? [];

export const publicApi = {
  // إتاحة دوال axios الخام أيضاً (publicApi.get / publicApi.post)
  get: (...args) => publicClient.get(...args),
  post: (...args) => publicClient.post(...args),

  // ✅ الدوال التي تحتاجها مكونات الـ Landing Page
  getPackages: () =>
    publicClient
      .get('/packages/', { params: { is_active: 'true' } })
      .then((res) => unwrap(res.data)),

  getTemplates: () =>
    publicClient
      .get('/templates/', { params: { is_active: 'true', page_size: '12' } })
      .then((res) => unwrap(res.data)),
};

export default api;
