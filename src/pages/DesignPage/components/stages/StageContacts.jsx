import { useRef, useState } from 'react';
import { useLanguage } from '../../../../context/LanguageContext';
import { useDesign } from '../../context/DesignContext';
import { createContact, deleteContact } from '../../services/designService';
import './StageContacts.css';

const COPY = {
  ar: {
    title: 'جهات الاتصال',
    desc: 'أضف جهات الاتصال لضيوفك للتواصل معك — الاسم والدور ورقم الهاتف ورقم واتساب (اختياري).',
    addBtn: 'أضف جهات اتصالك',
    contact: 'جهة اتصال',
    nameLabel: 'الاسم',
    namePh: 'مثال: أحمد الشريف',
    roleLabel: 'الدور (اختياري)',
    rolePh: 'مثال: العريس',
    phoneLabel: 'رقم الهاتف',
    phonePh: '+20 123 456 7890',
    whatsappLabel: 'واتساب (اختياري)',
    whatsappPh: '+20 123 456 7890',
    save: 'حفظ',
    saving: 'جارٍ الحفظ…',
    remove: 'حذف',
    maxNote: 'الحد الأقصى 10 جهات اتصال.',
    error: 'تعذر حفظ جهة الاتصال',
    empty: 'لم تضف أي جهات اتصال بعد.',
  },
  en: {
    title: 'Contacts',
    desc: 'Add contact persons for your guests — name, role, phone and WhatsApp (optional).',
    addBtn: 'Add your contacts',
    contact: 'Contact',
    nameLabel: 'Name',
    namePh: 'e.g. Ahmed Al-Sharif',
    roleLabel: 'Role (optional)',
    rolePh: 'e.g. Groom',
    phoneLabel: 'Phone number',
    phonePh: '+20 123 456 7890',
    whatsappLabel: 'WhatsApp (optional)',
    whatsappPh: '+20 123 456 7890',
    save: 'Save',
    saving: 'Saving…',
    remove: 'Remove',
    maxNote: 'Up to 10 contacts.',
    error: 'Could not save contact',
    empty: 'No contacts added yet.',
  },
};

const MAX_CONTACTS = 10;

/** 📞 الخطوة 13 — جهات الاتصال */
export default function StageContacts() {
  const { lang } = useLanguage();
  const { state, update, ensureId, loadContacts } = useDesign();
  const c = COPY[lang];

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: '', phone: '', whatsapp: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const contacts = state.contacts?.list || [];
  const atMax = contacts.length >= MAX_CONTACTS;

  const handleSave = async () => {
    setError('');
    if (!formData.name.trim() || !formData.phone.trim()) {
      setError(c.error);
      return;
    }
    setSaving(true);
    try {
      const id = await ensureId();
      const res = await createContact(id, formData);
      update('contacts.list', [...contacts, res]);
      setFormData({ name: '', role: '', phone: '', whatsapp: '' });
      setShowForm(false);
    } catch {
      setError(c.error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (contactId) => {
    try {
      const id = state.meta.invitationId;
      if (id) await deleteContact(id, contactId);
      update('contacts.list', contacts.filter((c) => c.id !== contactId));
    } catch {
      // تجاهل
    }
  };

  return (
    <section className="ct fp-glass">
      <h2 className="fp-stage__title">{c.title}</h2>
      <p className="fp-stage__desc">{c.desc}</p>

      {/* قائمة جهات الاتصال المحفوظة */}
      {contacts.length > 0 ? (
        <div className="ct-list">
          {contacts.map((contact, i) => (
            <div className="ct-card" key={contact.id}>
              <div className="ct-card__head">
                <span className="ct-card__index" aria-hidden="true">{i + 1}</span>
                <div className="ct-card__info">
                  <p className="ct-card__name">{contact.name}</p>
                  {contact.role && <p className="ct-card__role">{contact.role}</p>}
                </div>
                <button
                  type="button"
                  className="ct-card__del"
                  onClick={() => handleDelete(contact.id)}
                  aria-label={c.remove}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  </svg>
                </button>
              </div>
              <div className="ct-card__phones">
                <span className="ct-card__phone">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  {contact.phone}
                </span>
                {contact.whatsapp && (
                  <span className="ct-card__whatsapp">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    {contact.whatsapp}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="ct-empty">{c.empty}</p>
      )}

      {/* زر الإضافة */}
      {!atMax && !showForm && (
        <button type="button" className="ct-add" onClick={() => setShowForm(true)}>
          + {c.addBtn}
        </button>
      )}
      {atMax && <p className="ct-note ct-note--warn">{c.maxNote}</p>}

      {/* فورم الإضافة */}
      {showForm && (
        <div className="ct-form">
          <label className="ct-label">{c.nameLabel}</label>
          <input
            type="text"
            maxLength={100}
            className="ct-input"
            value={formData.name}
            placeholder={c.namePh}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <label className="ct-label">{c.roleLabel}</label>
          <input
            type="text"
            maxLength={100}
            className="ct-input"
            value={formData.role}
            placeholder={c.rolePh}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          />

          <label className="ct-label">{c.phoneLabel}</label>
          <input
            type="tel"
            dir="ltr"
            maxLength={20}
            className="ct-input ct-input--ltr"
            value={formData.phone}
            placeholder={c.phonePh}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <label className="ct-label">{c.whatsappLabel}</label>
          <input
            type="tel"
            dir="ltr"
            maxLength={20}
            className="ct-input ct-input--ltr"
            value={formData.whatsapp}
            placeholder={c.whatsappPh}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
          />

          {error && <p className="ct-error">{error}</p>}

          <div className="ct-form__actions">
            <button
              type="button"
              className="ct-btn ct-btn--cancel"
              onClick={() => { setShowForm(false); setError(''); }}
            >
              {c.remove}
            </button>
            <button
              type="button"
              className="ct-btn ct-btn--save"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? c.saving : c.save}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}