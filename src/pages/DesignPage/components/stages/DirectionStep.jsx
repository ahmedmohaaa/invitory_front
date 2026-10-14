import { useState } from 'react';
import { useLanguage } from '../../../../context/LanguageContext';
import { useDesign } from '../../context/DesignContext';
import './DirectionStep.css';

const COPY = {
  ar: {
    eyebrow: 'الخطوة الأولى',
    title: 'اتجاه تحرك الدعوة',
    subtitle: 'اختر كيف سيتنقل ضيوفك بين صفحات الدعوة الخمس.',
    verticalTitle: 'عمودي',
    verticalDesc: 'التمرير من أعلى لأسفل — التجربة الكلاسيكية الأنيقة.',
    verticalBadge: 'الافتراضي',
    horizontalTitle: 'أفقي',
    horizontalDesc: 'تنقل تلقائي كل 5 ثوانٍ — تجربة سينمائية مميزة.',
    horizontalBadge: 'سينمائي',
    confirm: 'تأكيد والمتابعة',
  },
  en: {
    eyebrow: 'First step',
    title: 'Invitation scroll direction',
    subtitle: 'Choose how your guests move through the five pages.',
    verticalTitle: 'Vertical',
    verticalDesc: 'Top-to-bottom scrolling — the classic elegant flow.',
    verticalBadge: 'Default',
    horizontalTitle: 'Horizontal',
    horizontalDesc: 'Auto-advance every 5 seconds — a cinematic flow.',
    horizontalBadge: 'Cinematic',
    confirm: 'Confirm & Continue',
  },
};

/**
 * الخطوة 0 — اختيار اتجاه تحرك الدعوة (عمودي / أفقي).
 * يُحفظ في state.meta.scrollDirection ثم ينتقل للخطوة 1 (اللغة).
 */
export default function DirectionStep() {
  const { lang } = useLanguage();
  const { state, update, setStage } = useDesign();
  const c = COPY[lang];

  const current = state.meta?.scrollDirection || 'vertical';
  const [selected, setSelected] = useState(current);

  const handleConfirm = () => {
    // ✅ استخدام update بشكل صحيح: (path, value)
    update('meta.scrollDirection', selected);
    setStage(1);
  };

  return (
    <section className="fp-stage fp-glass direction-step">
      <span className="direction-step__eyebrow">{c.eyebrow}</span>
      <h2 className="direction-step__title">{c.title}</h2>
      <p className="direction-step__subtitle">{c.subtitle}</p>

      <div className="direction-step__options">
        {/* الخيار 1: عمودي */}
        <button
          type="button"
          className={`direction-card ${selected === 'vertical' ? 'is-selected' : ''}`}
          onClick={() => setSelected('vertical')}
          aria-pressed={selected === 'vertical'}
        >
          <div className="direction-card__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </div>
          <h3 className="direction-card__title">{c.verticalTitle}</h3>
          <p className="direction-card__desc">{c.verticalDesc}</p>
          <span className="direction-card__badge">{c.verticalBadge}</span>
        </button>

        {/* الخيار 2: أفقي */}
        <button
          type="button"
          className={`direction-card ${selected === 'horizontal' ? 'is-selected' : ''}`}
          onClick={() => setSelected('horizontal')}
          aria-pressed={selected === 'horizontal'}
        >
          <div className="direction-card__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
          <h3 className="direction-card__title">{c.horizontalTitle}</h3>
          <p className="direction-card__desc">{c.horizontalDesc}</p>
          <span className="direction-card__badge direction-card__badge--gold">{c.horizontalBadge}</span>
        </button>
      </div>

      <footer className="direction-step__foot">
        <button type="button" className="btn btn--gold direction-step__confirm" onClick={handleConfirm}>
          {c.confirm}
        </button>
      </footer>
    </section>
  );
}