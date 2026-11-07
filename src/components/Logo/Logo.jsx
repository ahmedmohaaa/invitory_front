import './Logo.css';

/** Brand mark: navy envelope + gold swoosh + wordmark (inline SVG = zero requests). */
export default function Logo({ light = false }) {
  return (
    <a href="#home" className={`logo ${light ? 'logo--light' : ''}`} aria-label="Invitory — Home">
      <svg className="logo__mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <rect x="8" y="24" width="48" height="30" rx="4" fill="currentColor" />
        <rect x="18" y="10" width="28" height="26" rx="3" fill="#F6F3EC" stroke="#C6A15B" strokeWidth="1.6" />
        <path d="M32 15c2.2 3.2 4.2 4.4 4.2 6.6 0 2.2-2 3.2-4.2 3.2s-4.2-1-4.2-3.2c0-2.2 2-3.4 4.2-6.6z" fill="#C6A15B" />
        <path d="M24 30h16M26.5 34h11" stroke="#C6A15B" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8 28l24 15 24-15" fill="none" stroke="#C6A15B" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M55 32c7 8 3 18-8 22" fill="none" stroke="#C6A15B" strokeWidth="3.4" strokeLinecap="round" />
      </svg>
      <span className="logo__word">invitory</span>
    </a>
  );
}