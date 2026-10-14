import { useLanguage } from '../../../../context/LanguageContext';
import { useDesign } from '../../context/DesignContext';
import { toHijri } from '../../utils/hijri';
import './StageBasicInfo.css';

const COPY = {
  ar: {
    title: 'المعلومات الأساسية',
    desc: 'العنوان والتاريخ والدولة ونص الشكر — أساس هوية دعوتك.',
    titleLabel: 'عنوان الحدث',
    titlePh: 'مثال: حفلة تخرجي',
    typeLabel: 'نوع الدعوة',
    typeCouple: 'زوجية (اسمان)',
    typeSolo: 'فردية (اسم واحد)',
    nameSolo: 'اسم صاحب الدعوة',
    nameSoloPh: 'مثال: أحمد محمد',
    name1: 'الاسم الأول (العريس)',
    name1Ph: 'مثال: أحمد',
    name2: 'الاسم الثاني (العروس)',
    name2Ph: 'مثال: سارة',
    titleFontLabel: 'خط العنوان',
    dateLabel: 'تاريخ الحدث (ميلادي)',
    timeLabel: 'وقت الحدث',
    hijriLabel: 'التاريخ الهجري (تلقائي)',
    hijriHint: 'يُكتب تلقائياً عند إدخال التاريخ الميلادي',
    countryLabel: 'الدولة',
    countryPh: 'اختر الدولة',
    thanksLabel: 'نص الشكر',
    thanksPh: 'مثال: نشكركم من القلب على مشاركتنا فرحتنا...',
    thanksColorLabel: 'لون نص الشكر',
  },
  en: {
    title: 'Basic Information',
    desc: 'Title, date, country and thank-you note — the foundation of your invitation identity.',
    titleLabel: 'Event title',
    titlePh: 'e.g. My Graduation Party',
    typeLabel: 'Invitation type',
    typeCouple: 'Couple (two names)',
    typeSolo: 'Solo (one name)',
    nameSolo: 'Host name',
    nameSoloPh: 'e.g. Ahmed Mohamed',
    name1: 'First name (groom)',
    name1Ph: 'e.g. Ahmed',
    name2: 'Second name (bride)',
    name2Ph: 'e.g. Sara',
    titleFontLabel: 'Title font',
    dateLabel: 'Event date (Gregorian)',
    timeLabel: 'Event time',
    hijriLabel: 'Hijri date (automatic)',
    hijriHint: 'Written automatically from the Gregorian date',
    countryLabel: 'Country',
    countryPh: 'Select country',
    thanksLabel: 'Thank-you note',
    thanksPh: 'e.g. Thank you from the bottom of our hearts...',
    thanksColorLabel: 'Thank-you note color',
  },
};

const THANKS_SWATCHES = ['#C6A15B', '#B33636', '#14294B', '#2F9E5F', '#8A1538', '#3C4250', '#E6CE9C', '#FFFFFF'];

