import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import BrandLogo from '../../components/BrandLogo/BrandLogo';
import api from '../../services/api';
import './Signup.css';

/* نصوص ثنائية اللغة — ذاتية الاحتواء */
const COPY = {
  ar: {
    brandParagraph: 'انضم إلى آلاف المضيفين الذين يصنعون لحظات لا تُنسى. أنشئ حسابك خلال دقيقة، صمّم دعوتك الأولى بأناقة، وشارك الفرح مع من تحب — كل ذلك في مكان واحد.',
    chips: ['حساب مجاني خلال دقيقة', 'كود تفعيل على بريدك الحقيقي', 'دخول آمن عبر Google'],
    title: 'إنشاء حساب',
    subtitle: 'خطوة واحدة تفصلك عن أول دعوة استثنائية.',
    emailLabel: 'البريد الإلكتروني',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'كلمة المرور',
    confirmLabel: 'تأكيد كلمة المرور',
    terms: 'أوافق على الشروط وسياسة الخصوصية',
    submit: 'إنشاء الحساب',
    submitting: 'جارٍ الإنشاء...',
    or: 'أو',
    google: 'التسجيل عبر Google',
    haveAccount: 'لديك حساب بالفعل؟',
    login: 'تسجيل الدخول',
    verifyTitle: 'تفعيل البريد',
    verifySub: 'أدخل الكود المكوّن من 6 أرقام المرسل إلى',
    verifyBtn: 'تفعيل الحساب',
    verifying: 'جارٍ التفعيل...',
    resend: 'إعادة إرسال الكود',
    resendIn: 'يمكنك إعادة الإرسال بعد',
    back: 'العودة للتسجيل',
    backHome: 'الرئيسية',
    required: 'يرجى إدخال البريد وكلمة المرور.',
    mismatch: 'كلمتا المرور غير متطابقتين.',
    short: 'كلمة المرور يجب ألا تقل عن 8 أحرف.',
    termsRequired: 'يجب الموافقة على الشروط للمتابعة.',
    invalidCode: 'يرجى إدخال الكود كاملاً (6 أرقام).',
    generic: 'حدث خطأ، حاول مجدداً.',
    strength: ['ضعيفة', 'مقبولة', 'جيدة', 'قوية'],
  },
  en: {
    brandParagraph: 'Join thousands of hosts crafting unforgettable moments. Create your account in a minute, design your first invitation with elegance, and share the joy with your loved ones — all in one place.',
    chips: ['Free account in a minute', 'Real email activation code', 'Secure Google sign-in'],
    title: 'Create Account',
    subtitle: 'One step away from your first exceptional invitation.',
    emailLabel: 'Email address',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'Password',
    confirmLabel: 'Confirm password',
    terms: 'I agree to the Terms & Privacy Policy',
    submit: 'Create Account',
    submitting: 'Creating...',
    or: 'or',
    google: 'Sign up with Google',
    haveAccount: 'Already have an account?',
    login: 'Sign in',
    verifyTitle: 'Verify Email',
    verifySub: 'Enter the 6-digit code sent to',
    verifyBtn: 'Activate Account',
    verifying: 'Activating...',
    resend: 'Resend code',
    resendIn: 'You can resend in',
    back: 'Back to signup',
    backHome: 'Home',
    required: 'Please enter your email and password.',
    mismatch: 'Passwords do not match.',
    short: 'Password must be at least 8 characters.',
    termsRequired: 'You must accept the terms to continue.',
    invalidCode: 'Please enter the full code (6 digits).',
    generic: 'Something went wrong, try again.',
    strength: ['Weak', 'Fair', 'Good', 'Strong'],
  },
};

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_REDIRECT_URI = `${window.location.origin}/auth/google/callback`;
const GOOGLE_AUTH_URL =
  `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}` +
  `&response_type=code&scope=${encodeURIComponent('openid email profile')}&prompt=select_account`;

