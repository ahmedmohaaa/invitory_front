import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { publicApi } from '../../services/api';  // ← استخدم publicApi بدلاً من api
import Skeleton from '../Skeleton/Skeleton';
import './ThreeWorlds.css';

/** Maps backend currency codes → localized symbols. */
const currencySymbol = (code, lang) =>
  ({ EGP: lang === 'ar' ? 'ج.م' : 'EGP', USD: '$', SAR: lang === 'ar' ? 'ر.س' : 'SAR' }[code] || code);

/**
 * Section 1 — "Three Worlds" pricing cards.
 * 100% API-driven (no mock data).
 */
export default function ThreeWorlds() {
  const { t, lang } = useLanguage();
  const [packages, setPackages] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [tick, setTick] = useState(0); // retry trigger
 
  const load = useCallback(() => {
    setStatus('loading');
    publicApi.getPackages()
      .then((data) => { setPackages(data.slice(0, 3)); setStatus('ready'); })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(() => { load(); }, [load, tick]);

  return (
    <section className="worlds section" id="prices" aria-labelledby="worlds-title">
      <div className="container">
        <header className="section-head">
          <span className="section-eyebrow">{t('worlds.eyebrow')}</span>
          <h2 className="section-title" id="worlds-title">{t('worlds.title')}</h2>
          <p className="section-sub">{t('worlds.subtitle')}</p>
        </header>

        {status === 'loading' && <Skeleton count={3} variant="card" label={t('worlds.title')} />}

        {status === 'error' && (
          <div className="worlds__state" role="alert">
            <p>{t('worlds.error')}</p>
            <button className="btn btn--ghost btn--sm" onClick={() => setTick((v) => v + 1)}>{t('worlds.retry')}</button>
          </div>
        )}

        {status === 'ready' && packages.length === 0 && (
          <p className="worlds__state">{t('worlds.empty')}</p>
        )}

        {status === 'ready' && packages.length > 0 && (
          <div className="worlds__grid">
            {packages.map((pkg, i) => {
              const isFeatured = i === 1; // الباقة الوسطى = المميزة
              return (
                <article
                  className={`world world--${i + 1} ${isFeatured ? 'world--featured' : ''}`}
                  key={pkg.id}
                >
                  {/* شريط علوي ذهبي متدرج */}
                  <span className="world__accent-line" aria-hidden="true" />

                  {/* Badge للباقة المميزة */}
                  {isFeatured && (
                    <span className="world__badge">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
                        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.9 5.8 21.3l2.4-7.4L2 9.4h7.6z"/>
                      </svg>
                      {t('worlds.featured') || (lang === 'ar' ? 'الأكثر طلباً' : 'Most Popular')}
                    </span>
                  )}

                  {/* الرأسية مع المونوغرام */}
                  <div className="world__head" aria-hidden="true">
                    <span className="world__ornament world__ornament--left" />
                    <span className="world__ornament world__ornament--right" />
                    <span className="world__monogram">
                      {pkg.name?.charAt(0) || '✦'}
                    </span>
                  </div>

                  <div className="world__body">
                    <h3 className="world__name">{pkg.name}</h3>
                    <p className="world__desc">
                      {pkg.description ||
                        `${pkg.max_invitations} ${t('worlds.invitations')} · ${pkg.max_guests_per_invitation} ${t('worlds.guests')}`}
                    </p>

                    <ul className="world__specs">
                      <li>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>
                        </svg>
                        <strong>{pkg.max_invitations}</strong>
                        <span>{t('worlds.invitations')}</span>
                      </li>
                      <li>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        <strong>{pkg.max_guests_per_invitation}</strong>
                        <span>{t('worlds.guests')}</span>
                      </li>
                      <li>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <strong>{pkg.duration_days}</strong>
                        <span>{t('worlds.days')}</span>
                      </li>
                    </ul>

                    <div className="world__price-block">
                      <span className="world__price-label">{t('worlds.startingFrom')}</span>
                      <div className="world__price-row">
                        <strong>{Number(pkg.price).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}</strong>
                        <em>{currencySymbol(pkg.currency, lang)}</em>
                      </div>
                    </div>

                    <a className="btn btn--gold world__cta" href="#contact">
                      <span>{t('worlds.order')}</span>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}