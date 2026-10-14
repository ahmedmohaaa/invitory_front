import { useState, useEffect } from 'react';
import { useLanguage } from '../../../../context/LanguageContext';
import { useDesign } from '../../context/DesignContext';
import { updateRSVPSettings, fetchRSVPSettings, fetchRSVPStats } from '../../services/designService';
import Switch from '../Switch/Switch';
import './StageRSVPSettings.css';

const COPY = {
  ar: {
    title: 'إعدادات تأكيد الحضور RSVP',
    desc: 'تحكم في حقول نموذج تأكيد الحضور الذي يراه ضيوفك، وتابع الاستجابات لحظياً.',
    t1: 'حقل الحضور (سأحضر / لن أتمكن)',
    h1: 'عند الإيقاف يُسجَّل الضيف كحاضر تلقائياً بدون اختيار.',
    t2: 'حقل عدد الضيوف المرافقين',
    h2: 'يسمح للضيف بتحديد عدد مرافقيه (حتى 50).',
    t3: 'حقل التهاني / الرسالة',
    h3: 'يستقبل رسائل تهنئة نصية من الضيوف (حتى 500 حرف).',
    t4: 'عرض عدّاد الحضور المباشر',
    h4: 'يظهر للضيوف إجمالي الضيوف المؤكدين داخل نموذج RSVP.',
    formPreview: 'معاينة نموذج الضيف',
    fName: 'الاسم',
    fAttend: 'الحضور',
    fYes: 'سأحضر',
    fNo: 'لن أتمكن من الحضور',
    fGuests: 'عدد الضيوف المرافقين',
    fMsg: 'اكتب تهانيك',
    statsTitle: 'إحصائيات الاستجابات (حي)',
    sAttending: 'سيحضر',
    sDeclining: 'لن يحضر',
    sGuests: 'إجمالي الضيوف',
    sMessages: 'رسائل',
    recent: 'آخر الاستجابات',
    noRecent: 'لا توجد استجابات بعد.',
    save: 'حفظ الإعدادات',
    saving: 'جارٍ الحفظ…',
    saved: 'تم الحفظ بنجاح ✓',
    error: 'تعذر الحفظ',
  },
  en: {
    title: 'RSVP Form Settings',
    desc: 'Control which fields your guests see in the RSVP form, and track responses live.',
    t1: 'Attendance field (Will attend / Cannot)',
    h1: 'When off, guests are recorded as attending automatically.',
    t2: 'Accompanying guests count field',
    h2: 'Lets the guest specify companions (up to 50).',
    t3: 'Congratulation / message field',
    h3: 'Collects text wishes from guests (up to 500 chars).',
    t4: 'Show live attendance counter',
    h4: 'Displays total confirmed guests inside the RSVP form.',
    formPreview: 'Guest form preview',
    fName: 'Name',
    fAttend: 'Attendance',
    fYes: 'I will attend',
    fNo: "I won't be able to attend",
    fGuests: 'Accompanying guests',
    fMsg: 'Write your wishes',
    statsTitle: 'Live Response Stats',
    sAttending: 'Attending',
    sDeclining: 'Declining',
    sGuests: 'Total guests',
    sMessages: 'Messages',
    recent: 'Recent responses',
    noRecent: 'No responses yet.',
    save: 'Save Settings',
    saving: 'Saving…',
    saved: 'Saved successfully ✓',
    error: 'Could not save',
  },
};

