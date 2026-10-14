import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { publicApi } from '../../services/api';
import './PricingPage.css';

const COPY = {
  ar: {
    eyebrow: '✦ أسعار شفافة ✦',
    title: 'ادفع مرة واحدة… واحكِ حكايتك كاملة',
    sub: 'لا اشتراكات شهرية ولا رسوم خفية. كل باقة تُفعَّل لدعوتك مدى الحياة، شاملة التحديثات والدعم.',
    popular: 'الأكثر اختياراً',
    choose: 'ابدأ بهذه الباقة',
    perInv: 'للدعوة الواحدة — تفعيل مدى الحياة',
    loading: 'جارٍ تحميل الباقات…',
    includedTitle: 'كل الباقات تشمل',
    included: [
      'دعوة تفاعلية بخمس صفحات',
      'غلاف ظرف سينمائي',
      'رمز QR للضيوف',
      'تأكيد حضور RSVP',
      'بدون تطبيق للضيوف',
      'دعم فني بالعربية',
    ],
    trust: [
      { t: 'دفع آمن 100%', d: 'عبر بوابة PayTabs المعتمدة — مدى، فيزا، ماستركارد، Apple Pay.' },
      { t: 'تفعيل فوري', d: 'تُفعَّل دعوتك لحظياً بعد نجاح الدفع ويختفي علامة PREVIEW.' },
      { t: 'بدون مفاجآت', d: 'السعر المعروض هو النهائي — لا رسوم تجديد ولا عمولات.' },
      { t: 'استضافة دائمة', d: 'دعوتك ورابطك وصور ضيوفك مستضافة معنا بلا حدود زمن.' },
    ],
    faqs: [
      { q: 'هل السعر لكل دعوة أم لكل حساب؟', a: 'لكل دعوة. يمكنك إنشاء دعوات متعددة، وكل دعوة تختار باقتها المناسبة.' },
      { q: 'هل يمكن ترقية الباقة لاحقاً؟', a: 'نعم — تدفع فرق السعر فقط وتُضاف مزايا الباقة الأعلى فوراً دون فقدان بيانات.' },
      { q: 'ماذا لو لم تعجبني النتيجة؟', d: '', a: 'يمكنك تعديل تصميمك بلا حدود قبل الدفع؛ وبعد الدفع يبقى التعديل متاحاً ما دام الخيار مفعّلاً.' },
      { q: 'هل تظهر إعلانات لضيوفي؟', a: 'لا إطلاقاً. دعوتك نظيفة بهويتك أنت فقط — بدون أي إعلانات أو شعارات منصة.' },
    ],
    ctaTitle: 'لست متأكداً بعد؟',
    ctaSub: 'جرّب المصمم مجاناً أولاً — ادفع فقط عندما تعجبك النتيجة.',
    ctaBtn: 'جرّب المصمم مجاناً',
  },
  en: {
    eyebrow: '✦ Transparent Pricing ✦',
    title: 'Pay once… tell your whole story',
    sub: 'No monthly subscriptions, no hidden fees. Every package activates your invitation for life, including updates and support.',
    popular: 'Most chosen',
    choose: 'Start with this package',
    perInv: 'Per invitation — lifetime activation',
    loading: 'Loading packages…',
    includedTitle: 'All packages include',
    included: [
      'Five-page interactive invitation',
      'Cinematic envelope cover',
      'Guest QR code',
      'RSVP confirmations',
      'No guest app needed',
      'Arabic/English support',
    ],
    trust: [
      { t: '100% secure payment', d: 'Via certified PayTabs — mada, Visa, Mastercard, Apple Pay.' },
      { t: 'Instant activation', d: 'Your invitation goes live right after payment; PREVIEW mark removed.' },
      { t: 'No surprises', d: 'The shown price is final — no renewals, no commissions.' },
      { t: 'Permanent hosting', d: 'Your invitation, link, and guest photos hosted with no time limits.' },
    ],
    faqs: [
      { q: 'Is the price per invitation or per account?', a: 'Per invitation. You can create multiple invitations, each with its own package.' },
      { q: 'Can I upgrade later?', a: 'Yes — pay only the difference and higher-tier features unlock instantly without data loss.' },
      { q: 'What if I don’t like the result?', a: 'Edit unlimited before payment; after payment editing stays available while the option is enabled.' },
      { q: 'Will my guests see ads?', a: 'Never. Your invitation carries only your identity — no ads, no platform branding.' },
    ],
    ctaTitle: 'Not sure yet?',
    ctaSub: 'Try the designer free first — pay only when you love the result.',
    ctaBtn: 'Try the designer free',
  },
};

