import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../context/LanguageContext';
import { useDesign } from '../../context/DesignContext';
import { completeDesign } from '../../services/designService';
import './StageExtraSettings.css';

const COPY = {
  ar: {
    title: 'إعدادات إضافية',
    nearEnd: 'اقتربنا من النهاية! تفاصيل أخيرة تُكمل هوية دعوتك 🤎',
    desc: 'خصص غلاف الدعوة (الظرف): لون اسم الظرف وخطه. يظهر الغلاف في المعاينة أثناء هذه الخطوة فقط، ويُفتح بزر OPEN.',
    colorLabel: 'لون اسم الظرف',
    fontLabel: 'خط اسم الظرف',
    hint: 'في المعاينة: اضغط OPEN لانزلاق البابان وكشف الدعوة خلفهما.',
    phName: 'الاسم',
    finish: '✓ إنهاء التصميم',
    finishing: 'جارٍ الإنهاء…',
  },
  en: {
    title: 'Extra Settings',
    nearEnd: 'Almost there! Final touches that complete your invitation identity 🤎',
    desc: 'Customize the invitation envelope: name color and font. The cover appears in the preview only during this step, and opens via OPEN.',
    colorLabel: 'Envelope name color',
    fontLabel: 'Envelope name font',
    hint: 'In the preview: press OPEN to slide the two doors and reveal the invitation.',
    phName: 'Name',
    finish: '✓ Finish Design',
    finishing: 'Finishing…',
  },
};

const ENV_SWATCHES = ['#B33636', '#14294B', '#C6A15B', '#0B1C37', '#8A1538', '#2F9E5F', '#3C4250', '#7A4E2E'];

/** ⚙️ خطوة «إعدادات إضافية» — غلاف الظرف + زر إنهاء التصميم */
export default function StageExtraSettings() {
  const { lang } = useLanguage();
  const { state, update, fonts, fontsLoading, getFont, getOccasion, ensureId } = useDesign();
  const navigate = useNavigate();
  const c = COPY[lang];

  const envelope = state.envelope || {};
  const couple = state.couple || {};
  const isSolo = couple.type === 'solo' || !!getOccasion()?.solo;
  const envFontObj = getFont(envelope.name_font);

  const name1 = couple.name1 || c.phName;
  const name2 = couple.name2 || c.phName;

  /* ✅ حالة زر الإنهاء (كانت السبب في الخطأ) */
  const [finishing, setFinishing] = useState(false);

  /* ✅ إنهاء التصميم ⇒ POST /complete/ ⇒ صفحة Preview */
  const handleFinish = async () => {
    setFinishing(true);
    try {
      const id = await ensureId();
      await completeDesign(id);
      navigate(`/preview/${id}`);
    } catch {
      setFinishing(false);
    }
  };

  return (
    <section className="ex fp-glass">
      <div className="ex-head">
        <span className="ex-head__icon" aria-hidden="true">⚙️</span>
        <div>
          <p className="ex-head__tag">{c.nearEnd}</p>
          <h2 className="fp-stage__title">{c.title}</h2>
        </div>
      </div>
      <p className="fp-stage__desc">{c.desc}</p>

      {/* 🎨 لون اسم الظرف */}
      <label className="ex-label">{c.colorLabel}</label>
      <div className="ex-colorrow">
        <input
          type="color"
          value={envelope.name_color || '#B33636'}
          onChange={(e) => update('envelope.name_color', e.target.value)}
          aria-label={c.colorLabel}
        />
        <code dir="ltr">{(envelope.name_color || '').toUpperCase()}</code>
        <div className="ex-swatches">
          {ENV_SWATCHES.map((s) => (
            <button
              key={s}
              type="button"
              className={`ex-swatch ${envelope.name_color === s ? 'is-active' : ''}`}
              style={{ background: s }}
              onClick={() => update('envelope.name_color', s)}
              aria-label={s}
            />
          ))}
        </div>
      </div>

      {/* ✍️ خط اسم الظرف */}
      <label className="ex-label">{c.fontLabel}</label>
      <div className="ex-fonts">
        {fontsLoading && <span className="ex-hint">…</span>}
        {!fontsLoading && fonts.map((f) => (
          <button
            key={f.key}
            type="button"
            style={{ fontFamily: f.css }}
            className={`ex-font ${envelope.name_font === f.key ? 'is-selected' : ''}`}
            onClick={() => update('envelope.name_font', f.key)}
          >
            {f.labels?.[lang] || f.key}
          </button>
        ))}
      </div>

      {/* 👁️ بوكس معاينة الأسماء بالخط واللون المختارين */}
      <div className="ex-preview">
        <p
          className="ex-preview__names"
          style={{ color: envelope.name_color || '#B33636', fontFamily: envFontObj?.css }}
        >
          <span>{name1}</span>
          {!isSolo && <span className="ex-preview__amp">&</span>}
          {!isSolo && <span>{name2}</span>}
        </p>
      </div>

      <p className="ex-hint">💡 {c.hint}</p>

      {/* ✅ زر إنهاء التصميم */}
      <button type="button" className="ex-finish" onClick={handleFinish} disabled={finishing}>
        {finishing ? c.finishing : c.finish}
      </button>
    </section>
  );
}