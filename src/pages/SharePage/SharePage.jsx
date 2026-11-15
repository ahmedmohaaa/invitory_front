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

// ✅ دالة مساعدة لتحديد الدومين الصحيح
const getBaseUrl = () => {
  if (import.meta.env.VITE_BASE_URL) {
    return import.meta.env.VITE_BASE_URL;
  }
  if (window.location.hostname.includes('vercel.app')) {
    return window.location.origin;
  }
  if (window.location.hostname === 'www.invitory.net' || 
      window.location.hostname === 'invitory.net') {
    return 'https://www.invitory.net';
  }
  return 'https://www.invitory.net';
};

// ✅ دالة لتنظيف الرابط (تحويل localhost إلى الدومين الصحيح)
const cleanShareLink = (link) => {
  if (!link) return '';
  if (link.includes('localhost') || link.includes('127.0.0.1')) {
    return link.replace(/^https?:\/\/[^/]+/, getBaseUrl());
  }
  return link;
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

  // ✅ useEffect الأصلي المصحح — يجلب البيانات وينظف الرابط
  useEffect(() => {
    fetchShareData(id)
      .then((d) => {
        // ✅ تنظيف الرابط إذا كان localhost
        const cleanData = {
          ...d,
          share_link: cleanShareLink(d.share_link),
        };
        
        setData(cleanData);
        
        // توليد QR من الرابط النظيف
        QRCode.toDataURL(cleanData.share_link, {
          width: 520, margin: 2, errorCorrectionLevel: 'H',
          color: { dark: '#22aaff', light: '#FFFFFF' },
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
      color: ['#22aaff', '#66ccff', '#00ff88', '#ff6688', '#ffcc00'][i % 5],
    }));
    setConfetti(pieces);
  }, [id]);

  const handleCopy = async () => {
    if (!data?.share_link) return;
    try {
      await navigator.clipboard.writeText(data.share_link);
    } catch {
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
      setData((prev) => ({ 
        ...prev, 
        share_link: cleanShareLink(res.share_link), 
        share_slug: res.share_slug 
      }));
      // إعادة توليد QR
      QRCode.toDataURL(cleanShareLink(res.share_link), {
        width: 520, margin: 2, errorCorrectionLevel: 'H',
        color: { dark: '#22aaff', light: '#FFFFFF' },
      }).then(setQrDataUrl).catch(() => {});
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
        <div className="sharepage__hero">
          <span className="sharepage__ring" aria-hidden="true">
            <svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="36" /><path d="M24 42l10 10 22-22" /></svg>
          </span>
          <h1>{c.title}</h1>
          <p>{c.sub}</p>
        </div>

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

        <div className="sharepage__grid">
          <div className="sharepage__social">
            <h3>🚀 {c.shareTitle}</h3>
            <div className="sharepage__social-btns">
              <a className="ssbtn ssbtn--wa" href={data.social?.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              <a className="ssbtn ssbtn--tg" href={data.social?.telegram} target="_blank" rel="noopener noreferrer">Telegram</a>
              <a className="ssbtn ssbtn--fb" href={data.social?.messenger} target="_blank" rel="noopener noreferrer">Messenger</a>
              <a className="ssbtn ssbtn--sms" href={data.social?.sms}>SMS</a>
              <a className="ssbtn ssbtn--mail" href={data.social?.email}>Email</a>
            </div>

            <div className="sharepage__regen">
              <button type="button" className="sharepage__regen-btn" onClick={handleRegen}>
                🔁 {c.regen}
              </button>
              <p>{lang === 'ar' ? 'استخدمه فقط قبل إرسال الدعوات' : 'Use only before sending invitations'}</p>
            </div>
          </div>

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

        <div className="sharepage__stats">
          <div className="sharepage__stats-copy">
            <h3>📊 {c.stats}</h3>
            <p>{c.statsHint}</p>
            <button className="sharepage__stats-btn" onClick={() => navigate(`/dashboard/${id}`)}>
              {c.gotoDashboard}
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

        <div className="sharepage__secondary">
          <button className="sharepage__sec-btn" onClick={() => window.open(data.share_link, '_blank')}>
            {c.preview}
          </button>
          <button className="sharepage__sec-btn" onClick={() => navigate(`/invitation/${id}`)}>
            {lang === 'ar' ? 'معاينة داخل لوحة التحكم' : 'Owner preview'}
          </button>
          <button
            className={`sharepage__sec-btn ${!data.edit_allowed ? 'is-locked' : ''}`}
            onClick={() => data.edit_allowed ? navigate(`/invitations/${id}/edit`) : null}
            disabled={!data.edit_allowed}
            title={!data.edit_allowed ? c.locked : ''}
          >
            {c.edit}
            {!data.edit_allowed && <span className="sharepage__sec-lock">· {c.locked}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
