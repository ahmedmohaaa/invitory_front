import { useRef, useState } from 'react';
import { useLanguage } from '../../../../context/LanguageContext';
import { useDesign } from '../../context/DesignContext';
import { uploadInvitationMusic, deleteInvitationMusic } from '../../services/designService';
import { extractYoutubeId, youtubeThumb, formatDuration } from '../../utils/media';
import './StageMusic.css';

const COPY = {
  ar: {
    title: 'الموسيقى',
    desc: 'اختر مقطوعة من مكتبة المنصة، أو ارفع ملفك الخاص، أو اربط رابط يوتيوب — مع تحديد وقت البدء بدقة.',
    srcLibrary: 'مكتبة المنصة',
    srcCustom: 'ملفي الخاص',
    srcYoutube: 'يوتيوب',
    libSearch: 'ابحث في المكتبة...',
    libEmpty: 'لا توجد مقطوعات مفعلة في المكتبة.',
    select: 'اختيار',
    selected: 'مختارة',
    uploadHint: 'اضغط لاختيار ملف صوتي (mp3/wav/ogg/m4a حتى 15MB)',
    uploading: 'جارٍ الرفع…',
    uploadError: 'تعذر رفع الملف الصوتي',
    removeCustom: 'إزالة الملف',
    currentCustom: 'الملف الحالي',
    ytLabel: 'رابط يوتيوب',
    ytPh: 'https://www.youtube.com/watch?v=...',
    ytInvalid: 'الرابط غير صالح — يجب أن يكون من youtube.com أو youtu.be',
    startLabel: 'وقت بدء الموسيقى',
    hours: 'ساعة', minutes: 'دقيقة', seconds: 'ثانية',
  },
  en: {
    title: 'Music',
    desc: 'Pick a track from the platform library, upload your own file, or link YouTube — with precise start time.',
    srcLibrary: 'Platform Library',
    srcCustom: 'My Own File',
    srcYoutube: 'YouTube',
    libSearch: 'Search the library...',
    libEmpty: 'No active tracks in the library.',
    select: 'Select',
    selected: 'Selected',
    uploadHint: 'Click to choose an audio file (mp3/wav/ogg/m4a up to 15MB)',
    uploading: 'Uploading…',
    uploadError: 'Could not upload the audio file',
    removeCustom: 'Remove file',
    currentCustom: 'Current file',
    ytLabel: 'YouTube link',
    ytPh: 'https://www.youtube.com/watch?v=...',
    ytInvalid: 'Invalid link — must be from youtube.com or youtu.be',
    startLabel: 'Music start time',
    hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds',
  },
};

