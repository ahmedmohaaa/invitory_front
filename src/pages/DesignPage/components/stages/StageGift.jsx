import { useRef, useState } from 'react';
import { useLanguage } from '../../../../context/LanguageContext';
import { useDesign } from '../../context/DesignContext';
import { updateGiftSettings, createWishlistItem, deleteWishlistItem } from '../../services/designService';
import Switch from '../Switch/Switch';
import './StageGift.css';

const COPY = {
  ar: {
    title: 'الهدية',
    desc: 'فعّل نظام الهدايا لضيوفك — رسالة شكر، تحويل بنكي، وقائمة أمنيات.',
    toggleLabel: 'تفعيل الهدايا',
    toggleHint: 'يضيف £5 على رسوم الدفع.',
    msgLabel: 'رسالة للضيوف',
    msgPh: 'مثال: نشكركم من القلب على هداياكم التي ستزيد فرحتنا...',
    bankToggle: 'تفعيل التحويل البنكي',
    bankHint: 'اعرض بيانات حسابك المصرفي ورمز QR للتحويل السريع.',
    bankHolder: 'اسم صاحب الحساب',
    bankHolderPh: 'مثال: أحمد محمد الشريف',
    bankIban: 'رقم الحساب (IBAN)',
    bankIbanPh: 'SA00 0000 0000 0000 0000 0000',
    bankQr: 'رمز QR (اختياري)',
    bankQrHint: 'ارفع صورة QR من تطبيق البنك',
    bankQrCurrent: 'الرمز الحالي',
    removeQr: 'إزالة الرمز',
    wishlistTitle: 'قائمة الأمنيات',
    wishlistHint: 'أضف حتى 10 هدايا يتمناها العروسان.',
    addWish: 'إضافة هدية',
    wishName: 'اسم الهدية',
    wishNamePh: 'مثال: ماكينة قهوة',
    wishImage: 'صورة الهدية (اختياري)',
    wishLink: 'رابط الهدية (اختياري)',
    wishLinkPh: 'https://example.com/product',
    save: 'حفظ',
    saving: 'جارٍ الحفظ…',
    remove: 'حذف',
    maxNote: 'الحد الأقصى 10 هدايا.',
    empty: 'لم تضف أي هدايا بعد.',
    error: 'تعذر الحفظ',
  },
  en: {
    title: 'Gift',
    desc: 'Enable gift system for your guests — thank you message, bank transfer, and wishlist.',
    toggleLabel: 'Enable Gifts',
    toggleHint: 'Adds £5 to payment fees.',
    msgLabel: 'Message for guests',
    msgPh: 'e.g. Thank you from the heart for your gifts...',
    bankToggle: 'Enable Bank Transfer',
    bankHint: 'Display your bank account details and QR code for quick transfer.',
    bankHolder: 'Account holder name',
    bankHolderPh: 'e.g. Ahmed Al-Sharif',
    bankIban: 'Account number (IBAN)',
    bankIbanPh: 'SA00 0000 0000 0000 0000 0000',
    bankQr: 'QR Code (optional)',
    bankQrHint: 'Upload QR image from your bank app',
    bankQrCurrent: 'Current QR',
    removeQr: 'Remove QR',
    wishlistTitle: 'Wishlist',
    wishlistHint: 'Add up to 10 gifts the couple wishes for.',
    addWish: 'Add gift',
    wishName: 'Gift name',
    wishNamePh: 'e.g. Coffee machine',
    wishImage: 'Gift image (optional)',
    wishLink: 'Gift link (optional)',
    wishLinkPh: 'https://example.com/product',
    save: 'Save',
    saving: 'Saving…',
    remove: 'Remove',
    maxNote: 'Up to 10 gifts.',
    empty: 'No gifts added yet.',
    error: 'Could not save',
  },
};

const MAX_WISHES = 10;

