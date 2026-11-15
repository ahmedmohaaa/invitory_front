import SiteLogo from '../SiteLogo/SiteLogo';
import './BrandLogo.css';

/**
 * قفل الشعار الكامل (نفس الـ API القديم: withTagline | animated | className)
 * يُستخدم في: Preloader / Login / Signup
 */
export default function BrandLogo({ withTagline = false, animated = false, className = '' }) {
  return (
    <div className={`brand ${className}`}>
      <SiteLogo
        variant="light"
        withTagline={withTagline}
        animated={animated}
        className="brand__logo"
      />
    </div>
  );
}
