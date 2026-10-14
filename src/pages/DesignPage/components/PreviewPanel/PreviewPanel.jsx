import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../../../context/LanguageContext';
import { useDesign } from '../../context/DesignContext';
import './PreviewPanel.css';
import { formatGregorian, formatTime } from '../../utils/hijri';
import { extractYoutubeId, formatStartOffset } from '../../utils/media';

const COPY = {
  ar: {
    p3empty: 'لا توجد فعاليات بعد',
    caption: 'معاينة حية', hint: 'تتحدث لحظياً مع كل تعديل', solo: 'فردي', madeBy: 'Made by Invitory',
    p1: 'عنوان الحدث', p2: 'نتشرّف بحضوركم الكريم', p3: 'برنامج المناسبة', p4: 'رسالتنا إليكم', p5: 'أحمد & سارة',
    tabs: { contact: 'تواصل', music: 'موسيقى', location: 'الموقع', rsvp: 'تأكيد الحضور', gift: 'الهدايا' },
    modalContacts: 'جهات الاتصال', modalMusic: 'الموسيقى', modalLocation: 'الموقع', modalRsvp: 'تأكيد الحضور', modalGift: 'الهدية', modalCamera: 'التقاط لحظة',
    noContacts: 'لا توجد جهات اتصال', noMusic: 'لا توجد موسيقى مختارة', noVenues: 'لا يوجد موقع محدد', noGift: 'الهدايا غير مفعلة',
    openLocation: 'فتح الموقع', openYoutube: 'فتح على يوتيوب',
    rsvpName: 'الاسم', rsvpAttend: 'الحضور', rsvpYes: 'سأحضر', rsvpNo: 'لن أتمكن من الحضور', rsvpGuests: 'عدد الضيوف المرافقين', rsvpWishes: 'اكتب تهانيك',
    rsvpSend: 'إرسال', rsvpDone: 'تم استلام تأكيدك بنجاح 🎉',
    camError: 'تعذر الوصول إلى الكاميرا',
    customTrack: 'مقطع خاص', rsvpLive: 'ضيف مؤكد حالياً', envOpen: 'OPEN', envReclose: 'إغلاق الغلاف',
    saveDate: 'احفظ الموعد', cdTitle: 'العد التنازلي',
    cdDays: 'أيام', cdHours: 'ساعات', cdMins: 'دقائق', cdSecs: 'ثواني',
    cdDone: 'حان الموعد 🎉',
    phName: 'الاسم',
  },
  en: {
    p3empty: 'No events yet',
    caption: 'Live Preview', hint: 'Updates instantly with every edit', solo: 'Solo', madeBy: 'Made by Invitory',
    p1: 'Event Title', p2: 'We honor you with our invitation', p3: 'Event Program', p4: 'Our message to you', p5: 'Ahmed & Sara',
    tabs: { contact: 'Contact', music: 'Music', location: 'Location', rsvp: 'RSVP', gift: 'Gifts' },
    modalContacts: 'Contacts', modalMusic: 'Music', modalLocation: 'Location', modalRsvp: 'RSVP', modalGift: 'Gift', modalCamera: 'Capture a moment',
    noContacts: 'No contacts added', noMusic: 'No music selected', noVenues: 'No location set', noGift: 'Gifts are disabled',
    openLocation: 'Open location', openYoutube: 'Open on YouTube',
    rsvpName: 'Name', rsvpAttend: 'Attendance', rsvpYes: 'I will attend', rsvpNo: "I won't be able to attend", rsvpGuests: 'Accompanying guests', rsvpWishes: 'Write your wishes',
    rsvpSend: 'Send', rsvpDone: 'Your RSVP was received 🎉',
    camError: 'Camera access denied',
    customTrack: 'Custom track', rsvpLive: 'confirmed guests', envOpen: 'OPEN', envReclose: 'Close cover',
    saveDate: 'Save the date', cdTitle: 'Countdown',
    cdDays: 'Days', cdHours: 'Hours', cdMins: 'Minutes', cdSecs: 'Seconds',
    cdDone: "It's time 🎉",
    phName: 'Name',
  },
};

/* ═══ مكونات داخلية لمنع تكرار الكود (تُستخدم في الصفحات والمودالات) ═══ */
const ContactCard = ({ contact }) => (
  <div className="pp-t-contact">
    <p className="pp-t-contact__name">{contact.name}</p>
    {contact.role && <p className="pp-t-contact__role">{contact.role}</p>}
    <div className="pp-t-contact__actions">
      <a href={`tel:${contact.phone}`} className="pp-t-contact__phone" aria-label={`Call ${contact.name}`}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
        </svg>
      </a>
      {contact.whatsapp && (
        <a
          href={`https://wa.me/${contact.whatsapp.replace(/[^\d]/g, '')}`}
          target="_blank" rel="noopener noreferrer"
          className="pp-t-contact__whatsapp" aria-label={`WhatsApp ${contact.name}`}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      )}
    </div>
  </div>
);

