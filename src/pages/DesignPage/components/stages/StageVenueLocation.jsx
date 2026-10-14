import { useLanguage } from '../../../../context/LanguageContext';
import { useDesign } from '../../context/DesignContext';
import './StageVenueLocation.css';

const COPY = {
  ar: {
    title: 'المكان والموقع',
    desc: 'أضف قاعة واحدة أو قاعتين — الاسم والعنوان ورابط الخريطة، وينعكس كل شيء فوراً في بوكس الموقع بالصفحة الثانية.',
    venue: 'القاعة',
    name: 'اسم القاعة',
    namePh: 'مثال: قاعة النيل الكبرى',
    address: 'عنوان القاعة',
    addressPh: 'مثال: القاهرة - شارع النيل - أمام فندق سميراميس',
    mapUrl: 'رابط الخريطة',
    mapUrlPh: 'https://maps.google.com/...',
    openMap: 'فتح الخريطة',
    addSecond: 'إضافة قاعة ثانية',
    remove: 'إزالة القاعة',
    maxNote: 'يمكن إضافة قاعتين كحد أقصى.',
    missingName: 'أدخل اسم القاعة ليظهر داخل الدعوة.',
  },
  en: {
    title: 'Venue & Location',
    desc: 'Add one or two venues — name, address and map link; everything reflects instantly in the location box on page two.',
    venue: 'Venue',
    name: 'Venue name',
    namePh: 'e.g. Grand Nile Hall',
    address: 'Venue address',
    addressPh: 'e.g. Cairo - Nile St. - in front of...',
    mapUrl: 'Map link',
    mapUrlPh: 'https://maps.google.com/...',
    openMap: 'Open Map',
    addSecond: 'Add second venue',
    remove: 'Remove venue',
    maxNote: 'Up to two venues can be added.',
    missingName: 'Enter the venue name so it appears in the invitation.',
  },
};

const PIN = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

/** 📍 الخطوة 7 — المكان والموقع (قاعة أو قاعتان) */
export default function StageVenueLocation() {
  const { lang } = useLanguage();
  const { state, update, push, remove } = useDesign();
  const c = COPY[lang];
  const list = state.venues?.list || [];

  /* فتح خرائط جوجل: الرابط إن وجد، وإلا بحث بالعنوان/الاسم */
  const openMap = (v) => {
    const target = v.mapUrl
      || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.address || v.name || '')}`;
    window.open(target, '_blank', 'noopener');
  };

  return (
    <section className="vn fp-glass">
      <h2 className="fp-stage__title">{c.title}</h2>
      <p className="fp-stage__desc">{c.desc}</p>

      {list.map((v, i) => (
        <div className="vn-card" key={i}>
          <div className="vn-card__head">
            <span className="vn-card__index" aria-hidden="true">{i + 1}</span>
            <p className="vn-card__title">{c.venue} {i + 1}</p>
            {list.length > 1 && (
              <button type="button" className="vn-remove" onClick={() => remove('venues.list', i)}>
                {c.remove}
              </button>
            )}
          </div>

          <label className="vn-label">{c.name} <em className="vn-req">*</em></label>
          <input
            type="text"
            maxLength={80}
            className={`vn-input ${!v.name ? 'is-missing' : ''}`}
            value={v.name || ''}
            placeholder={c.namePh}
            onChange={(e) => update(`venues.list.${i}.name`, e.target.value)}
          />
          {!v.name && <p className="vn-hint vn-hint--warn">{c.missingName}</p>}

          <label className="vn-label">{c.address}</label>
          <input
            type="text"
            maxLength={140}
            className="vn-input"
            value={v.address || ''}
            placeholder={c.addressPh}
            onChange={(e) => update(`venues.list.${i}.address`, e.target.value)}
          />

          <label className="vn-label">{c.mapUrl}</label>
          <input
            type="url"
            dir="ltr"
            className="vn-input vn-input--ltr"
            value={v.mapUrl || ''}
            placeholder={c.mapUrlPh}
            onChange={(e) => update(`venues.list.${i}.mapUrl`, e.target.value)}
          />
          <button type="button" className="vn-mapbtn" onClick={() => openMap(v)}>
            {PIN}
            <span>{c.openMap}</span>
          </button>
        </div>
      ))}

      {list.length < 2 ? (
        <button
          type="button"
          className="vn-add"
          onClick={() => push('venues.list', { name: '', address: '', mapUrl: '' })}
        >
          + {c.addSecond}
        </button>
      ) : (
        <p className="vn-hint">{c.maxNote}</p>
      )}
    </section>
  );
}