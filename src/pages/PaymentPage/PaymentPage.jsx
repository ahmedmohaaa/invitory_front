import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import Navbar from '../../components/Navbar/Navbar';
import ProgressStepper from '../../components/ProgressStepper/ProgressStepper';
import { fetchDesign } from '../DesignPage/services/designService';
import { fetchShareData } from '../../services/share';
import { startCheckout, mockPay } from '../../services/checkout';
import api from '../../services/api';
import './PaymentPage.css';

/* 🛡️ باقات احتياطية إن فشل جلب الباقات من الباك إند */
const PLANS = [
  {
    key: 'basic', price: 299,
    ar: { name: 'الأساسية', feats: ['دعوة تفاعلية واحدة', 'معرض 50 صورة وفيديو', 'تأكيد حضور عبر QR', 'تقويم وعدّاد تنازلي'] },
    en: { name: 'Basic', feats: ['One interactive invitation', '50-photo gallery', 'QR check-in', 'Calendar & countdown'] },
  },
  {
    key: 'premium', price: 499, popular: true,
    ar: { name: 'البريميوم', feats: ['كل مزايا الأساسية', 'معرض غير محدود', 'موسيقى وخلفيات حصرية', 'غرفة ذكريات الضيوف', 'بدون علامة مائية'] },
    en: { name: 'Premium', feats: ['Everything in Basic', 'Unlimited gallery', 'Exclusive music & backgrounds', 'Guest memories room', 'No watermark'] },
  },
  {
    key: 'royal', price: 799,
    ar: { name: 'الملكية', feats: ['كل مزايا البريميوم', 'قالب مصمم خصيصاً لك', 'دعم أولوية 24/7', 'رابط نطاق خاص بدعوتك'] },
    en: { name: 'Royal', feats: ['Everything in Premium', 'Custom-designed template', 'Priority 24/7 support', 'Custom domain link'] },
  },
];

/* 🔀 خريطة طرق الدفع → قيم موديل Payment.MethodChoices */
const METHOD_MAP = { card: 'VISA', apple: 'WALLET', stc: 'WALLET' };

const COPY = {
  ar: {
    title: 'اختر باقتك وأكمل دعوتك',
    sub: 'دفع آمن عبر PayTabs — بطاقة مدى/فيزا/ماستركارد أو Apple Pay.',
    popular: 'الأكثر اختياراً',
    select: 'اختيار', selected: 'مختارة ✓',
    summary: 'ملخص الطلب',
    invitation: 'الدعوة', plan: 'الباقة', total: 'الإجمالي',
    currency: 'ج.م',
    method: 'طريقة الدفع',
    mCard: 'بطاقة (فيزا/مدى)', mApple: 'Apple Pay', mStc: 'STC Pay',
    pay: 'ادفع الآن بأمان', paying: 'جارٍ معالجة الدفع…',
    secure: 'معاملتك مشفرة ومعتمدة — لا نُخزن بيانات بطاقتك إطلاقاً.',
    mockHint: '🧪 بيئة تجريبية آمنة: لن يُخصم أي مبلغ حقيقي الآن.',
    successTitle: 'تم الدفع بنجاح 🎉',
    successSub: 'دعوتك الآن فعّالة بالكامل وبدون علامة مائية.',
    openInvitation: 'فتح دعوتي', myInvitations: 'لوحة دعواتي',
    failedTitle: 'لم تكتمل عملية الدفع',
    failedSub: 'يمكنك المحاولة مجدداً — لن يُخصم أي مبلغ.',
    retry: 'إعادة المحاولة',
    error: 'تعذر إنشاء عملية الدفع، حاول مجدداً.',
    noPackages: 'تعذر تحميل الباقات — حدّث الصفحة وحاول مجدداً.',
  },
  en: {
    title: 'Pick your plan & finish your invitation',
    sub: 'Secure payment via PayTabs — mada / Visa / Mastercard / Apple Pay.',
    popular: 'Most popular',
    select: 'Select', selected: 'Selected ✓',
    summary: 'Order summary',
    invitation: 'Invitation', plan: 'Plan', total: 'Total',
    currency: 'EGP',
    method: 'Payment method',
    mCard: 'Card (Visa/mada)', mApple: 'Apple Pay', mStc: 'STC Pay',
    pay: 'Pay securely now', paying: 'Processing payment…',
    secure: 'Your transaction is encrypted — we never store card data.',
    mockHint: '🧪 Safe test environment: no real charge will occur now.',
    successTitle: 'Payment successful 🎉',
    successSub: 'Your invitation is fully active and watermark-free.',
    openInvitation: 'Open my invitation', myInvitations: 'My invitations',
    failedTitle: 'Payment not completed',
    failedSub: 'You can try again — no charge was made.',
    retry: 'Try again',
    error: 'Could not create the payment, please retry.',
    noPackages: 'Could not load packages — refresh and retry.',
  },
};

