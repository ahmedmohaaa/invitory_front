import { useLanguage } from '../../../../context/LanguageContext';
import { useDesign } from '../../context/DesignContext';
import StageBasicInfo from '../stages/StageBasicInfo';
import StageLanguage from '../stages/StageLanguage';
import StageOccasion from '../stages/StageOccasion';   // ← إضافة
import StagePagesTheme from '../stages/StagePagesTheme';   // ← إضافة
import StageFamilyText from '../stages/StageFamilyText';   // ← إضافة
import StageVenueLocation from '../stages/StageVenueLocation';   // ← إضافة
import StageProgram from '../stages/StageProgram';   // ← إضافة
import StageEventDetails from '../stages/StageEventDetails';   // ← إضافة
import StageAccommodation from '../stages/StageAccommodation';   // ← إضافة
import StageGallery from '../stages/StageGallery';   // ← إضافة
import StagePersonalMessage from '../stages/StagePersonalMessage';   // ← إضافة
import StageContacts from '../stages/StageContacts';   // ← إضافة
import StageMusic from '../stages/StageMusic';   // ← إضافة
import StageGift from '../stages/StageGift';   // ← إضافة
import StageCamera from '../stages/StageCamera';   // ← إضافة
import StageQRCheckin from '../stages/StageQRCheckin';   // ← إضافة
import StageRSVPSettings from '../stages/StageRSVPSettings';   // ← إضافة
import StageExtraSettings from '../stages/StageExtraSettings';   // ← إضافة
import DirectionStep from '../stages/DirectionStep';   // ✅ الخطوة 0 — اتجاه تحرك الدعوة

import './FormPanel.css';

const COPY = {
  ar: {
    panelTitle: 'مراحل البناء',
    setup: 'الإعداد',
    direction: 'اتجاه الحركة',
    locked: 'تُفتح تباعاً',
    stage1Title: 'الخطوة 1 — معمارية الصفحة',
    stage1Desc: 'الصفحة ثابتة لا تُعاد تحميلها: البيانات تُحرَّر هنا وتنعكس لحظياً في المعاينة الحية عبر الـ State المركزي. كل مرحلة قادمة تُركَّب داخل هذا الإطار دون تغيير الهيكل.',
    legendForm: 'نموذج الإدخال',
    legendPreview: 'معاينة حية',
    comingSoon: 'هذه المرحلة تُبنى في خطوتها المحددة بالخريطة.',

  },
  en: {
    panelTitle: 'Build Stages',
    setup: 'Setup',
    direction: 'Direction',
    locked: 'Unlocks progressively',
    stage1Title: 'Step 1 — Page Architecture',
    stage1Desc: 'The page never reloads: data is edited here and reflected instantly in the live preview through the central state. Every upcoming stage plugs into this frame without touching the layout.',
    legendForm: 'Input Form',
    legendPreview: 'Live Preview',
    comingSoon: 'This stage is built in its own roadmap step.',
  },
};

/* 🗺️ manifest المراحل (هيكل فقط — المحتوى يُبنى في خطواته) */
const MANIFEST = [
  'لغة الدعوة', 'نوع المناسبة', 'صفحات القالب والتنسيق', 'المعلومات الأساسية',
  'نص الدعوة والعائلة', 'المكان والموقع', 'برنامج الحفل', 'تفاصيل الحدث',
  'أين تقيمون', 'معرض الصور', 'رسالة شخصية', 'جهات الاتصال',
  'الموسيقى', 'الهدية', 'الكاميرا', 'دخول QR', 'تأكيد الحضور RSVP','اعدادات اضافيه'
];

/* 🔓 عدد مراحل الإدخال المفتوحة حالياً (يزيد 1 مع كل خطوة نبرمجها) */
const UNLOCKED_STAGES = 18;

/* 🧩 سجل مكونات المراحل — مفتاح واحد جديد لكل خطوة */
const STAGE_COMPONENTS = { 0: DirectionStep, 1: StageLanguage, 2: StageOccasion, 3: StagePagesTheme, 4: StageBasicInfo, 5: StageFamilyText, 6: StageVenueLocation, 7: StageProgram, 8: StageEventDetails, 9: StageAccommodation, 10: StageGallery, 11: StagePersonalMessage, 12: StageContacts, 13: StageMusic, 14: StageGift, 15: StageCamera, 16: StageQRCheckin, 17: StageRSVPSettings, 18: StageExtraSettings };

function ComingSoon() {
  const { lang } = useLanguage();
  return <section className="fp-stage fp-glass fp-stage--soon"><p>{COPY[lang].comingSoon}</p></section>;
}

export default function FormPanel() {
  const { lang } = useLanguage();
  const { state, setStage } = useDesign();
  const c = COPY[lang];
  const Stage = STAGE_COMPONENTS[state.meta.stage] || ComingSoon;

  return (
    <aside className="fp" aria-label={c.panelTitle}>
      {/* شريط المراحل: الاتجاه + المرحلة 1 مفتوحة + الباقي مقفول */}
      <div className="fp-rail" role="tablist">
        <button
          className={`fp-rail__node ${state.meta.stage === 0 ? 'is-active' : ''}`}
          onClick={() => setStage(0)}
        >
          <i>✦</i><span>{c.direction}</span>
        </button>
        {MANIFEST.map((label, i) => {
          const stageId = i + 1;
          const locked = stageId > UNLOCKED_STAGES;
          return (
            <button
              key={label}
              className={`fp-rail__node ${state.meta.stage === stageId ? 'is-active' : ''} ${locked ? 'is-locked' : ''}`}
              title={locked ? c.locked : label}
              disabled={locked}
              onClick={() => setStage(stageId)}
            >
              <i>{i + 1}</i><span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* منطقة محتوى المرحلة — الصفحة ثابتة والمحتوى يتبدل هنا */}
      <div className="fp-body">
        <Stage />
      </div>
    </aside>
  );
}