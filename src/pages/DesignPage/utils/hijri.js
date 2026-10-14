/** 🌙 ميلادي → هجري (أم القرى) عبر Intl الأصلية — صفر مكتبات خارجية */
export const toHijri = (isoDate, lang = 'ar') => {
  if (!isoDate) return '';
  try {
    const d = new Date(`${isoDate}T12:00:00`);
    return new Intl.DateTimeFormat(
      lang === 'ar' ? 'ar-SA-u-ca-islamic-umalqura' : 'en-u-ca-islamic-umalqura',
      { day: 'numeric', month: 'long', year: 'numeric' },
    ).format(d);
  } catch {
    return '';
  }
};

/** 📅 تنسيق ميلادي أنيق للمعاينة */
export const formatGregorian = (isoDate, lang = 'ar') => {
  if (!isoDate) return '';
  try {
    const d = new Date(`${isoDate}T12:00:00`);
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }).format(d);
  } catch {
    return '';
  }
};

/** 🕰️ تنسيق الوقت مع صباحاً/مساءً */
export const formatTime = (time, lang = 'ar') => {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const suffix = lang === 'ar' ? (h < 12 ? 'صباحاً' : 'مساءً') : (h < 12 ? 'AM' : 'PM');
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
};