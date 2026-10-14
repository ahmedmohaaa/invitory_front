import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './TutorialPage.css';

/* ═══════════════════════════════════════════════════════════
   📚 محتوى الدليل — ثنائي اللغة
   ═══════════════════════════════════════════════════════════ */
const COPY = {
  ar: {
    eyebrow: '✦ مركز التعلّم ✦',
    title: 'دليلك من الفكرة إلى المشاركة',
    sub: 'رحلة مصوّرة خطوة بخطوة: صمّم دعوتك، فعّلها، وشاركها مع ضيوفك — وكل شيء مشروح بلغة بسيطة.',
    search: 'ابحث في الدليل…',
    progressTitle: 'تقدّمك في القراءة',
    reset: 'تصفير',
    read: 'تمّت القراءة ✓',
    markRead: 'علّم كمقروء',
    sections: {
      start: 'الانطلاق السريع',
      journey: 'رحلة المصمم (18 مرحلة)',
      share: 'التفعيل والمشاركة',
      guests: 'إدارة الضيوف',
      faq: 'أسئلة شائعة',
    },
    quick: [
      { t: 'أنشئ حسابك', d: 'دقيقة واحدة تكفي: بريدك وكلمة مرور وستكون داخل الاستوديو.', to: '/signup', btn: 'تسجيل مجاني' },
      { t: 'اختر قالبك', d: '70+ قالباً داخل إطارات هاتف حقيقية — معاينة فورية واختيار بضغطة.', to: '/templates', btn: 'تصفح القوالب' },
      { t: 'صمّم وشارك', d: '18 مرحلة سلسة، ثم غلاف سينمائي، رابط فريد، ولوحة ضيوف ذكية.', to: '/invitations/create', btn: 'ابدأ التصميم' },
    ],
    phases: [
      {
        title: '🎭 الطور الأول — الهوية',
        steps: [
          { n: 1, t: 'لغة الدعوة', d: 'اختر العربية أو الإنجليزية؛ تنعكس فوراً على الاتجاه والخطوط في المعاينة الحية.', tip: 'يمكنك تبديل اللغة في أي لحظة دون فقدان أي بيانات.' },
          { n: 2, t: 'نوع المناسبة', d: 'زفاف، خطوبة، تخرج، مولود… لكل مناسبة رمزها ولوحها اللوني المقترح.', tip: 'تُحدد المناسبة الافتراضية تلقائياً ويمكنك تغييرها بضغطة.' },
          { n: 3, t: 'الصفحات والثيم', d: 'فعّل أو أخفِ أيّاً من الصفحات الخمس، واختر الألوان الثلاثة والخطوط.', tip: 'خلفية كل صفحة تُرفع من جهازك وتظهر بتأثير Crossfade عند التمرير.' },
        ],
      },
      {
        title: '📝 الطور الثاني — التفاصيل',
        steps: [
          { n: 4, t: 'المعلومات الأساسية', d: 'عنوان الحدث، التاريخ، الوقت، الدولة — والتاريخ الهجري يُحسب تلقائياً.', tip: 'نوع الدعوة (فردي/زوجي) والأسماء تُكتب هنا وتظهر في الختم.' },
          { n: 5, t: 'نص الدعوة والعائلات', d: 'محرر نص غني: تنسيق، ألوان، وأسماء العائلتين بخط مختار.', tip: 'زر المعاينة في المحرر يريك النص كما سيظهر بالضبط.' },
          { n: 6, t: 'المكان والموقع', d: 'اسم القاعة والعنوان ورابط خرائط جوجل جاهز للضيف.', tip: 'زر «فتح الموقع» يظهر داخل الدعوة ويفتح الخرائط مباشرة.' },
          { n: 7, t: 'برنامج الحفل', d: 'فقرات مرتبة بالوقت: استقبال، زفة، عشاء… تظهر كجدول أنيق.', tip: 'رتّب الفقرات لتظهر للضيف بنفس الترتيب.' },
          { n: 8, t: 'تفاصيل الحدث', d: 'رقائق جاهزة (بوفيه، قاعة صلاة، مواقف…) + نص حر لتفاصيلك.', tip: 'النص الحر يظهر أسفل الرقائق بخط مميز.' },
          { n: 9, t: 'أين تقيمون', d: 'فنادق مقترحة للضيوف القادمين من خارج المدينة + ملاحظات.', tip: 'فعّله فقط إن كان لديك ضيوف مسافرون.' },
        ],
      },
      {
        title: '🖼️ الطور الثالث — الذكريات',
        steps: [
          { n: 10, t: 'معرض الصور', d: 'حتى 6 صور تتبدل تلقائياً كل ثوانٍ (Slideshow) بجودة أصلية.', tip: 'الصور تُضغط للعرض فقط — الأصل يبقى محفوظاً.' },
          { n: 11, t: 'رسالة شخصية', d: 'عنوان + نص + توقيع بخط يدوي فوق المعرض في الصفحة الرابعة.', tip: 'رسالة قصيرة صادقة أقوى من نص طويل.' },
          { n: 12, t: 'جهات الاتصال', d: 'أرقام للاتصال والواتساب مباشرة من داخل الدعوة.', tip: 'أضف منسق الحفل لتسهيل تواصل الضيوف.' },
          { n: 13, t: 'الموسيقى', d: 'من مكتبة المنصة، أو مقطعك الخاص، أو رابط يوتيوب — مع نقطة بداية.', tip: 'مشغّل مصغّر يظهر أعلى الدعوة ويتحكم به الضيف.' },
        ],
      },
      {
        title: '⚙️ الطور الرابع — التجربة الذكية',
        steps: [
          { n: 14, t: 'الهدية', d: 'رسالة شكر + حساب بنكي + QR + قائمة أمنيات بأناقة.', tip: 'كل الحقول اختيارية وتُعرض في الصفحة الأخيرة.' },
          { n: 15, t: 'الكاميرا', d: 'تحكم بأزرار الالتقاط ومعرض لقطات الضيوف داخل الدعوة.', tip: 'لقطات الضيوف تصلك في «لقطات ومعرض» بدعواتي.' },
          { n: 16, t: 'دخول QR', d: 'بوابة دخول ذكية: عدد متوقع، نافذة مسح، وPIN للموظف.', tip: 'اطبع رمز الدخول ووضعه على باب القاعة.' },
          { n: 17, t: 'تأكيد الحضور RSVP', d: 'حقول النموذج + عدّاد مباشر + رمز عام لجمع الردود.', tip: 'شارك رمز RSVP مع رابط الدعوة لجمع الردود.' },
          { n: 18, t: 'الغلاف والإنهاء', d: 'لون الختم وخطه، ثم زر «إنهاء» ينقلك للمعاينة فالالدفع فالمشاركة.', tip: 'الغلاف بابان وختم بأسمائك — يفتح بلمسة OPEN.' },
        ],
      },
    ],
    shareCards: [
      { t: 'رابط دعوة فريد', d: 'بعد الدفع يُولَّد رابط مثل invitory.com/i/ahmad-sara-2026 — انسخه وشاركه أينما شئت.' },
      { t: 'غلاف سينمائي', d: 'بابان زجاجيان وختم دائري بأسمائك؛ ضيفك يضغط OPEN فتُفتح الدعوة أمامه.' },
      { t: 'حماية قبل الدفع', d: 'علامة PREVIEW شفافة تحمي تصميمك من النسخ قبل إتمام الدفع، وتختفي بعده تلقائياً.' },
      { t: 'دفع آمن', d: 'عبر PayTabs (مدى/فيزا/ماستركارد/Apple Pay) — بعد النجاح تُفعّل الدعوة بالكامل.' },
    ],
    guestCards: [
      { t: 'لوحة التأكيدات', d: 'ردود لحظية، فلاتر، بحث، تصدير CSV عربي سليم، وجدار تهاني.' },
      { t: 'وصول الباب', d: 'مسح QR عند الباب + مقارنة ذكية: من أكد؟ من وصل؟ من تكرّر مسحه؟' },
      { t: 'تنبيهات حية', d: 'جرس في النافبار يعدّ الردود الجديدة منذ آخر زيارة، بقائمة منسدلة أنيقة.' },
      { t: 'تذكير واتساب', d: 'زر جاهز يفتح واتساب برسالة تتضمن مناسبتك ورابط دعوتك.' },
    ],
    faqs: [
      { q: 'هل يحتاج ضيوفي لتثبيت تطبيق؟', a: 'لا إطلاقاً. الدعوة تعمل في المتصفح مباشرة عبر الرابط أو رمز QR — بدون تسجيل ولا تحميل.' },
      { q: 'هل يمكن تعديل الدعوة بعد الدفع؟', a: 'نعم، ما دام خيار «السماح بالتعديل بعد الدفع» مفعّلاً في دعوتك. التعديل يظهر فوراً للضيوف.' },
      { q: 'كيف يعمل دخول QR عند الباب؟', a: 'يُمسح رمز الضيف من لوحة «وصول الباب»؛ يسجَّل وقت الوصول ويُقارن تلقائياً بتأكيده الإلكتروني، مع تنبيه للمسح المكرر.' },
      { q: 'كيف أصدّر قائمة الضيوف؟', a: 'من لوحة إدارة الضيوف زر «تصدير CSV» — ملف يفتح في Excel بالعربية سليمة بفضل ترميز UTF-8 BOM.' },
      { q: 'هل عملية الدفع آمنة؟', a: 'نعم، تتم عبر بوابة PayTabs المعتمدة؛ لا تُخزَّن بيانات بطاقتك على خوادمنا إطلاقاً.' },
      { q: 'هل يمكن تغيير القالب بعد البدء؟', a: 'يمكنك اختيار قالب جديد في أي وقت؛ محتوى دعوتك (نصوص وصور) يبقى محفوظاً ويُعاد تطبيقه على القالب الجديد.' },
    ],
    ctaTitle: 'جاهز لتحكي حكايتك؟',
    ctaSub: 'ابدأ الآن — أول دعوة لك على بعد دقائق.',
    ctaBtn: 'أنشئ دعوتك مجاناً',
    empty: 'لا نتائج مطابقة لبحثك.',
  },
  en: {
    eyebrow: '✦ Learning Hub ✦',
    title: 'Your guide from idea to share',
    sub: 'A visual step-by-step journey: design, activate, and share your invitation — everything explained simply.',
    search: 'Search the guide…',
    progressTitle: 'Your reading progress',
    reset: 'Reset',
    read: 'Read ✓',
    markRead: 'Mark as read',
    sections: {
      start: 'Quick start',
      journey: 'Designer journey (18 stages)',
      share: 'Activation & sharing',
      guests: 'Guest management',
      faq: 'FAQ',
    },
    quick: [
      { t: 'Create your account', d: 'One minute: email + password and you’re inside the studio.', to: '/signup', btn: 'Free signup' },
      { t: 'Pick your template', d: '70+ templates in real phone frames — instant preview, one-tap select.', to: '/templates', btn: 'Browse templates' },
      { t: 'Design & share', d: '18 smooth stages, then a cinematic envelope, unique link, smart guest board.', to: '/invitations/create', btn: 'Start designing' },
    ],
    phases: [
      {
        title: '🎭 Phase 1 — Identity',
        steps: [
          { n: 1, t: 'Invitation language', d: 'Arabic or English; instantly reflected in direction and fonts in the live preview.', tip: 'Switch language anytime without losing data.' },
          { n: 2, t: 'Occasion type', d: 'Wedding, engagement, graduation… each with its icon and suggested palette.', tip: 'A default occasion is preselected; change it in one tap.' },
          { n: 3, t: 'Pages & theme', d: 'Enable/hide any of the five pages, pick the three colors and fonts.', tip: 'Each page background uploads from your device with a Crossfade effect.' },
        ],
      },
      {
        title: '📝 Phase 2 — Details',
        steps: [
          { n: 4, t: 'Basic info', d: 'Title, date, time, country — Hijri date computed automatically.', tip: 'Invitation type (solo/couple) and names are set here and shown on the seal.' },
          { n: 5, t: 'Invitation text & families', d: 'Rich text editor: formatting, colors, and both family names in a chosen font.', tip: 'The editor preview shows the text exactly as guests will see it.' },
          { n: 6, t: 'Venue & location', d: 'Hall name, address, and a Google Maps link ready for guests.', tip: '“Open location” button appears inside the invitation.' },
          { n: 7, t: 'Event program', d: 'Timed agenda: welcome, zaffa, dinner… shown as an elegant table.', tip: 'Order the items to appear in the same order for guests.' },
          { n: 8, t: 'Event details', d: 'Ready chips (buffet, prayer room, parking…) + free text for your own.', tip: 'Free text appears below the chips in a distinct style.' },
          { n: 9, t: 'Accommodation', d: 'Suggested hotels for out-of-town guests + notes.', tip: 'Enable only if you have traveling guests.' },
        ],
      },
      {
        title: '🖼️ Phase 3 — Memories',
        steps: [
          { n: 10, t: 'Photo gallery', d: 'Up to 6 photos auto-rotating (slideshow) in original quality.', tip: 'Images are compressed for display only — originals stay saved.' },
          { n: 11, t: 'Personal message', d: 'Title + body + handwritten signature above the gallery on page four.', tip: 'A short sincere message beats a long one.' },
          { n: 12, t: 'Contacts', d: 'Call & WhatsApp numbers directly inside the invitation.', tip: 'Add your event coordinator for easy guest contact.' },
          { n: 13, t: 'Music', d: 'From the platform library, your own track, or YouTube — with a start point.', tip: 'A mini player appears on top of the invitation.' },
        ],
      },
      {
        title: '⚙️ Phase 4 — Smart experience',
        steps: [
          { n: 14, t: 'Gift', d: 'Thank-you note + bank account + QR + wishlist, elegantly.', tip: 'All fields optional, shown on the last page.' },
          { n: 15, t: 'Camera', d: 'Control capture buttons and the guest captures gallery.', tip: 'Guest captures arrive in “Captures & gallery” under My Invitations.' },
          { n: 16, t: 'QR check-in', d: 'Smart gate: expected count, scan window, staff PIN.', tip: 'Print the check-in code and place it at the hall door.' },
          { n: 17, t: 'RSVP', d: 'Form fields + live counter + public token to collect responses.', tip: 'Share the RSVP token with your invitation link.' },
          { n: 18, t: 'Envelope & finish', d: 'Seal color & font, then “Finish” takes you to preview, payment, sharing.', tip: 'The envelope is two doors and a seal with your names — opens with OPEN.' },
        ],
      },
    ],
    shareCards: [
      { t: 'Unique link', d: 'After payment a link like invitory.com/i/ahmad-sara-2026 is generated — copy & share anywhere.' },
      { t: 'Cinematic envelope', d: 'Two glass doors and a round seal with your names; guests tap OPEN to reveal.' },
      { t: 'Pre-payment protection', d: 'A translucent PREVIEW mark protects your design before payment, removed after.' },
      { t: 'Secure payment', d: 'Via PayTabs (mada/Visa/Mastercard/Apple Pay) — activation follows success.' },
    ],
    guestCards: [
      { t: 'RSVP board', d: 'Live responses, filters, search, clean Arabic CSV export, wishes wall.' },
      { t: 'Door arrivals', d: 'QR scan at the door + smart compare: confirmed? arrived? duplicate?' },
      { t: 'Live alerts', d: 'Navbar bell counts new responses since last visit with an elegant dropdown.' },
      { t: 'WhatsApp reminder', d: 'One-tap button opens WhatsApp with your event and link pre-filled.' },
    ],
    faqs: [
      { q: 'Do guests need an app?', a: 'No. The invitation runs in the browser via link or QR — no signup, no download.' },
      { q: 'Can I edit after payment?', a: 'Yes, while “allow editing after payment” is enabled. Changes go live instantly.' },
      { q: 'How does door QR work?', a: 'Scan the guest code from “Door arrivals”; arrival time is logged and compared with the electronic RSVP, with duplicate alerts.' },
      { q: 'How do I export guests?', a: 'From the guest board, “Export CSV” — opens perfectly in Excel with Arabic thanks to UTF-8 BOM.' },
      { q: 'Is payment secure?', a: 'Yes, via certified PayTabs gateway; card data never touches our servers.' },
      { q: 'Can I change template later?', a: 'Yes, pick a new template anytime; your content (texts/photos) is preserved and reapplied.' },
    ],
    ctaTitle: 'Ready to tell your story?',
    ctaSub: 'Start now — your first invitation is minutes away.',
    ctaBtn: 'Create your invitation free',
    empty: 'No results match your search.',
  },
};

