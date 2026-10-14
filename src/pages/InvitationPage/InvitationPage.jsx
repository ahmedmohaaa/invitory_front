import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { DesignProvider } from '../DesignPage/context/DesignContext';
import { fetchDesign } from '../DesignPage/services/designService';
import InvitationPhone from '../../components/InvitationPhone/InvitationPhone';
import './InvitationPage.css';

function InvitationPageInner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    fetchDesign(id)
      .then((res) => setPaid(res.payment_status === 'PAID'))
      .catch(() => setPaid(false));
  }, [id]);

  return (
    <div className="ipage">
      <header className="ipage__top">
        <button type="button" className="ipage__back" onClick={() => navigate(`/preview/${id}`)}>
          {lang === 'ar' ? '→ رجوع للمعاينة' : '← Back to preview'}
        </button>
        <span className="ipage__pill">Preview Mode</span>
      </header>
      <div className="ipage__body">
<InvitationPhone envelopeVisible full invitationId={id} />
      </div>
    </div>
  );
}

export default function InvitationPage() {
  const { id } = useParams();
  return (
    <DesignProvider invitationId={Number(id)}>
      <InvitationPageInner />
    </DesignProvider>
  );
}
