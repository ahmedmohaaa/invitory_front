import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import { useLanguage } from '../../context/LanguageContext';
import Navbar from '../../components/Navbar/Navbar';
import ProgressStepper from '../../components/ProgressStepper/ProgressStepper';
import { fetchShareData, regenerateSlug } from '../../services/share';
import './SharePage.css';

const COPY = {
  ar: {
    title: '🎉 تم تفعيل دعوتك بنجاح!',
    sub: 'دعوتك الآن نشطة ومباشرة. دعنا نبدأ في دعوة ضيوفك.',
    linkTitle: 'رابط دعوتك',
    linkHint: 'شاركه مع أي شخص ليفتح الدعوة مباشرة',
    copy: 'نسخ الرابط', copied: 'تم النسخ ✓',
    shareTitle: 'شارك مع الجميع',
    qr: 'رمز QR للطباعة',
    qrHint: 'حمّله كصورة واطبعه على بطاقة أو هدية',
    qrDownload: 'تحميل كصورة',
    regen: 'توليد رابط جديد',
    stats: 'متابعة ردود الضيوف',
    statsHint: 'تابع من أكد الحضور لحظياً من لوحة التحكم',
    attending: 'حاضر', declining: 'لن يحضر', total: 'إجمالي الضيوف',
    gotoDashboard: 'الذهاب للوحة التحكم',
    preview: 'رؤية الدعوة كما يراها الضيوف',
    edit: 'تعديل الدعوة',
    locked: 'التعديل مقفل حالياً (منعاً للتغيير بعد إرسال الدعوات)',
    notPaid: 'هذه الصفحة متاحة بعد الدفع فقط',
  },
  en: {
    title: '🎉 Your invitation is live!',
    sub: "Your invitation is active and ready to share. Let's start inviting your guests.",
    linkTitle: 'Your invitation link',
    linkHint: 'Share it with anyone — they open the invitation instantly',
    copy: 'Copy link', copied: 'Copied ✓',
    shareTitle: 'Share with everyone',
    qr: 'QR for print',
    qrHint: 'Download and print it on a card or gift',
    qrDownload: 'Download image',
    regen: 'Generate new link',
    stats: 'Track guest responses',
    statsHint: 'See who confirmed live from your dashboard',
    attending: 'Attending', declining: 'Declining', total: 'Total guests',
    gotoDashboard: 'Go to Dashboard',
    preview: 'Preview as guests see it',
    edit: 'Edit invitation',
    locked: 'Editing locked (to avoid changes after invites are sent)',
    notPaid: 'This page is available after payment only',
  },
};