const STORAGE_KEY = 'invitory_tutorial_read';

export default function TutorialPage() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const c = COPY[lang];

  const [query, setQuery] = useState('');
  const [activeSection, setActiveSection] = useState('start');
  const [openStep, setOpenStep] = useState(1);
  const [openFaq, setOpenFaq] = useState(0);
  const [read, setRead] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); } catch { return new Set(); }
  });

  const totalSteps = useMemo(() => c.phases.reduce((s, p) => s + p.steps.length, 0), [c]);
  const progress = Math.round((read.size / totalSteps) * 100);

  const toggleRead = (n) => {
    setRead((prev) => {
      const s = new Set(prev);
      if (s.has(n)) s.delete(n); else s.add(n);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(s)));
      return s;
    });
  };

  const resetProgress = () => {
    setRead(new Set());
    localStorage.setItem(STORAGE_KEY, '[]');
  };

  /* 🧭 Scroll-Spy للشريط الجانبي */
  useEffect(() => {
    const ids = ['start', 'journey', 'share', 'guests', 'faq'];
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { rootMargin: '-35% 0px -55% 0px' },
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  /* ✨ كشف العناصر عند التمرير */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
      }),
      { threshold: 0.1 },
    );
    document.querySelectorAll('.tu-reveal').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [lang]);

  /* 🔎 فلترة البحث */
  const q = query.trim().toLowerCase();
  const phases = useMemo(() => {
    if (!q) return c.phases;
    return c.phases
      .map((p) => ({ ...p, steps: p.steps.filter((s) => `${s.t} ${s.d} ${s.tip}`.toLowerCase().includes(q)) }))
      .filter((p) => p.steps.length > 0);
  }, [c, q]);
  const faqs = useMemo(() => (q ? c.faqs.filter((f) => `${f.q} ${f.a}`.toLowerCase().includes(q)) : c.faqs), [c, q]);

  const goTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="tu">
      <span className="tu__orb tu__orb--1" aria-hidden="true" />
      <span className="tu__orb tu__orb--2" aria-hidden="true" />

      <Navbar />

      {/* ═══ الترويسة ═══ */}
      <header className="tu__hero container">
        <span className="tu__eyebrow">{c.eyebrow}</span>
        <h1 className="tu__title">{c.title}</h1>
        <p className="tu__sub">{c.sub}</p>
        <label className="tu__search">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
          </svg>
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={c.search} />
        </label>

        {/* شريط التقدم */}
        <div className="tu__progress">
          <div className="tu__progress-head">
            <span>{c.progressTitle}</span>
            <span className="tu__progress-pct">{progress}%</span>
          </div>
          <div className="tu__progress-bar"><span style={{ width: `${progress}%` }} /></div>
          <button className="tu__progress-reset" onClick={resetProgress}>{c.reset}</button>
        </div>
      </header>

      {/* ═══ الجسم: شريط جانبي + محتوى ═══ */}
      <div className="tu__layout container">
        <aside className="tu__side">
          {Object.entries(c.sections).map(([id, label]) => (
            <button key={id} className={`tu__side-link ${activeSection === id ? 'is-active' : ''}`} onClick={() => goTo(id)}>
              {label}
            </button>
          ))}
        </aside>

        <main className="tu__main">
          {/* ── الانطلاق السريع ── */}
          <section id="start" className="tu__section">
            <div className="tu__cards">
              {c.quick.map((s, i) => (
                <article key={i} className="tu-card tu-reveal" style={{ transitionDelay: `${i * 90}ms` }}>
                  <span className="tu-card__num">{i + 1}</span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                  <button className="tu-card__btn" onClick={() => navigate(s.to)}>{s.btn}</button>
                </article>
              ))}
            </div>
          </section>

          {/* ── رحلة المصمم ── */}
          <section id="journey" className="tu__section">
            {phases.length === 0 && <p className="tu__empty">{c.empty}</p>}
            {phases.map((p, pi) => (
              <div key={pi} className="tu-phase tu-reveal">
                <h3 className="tu-phase__title">{p.title}</h3>
                <div className="tu-phase__steps">
                  {p.steps.map((s) => (
                    <div key={s.n} className={`tu-step ${openStep === s.n ? 'is-open' : ''} ${read.has(s.n) ? 'is-read' : ''}`}>
                      <button className="tu-step__head" onClick={() => setOpenStep(openStep === s.n ? null : s.n)}>
                        <span className="tu-step__n">{s.n}</span>
                        <span className="tu-step__t">{s.t}</span>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="tu-step__chev" aria-hidden="true">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                      {openStep === s.n && (
                        <div className="tu-step__body">
                          <p>{s.d}</p>
                          <p className="tu-step__tip">💡 {s.tip}</p>
                          <button className={`tu-step__read ${read.has(s.n) ? 'is-done' : ''}`} onClick={() => toggleRead(s.n)}>
                            {read.has(s.n) ? c.read : c.markRead}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* ── التفعيل والمشاركة ── */}
          <section id="share" className="tu__section">
            <div className="tu__grid2">
              {c.shareCards.map((s, i) => (
                <article key={i} className="tu-mini tu-reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                  <h4>{s.t}</h4>
                  <p>{s.d}</p>
                </article>
              ))}
            </div>
          </section>

          {/* ── إدارة الضيوف ── */}
          <section id="guests" className="tu__section">
            <div className="tu__grid2">
              {c.guestCards.map((s, i) => (
                <article key={i} className="tu-mini tu-mini--navy tu-reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                  <h4>{s.t}</h4>
                  <p>{s.d}</p>
                </article>
              ))}
            </div>
          </section>

          {/* ── الأسئلة الشائعة ── */}
          <section id="faq" className="tu__section">
            {faqs.length === 0 && <p className="tu__empty">{c.empty}</p>}
            {faqs.map((f, i) => (
              <div key={i} className={`tu-faq ${openFaq === i ? 'is-open' : ''} tu-reveal`}>
                <button className="tu-faq__q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{f.q}</span>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
                {openFaq === i && <p className="tu-faq__a">{f.a}</p>}
              </div>
            ))}
          </section>
        </main>
      </div>

      {/* ═══ CTA ═══ */}
      <section className="tu__cta">
        <div className="container tu__cta-box tu-reveal">
          <h2>{c.ctaTitle}</h2>
          <p>{c.ctaSub}</p>
          <button className="tu__cta-btn" onClick={() => navigate('/invitations/create')}>{c.ctaBtn}</button>
        </div>
      </section>

      <Footer />
    </div>
  );
}