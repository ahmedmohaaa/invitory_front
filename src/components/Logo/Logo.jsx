import logoImg from '../../assets/invitory-logo.jpeg';
import './Logo.css';

/** 🖼️ اللوجو الرسمي — صورة مطابقة للمرفق */
export default function Logo({ light = false, className = '' }) {
  return (
    <a href="#home" className={`logo ${light ? 'logo--light' : ''} ${className}`} aria-label="Invitory — Home">
      <img
        src={logoImg}
        alt="Invitory — Invitations • Moments • Memories"
        className="logo__img"
        draggable="false"
      />
    </a>
  );
}
