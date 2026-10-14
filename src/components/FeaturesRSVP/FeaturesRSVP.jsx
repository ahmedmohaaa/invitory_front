import { useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import rsvpVideo from '../../assets/v1.mp4';
import './FeaturesRSVP.css';

/* Inline stroke icons (zero deps) */
const ICONS = {
  camera: <path d="M3 8h3l2-3h8l2 3h3v12H3zM12 17a4 4 0 100-8 4 4 0 000 8z" />,
  music: <path d="M9 18V6l10-2v12M9 18a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM19 16a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />,
  rsvp: <path d="M4 5h16v11H8l-4 4zM8 9h8M8 12h5" />,
  contact: <path d="M5 4h4l2 5-3 2a12 12 0 005 5l2-3 5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />,
  location: <path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />,
  date: <path d="M4 6h16v15H4zM4 10h16M8 3v5M16 3v5M9 15l2 2 4-4" />,
};

const CHIP_KEYS = ['camera', 'music', 'rsvp', 'contact', 'location', 'date'];

/**
 * Section 3 — Central phone mockup with RSVP demo video,
 * surrounded by floating feature chips (transform-only float).
 * ✅ الفيديو بدون شريط تحكم + تشغيل تلقائي عند الوصول للسكشن.
 */
export default function FeaturesRSVP() {
  const { t } = useLanguage();
  const videoRef = useRef(null);   // مرجع عنصر الفيديو
  const stageRef = useRef(null);   // مرجع منطقة الهاتف (لمراقبة الظهور)

  /* ✅ تشغيل تلقائي عند دخول السكشن للشاشة + إيقاف عند الخروج */
  useEffect(() => {
    const video = videoRef.current;
    const stage = stageRef.current;
    if (!video || !stage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // تشغيل عند ظهور 40% من السكشن (catch لحماية سياسة autoplay)
            video.play().catch(() => {});
          } else {
            // إيقاف عند مغادرة السكشن للشاشة (توفير موارد)
            video.pause();
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="studio section" id="studio" aria-labelledby="studio-title">
      <div className="container studio__grid">
        {/* Copy */}
        <div className="studio__copy">
          <span className="section-eyebrow">{t('studio.eyebrow')}</span>
          <h2 className="section-title" id="studio-title">{t('studio.title')}</h2>
          <p className="section-sub">{t('studio.subtitle')}</p>
          <ul className="studio__points">
            {t('studio.points').map((p, i) => (
              <li key={i}>
                <span className="studio__dot" aria-hidden="true" />{p}
              </li>
            ))}
          </ul>
        </div>

        {/* Phone + chips */}
        <div className="studio__stage" ref={stageRef}>
          {CHIP_KEYS.map((key, i) => (
            <button className={`chip chip--${i + 1}`} key={key} type="button">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
                   strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
                {ICONS[key]}
              </svg>
              <span>{t(`studio.chips.${key}`)}</span>
            </button>
          ))}

          <figure className="studio__phone" id="tutorial">
            {/* ✅ بدون controls = لا ثلاث نقاط، لا صوت، لا شريط تقدم */}
            <video
              ref={videoRef}
              className="studio__video"
              muted loop playsInline preload="metadata"
              src={rsvpVideo}
              aria-label={t('studio.videoCaption')}
            >
              {t('studio.videoCaption')}
            </video>
            <figcaption className="studio__caption">{t('studio.videoCaption')}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}