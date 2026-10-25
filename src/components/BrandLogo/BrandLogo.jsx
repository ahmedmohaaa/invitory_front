import './BrandLogo.css';

/**
 * قفل الشعار الكامل: ظرف + بطاقة + وشاح أزرق نيون + wordmark + شعار سطري اختياري.
 * Props: withTagline | animated | className
 */
export default function BrandLogo({ withTagline = false, animated = false, className = '' }) {
  return (
    <div className={`brand ${animated ? 'brand--animated' : ''} ${className}`}>
      <svg className="brand__mark" viewBox="0 0 200 150" aria-hidden="true" focusable="false">
        {/* ظهر الظرف المفتوح — أسود */}
        <path d="M62 62 L100 34 L138 62 Z" fill="#000" />
        
        {/* بطاقة الدعوة — أبيض مزرق */}
        <g transform="rotate(-3 100 55)">
          <rect x="68" y="26" width="64" height="54" rx="4" fill="#f0f8ff" />
          <rect x="74" y="32" width="52" height="42" rx="3" fill="none" stroke="#22aaff" strokeWidth="1.6" />
          <path d="M100 40c2.6 4.4 5.2 6.2 5.2 9.3 0 3.1-2.6 4.9-5.2 4.9s-5.2-1.8-5.2-4.9c0-3.1 2.6-4.9 5.2-9.3z" fill="#22aaff" />
          <path d="M86 62h28M90 68h20" stroke="#22aaff" strokeWidth="2" strokeLinecap="round" />
        </g>
        
        {/* وجه الظرف — أسود */}
        <path d="M56 60h88v50a8 8 0 0 1-8 8H64a8 8 0 0 1-8-8Z" fill="#000" />
        <path d="M56 60 L100 92 L144 60" fill="none" stroke="#22aaff" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M58 116 L100 92" stroke="#22aaff" strokeWidth="2.4" strokeLinecap="round" />
        
        {/* الوشاح الأزرق النيون */}
        <path d="M60 118 C 92 104, 122 98, 140 80 L 147 90 C 128 108, 96 114, 68 124 Z" fill="#22aaff" />
        <path d="M140 78 C 158 90, 156 108, 136 116 C 150 104, 150 90, 140 78 Z" fill="#22aaff" />
      </svg>

      {/* wordmark: حروف i بدون نقطة + نقاط زرقاء نيون */}
      <span className="brand__word" aria-label="Invitory">
        <span className="brand__i">ı</span>nv<span className="brand__i">ı</span>tory
      </span>

      {withTagline && (
        <span className="brand__tag">Cards &amp; Invitations for Every Occasion</span>
      )}
    </div>
  );
}