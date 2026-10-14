import { useState, useEffect } from 'react';
import { useLanguage } from '../../../../context/LanguageContext';
import { useDesign } from '../../context/DesignContext';
import { updateQRSettings, fetchQRSettings, fetchCheckinStats } from '../../services/designService';
import Switch from '../Switch/Switch';
import QRCodeImage from './QRCode';
import './StageQRCheckin.css';

const COPY = {
  ar: {
    title: 'دخول الضيوف عبر QR',
    desc: 'نظام تحقق احترافي لباب القاعة: رمز QR لكل دعوة، رمز PIN سري للموظف، وسجل دخول حي.',
    toggleLabel: 'تفعيل نظام QR',
    toggleHint: 'يمكن الموظف من مسح رمز الدعوة عند باب القاعة.',
    expectedLabel: 'عدد الضيوف المتوقع',
    expectedPh: '100',
    scanStart: 'بداية وقت المسح (اختياري)',
    scanEnd: 'نهاية وقت المسح (اختياري)',
    pinLabel: 'رمز الموظف (PIN)',
    pinHint: '6 أرقام سرية — تُدخل عند كل مسح. لا تشاركها مع أحد.',
    regenerate: 'توليد رمز جديد',
    qrTitle: 'رمز الدعوة',
    qrHint: 'اطبعه وضعه على البطاقة الورقية أو شاركه رقمياً.',
    qrPending: 'اضغط «حفظ الإعدادات» أولاً لتوليد رمز الدعوة الفريد.',
    download: 'تحميل الرمز كصورة',
    openScan: 'معاينة صفحة المسح',
    statsTitle: 'إحصائيات الحضور (حي)',
    attended: 'حضر',
    of: 'من',
    percentage: 'النسبة',
    recent: 'آخر المسوحات',
    noStats: 'لم يتم تسجيل أي حضور بعد.',
    save: 'حفظ الإعدادات',
    saving: 'جارٍ الحفظ…',
    saved: 'تم الحفظ بنجاح ✓',
    error: 'تعذر الحفظ',
  },
  en: {
    title: 'Guest QR Check-in',
    desc: 'Professional venue check-in system: unique QR per invitation, secret employee PIN, and live attendance log.',
    toggleLabel: 'Enable QR System',
    toggleHint: 'Allows venue staff to scan the invitation QR at the entrance.',
    expectedLabel: 'Expected guest count',
    expectedPh: '100',
    scanStart: 'Scan start time (optional)',
    scanEnd: 'Scan end time (optional)',
    pinLabel: 'Employee PIN',
    pinHint: '6 secret digits — entered at each scan. Never share it.',
    regenerate: 'Generate new',
    qrTitle: 'Invitation QR',
    qrHint: 'Print it on the paper card or share digitally.',
    qrPending: 'Press "Save Settings" first to generate the unique invitation QR.',
    download: 'Download as image',
    openScan: 'Preview scan page',
    statsTitle: 'Live Attendance Stats',
    attended: 'Attended',
    of: 'of',
    percentage: 'Percentage',
    recent: 'Recent scans',
    noStats: 'No attendance recorded yet.',
    save: 'Save Settings',
    saving: 'Saving…',
    saved: 'Saved successfully ✓',
    error: 'Could not save',
  },
};