/* تفصيل وصف الباقة إلى قائمة مزايا إن وُجد */
const splitDesc = (desc) => {
  if (!desc || typeof desc !== 'string') return null;
  const parts = desc.split(/[\n•|]/).map((s) => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts : null;
};

/* توحيد شكل الباقات القادمة من الباك إند */
const normPackages = (list) => list.map((p, i) => {
  const code = String(p.code || p.slug || '').toLowerCase();
  const fb = PLANS.find((x) => x.key === code) || PLANS[i] || PLANS[1];
  const featsAr = splitDesc(p.description_ar || p.description);
  const featsEn = splitDesc(p.description_en || p.description);
  return {
    key: code || fb.key,
    id: p.id,
    price: Number(p.price ?? fb.price),
    popular: !!(p.is_featured || p.popular || fb.popular),
    ar: { name: p.name_ar || p.name || fb.ar.name, feats: featsAr || fb.ar.feats },
    en: { name: p.name_en || p.name || fb.en.name, feats: featsEn || fb.en.feats },
  };
});

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { lang } = useLanguage();
  const c = COPY[lang];

  const [meta, setMeta] = useState(null);
  const [plans, setPlans] = useState(PLANS);
  const [planKey, setPlanKey] = useState('premium');
  const [method, setMethod] = useState('card');
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [shareLink, setShareLink] = useState('');

  const urlStatus = params.get('status');

  /* بيانات الدعوة */
  useEffect(() => {
    fetchDesign(id)
      .then((res) => setMeta({ title: res.title, paid: res.payment_status === 'PAID' }))
      .catch(() => setMeta({ title: '', paid: false }));
  }, [id]);

  /* 📥 جلب الباقات الحقيقية + استعادة الاختيار المحفوظ */
  useEffect(() => {
    api.get('/packages/', { params: { is_active: 'true', page_size: '20' } })
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : (r.data.results || []);
        if (list.length) {
          const norm = normPackages(list);
          setPlans(norm);
          const savedId = localStorage.getItem('invitory_selected_package_id');
          const savedCode = localStorage.getItem('invitory_selected_plan');
          const match = norm.find((p) => String(p.id) === savedId) || norm.find((p) => p.key === savedCode);
          if (match) setPlanKey(match.key);
          else if (!norm.find((p) => p.key === planKey)) setPlanKey((norm.find((p) => p.popular) || norm[0]).key);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* جلب الرابط العام النهائي بعد الدفع */
  useEffect(() => {
    if (urlStatus === 'paid' || meta?.paid) {
      fetchShareData(id).then((d) => setShareLink(d.share_link)).catch(() => {});
    }
  }, [id, urlStatus, meta?.paid]);

  /* نقل تلقائي لصفحة المشاركة بعد نجاح الدفع */
  useEffect(() => {
    if (urlStatus === 'paid') {
      const t = setTimeout(() => navigate(`/share/${id}`, { replace: true }), 1600);
      return () => clearTimeout(t);
    }
  }, [urlStatus, id, navigate]);

  const current = plans.find((p) => p.key === planKey) || plans.find((p) => p.popular) || plans[0];
  const L = lang === 'ar' ? current.ar : current.en;
  const isPaid = urlStatus === 'paid' || meta?.paid;
  const isFailed = urlStatus === 'failed';

  /* 💳 تنفيذ الدفع عبر النظام الجديد */
  const handlePay = async () => {
    if (!current?.id) { setError(c.noPackages); return; }
    setPaying(true); setError('');
    try {
      const session = await startCheckout({
        invitationId: Number(id),
        packageId: current.id,
        method: METHOD_MAP[method] || 'VISA',
      });
      const result = await mockPay(session.tran_ref);
      if (result.ok) {
        localStorage.removeItem('invitory_selected_plan');
        localStorage.removeItem('invitory_selected_package_id');
        navigate(`/payment/${id}?status=paid`);
      } else {
        navigate(`/payment/${id}?status=failed`);
      }
    } catch {
      setError(c.error);
      setPaying(false);
    }
  };

  return (
    <div className="paypage">
      <Navbar />
      <ProgressStepper current="payment" />

      {isPaid ? (
        <div className="pay-done">
          <span className="pay-done__ring" aria-hidden="true">
            <svg viewBox="0 0 52 52" width="64" height="64"><circle cx="26" cy="26" r="24" fill="none" /><path fill="none" d="M14 27l8 8 16-16" /></svg>
          </span>
          <h1>{c.successTitle}</h1>
          <p>{c.successSub}</p>
          <div className="pay-done__actions">
            <button className="pay-done__btn pay-done__btn--gold" onClick={() => navigate(`/share/${id}`)}>
              🚀 {lang === 'ar' ? 'مشاركة الدعوة ودعوة الضيوف' : 'Share & invite guests'}
            </button>
            {shareLink && (
              <button className="pay-done__btn" onClick={() => window.open(shareLink, '_blank')}>
                👁 {lang === 'ar' ? 'رؤية الدعوة كما يراها الضيوف' : 'View as guests see it'}
              </button>
            )}
            <button className="pay-done__btn" onClick={() => navigate('/my-invitations')}>
              {lang === 'ar' ? 'لوحة دعواتي' : 'My invitations'}
            </button>
          </div>
          {urlStatus === 'paid' && (
            <p className="pay-done__redirect">
              {lang === 'ar' ? 'جارٍ نقلك تلقائياً لصفحة المشاركة…' : 'Taking you to the share page…'}
            </p>
          )}
        </div>
      ) : (
        <div className="paypage__grid container">
          {/* الباقات */}
          <section className="paypage__plans">
            <h1>{c.title}</h1>
            <p className="paypage__sub">{c.sub}</p>

            {isFailed && (
              <div className="pay-failed">
                <strong>{c.failedTitle}</strong>
                <span>{c.failedSub}</span>
                <button onClick={() => navigate(`/payment/${id}`)}>{c.retry}</button>
              </div>
            )}

            <div className="payplans">
              {plans.map((p) => {
                const pl = lang === 'ar' ? p.ar : p.en;
                return (
                  <button
                    key={p.key}
                    type="button"
                    className={`payplan ${planKey === p.key ? 'is-active' : ''} ${p.popular ? 'is-popular' : ''}`}
                    onClick={() => setPlanKey(p.key)}
                  >
                    {p.popular && <span className="payplan__flag">{c.popular}</span>}
                    <strong className="payplan__name">{pl.name}</strong>
                    <span className="payplan__price">{p.price}<i>{c.currency}</i></span>
                    <ul className="payplan__feats">
                      {pl.feats.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                    <span className="payplan__pick">{planKey === p.key ? c.selected : c.select}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* الملخص والدفع */}
          <aside className="paypage__summary">
            <div className="paysum">
              <p className="paysum__title">{c.summary}</p>
              <div className="paysum__row"><span>{c.invitation}</span><strong>{meta?.title || '…'}</strong></div>
              <div className="paysum__row"><span>{c.plan}</span><strong>{L.name}</strong></div>
              <div className="paysum__row paysum__row--total"><span>{c.total}</span><strong>{current.price} {c.currency}</strong></div>

              {/* 💳 طريقة الدفع */}
              <p className="paysum__method-title">{c.method}</p>
              <div className="paysum__methods">
                {[
                  { id: 'card', label: c.mCard },
                  { id: 'apple', label: c.mApple },
                  { id: 'stc', label: c.mStc },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`paymethod ${method === m.id ? 'is-active' : ''}`}
                    onClick={() => setMethod(m.id)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <button type="button" className="paysum__pay" onClick={handlePay} disabled={paying}>
                {paying ? c.paying : c.pay}
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 018 0v3" />
                </svg>
              </button>

              <p className="paysum__secure">🔒 {c.secure}</p>
              <div className="paysum__badges"><span>PayTabs</span><span>PCI-DSS</span><span>SSL 256-bit</span></div>
              <p className="paysum__mock">{c.mockHint}</p>
              {error && <p className="paysum__error">{error}</p>}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}