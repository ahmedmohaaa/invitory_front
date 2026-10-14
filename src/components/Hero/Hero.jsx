import { useLanguage } from '../../context/LanguageContext';
import galleryImg from '../../assets/pngtree-family-gathering-in-living-room-png-image_15020362.png';
import h1 from '../../assets/h1.jfif';
import h2 from '../../assets/h2.jpg';
import h3 from '../../assets/h3.jpg';
import h4 from '../../assets/h4.webp';
import h5 from '../../assets/h5.webp';
import './Hero.css';

/* 🎬 ضع هنا مسار فيديو المقدمة ليُعرض داخل شاشة الهاتف المائل
   مثال: const HERO_VIDEO = '/videos/hero.mp4';  واتركه null للاكتفاء بالواجهة الثابتة */
const HERO_VIDEO = null;

const COPY = {
  ar: {
    eyebrow: 'دعوات × مناسبات × ذكريات',
    title1: 'دعوتك تبدأ القصة…',
    title2: 'وذكرياتكم تكملها.',
    sub: 'أنشئ دعوة تفاعلية، اجمع تأكيدات الحضور، ودع ضيوفك يشاركون لحظاتهم — كل شيء في مكان واحد.',
    ctaPrimary: 'ابدأ الآن',
    ctaSecondary: 'استكشف القوالب',
    join: 'انضم إلى +250,000 مضيف سعيد',
    stars: '4.9/5',
    cardEyebrow: 'حفل زفاف',
    cardNames: 'سارة & أحمد',
    cardDate: '26 أبريل 2025',
    cardCity: 'الرياض',
    memories: 'ذكريات الضيوف',
    count: [['32', 'يوم'], ['14', 'ساعة'], ['27', 'دقيقة'], ['10', 'ثانية']],
    band: [
      { t: 'دعوات بتصاميم مميزة', d: 'قوالب احترافية قابلة للتخصيص تناسب كل مناسبة.' },
      { t: 'إدارة الدعوات والضيوف', d: 'تابع الردود، وأرسل التذكيرات، وأدر قائمة الضيوف.' },
      { t: 'معرض الصور والفيديو', d: 'ليشارك ضيوفك لحظاتهم الجميلة مباشرة.' },
      { t: 'منصة متكاملة', d: 'الدعوات، تأكيدات الحضور، والذكريات — في مكان واحد.' },
      { t: 'على جميع الأجهزة', d: 'تجربة سلسة على الجوال والتابلت والكمبيوتر.' },
      { t: 'دعم متعدد اللغات', d: 'متوفر بالعربية والإنجليزية لضيوفك حول العالم.' },
    ],
  },
  en: {
    eyebrow: 'INVITATIONS × EVENTS × MEMORIES',
    title1: 'Your invitation',
    title2: 'is just the beginning.',
    sub: 'Create beautiful, interactive invitations, bring your guests together, and turn your special moments into lasting memories — all in one place.',
    ctaPrimary: 'Create Your Invitation',
    ctaSecondary: 'Explore Templates',
    join: 'Join 250,000+ happy hosts',
    stars: '4.9/5',
    cardEyebrow: 'THE WEDDING OF',
    cardNames: 'Amira & Saad',
    cardDate: 'APR 26, 2025',
    cardCity: 'Riyadh',
    memories: 'Our Memories',
    count: [['32', 'Days'], ['14', 'Hours'], ['27', 'Min'], ['10', 'Sec']],
    band: [
      { t: 'Beautiful Invitations', d: 'Stunning, customizable templates for every occasion.' },
      { t: 'Guest Management', d: 'Track RSVPs, send reminders, manage your guest list.' },
      { t: 'Photo & Video Gallery', d: 'Let your guests share moments in real time.' },
      { t: 'All-In-One Platform', d: 'Invitations, RSVPs, memories — in one beautiful place.' },
      { t: 'On Any Device', d: 'Perfect experience on mobile, tablet and desktop.' },
      { t: 'Global Support', d: 'Available in multiple languages for your international guests.' },
    ],
  },
};

/* أيقونات الشريط السفلي الست */
const BAND_ICONS = [
  <svg key="0" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>,
  <svg key="1" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="9" cy="8" r="3.2" /><path d="M2.8 19c0-3 2.8-4.6 6.2-4.6s6.2 1.6 6.2 4.6" /><circle cx="17" cy="9" r="2.6" /><path d="M15.5 14.6c3 .2 5.7 1.7 5.7 4.4" /></svg>,
  <svg key="2" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.4" /></svg>,
  <svg key="3" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M7 18a5 5 0 01-.6-9.97 6 6 0 0111.3 1.6A4.2 4.2 0 0117 18z" /><path d="M12 13v6M9.5 15.5L12 13l2.5 2.5" /></svg>,
  <svg key="4" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="8" y="3" width="8" height="18" rx="2" /><path d="M11 18h2" /></svg>,
  <svg key="5" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" /></svg>,
];

