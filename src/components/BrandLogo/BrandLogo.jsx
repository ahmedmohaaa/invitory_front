import logoImg from '../../assets/invitory-logo.jpeg';
import './BrandLogo.css';

/**
 * 🖼️ قفل الشعار الكامل — صورة رسمية (تحتوي التغلاين داخلها بالفعل)
 * نفس الـ API القديم: withTagline | animated | className
 */
export default function BrandLogo({ withTagline = false, animated = false, className = '' }) {
  return (
    <div className={`brand ${animated ? 'brand--animated' : ''} ${className}`}>
      <img
        src={logoImg}
        alt="Invitory — Invitations • Moments • Memories"
        className="brand__img"
        draggable="false"
      />
    </div>
  );
}