export default function Signup() {
  const { lang, toggleLang } = useLanguage();
  const c = COPY[lang];

  const [step, setStep] = useState('form'); // form | verify
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);

  /* عدّاد إعادة الإرسال */
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const trigger = (msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 550);
  };

  /* مقياس قوة كلمة المرور */
  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return Math.max(1, s);
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) return trigger(c.required);
    if (password !== confirm) return trigger(c.mismatch);
    if (password.length < 8) return trigger(c.short);
    if (!terms) return trigger(c.termsRequired);
    setLoading(true);
    try {
      await api.post('/auth/register/', { email: email.trim(), password, confirm_password: confirm });
      setStep('verify');
      setCountdown(60);
    } catch (err) {
      trigger(err?.response?.data?.error || c.generic);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (i, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    setCode((prev) => {
      const next = [...prev];
      next[i] = digit;
      return next;
    });
    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    const full = code.join('');
    if (full.length !== 6) return trigger(c.invalidCode);
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-email/', { email: email.trim(), code: full });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      window.location.href = '/';
    } catch (err) {
      trigger(err?.response?.data?.error || c.generic);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      await api.post('/auth/resend-code/', { email: email.trim() });
      setCountdown(60);
    } catch (err) {
      trigger(err?.response?.data?.error || c.generic);
    }
  };

  return (
    <div className="signup-page">
      {/* أزرار عائمة: اللغة + الرئيسية (بدون نافبار/فوتر) */}
      <button className="signup-lang" onClick={toggleLang} aria-label="Switch language">
        {lang === 'ar' ? 'English' : 'عربي'}
      </button>
      <Link to="/" className="signup-home">{c.backHome}</Link>

      {/* ═══ القسم الأيمن: البراند ═══ */}
      <section className="signup-brand">
        <span className="signup-orb signup-orb--1" aria-hidden="true" />
        <span className="signup-orb signup-orb--2" aria-hidden="true" />
        <span className="signup-particle signup-particle--1" aria-hidden="true" />
        <span className="signup-particle signup-particle--2" aria-hidden="true" />
        <span className="signup-particle signup-particle--3" aria-hidden="true" />
        <span className="signup-particle signup-particle--4" aria-hidden="true" />

        <div className="signup-brand__inner">
          <BrandLogo withTagline />
          <p className="signup-brand__text">{c.brandParagraph}</p>
          <ul className="signup-brand__chips">
            {c.chips.map((chip, i) => <li key={i}>{chip}</li>)}
          </ul>
        </div>
      </section>

      {/* ═══ القسم الأيسر: الفورم ═══ */}
      <section className="signup-form-side">
        {step === 'form' && (
          <form className={`signup-card ${shake ? 'is-shaking' : ''}`} onSubmit={handleSubmit} noValidate>
            <h1 className="signup-card__title">{c.title}</h1>
            <p className="signup-card__sub">{c.subtitle}</p>

            {error && <p className="signup-error" role="alert">{error}</p>}

            {/* البريد */}
            <label className="signup-field">
              <span className="signup-field__label">{c.emailLabel}</span>
              <span className="signup-field__wrap">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={c.emailPlaceholder}
                  autoComplete="email"
                />
              </span>
            </label>

            {/* كلمة المرور + مقياس القوة */}
            <label className="signup-field">
              <span className="signup-field__label">{c.passwordLabel}</span>
              <span className="signup-field__wrap">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  <rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 018 0v3" />
                </svg>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button type="button" className="signup-eye" onClick={() => setShowPass(v => !v)} aria-label="Show password">
                  {showPass ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </span>
            </label>
            <div className={`signup-strength s${strength}`} aria-hidden="true">
              <span /><span /><span /><span />
            </div>
            {strength > 0 && <p className="signup-strength-label">{c.strength[strength - 1]}</p>}

            {/* التأكيد */}
            <label className="signup-field">
              <span className="signup-field__label">{c.confirmLabel}</span>
              <span className="signup-field__wrap">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                />
              </span>
            </label>

            {/* الشروط */}
            <label className="signup-check">
              <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
              <span className="signup-check__box" aria-hidden="true" />
              <span>{c.terms}</span>
            </label>

            {/* زر الإنشاء */}
            <button className="signup-btn" type="submit" disabled={loading}>
              <span className="signup-btn__sheen" aria-hidden="true" />
              {loading && <span className="signup-spinner" aria-hidden="true" />}
              <span>{loading ? c.submitting : c.submit}</span>
            </button>

            {/* فاصل */}
            <div className="signup-divider"><span>{c.or}</span></div>

            {/* زر جوجل الأبيض */}
            <button type="button" className="signup-google" onClick={() => { window.location.href = GOOGLE_AUTH_URL; }}>
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.3 5.3C36.9 39.2 44 34 44 24c0-1.3-.1-2.3-.4-3.5z" />
              </svg>
              <span>{c.google}</span>
            </button>

            <p className="signup-foot">
              {c.haveAccount} <Link to="/login">{c.login}</Link>
            </p>
          </form>
        )}

        {step === 'verify' && (
          <form className={`signup-card ${shake ? 'is-shaking' : ''}`} onSubmit={handleVerify} noValidate>
            <h1 className="signup-card__title">{c.verifyTitle}</h1>
            <p className="signup-card__sub">{c.verifySub} <strong dir="ltr">{email}</strong></p>

            {error && <p className="signup-error" role="alert">{error}</p>}

            <div className="signup-otp">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  value={digit}
                  inputMode="numeric"
                  maxLength={1}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  aria-label={`OTP ${i + 1}`}
                />
              ))}
            </div>

            <button className="signup-btn" type="submit" disabled={loading}>
              <span className="signup-btn__sheen" aria-hidden="true" />
              {loading && <span className="signup-spinner" aria-hidden="true" />}
              <span>{loading ? c.verifying : c.verifyBtn}</span>
            </button>

            <p className="signup-resend">
              {countdown > 0 ? (
                <>{c.resendIn} <strong dir="ltr">{countdown}s</strong></>
              ) : (
                <button type="button" className="signup-resend__btn" onClick={handleResend}>{c.resend}</button>
              )}
            </p>

            <p className="signup-foot">
              <button type="button" className="signup-back" onClick={() => { setStep('form'); setError(''); }}>
                {c.back}
              </button>
            </p>
          </form>
        )}
      </section>
    </div>
  );
}