export default function SharePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const c = COPY[lang];

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notPaid, setNotPaid] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const canvasRef = useRef(null);
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    fetchShareData(id)
      .then((d) => {
        setData(d);
        // توليد QR عالي الدقة
        QRCode.toDataURL(d.share_link, {
          width: 520, margin: 2, errorCorrectionLevel: 'H',
          color: { dark: '#14294B', light: '#FFFFFF' },
        }).then(setQrDataUrl).catch(() => {});
      })
      .catch((err) => {
        if (err?.response?.status === 403) {
          setNotPaid(true);
        } else {
          setNotPaid(true);
        }
      })
      .finally(() => setLoading(false));

    // 🎊 Confetti لحظة الدخول
    const pieces = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * .6,
      dur: 2.4 + Math.random() * 1.2,
      rot: Math.random() * 360,
      color: ['#c6a15b', '#14294b', '#e6ce9c', '#b33636', '#2f9e5f'][i % 5],
    }));
    setConfetti(pieces);
  }, [id]);

  const handleCopy = async () => {
    if (!data?.share_link) return;
    try {
      await navigator.clipboard.writeText(data.share_link);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = data.share_link;
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegen = async () => {
    if (!confirm(lang === 'ar' ? 'الرابط الحالي سيتوقف عن العمل. هل أنت متأكد؟' : 'Current link will stop working. Sure?')) return;
    try {
      const res = await regenerateSlug(id);
      setData((prev) => ({ ...prev, share_link: res.share_link, share_slug: res.share_slug }));
    } catch { /* تجاهل */ }
  };

  const handleQRDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${data?.share_slug || 'invitation'}-qr.png`;
    a.click();
  };

  if (loading) {
    return (
      <div className="sharepage">
        <Navbar />
        <ProgressStepper current="share" />
        <div className="sharepage__loading">
          <span /><span /><span />
        </div>
      </div>
    );
  }

  if (notPaid) {
    return (
      <div className="sharepage">
        <Navbar />
        <ProgressStepper current="share" />
        <div className="sharepage__block">
          <p className="sharepage__block-ic">🔒</p>
          <p className="sharepage__block-txt">{c.notPaid}</p>
          <button className="sharepage__block-btn" onClick={() => navigate(`/payment/${id}`)}>
            {lang === 'ar' ? 'الذهاب للدفع' : 'Go to payment'}
          </button>
        </div>
      </div>
    );
  }

  const stats = data?.stats || { attending: 0, declining: 0, total_guests: 0 };

  return (
    <div className="sharepage">
      <Navbar />
      <ProgressStepper current="share" />

      {/* 🎊 Confetti */}
      <div className="confetti" aria-hidden="true">
        {confetti.map((p) => (
          <span
            key={p.id}
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
              transform: `rotate(${p.rot}deg)`,
              background: p.color,
            }}
          />
        ))}
      </div>

      <div className="container sharepage__body">
        {/* 1. رسالة النجاح */}
        <div className="sharepage__hero">
          <span className="sharepage__ring" aria-hidden="true">
            <svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="36" /><path d="M24 42l10 10 22-22" /></svg>
          </span>
          <h1>{c.title}</h1>
          <p>{c.sub}</p>
        </div>

        {/* 2. الرابط الفريد */}
        <div className="sharepage__link">
          <div className="sharepage__link-head">
            <span className="sharepage__link-ic">🔗</span>
            <div>
              <p className="sharepage__link-title">{c.linkTitle}</p>
              <p className="sharepage__link-hint">{c.linkHint}</p>
            </div>
          </div>
          <div className="sharepage__link-box">
            <input type="text" readOnly value={data.share_link} dir="ltr" />
            <button className={`sharepage__copy ${copied ? 'is-done' : ''}`} onClick={handleCopy}>
              {copied ? c.copied : c.copy}
              {!copied && (
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              )}
              {copied && (
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 3. أزرار المشاركة + QR */}
        <div className="sharepage__grid">
          <div className="sharepage__social">
            <h3>🚀 {c.shareTitle}</h3>
            <div className="sharepage__social-btns">
              <a className="ssbtn ssbtn--wa" href={data.social.whatsapp} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
              <a className="ssbtn ssbtn--tg" href={data.social.telegram} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                  <path d="M21.5 4.5L2.5 12l6 2 2 7 3-4 5 4 3-15zm-5 3L8 14l-.5 3 2-3 6.5 3.5L16.5 7.5z" />
                </svg>
                Telegram
              </a>
              <a className="ssbtn ssbtn--fb" href={data.social.messenger} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                  <path d="M12 2a10 10 0 00-10 10c0 1.85.5 3.58 1.37 5.07L2 22l5.07-1.34A9.95 9.95 0 0012 22a10 10 0 0010-10A10 10 0 0012 2zm5.5 7.5l-2.9 4.6a1.5 1.5 0 01-2.2.3l-2.1-1.6a.8.8 0 00-1 0l-2.8 2.2c-.2.1-.4-.2-.2-.4l2.9-4.6a1.5 1.5 0 012.2-.3l2.1 1.6a.8.8 0 001 0l2.8-2.2c.2-.1.4.2.2.4z" />
                </svg>
                Messenger
              </a>
              <a className="ssbtn ssbtn--sms" href={data.social.sms}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                SMS
              </a>
              <a className="ssbtn ssbtn--mail" href={data.social.email}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" />
                </svg>
                Email
              </a>
            </div>

            <div className="sharepage__regen">
              <button type="button" className="sharepage__regen-btn" onClick={handleRegen}>
                🔁 {c.regen}
              </button>
              <p>{lang === 'ar' ? 'استخدمه فقط قبل إرسال الدعوات' : 'Use only before sending invitations'}</p>
            </div>
          </div>

          {/* 4. QR Code */}
          <div className="sharepage__qr">
            <h3>🖨️ {c.qr}</h3>
            <p>{c.qrHint}</p>
            <div className="sharepage__qr-frame">
              {qrDataUrl && <img src={qrDataUrl} alt="QR Code" />}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
            <button className="sharepage__qr-dl" onClick={handleQRDownload}>
              ⬇ {c.qrDownload}
            </button>
          </div>
        </div>

        {/* 5. إدارة الضيوف */}
        <div className="sharepage__stats">
          <div className="sharepage__stats-copy">
            <h3>📊 {c.stats}</h3>
            <p>{c.statsHint}</p>
<button className="sharepage__stats-btn" onClick={() => navigate(`/dashboard/${id}`)}>              {c.gotoDashboard}
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
          <div className="sharepage__stats-grid">
            <div className="spstat">
              <span className="spstat__num spstat--yes">{stats.attending}</span>
              <span className="spstat__lbl">{c.attending}</span>
            </div>
            <div className="spstat">
              <span className="spstat__num spstat--no">{stats.declining}</span>
              <span className="spstat__lbl">{c.declining}</span>
            </div>
            <div className="spstat">
              <span className="spstat__num spstat--total">{stats.total_guests}</span>
              <span className="spstat__lbl">{c.total}</span>
            </div>
          </div>
        </div>

        {/* 6. إجراءات إضافية */}
        {/* 6. إجراءات إضافية */}
        <div className="sharepage__secondary">
          {/* 👁 الوضع النهائي الحقيقي للضيوف (الرابط العام) */}
          <button className="sharepage__sec-btn" onClick={() => window.open(data.share_link, '_blank')}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            {c.preview}
          </button>

          {/* معاينة المالك داخل لوحة التحكم */}
          <button className="sharepage__sec-btn" onClick={() => navigate(`/invitation/${id}`)}>
            {lang === 'ar' ? 'معاينة داخل لوحة التحكم' : 'Owner preview'}
          </button>

          {/* ✏️ تعديل الدعوة (مشروط) */}
          <button
            className={`sharepage__sec-btn ${!data.edit_allowed ? 'is-locked' : ''}`}
            onClick={() => data.edit_allowed ? navigate(`/invitations/${id}/edit`) : null}
            disabled={!data.edit_allowed}
            title={!data.edit_allowed ? c.locked : ''}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {!data.edit_allowed ? (
                <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></>
              ) : (
                <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></>
              )}
            </svg>
            {c.edit}
            {!data.edit_allowed && <span className="sharepage__sec-lock">· {c.locked}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

