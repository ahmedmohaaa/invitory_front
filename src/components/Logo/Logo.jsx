import './Logo.css';

/** Brand mark: cyber envelope + neon swoosh + wordmark (inline SVG = zero requests). */
export default function Logo({ light = false }) {
  return (
    <a href="#home" className={`logo ${light ? 'logo--light' : ''}`} aria-label="Invitory — Home">
      <svg className="logo__mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        {/* ظهر الظرف — أسود داكن */}
        <rect x="8" y="24" width="48" height="30" rx="4" fill="#0a0a0a" stroke="#22aaff" strokeWidth="1.2" />
        
        {/* بطاقة الدعوة — بيضاء مع حدود نيون */}
        <rect x="18" y="10" width="28" height="26" rx="3" fill="#ffffff" stroke="#22aaff" strokeWidth="1.4" />
        
        {/* ختم نيون في وسط البطاقة */}
        <circle cx="32" cy="22" r="5" fill="none" stroke="#22aaff" strokeWidth="1.6" />
        <circle cx="32" cy="22" r="2" fill="#22aaff" />
        
        {/* خطوط نصية على البطاقة */}
        <path d="M24 30h16M26.5 34h11" stroke="#22aaff" strokeWidth="1.4" strokeLinecap="round" />
        
        {/* وجه الظرف — مثلثات نيون */}
        <path d="M8 28l24 15 24-15" fill="none" stroke="#22aaff" strokeWidth="2" strokeLinejoin="round" />
        
        {/* الوشاح النيون المتوهج */}
        <path 
          d="M55 32c7 8 3 18-8 22" 
          fill="none" 
          stroke="#22aaff" 
          strokeWidth="3.2" 
          strokeLinecap="round"
          className="logo__swoosh"
        />
      </svg>
      <span className="logo__word">invitory</span>
    </a>
  );
}