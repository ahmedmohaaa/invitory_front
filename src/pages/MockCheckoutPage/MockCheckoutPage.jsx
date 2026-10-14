import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getTransaction, mockPay } from '../../services/payments';
import './MockCheckoutPage.css';

const COPY = {
  ar: {
    banner: '🧪 بوابة محاكاة PayTabs — بعد اشتراكك الفعلي ستحل البوابة الحقيقية محل هذه الصفحة تلقائياً بدون أي تعديل بالكود.',
    card: 'رقم البطاقة', expiry: 'تاريخ الانتهاء', cvv: 'CVV',
    payOk: '✓ دفع ناجح', payFail: '✕ محاكاة فشل',
    busy: 'جارٍ التنفيذ…', amount: 'المبلغ المستحق',
  },
  en: {
    banner: '🧪 PayTabs mock gateway — once you subscribe, the real gateway replaces this page automatically with zero code changes.',
    card: 'Card number', expiry: 'Expiry', cvv: 'CVV',
    payOk: '✓ Successful payment', payFail: '✕ Simulate failure',
    busy: 'Processing…', amount: 'Amount due',
  },
};

export default function MockCheckoutPage() {
  const [params] = useSearchParams();
  const tranRef = params.get('tran_ref');
  const { lang } = useLanguage();
  const c = COPY[lang];

  const [tran, setTran] = useState(null);
  const [busy, setBusy] = useState('');

  useEffect(() => {
    if (tranRef) getTransaction(tranRef).then(setTran).catch(() => {});
  }, [tranRef]);

  const pay = async (success) => {
    setBusy(success ? 'ok' : 'fail');
    try {
      const res = await mockPay(tranRef, success);
      window.location.href = res.return_url;
    } catch {
      setBusy('');
    }
  };

  return (
    <div className="mck">
      <header className="mck__head">
        <span className="mck__logo">PayTabs <em>MOCK</em></span>
        <span className="mck__ref" dir="ltr">{tranRef}</span>
      </header>

      <p className="mck__banner">{c.banner}</p>

      <div className="mck__card">
        <p className="mck__amount-label">{c.amount}</p>
        <p className="mck__amount">{tran?.amount ?? '—'} <span>{tran?.currency ?? ''}</span></p>

        <label className="mck__label">{c.card}
          <input dir="ltr" defaultValue="4111 1111 1111 1111" />
        </label>
        <div className="mck__row">
          <label className="mck__label">{c.expiry}<input dir="ltr" defaultValue="12/28" /></label>
          <label className="mck__label">{c.cvv}<input dir="ltr" defaultValue="123" /></label>
        </div>

        <div className="mck__actions">
          <button type="button" onClick={() => pay(true)} disabled={!!busy}>
            {busy === 'ok' ? c.busy : c.payOk}
          </button>
          <button type="button" className="mck__fail" onClick={() => pay(false)} disabled={!!busy}>
            {busy === 'fail' ? c.busy : c.payFail}
          </button>
        </div>
      </div>
    </div>
  );
}

