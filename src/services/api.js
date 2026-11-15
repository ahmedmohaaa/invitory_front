// src/services/api.js
import axios from 'axios';

// ✅ استخدام مسار نسبى لتستفيد من توجيه Vercel (Rewrites) ويتجنب مشكلة الـ Mixed Content
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * 🔧 إصلاح URLs في البيانات المستلمة من الباك إند
 * يحول http://169.58.57.75 → https://www.invitory.net
 * ويحول أي http:// → https://
 */
const fixMediaUrls = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(fixMediaUrls);
  
  const fixed = { ...obj };
  for (const key of Object.keys(fixed)) {
    const value = fixed[key];
    if (typeof value === 'string') {
      // تخطي الـ data URLs و blob URLs
      if (value.startsWith('data:') || value.startsWith('blob:')) continue;
      
      // إصلاح IP القديم + تحويل http → https
      fixed[key] = value
        .replace(/http:\/\/169\.58\.57\.75/gi, 'https://www.invitory.net')
        .replace(/^http:\/\//i, 'https://');
    } else if (typeof value === 'object' && value !== null) {
      fixed[key] = fixMediaUrls(value);
    }
  }
  return fixed;
};

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

// ✅ إصلاح URLs في الاستجابات + التعامل مع انتهاء صلاحية التوكن
api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object') {
      response.data = fixMediaUrls(response.data);
    }
    return response;
  },
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

// ✅ إصلاح URLs في الاستجابات العامة أيضاً
publicClient.interceptors.response.use((response) => {
  if (response.data && typeof response.data === 'object') {
    response.data = fixMediaUrls(response.data);
  }
  return response;
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
