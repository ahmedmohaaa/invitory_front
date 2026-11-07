import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { fetchUnread } from '../../services/notifications';
import api from '../../services/api';
import Logo from '../Logo/Logo';
import './Navbar.css';

/**
 * Navbar بهوية الصور الجديدة:
 *  - شعار + سطر شعار صغير
 *  - روابط وسطية مع خط تحت الرابط النشط
 *  - كرة اللغة + أيقونة المستخدم + كبسولة CTA داكنة
 *  - 🔔 جرس تنبيهات ديناميكي (استطلاع 30 ثانية + قائمة منسدلة)
 *  - كل الوظائف القديمة محفوظة كما هي (زجاج، قوائم، حذف حساب، موبايل)
 */
export default function Navbar() {
  const { t, lang, toggleLang } = useLanguage();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [active, setActive] = useState('#home');

  /* REQUIRED auth-state flag */
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /* 🔔 حالة التنبيهات (الجرس الديناميكي) */
  const [unread, setUnread] = useState({ total: 0, items: [] });
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  /* 🆕 حالة نافذة تأكيد حذف الحساب */
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePass, setDeletePass] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const authRef = useRef(null);

  /* Glass effect after scrolling */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close dropdowns on outside click (يشمل قائمة التنبيهات أيضاً) */
  useEffect(() => {
    const onClick = (e) => {
      if (authRef.current && !authRef.current.contains(e.target)) setAuthOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  /* 🆕 مزامنة حالة الدخول مع AuthContext الحقيقي */
  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  /* 🔔 استطلاع التنبيهات كل 30 ثانية — محصّن ضد جميع الأخطاء */
  /* 🔔 استطلاع التنبيهات كل 30 ثانية — ذكي ومحصّن */
  useEffect(() => {
    /* لا تستطلع إلا بوجود المستخدم + token */
    const token = localStorage.getItem('access_token');
    if (!user || !token) {
      setUnread({ total: 0, items: [] });
      return undefined;
    }

    let alive = true;
    let failCount = 0;
    const MAX_FAILS = 3;  /* بعد 3 إخفاقات متتالية، أوقف الاستطلاع */

    const poll = async () => {
      if (!alive) return;
      const currentToken = localStorage.getItem('access_token');
      if (!currentToken) { alive = false; return; }

      try {
        const data = await fetchUnread();
        if (!alive) return;
        if (data && typeof data.total === 'number') {
          setUnread(data);
          failCount = 0;  /* نجاح → تصفير العداد */
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }

      /* إيقاف الاستطلاع إذا فشل عدة مرات متتالية (token منتهي) */
      if (failCount >= MAX_FAILS) {
        alive = false;
      }
    };

    poll();
    const timer = setInterval(() => {
      if (alive) poll();
    }, 30000);

    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [user]);

  /* 🆕 الاسم الأول للمستخدم المسجل */
  const firstName = (user?.username || user?.email || 'Invitory').split(/[\s_.-]+/)[0];

  /* 🆕 حذف الحساب عبر الـ API */
  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await api.post('/auth/delete-account/', { password: deletePass });
      setDeleteOpen(false);
      logout();
      navigate('/');
    } catch (err) {
      setDeleteError(
        err?.response?.data?.error ||
        (lang === 'ar' ? 'تعذر حذف الحساب، حاول مجدداً.' : 'Could not delete the account, try again.')
      );
    } finally {
      setDeleting(false);
    }
  };

  /* روابط بهوية التصميم الجديد */
  const links = [
    { href: '/', ar: 'الرئيسية', en: 'Home' },
    { href: '/templates', ar: 'القوالب', en: 'Templates', isRoute: true },
    { href: '/invitations/create', ar: 'الاستوديو', en: 'Studio' },
{ href: '/pricing', ar: 'الأسعار', en: 'Pricing', route: true },
{ href: '/tutorial', ar: 'الدليل', en: 'Guide', route: true },
    { href: '#contact', ar: 'تواصل معنا', en: 'Contact' },
  ];

  const ctaLabel = lang === 'ar' ? 'ابدأ الآن' : 'Get Started';
  const tagline = lang === 'ar' ? 'الدعوات .. قصص لا تنتهي' : 'Every Event Has a Story.';

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <nav className="navbar__inner container" aria-label="Main">
        {/* الشعار + السطر الصغير */}
        <button type="button" className="navbar__brand" onClick={() => { setActive('#home'); navigate('/'); }}>
          <Logo />
          <span className="navbar__tagline">{tagline}</span>
        </button>

        {/* الروابط الوسطى */}
        <ul className="navbar__links">
          {links.map((l) => (
            <li key={l.href}>
              <a
                className={`navbar__link ${active === l.href ? 'is-active' : ''}`}
                href={l.href}
                onClick={() => setActive(l.href)}
              >
                {lang === 'ar' ? l.ar : l.en}
              </a>
            </li>
          ))}
        </ul>

        <div className="navbar__actions">
          {/* كرة اللغة */}
          <button className="navbar__lang" onClick={toggleLang} aria-label={t('auth.switchLang')}>
            <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
            </svg>
            <span>{lang === 'ar' ? 'AR' : 'EN'}</span>
            <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {/* ---------- منطقة المصادقة ---------- */}
          {isLoggedIn ? (
            <div className="navbar__user" ref={authRef}>
              {/* 🔔 الجرس الديناميكي + القائمة المنسدلة */}
              <div className="navbar__notif" ref={notifRef}>
                <button
                  className="navbar__bell"
                  aria-label={t('auth.notifications')}
                  onClick={() => setNotifOpen((v) => !v)}
                >
                  <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
                    <path d="M13.7 21a2 2 0 01-3.4 0" />
                  </svg>
                  {unread.total > 0 && (
                    <span className="navbar__badge">{unread.total > 9 ? '9+' : unread.total}</span>
                  )}
                </button>

                {notifOpen && (
                  <div className="navbar__notif-drop">
                    {unread.items.length === 0 ? (
                      <p className="navbar__notif-empty">
                        {lang === 'ar' ? 'لا توجد ردود جديدة 🎉' : 'No new responses 🎉'}
                      </p>
                    ) : (
                      unread.items.map((it) => (
                        <button
                          key={it.invitation_id}
                          className="navbar__notif-item"
                          onClick={() => { setNotifOpen(false); navigate(`/dashboard/${it.invitation_id}`); }}
                        >
                          <strong>{it.title}</strong>
                          <span>
                            {lang === 'ar'
                              ? `${it.count} رد جديد — آخرها: ${it.last_guest}`
                              : `${it.count} new — last: ${it.last_guest}`}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* كبسولة الملف الشخصي */}
              <button
                className={`navbar__pill ${authOpen ? 'is-open' : ''}`}
                onClick={() => setAuthOpen((v) => !v)}
                aria-haspopup="menu" aria-expanded={authOpen}
                title={firstName}
              >
                <span className="navbar__avatar" aria-hidden="true">
                  {(user?.username || user?.email || 'I').charAt(0).toUpperCase()}
                </span>
                <span className="navbar__name">{firstName}</span>
                <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {/* قائمة المستخدم المسجل */}
              <div className={`navbar__dropdown ${authOpen ? 'is-visible' : ''}`} role="menu">
                <button role="menuitem" className="navbar__item"
                        onClick={() => { setAuthOpen(false); navigate('/my-invitations'); }}>
                  <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" />
                    <rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" />
                  </svg>
                  <span>{t(lang === 'ar' ? 'لوحتي' : 'My Dashboard')}</span>
                </button>

                <button role="menuitem" className="navbar__item"
                        onClick={() => { setAuthOpen(false); logout(); navigate('/'); }}>
                  <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  <span>{t('auth.logout') || (lang === 'ar' ? 'تسجيل خروج' : 'Log out')}</span>
                </button>

                <button role="menuitem" className="navbar__item navbar__item--danger"
                        onClick={() => { setAuthOpen(false); setDeletePass(''); setDeleteError(''); setDeleteOpen(true); }}>
                  <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6" />
                  </svg>
                  <span>{t('account.delete') || (lang === 'ar' ? 'حذف الحساب' : 'Delete Account')}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="navbar__auth" ref={authRef}>
              <button
                className={`navbar__usericon ${authOpen ? 'is-open' : ''}`}
                aria-haspopup="menu" aria-expanded={authOpen} aria-label={t('auth.userIcon')}
                onClick={() => setAuthOpen((v) => !v)}
              >
                <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
                </svg>
              </button>

              <div className={`navbar__dropdown ${authOpen ? 'is-visible' : ''}`} role="menu">
                <button role="menuitem" className="btn btn--gold btn--sm navbar__menu-btn"
                        onClick={() => { setAuthOpen(false); navigate('/login'); }}>
                  {t('auth.login')}
                </button>
                <button role="menuitem" className="btn btn--ghost btn--sm navbar__menu-btn"
                        onClick={() => { setAuthOpen(false); navigate('/signup'); }}>
                  {t('auth.signup')}
                </button>
              </div>
            </div>
          )}

          {/* كبسولة CTA الداكنة */}
          <button
            type="button"
            className="navbar__cta"
            onClick={() => navigate(isLoggedIn ? '/invitations/create' : '/signup')}
          >
            <span>{ctaLabel}</span>
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>

          {/* برجر الموبايل */}
          <button className="navbar__burger" aria-label={t('nav.menu')} aria-expanded={mobileOpen}
                  onClick={() => setMobileOpen((v) => !v)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* لوحة الموبايل */}
      <div className={`navbar__mobile ${mobileOpen ? 'is-open' : ''}`}>
        <ul>
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => { setActive(l.href); setMobileOpen(false); }}>
                {lang === 'ar' ? l.ar : l.en}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* 🆕 نافذة تأكيد حذف الحساب */}
      {deleteOpen && (
        <div className="navbar__modal-backdrop" onClick={() => setDeleteOpen(false)}>
          <div className="navbar__modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3>{t('account.deleteTitle') || (lang === 'ar' ? 'حذف الحساب نهائياً' : 'Delete Account Permanently')}</h3>
            <p>
              {t('account.deleteSub') || (lang === 'ar'
                ? 'سيتم حذف حسابك وجميع بياناتك بشكل نهائي ولا يمكن التراجع. أدخل كلمة المرور للتأكيد.'
                : 'Your account and all data will be permanently deleted. This cannot be undone. Enter your password to confirm.')}
            </p>
            <input
              type="password"
              value={deletePass}
              onChange={(e) => setDeletePass(e.target.value)}
              placeholder={t('account.deletePlaceholder') || (lang === 'ar' ? 'كلمة المرور' : 'Password')}
              autoComplete="current-password"
            />
            {deleteError && <p className="navbar__modal-error">{deleteError}</p>}
            <div className="navbar__modal-actions">
              <button className="navbar__modal-cancel" onClick={() => setDeleteOpen(false)}>
                {t('account.cancel') || (lang === 'ar' ? 'إلغاء' : 'Cancel')}
              </button>
              <button className="navbar__modal-confirm" onClick={handleDeleteAccount} disabled={deleting}>
                {deleting
                  ? (t('account.deleting') || (lang === 'ar' ? 'جارٍ الحذف...' : 'Deleting...'))
                  : (t('account.deleteConfirm') || (lang === 'ar' ? 'حذف نهائي' : 'Delete Forever'))}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