/* باقات افتراضية مطابقة لخطط الدفع — طبقة أمان إن فشل الجلب */
const fallbackPackages = (lang) => [
  {
    code: 'basic', popular: false, price: 299,
    name: lang === 'ar' ? 'الأساسية' : 'Basic',
    tagline: lang === 'ar' ? 'لبداية أنيقة' : 'An elegant start',
    features: lang === 'ar'
      ? ['دعوة تفاعلية واحدة', 'معرض 50 صورة وفيديو', 'تأكيد حضور عبر QR', 'تقويم وعدّاد تنازلي', 'دعم عبر البريد']
      : ['One interactive invitation', '50-photo gallery', 'QR check-in', 'Calendar & countdown', 'Email support'],
  },
  {
    code: 'premium', popular: true, price: 499,
    name: lang === 'ar' ? 'البريميوم' : 'Premium',
    tagline: lang === 'ar' ? 'الأكثر اكتمالاً' : 'The complete one',
    features: lang === 'ar'
      ? ['كل مزايا الأساسية', 'معرض غير محدود', 'موسيقى وخلفيات حصرية', 'غرفة ذكريات الضيوف', 'بدون علامة مائية', 'دعم ذو أولوية']
      : ['Everything in Basic', 'Unlimited gallery', 'Exclusive music & backgrounds', 'Guest memories room', 'No watermark', 'Priority support'],
  },
  {
    code: 'royal', popular: false, price: 799,
    name: lang === 'ar' ? 'الملكية' : 'Royal',
    tagline: lang === 'ar' ? 'لتجربة استثنائية' : 'For an exceptional experience',
    features: lang === 'ar'
      ? ['كل مزايا البريميوم', 'قالب مصمم خصيصاً لك', 'رابط نطاق خاص بدعوتك', 'مدير حساب مخصص', 'دعم 24/7']
      : ['Everything in Premium', 'Custom-designed template', 'Custom domain link', 'Dedicated account manager', '24/7 support'],
  },
];

/* فك تغليف حقول الباقة مهما اختلفت أسماؤها في الباك إند */
const parseFeatures = (p, lang) => {
  let raw = p.features ?? p.features_list ?? p.benefits;
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw); } catch { raw = raw.split(/[\n|]/); }
  }
  if (!Array.isArray(raw)) raw = [];
  return raw
    .map((f) => (typeof f === 'string' ? f : (lang === 'ar' ? f.ar || f.name_ar || f.text : f.en || f.name_en || f.text) || ''))
    .filter(Boolean);
};

const normPkg = (p, i, lang) => ({
  id: p.id ?? i,
  code: String(p.code || p.slug || p.name || `pkg${i}`).toLowerCase(),
  name: (lang === 'ar' ? (p.name_ar || p.name || p.title) : (p.name_en || p.name || p.title)) || `#${i + 1}`,
  tagline: (lang === 'ar' ? (p.tagline_ar || p.tagline) : (p.tagline_en || p.tagline)) || '',
  price: Number(p.price ?? p.amount ?? 0),
  currency: p.currency || (lang === 'ar' ? 'ج.م' : 'EGP'),
  period: (lang === 'ar' ? (p.period_ar || p.period) : (p.period_en || p.period)) || '',
  features: parseFeatures(p, lang),
  popular: !!(p.is_popular || p.popular || p.recommended || p.is_recommended),
});

