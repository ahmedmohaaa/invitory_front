import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../../components/BrandLogo/BrandLogo';
import './Login.css';

/* نصوص ثنائية اللغة — ذاتية الاحتواء */
const COPY = {
  ar: {
    brandParagraph: 'كل مناسبة عظيمة تبدأ بدعوة استثنائية. صمّم وشارك كروت دعواتك الرقمية بأناقة وسرعة، ودع ضيوفك يعيشون أجواء الاحتفال قبل أن يبدأ. أدخل بياناتك واستكمل ابتكار ذكرياتك.',
    chips: ['دعوات رقمية فاخرة', 'تأكيد حضور فوري', 'معرض ذكريات مشترك'],
    title: 'تسجيل الدخول',
    subtitle: 'أهلاً بعودتك — أدخل بياناتك لمواصلة الابتكار.',
    emailLabel: 'البريد الإلكتروني',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'كلمة المرور',
    passwordPlaceholder: '••••••••',
    remember: 'تذكرني',
    forgot: 'نسيت كلمة المرور؟',
    submit: 'تسجيل الدخول',
    submitting: 'جارٍ تسجيل الدخول...',
    required: 'يرجى إدخال البريد الإلكتروني وكلمة المرور.',
    errorGeneric: 'بيانات الدخول غير صحيحة، حاول مجدداً.',
    capsLock: 'تنبيه: زر Caps Lock مفعّل حالياً.',
    noAccount: 'ليس لديك حساب؟',
    contactAdmin: 'تواصل مع الإدارة',
    backHome: 'الرئيسية',
  },
  en: {
    brandParagraph: 'Every great occasion begins with an exceptional invitation. Design and share your digital invitation cards with elegance and speed, and let your guests live the celebration before it begins. Sign in and continue crafting your memories.',
    chips: ['Luxury digital cards', 'Instant RSVP', 'Shared memory gallery'],
    title: 'Sign In',
    subtitle: 'Welcome back — sign in to continue crafting.',
    emailLabel: 'Email address',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',
    remember: 'Remember me',
    forgot: 'Forgot password?',
    submit: 'Sign In',
    submitting: 'Signing in...',
    required: 'Please enter your email and password.',
    errorGeneric: 'Incorrect credentials, please try again.',
    capsLock: 'Heads up: Caps Lock is on.',
    noAccount: "Don't have an account?",
    contactAdmin: 'Contact the admin',
    backHome: 'Home',
  },
};

export default function Login() {
  const { lang, toggleLang } = useLanguage();
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const c = COPY[lang];

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [capsOn, setCapsOn] = useState(false);
  const [shake, setShake] = useState(false);

  /* إذا كان مسجلاً بالفعل → للرئيسية */
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const detectCaps = (e) => {
    if (e.getModifierState) setCapsOn(e.getModifierState('CapsLock'));
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 550);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) {
      setError(c.required);
      triggerShake();
      return;
    }
    setLoading(true);
    try {
      await login(identifier.trim(), password, remember);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.detail || c.errorGeneric);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* أزرار عائمة: اللغة + العودة */}
      <button className="login-lang" onClick={toggleLang} aria-label="Switch language">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
        </svg>
        {lang === 'ar' ? 'English' : 'عربي'}
      </button>
      <Link to="/" className="login-home">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />
        </svg>
        {c.backHome}
      </Link>

      {/* ═══ القسم الأيمن: البراند ═══ */}
      <section className="login-brand">
        <span className="login-orb login-orb--1" aria-hidden="true" />
        <span className="login-orb login-orb--2" aria-hidden="true" />
        <span className="login-particle login-particle--1" aria-hidden="true" />
        <span className="login-particle login-particle--2" aria-hidden="true" />
        <span className="login-particle login-particle--3" aria-hidden="true" />
        <span className="login-particle login-particle--4" aria-hidden="true" />

        <div className="login-brand__inner">
          <BrandLogo withTagline />
          <p className="login-brand__text">{c.brandParagraph}</p>
          <ul className="login-brand__chips">
            {c.chips.map((chip, i) => <li key={i}>{chip}</li>)}
          </ul>
        </div>
      </section>

      {/* ═══ القسم الأيسر: بوكس الدخول ═══ */}
      <section className="login-form-side">
        <form className={`login-card ${shake ? 'is-shaking' : ''}`} onSubmit={handleSubmit} noValidate>
          <h1 className="login-card__title">{c.title}</h1>
          <p className="login-card__sub">{c.subtitle}</p>

          {error && (
            <p className="login-error" role="alert">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
              </svg>
              {error}
            </p>
          )}

          {/* البريد */}
          <label className="login-field">
            <span className="login-field__label">{c.emailLabel}</span>
            <span className="login-field__wrap">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" />
              </svg>
              <input
                type="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={c.emailPlaceholder}
                autoComplete="username"
              />
            </span>
          </label>

          {/* كلمة المرور */}
          <label className="login-field">
            <span className="login-field__label">{c.passwordLabel}</span>
            <span className="login-field__wrap">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                <rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 018 0v3" />
              </svg>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={detectCaps}
                onKeyUp={detectCaps}
                placeholder={c.passwordPlaceholder}
                autoComplete="current-password"
              />
              <button type="button" className="login-eye" onClick={() => setShowPass(v => !v)} aria-label="Show password">
                {showPass ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </span>
          </label>

          {capsOn && <p className="login-caps">{c.capsLock}</p>}

          {/* تذكرني + نسيت كلمة المرور */}
          <div className="login-row">
            <label className="login-check">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span className="login-check__box" aria-hidden="true" />
              <span>{c.remember}</span>
            </label>
            <Link className="login-forgot" to="/forgot-password">{c.forgot}</Link>
          </div>

          {/* زر الدخول */}
          <button className="login-btn" type="submit" disabled={loading}>
            <span className="login-btn__sheen" aria-hidden="true" />
            {loading && <span className="login-spinner" aria-hidden="true" />}
            <span>{loading ? c.submitting : c.submit}</span>
          </button>

          <p className="login-foot">
            {c.noAccount}{' '}
            <a href="/#contact">{c.contactAdmin}</a>
          </p>
        </form>
      </section>
    </div>
  );
}