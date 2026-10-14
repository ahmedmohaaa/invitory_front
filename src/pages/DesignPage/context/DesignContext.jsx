import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState,useMemo } from 'react';
import {
  createDraft,
  fetchDesign,
  fetchOccasions,
  fetchFonts,
  fetchCountries,
  fetchDetails,      // ✅ الخطوة 9 — كتالوج تفاصيل الحدث
  fetchGalleryPhotos, // ✅ الخطوة 11 — جلب صور المعرض
  fetchContacts,      // ✅ الخطوة 13 — جلب جهات الاتصال (كان مفقوداً!)
  fetchMusicLibrary,  // ✅ الخطوة 14 — مكتبة المنصة الموسيقية (كان مفقوداً ويسبب الخطأ)
  fetchGiftSettings,  // ✅ الخطوة 15 — إعدادات الهدية (كان مستخدماً بدون استيراد!)
  fetchWishlist,      // ✅ الخطوة 15 — قائمة الأمنيات (كان مستخدماً بدون استيراد!)
  fetchCameraSettings, // ✅ الخطوة 16 — إعدادات الكاميرا
  fetchRSVPSettings,  // ✅ الخطوة 18 — إعدادات RSVP
  saveDesign,
} from '../services/designService';

/**
 * 🧠 DesignContext — إدارة الحالة المركزية لمصمم الدعوات (Invitation Designer)
 *
 * المسؤوليات:
 *  1) مصدر حقيقة واحد يربط الـ Form (يمين) بالـ Preview (يسار) لحظياً.
 *  2) تعديل أي عمق عبر Dot-Path: update('theme.colors.title', '#C6A15B')
 *     ⇒ لا نعدّل الـ Reducer مع كل خطوة جديدة من خريطة الـ 20 خطوة.
 *  3) Autosave حقيقي: Debounce 1.2s ⇒ PUT /api/design/:id/
 *     وإن لم توجد دعوة بعد ⇒ POST /api/design/draft/ تلقائياً عند أول حفظ.
 *  4) كتالوجات الباك اند (المناسبات + الخطوط + الدول + التفاصيل) تُجلب مرة واحدة
 *     وتُشارك بين الـ Form والـ Preview بدون تكرار طلبات.
 *  5) معرض الصور: يُجلب عند Hydrate ويُحفظ في State محلي (لا يُحفظ في JSON).
 *  6) وضع المعاينة (initialData): حالة جاهزة للعرض بدون جلب أو حفظ.
 */

/* ═══════════════════════════════════════════════════════════
   1) الحالة الابتدائية (هيكل فقط — يُملأ عبر الخطوات)
   ═══════════════════════════════════════════════════════════ */
