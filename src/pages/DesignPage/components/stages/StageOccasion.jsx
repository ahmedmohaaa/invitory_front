import { useLanguage } from '../../../../context/LanguageContext';
import { useDesign } from '../../context/DesignContext';
import './StageOccasion.css';

const COPY = {
  ar: {
    title: 'نوع المناسبة',
    desc: 'اختر نوع مناسبتك — يتغيّر طابع المعاينة الحية فوراً، وتُبنى بقية المراحل على هذا الاختيار.',
    solo: 'فردي',
    loading: 'جارٍ تحميل المناسبات…',
    error: 'تعذّر تحميل المناسبات من الخادم.',
    retry: 'إعادة المحاولة',
    selected: 'اختيارك الحالي',
  },
  en: {
    title: 'Occasion Type',
    desc: 'Choose your occasion — the live preview character changes instantly, and the remaining stages build on this choice.',
    solo: 'Solo',
    loading: 'Loading occasions…',
    error: 'Could not load occasions from the server.',
    retry: 'Retry',
    selected: 'Current selection',
  },
};

/** 💍 الخطوة 3 — مرحلة إدخال نوع المناسبة (من الباك اند) */
export default function StageOccasion() {
  const { lang } = useLanguage();
  const { state, update, occasions, occasionsLoading, occasionsError, reloadOccasions } = useDesign();
  const c = COPY[lang];
  const current = state.meta.occasion;
  const currentObj = occasions.find((o) => o.key === current);

  return (
    <section className="oc fp-glass">
      <h2 className="fp-stage__title">{c.title}</h2>
      <p className="fp-stage__desc">{c.desc}</p>

      {/* تحميل */}
      {occasionsLoading && (
        <div className="oc-grid" aria-label={c.loading}>
          {Array.from({ length: 9 }).map((_, i) => <span key={i} className="oc-skel" style={{ animationDelay: `${i * 60}ms` }} />)}
        </div>
      )}

      {/* خطأ + إعادة محاولة */}
      {!occasionsLoading && occasionsError && (
        <div className="oc-error">
          <p>{c.error}</p>
          <button type="button" className="oc-retry" onClick={reloadOccasions}>{c.retry}</button>
        </div>
      )}

      {/* شبكة المناسبات */}
      {!occasionsLoading && !occasionsError && (
        <div className="oc-grid" role="radiogroup" aria-label={c.title}>
          {occasions.map((o) => (
            <button
              key={o.key}
              type="button"
              role="radio"
              aria-checked={current === o.key}
              className={`oc-card ${current === o.key ? 'is-selected' : ''}`}
              onClick={() => update('meta.occasion', o.key)}
            >
              <span className="oc-card__emoji" aria-hidden="true">{o.emoji}</span>
              <span className="oc-card__label">{o.labels?.[lang] || o.key}</span>
              {o.solo && <span className="oc-card__solo">{c.solo}</span>}
              <span className="oc-card__check" aria-hidden="true">✓</span>
            </button>
          ))}
        </div>
      )}

      {currentObj && (
        <p className="oc-current">
          {c.selected}: <b>{currentObj.labels?.[lang] || currentObj.key}</b> {currentObj.emoji}
        </p>
      )}
    </section>
  );
}