/** 🎵 الخطوة 14 — الموسيقى */
export default function StageMusic() {
  const { lang } = useLanguage();
  const { state, update, ensureId, musicLibrary, musicLibraryLoading } = useDesign();
  const c = COPY[lang];

  const music = state.music || {};
  const source = music.source || 'library';

  const [libFilter, setLibFilter] = useState('');
  const [previewId, setPreviewId] = useState(null);
  const previewRef = useRef(null);
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const filteredLib = (musicLibrary || []).filter((t) => {
    const q = libFilter.trim().toLowerCase();
    return !q || (t.title || '').toLowerCase().includes(q) || (t.artist || '').toLowerCase().includes(q);
  });

  /* 🎧 معاينة مقطوعة من المكتبة */
  const handleLibPreview = (track) => {
    if (previewId === track.id) {
      previewRef.current?.pause();
      setPreviewId(null);
      return;
    }
    previewRef.current?.pause();
    const a = new Audio(track.audio_url);
    previewRef.current = a;
    a.onended = () => setPreviewId(null);
    a.play();
    setPreviewId(track.id);
  };

  /* 📁 رفع ملف خاص */
  const handleUpload = async (file) => {
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const id = await ensureId();
      const res = await uploadInvitationMusic(id, file);
      update('music.customFileId', res.id);
      update('music.customUrl', res.url);
      update('music.source', 'custom');
    } catch {
      setUploadError(c.uploadError);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleRemoveCustom = async () => {
    try {
      const id = state.meta.invitationId;
      if (id && music.customFileId) await deleteInvitationMusic(id, music.customFileId);
    } catch { /* تجاهل */ }
    update('music.customFileId', null);
    update('music.customUrl', '');
  };

  const setStart = (part, value) => {
    const max = part === 'hours' ? 23 : 59;
    const v = Math.max(0, Math.min(max, Number(value) || 0));
    update(`music.startTime.${part}`, v);
  };

  const ytId = extractYoutubeId(music.youtubeUrl || '');

  return (
    <section className="mu fp-glass">
      <h2 className="fp-stage__title">{c.title}</h2>
      <p className="fp-stage__desc">{c.desc}</p>

      {/* 🔀 اختيار المصدر */}
      <div className="mu-sources" role="radiogroup" aria-label={c.title}>
        {[
          { key: 'library', label: c.srcLibrary, icon: '🎼' },
          { key: 'custom', label: c.srcCustom, icon: '📁' },
          { key: 'youtube', label: c.srcYoutube, icon: '▶' },
        ].map((s) => (
          <button
            key={s.key}
            type="button"
            role="radio"
            aria-checked={source === s.key}
            className={`mu-source ${source === s.key ? 'is-on' : ''}`}
            onClick={() => update('music.source', s.key)}
          >
            <span aria-hidden="true">{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* 🎼 المكتبة */}
      {source === 'library' && (
        <div className="mu-lib">
          <input
            type="text"
            className="mu-input"
            value={libFilter}
            onChange={(e) => setLibFilter(e.target.value)}
            placeholder={c.libSearch}
          />
          {musicLibraryLoading ? (
            <div className="mu-lib__list">
              {Array.from({ length: 4 }).map((_, i) => <span key={i} className="mu-skel" />)}
            </div>
          ) : filteredLib.length === 0 ? (
            <p className="mu-empty">{c.libEmpty}</p>
          ) : (
            <div className="mu-lib__list">
              {filteredLib.map((t) => (
                <div className={`mu-track ${music.trackId === t.id ? 'is-selected' : ''}`} key={t.id}>
                  <button
                    type="button"
                    className="mu-track__play"
                    onClick={() => handleLibPreview(t)}
                    aria-label={t.title}
                  >
                    {previewId === t.id ? '❚❚' : '▶'}
                  </button>
                  <div className="mu-track__info">
                    <p className="mu-track__title">{t.title}</p>
                    <p className="mu-track__meta">
                      {t.artist || '—'} · <span dir="ltr">{t.duration_display}</span>
                      {t.genre ? ` · ${t.genre}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`mu-track__sel ${music.trackId === t.id ? 'is-on' : ''}`}
                    onClick={() => { update('music.trackId', t.id); update('music.source', 'library'); }}
                  >
                    {music.trackId === t.id ? c.selected : c.select}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 📁 ملف خاص */}
      {source === 'custom' && (
        <div className="mu-custom">
          {music.customUrl ? (
            <div className="mu-custom__current">
              <span className="mu-custom__icon" aria-hidden="true">🎵</span>
              <div className="mu-custom__info">
                <p className="mu-custom__label">{c.currentCustom}</p>
                <audio controls src={music.customUrl} className="mu-custom__audio" />
              </div>
              <button type="button" className="mu-custom__del" onClick={handleRemoveCustom}>
                {c.removeCustom}
              </button>
            </div>
          ) : (
            <label className="mu-drop">
              <input
                ref={fileRef}
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.m4a"
                hidden
                onChange={(e) => handleUpload(e.target.files?.[0])}
              />
              <span aria-hidden="true">🎵</span>
              <p>{uploading ? c.uploading : c.uploadHint}</p>
            </label>
          )}
          {uploadError && <p className="mu-error">{uploadError}</p>}
        </div>
      )}

      {/* ▶ يوتيوب */}
      {source === 'youtube' && (
        <div className="mu-yt">
          <label className="mu-label">{c.ytLabel}</label>
          <input
            type="url"
            dir="ltr"
            className="mu-input mu-input--ltr"
            value={music.youtubeUrl || ''}
            placeholder={c.ytPh}
            onChange={(e) => { update('music.youtubeUrl', e.target.value); update('music.source', 'youtube'); }}
          />
          {music.youtubeUrl && !ytId && <p className="mu-error">{c.ytInvalid}</p>}
          {ytId && (
            <div className="mu-yt__thumb">
              <img src={youtubeThumb(ytId)} alt="YouTube preview" loading="lazy" />
              <span className="mu-yt__badge" dir="ltr">youtu.be/{ytId}</span>
            </div>
          )}
        </div>
      )}

      {/* ⏱️ وقت البدء */}
      <label className="mu-label">{c.startLabel}</label>
      <div className="mu-start">
        {(['hours', 'minutes', 'seconds']).map((part) => (
          <div className="mu-start__cell" key={part}>
            <input
              type="number"
              min={0}
              max={part === 'hours' ? 23 : 59}
              value={(music.startTime || {})[part] ?? 0}
              onChange={(e) => setStart(part, e.target.value)}
              aria-label={c[part]}
            />
            <span>{c[part]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}