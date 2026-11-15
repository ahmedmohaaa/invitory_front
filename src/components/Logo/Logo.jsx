import SiteLogo from '../SiteLogo/SiteLogo';
import './Logo.css';

/** Brand mark compact — Navbar & Footer */
export default function Logo({ light = true }) {
  return (
    <a href="#home" className="logo" aria-label="Invitory — Home">
      <SiteLogo variant={light ? 'light' : 'dark'} className="logo__inner" />
    </a>
  );
}