export default function PricingPage() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const c = COPY[lang];

  const [packages, setPackages] = useState(null); // null = loading
  const [openFaq, setOpenFaq] = useState(0);

  /* 📥 جلب الباقات من الباك إند مع طبقة الأمان */
  useEffect(() => {
    let alive = true;
    publicApi
      .getPackages()
      .then((list) => {
        if (!alive) return;
        const norm = (list || []).map((p, i) => normPkg(p, i, lang)).filter((p) => p.price > 0 || p.features.length);
        setPackages(norm.length ? norm : fallbackPackages(lang));
      })
      .catch(() => { if (alive) setPackages(fallbackPackages(lang)); });
    return () => { alive = false; };
  }, [lang]);

  /* ✨ كشف عند التمرير */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } }),
      { threshold: 0.12 },
    );
    document.querySelectorAll('.pr-reveal').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [packages, lang]);

  /* 🎯 اختيار باقة: خزّن الاختيار ثم وجّه */
  const choose = (p) => {
    // خزّن الباقة المختارة
    try { localStorage.setItem('invitory_selected_plan', p.code); } catch { /* تجاهل */ }
    try { localStorage.setItem('invitory_selected_package_id', p.id); } catch { /* تجاهل */ }

    if (!user) {
      navigate('/signup');
      return;
    }

    // وجّه لإنشاء دعوة جديدة (ستُربط الباقة تلقائياً عند الدفع)
    navigate('/invitations/create');
  };

  const list = useMemo(() => packages || [], [packages]);

  return (
    <div className="pr">
      <span className="pr__orb pr__orb--1" aria-hidden="true" />
      <span className="pr__orb pr__orb--2" aria-hidden="true" />

      <Navbar />

      {/* ═══ الترويسة ═══ */}
      <header className="pr__hero container">
        <span className="pr__eyebrow">{c.eyebrow}</span>
        <h1 className="pr__title">{c.title}</h1>
        <p className="pr__sub">{c.sub}</p>
      </header>

      {/* ═══ البطاقات ═══ */}
      <main className="pr__grid container">
        {!packages && (
          <div className="pr__loading">
            <div className="pr-skel" /><div className="pr-skel pr-skel--tall" /><div className="pr-skel" />
            <p>{c.loading}</p>
          </div>
        )}

        {list.map((p, i) => (
          <article
            key={p.id}
            className={`pr-card ${p.popular ? 'is-popular' : ''} pr-reveal`}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            {p.popular && <span className="pr-card__badge">{c.popular}</span>}
            <h3 className="pr-card__name">{p.name}</h3>
            {p.tagline && <p className="pr-card__tag">{p.tagline}</p>}

            <div className="pr-card__price">
              <span className="pr-card__amount">{p.price}</span>
              <span className="pr-card__currency">{p.currency}</span>
            </div>
            <p className="pr-card__period">{p.period || c.perInv}</p>

            <ul className="pr-card__feats">
              {p.features.map((f, fi) => (
                <li key={fi}>
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button className={`pr-card__btn ${p.popular ? 'pr-card__btn--gold' : ''}`} onClick={() => choose(p)}>
              {c.choose}
            </button>
          </article>
        ))}
      </main>

      {/* ═══ شامل في كل الباقات ═══ */}
      <section className="pr__included container pr-reveal">
        <h3>{c.includedTitle}</h3>
        <div className="pr__chips">
          {c.included.map((t, i) => (
            <span key={i} className="pr__chip">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* ═══ صف الثقة ═══ */}
      <section className="pr__trust container">
        {c.trust.map((t, i) => (
          <article key={i} className="pr-trust pr-reveal" style={{ transitionDelay: `${i * 80}ms` }}>
            <h4>{t.t}</h4>
            <p>{t.d}</p>
          </article>
        ))}
      </section>

      {/* ═══ أسئلة الأسعار ═══ */}
      <section className="pr__faq container">
        {c.faqs.map((f, i) => (
          <div key={i} className={`pr-faq ${openFaq === i ? 'is-open' : ''} pr-reveal`}>
            <button className="pr-faq__q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <span>{f.q}</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            {openFaq === i && <p className="pr-faq__a">{f.a}</p>}
          </div>
        ))}
      </section>

      {/* ═══ CTA ═══ */}
      <section className="pr__cta">
        <div className="container pr__cta-box pr-reveal">
          <h2>{c.ctaTitle}</h2>
          <p>{c.ctaSub}</p>
          <button className="pr__cta-btn" onClick={() => navigate('/invitations/create')}>{c.ctaBtn}</button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
