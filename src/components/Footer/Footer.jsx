import { useLanguage } from '../../context/LanguageContext';
import Logo from '../Logo/Logo';
import './Footer.css';

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="footer" id="contact">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo light />
          <p className="footer__tagline">{t('footer.tagline')}</p>
        </div>

        <nav className="footer__col" aria-label="Footer">
          <h3>{t('footer.quickLinks')}</h3>
          <ul>
            <li><a href="#prices">{t('nav.prices')}</a></li>
            <li><a href="#templates">{t('nav.templates')}</a></li>
            <li><a href="#studio">{t('nav.studio')}</a></li>
          </ul>
        </nav>

        <address className="footer__col footer__contact">
          <h3>{t('footer.contactTitle')}</h3>
          <a href={`mailto:${t('footer.email')}`}>{t('footer.email')}</a>
          <a href={`tel:${t('footer.phone').replace(/\s/g, '')}`}>{t('footer.phone')}</a>
        </address>
      </div>

      <p className="footer__rights container">
        © {year} Invitory — {t('footer.rights')}
      </p>
    </footer>
  );
}