/** 🔐 الخطوة 17 — دخول الضيوف عبر QR */
export default function StageQRCheckin() {
  const { lang } = useLanguage();
  const { state, ensureId } = useDesign();
  const c = COPY[lang];

  const [settings, setSettings] = useState({
    enabled: false,
    expected_guests: 100,
    scan_start: '',
    scan_end: '',
    employee_pin: '',
    checkin_url: '',
  });
  const [stats, setStats] = useState({ total: 0, expected: 0, percentage: 0, recent: [] });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loaded, setLoaded] = useState(false);

  /* ✅ التحميل الآمن: إن لم توجد دعوة بعد ⇒ نعرض الفورم بقيم افتراضية فوراً */
  useEffect(() => {
    const id = state.meta.invitationId;

    if (!id) {
      setLoaded(true);   // ✅ الإصلاح الجوهري — لا نعلق في الـ Skeleton
      return;
    }

    let cancelled = false;

    Promise.all([fetchQRSettings(id), fetchCheckinStats(id)])
      .then(([s, st]) => {
        if (cancelled) return;
        setSettings({
          enabled: !!s.enabled,
          expected_guests: s.expected_guests || 100,
          scan_start: s.scan_start ? s.scan_start.slice(0, 16) : '',
          scan_end: s.scan_end ? s.scan_end.slice(0, 16) : '',
          employee_pin: s.employee_pin || '',
          checkin_url: s.checkin_url || '',
        });
        setStats(st);
      })
      .catch(() => { /* تجاهل — سيظهر الفورم بقيم افتراضية */ })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    /* تحديث الإحصائيات كل 10 ثوانٍ */
    const interval = setInterval(() => {
      fetchCheckinStats(id)
        .then((st) => { if (!cancelled) setStats(st); })
        .catch(() => {});
    }, 10000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [state.meta.invitationId]);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const id = await ensureId();   // ينشئ المسودة إن لم توجد
      const res = await updateQRSettings(id, {
        enabled: settings.enabled,
        expected_guests: settings.expected_guests,
        scan_start: settings.scan_start || null,
        scan_end: settings.scan_end || null,
        employee_pin: settings.employee_pin,
      });
      setSettings((p) => ({
        ...p,
        employee_pin: res.employee_pin,
        checkin_url: res.checkin_url,
      }));
      const newStats = await fetchCheckinStats(id);
      setStats(newStats);
      setMessage({ type: 'success', text: c.saved });
      setTimeout(() => setMessage({ type: '', text: '' }), 2500);
    } catch {
      setMessage({ type: 'error', text: c.error });
    } finally {
      setSaving(false);
    }
  };

  const handleRegeneratePin = async () => {
    try {
      const id = await ensureId();
      const res = await updateQRSettings(id, { employee_pin: '__regenerate__' });
      setSettings((p) => ({ ...p, employee_pin: res.employee_pin }));
    } catch { /* تجاهل */ }
  };

  const handleDownloadQR = () => {
    const canvas = document.querySelector('.qr-canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `invitation-qr-${state.meta.invitationId || 'new'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const update = (key, value) => setSettings((p) => ({ ...p, [key]: value }));

  if (!loaded) {
    return (
      <section className="qr fp-glass">
        <div className="qr-skel" />
      </section>
    );
  }

  return (
    <section className="qr fp-glass">
      <h2 className="fp-stage__title">{c.title}</h2>
      <p className="fp-stage__desc">{c.desc}</p>

      <Switch
        checked={!!settings.enabled}
        onChange={(v) => update('enabled', v)}
        label={c.toggleLabel}
        hint={c.toggleHint}
      />

      {settings.enabled && (
        <>
          <label className="qr-label">{c.expectedLabel}</label>
          <input
            type="number"
            min={1}
            max={10000}
            className="qr-input"
            value={settings.expected_guests}
            placeholder={c.expectedPh}
            onChange={(e) => update('expected_guests', Math.max(1, Math.min(10000, Number(e.target.value) || 1)))}
          />

          <div className="qr-grid">
            <div>
              <label className="qr-label">{c.scanStart}</label>
              <input
                type="datetime-local"
                className="qr-input"
                value={settings.scan_start}
                onChange={(e) => update('scan_start', e.target.value)}
              />
            </div>
            <div>
              <label className="qr-label">{c.scanEnd}</label>
              <input
                type="datetime-local"
                className="qr-input"
                value={settings.scan_end}
                onChange={(e) => update('scan_end', e.target.value)}
              />
            </div>
          </div>

          <label className="qr-label">{c.pinLabel}</label>
          <p className="qr-hint">{c.pinHint}</p>
          <div className="qr-pin-row">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              className="qr-input qr-input--pin"
              value={settings.employee_pin}
              onChange={(e) => update('employee_pin', e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
            <button type="button" className="qr-regen" onClick={handleRegeneratePin}>
              🔁 {c.regenerate}
            </button>
          </div>

          {/* رمز QR */}
          {settings.checkin_url ? (
            <div className="qr-box">
              <p className="qr-box__title">{c.qrTitle}</p>
              <QRCodeImage url={settings.checkin_url} size={220} />
              <p className="qr-box__hint">{c.qrHint}</p>
              <div className="qr-box__actions">
                <button type="button" className="qr-box__btn" onClick={handleDownloadQR}>
                  ⬇ {c.download}
                </button>
                <a
                  href={settings.checkin_url.replace('/api/', '/').replace('/checkin/', '/scan/')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="qr-box__btn qr-box__btn--link"
                >
                  ↗ {c.openScan}
                </a>
              </div>
            </div>
          ) : (
            <p className="qr-pending">🔐 {c.qrPending}</p>
          )}

          {/* إحصائيات حية */}
          <div className="qr-stats">
            <p className="qr-stats__title">{c.statsTitle}</p>
            <div className="qr-stats__row">
              <div className="qr-stats__cell">
                <span className="qr-stats__num">{stats.total}</span>
                <span className="qr-stats__lbl">{c.attended}</span>
              </div>
              <div className="qr-stats__cell">
                <span className="qr-stats__num">{stats.expected}</span>
                <span className="qr-stats__lbl">{c.of}</span>
              </div>
              <div className="qr-stats__cell">
                <span className="qr-stats__num">{stats.percentage}%</span>
                <span className="qr-stats__lbl">{c.percentage}</span>
              </div>
            </div>
            <div className="qr-stats__bar">
              <span style={{ width: `${Math.min(100, stats.percentage)}%` }} />
            </div>
            {stats.recent.length > 0 ? (
              <ul className="qr-stats__recent">
                {stats.recent.map((r, i) => (
                  <li key={i}>
                    <span>✓ {r.guest_name}</span>
                    <span className="qr-stats__time">
                      {new Date(r.scanned_at).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="qr-stats__empty">{c.noStats}</p>
            )}
          </div>
        </>
      )}

      {message.text && <p className={`qr-message qr-message--${message.type}`}>{message.text}</p>}

      <button type="button" className="qr-save" onClick={handleSave} disabled={saving}>
        {saving ? c.saving : c.save}
      </button>
    </section>
  );
}