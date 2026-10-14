import galleryImg from '../../assets/pngtree-family-gathering-in-living-room-png-image_15020362.png';
import './InviteCard.css';

/* style للصورة الكبيرة داخل القوس — يحافظ على الـ border-radius من الـ CSS */
const photoStyle = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

/** موديل دعوة رقمية زخرفي — مشترك بين Hero وقسم Connected. */
export default function InviteCard({ className = '' }) {
  return (
    <figure className={`invite ${className}`} aria-hidden="true">
      <div className="invite__top"><span>INVITORY</span><span>2026</span></div>

      {/* ✅ الصورة الكبيرة داخل القوس (بدلاً من التدرج اللوني) */}
      <div className="invite__photo">
        <img src={galleryImg} alt="" style={photoStyle} />
      </div>

      <div className="invite__body">
        <p className="invite__kicker">— YOU'RE INVITED —</p>
        <p className="invite__names">Olivia &amp; James</p>
        <p className="invite__line">We would love to celebrate this special day with you.</p>
        <p className="invite__meta"><span className="invite__dot" /> 12 September 2026 · 18:00</p>
        <p className="invite__meta"><span className="invite__dot" /> Garden Hall · Istanbul</p>
      </div>
    </figure>
  );
}