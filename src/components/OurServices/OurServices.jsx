import { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './OurServices.css';

/* ═══════════════════════════════════════════════════════════
   📚 نصوص ثنائية اللغة
   ═══════════════════════════════════════════════════════════ */
const COPY = {
  ar: {
    eyebrow: '✦ خدماتنا ✦',
    title: 'كل ما تحتاجه لمناسبة لا تُنسى',
    sub: 'من التصميم الأول حتى آخر ضيف يغادر — نوفر لك أدوات فاخرة متكاملة في مكان واحد.',
    filters: {
      all: 'الكل',
      wedding: 'الأعراس',
      corporate: 'الشركات',
      birthday: 'أعياد الميلاد',
      general: 'مناسبات عامة',
    },
    services: [
      {
        id: 'interactive',
        title: 'دعوات تفاعلية',
        desc: 'كروت إلكترونية حية تتحرك مع ضيوفك — ردود فورية، عدادات تنازلية، وتأثيرات بصرية تخطف الأنفاس.',
        icon: 'interactive',
        color: 'blue',
        tags: ['wedding', 'corporate', 'birthday', 'general'],
      },
      {
        id: 'templates',
        title: 'تصاميم فاخرة',
        desc: 'مكتبة ضخمة من القوالب الاحترافية لكل مناسبة — قابلة للتخصيص الكامل بالألوان والخطوط والصور.',
        icon: 'palette',
        color: 'purple',
        tags: ['wedding', 'corporate', 'birthday', 'general'],
      },
      {
        id: 'maps',
        title: 'خرائط ذكية',
        desc: 'ربط مباشر بـ Google Maps مع برنامج الحفل الزمني والمواصفات — يصل ضيوفك بسهولة تامة.',
        icon: 'map',
        color: 'green',
        tags: ['wedding', 'corporate', 'general'],
      },
      {
        id: 'guestbook',
        title: 'ذكريات الضيوف',
        desc: 'جدار تهانٍ رقمي + معرض صور تشاركي — يجمع لحظات الحفل من كل الزوايا في ألبوم واحد خالد.',
        icon: 'camera',
        color: 'pink',
        tags: ['wedding', 'birthday', 'general'],
      },
      {
        id: 'qr',
        title: 'QR للدخول',
        desc: 'بوابة دخول ذكية عند باب القاعة — امسح، قارن، وسجّل الوصول لحظياً بدون فوضى أو ازدحام.',
        icon: 'qr',
        color: 'yellow',
        tags: ['wedding', 'corporate', 'general'],
      },
      {
        id: 'rsvp',
        title: 'تأكيد الحضور',
        desc: 'نظام RSVP متقدم: تتبّع الردود، أحصِ المرافقين، وصدّر القوائم بصيغة Excel بضغطة واحدة.',
        icon: 'users',
        color: 'cyan',
        tags: ['wedding', 'corporate', 'birthday', 'general'],
      },
      {
        id: 'music',
        title: 'موسيقى خلفية',
        desc: 'اختر من مكتبتنا الحصرية أو ارفع مقطوعتك الخاصة — اجعل دعوتك تُسمع قبل أن تُقرأ.',
        icon: 'music',
        color: 'orange',
        tags: ['wedding', 'birthday', 'general'],
      },
      {
        id: 'dashboard',
        title: 'لوحة تحكم حية',
        desc: 'إحصائيات لحظية، تنبيهات فورية، وتحكم كامل من أي جهاز — أنت المسيطر على كل تفصيل.',
        icon: 'dashboard',
        color: 'red',
        tags: ['wedding', 'corporate', 'birthday', 'general'],
      },
    ],
  },
  en: {
    eyebrow: '✦ Our Services ✦',
    title: 'Everything you need for an unforgettable occasion',
    sub: 'From the first design to the last guest leaving — we provide integrated luxury tools in one place.',
    filters: {
      all: 'All',
      wedding: 'Weddings',
      corporate: 'Corporate',
      birthday: 'Birthdays',
      general: 'General',
    },
    services: [
      {
        id: 'interactive',
        title: 'Interactive Invitations',
        desc: 'Live digital cards that move with your guests — instant RSVPs, countdowns, and breathtaking visual effects.',
        icon: 'interactive',
        color: 'blue',
        tags: ['wedding', 'corporate', 'birthday', 'general'],
      },
      {
        id: 'templates',
        title: 'Premium Designs',
        desc: 'A vast library of professional templates for every occasion — fully customizable with colors, fonts, and images.',
        icon: 'palette',
        color: 'purple',
        tags: ['wedding', 'corporate', 'birthday', 'general'],
      },
      {
        id: 'maps',
        title: 'Smart Maps',
        desc: 'Direct Google Maps integration with event timeline and venue details — your guests arrive with ease.',
        icon: 'map',
        color: 'green',
        tags: ['wedding', 'corporate', 'general'],
      },
      {
        id: 'guestbook',
        title: 'Guest Memories',
        desc: 'Digital wishes wall + shared photo gallery — capturing every moment from every angle in one timeless album.',
        icon: 'camera',
        color: 'pink',
        tags: ['wedding', 'birthday', 'general'],
      },
      {
        id: 'qr',
        title: 'QR Check-in',
        desc: 'Smart gate at the venue door — scan, compare, and log arrivals instantly without chaos or crowds.',
        icon: 'qr',
        color: 'yellow',
        tags: ['wedding', 'corporate', 'general'],
      },
      {
        id: 'rsvp',
        title: 'RSVP Tracking',
        desc: 'Advanced RSVP system: track responses, count companions, and export lists to Excel with one click.',
        icon: 'users',
        color: 'cyan',
        tags: ['wedding', 'corporate', 'birthday', 'general'],
      },
      {
        id: 'music',
        title: 'Background Music',
        desc: 'Choose from our exclusive library or upload your own track — make your invitation heard before it\'s read.',
        icon: 'music',
        color: 'orange',
        tags: ['wedding', 'birthday', 'general'],
      },
      {
        id: 'dashboard',
        title: 'Live Dashboard',
        desc: 'Real-time stats, instant alerts, and full control from any device — you\'re in charge of every detail.',
        icon: 'dashboard',
        color: 'red',
        tags: ['wedding', 'corporate', 'birthday', 'general'],
      },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════
   🎨 أيقونات SVG مخصصة — خطوط ناعمة وأنيقة
   ═══════════════════════════════════════════════════════════ */
const ICONS = {
  interactive: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
      <path d="M9 15l2 2 4-4" />
    </svg>
  ),
  palette: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  ),
  map: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  camera: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  qr: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3z" />
      <path d="M18 14h3" />
      <path d="M14 18h3" />
      <path d="M18 18h3v3h-3z" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  music: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  ),
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════════════════════
   🎯 المكوّن الرئيسي
   ═══════════════════════════════════════════════════════════ */
export default function OurServices() {
  const { lang } = useLanguage();
  const c = COPY[lang];
  const [activeFilter, setActiveFilter] = useState('all');

  /* فلترة الخدمات بناءً على الفئة المختارة */
  const filteredServices = useMemo(() => {
    if (activeFilter === 'all') return c.services;
    return c.services.filter((s) => s.tags.includes(activeFilter));
  }, [activeFilter, c.services]);

  const filterKeys = ['all', 'wedding', 'corporate', 'birthday', 'general'];

  return (
    <section className="os section" id="services" aria-labelledby="os-title">
      <div className="container">
        {/* الترويسة */}
        <header className="section-head os__head">
          <span className="section-eyebrow">{c.eyebrow}</span>
          <h2 className="section-title" id="os-title">{c.title}</h2>
          <p className="section-sub">{c.sub}</p>
        </header>

        {/* الفلاتر */}
        <div className="os__filters" role="tablist">
          {filterKeys.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeFilter === key}
              className={`os__filter ${activeFilter === key ? 'is-active' : ''}`}
              onClick={() => setActiveFilter(key)}
            >
              {c.filters[key]}
            </button>
          ))}
        </div>

        {/* شبكة الخدمات */}
        <div className="os__grid">
          {filteredServices.map((service, idx) => (
            <article
              key={service.id}
              className={`os-card os-card--${service.color}`}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              {/* توهج علوي */}
              <div className="os-card__glow" aria-hidden="true" />

              {/* الأيقونة */}
              <div className={`os-card__icon os-card__icon--${service.color}`}>
                {ICONS[service.icon]}
              </div>

              {/* المحتوى */}
              <h3 className="os-card__title">{service.title}</h3>
              <p className="os-card__desc">{service.desc}</p>

              {/* خط سفلي متوهج */}
              <div className="os-card__line" aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}