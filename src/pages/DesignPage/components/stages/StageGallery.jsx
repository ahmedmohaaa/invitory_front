import { useRef, useState } from 'react';
import { useLanguage } from '../../../../context/LanguageContext';
import { useDesign } from '../../context/DesignContext';
import { uploadGalleryPhoto, deleteGalleryPhoto } from '../../services/designService';
import './StageGallery.css';

const COPY = {
  ar: {
    title: 'معرض الصور',
    desc: 'ارفع حتى 6 صور خاصة بمناسبتك (عائلية، القاعة، لحظات مميزة) — ستظهر في الصفحة الرابعة من الدعوة كعرض شرائح أنيق.',
    dropHint: 'اسحب وأفلت الصور هنا، أو اضغط للاختيار',
    maxHint: 'الحد الأقصى 6 صور (PNG/JPG حتى 5MB لكل صورة)',
    uploading: 'جارٍ الرفع…',
    uploadError: 'تعذر رفع الصورة',
    deleteError: 'تعذر حذف الصورة',
    caption: 'وصف مختصر (اختياري)',
    captionPh: 'مثال: لحظة دخول العروسين',
    remove: 'حذف',
    counter: 'مرفوع',
    of: 'من 6',
    maxNote: 'بلغت الحد الأقصى (6 صور) — احذف صورة لإضافة أخرى.',
    empty: 'لم ترفع أي صور بعد — ستظهر معاينة فارغة في الصفحة الرابعة.',
  },
  en: {
    title: 'Photo Gallery',
    desc: 'Upload up to 6 special photos (family, venue, memorable moments) — they will appear as an elegant slideshow on invitation page four.',
    dropHint: 'Drag & drop images here, or click to choose',
    maxHint: 'Up to 6 photos (PNG/JPG up to 5MB each)',
    uploading: 'Uploading…',
    uploadError: 'Could not upload image',
    deleteError: 'Could not delete photo',
    caption: 'Short caption (optional)',
    captionPh: 'e.g. Bride & groom entrance',
    remove: 'Remove',
    counter: 'uploaded',
    of: 'of 6',
    maxNote: 'Maximum reached (6 photos) — remove one to add another.',
    empty: 'No photos uploaded yet — a blank preview will appear on page four.',
  },
};

const MAX_PHOTOS = 6;

/** 🖼️ الخطوة 11 — معرض الصور */
export default function StageGallery() {
  const { lang } = useLanguage();
  const { state, update, ensureId, loadGalleryPhotos } = useDesign();
  const c = COPY[lang];

  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const photos = state.gallery?.photos || [];
  const atMax = photos.length >= MAX_PHOTOS;

  /* رفع صورة واحدة */
  const handleUpload = async (file) => {
    if (!file) return;
    setUploadError('');
    if (!file.type.startsWith('image/')) return setUploadError(c.uploadError);
    if (file.size > 5 * 1024 * 1024) return setUploadError(c.uploadError);
    if (atMax) return setUploadError(c.maxNote);

    setUploading(true);
    try {
      const id = await ensureId();
      const res = await uploadGalleryPhoto(id, file, '');
      update('gallery.photos', [...photos, res]);
    } catch {
      setUploadError(c.uploadError);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  /* حذف صورة */
  const handleDelete = async (photoId) => {
    try {
      const id = state.meta.invitationId;
      if (id) await deleteGalleryPhoto(id, photoId);
      update('gallery.photos', photos.filter((p) => p.id !== photoId));
    } catch {
      setUploadError(c.deleteError);
    }
  };

  /* Drag & Drop */
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <section className="gl fp-glass">
      <h2 className="fp-stage__title">{c.title}</h2>
      <p className="fp-stage__desc">{c.desc}</p>

      {/* عدّاد */}
      <div className="gl-counter">
        <span className={`gl-counter__num ${atMax ? 'is-max' : ''}`}>{photos.length}</span>
        <span>{c.counter} {c.of}</span>
      </div>

      {/* منطقة الرفع */}
      <label
        className={`gl-drop ${dragOver ? 'is-dragover' : ''} ${atMax ? 'is-disabled' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          disabled={atMax || uploading}
          onChange={(e) => handleUpload(e.target.files?.[0])}
        />
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M3 17l5-4 4 3 4-4 5 5" />
        </svg>
        <p className="gl-drop__hint">{uploading ? c.uploading : c.dropHint}</p>
        <p className="gl-drop__sub">{c.maxHint}</p>
      </label>

      {uploadError && <p className="gl-error">{uploadError}</p>}

      {/* شبكة الصور */}
      {photos.length > 0 ? (
        <div className="gl-grid">
          {photos.map((p) => (
            <div className="gl-photo" key={p.id}>
              <img src={p.url} alt={p.caption || 'Gallery'} loading="lazy" />
              <div className="gl-photo__overlay">
                <button
                  type="button"
                  className="gl-photo__del"
                  onClick={() => handleDelete(p.id)}
                  aria-label={c.remove}
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  </svg>
                </button>
              </div>
              <span className="gl-photo__order">{p.order + 1}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="gl-empty">{c.empty}</p>
      )}

      {atMax && <p className="gl-note gl-note--warn">{c.maxNote}</p>}
    </section>
  );
}