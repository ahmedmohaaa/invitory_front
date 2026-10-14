import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import './ScanPage.css';

/** 🔐 صفحة المسح — تُفتح على جوال الموظف عند مسح QR الدعوة */
export default function ScanPage() {
  const { token } = useParams();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pin, setPin] = useState('');
  const [guestName, setGuestName] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get(`/checkin/${token}/`)
      .then((res) => setInfo(res.data))
      .catch((err) => setError(err.response?.data?.message || 'رمز الدعوة غير صالح'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (pin.length < 4) return;
    setVerifying(true);
    setResult(null);
    try {
      const res = await api.post(`/checkin/${token}/verify/`, { pin, guest_name: guestName });
      setResult({ ok: true, ...res.data });
      setPin('');
      setGuestName('');
    } catch (err) {
      const status = err.response?.data?.status || 'error';
      setResult({ ok: false, status, message: err.response?.data?.message || 'تعذر التحقق' });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="scan">
        <div className="scan-loading">
          <div className="scan-loading__orb" />
          <p>جارٍ التحميل…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="scan">
        <div className="scan-error">
          <span className="scan-error__icon">✕</span>
          <p className="scan-error__title">دعوة غير صالحة</p>
          <p className="scan-error__msg">{error}</p>
        </div>
      </div>
    );
  }

  if (!info.enabled) {
    return (
      <div className="scan">
        <div className="scan-error">
          <span className="scan-error__icon">⏸</span>
          <p className="scan-error__title">النظام غير مفعّل</p>
          <p className="scan-error__msg">نظام التحقق من QR غير مفعّل لهذه الدعوة حالياً.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="scan">
      <div className="scan-card">
        <div className="scan-card__head">
          <span className="scan-card__badge">🎫 دعوة</span>
          <h1 className="scan-card__title">{info.invitation_title}</h1>
          {info.event_date && (
            <p className="scan-card__date">
              {new Date(info.event_date).toLocaleDateString('ar-EG', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          )}
          {info.location && <p className="scan-card__loc">📍 {info.location}</p>}
        </div>

        <div className="scan-card__counter">
          <span className="scan-card__count">{info.current_count}</span>
          <span className="scan-card__of">حضر من أصل {info.expected_guests}</span>
        </div>

        {/* نتيجة آخر مسح */}
        {result && (
          <div className={`scan-result scan-result--${result.ok ? 'ok' : 'fail'}`}>
            <span className="scan-result__icon">{result.ok ? '✓' : '✕'}</span>
            <p className="scan-result__msg">{result.message}</p>
            {result.ok && (
              <p className="scan-result__count">
                العدد الحالي: <strong>{result.count}</strong>
              </p>
            )}
          </div>
        )}

        {/* نموذج التحقق */}
        <form className="scan-form" onSubmit={handleVerify}>
          <label className="scan-form__label">اسم الضيف (اختياري)</label>
          <input
            type="text"
            className="scan-form__input"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="مثال: عائلة أحمد الشريف"
            maxLength={100}
          />

          <label className="scan-form__label">رمز الموظف (PIN)</label>
          <input
            type="password"
            inputMode="numeric"
            className="scan-form__input scan-form__input--pin"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="••••••"
            maxLength={6}
            autoFocus
            required
          />

          <button
            type="submit"
            className="scan-form__submit"
            disabled={verifying || pin.length < 4}
          >
            {verifying ? 'جارٍ التحقق…' : '✓ تسجيل الحضور'}
          </button>
        </form>

        <p className="scan-footer">
          Powered by <strong>Invitory</strong>
        </p>
      </div>
    </div>
  );
}