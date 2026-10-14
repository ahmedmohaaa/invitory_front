import { Fragment } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './ProgressStepper.css';

const COPY = {
  ar: { design: 'التصميم', preview: 'المعاينة', payment: 'الدفع', share: 'المشاركة' },
  en: { design: 'Design', preview: 'Preview', payment: 'Payment', share: 'Share' },
};
const ORDER = ['design', 'preview', 'payment', 'share'];

/** 🧭 شريط خطوات الرحلة — تتلون النقاط والخطوط السابقة تلقائياً */
export default function ProgressStepper({ current = 'design' }) {
  const { lang } = useLanguage();
  const c = COPY[lang];
  const idx = Math.max(0, ORDER.indexOf(current));

  return (
    <div className="ps" aria-label="Progress">
      {ORDER.map((key, i) => (
        <Fragment key={key}>
          {i > 0 && <span className={`ps__line ${i <= idx ? 'is-done' : ''}`} aria-hidden="true" />}
          <span className="ps__node">
            <span className={`ps__dot ${i < idx ? 'is-done' : ''} ${i === idx ? 'is-active' : ''}`}>
              {i < idx ? '✓' : i + 1}
            </span>
            <span className={`ps__label ${i === idx ? 'is-active' : ''}`}>{c[key]}</span>
          </span>
        </Fragment>
      ))}
    </div>
  );
}