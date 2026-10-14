import { useLanguage } from '../../../../context/LanguageContext';
import { useDesign } from '../../context/DesignContext';
import './StageLanguage.css';

const COPY = {
  ar: {
    title: 'لغة الدعوة',
    desc: 'اختر لغة دعوتك — سيتغير اتجاه الكتابة وخطوطها في الصفحات الخمس فوراً داخل المعاينة الحية.',
    optAr: 'العربية', optArHint: 'اتجاه من اليمين لليسار وخطوط عربية أنيقة',
    optEn: 'English', optEnHint: 'اتجاه من اليسار لليمين وخطوط لاتينية فاخرة',
    dirChip: 'الاتجاه الحالي',
    sampleAr: 'نتشرّف بحضوركم معنا',
    sampleEn: 'We are honored to have you with us',
  },
  en: {
    title: 'Invitation Language',
    desc: 'Choose your invitation language — writing direction and fonts across all five pages update instantly in the live preview.',
    optAr: 'العربية', optArHint: 'Right-to-left direction with elegant Arabic fonts',
    optEn: 'English', optEnHint: 'Left-to-right direction with luxurious Latin fonts',
    dirChip: 'Current direction',
    sampleAr: 'نتشرّف بحضوركم معنا',
    sampleEn: 'We are honored to have you with us',
  },
};

/** 🌐 الخطوة 2 — مرحلة إدخال لغة الدعوة */
export default function StageLanguage() {
  const { lang } = useLanguage();
  const { state, update } = useDesign();
  const c = COPY[lang];

  const current = state.meta.language || 'ar';
  const dir = current === 'ar' ? 'rtl' : 'ltr';
  const choose = (value) => update('meta.language', value);

  return (
    <section className="sl fp-glass">
      <h2 className="fp-stage__title">{c.title}</h2>
      <p className="fp-stage__desc">{c.desc}</p>

      {/* بطاقتا الاختيار */}
      <div className="sl-options" role="radiogroup" aria-label={c.title}>
        <button
          type="button"
          role="radio"
          aria-checked={current === 'ar'}
          className={`sl-card ${current === 'ar' ? 'is-selected' : ''}`}
          onClick={() => choose('ar')}
        >
          <span className="sl-card__glyph sl-card__glyph--ar" aria-hidden="true">ض</span>
          <span className="sl-card__name">{c.optAr}</span>
          <span className="sl-card__hint">{c.optArHint}</span>
          <span className="sl-card__check" aria-hidden="true">✓</span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={current === 'en'}
          className={`sl-card ${current === 'en' ? 'is-selected' : ''}`}
          onClick={() => choose('en')}
        >
          <span className="sl-card__glyph sl-card__glyph--en" aria-hidden="true">A</span>
          <span className="sl-card__name">{c.optEn}</span>
          <span className="sl-card__hint">{c.optEnHint}</span>
          <span className="sl-card__check" aria-hidden="true">✓</span>
        </button>
      </div>

      {/* شريط الاتجاه + عينة حية بنفس خطوط الدعوة */}
      <div className="sl-meta">
        <span className="sl-chip">
          <i aria-hidden="true" />
          {c.dirChip}: <b dir="ltr">{dir.toUpperCase()}</b>
        </span>
        <span className={`sl-sample sl-sample--${current}`} dir={dir}>
          {current === 'ar' ? c.sampleAr : c.sampleEn}
        </span>
      </div>
    </section>
  );
}