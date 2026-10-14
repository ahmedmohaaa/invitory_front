import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { DesignProvider, useDesign } from './context/DesignContext';
import FormPanel from './components/FormPanel/FormPanel.jsx';
import PreviewPanel from './components/PreviewPanel/PreviewPanel.jsx';
import './DesignPage.css';
import ProgressStepper from '../../components/ProgressStepper/ProgressStepper';
import Navbar from '../../components/Navbar/Navbar.jsx';
const COPY = {
  ar: { 
    back: 'دعواتي', 
    title: 'مصمم الدعوات', 
    save: 'حفظ الآن', 
    dirty: 'تغييرات غير محفوظة', 
    saving: 'جارٍ الحفظ…', 
    saved: 'محفوظ',
    saveError: 'فشل الحفظ' 
  },
  en: { 
    back: 'My Invitations', 
    title: 'Invitation Designer', 
    save: 'Save Now', 
    dirty: 'Unsaved changes', 
    saving: 'Saving…', 
    saved: 'Saved',
    saveError: 'Save failed' 
  },
};

// استقبال routeId هنا كـ Prop
function DesignerShell({ routeId }) {
  const { lang } = useLanguage();
  const { state, saveNow } = useDesign();
  const navigate = useNavigate(); // إضافة useNavigate هنا لاستخدامها داخل الـ useEffect
  
  const c = COPY[lang] || COPY.ar;
  const { dirty, saving, savedAt } = state.meta.autosave;

  useEffect(() => {
    /* أول حفظ أنشأ مسودة ⇒ استبدل الرابط بدون إعادة تحميل */
    if (!routeId && state.meta.invitationId) {
      navigate(`/invitations/${state.meta.invitationId}/edit`, { replace: true });
    }
  }, [routeId, state.meta.invitationId, navigate]);

  const chip = saving
    ? { cls: 'is-saving', txt: c.saving }
    : state.meta.autosave.error
      ? { cls: 'is-error', txt: c.saveError }
      : dirty
        ? { cls: 'is-dirty', txt: c.dirty }
        : { 
            cls: 'is-saved', 
            txt: savedAt 
              ? `${c.saved} ${new Date(savedAt).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}` 
              : c.saved 
          };

return (
  <div className="dp">
    <Navbar className="dp-navbar"/>
    {/* شريط علوي زجاجي رفيع */}
    <header className="dp-top">
        <Link to="/my-invitations" className="dp-top__back">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {c.back}
        </Link>
        <h1 className="dp-top__title">{c.title}</h1>
        <div className="dp-top__side">
          <span className={`dp-chip ${chip.cls}`}><i aria-hidden="true" />{chip.txt}</span>
          <button className="dp-save" onClick={saveNow}>{c.save}</button>
        </div>
      </header>
      {/* التقسيم: نموذج (inline-start) + معاينة (inline-end) */}
    <div className="dp-grid">
      <FormPanel />
      <PreviewPanel />
    </div>
  </div>
);
}

export default function DesignPage() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  /* حماية الصفحة */
  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true });
  }, [user, loading, navigate]);

  if (loading || !user) return null;

  return (
    <DesignProvider key={id || 'new'} invitationId={id ? Number(id) : null}>
      <DesignerShell routeId={id || null} />
    </DesignProvider>
  );
}


