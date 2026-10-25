import { useLanguage } from '../../context/LanguageContext';
import Logo from '../Logo/Logo';
import './Footer.css';

export default function Footer() {
  const { t, lang } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="footer" id="contact">
      {/* خط متوهج علوي يفصل الفوتر */}
      <div className="footer__glow-line" aria-hidden="true" />
      
      <div className="container footer__grid">
        {/* 1. العلامة التجارية */}
        <div className="footer__brand">
          <Logo light />
          <p className="footer__tagline">{t('footer.tagline')}</p>
        </div>

        {/* 2. الروابط السريعة */}
        <nav className="footer__col" aria-label="Footer">
          <h3>{t('footer.quickLinks')}</h3>
          <ul>
            <li><a href="#prices">{t('nav.prices')}</a></li>
            <li><a href="#templates">{t('nav.templates')}</a></li>
            <li><a href="#studio">{t('nav.studio')}</a></li>
          </ul>
        </nav>

        {/* 3. معلومات التواصل (مع أيقونات) */}
        <address className="footer__col footer__contact">
          <h3>{t('footer.contactTitle')}</h3>
          <a href={`mailto:${t('footer.email')}`} className="footer__contact-link">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>{t('footer.email')}</span>
          </a>
          <a href={`tel:${t('footer.phone').replace(/\s/g, '')}`} className="footer__contact-link">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
            </svg>
            <span>{t('footer.phone')}</span>
          </a>
        </address>
      </div>

      {/* 4. حقوق النشر */}
      <div className="footer__bottom">
        <p className="footer__rights container">
          © {year} <strong>Invitory</strong> — {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
}