/** 💌 الخطوة 18 — إعدادات تأكيد الحضور RSVP */
export default function StageRSVPSettings() {
  const { lang } = useLanguage();
  const { state, ensureId, update: updateContext } = useDesign();   // ✅ إضافة updateContext للمزامنة الحية
  const c = COPY[lang];

  const [settings, setSettings] = useState({
    show_attendance: true,
    show_guests_count: true,
    show_message: true,
    show_live_counter: false,
  });
  const [stats, setStats] = useState({ attending: 0, declining: 0, total_guests: 0, messages: 0, recent: [] });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = state.meta.invitationId;
    if (!id) { setLoaded(true); return; }

    let cancelled = false;
    Promise.all([fetchRSVPSettings(id), fetchRSVPStats(id)])
      .then(([s, st]) => {
        if (cancelled) return;
        setSettings({
          show_attendance: s.show_attendance !== false,
          show_guests_count: s.show_guests_count !== false,
          show_message: s.show_message !== false,
          show_live_counter: !!s.show_live_counter,
        });
        setStats(st);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoaded(true); });

    const interval = setInterval(() => {
      fetchRSVPStats(id).then((st) => { if (!cancelled) setStats(st); }).catch(() => {});
    }, 10000);

    return () => { cancelled = true; clearInterval(interval); };
  }, [state.meta.invitationId]);

  const update = (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);                              // 1️⃣ واجهة الفورم المحلية
    updateContext(`rsvp.${key}`, value);            // 2️⃣ الحالة المشتركة ⇒ المعاينة تختفي/تظهر فوراً
    ensureId()                                      // 3️⃣ مزامنة فورية مع الباك إند (بدون انتظار زر حفظ)
      .then((id) => updateRSVPSettings(id, next))
      .then((res) => {
        if (res?.live_count !== undefined) updateContext('rsvp.live_count', res.live_count);
        if (res?.public_token) updateContext('rsvp.public_token', res.public_token);
      })
      .catch(() => {});
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const id = await ensureId();
      await updateRSVPSettings(id, settings);
      const st = await fetchRSVPStats(id);
      setStats(st);
      setMessage({ type: 'success', text: c.saved });
      setTimeout(() => setMessage({ type: '', text: '' }), 2500);
    } catch {
      setMessage({ type: 'error', text: c.error });
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <section className="rs fp-glass">
        <div className="rs-skel" />
      </section>
    );
  }

  return (
    <section className="rs fp-glass">
      <h2 className="fp-stage__title">{c.title}</h2>
      <p className="fp-stage__desc">{c.desc}</p>

      <Switch checked={!!settings.show_attendance} onChange={(v) => update('show_attendance', v)} label={c.t1} hint={c.h1} />
      <Switch checked={!!settings.show_guests_count} onChange={(v) => update('show_guests_count', v)} label={c.t2} hint={c.h2} />
      <Switch checked={!!settings.show_message} onChange={(v) => update('show_message', v)} label={c.t3} hint={c.h3} />
      <Switch checked={!!settings.show_live_counter} onChange={(v) => update('show_live_counter', v)} label={c.t4} hint={c.h4} />

      {/* 👁️ معاينة حية لنموذج الضيف */}
      <div className="rs-preview">
        <p className="rs-preview__title">👁️ {c.formPreview}</p>
        <div className="rs-preview__field">{c.fName}</div>
        {settings.show_attendance && (
          <div className="rs-preview__field rs-preview__field--row">
            <span>{c.fYes}</span><span className="rs-preview__sep">/</span><span>{c.fNo}</span>
          </div>
        )}
        {settings.show_guests_count && <div className="rs-preview__field">{c.fGuests}</div>}
        {settings.show_message && <div className="rs-preview__field rs-preview__field--tall">{c.fMsg}</div>}
        {settings.show_live_counter && (
          <div className="rs-preview__live">🎉 {stats.total_guests}</div>
        )}
      </div>

      {/* 📊 الإحصائيات الحية */}
      <div className="rs-stats">
        <p className="rs-stats__title">{c.statsTitle}</p>
        <div className="rs-stats__row">
          <div className="rs-stats__cell rs-stats__cell--yes">
            <span className="rs-stats__num">{stats.attending}</span>
            <span className="rs-stats__lbl">{c.sAttending}</span>
          </div>
          <div className="rs-stats__cell rs-stats__cell--no">
            <span className="rs-stats__num">{stats.declining}</span>
            <span className="rs-stats__lbl">{c.sDeclining}</span>
          </div>
          <div className="rs-stats__cell">
            <span className="rs-stats__num">{stats.total_guests}</span>
            <span className="rs-stats__lbl">{c.sGuests}</span>
          </div>
          <div className="rs-stats__cell">
            <span className="rs-stats__num">{stats.messages}</span>
            <span className="rs-stats__lbl">{c.sMessages}</span>
          </div>
        </div>
        {stats.recent?.length > 0 ? (
          <ul className="rs-stats__recent">
            {stats.recent.map((r, i) => (
              <li key={i}>
                <span className={r.attending ? 'rs-dot rs-dot--yes' : 'rs-dot rs-dot--no'} />
                <span className="rs-stats__name">{r.guest_name}</span>
                {r.message && <span className="rs-stats__msg">“{r.message}”</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rs-stats__empty">{c.noRecent}</p>
        )}
      </div>

      {message.text && <p className={`rs-message rs-message--${message.type}`}>{message.text}</p>}

      <button type="button" className="rs-save" onClick={handleSave} disabled={saving}>
        {saving ? c.saving : c.save}
      </button>
    </section>
  );
}