/** 🎁 الخطوة 15 — الهدية */
export default function StageGift() {
  const { lang } = useLanguage();
  const { state, update, ensureId, loadGiftSettings, loadWishlist } = useDesign();
  const c = COPY[lang];

  const gift = state.gift || {};
  const wishlist = state.wishlist?.items || [];
  const atMax = wishlist.length >= MAX_WISHES;

  const [showWishForm, setShowWishForm] = useState(false);
  const [wishForm, setWishForm] = useState({ name: '', image: null, link: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const qrRef = useRef(null);

  /* حفظ إعدادات الهدية */
  const saveSettings = async () => {
    setSaving(true);
    setError('');
    try {
      const id = await ensureId();
      const data = {
        enabled: gift.enabled,
        message: gift.message || '',
        bank_enabled: gift.bank_enabled,
        bank_holder: gift.bank_holder || '',
        bank_iban: gift.bank_iban || '',
      };
      const qrFile = qrRef.current?.files?.[0];
      if (qrFile) data.bank_qr = qrFile;
      await updateGiftSettings(id, data);
      loadGiftSettings();
    } catch {
      setError(c.error);
    } finally {
      setSaving(false);
    }
  };

  /* إزالة QR */
  const removeQr = () => {
    update('gift.bank_qr', '');
  };

  /* إضافة هدية */
  const handleAddWish = async () => {
    if (!wishForm.name.trim()) return setError(c.error);
    setSaving(true);
    setError('');
    try {
      const id = await ensureId();
      const form = new FormData();
      form.append('name', wishForm.name);
      form.append('link', wishForm.link || '');
      if (wishForm.image) form.append('image', wishForm.image);
      await createWishlistItem(id, form);
      setWishForm({ name: '', image: null, link: '' });
      setShowWishForm(false);
      loadWishlist();
    } catch {
      setError(c.error);
    } finally {
      setSaving(false);
    }
  };

  /* حذف هدية */
  const handleDeleteWish = async (itemId) => {
    try {
      const id = state.meta.invitationId;
      if (id) await deleteWishlistItem(id, itemId);
      loadWishlist();
    } catch { /* تجاهل */ }
  };

  return (
    <section className="gi fp-glass">
      <h2 className="fp-stage__title">{c.title}</h2>
      <p className="fp-stage__desc">{c.desc}</p>

      {/* Toggle التفعيل */}
      <Switch
        checked={!!gift.enabled}
        onChange={(v) => update('gift.enabled', v)}
        label={c.toggleLabel}
        hint={c.toggleHint}
      />

      {gift.enabled && (
        <>
          {/* رسالة للضيوف */}
          <label className="gi-label">{c.msgLabel}</label>
          <textarea
            rows={3}
            maxLength={500}
            className="gi-textarea"
            value={gift.message || ''}
            placeholder={c.msgPh}
            onChange={(e) => update('gift.message', e.target.value)}
          />

          {/* التحويل البنكي */}
          <Switch
            checked={!!gift.bank_enabled}
            onChange={(v) => update('gift.bank_enabled', v)}
            label={c.bankToggle}
            hint={c.bankHint}
          />

          {gift.bank_enabled && (
            <div className="gi-bank">
              <label className="gi-label">{c.bankHolder}</label>
              <input
                type="text"
                maxLength={150}
                className="gi-input"
                value={gift.bank_holder || ''}
                placeholder={c.bankHolderPh}
                onChange={(e) => update('gift.bank_holder', e.target.value)}
              />

              <label className="gi-label">{c.bankIban}</label>
              <input
                type="text"
                dir="ltr"
                maxLength={50}
                className="gi-input gi-input--ltr"
                value={gift.bank_iban || ''}
                placeholder={c.bankIbanPh}
                onChange={(e) => update('gift.bank_iban', e.target.value)}
              />

              <label className="gi-label">{c.bankQr}</label>
              {gift.bank_qr ? (
                <div className="gi-qr-current">
                  <img src={gift.bank_qr} alt="QR" className="gi-qr-img" />
                  <button type="button" className="gi-qr-del" onClick={removeQr}>
                    {c.removeQr}
                  </button>
                </div>
              ) : (
                <label className="gi-drop">
                  <input ref={qrRef} type="file" accept="image/*" hidden onChange={saveSettings} />
                  <span>📷</span>
                  <p>{c.bankQrHint}</p>
                </label>
              )}

              <button type="button" className="gi-save-btn" onClick={saveSettings} disabled={saving}>
                {saving ? c.saving : c.save}
              </button>
            </div>
          )}

          {/* قائمة الأمنيات */}
          <div className="gi-wishlist">
            <p className="gi-subtitle">{c.wishlistTitle}</p>
            <p className="gi-hint">{c.wishlistHint}</p>

            {wishlist.length > 0 ? (
              <div className="gi-wish-list">
                {wishlist.map((item) => (
                  <div className="gi-wish-card" key={item.id}>
                    {item.image && <img src={item.image} alt={item.name} className="gi-wish-img" />}
                    <div className="gi-wish-info">
                      <p className="gi-wish-name">{item.name}</p>
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="gi-wish-link">
                          🔗
                        </a>
                      )}
                    </div>
                    <button type="button" className="gi-wish-del" onClick={() => handleDeleteWish(item.id)}>
                      {c.remove}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="gi-empty">{c.empty}</p>
            )}

            {!atMax && !showWishForm && (
              <button type="button" className="gi-add" onClick={() => setShowWishForm(true)}>
                + {c.addWish}
              </button>
            )}
            {atMax && <p className="gi-note gi-note--warn">{c.maxNote}</p>}

            {showWishForm && (
              <div className="gi-wish-form">
                <label className="gi-label">{c.wishName}</label>
                <input
                  type="text"
                  maxLength={150}
                  className="gi-input"
                  value={wishForm.name}
                  placeholder={c.wishNamePh}
                  onChange={(e) => setWishForm({ ...wishForm, name: e.target.value })}
                />

                <label className="gi-label">{c.wishImage}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setWishForm({ ...wishForm, image: e.target.files?.[0] })}
                />

                <label className="gi-label">{c.wishLink}</label>
                <input
                  type="url"
                  dir="ltr"
                  className="gi-input gi-input--ltr"
                  value={wishForm.link}
                  placeholder={c.wishLinkPh}
                  onChange={(e) => setWishForm({ ...wishForm, link: e.target.value })}
                />

                {error && <p className="gi-error">{error}</p>}

                <div className="gi-form-actions">
                  <button type="button" className="gi-btn gi-btn--cancel" onClick={() => setShowWishForm(false)}>
                    {c.remove}
                  </button>
                  <button type="button" className="gi-btn gi-btn--save" onClick={handleAddWish} disabled={saving}>
                    {saving ? c.saving : c.save}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}