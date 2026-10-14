import { useState } from 'react';
import { useLanguage } from '../../../../context/LanguageContext';
import { useDesign } from '../../context/DesignContext';
import { updateCameraSettings } from '../../services/designService';
import Switch from '../Switch/Switch';
import './StageCamera.css';

const COPY = {
  ar: {
    title: 'إعدادات الكاميرا',
    desc: 'تحكم في ظهور أزرار الكاميرا في المعاينة — إخفاء أو إظهار حسب رغبتك.',
    toggle1: 'إخفاء زر الكاميرا',
    hint1: 'عند التفعيل يختفي زر الكاميرا (الدائرة الذهبية) من التاب بار في المعاينة.',
    toggle2: 'إخفاء زر الحفظ',
    hint2: 'عند التفعيل يختفي زر حفظ الصورة الملتقطة من مودال الكاميرا.',
    toggle3: 'إخفاء معرض الصور الملتقطة',
    hint3: 'عند التفعيل يختفي شريط الصور الملتقطة من مودال الكاميرا.',
    save: 'حفظ الإعدادات',
    saving: 'جارٍ الحفظ…',
    success: 'تم الحفظ بنجاح',
    error: 'تعذر الحفظ',
  },
  en: {
    title: 'Camera Settings',
    desc: 'Control camera button visibility in the preview — show or hide as you prefer.',
    toggle1: 'Hide Camera Button',
    hint1: 'When on, the camera button (gold circle) disappears from the tab bar in the preview.',
    toggle2: 'Hide Save Button',
    hint2: 'When on, the save captured photo button disappears from the camera modal.',
    toggle3: 'Hide Captured Gallery',
    hint3: 'When on, the captured photos strip disappears from the camera modal.',
    save: 'Save Settings',
    saving: 'Saving…',
    success: 'Settings saved successfully',
    error: 'Could not save',
  },
};

/** 📷 الخطوة 16 — إعدادات الكاميرا */
export default function StageCamera() {
  const { lang } = useLanguage();
  const { state, update, ensureId, loadCameraSettings } = useDesign();
  const c = COPY[lang];

  const camera = state.camera || {};
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const saveSettings = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const id = await ensureId();
      await updateCameraSettings(id, {
        hide_camera_button: camera.hide_camera_button,
        hide_save_button: camera.hide_save_button,
        hide_gallery: camera.hide_gallery,
      });
      loadCameraSettings();
      setMessage({ type: 'success', text: c.success });
      setTimeout(() => setMessage({ type: '', text: '' }), 2500);
    } catch {
      setMessage({ type: 'error', text: c.error });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="cm fp-glass">
      <h2 className="fp-stage__title">{c.title}</h2>
      <p className="fp-stage__desc">{c.desc}</p>

      <Switch
        checked={!!camera.hide_camera_button}
        onChange={(v) => update('camera.hide_camera_button', v)}
        label={c.toggle1}
        hint={c.hint1}
      />

      <Switch
        checked={!!camera.hide_save_button}
        onChange={(v) => update('camera.hide_save_button', v)}
        label={c.toggle2}
        hint={c.hint2}
      />

      <Switch
        checked={!!camera.hide_gallery}
        onChange={(v) => update('camera.hide_gallery', v)}
        label={c.toggle3}
        hint={c.hint3}
      />

      {message.text && (
        <p className={`cm-message cm-message--${message.type}`}>{message.text}</p>
      )}

      <button
        type="button"
        className="cm-save"
        onClick={saveSettings}
        disabled={saving}
      >
        {saving ? c.saving : c.save}
      </button>
    </section>
  );
}