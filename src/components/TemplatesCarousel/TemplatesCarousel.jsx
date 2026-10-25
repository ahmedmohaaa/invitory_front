import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { publicApi } from '../../services/api';
import { fetchTemplateCards } from '../../services/templates';
import Skeleton from '../Skeleton/Skeleton';
import './TemplatesCarousel.css';

/* ✅ نفس فلاتر وتطبيع TemplatesPage */
const isPublicTemplate = (t) =>
  !!t &&
  t.is_active !== false &&
  t.is_published !== false &&
  t.is_public !== false &&
  t.status !== 'draft' &&
  t.status !== 'archived';

const norm = (t) => ({
  id: t.id,
  code: t.code || `T${t.id}`,
  name: t.name || t.title || '',
  category: t.category_label || t.category || '',
  image: t.thumbnail || t.image || t.preview_image || t.preview_url || t.thumbnail_url || '',
});

/* ═══════════════════════════════════════════════════════════
   🎠 Coverflow Interactive Carousel
   ═══════════════════════════════════════════════════════════ */
export default function TemplatesCarousel() {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState([]);
  const [status, setStatus] = useState('loading');
  const [tick, setTick] = useState(0);
  const [cardPv, setCardPv] = useState({});

  /* ═══ حالة الـ Coverflow ═══ */
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragDelta = useRef(0);
  const trackRef = useRef(null);

  /* ═══ تحميل القوالب ═══ */
  const load = useCallback(() => {
    setStatus('loading');
    publicApi
      .getTemplates()
      .then((data) => {
        setTemplates((data || []).filter(isPublicTemplate).map(norm));
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(() => {
    load();
  }, [load, tick]);

  useEffect(() => {
    fetchTemplateCards()
      .then((list) => {
        const map = {};
        (list || []).forEach((p) => {
          if (p && p.template_id != null) map[p.template_id] = p;
        });
        setCardPv(map);
      })
      .catch(() => setCardPv({}));
  }, []);

  /* ═══ Auto-play كل 3 ثوانٍ ═══ */
  useEffect(() => {
    if (status !== 'ready' || templates.length === 0 || isPaused) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % templates.length);
    }, 3000);
    return () => clearInterval(id);
  }, [status, templates.length, isPaused]);

  /* ═══ التنقل ═══ */
  const goTo = (idx) => {
    const len = templates.length;
    setActiveIndex(((idx % len) + len) % len);
  };

  const goNext = () => goTo(activeIndex + 1);
  const goPrev = () => goTo(activeIndex - 1);

  /* ═══ Drag / Swipe handlers ═══ */
  const handleDragStart = (clientX) => {
    setIsDragging(true);
    setIsPaused(true);
    dragStartX.current = clientX;
    dragDelta.current = 0;
  };

  const handleDragMove = (clientX) => {
    if (!isDragging) return;
    dragDelta.current = clientX - dragStartX.current;
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    const threshold = 60;
    if (dragDelta.current > threshold) goPrev();
    else if (dragDelta.current < -threshold) goNext();
    setIsDragging(false);
    dragDelta.current = 0;
    /* استئناف auto-play بعد ثانية من آخر تفاعل */
    setTimeout(() => setIsPaused(false), 1500);
  };

  /* Mouse events */
  const onMouseDown = (e) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };
  const onMouseMove = (e) => handleDragMove(e.clientX);
  const onMouseUp = () => handleDragEnd();
  const onMouseLeave = () => {
    if (isDragging) handleDragEnd();
  };

  /* Touch events */
  const onTouchStart = (e) => handleDragStart(e.touches[0].clientX);
  const onTouchMove = (e) => handleDragMove(e.touches[0].clientX);
  const onTouchEnd = () => handleDragEnd();

  /* ═══ Keyboard navigation ═══ */
  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      document.documentElement.dir === 'rtl' ? goPrev() : goNext();
    } else if (e.key === 'ArrowLeft') {
      document.documentElement.dir === 'rtl' ? goNext() : goPrev();
    }
  };

  /* ═══ حساب خصائص الـ slide بناءً على بعده عن المركز ═══ */
  const getSlideStyle = (i) => {
    const len = templates.length;
    /* حساب أقصر مسافة دائرية */
    let offset = i - activeIndex;
    if (offset > len / 2) offset -= len;
    if (offset < -len / 2) offset += len;

    /* ✅ دعم RTL: عكس اتجاه الإزاحة */
    const isRTL = document.documentElement.dir === 'rtl';
    const signedOffset = isRTL ? -offset : offset;

    const absOffset = Math.abs(offset);
    const scale = Math.max(0.7, 1 - absOffset * 0.15);
    const opacity = Math.max(0.4, 1 - absOffset * 0.25);
    const translateX = signedOffset * 260; /* px */
    const zIndex = 10 - absOffset;
    const rotateY = -signedOffset * 15; /* درجة دوران 3D خفيفة */

    return {
      transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
      opacity,
      zIndex,
      filter: absOffset > 0 ? `blur(${absOffset * 1.2}px)` : 'none',
    };
  };

  return (
    <section className="carousel-section section" id="templates" aria-labelledby="templates-title">
      <div className="container">
        <header className="section-head">
          <span className="section-eyebrow">{t('templates.eyebrow')}</span>
          <h2 className="section-title" id="templates-title">{t('templates.title')}</h2>
          <p className="section-sub">{t('templates.subtitle')}</p>
        </header>
      </div>

      {status === 'loading' && (
        <div className="container">
          <Skeleton count={4} variant="phone" label={t('templates.title')} />
        </div>
      )}

      {status === 'error' && (
        <div className="carousel__state container" role="alert">
          <p>{t('templates.error')}</p>
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setTick((v) => v + 1)}
          >
            {t('templates.retry')}
          </button>
        </div>
      )}

      {status === 'ready' && templates.length === 0 && (
        <p className="carousel__state container">{t('templates.empty')}</p>
      )}

      {status === 'ready' && templates.length > 0 && (
        <>
          <div
            className="carousel carousel--coverflow"
            role="region"
            aria-label={t('templates.regionLabel')}
            aria-roledescription="carousel"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => {
              if (!isDragging) setIsPaused(false);
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={(e) => {
              onMouseLeave();
              if (!isDragging) setIsPaused(false);
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onKeyDown={onKeyDown}
            tabIndex={0}
          >
            <div className="carousel__track" ref={trackRef}>
              {templates.map((tpl, i) => {
                const cp = cardPv[tpl.id];
                const isActive = i === activeIndex;
                return (
                  <figure
                    className={`carousel__slide ${isActive ? 'is-active' : ''}`}
                    key={tpl.id}
                    style={getSlideStyle(i)}
                    onClick={() => {
                      if (!isDragging && !isActive) goTo(i);
                    }}
                    aria-hidden={!isActive}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${i + 1} / ${templates.length}: ${tpl.name}`}
                  >
                    <div className="phone" data-category={tpl.category}>
                      <span className="phone__notch" aria-hidden="true" />
                      <div className="phone__screen">
                        {cp && cp.first_bg ? (
                          <div
                            className="tpl-thumb"
                            style={{ backgroundImage: `url(${cp.first_bg})` }}
                          >
                            <div className="tpl-thumb__names">
                              <span>{cp.name1}</span>
                              {cp.name2 && <span className="tpl-thumb__amp">&</span>}
                              {cp.name2 && <span>{cp.name2}</span>}
                              {cp.title && !cp.name1 && !cp.name2 && (
                                <span className="tpl-thumb__title">{cp.title}</span>
                              )}
                            </div>
                          </div>
                        ) : tpl.image ? (
                          <img
                            src={tpl.image}
                            alt={tpl.name || tpl.code}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="phone__placeholder">
                            <span>{tpl.code}</span>
                          </div>
                        )}
                      </div>
                      <figcaption className="phone__meta">
                        <span className="phone__category">{tpl.category}</span>
                        <strong>{tpl.name}</strong>
                      </figcaption>
                      <div className="phone__actions">
                        <button className="btn btn--gold btn--sm">
                          {t('templates.select')}
                        </button>
                        <button className="btn btn--ghost btn--sm">
                          {t('templates.preview')}
                        </button>
                      </div>
                    </div>
                  </figure>
                );
              })}
            </div>

            {/* أزرار التنقل الجانبية */}
            <button
              className="carousel__nav carousel__nav--prev"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
                setIsPaused(true);
                setTimeout(() => setIsPaused(false), 2500);
              }}
              aria-label="Previous"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              className="carousel__nav carousel__nav--next"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
                setIsPaused(true);
                setTimeout(() => setIsPaused(false), 2500);
              }}
              aria-label="Next"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            {/* نقاط التقدم (pagination dots) */}
            <div className="carousel__dots" role="tablist">
              {templates.map((_, i) => (
                <button
                  key={i}
                  className={`carousel__dot ${i === activeIndex ? 'is-active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(i);
                    setIsPaused(true);
                    setTimeout(() => setIsPaused(false), 2500);
                  }}
                  role="tab"
                  aria-selected={i === activeIndex}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Edge fades */}
            <span className="carousel__fade carousel__fade--start" aria-hidden="true" />
            <span className="carousel__fade carousel__fade--end" aria-hidden="true" />
          </div>

          <div className="carousel__footer container">
            <a className="btn btn--gold-outline" href="#templates">
              {t('templates.viewAll')}
            </a>
          </div>
        </>
      )}
    </section>
  );
}