/** 📌 الخطوة 4 — المعلومات الأساسية (+ نوع الدعوة والأسماء) */
export default function StageBasicInfo() {
  const { lang } = useLanguage();
  const { state, update, fonts, fontsLoading, countries, countriesLoading, getFont } = useDesign();
  const c = COPY[lang];

  const info = state.info || {};
  const couple = state.couple || {};
  const titleFontObj = getFont(info.titleFont) || getFont();

  /* 🌙 عند تغيير التاريخ: احفظ الميلادي واشتق الهجري فوراً */
  const onDateChange = (v) => {
    update('info.date', v);
    update('info.hijri', toHijri(v, lang));
  };

  return (
    <section className="bi fp-glass">
      <h2 className="fp-stage__title">{c.title}</h2>
      <p className="fp-stage__desc">{c.desc}</p>

      {/* ✍️ عنوان الحدث */}
      <label className="bi-label">{c.titleLabel}</label>
      <div className="bi-titlerow">
        <input
          type="text"
          maxLength={80}
          className="bi-input"
          value={info.title || ''}
          placeholder={c.titlePh}
          onChange={(e) => update('info.title', e.target.value)}
        />
        <span className="bi-count" dir="ltr">{(info.title || '').length}/80</span>
      </div>

      {/* 💑 نوع الدعوة والأسماء — الإضافة الجديدة */}
      <label className="bt-label">{c.typeLabel}</label>
      <div className="bt-seg">
        <button
          type="button"
          className={`bt-seg__btn ${(couple.type || 'couple') === 'couple' ? 'is-on' : ''}`}
          onClick={() => update('couple.type', 'couple')}
        >
          {c.typeCouple}
        </button>
        <button
          type="button"
          className={`bt-seg__btn ${couple.type === 'solo' ? 'is-on' : ''}`}
          onClick={() => update('couple.type', 'solo')}
        >
          {c.typeSolo}
        </button>
      </div>

      {(couple.type || 'couple') === 'solo' ? (
        <>
          <label className="bt-label">{c.nameSolo}</label>
          <input
            className="bt-input"
            maxLength={60}
            value={couple.name1 || ''}
            placeholder={c.nameSoloPh}
            onChange={(e) => update('couple.name1', e.target.value)}
          />
        </>
      ) : (
        <>
          <label className="bt-label">{c.name1}</label>
          <input
            className="bt-input"
            maxLength={60}
            value={couple.name1 || ''}
            placeholder={c.name1Ph}
            onChange={(e) => update('couple.name1', e.target.value)}
          />
          <label className="bt-label">{c.name2}</label>
          <input
            className="bt-input"
            maxLength={60}
            value={couple.name2 || ''}
            placeholder={c.name2Ph}
            onChange={(e) => update('couple.name2', e.target.value)}
          />
        </>
      )}

      {/* 🔤 خط العنوان + بوكس المعاينة */}
      <label className="bi-label">{c.titleFontLabel}</label>
      <div className="bi-fonts">
        {fontsLoading && <span className="bi-hint">…</span>}
        {!fontsLoading && fonts.map((f) => (
          <button
            key={f.key}
            type="button"
            style={{ fontFamily: f.css }}
            className={`bi-fontchip ${info.titleFont === f.key ? 'is-selected' : ''}`}
            onClick={() => update('info.titleFont', f.key)}
          >
            {f.labels?.[lang] || f.key}
          </button>
        ))}
      </div>
      <div className="bi-preview" style={{ fontFamily: titleFontObj?.css }}>
        {info.title || c.titlePh}
      </div>

      {/* 📅 التاريخ + الوقت */}
      <div className="bi-grid">
        <div>
          <label className="bi-label">{c.dateLabel}</label>
          <input
            type="date"
            className="bi-input"
            value={info.date || ''}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>
        <div>
          <label className="bi-label">{c.timeLabel}</label>
          <input
            type="time"
            className="bi-input"
            value={info.time || ''}
            onChange={(e) => update('info.time', e.target.value)}
          />
        </div>
      </div>

      {/* 🌙 الهجري التلقائي */}
      <div className={`bi-hijri ${info.hijri ? 'is-on' : ''}`}>
        <span aria-hidden="true">🌙</span>
        <div>
          <strong>{c.hijriLabel}</strong>
          <p>{info.hijri || c.hijriHint}</p>
        </div>
      </div>

      {/* 🌍 الدولة */}
      <label className="bi-label">{c.countryLabel}</label>
      <select
        className="bi-input"
        value={info.country || ''}
        onChange={(e) => update('info.country', e.target.value)}
        disabled={countriesLoading}
      >
        <option value="">{countriesLoading ? '…' : c.countryPh}</option>
        {(countries || []).map((co) => (
          <option key={co.key} value={co.key}>
            {co.flag} {co.labels?.[lang] || co.key}
          </option>
        ))}
      </select>

      {/* 💌 نص الشكر */}
      <label className="bi-label">{c.thanksLabel}</label>
      <textarea
        rows={3}
        maxLength={300}
        className="bi-input bi-textarea"
        value={info.thanks || ''}
        placeholder={c.thanksPh}
        onChange={(e) => update('info.thanks', e.target.value)}
      />

      {/* 🎨 لون نص الشكر */}
      <label className="bi-label">{c.thanksColorLabel}</label>
      <div className="bi-colorrow">
        <input
          type="color"
          value={info.thanksColor || '#C6A15B'}
          onChange={(e) => update('info.thanksColor', e.target.value)}
          aria-label={c.thanksColorLabel}
        />
        <code dir="ltr">{(info.thanksColor || '').toUpperCase()}</code>
        <div className="bi-swatches">
          {THANKS_SWATCHES.map((s) => (
            <button
              key={s}
              type="button"
              className={`bi-swatch ${info.thanksColor === s ? 'is-active' : ''}`}
              style={{ background: s }}
              onClick={() => update('info.thanksColor', s)}
              aria-label={s}
            />
          ))}
        </div>
      </div>
    </section>
  );
}