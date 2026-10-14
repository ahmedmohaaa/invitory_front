/** 🎬 أدوات الوسائط — يوتيوب + المدد + إزاحة البدء */

export const extractYoutubeId = (url = '') => {
  const m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
};

export const youtubeThumb = (id) => (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null);

/** إزاحة البدء بالثواني من {hours, minutes, seconds} */
export const formatStartOffset = ({ hours = 0, minutes = 0, seconds = 0 } = {}) =>
  (Number(hours) || 0) * 3600 + (Number(minutes) || 0) * 60 + (Number(seconds) || 0);

/** تنسيق مدة بالثواني إلى m:ss */
export const formatDuration = (sec = 0) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;