/* غصن زخرفي لزوايا البطاقة الورقية */
const Branch = ({ className }) => (
  <svg className={className} viewBox="0 0 64 64" width="54" height="54" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M8 56C20 44 32 32 56 8" />
    <path d="M20 44c-6-2-10-6-11-12 6 1 10 5 11 12zM30 34c-6-2-10-6-11-12 6 1 10 5 11 12zM40 24c-6-2-10-6-11-12 6 1 10 5 11 12zM20 44c2 6 6 10 12 11-1-6-5-10-12-11zM30 34c2 6 6 10 12 11-1-6-5-10-12-11zM40 24c2 6 6 10 12 11-1-6-5-10-12-11z" />
  </svg>
);

const tile = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' };

/** 🏠 قسم الـ Hero — طبق الأصل من التصميم + فيديو اختياري داخل الهاتف المائل */
export default function Hero() {
  const { lang } = useLanguage();
  const c = COPY[lang];

  return (
    <section className="hero3" id="home" aria-labelledby="hero3-title">
      <div className="container hero3__grid">
        {/* ✍️ النص */}
        <div className="hero3__copy">
          <span className="hero3__eyebrow">{c.eyebrow}</span>
          <h1 className="hero3__title" id="hero3-title">
            {c.title1}<br />{c.title2}
          </h1>
          <p className="hero3__sub">{c.sub}</p>

          <div className="hero3__ctas">
            <a className="hero3__btn hero3__btn--dark" href="#prices">
              {c.ctaPrimary}
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            <a className="hero3__btn hero3__btn--ghost" href="#templates">{c.ctaSecondary}</a>
          </div>

          <div className="hero3__proof">
            <div className="hero3__avatars" aria-hidden="true">
              <span style={{ backgroundImage: `url(${h1})` }} />
              <span style={{ backgroundImage: `url(${h2})` }} />
              <span style={{ backgroundImage: `url(${h3})` }} />
              <span style={{ backgroundImage: `url(${h4})` }} />
              <span style={{ backgroundImage: `url(${h5})` }} />
            </div>
            <div className="hero3__proof-txt">
              <span>{c.join}</span>
              <span className="hero3__stars">★★★★★ <b>{c.stars}</b></span>
            </div>
          </div>
        </div>

        {/*  المسرح: بولارويد + بطاقة ورقية + هاتف مائل (فيديو اختياري) */}
        <div className="hero3__stage" aria-hidden="true">
          <span className="hero3__blob hero3__blob--1" />
          <span className="hero3__blob hero3__blob--2" />

          <span className="hpolar hpolar--1"><img src={h2} alt="" style={tile} /></span>
          <span className="hpolar hpolar--2"><img src={h3} alt="" style={tile} /></span>
          <span className="hpolar hpolar--3"><img src={galleryImg} alt="" style={tile} /></span>

          {/* البطاقة الورقية */}
          <div className="hcard">
            <Branch className="hcard__floral hcard__floral--tl" />
            <Branch className="hcard__floral hcard__floral--br" />
            <p className="hcard__eyebrow">{c.cardEyebrow}</p>
            <p className="hcard__names">{c.cardNames}</p>
            <p className="hcard__date">{c.cardDate}</p>
            <p className="hcard__city">{c.cardCity}</p>
            <span className="hcard__seal">✦</span>
          </div>

          {/* الهاتف المائل */}
          <div className="hphone">
            <span className="hphone__notch" />
            <div className={`hphone__screen ${HERO_VIDEO ? 'is-video' : ''}`}>
              {HERO_VIDEO && (
                <>
                  <video className="hphone__video" src={HERO_VIDEO} autoPlay muted loop playsInline />
                  <span className="hphone__shade" />
                </>
              )}
              <p className="hphone__names">{c.cardNames}</p>
              <p className="hphone__date">{c.cardDate} · {c.cardCity}</p>
              <div className="hphone__count">
                {c.count.map(([n, l], i) => (
                  <span key={i}><b>{n}</b><i>{l}</i></span>
                ))}
              </div>
              <span className="hphone__rsvp">RSVP</span>
              {!HERO_VIDEO && (
                <>
                  <p className="hphone__mem-title">{c.memories}</p>
                  <div className="hphone__mem">
                    <img src={h1} alt="" style={tile} />
                    <img src={h4} alt="" style={tile} />
                    <img src={h5} alt="" style={tile} />
                    <img src={galleryImg} alt="" style={tile} />
                    <img src={h2} alt="" style={tile} />
                    <img src={h3} alt="" style={tile} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/*  شريط الميزات الست */}
      <ul className="hero3__band container">
        {c.band.map((b, i) => (
          <li key={i} className="hero3__band-item">
            {BAND_ICONS[i]}
            <strong>{b.t}</strong>
            <span>{b.d}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}