export const initialDesignState = {
  meta: {
    invitationId: null,
    stage: 0,            // ✅ الخطوة 16 — إعدادات الكاميرا (افتراضي للمرحلة الحالية)
    language: 'ar',
    occasion: '',
    activePage: 1,
    autosave: { rev: 0, dirty: false, saving: false, savedAt: null, error: null },
    scrollDirection: 'vertical',   // ← ✅ أضف هذا السطر فقط

  },
  theme: {
    font: '',
    colors: { title: '#14294B', body: '#3C4250', accent: '#C6A15B' },
  },
  pages: {
    1: { background: null },
    2: { background: null },
    3: { background: null },
    4: { background: null },
    5: { background: null },
  },
  info: {
    title: '',
    titleFont: '',
    date: '',
    time: '',
    country: '',
    hijri: '',
    thanks: '',
    thanksColor: '#C6A15B',
  },
  family: {
    hideFamilyNames: false,
    familyName1: '',
    familyName2: '',
    namesFont: '',
    invitationDir: 'rtl',
    invitationHtml: '',
  },
  venues: {
    list: [{ name: '', address: '', mapUrl: '' }],
  },
  program: {
    visible: true,
    events: [{ name: '', time: '20:00' }],
  },
  details: {              // خطوة 9 — تفاصيل الحدث (حتى 15 من 16 + نص حر)
    selected: [],
    custom: '',
  },
  accommodation: {         // ✅ الخطوة 10 — أين تقيمون (حتى 4 فنادق)
    enabled: false,
    hotels: [{ name: '', address: '', mapUrl: '' }],
    extraInfo: '',
  },
  gallery: {               // ✅ الخطوة 11 — معرض الصور (حتى 6 صور)
    photos: [],            // [{ id, url, caption, order }] — يُملأ من fetchGalleryPhotos
  },
  personalMessage: {       // خطوة 12 — رسالة شخصية فوق الصور في الصفحة 4
    title: '',             // عنوان الرسالة (حتى 100 حرف)
    body: '',              // نص الرسالة (حتى 500 حرف)
    signature: '',         // التوقيع (حتى 80 حرف)
  },
  contacts: {              // خطوة 13 — جهات الاتصال
    list: [],              // [{ id, name, role, phone, whatsapp, order }]
  },
  music: {                 // خطوة 14 — الموسيقى
    source: 'library',     // 'library' | 'custom' | 'youtube'
    trackId: null,
    customFileId: null,
    customUrl: '',
    youtubeUrl: '',
    startTime: { hours: 0, minutes: 0, seconds: 0 },
  },

    gift: {                  // خطوة 15 — الهدية
    enabled: false,
    message: '',
    bank_enabled: false,
    bank_holder: '',
    bank_iban: '',
    bank_qr: '',
  },
  wishlist: {              // قائمة الأمنيات
    items: [],             // [{ id, name, image, link, order }]
  },
  camera: {                // ✅ الخطوة 16 — إعدادات الكاميرا (3 toggles)
    hide_camera_button: false,
    hide_save_button: false,
    hide_gallery: false,
  },
    qr: {                    // خطوة 17 — إعدادات QR
    enabled: false,
    expected_guests: 100,
    scan_start: null,
    scan_end: null,
    employee_pin: '',
    checkin_url: '',
  },
    rsvp: {                  // خطوة 18 — إعدادات نموذج RSVP
    show_attendance: true,
    show_guests_count: true,
    show_message: true,
    show_live_counter: false,
    public_token: '',
    live_count: 0,
  },
    envelope: {              // خطوة «إعدادات إضافية» — غلاف الظرف
    name_color: '#B33636',
    name_font: '',
  },
    couple: {                // ✅ نوع الدعوة والأسماء (يغذي الصفحة 1 وختم الظرف)
    type: 'couple',        // 'couple' | 'solo'
    name1: '',
    name2: '',
  },
};

/* ═══════════════════════════════════════════════════════════
   2) أدوات Dot-Path الآمنة (Immutable)
   ═══════════════════════════════════════════════════════════ */
const cloneBranch = (v) => (Array.isArray(v) ? [...v] : { ...v });

