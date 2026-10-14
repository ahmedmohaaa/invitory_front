import { useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './ScrollRevealBand.css';

/* 🌟 صور خارجية عالية الدقة (Unsplash CDN) — بدّل بينها أو ضع رابطك الخاص */
export const CURATED_BANDS = [
  'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=2200&auto=format&fit=crop', // عشاء على البحر وقت الغروب
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2200&auto=format&fit=crop', // طاولة زفاف بالزهور
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2200&auto=format&fit=crop', // العروسان بين الضيوف
];

/* ✍️ العبارة الجميلة فوق الصورة (ثنائية اللغة) */
const COPY = {
  ar: { line1: 'كل دعوةٍ حكاية…', line2: 'وكل حكايةٍ تُروى هنا.', about: 'اعرف قصتنا' },
  en: { line1: 'Every invitation a story…', line2: 'every story told here.', about: 'Our Story' },
};

/**
 * 🖼️ ScrollRevealBand — قسم جمالي:
 *  - إطار ثابت بعرض الموقع يعرض نصف طول الصورة فقط.
 *  - الصورة تنزلق داخله أثناء التمرير فتُكشف أجزاؤها المخفية.
 *  - فوق الصورة: عبارة أنيقة + زر About زجاجي.
 */
export default function ScrollRevealBand({ src = CURATED_BANDS[0], aboutHref = '#about' }) {
  const { lang } = useLanguage();
  const c = COPY[lang];
  const sectionRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      const section = sectionRef.current;
      const img = imgRef.current;
      if (!section || !img) return;

      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      const passed = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      const p = total > 0 ? passed / total : 0;

      img.style.setProperty('--p', p.toFixed(4));
    };

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="srb" ref={sectionRef} aria-hidden="true">
      <div className="srb__pin">
        <div className="srb__frame">
          <img className="srb__img" ref={imgRef} src={src} alt="" loading="lazy" />

          {/* ✍️ العبارة + زر About فوق الصورة */}
          <div className="srb__overlay">
            <p className="srb__phrase">
              <span>{c.line1}</span>
              <span>{c.line2}</span>
            </p>
            <a className="srb__about" href={aboutHref}>
              {c.about}
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}