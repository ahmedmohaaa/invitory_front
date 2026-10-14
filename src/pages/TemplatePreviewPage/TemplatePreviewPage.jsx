import { useEffect, useState,useRef,useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import InvitationPhone from '../../components/InvitationPhone/InvitationPhone';
import { DesignProvider } from '../DesignPage/context/DesignContext';
import { fetchTemplatePreview } from '../../services/templates';
import api from '../../services/api';
import './TemplatePreviewPage.css';

const COPY = {
  ar: {
    loading: 'جارٍ تحميل المعاينة…',
    notFound: 'لا توجد معاينة متاحة لهذا القالب',
    back: 'رجوع للمعرض',
    use: '✨ استخدام هذا القالب',
    selecting: 'جارٍ التجهيز…',
    loginFirst: 'سجّل دخولك أولاً لاختيار القالب',
    banner: 'معاينة قالب — كما يراها الضيوف تماماً',
  },
  en: {
    loading: 'Loading preview…',
    notFound: 'No preview available for this template',
    back: 'Back to gallery',
    use: '✨ Use this template',
    selecting: 'Preparing…',
    loginFirst: 'Login first to select this template',
    banner: 'Template preview — exactly as guests see it',
  },
};

/**
 * 👁 صفحة المعاينة الكاملة للقالب
 * تعرض اللقطة الكاملة (display_data) بوضع publicMode:
 * غلاف الظرف + تمرير الصفحة + التاب بار Sticky — تجربة الدعوة العامة حرفياً.
 */
export default function TemplatePreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { user } = useAuth();
  const c = COPY[lang];

  const [data, setData] = useState(null);
  /* 🔒 تثبيت مرجع البيانات لمنع إعادة تركيب DesignProvider */
  const dataRef = useRef(null);
  const stableData = useMemo(() => {
    if (!data) return null;
    if (dataRef.current && JSON.stringify(dataRef.current) === JSON.stringify(data)) {
      return dataRef.current; // نفس المرجع السابق
    }
    dataRef.current = data;
    return data;
  }, [data]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  /* 📥 جلب اللقطة الكاملة للقالب */
  useEffect(() => {
    let alive = true;
    fetchTemplatePreview(id)
      .then((r) => {
        if (!alive) return;
        console.log('[DBG-1] الاستجابة الخام من الخدمة:', r);
        console.log('[DBG-2] r.data:', r && r.data);
        console.log('[DBG-3] الأسماء في r.data:', r && r.data && r.data.couple);
        console.log('[DBG-4] الخلفيات في r.data:', r && r.data && r.data.pages);
        if (r && r.data) setData(r.data);
        else setError(c.notFound);
      })
      .catch(() => { if (alive) setError(c.notFound); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* 🎯 استخدام القالب → دعوة جديدة بالهيكل المحفوظ */
  const handleSelect = async () => {
    if (!user) {
      window.alert(c.loginFirst);
      navigate('/login');
      return;
    }
    setBusy(true);
    try {
      const res = await api.post(`/templates/${id}/start/`);
      navigate(`/invitations/${res.data.invitation_id}/edit`);
    } catch {
      navigate('/templates');
    } finally {
      setBusy(false);
    }
  };
  console.log('[DBG-5] الرندر: loading =', loading, '| stableData =', stableData, '| الأسماء =', stableData && stableData.couple);

  return (
    <div className="tpv">

      {/* شريط علوي رفيع — رجوع + استخدام (فوق كل الطبقات) */}
      <div className="tpv__bar">
        <button className="tpv__chip-btn" onClick={() => navigate('/templates')}>
          ← {c.back}
        </button>
        <span className="tpv__note">{c.banner}</span>
        <button className="tpv__chip-btn tpv__chip-btn--gold" onClick={handleSelect} disabled={busy}>
          {busy ? c.selecting : c.use}
        </button>
      </div>

      {/* حالة التحميل */}
      {loading && (
        <div className="tpv__state">
          <div className="tpv__spinner" aria-hidden="true" />
          <p>{c.loading}</p>
        </div>
      )}

      {/* حالة الخطأ */}
      {!loading && error && (
        <div className="tpv__state">
          <p>{error}</p>
          <button className="tpv__chip-btn" onClick={() => navigate('/templates')}>{c.back}</button>
        </div>
      )}

      {/* ✅ الدعوة الكاملة ببياناتها المنشورة — تجربة publicMode حرفياً */}
      {/* ✅ الدعوة الكاملة — key={id} يمنع إعادة تركيب DesignProvider */}
      {/* ✅ لا نركب DesignProvider إلا بعد جاهزية البيانات — key يضمن التركيب مرة واحدة */}
      {!loading && stableData && (
        <DesignProvider key={`preview-${id}`} initialData={stableData}>
          <InvitationPhone envelopeVisible publicMode />
        </DesignProvider>
      )}
    </div>
  );
}




