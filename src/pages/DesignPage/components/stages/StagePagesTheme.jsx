import { useRef, useState } from 'react';
import { useLanguage } from '../../../../context/LanguageContext';
import { useDesign } from '../../context/DesignContext';
import { uploadAsset, deleteAsset } from '../../services/designService';
import './StagePagesTheme.css';
import { SWATCHES } from '../../constants';
const COPY = {
  ar: {
    title: 'صفحات القالب والتنسيق',
    desc: 'اختر صفحة لمنحها خلفية خاصة، بينما تُطبق الخطوط والألوان على الصفحات الخمس كلها.',
    pages: 'صفحة',
    bgTitle: 'خلفية الصفحة الحالية',
    bgHint: 'اسحب صورة أو اضغط للرفع (PNG/JPG حتى 5MB)',
    replace: 'استبدال', remove: 'إزالة الخلفية',
    uploading: 'جارٍ الرفع…',
    uploadError: 'تعذر رفع الصورة',
    globalTitle: 'تنسيق عام على كل الصفحات',
    fontTitle: 'شكل الخط',
    colorsTitle: 'ألوان النص',
    cTitle: 'لون العنوان', cBody: 'لون النص', cAccent: 'لون التمييز',
    sample: 'دعوتك',
  },
  en: {
    title: 'Template Pages & Styling',
    desc: 'Pick a page to give it its own background, while fonts and colors apply to all five pages.',
    pages: 'Page',
    bgTitle: 'Current page background',
    bgHint: 'Drag an image or click to upload (PNG/JPG up to 5MB)',
    replace: 'Replace', remove: 'Remove background',
    uploading: 'Uploading…',
    uploadError: 'Could not upload image',
    globalTitle: 'Global styling for all pages',
    fontTitle: 'Font family',
    colorsTitle: 'Text colors',
    cTitle: 'Title color', cBody: 'Body color', cAccent: 'Accent color',
    sample: 'Invite',
  },
};

const COLOR_KEYS = [
  { key: 'title', label: 'cTitle' },
  { key: 'body', label: 'cBody' },
  { key: 'accent', label: 'cAccent' },
];

/** 🎨 الخطوة 4 — خلفيات الصفحات الخمس + الخط + ألوان النص */
export default function StagePagesTheme() {
  const { lang } = useLanguage();
  const { state, update, fonts, fontsLoading, ensureId } = useDesign();
  const c = COPY[lang];

  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const activePage = state.meta.activePage || 1;
  const currentBg = state.pages?.[activePage]?.background || null;
  const theme = state.theme || {};

  /* 🖼️ رفع خلفية الصفحة الحالية */
  const handleFile = async (file) => {
    if (!file) return;
    setUploadError('');
    if (!file.type.startsWith('image/')) return setUploadError(c.uploadError);
    if (file.size > 5 * 1024 * 1024) return setUploadError(c.uploadError);
    setUploading(true);
    try {
      const id = await ensureId();                 // مسودة تلقائية إن لزم
      const res = await uploadAsset(file, { kind: 'BACKGROUND', invitationId: id });
      update(`pages.${activePage}.background`, { asset_id: res.id, url: res.url });
    } catch {
      setUploadError(c.uploadError);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  /* 🗑️ إزالة الخلفية (+ حذف الأصل من السيرفر best-effort) */
  const handleRemove = async () => {
    if (currentBg?.asset_id) {
      deleteAsset(currentBg.asset_id).catch(() => {});
    }
    update(`pages.${activePage}.background`, null);
  };

  return (
    <section className="pt fp-glass">
      <h2 className="fp-stage__title">{c.title}</h2>
      <p className="fp-stage__desc">{c.desc}</p>

      {/* 📄 تبويبات الصفحات الخمس */}
      <div className="pt-pages" role="tablist" aria-label={c.title}>
        {[1, 2, 3, 4, 5].map((n) => {
          const bg = state.pages?.[n]?.background;
          return (
            <button
              key={n}
              type="button"
              role="tab"
              aria-selected={activePage === n}
              className={`pt-page ${activePage === n ? 'is-active' : ''}`}
              onClick={() => update('meta.activePage', n)}
            >
              <span
                className="pt-page__thumb"
                style={bg?.url ? { backgroundImage: `url(${bg.url})` } : undefined}
              >
                {!bg?.url && <i>{n}</i>}
              </span>
              <span className="pt-page__label">{c.pages} {n}</span>
            </button>
          );
        })}
      </div>

      {/* 🖼️ رافع الخلفية */}
      <div className="pt-bg">
        <p className="pt-sub">{c.bgTitle} {activePage}</p>
        {currentBg?.url ? (
          <div className="pt-bg__preview">
            <img src={currentBg.url} alt="" />
            <div className="pt-bg__actions">
              <button type="button" className="pt-btn" onClick={() => fileRef.current?.click()}>{c.replace}</button>
              <button type="button" className="pt-btn pt-btn--danger" onClick={handleRemove}>{c.remove}</button>
            </div>
          </div>
        ) : (
          <label className="pt-drop" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleFile(e.dataTransfer.files?.[0])}>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M3 17l5-4 4 3 4-4 5 5" />
            </svg>
            <span>{uploading ? c.uploading : c.bgHint}</span>
          </label>
        )}
        {uploadError && <p className="pt-error">{uploadError}</p>}
      </div>

      {/* 🌐 تنسيق عام */}
      <div className="pt-global">
        <p className="pt-sub pt-sub--gold">✦ {c.globalTitle}</p>

        {/* الخطوط */}
        <p className="pt-label">{c.fontTitle}</p>
        <div className="pt-fonts">
          {fontsLoading && Array.from({ length: 6 }).map((_, i) => <span key={i} className="pt-font-skel" />)}
          {!fontsLoading && fonts.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`pt-font ${theme.font === f.key ? 'is-selected' : ''}`}
              style={{ fontFamily: f.css }}
              onClick={() => update('theme.font', f.key)}
            >
              <span className="pt-font__sample">{c.sample}</span>
              <span className="pt-font__name">{f.labels?.[lang] || f.key}</span>
            </button>
          ))}
        </div>

        {/* الألوان */}
        <p className="pt-label">{c.colorsTitle}</p>
        <div className="pt-colors">
          {COLOR_KEYS.map(({ key, label }) => (
            <div className="pt-color" key={key}>
              <span className="pt-color__label">{c[label]}</span>
              <div className="pt-color__row">
                <input
                  type="color"
                  value={theme.colors?.[key] || '#000000'}
                  onChange={(e) => update(`theme.colors.${key}`, e.target.value)}
                  aria-label={c[label]}
                />
                <code dir="ltr">{(theme.colors?.[key] || '').toUpperCase()}</code>
              </div>
              <div className="pt-swatches">
                {SWATCHES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`pt-swatch ${theme.colors?.[key] === s ? 'is-active' : ''}`}
                    style={{ background: s }}
                    onClick={() => update(`theme.colors.${key}`, s)}
                    aria-label={s}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}