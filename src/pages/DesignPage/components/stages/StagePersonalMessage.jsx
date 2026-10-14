import { useLanguage } from '../../../../context/LanguageContext';
import { useDesign } from '../../context/DesignContext';
import './StagePersonalMessage.css';

const COPY = {
  ar: {
    title: 'رسالة شخصية',
    desc: 'اكتب رسالة من القلب لضيوفك — تظهر بخط أنيق فوق معرض الصور في الصفحة الرابعة من الدعوة.',
    titleLabel: 'عنوان الرسالة',
    titlePh: 'مثال: كلمات من القلب',
    bodyLabel: 'نص الرسالة',
    bodyPh: 'مثال: أحببنا أن نشارككم فرحتنا في هذا اليوم المميز، وأن نشكركم على محبتكم ودعمكم الدائم...',
    sigLabel: 'التوقيع',
    sigPh: 'مثال: أحمد & سارة',
    previewNote: 'تظهر الرسالة فوق معرض الصور في الصفحة الرابعة بخط العنوان ولون التمييز.',
  },
  en: {
    title: 'Personal Message',
    desc: 'Write a heartfelt message for your guests — displayed in elegant typography above the photo gallery on page four.',
    titleLabel: 'Message title',
    titlePh: 'e.g. Words from the heart',
    bodyLabel: 'Message body',
    bodyPh: 'e.g. We wanted to share our joy with you on this special day, and thank you for your love...',
    sigLabel: 'Signature',
    sigPh: 'e.g. Ahmed & Sara',
    previewNote: 'The message appears above the photo gallery on page four in your chosen title font.',
  },
};

/** 💌 الخطوة 12 — رسالة شخصية */
export default function StagePersonalMessage() {
  const { lang } = useLanguage();
  const { state, update } = useDesign();
  const c = COPY[lang];

  const msg = state.personalMessage || {};

  return (
    <section className="pm fp-glass">
      <h2 className="fp-stage__title">{c.title}</h2>
      <p className="fp-stage__desc">{c.desc}</p>

      {/* 📝 العنوان */}
      <label className="pm-label">{c.titleLabel}</label>
      <div className="pm-titlewrap">
        <input
          type="text"
          maxLength={100}
          className="pm-input"
          value={msg.title || ''}
          placeholder={c.titlePh}
          onChange={(e) => update('personalMessage.title', e.target.value)}
        />
        <span className="pm-count" dir="ltr">{(msg.title || '').length}/100</span>
      </div>

      {/* 📝 نص الرسالة */}
      <label className="pm-label">{c.bodyLabel}</label>
      <div className="pm-bodywrap">
        <textarea
          rows={5}
          maxLength={500}
          className="pm-textarea"
          value={msg.body || ''}
          placeholder={c.bodyPh}
          onChange={(e) => update('personalMessage.body', e.target.value)}
        />
        <span className="pm-count pm-count--textarea" dir="ltr">{(msg.body || '').length}/500</span>
      </div>

      {/* ✍️ التوقيع */}
      <label className="pm-label">{c.sigLabel}</label>
      <div className="pm-sigwrap">
        <input
          type="text"
          maxLength={80}
          className="pm-input pm-input--sig"
          value={msg.signature || ''}
          placeholder={c.sigPh}
          onChange={(e) => update('personalMessage.signature', e.target.value)}
        />
        <span className="pm-count" dir="ltr">{(msg.signature || '').length}/80</span>
      </div>

      <p className="pm-note">✦ {c.previewNote}</p>

      {/* 👁️ معاينة داخلية صغيرة */}
      {(msg.title || msg.body || msg.signature) && (
        <div className="pm-preview">
          {msg.title && <p className="pm-preview__title">{msg.title}</p>}
          {msg.body && <p className="pm-preview__body">{msg.body}</p>}
          {msg.signature && <p className="pm-preview__sig">— {msg.signature}</p>}
        </div>
      )}
    </section>
  );
}