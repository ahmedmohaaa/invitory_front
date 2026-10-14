import { useLanguage } from '../../../../context/LanguageContext';
import { useDesign } from '../../context/DesignContext';
import RichEditor from '../RichEditor/RichEditor';
import './StageFamilyText.css';
import Switch from '../Switch/Switch';
const COPY = {
  ar: {
    title: 'نص الدعوة وتفاصيل العائلة',
    desc: 'تحكم في ظهور أسماء العائلات، واكتب نص دعوتك بمحرر غني يشبه الوورد — ينعكس كل شيء لحظياً في الصفحة الثانية من المعاينة.',
    hideToggle: 'إخفاء أسماء العائلة',
    hideHint: 'عند التفعيل تختفي حقول العائلتين ويبقى نص الدعوة فقط.',
    family1: 'اسم العائلة (الأول)',
    family2: 'اسم العائلة (الثاني)',
    family1Ph: 'مثال: آل الشريف',
    family2Ph: 'مثال: آل المنصور',
    namesFont: 'نوع كتابة أسماء العائلات',
    textTitle: 'نص الدعوة',
    editorPlaceholder: 'اكتب نص دعوتك هنا... مثال: يشرفنا دعوتكم لحضور حفل زفاف...',
    previewNote: 'يظهر النص داخل البوكس المتبلر في الصفحة الثانية.',
  },
  en: {
    title: 'Invitation Text & Family Details',
    desc: 'Control family names visibility and write your invitation with a Word-like rich editor — everything reflects instantly on preview page two.',
    hideToggle: 'Hide family names',
    hideHint: 'When on, family fields hide and only the invitation text remains.',
    family1: 'Family name (first)',
    family2: 'Family name (second)',
    family1Ph: 'e.g. Al-Sharif Family',
    family2Ph: 'e.g. Al-Mansour Family',
    namesFont: 'Family names writing style',
    textTitle: 'Invitation text',
    editorPlaceholder: 'Write your invitation here... e.g. We honor you with an invitation to...',
    previewNote: 'The text appears inside the glass box on page two.',
  },
};

/** 📝 الخطوة 6 — نص الدعوة وتفاصيل العائلة */
export default function StageFamilyText() {
  const { lang } = useLanguage();
  const { state, update, toggle, fonts, fontsLoading } = useDesign();
  const c = COPY[lang];

  const family = state.family || {};

  return (
    <section className="ft fp-glass">
      <h2 className="fp-stage__title">{c.title}</h2>
      <p className="fp-stage__desc">{c.desc}</p>

      {/* 🔀 Toggle إخفاء أسماء العائلة */}
      <Switch
        checked={!!family.hideFamilyNames}
        onChange={() => toggle('family.hideFamilyNames')}
        label={c.hideToggle}
        hint={c.hideHint}
      />

      {/* 👪 حقول العائلات (تختفي مع الـ Toggle) */}
      {!family.hideFamilyNames && (
        <div className="ft-families">
          <div className="ft-grid">
            <div>
              <label className="ft-label">{c.family1}</label>
              <input
                type="text"
                maxLength={60}
                className="ft-input"
                value={family.familyName1 || ''}
                placeholder={c.family1Ph}
                onChange={(e) => update('family.familyName1', e.target.value)}
              />
            </div>
            <div>
              <label className="ft-label">{c.family2}</label>
              <input
                type="text"
                maxLength={60}
                className="ft-input"
                value={family.familyName2 || ''}
                placeholder={c.family2Ph}
                onChange={(e) => update('family.familyName2', e.target.value)}
              />
            </div>
          </div>

          <label className="ft-label">{c.namesFont}</label>
          <div className="ft-fonts">
            {fontsLoading && <span className="ft-hint">…</span>}
            {!fontsLoading && fonts.map((f) => (
              <button
                key={f.key}
                type="button"
                style={{ fontFamily: f.css }}
                className={`ft-fontchip ${(family.namesFont || state.theme?.font) === f.key ? 'is-selected' : ''}`}
                onClick={() => update('family.namesFont', f.key)}
              >
                {f.labels?.[lang] || f.key}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ✍️ المحرر الغني (يظهر في الحالتين) */}
      <label className="ft-label">{c.textTitle}</label>
      <RichEditor
        value={family.invitationHtml || ''}
        dir={family.invitationDir || 'rtl'}
        placeholder={c.editorPlaceholder}
        onChange={(html) => update('family.invitationHtml', html)}
        onDirChange={(d) => update('family.invitationDir', d)}
      />
      <p className="ft-note">✦ {c.previewNote}</p>
    </section>
  );
}