const VenueCard = ({ v, openable, invLang, labels }) => (
  <div className="pp-t-venue">
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
    <div className="pp-t-venue__txt">
      <strong>{v.name}</strong>
      {v.address && <span>{v.address}</span>}
      {openable && (
        <button
          type="button"
          className="ppm-open"
          onClick={() => window.open(
            v.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.address || v.name || '')}`,
            '_blank', 'noopener',
          )}
        >
          {labels.openLocation}
        </button>
      )}
    </div>
  </div>
);

const GiftBox = ({ gift, wishlist, invLang }) => (
  <div className="pp-t-gift">
    <p className="pp-t-gift__title">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
      </svg>
      {invLang === 'ar' ? 'الهدية' : 'Gift'}
    </p>
    {gift.message && <p className="pp-t-gift__msg">{gift.message}</p>}
    {gift.bank_enabled && (
      <div className="pp-t-gift__bank">
        <p className="pp-t-gift__holder">{gift.bank_holder}</p>
        <p className="pp-t-gift__iban" dir="ltr">{gift.bank_iban}</p>
        {gift.bank_qr && <img src={gift.bank_qr} alt="QR" className="pp-t-gift__qr" />}
      </div>
    )}
    {wishlist.length > 0 && (
      <div className="pp-t-gift__wishlist">
        <p className="pp-t-gift__wish-title">{invLang === 'ar' ? 'قائمة الأمنيات' : 'Wishlist'}</p>
        {wishlist.slice(0, 4).map((item) => (
          <div className="pp-t-gift__wish-item" key={item.id}>
            {item.image && <img src={item.image} alt={item.name} />}
            <span>{item.name}</span>
          </div>
        ))}
        {wishlist.length > 4 && <span className="pp-t-gift__wish-more">+{wishlist.length - 4}</span>}
      </div>
    )}
  </div>
);

const fmtT = (s = 0) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export default function PreviewPanel() {
  const { lang } = useLanguage();
  const { state, update, getOccasion, getFont, detailsCatalog = [], musicLibrary = [] } = useDesign();
  const c = COPY[lang];

  const invLang = state.meta.language || 'ar';
  const dir = invLang === 'ar' ? 'rtl' : 'ltr';
  const occasion = getOccasion();
  const font = getFont();
  const info = state.info || {};
  const titleFontObj = getFont(info.titleFont) || font;
  const family = state.family || {};
  const namesFontObj = getFont(family.namesFont) || font;
  const couple = state.couple || {};                       // ✅ نوع الدعوة والأسماء
  const invSolo = couple.type === 'solo';                  // ✅ فردي أم زوجي
  const venues = (state.venues?.list || []).filter((v) => v.name || v.address);
  const program = state.program || { visible: true, events: [] };
  const programEvents = (program.events || []).filter((e) => e.name);
  const detailsSelected = state.details?.selected || [];
  const detailsCustom = (state.details?.custom || '').trim();
  const selectedDetails = (detailsCatalog || []).filter((d) => detailsSelected.includes(d.key));
  const accommodation = state.accommodation || { enabled: false, hotels: [], extraInfo: '' };
  const accHotels = (accommodation.hotels || []).filter((h) => h.name);
  const accExtra = (accommodation.extraInfo || '').trim();
  const galleryPhotos = state.gallery?.photos || [];
  const personalMsg = state.personalMessage || {};
  const msgHasContent = personalMsg.title || personalMsg.body || personalMsg.signature;
  const contacts = state.contacts?.list || [];
  const gift = state.gift || {};
  const wishlist = state.wishlist?.items || [];
  const camera = state.camera || {};   // ✅ الخطوة 16 — إعدادات الكاميرا
  const rsvp = state.rsvp || {};       // ✅ الخطوة 18

  /* 🎀 غلاف الظرف — خطوة «إعدادات إضافية» */
  const envelope = state.envelope || {};
  const envFontObj = getFont(envelope.name_font) || titleFontObj || font;
  const envSolo = couple.type === 'solo' || !!occasion?.solo;   // ✅ يحترم نوع الدعوة الجديد
  const envCouple = state.couple || {};
  const envName1 = envCouple.name1 || (invLang === 'ar' ? c.phName : c.phName);
  const envName2 = envCouple.name2 || (invLang === 'ar' ? c.phName : c.phName);
  const [envOpen, setEnvOpen] = useState(false);

  const [rsvpLiveLocal, setRsvpLiveLocal] = useState(null);
  const [rsvpSending, setRsvpSending] = useState(false);
  const music = state.music || {};
  const musicTrack = (musicLibrary || []).find((t) => t.id === music.trackId) || null;
  const musicAudioUrl = music.source === 'library' ? (musicTrack?.audio_url || null)
    : music.source === 'custom' ? (music.customUrl || null) : null;
  const ytId = music.source === 'youtube' ? extractYoutubeId(music.youtubeUrl || '') : null;

  /* ✅ تفكيك التاريخ والوقت للشاشة 1 وبطاقة التقويم */
  const dateObj = info.date ? new Date(`${info.date}T12:00:00`) : null;
  const weekday = dateObj ? new Intl.DateTimeFormat(invLang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long' }).format(dateObj) : '';
  const numericDate = dateObj ? `${dateObj.getFullYear()}/${dateObj.getMonth() + 1}/${dateObj.getDate()}` : '';
  const monthName = dateObj ? new Intl.DateTimeFormat(invLang === 'ar' ? 'ar-EG' : 'en-US', { month: 'long' }).format(dateObj) : '';
  const yearNum = dateObj ? dateObj.getFullYear() : '';
  const dayNum = dateObj ? dateObj.getDate() : '';
  let periodWord = '';
  let timeDot = '';
  if (info.time) {
    const [hh, mm] = info.time.split(':');
    const h = Number(hh);
    periodWord = invLang === 'ar' ? (h < 12 ? 'صباح' : 'مساء') : (h < 12 ? 'AM' : 'PM');
    timeDot = `${h % 12 || 12}.${mm}`;
  }

  /* ⏳ العد التنازلي الحي */
  const [nowTs, setNowTs] = useState(Date.now());
  useEffect(() => {
    if (!info.date) return undefined;
    const t = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(t);
  }, [info.date]);

  const targetTs = info.date
    ? (info.time ? new Date(`${info.date}T${info.time}:00`) : new Date(`${info.date}T20:00:00`)).getTime()
    : null;
  let cd = null;
  if (targetTs) {
    let diff = Math.max(0, Math.floor((targetTs - nowTs) / 1000));
    const days = Math.floor(diff / 86400); diff %= 86400;
    const hours = Math.floor(diff / 3600); diff %= 3600;
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    cd = { days, hours, mins, secs };
  }

  /* 📅 تصدير ملف تقويم حقيقي (.ics) */
  const handleSaveDate = () => {
    if (!dateObj) return;
    const dt = info.time ? new Date(`${info.date}T${info.time}:00`) : dateObj;
    const fmtIcs = (d) => `${d.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Invitory//Designer//AR',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@invitory`,
      `DTSTAMP:${fmtIcs(new Date())}`,
      `DTSTART:${fmtIcs(dt)}`,
      `SUMMARY:${info.title || 'Invitation'}`,
      `DESCRIPTION:${info.thanks || ''}`,
      `LOCATION:${`${venues[0]?.name || ''} ${venues[0]?.address || ''}`.trim()}`,
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'invitation-date.ics';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  /* 🎧 مشغّل الموسيقى (مشترك بين المصغّر والمودال) */
  const musicRef = useRef(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [playerTime, setPlayerTime] = useState({ cur: 0, dur: 0 });

  const toggleMusic = () => {
    if (!musicRef.current) {
      if (!musicAudioUrl) return;
      const a = new Audio(musicAudioUrl);
      a.loop = true;
      const offset = formatStartOffset(music.startTime || {});
      if (offset) a.currentTime = offset;
      a.ontimeupdate = () => setPlayerTime({ cur: a.currentTime, dur: a.duration || 0 });
      a.onloadedmetadata = () => setPlayerTime({ cur: a.currentTime, dur: a.duration || 0 });
      a.onended = () => setMusicPlaying(false);
      musicRef.current = a;
      a.play();
      setMusicPlaying(true);
    } else if (musicPlaying) {
      musicRef.current.pause();
      setMusicPlaying(false);
    } else {
      musicRef.current.play();
      setMusicPlaying(true);
    }
  };

  const seek = (val) => {
    if (!musicRef.current) return;
    musicRef.current.currentTime = Number(val);
    setPlayerTime((p) => ({ ...p, cur: Number(val) }));
  };

  /* 📜 تمرير الشاشات الخمس */
  const scrollRef = useRef(null);
  const [currentView, setCurrentView] = useState(1);

  // ✅ الحالة الأفقية v2 — transform track
  const [hPage, setHPage] = useState(1);
  const [autoStopped, setAutoStopped] = useState(false);
  const touchX = useRef(null);

  // ✅ مزامنة النقاط مع الصفحة الأفقية
  useEffect(() => {
    if (isHorizontal) setCurrentView(hPage);
  }, [hPage, isHorizontal]);

  // ✅ التمرير التلقائي الأفقي كل 5 ثوانٍ
  useEffect(() => {
    if (!isHorizontal || autoStopped || tabModal) return undefined;
    const id = setInterval(() => setHPage((p) => (p % 5) + 1), 5000);
    return () => clearInterval(id);
  }, [isHorizontal, autoStopped, tabModal]);

  // ✅ إيقاف التمرير التلقائي عند أي تفاعل
  useEffect(() => {
    if (!isHorizontal) return undefined;
    const stop = () => setAutoStopped(true);
    const opts = { passive: true };
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('wheel', stop, opts);
      el.addEventListener('pointerdown', stop);
    }
    window.addEventListener('keydown', stop);
    return () => {
      if (el) {
        el.removeEventListener('wheel', stop);
        el.removeEventListener('pointerdown', stop);
      }
      window.removeEventListener('keydown', stop);
    };
  }, [isHorizontal]);

  const colors = state.theme?.colors || { title: '#14294B', body: '#3C4250', accent: '#C6A15B' };
  const bgFor = (n) => state.pages?.[n]?.background?.url || null;

  // ✅ اتجاه التمرير (عمودي أو أفقي)
  const scrollDirection = state.meta?.scrollDirection || 'vertical';
  const isHorizontal = scrollDirection === 'horizontal';

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    // ✅ الأفقي: الحركة عبر transform ولا نقرأ scroll
    if (isHorizontal) return;
    if (!el.clientHeight) return;
    setCurrentView(Math.min(5, Math.max(1, Math.round(el.scrollTop / el.clientHeight) + 1)));
  };

  const goToPage = (n) => {
    // ✅ الأفقي: نغيّر الصفحة مباشرة
    if (isHorizontal) {
      setHPage(Math.min(5, Math.max(1, n)));
      return;
    }
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: (n - 1) * el.clientHeight, behavior: 'smooth' });
  };

  /* 🎯 مودالات التاب بار */
  const [tabModal, setTabModal] = useState(null);

  /* 📷 الكاميرا الحية */
  const camVideoRef = useRef(null);
  const camStreamRef = useRef(null);
  const [captured, setCaptured] = useState([]);
  const [camError, setCamError] = useState('');

  const stopCamera = () => {
    camStreamRef.current?.getTracks().forEach((t) => t.stop());
    camStreamRef.current = null;
  };

  const openCamera = async () => {
    setTabModal('camera');
    setCamError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      camStreamRef.current = stream;
      setTimeout(() => { if (camVideoRef.current) camVideoRef.current.srcObject = stream; }, 60);
    } catch {
      setCamError(c.camError);
    }
  };

  const capturePhoto = () => {
    const v = camVideoRef.current;
    if (!v || !v.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext('2d').drawImage(v, 0, 0);
    setCaptured((p) => [...p, canvas.toDataURL('image/jpeg', 0.8)]);
  };

  const closeModal = () => {
    stopCamera();
    setTabModal(null);
  };

  /* 💌 إرسال تأكيد حضور حقيقي للباك اند (الخطوة 18) */
  const handleRSVPSubmit = async (e) => {
    e.preventDefault();
    const token = rsvp.public_token;
    if (!token) { setRsvpSent(true); return; }   // وضع تجريبي قبل أول حفظ
    setRsvpSending(true);
    try {
      const res = await submitPublicRSVP(token, {
        guest_name: rsvpForm.name,
        attending: rsvpForm.attend === 'yes',
        guests_count: Number(rsvpForm.guests) || 0,
        message: rsvpForm.wishes,
      });
      if (res.live_count !== undefined) setRsvpLiveLocal(res.live_count);
      setRsvpSent(true);
    } catch {
      setRsvpSent(true);
    } finally {
      setRsvpSending(false);
    }
  };
  /* 📝 نموذج تأكيد الحضور */
  const [rsvpForm, setRsvpForm] = useState({ name: '', attend: 'yes', guests: 0, wishes: '' });
  const [rsvpSent, setRsvpSent] = useState(false);

  /* 🧹 تنظيف عند الخروج */
  useEffect(() => () => {
    musicRef.current?.pause();
    stopCamera();
  }, []);
  useEffect(() => {
    musicRef.current?.pause();
    musicRef.current = null;
    setMusicPlaying(false);
    setPlayerTime({ cur: 0, dur: 0 });
  }, [musicAudioUrl]);
  useEffect(() => { setEnvOpen(false); }, [state.meta.stage]);

  /* 🎬 Slideshow — تبديل تلقائي كل 3.5 ثانية */
  const [slideIndex, setSlideIndex] = useState(0);
  useEffect(() => {
    if (galleryPhotos.length <= 1) return;
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % galleryPhotos.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [galleryPhotos.length]);
  useEffect(() => {
    if (slideIndex >= galleryPhotos.length) setSlideIndex(0);
  }, [galleryPhotos.length, slideIndex]);

  const screenStyle = {
    '--pv-font': font?.css || (invLang === 'ar' ? "'Tajawal', sans-serif" : "'Playfair Display', serif"),
    '--pv-title': colors.title,
    '--pv-body': colors.body,
    '--pv-accent': colors.accent,
    '--pv-dir': dir,
  };

  return (
    <aside className="pp" aria-label={c.caption}>
      <span className="pp-orb pp-orb--1" aria-hidden="true" />
      <span className="pp-orb pp-orb--2" aria-hidden="true" />

      <div className={`pp-device ${isHorizontal ? 'pp-horizontal' : ''}`}>
        <span className="pp-notch" aria-hidden="true" />
        <div className={`pp-screen pp-screen--${invLang}`} dir={dir} style={screenStyle}>

          {/* 🎵 مشغّل الموسيقى المصغّر */}
          {(musicAudioUrl || ytId) && (
            <div className="pp-music">
              {musicAudioUrl ? (
                <>
                  <button type="button" className="pp-music__btn" onClick={toggleMusic} aria-label="Play/Pause">
                    {musicPlaying ? '❚❚' : '▶'}
                  </button>
                  <div className={`pp-music__eq ${musicPlaying ? 'is-on' : ''}`} aria-hidden="true">
                    <span /><span /><span />
                  </div>
                  <span className="pp-music__title">{musicTrack?.title || c.customTrack}</span>
                </>
              ) : (
                <a className="pp-music__yt" href={music.youtubeUrl} target="_blank" rel="noopener noreferrer">▶ YouTube</a>
              )}
            </div>
          )}

          {/* 📜 الشاشات الخمس — تمرير متصل */}
          {/* 🎨 طبقة الخلفيات الثابتة — Crossfade بين الشاشات الخمس */}
          <div className="pp-bg-layer" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((n) => {
              const url = bgFor(n);
              return url ? (
                <span
                  key={n}
                  className={`pp-bg-image ${currentView === n ? 'is-active' : ''}`}
                  style={{ backgroundImage: `url(${url})` }}
                />
              ) : (
                <span key={n} className="pp-bg-image" />
              );
            })}
          </div>

          {/* 📜 الشاشات الخمس — تمرير متصل */}
          <div
            className={`pp-scroll ${isHorizontal ? 'pp-hwrap' : ''}`}
            ref={scrollRef}
            onScroll={handleScroll}
            onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (!isHorizontal || touchX.current == null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 40) { setAutoStopped(true); setHPage((p) => Math.min(5, Math.max(1, p + (dx < 0 ? 1 : -1)))); }
              touchX.current = null;
            }}
          >
            <div className={isHorizontal ? 'pp-htrack' : 'pp-htrack--off'} style={isHorizontal ? { transform: `translateX(-${(hPage - 1) * 100}%)` } : undefined}>

            {/* الشاشة 1 — عنوان صغير + الأسماء في المنتصف + تاريخ/وقت */}
            <section className="pp-page">
              {bgFor(1) && <span className="pp-bg" style={{ backgroundImage: `url(${bgFor(1)})` }} aria-hidden="true" />}
              <div className="pp-screen__center pp-themed">
                {occasion && <span className="pp-t-emoji pp-t-emoji--sm" aria-hidden="true">{occasion.emoji}</span>}
                <p className="pp-t-title pp-t-title--xs" style={{ fontFamily: titleFontObj?.css }}>
                  {info.title || c.p1}
                </p>
                <p className="pp-t-names" style={{ fontFamily: namesFontObj?.css || titleFontObj?.css }}>
                  <span>{couple.name1 || c.phName}</span>
                  {!invSolo && <span className="pp-t-names__amp">&</span>}
                  {!invSolo && <span>{couple.name2 || c.phName}</span>}
                </p>
                <span className="pp-t-line" aria-hidden="true" />
                {(info.date || info.time) && (
                  <div className="pp-t-when">
                    {info.date && (
                      <div className="pp-t-when__cell">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" />
                        </svg>
                        <span className="pp-t-when__top">{weekday}</span>
                        <span className="pp-t-when__val" dir="ltr">{numericDate}</span>
                      </div>
                    )}
                    {info.time && (
                      <div className="pp-t-when__cell">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
                        </svg>
                        <span className="pp-t-when__top">{periodWord}</span>
                        <span className="pp-t-when__val" dir="ltr">{timeDot}</span>
                      </div>
                    )}
                  </div>
                )}
                {info.hijri && <span className="pp-t-hijri">🌙 {info.hijri}</span>}
              </div>
            </section>

            {/* الشاشة 2 */}
            <section className="pp-page">
              {bgFor(2) && <span className="pp-bg" style={{ backgroundImage: `url(${bgFor(2)})` }} aria-hidden="true" />}
              <div className="pp-screen__center pp-themed">
                <div className="pp-t-glass pp-t-glass--full">
                  {info.thanks && <p className="pp-t-thanks" style={{ color: info.thanksColor || '#C6A15B' }}>{info.thanks}</p>}
                  {!family.hideFamilyNames && (family.familyName1 || family.familyName2) && (
                    <p className="pp-t-families" style={{ fontFamily: namesFontObj?.css }}>
                      {[family.familyName1, family.familyName2].filter(Boolean).join('  &  ')}
                    </p>
                  )}
                  {family.invitationHtml ? (
                    <div className="pp-t-rich" dir={family.invitationDir || 'rtl'} dangerouslySetInnerHTML={{ __html: family.invitationHtml }} />
                  ) : (
                    <p className="pp-t-body">{c.p2}</p>
                  )}
                  <span className="pp-t-accent">✦</span>
                </div>
                {venues.map((v, i) => <VenueCard key={i} v={v} invLang={invLang} labels={c} />)}

                {/* 📅 بطاقة التقويم + احفظ الموعد + العد التنازلي */}
                {info.date && (
                  <>
                    <div className="pp-t-cal">
                      <div className="pp-t-cal__head">
                        <span>{monthName}</span>
                        <span className="pp-t-cal__year" dir="ltr">{yearNum}</span>
                      </div>
                      <div className="pp-t-cal__body">
                        <span className="pp-t-cal__day" dir="ltr">{dayNum}</span>
                        <span className="pp-t-cal__week">{weekday}</span>
                        {info.time && <span className="pp-t-cal__time" dir="ltr">{periodWord} {timeDot}</span>}
                      </div>
                    </div>
                    <button type="button" className="pp-t-savedate" onClick={handleSaveDate}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18M12 14v4M10 16h4" />
                      </svg>
                      {c.saveDate}
                    </button>
                    {cd && (
                      <div className="pp-t-cd">
                        <p className="pp-t-cd__title">{c.cdTitle}</p>
                        {targetTs && targetTs > nowTs ? (
                          <div className="pp-t-cd__row">
                            <div className="pp-t-cd__cell"><span dir="ltr">{cd.days}</span><i>{c.cdDays}</i></div>
                            <div className="pp-t-cd__cell"><span dir="ltr">{cd.hours}</span><i>{c.cdHours}</i></div>
                            <div className="pp-t-cd__cell"><span dir="ltr">{cd.mins}</span><i>{c.cdMins}</i></div>
                            <div className="pp-t-cd__cell"><span dir="ltr">{cd.secs}</span><i>{c.cdSecs}</i></div>
                          </div>
                        ) : (
                          <p className="pp-t-cd__done">{c.cdDone}</p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {accommodation.enabled && (accHotels.length > 0 || accExtra) && (
                  <div className="pp-t-acc">
                    <p className="pp-t-acc__title">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 21V9l9-5 9 5v12" /><path d="M9 21V12h6v9" />
                      </svg>
                      {invLang === 'ar' ? 'الإقامة' : 'Accommodation'}
                    </p>
                    {accHotels.slice(0, 3).map((h, i) => (
                      <div className="pp-t-acc__hotel" key={i}>
                        <strong>{h.name}</strong>
                        {h.address && <span>{h.address}</span>}
                      </div>
                    ))}
                    {accHotels.length > 3 && <span className="pp-t-acc__more">+{accHotels.length - 3}</span>}
                    {accExtra && <p className="pp-t-acc__extra">{accExtra}</p>}
                  </div>
                )}
              </div>
            </section>

            {/* الشاشة 3 */}
            <section className="pp-page">
              {bgFor(3) && <span className="pp-bg" style={{ backgroundImage: `url(${bgFor(3)})` }} aria-hidden="true" />}
              <div className="pp-screen__center pp-themed">
                <div className="pp-t-glass pp-t-program">
                  <p className="pp-t-title pp-t-title--sm">{c.p3}</p>
                  {program.visible && programEvents.length > 0 ? (
                    programEvents.slice(0, 5).map((ev, i) => (
                      <span className="pp-t-row" key={i}>
                        <i aria-hidden="true" />
                        <em className="pp-t-ev">{ev.name}</em>
                        <b className="pp-t-evtime">{formatTime(ev.time, invLang)}</b>
                      </span>
                    ))
                  ) : (
                    <p className="pp-t-body">{c.p3empty}</p>
                  )}
                </div>
                {selectedDetails.length > 0 && (
                  <div className="pp-t-details">
                    {selectedDetails.slice(0, 6).map((d) => (
                      <span className="pp-t-dchip" key={d.key}>
                        <i aria-hidden="true">{d.emoji}</i>
                        {d.labels?.[invLang] || d.key}
                      </span>
                    ))}
                    {selectedDetails.length > 6 && <span className="pp-t-dchip pp-t-dchip--more">+{selectedDetails.length - 6}</span>}
                  </div>
                )}
                {detailsCustom && <p className="pp-t-custom">{detailsCustom}</p>}
              </div>
            </section>

            {/* الشاشة 4 */}
            <section className="pp-page">
              {bgFor(4) && <span className="pp-bg" style={{ backgroundImage: `url(${bgFor(4)})` }} aria-hidden="true" />}
              <div className="pp-screen__center pp-themed">
                {msgHasContent && (
                  <div className="pp-t-pmsg">
                    {personalMsg.title && <p className="pp-t-pmsg__title" style={{ fontFamily: titleFontObj?.css }}>{personalMsg.title}</p>}
                    {personalMsg.body && <p className="pp-t-pmsg__body">{personalMsg.body}</p>}
                    {personalMsg.signature && <p className="pp-t-pmsg__sig">— {personalMsg.signature}</p>}
                  </div>
                )}
                <div className="pp-t-gallery">
                  {galleryPhotos.length > 0 ? (
                    <div className="pp-t-slideshow">
                      {galleryPhotos.map((p, i) => (
                        <div key={p.id} className={`pp-t-slide ${i === slideIndex ? 'is-active' : ''}`} style={{ backgroundImage: `url(${p.url})` }} />
                      ))}
                    </div>
                  ) : (
                    <div className="pp-t-gallery__empty">
                      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
                        <rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M3 17l5-4 4 3 4-4 5 5" />
                      </svg>
                      <p>{invLang === 'ar' ? 'لا توجد صور' : 'No photos'}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* الشاشة 5 */}
            <section className="pp-page">
              {bgFor(5) && <span className="pp-bg" style={{ backgroundImage: `url(${bgFor(5)})` }} aria-hidden="true" />}
              <div className="pp-screen__center pp-themed">
                <p className="pp-t-page5__names">
                  {invSolo ? (couple.name1 || info.title || c.p5) : `${couple.name1 || ''} ${couple.name1 || couple.name2 ? '&' : ''} ${couple.name2 || ''}`.trim() || info.title || c.p5}
                </p>
                <p className="pp-t-page5__date">
                  {formatGregorian(info.date, invLang)}
                  {info.time ? ` · ${formatTime(info.time, invLang)}` : ''}
                </p>
                <span className="pp-t-accent-sm">Made by Invitory</span>
                {gift.enabled && <GiftBox gift={gift} wishlist={wishlist} invLang={invLang} />}
                {contacts.length > 0 && (
                  <div className="pp-t-contacts">
                    {contacts.slice(0, 3).map((contact) => <ContactCard key={contact.id} contact={contact} />)}
                    {contacts.length > 3 && <span className="pp-t-contacts__more">+{contacts.length - 3}</span>}
                  </div>
                )}
              </div>
            </section>

            </div>
          </div>

          {/* 📄 نقاط التنقل — تعكس موضع التمرير */}
          <div className="pp-dots">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" className={currentView === n ? 'is-active' : ''} onClick={() => goToPage(n)} aria-label={`Page ${n}`} />
            ))}
          </div>

          {/* 🧭 التاب البار العائم أسفل الإطار */}
          <nav className="pp-tabbar" aria-label="Invitation tabs">
            <button type="button" className="pp-tab" onClick={() => setTabModal('contacts')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
              </svg>
              <span>{c.tabs.contact}</span>
            </button>
            <button type="button" className="pp-tab" onClick={() => setTabModal('music')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
              </svg>
              <span>{c.tabs.music}</span>
            </button>
            {/* ✅ الخطوة 16 — زر الكاميرا يُخفى حسب الإعداد */}
            {!camera.hide_camera_button && (
              <button type="button" className="pp-tab pp-tab--cam" onClick={openCamera} aria-label="Camera">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" />
                </svg>
              </button>
            )}
            <button type="button" className="pp-tab" onClick={() => setTabModal('location')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" />
              </svg>
              <span>{c.tabs.location}</span>
            </button>
            <button type="button" className="pp-tab" onClick={() => { setRsvpSent(false); setTabModal('rsvp'); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              <span>{c.tabs.rsvp}</span>
            </button>
            <button type="button" className="pp-tab" onClick={() => setTabModal('gift')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
              </svg>
              <span>{c.tabs.gift}</span>
            </button>
          </nav>

          {/* 🪟 مودالات التاب بار (داخل شاشة الهاتف) */}
          {tabModal && (
            <div className="pp-modal" role="dialog" aria-modal="true">
              <button type="button" className="pp-modal__close" onClick={closeModal} aria-label="Close">✕</button>
              <div className="pp-modal__body">

                {tabModal === 'contacts' && (
                  <>
                    <p className="pp-modal__title">{c.modalContacts}</p>
                    {contacts.length ? contacts.map((contact) => <ContactCard key={contact.id} contact={contact} />)
                      : <p className="pp-modal__empty">{c.noContacts}</p>}
                  </>
                )}

                {tabModal === 'music' && (
                  <>
                    <p className="pp-modal__title">{c.modalMusic}</p>
                    {musicAudioUrl ? (
                      <div className="ppm-player">
                        <p className="ppm-name">{musicTrack?.title || c.customTrack}</p>
                        <button type="button" className="ppm-play" onClick={toggleMusic}>{musicPlaying ? '❚❚' : '▶'}</button>
                        <input
                          type="range" className="ppm-seek" min={0} max={Math.floor(playerTime.dur) || 0}
                          value={Math.min(Math.floor(playerTime.cur), Math.floor(playerTime.dur) || 0)}
                          onChange={(e) => seek(e.target.value)} aria-label="Seek"
                        />
                        <span className="ppm-time" dir="ltr">{fmtT(playerTime.cur)} / {fmtT(playerTime.dur)}</span>
                      </div>
                    ) : ytId ? (
                      <div className="ppm-player">
                        <p className="ppm-name">YouTube</p>
                        <a className="ppm-open" href={music.youtubeUrl} target="_blank" rel="noopener noreferrer">{c.openYoutube}</a>
                      </div>
                    ) : (
                      <p className="pp-modal__empty">{c.noMusic}</p>
                    )}
                  </>
                )}

                {tabModal === 'camera' && (
                  <>
                    <p className="pp-modal__title">{c.modalCamera}</p>
                    {camError ? <p className="ppm-error">{camError}</p> : (
                      <div className="ppm-cam">
                        <video ref={camVideoRef} autoPlay playsInline muted />
                        {/* ✅ الخطوة 16 — زر الالتقاط يُخفى حسب الإعداد */}
                        {!camera.hide_save_button && (
                          <button type="button" className="ppm-cam__btn" onClick={capturePhoto} aria-label="Capture" />
                        )}
                      </div>
                    )}
                    {/* ✅ الخطوة 16 — شريط الملتقطات يُخفى حسب الإعداد */}
                    {!camera.hide_gallery && captured.length > 0 && (
                      <div className="ppm-cam__strip">
                        {captured.map((src, i) => <img key={i} src={src} alt="" />)}
                      </div>
                    )}
                  </>
                )}

                {tabModal === 'location' && (
                  <>
                    <p className="pp-modal__title">{c.modalLocation}</p>
                    {venues.length ? venues.map((v, i) => <VenueCard key={i} v={v} openable invLang={invLang} labels={c} />)
                      : <p className="pp-modal__empty">{c.noVenues}</p>}
                  </>
                )}

                {tabModal === 'rsvp' && (
                  <>
                    <p className="pp-modal__title">{c.modalRsvp}</p>

                    {/* 🎉 العدّاد المباشر — يظهر فقط عند تفعيله */}
                    {rsvp.show_live_counter && (
                      <p className="ppm-live">
                        🎉 {rsvpLiveLocal ?? rsvp.live_count ?? 0} {c.rsvpLive}
                      </p>
                    )}

                    {rsvpSent ? (
                      <p className="ppm-success">{c.rsvpDone}</p>
                    ) : (
                      <form className="ppm-form" onSubmit={handleRSVPSubmit}>
                        <label className="ppm-field">
                          <span>{c.rsvpName}</span>
                          <input className="ppm-input" required value={rsvpForm.name} onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })} />
                        </label>

                        {rsvp.show_attendance !== false && (
                          <label className="ppm-field">
                            <span>{c.rsvpAttend}</span>
                            <select className="ppm-input" value={rsvpForm.attend} onChange={(e) => setRsvpForm({ ...rsvpForm, attend: e.target.value })}>
                              <option value="yes">{c.rsvpYes}</option>
                              <option value="no">{c.rsvpNo}</option>
                            </select>
                          </label>
                        )}

                        {rsvp.show_guests_count !== false && (
                          <label className="ppm-field">
                            <span>{c.rsvpGuests}</span>
                            <input className="ppm-input" type="number" min={0} max={50} value={rsvpForm.guests} onChange={(e) => setRsvpForm({ ...rsvpForm, guests: Number(e.target.value) })} />
                          </label>
                        )}

                        {rsvp.show_message !== false && (
                          <label className="ppm-field">
                            <span>{c.rsvpWishes}</span>
                            <textarea className="ppm-input" rows={2} value={rsvpForm.wishes} onChange={(e) => setRsvpForm({ ...rsvpForm, wishes: e.target.value })} />
                          </label>
                        )}

                        <button type="submit" className="ppm-submit" disabled={rsvpSending}>
                          {rsvpSending ? '…' : c.rsvpSend}
                        </button>
                      </form>
                    )}
                  </>
                )}

                {tabModal === 'gift' && (
                  <>
                    <p className="pp-modal__title">{c.modalGift}</p>
                    {gift.enabled ? <GiftBox gift={gift} wishlist={wishlist} invLang={invLang} />
                      : <p className="pp-modal__empty">{c.noGift}</p>}
                  </>
                )}

              </div>
            </div>
          )}

          {/* 🎀 غلاف الظرف — يظهر في خطوة «إعدادات إضافية» فقط */}
          {state.meta.stage === 18 && (
            <div className={`pp-env ${envOpen ? 'is-open' : ''}`}>
              <span className="pp-env__door pp-env__door--right" aria-hidden="true" />
              <span className="pp-env__door pp-env__door--left" aria-hidden="true" />
              <div className="pp-env__seal">
                <p
                  className="pp-env__names"
                  style={{ color: envelope.name_color || '#B33636', fontFamily: envFontObj?.css }}
                >
                  <span>{envName1}</span>
                  {!envSolo && <span className="pp-env__amp">&</span>}
                  {!envSolo && <span>{envName2}</span>}
                </p>
                <button type="button" className="pp-env__open" onClick={() => setEnvOpen(true)}>
                  {c.envOpen}
                </button>
              </div>
              <button
                type="button"
                className="pp-env__reclose"
                onClick={() => setEnvOpen(false)}
                aria-label={c.envReclose}
                title={c.envReclose}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="pp-caption">
        <strong>{c.caption}</strong>
        <span>{c.hint}</span>
        <em>{occasion ? `${occasion.emoji} ${occasion.labels?.[invLang] || ''}` : (invLang === 'ar' ? 'العربية' : 'English')}</em>
      </p>
    </aside>
  );
}