import { useLanguage } from '../../context/LanguageContext';
import InviteCard from '../InviteCard/InviteCard';
import galleryImg from '../../assets/pngtree-family-gathering-in-living-room-png-image_15020362.png';
import h1 from '../../assets/h1.jfif';
import h2 from '../../assets/h2.jpg';
import h3 from '../../assets/h3.jpg';
import h4 from '../../assets/h4.webp';
import h5 from '../../assets/h5.webp';
import './Connected.css';

const COPY = {
  ar: {
    eyebrow: 'حدث واحد، متصل بالكامل',
    title: 'اجمع كل لحظة. ادعُ. واعرف من سيحضر.',
    sub: 'معرض حدثك وقائمة ضيوفك لا يجب أن يعيشا في أداتين منفصلتين. Invitory يربط رحلة الحدث كاملة في مكان واحد.',
    card1Badge: '٠١ · معرض مشترك',
    card1Title: 'كل زاوية، في معرض واحد مشترك.',
    card1Sub: 'يمسح الضيوف رمز QR ويضيفون صوراً وفيديوهات بالجودة الأصلية ورسائل صوتية حتى ٦٠ ثانية من المتصفح مباشرة.',
    card2Badge: '٠٢ · دعوة رقمية',
    card2Title: 'الدعوة الجديدة رقمية.',
    card2Sub: 'اختر تصميماً، شارك كل التفاصيل، وأدر من سيحضر وعدد مرافقيه واحتياجاتهم من شاشة واحدة.',
    pill: 'ليست أداتين منفصلتين. حدث واحد من Invitory.',
    rsvp: 'RSVP', yes: '✓ 48', no: '+3',
  },
  en: {
    eyebrow: 'ONE EVENT, FULLY CONNECTED',
    title: 'Collect every moment. Invite. Know who is coming.',
    sub: 'Your event gallery and guest list should not live in separate tools. Invitory connects the full event journey in one place.',
    card1Badge: '01 · SHARED GALLERY',
    card1Title: 'Every angle, one shared gallery.',
    card1Sub: 'Guests scan the QR code and add original-quality photos, videos and 60-second voice messages from their browser.',
    card2Badge: '02 · DIGITAL INVITATION',
    card2Title: 'The new invitation is digital.',
    card2Sub: 'Choose a style, share every detail, and manage who is coming, how many they bring and what they need from one screen.',
    pill: 'Not two separate tools. One Invitory event.',
    rsvp: 'RSVP', yes: '✓ 48', no: '+3',
  },
};

/* style مشترك للصورة داخل كل بلاطة — يحافظ على الـ border-radius من الـ CSS */
const tileImgStyle = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

/** قسم "حدث واحد متصل بالكامل" — بطاقتان: معرض داكن + دعوة رقمية. */
export default function Connected() {
  const { lang } = useLanguage();
  const c = COPY[lang];

  return (
    <section className="connected" aria-labelledby="connected-title">
      <header className="connected__head container">
        <span className="connected__eyebrow">{c.eyebrow}</span>
        <h2 className="connected__title" id="connected-title">{c.title}</h2>
        <p className="connected__sub">{c.sub}</p>
      </header>

      <div className="container connected__grid">
        {/* ٠١ المعرض المشترك (داكن) */}
        <article className="ccard ccard--dark">
          <div className="ccard__top">
            <span className="ccard__badge ccard__badge--dark">{c.card1Badge}</span>
            <span className="ccard__qr" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M3 3h8v8H3zM5 5v4h4V5zM13 3h8v8h-8zM15 5v4h4V5zM3 13h8v8H3zM5 15v4h4v-4zM13 13h2v2h-2zM17 15h2v2h-2zM13 17h2v2h-2zM17 19h2v2h-2zM19 13h2v2h-2z"/>
              </svg>
            </span>
          </div>
          <h3 className="ccard__title ccard__title--light">{c.card1Title}</h3>
          <p className="ccard__sub ccard__sub--light">{c.card1Sub}</p>
          <div className="ccard__tiles" aria-hidden="true">
            <span className="ctile ctile--1" style={{ position: 'relative', overflow: 'hidden' }}><img src={h1} alt="" style={tileImgStyle} /></span>
            <span className="ctile ctile--2" style={{ position: 'relative', overflow: 'hidden' }}><img src={h2} alt="" style={tileImgStyle} /></span>
            <span className="ctile ctile--3" style={{ position: 'relative', overflow: 'hidden' }}><img src={h3} alt="" style={tileImgStyle} /></span>
            <span className="ctile ctile--4" style={{ position: 'relative', overflow: 'hidden' }}><img src={h4} alt="" style={tileImgStyle} /></span>
            <span className="ctile ctile--5" style={{ position: 'relative', overflow: 'hidden' }}><img src={h5} alt="" style={tileImgStyle} /></span>
            <span className="ctile ctile--6" style={{ position: 'relative', overflow: 'hidden' }}><img src={galleryImg} alt="" style={tileImgStyle} /></span>
          </div>
        </article>

        {/* ٠٢ الدعوة الرقمية (وردي فاتح) */}
        <article className="ccard ccard--blush">
          <div className="ccard__top">
            <span className="ccard__badge ccard__badge--pink">{c.card2Badge}</span>
          </div>
          <h3 className="ccard__title">{c.card2Title}</h3>
          <p className="ccard__sub">{c.card2Sub}</p>
          <div className="ccard__stage">
            <InviteCard className="ccard__invite" />
            <div className="ccard__rsvp" aria-hidden="true">
              <span className="ccard__rsvp-title">{c.rsvp}</span>
              <span className="ccard__rsvp-row">
                <em className="ccard__chip ccard__chip--yes">{c.yes}</em>
                <em className="ccard__chip ccard__chip--no">{c.no}</em>
              </span>
            </div>
          </div>
        </article>
      </div>

      <p className="connected__pill">{c.pill}</p>
    </section>
  );
}