const setPath = (obj, path, value) => {
  // ✅ Defense: path يجب أن يكون string
  if (!path || typeof path !== 'string') {
    console.warn('[DesignContext] setPath: path must be a string, got:', path, '| value:', value);
    return obj;
  }
  
  const keys = path.split('.');
  const root = cloneBranch(obj);
  let cur = root;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    cur[k] = cur[k] && typeof cur[k] === 'object' ? cloneBranch(cur[k]) : {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return root;
};

const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

/* ═══════════════════════════════════════════════════════════
   3) Reducer
   ═══════════════════════════════════════════════════════════ */
function reducer(state, action) {
  const touch = (next) => {
    const base = next.meta?.autosave || { rev: 0, dirty: false, saving: false, savedAt: null, error: null };
    return {
      ...next,
      meta: {
        ...next.meta,
        autosave: { ...base, rev: (base.rev || 0) + 1, dirty: true, error: null },
      },
    };
  };

  switch (action.type) {
    case 'UPDATE':
      return touch(setPath(state, action.path, action.value));
    case 'QUIET_UPDATE':
      return setPath(state, action.path, action.value);
    case 'TOGGLE':
      return touch(setPath(state, action.path, !getPath(state, action.path)));
    case 'PUSH':
      return touch(setPath(state, action.path, [...(getPath(state, action.path) || []), action.item]));
    case 'REMOVE':
      return touch(
        setPath(state, action.path, (getPath(state, action.path) || []).filter((_, i) => i !== action.index)),
      );
    case 'SET_STAGE':
      return { ...state, meta: { ...state.meta, stage: action.stage } };
    case 'SET_ID':
      return { ...state, meta: { ...state.meta, invitationId: action.id } };
    case 'HYDRATE':
      return {
        ...state,
        ...action.data,
        meta: { ...state.meta, ...(action.data.meta || {}) , stage: 1},
      };
    case 'AUTOSAVE':
      return { ...state, meta: { ...state.meta, autosave: { ...state.meta.autosave, ...action.patch } } };
    case 'RESET':
      return initialDesignState;
    default:
      return state;
  }
}

export const DesignContext = createContext(null);

const buildPayload = (s) => {
  const { autosave, stage, invitationId, activePage, ...meta } = s.meta;
  return { ...s, meta };
};

/* ═══════════════════════════════════════════════════════════
   4) Provider — يدعم وضع المعاينة عبر initialData
   ═══════════════════════════════════════════════════════════ */
export function DesignProvider({ invitationId = null, initialData = null, children }) {
  console.log('[DBG-6] DesignProvider: initialData موجود؟', !!initialData, '| الأسماء:', initialData && initialData.couple);
    /* ✅ تهيئة الـ Reducer بـ initialData إن وُجد (وضع المعاينة) أو initialDesignState */
    /* ✅ تطبيع initialData: ضمان وجود meta.autosave وجميع الحقول الأساسية */
  const normalizedInitial = useMemo(() => {
    if (!initialData) return initialDesignState;
    const merged = { ...initialDesignState, ...initialData };
    merged.meta = {
      ...initialDesignState.meta,
      ...(initialData.meta || {}),
      autosave: {
        ...initialDesignState.meta.autosave,
        ...(initialData.meta?.autosave || {}),
      },
    };
    /* ضمان وجود theme.colors و pages — قد تكون ناقصة في اللقطات القديمة */
    merged.theme = {
      ...initialDesignState.theme,
      ...(initialData.theme || {}),
      colors: {
        ...initialDesignState.theme.colors,
        ...(initialData.theme?.colors || {}),
      },
    };
    merged.pages = {
      ...initialDesignState.pages,
      ...(initialData.pages || {}),
    };
    return merged;
  }, [initialData]);

  /* ✅ استخدام initializer function — يُستدعى مرة واحدة فقط عند أول تركيب */
  const [state, dispatch] = useReducer(
    reducer,
    normalizedInitial,
    (init) => init  // lazy initializer — لا يُعيد الحساب
  );
    console.log('[DBG-8] state الفعلي: الأسماء =', state.couple, '| خلفية صفحة 1 =', state.pages && state.pages['1']);

  const stateRef = useRef(state);
  stateRef.current = state;

  /* ✅ علم وضع المعاينة */
  const isPreview = !!initialData;

  /* ---------- 🌐 كتالوج المناسبات (خطوة 3) ---------- */
  const [occasions, setOccasions] = useState([]);
  const [occasionsLoading, setOccasionsLoading] = useState(true);
  const [occasionsError, setOccasionsError] = useState('');

  const loadOccasions = useCallback(() => {
    setOccasionsLoading(true);
    fetchOccasions()
      .then((list) => {
        setOccasions(list);
        setOccasionsError('');
        const def = list.find((o) => o.default);
        if (def && !stateRef.current.meta.occasion) {
          dispatch({ type: 'QUIET_UPDATE', path: 'meta.occasion', value: def.key });
        }
      })
      .catch(() => setOccasionsError('network'))
      .finally(() => setOccasionsLoading(false));
  }, []);

  useEffect(() => { loadOccasions(); }, [loadOccasions]);

  /* ---------- 🔤 كتالوج الخطوط (خطوة 4) ---------- */
  const [fonts, setFonts] = useState([]);
  const [fontsLoading, setFontsLoading] = useState(true);

  const loadFonts = useCallback(() => {
    fetchFonts()
      .then((list) => {
        setFonts(list);
        const lang = stateRef.current.meta.language;
        const def = list.find((f) => f.default_for === lang) || list[0];
        if (def && !stateRef.current.theme?.font) {
          dispatch({ type: 'QUIET_UPDATE', path: 'theme.font', value: def.key });
        }
      })
      .catch(() => setFonts([]))
      .finally(() => setFontsLoading(false));
  }, []);

  useEffect(() => { loadFonts(); }, [loadFonts]);

  /* ---------- 🌍 كتالوج الدول (خطوة 5) ---------- */
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);

  const loadCountries = useCallback(() => {
    fetchCountries()
      .then(setCountries)
      .catch(() => setCountries([]))
      .finally(() => setCountriesLoading(false));
  }, []);

  useEffect(() => { loadCountries(); }, [loadCountries]);

  /* ---------- 🎯 كتالوج تفاصيل الحدث (خطوة 9) ---------- */
  const [detailsCatalog, setDetailsCatalog] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(true);

  const loadDetails = useCallback(() => {
    fetchDetails()
      .then(setDetailsCatalog)
      .catch(() => setDetailsCatalog([]))
      .finally(() => setDetailsLoading(false));
  }, []);

  useEffect(() => { loadDetails(); }, [loadDetails]);

  /* ---------- 🖼️ تحميل صور المعرض (خطوة 11) ---------- */
  const loadGalleryPhotos = useCallback(async () => {
    const id = stateRef.current.meta.invitationId;
    if (!id) return;
    try {
      const photos = await fetchGalleryPhotos(id);
      dispatch({ type: 'QUIET_UPDATE', path: 'gallery.photos', value: photos });
    } catch {
      // تجاهل — الصور اختيارية
    }
  }, []);

  const loadContacts = useCallback(async () => {
    const id = stateRef.current.meta.invitationId;
    if (!id) return;
    try {
      const contacts = await fetchContacts(id);
      dispatch({ type: 'QUIET_UPDATE', path: 'contacts.list', value: contacts });
    } catch {
      // تجاهل
    }
  }, []);

  /* ---------- 🎵 مكتبة الموسيقى من المنصة (خطوة 14) ---------- */
  const [musicLibrary, setMusicLibrary] = useState([]);
  const [musicLibraryLoading, setMusicLibraryLoading] = useState(true);

  const loadMusicLibrary = useCallback(() => {
    fetchMusicLibrary()
      .then(setMusicLibrary)
      .catch(() => setMusicLibrary([]))
      .finally(() => setMusicLibraryLoading(false));
  }, []);


  useEffect(() => { loadMusicLibrary(); }, [loadMusicLibrary]);

  /* ---------- 💧 Hydrate من الباك اند (مُعطَّل في وضع المعاينة) ---------- */
  useEffect(() => {
    if (isPreview) return;          // ✅ وضع المعاينة: لا جلب
    if (!invitationId) return;
    dispatch({ type: 'SET_ID', id: invitationId });
    fetchDesign(invitationId)
      .then((res) => {
        if (res?.data && Object.keys(res.data).length) {
          dispatch({ type: 'HYDRATE', data: res.data });
          loadGalleryPhotos();  // ✅ الخطوة 11 — جلب الصور بعد Hydrate
          loadContacts();  // ✅ الخطوة 13 — جلب جهات الاتصال بعد Hydrate
                    loadGiftSettings();  // ✅ الخطوة 15
          loadWishlist();      // ✅ الخطوة 15
          loadCameraSettings();  // ✅ الخطوة 16 — جلب إعدادات الكاميرا بعد Hydrate
                    loadRSVPSettings();  // ✅ الخطوة 18
        }
      })
      .catch(() => {});
  }, [invitationId, isPreview, loadGalleryPhotos, loadContacts]);



    const loadGiftSettings = useCallback(async () => {
    const id = stateRef.current.meta.invitationId;
    if (!id) return;
    try {
      const settings = await fetchGiftSettings(id);
      dispatch({ type: 'QUIET_UPDATE', path: 'gift', value: settings });
    } catch { /* تجاهل */ }
  }, []);

  const loadWishlist = useCallback(async () => {
    const id = stateRef.current.meta.invitationId;
    if (!id) return;
    try {
      const items = await fetchWishlist(id);
      dispatch({ type: 'QUIET_UPDATE', path: 'wishlist.items', value: items });
    } catch { /* تجاهل */ }
  }, []);

  /* ---------- 📷 إعدادات الكاميرا (خطوة 16) ---------- */
  const loadCameraSettings = useCallback(async () => {
    const id = stateRef.current.meta.invitationId;
    if (!id) return;
    try {
      const settings = await fetchCameraSettings(id);
      dispatch({ type: 'QUIET_UPDATE', path: 'camera', value: settings });
    } catch { /* تجاهل */ }
  }, []);

    /* ---------- 💌 إعدادات RSVP (خطوة 18) ---------- */
  const loadRSVPSettings = useCallback(async () => {
    const id = stateRef.current.meta.invitationId;
    if (!id) return;
    try {
      const s = await fetchRSVPSettings(id);
      dispatch({
        type: 'QUIET_UPDATE',
        path: 'rsvp',
        value: {
          show_attendance: s.show_attendance !== false,
          show_guests_count: s.show_guests_count !== false,
          show_message: s.show_message !== false,
          show_live_counter: !!s.show_live_counter,
          public_token: s.public_token || '',
          live_count: s.live_count || 0,
        },
      });
    } catch { /* تجاهل */ }
  }, []);

  /* ---------- 🆕 ضمان وجود دعوة ---------- */
  const ensureId = useCallback(async () => {
    let id = stateRef.current.meta.invitationId;
    if (!id) {
      const draft = await createDraft();
      id = draft.id;
      dispatch({ type: 'SET_ID', id });
    }
    return id;
  }, []);

  /* ---------- 💾 Flush الحفظ الحقيقي ---------- */
  const flush = useCallback(async () => {
    if (isPreview) return;          // ✅ وضع المعاينة: لا حفظ
    const s = stateRef.current;
    if (!s.meta.autosave.dirty || s.meta.autosave.saving) return;
    dispatch({ type: 'AUTOSAVE', patch: { saving: true, error: null } });
    try {
      const id = await ensureId();
      await saveDesign(id, buildPayload(stateRef.current));
      dispatch({
        type: 'AUTOSAVE',
        patch: { saving: false, dirty: false, savedAt: new Date().toISOString(), error: null },
      });
    } catch {
      dispatch({ type: 'AUTOSAVE', patch: { saving: false, error: 'save-failed' } });
    }
  }, [ensureId, isPreview]);

  /* ---------- ⏱️ Autosave Debounce (مُعطَّل في وضع المعاينة) ---------- */
  useEffect(() => {
    if (isPreview) return undefined;         // ✅ وضع المعاينة: لا autosave
    if (!state.meta.autosave.dirty) return undefined;
    const t = setTimeout(flush, 1200);
    return () => clearTimeout(t);
  }, [state.meta.autosave.rev, state.meta.autosave.dirty, flush, isPreview]);

  const saveNow = useCallback(() => flush(), [flush]);

  /* ---------- ✍️ أفعال التعديل العامة ---------- */
  const update = useCallback((path, value) => dispatch({ type: 'UPDATE', path, value }), []);
  const toggle = useCallback((path) => dispatch({ type: 'TOGGLE', path }), []);
  const push = useCallback((path, item) => dispatch({ type: 'PUSH', path, item }), []);
  const remove = useCallback((path, index) => dispatch({ type: 'REMOVE', path, index }), []);
  const setStage = useCallback((stage) => dispatch({ type: 'SET_STAGE', stage }), []);
  const hydrate = useCallback((data) => dispatch({ type: 'HYDRATE', data }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  /* ---------- 🎯 Selectors ---------- */
  const getOccasion = useCallback(
    (key) => occasions.find((o) => o.key === (key || stateRef.current.meta.occasion)) || null,
    [occasions],
  );

  const getFont = useCallback(
    (key) => fonts.find((f) => f.key === (key || stateRef.current.theme?.font)) || null,
    [fonts],
  );

  return (
    <DesignContext.Provider
      value={{
        state,
        update,
        toggle,
        push,
        remove,
        setStage,
        hydrate,
        reset,
        saveNow,
        ensureId,
        loadGalleryPhotos,   // ✅ الخطوة 11 — دالة إعادة تحميل الصور
        loadContacts,        // ✅ الخطوة 13 — دالة إعادة تحميل جهات الاتصال
        occasions,
        occasionsLoading,
        occasionsError,
        reloadOccasions: loadOccasions,
        getOccasion,
        fonts,
        fontsLoading,
        getFont,
        countries,
        countriesLoading,
        detailsCatalog,   // ✅ الخطوة 9 — كتالوج تفاصيل الحدث
        detailsLoading,
        musicLibrary,         // ✅ الخطوة 14 — مكتبة الموسيقى
        musicLibraryLoading,  // ✅ الخطوة 14
        loadMusicLibrary,     // ✅ الخطوة 14
         loadGiftSettings, loadWishlist,
        loadCameraSettings,   // ✅ الخطوة 16 — دالة إعادة تحميل إعدادات الكاميرا
                loadRSVPSettings,   // ✅ الخطوة 18
        isPreview,            // ✅ علم وضع المعاينة (للمكوّنات الفرعية)
      }}
    >
      {children}
    </DesignContext.Provider>
  );
}

export const useDesign = () => useContext(DesignContext);



























