import { useLanguage } from '../../../../context/LanguageContext';
import { useDesign } from '../../context/DesignContext';
import Switch from '../Switch/Switch';
import './StageAccommodation.css';

const COPY = {
  ar: {
    title: 'أين تقيمون',
    desc: 'أضف خيارات الإقامة لضيوفك — اسم الفندق وعنوانه ورابط الخرائط، مع ملاحظات إضافية، وينعكس كل شيء فوراً في الصفحة الثانية من المعاينة.',
    toggleLabel: 'إظهار معلومات الإقامة',
    toggleHint: 'عند الإيقاف يُخفى قسم الإقامة بالكامل من الدعوة.',
    hotel: 'فندق',
    name: 'اسم الفندق',
    namePh: 'مثال: فندق النيل ريتز كارلتون',
    address: 'العنوان',
    addressPh: 'مثال: كورنيش النيل - وسط القاهرة',
    mapUrl: 'رابط خرائط جوجل',
    mapUrlPh: 'https://maps.google.com/...',
    openMap: 'فتح الخريطة',
    addHotel: 'إضافة فندق آخر',
    remove: 'إزالة',
    maxNote: 'الحد الأقصى 4 فنادق.',
    extraLabel: 'معلومات إضافية (اختياري)',
    extraPh: 'مثال: يتوفر موقف سيارات مجاني، وخدمة نقل من المطار عند الطلب...',
    hiddenNote: 'قسم الإقامة مخفي حالياً من الدعوة.',
    missingName: 'أدخل اسم الفندق ليظهر في الدعوة.',
  },
  en: {
    title: 'Where to Stay',
    desc: 'Add accommodation options for your guests — hotel name, address and map link, plus extra notes; everything reflects instantly on preview page two.',
    toggleLabel: 'Show accommodation info',
    toggleHint: 'When off, the accommodation section is hidden from the invitation.',
    hotel: 'Hotel',
    name: 'Hotel name',
    namePh: 'e.g. Nile Ritz-Carlton',
    address: 'Address',
    addressPh: 'e.g. Nile Corniche - Downtown Cairo',
    mapUrl: 'Google Maps link',
    mapUrlPh: 'https://maps.google.com/...',
    openMap: 'Open Map',
    addHotel: 'Add another hotel',
    remove: 'Remove',
    maxNote: 'Up to 4 hotels.',
    extraLabel: 'Extra information (optional)',
    extraPh: 'e.g. Free parking, airport transfer on request...',
    hiddenNote: 'The accommodation section is currently hidden.',
    missingName: 'Enter the hotel name so it appears in the invitation.',
  },
};

const MAX_HOTELS = 4;

const PIN = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

/** 🏨 الخطوة 10 — أين تقيمون */
export default function StageAccommodation() {
  const { lang } = useLanguage();
  const { state, update, push, remove } = useDesign();
  const c = COPY[lang];

  const acc = state.accommodation || { enabled: false, hotels: [], extraInfo: '' };
  const hotels = acc.hotels || [];
  const atMax = hotels.length >= MAX_HOTELS;

  const openMap = (h) => {
    const target = h.mapUrl
      || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.address || h.name || '')}`;
    window.open(target, '_blank', 'noopener');
  };

  return (
    <section className="ac fp-glass">
      <h2 className="fp-stage__title">{c.title}</h2>
      <p className="fp-stage__desc">{c.desc}</p>

      <Switch
        checked={!!acc.enabled}
        onChange={(v) => update('accommodation.enabled', v)}
        label={c.toggleLabel}
        hint={c.toggleHint}
      />

      {!acc.enabled && <p className="ac-hint ac-hint--warn">{c.hiddenNote}</p>}

      {acc.enabled && (
        <>
          {hotels.map((h, i) => (
            <div className="ac-card" key={i}>
              <div className="ac-card__head">
                <span className="ac-card__index" aria-hidden="true">{i + 1}</span>
                <p className="ac-card__title">{c.hotel} {i + 1}</p>
                {hotels.length > 1 && (
                  <button type="button" className="ac-remove" onClick={() => remove('accommodation.hotels', i)}>
                    {c.remove}
                  </button>
                )}
              </div>

              <label className="ac-label">{c.name} <em className="ac-req">*</em></label>
              <input
                type="text"
                maxLength={80}
                className={`ac-input ${!h.name ? 'is-missing' : ''}`}
                value={h.name || ''}
                placeholder={c.namePh}
                onChange={(e) => update(`accommodation.hotels.${i}.name`, e.target.value)}
              />
              {!h.name && <p className="ac-hint ac-hint--warn">{c.missingName}</p>}

              <label className="ac-label">{c.address}</label>
              <input
                type="text"
                maxLength={140}
                className="ac-input"
                value={h.address || ''}
                placeholder={c.addressPh}
                onChange={(e) => update(`accommodation.hotels.${i}.address`, e.target.value)}
              />

              <label className="ac-label">{c.mapUrl}</label>
              <input
                type="url"
                dir="ltr"
                className="ac-input ac-input--ltr"
                value={h.mapUrl || ''}
                placeholder={c.mapUrlPh}
                onChange={(e) => update(`accommodation.hotels.${i}.mapUrl`, e.target.value)}
              />
              <button type="button" className="ac-mapbtn" onClick={() => openMap(h)}>
                {PIN}
                <span>{c.openMap}</span>
              </button>
            </div>
          ))}

          {hotels.length < MAX_HOTELS ? (
            <button
              type="button"
              className="ac-add"
              onClick={() => push('accommodation.hotels', { name: '', address: '', mapUrl: '' })}
            >
              + {c.addHotel}
            </button>
          ) : (
            <p className="ac-hint">{c.maxNote}</p>
          )}

          <label className="ac-label">{c.extraLabel}</label>
          <textarea
            rows={3}
            maxLength={500}
            className="ac-textarea"
            value={acc.extraInfo || ''}
            placeholder={c.extraPh}
            onChange={(e) => update('accommodation.extraInfo', e.target.value)}
          />
          <p className="ac-count" dir="ltr">{(acc.extraInfo || '').length}/500</p>
        </>
      )}
    </section>
  );
}