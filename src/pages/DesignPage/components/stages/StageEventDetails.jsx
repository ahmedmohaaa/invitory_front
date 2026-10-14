import { useLanguage } from '../../../../context/LanguageContext';
import { useDesign } from '../../context/DesignContext';
import './StageEventDetails.css';

const COPY = {
  ar: {
    title: 'تفاصيل الحدث',
    desc: 'اختر حتى 15 عنصراً من 16 لتوضيح قواعد مناسبتك، وأضف نصاً حراً خاصاً بك — كل شيء يظهر في الصفحة الثالثة من المعاينة.',
    counter: 'مختار',
    of: 'من 15',
    maxNote: 'بلغت الحد الأقصى (15 عنصراً) — أزل عنصراً لإضافة آخر.',
    customLabel: 'نص حر (اختياري)',
    customPh: 'مثال: يتوفر موقف سيارات مجاني عند بوابة القاعة...',
  },
  en: {
    title: 'Event Details',
    desc: 'Pick up to 15 of 16 items to clarify your event rules, plus a fully custom note — everything shows on preview page three.',
    counter: 'selected',
    of: 'of 15',
    maxNote: 'Maximum reached (15 items) — remove one to add another.',
    customLabel: 'Custom note (optional)',
    customPh: 'e.g. Free valet parking at the hall gate...',
  },
};

const MAX_SELECTED = 15;

/** 🎯 الخطوة 9 — تفاصيل الحدث */
export default function StageEventDetails() {
  const { lang } = useLanguage();
  const { state, update, detailsCatalog, detailsLoading } = useDesign();
  const c = COPY[lang];

  const details = state.details || { selected: [], custom: '' };
  const selected = details.selected || [];
  const atMax = selected.length >= MAX_SELECTED;

  const toggleKey = (key) => {
    if (selected.includes(key)) {
      update('details.selected', selected.filter((k) => k !== key));
    } else if (!atMax) {
      update('details.selected', [...selected, key]);
    }
  };

  return (
    <section className="ed fp-glass">
      <h2 className="fp-stage__title">{c.title}</h2>
      <p className="fp-stage__desc">{c.desc}</p>

      {/* عدّاد الاختيارات */}
      <div className="ed-counter">
        <span className={`ed-counter__num ${atMax ? 'is-max' : ''}`}>{selected.length}</span>
        <span>{c.counter} {c.of}</span>
      </div>

      {detailsLoading ? (
        <div className="ed-grid">
          {Array.from({ length: 16 }).map((_, i) => (
            <span key={i} className="ed-skel" style={{ animationDelay: `${i * 40}ms` }} />
          ))}
        </div>
      ) : (
        <div className="ed-grid" role="group" aria-label={c.title}>
          {detailsCatalog.map((d) => {
            const isOn = selected.includes(d.key);
            const disabled = !isOn && atMax;
            return (
              <button
                key={d.key}
                type="button"
                aria-pressed={isOn}
                disabled={disabled}
                className={`ed-chip ${isOn ? 'is-on' : ''} ${disabled ? 'is-disabled' : ''}`}
                onClick={() => toggleKey(d.key)}
              >
                <span className="ed-chip__emoji" aria-hidden="true">{d.emoji}</span>
                <span className="ed-chip__label">{d.labels?.[lang] || d.key}</span>
                {isOn && <span className="ed-chip__check" aria-hidden="true">✓</span>}
              </button>
            );
          })}
        </div>
      )}
      {atMax && <p className="ed-note ed-note--warn">{c.maxNote}</p>}

      {/* النص الحر */}
      <label className="ed-label">{c.customLabel}</label>
      <textarea
        rows={3}
        maxLength={300}
        className="ed-textarea"
        value={details.custom || ''}
        placeholder={c.customPh}
        onChange={(e) => update('details.custom', e.target.value)}
      />
      <p className="ed-count" dir="ltr">{(details.custom || '').length}/300</p>
    </section>
  );
}