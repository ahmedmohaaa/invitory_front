import { useId } from 'react';
import './SiteLogo.css';

/**
 * 🎨 شعار Invitory الرسمي — مطابق للصورة المعتمدة
 * (ظرف كحلي + بطاقة ذهبية + شرارة + wordmark serif + tagline)
 *
 * Props:
 *  - variant: 'dark' (خلفية فاتحة) | 'light' (خلفية داكنة) | 'neon' (هوية Cyber)
 *  - withTagline: إظهار سطر "Invitations • Moments • Memories"
 *  - animated: أنيميشن دخول (شاشة التحميل)
 */
export default function SiteLogo({ variant = 'dark', withTagline = false, animated = false, className = '' }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const goldId = `slGold-${uid}`;

  return (
    <span
      className={`sitelogo sitelogo--${variant} ${animated ? 'sitelogo--animated' : ''} ${className}`}
    >
      <svg
        className="sitelogo__svg"
        viewBox={withTagline ? '0 0 560 172' : '0 0 560 140'}
        role="img"
        aria-label="Invitory — Invitations, Moments, Memories"
      >
        <defs>
          <linearGradient id={goldId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--sl-gold-1)" />
            <stop offset="1" stopColor="var(--sl-gold-2)" />
          </linearGradient>
        </defs>

        {/* 💳 البطاقة الذهبية المائلة */}
        <g transform="rotate(-10 72 58)">
          <rect x="40" y="34" width="66" height="48" rx="9" fill={`url(#${goldId})`} />
        </g>

        {/* ✨ الشرارة */}
        <path
          className="sl-spark"
          d="M121 6c3 14 7 18 21 21-14 3-18 7-21 21-3-14-7-18-21-21 14-3 18-7 21-21z"
          fill={`url(#${goldId})`}
        />

        {/* ✉️ جسم الظرف */}
        <rect x="18" y="64" width="132" height="72" rx="12" fill="var(--sl-env)" />

        {/* جيب الظرف الأمامي بفتحة V */}
        <path
          d="M18 78 L84 122 L150 78 L150 124 c0 7 -5 12 -12 12 L30 136 c-7 0 -12 -5 -12 -12 Z"
          fill="var(--sl-env-front)"
        />

        {/* 🖋️ الكلمة */}
        <text x="176" y="118" className="sitelogo__word">Invitory</text>

        {/* 📜 الشعار السطري */}
        {withTagline && (
          <text x="180" y="158" className="sitelogo__tag">Invitations • Moments • Memories</text>
        )}
      </svg>
    </span>
  );
}
