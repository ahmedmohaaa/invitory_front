import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import './GoogleCallback.css';

/** صفحة استقبال كود جوجل → تبادله مع الباك اند → حفظ التوكنات → الدخول */
export default function GoogleCallback() {
  const { lang } = useLanguage();
  const [error, setError] = useState('');
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current) return;
    doneRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) {
      setError(lang === 'ar' ? 'لم يتم استلام كود من جوجل.' : 'No code received from Google.');
      return;
    }

    api.post('/auth/google/', {
      code,
      redirect_uri: `${window.location.origin}/auth/google/callback`,
    })
      .then((res) => {
        localStorage.setItem('access_token', res.data.access);
        localStorage.setItem('refresh_token', res.data.refresh);
        window.location.href = '/';
      })
      .catch(() => {
        setError(lang === 'ar' ? 'فشل تسجيل الدخول عبر جوجل، حاول مجدداً.' : 'Google sign-in failed, please try again.');
      });
  }, [lang]);

  return (
    <div className="gcb-page">
      <div className="gcb-card">
        {error ? (
          <>
            <span className="gcb-icon gcb-icon--error" aria-hidden="true">!</span>
            <p className="gcb-text">{error}</p>
            <Link className="gcb-link" to="/signup">
              {lang === 'ar' ? 'العودة لإنشاء الحساب' : 'Back to Sign Up'}
            </Link>
          </>
        ) : (
          <>
            <span className="gcb-spinner" aria-hidden="true" />
            <p className="gcb-text">
              {lang === 'ar' ? 'جارٍ إتمام تسجيل الدخول عبر Google...' : 'Completing Google sign-in...'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}