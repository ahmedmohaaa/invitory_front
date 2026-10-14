import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import './ForgotPassword.css';

const COPY = {
  ar: {
    title: 'استعادة كلمة المرور',
    sub: 'أدخل بريدك الإلكتروني وسنرسل لك كود استرداد من 6 أرقام.',
    step1: 'البريد', step2: 'الكود', step3: 'تم',
    emailLabel: 'البريد الإلكتروني', emailPlaceholder: 'name@example.com',
    sendCode: 'إرسال الكود', sendingCode: 'جارٍ الإرسال...',
    codeLabel: 'كود الاسترداد', codePlaceholder: '000000',
    newPassLabel: 'كلمة المرور الجديدة', confirmLabel: 'تأكيد كلمة المرور',
    resetBtn: 'تغيير كلمة المرور', resetting: 'جارٍ التغيير...',
    successTitle: 'تم التغيير بنجاح!',
    successSub: 'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',
    goLogin: 'الذهاب لتسجيل الدخول',
    backToLogin: 'العودة لتسجيل الدخول',
    backHome: 'الرئيسية',
    required: 'يرجى ملء جميع الحقول.',
    mismatch: 'كلمتا المرور غير متطابقتين.',
    errorGeneric: 'حدث خطأ، حاول مجدداً.',
  },
  en: {
    title: 'Recover Password',
    sub: 'Enter your email and we will send you a 6-digit recovery code.',
    step1: 'Email', step2: 'Code', step3: 'Done',
    emailLabel: 'Email address', emailPlaceholder: 'name@example.com',
    sendCode: 'Send Code', sendingCode: 'Sending...',
    codeLabel: 'Recovery code', codePlaceholder: '000000',
    newPassLabel: 'New password', confirmLabel: 'Confirm password',
    resetBtn: 'Change Password', resetting: 'Changing...',
    successTitle: 'Changed successfully!',
    successSub: 'You can now sign in with your new password.',
    goLogin: 'Go to Sign In',
    backToLogin: 'Back to Sign In',
    backHome: 'Home',
    required: 'Please fill in all fields.',
    mismatch: 'Passwords do not match.',
    errorGeneric: 'Something went wrong, try again.',
  },
};

export default function ForgotPassword() {
  const { lang, toggleLang } = useLanguage();
  const c = COPY[lang];

  const [step, setStep] = useState('request'); // request | reset | done
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const sendCode = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) return setError(c.required);
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password/', { email: email.trim() });
      setInfo(res.data.message);
      setStep('reset');
    } catch (err) {
      setError(err?.response?.data?.error || c.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  const resetPass = async (e) => {
    e.preventDefault();
    setError('');
    if (!code.trim() || !pass || !confirm) return setError(c.required);
    if (pass !== confirm) return setError(c.mismatch);
    setLoading(true);
    try {
      await api.post('/auth/reset-password/', {
        email: email.trim(),
        code: code.trim(),
        new_password: pass,
        confirm_password: confirm,
      });
      setStep('done');
    } catch (err) {
      setError(err?.response?.data?.error || c.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = step === 'request' ? 1 : step === 'reset' ? 2 : 3;

  return (
    <div className="forgot-page">
      <button className="forgot-lang" onClick={toggleLang} aria-label="Switch language">
        {lang === 'ar' ? 'English' : 'عربي'}
      </button>
      <Link to="/" className="forgot-home">{c.backHome}</Link>

      <div className="forgot-card">
        {/* مؤشر الخطوات */}
        <div className="forgot-steps" aria-hidden="true">
          <span className={`forgot-step ${stepIndex >= 1 ? (stepIndex > 1 ? 'is-done' : 'is-active') : ''}`}>
            <i>1</i>{c.step1}
          </span>
          <span className="forgot-step__line" />
          <span className={`forgot-step ${stepIndex >= 2 ? (stepIndex > 2 ? 'is-done' : 'is-active') : ''}`}>
            <i>2</i>{c.step2}
          </span>
          <span className="forgot-step__line" />
          <span className={`forgot-step ${stepIndex >= 3 ? 'is-active' : ''}`}>
            <i>3</i>{c.step3}
          </span>
        </div>

        <h1 className="forgot-title">{c.title}</h1>
        <p className="forgot-sub">{step === 'request' ? c.sub : info || c.sub}</p>

        {error && <p className="forgot-error" role="alert">{error}</p>}

        {step === 'request' && (
          <form onSubmit={sendCode} noValidate>
            <label className="forgot-field">
              <span>{c.emailLabel}</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={c.emailPlaceholder} />
            </label>
            <button className="forgot-btn" type="submit" disabled={loading}>
              {loading ? c.sendingCode : c.sendCode}
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={resetPass} noValidate>
            <label className="forgot-field">
              <span>{c.codeLabel}</span>
              <input inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} placeholder={c.codePlaceholder} />
            </label>
            <label className="forgot-field">
              <span>{c.newPassLabel}</span>
              <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
            </label>
            <label className="forgot-field">
              <span>{c.confirmLabel}</span>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </label>
            <button className="forgot-btn" type="submit" disabled={loading}>
              {loading ? c.resetting : c.resetBtn}
            </button>
          </form>
        )}

        {step === 'done' && (
          <div className="forgot-done">
            <span className="forgot-done__icon" aria-hidden="true">✓</span>
            <h2>{c.successTitle}</h2>
            <p>{c.successSub}</p>
            <Link className="forgot-btn forgot-btn--link" to="/login">{c.goLogin}</Link>
          </div>
        )}

        {step !== 'done' && (
          <p className="forgot-foot">
            <Link to="/login">{c.backToLogin}</Link>
          </p>
        )}
      </div>
    </div>
  );
}