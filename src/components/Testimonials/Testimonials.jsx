import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './Testimonials.css';

/* ── The ONLY permitted dummy data in the app ── */
const REVIEWS = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: ['أحمد الشريف', 'سارة المنصور', 'خالد العتيبي', 'ليلى حسن', 'عمر فاروق', 'نور الهدى', 'يوسف كمال', 'مريم عادل',
         'Hana Ali', 'Karim Nabil', 'Lina Saeed', 'Tarek Zaki', 'Dina Fathy', 'Sami Adel', 'Rana Mostafa', 'Hassan Id',
         'Aya Tarek', 'Nour Samir', 'Mai Abdullah', 'Ziad Hany'][i],
  role: { ar: ['عروس', 'مصممة فعاليات', 'صاحب قاعة', 'أم العريس', 'مصوّر', 'منسقة أعراس', 'خطوبة', 'عيد ميلاد',
               'Wedding', 'Engagement', 'Birthday', 'Corporate', 'Wedding', 'Engagement', 'Birthday',
               'Wedding', 'Corporate', 'Wedding', 'Birthday', 'Engagement'][i],
          en: ['Bride', 'Event Designer', 'Venue Owner', 'Groom’s Mother', 'Photographer', 'Wedding Planner', 'Engagement', 'Birthday',
               'عروس', 'خطوبة', 'عيد ميلاد', 'شركة', 'عرس', 'خطوبة', 'عيد ميلاد',
               'عرس', 'شركة', 'عرس', 'عيد ميلاد', 'خطوبة'][i] },
  text: {
    ar: 'تجربة راقية من البداية للنهاية، الدعوة وصلت لكل الضيوف بشكل أنيق وتأكيد الحضور وفّر علينا عناء الاتصالات.',
    en: 'A refined experience end-to-end. The invitation reached every guest elegantly, and RSVP saved us countless calls.',
  },
  rating: 5 - (i % 3 === 2 ? 1 : 0),
}));

const PAGE_SIZE = 8;

/** Section 4 — Masonry testimonials with progressive "Load More". */
export default function Testimonials() {
  const { t, lang } = useLanguage();
  const [visible, setVisible] = useState(PAGE_SIZE);

  const shown = REVIEWS.slice(0, visible);
  const allLoaded = visible >= REVIEWS.length;

  return (
    <section className="reviews section" id="reviews" aria-labelledby="reviews-title">
      <div className="container">
        <header className="section-head">
          <span className="section-eyebrow">{t('reviews.eyebrow')}</span>
          <h2 className="section-title" id="reviews-title">{t('reviews.title')}</h2>
          <p className="section-sub">{t('reviews.subtitle')}</p>
        </header>

        <div className="reviews__masonry">
          {shown.map((r) => (
            <article className="review" key={r.id}>
              <div className="review__stars" aria-label={`${r.rating}/5`}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <svg key={s} viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"
                       fill={s < r.rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 3l2.7 5.8 6.3.8-4.6 4.3 1.2 6.1L12 17l-5.6 3 1.2-6.1L3 9.6l6.3-.8z" />
                  </svg>
                ))}
              </div>
              <p className="review__text">{r.text[lang]}</p>
              <footer className="review__who">
                <span className="review__avatar" aria-hidden="true">{r.name.charAt(0)}</span>
                <div>
                  <strong>{r.name}</strong>
                  <em>{r.role[lang]}</em>
                </div>
              </footer>
            </article>
          ))}
        </div>

        {!allLoaded && (
          <div className="reviews__more">
            <button className="btn btn--gold" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
              {t('reviews.loadMore')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}