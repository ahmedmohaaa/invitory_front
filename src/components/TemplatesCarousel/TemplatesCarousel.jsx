import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { publicApi } from '../../services/api';
import { fetchTemplateCards } from '../../services/templates'; // ✅ نفس مصدر البيانات
import Skeleton from '../Skeleton/Skeleton';
import './TemplatesCarousel.css';

/**
 * Section 2 — Infinite auto-scrolling 3D phone-frame carousel.
 * Uses the EXACT same data source as TemplatesPage (fetchTemplateCards)
 * so thumbnails show the same first-page image + names overlay.
 */

/** ✅ Keep only public templates (same filter as TemplatesPage) */
const isPublicTemplate = (t) =>
  !!t &&
  t.is_active !== false &&
  t.is_published !== false &&
  t.is_public !== false &&
  t.status !== 'draft' &&
  t.status !== 'archived';

/** ✅ Same normalization as TemplatesPage.norm() */
const norm = (t) => ({
  id: t.id,
  code: t.code || `T${t.id}`,
  name: t.name || t.title || '',
  category: t.category_label || t.category || '',
  image: t.thumbnail || t.image || t.preview_image || t.preview_url || t.thumbnail_url || '',
});

export default function TemplatesCarousel() {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState([]);
  const [status, setStatus] = useState('loading');
  const [tick, setTick] = useState(0);
  const [cardPv, setCardPv] = useState({}); // ✅ same shape as TemplatesPage

  const load = useCallback(() => {
    setStatus('loading');
    publicApi.getTemplates()
      .then((data) => {
        setTemplates((data || []).filter(isPublicTemplate).map(norm));
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(() => { load(); }, [load, tick]);

  /* ✅ EXACT same card data fetch as TemplatesPage.jsx */
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

  /* Duplicate list once for a seamless -50% loop */
  const loop = [...templates, ...templates];

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
        <div className="container"><Skeleton count={4} variant="phone" label={t('templates.title')} /></div>
      )}

      {status === 'error' && (
        <div className="carousel__state container" role="alert">
          <p>{t('templates.error')}</p>
          <button className="btn btn--ghost btn--sm" onClick={() => setTick((v) => v + 1)}>{t('templates.retry')}</button>
        </div>
      )}

      {status === 'ready' && templates.length === 0 && (
        <p className="carousel__state container">{t('templates.empty')}</p>
      )}

      {status === 'ready' && templates.length > 0 && (
        <>
          <div className="carousel" role="region" aria-label={t('templates.regionLabel')}>
            <div className="carousel__track">
              {loop.map((tpl, i) => {
                const cp = cardPv[tpl.id]; // ✅ same lookup as TemplatesPage
                return (
                  <figure
                    className="carousel__slide"
                    key={`${tpl.id}-${i}`}
                    aria-hidden={i >= templates.length}
                  >
                    <div className="phone" data-category={tpl.category}>
                      <span className="phone__notch" aria-hidden="true" />
                      <div className="phone__screen">
                        {/* ✅ EXACT same structure as TemplatesPage */}
                        {cp && cp.first_bg ? (
                          <div className="tpl-thumb" style={{ backgroundImage: `url(${cp.first_bg})` }}>
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
                          <div className="phone__placeholder"><span>{tpl.code}</span></div>
                        )}
                      </div>
                      <figcaption className="phone__meta">
                        <span className="phone__category">{tpl.category}</span>
                        <strong>{tpl.name}</strong>
                      </figcaption>
                      <div className="phone__actions">
                        <button className="btn btn--gold btn--sm">{t('templates.select')}</button>
                        <button className="btn btn--ghost btn--sm">{t('templates.preview')}</button>
                      </div>
                    </div>
                  </figure>
                );
              })}
            </div>
            {/* Edge fades */}
            <span className="carousel__fade carousel__fade--start" aria-hidden="true" />
            <span className="carousel__fade carousel__fade--end" aria-hidden="true" />
          </div>

          <div className="carousel__footer container">
            <a className="btn btn--gold-outline" href="#templates">{t('templates.viewAll')}</a>
          </div>
        </>
      )}
    </section>
  );
}