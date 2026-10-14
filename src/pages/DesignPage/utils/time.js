/** 🕰️ تحويلات ساعة 12/24 لواجهة برنامج الحفل */

/** من واجهة 12 ساعة (ساعة/دقيقة/صباحاً-مساءً) إلى صيغة HH:MM المخزنة */
export const to24 = (hour12, minute, period) => {
  let h = parseInt(hour12, 10) % 12;
  if (period === 'PM') h += 12;
  return `${String(h).padStart(2, '0')}:${String(parseInt(minute, 10)).padStart(2, '0')}`;
};

/** من الصيغة المخزنة HH:MM إلى مكونات واجهة 12 ساعة */
export const from24 = (time = '') => {
  const parts = String(time || '20:00').split(':').map(Number);
  const h = Number.isFinite(parts[0]) ? parts[0] : 20;
  const m = Number.isFinite(parts[1]) ? parts[1] : 0;
  return {
    hour12: h % 12 || 12,
    minute: m,
    period: h < 12 ? 'AM' : 'PM',
  };
};