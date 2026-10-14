import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import Navbar from '../../components/Navbar/Navbar';
import { DesignProvider } from '../DesignPage/context/DesignContext';
import { fetchDesign } from '../DesignPage/services/designService';
import ProgressStepper from '../../components/ProgressStepper/ProgressStepper';
import InvitationPhone from '../../components/InvitationPhone/InvitationPhone';
import './PreviewPage.css';

const COPY = {
  ar: {
    title: 'راجع تصميم دعوتك قبل المتابعة.',
    sub: 'دعوتك تبدو تماماً كما سيراها ضيوفك. افتحها على هاتفك قبل المتابعة.',
    openFull: 'فتح المعاينة الكاملة',
    continueBtn: 'متابعة',
    editBtn: 'تعديل',
  },
  en: {
    title: 'Review your invitation before continuing.',
    sub: 'Your invitation looks exactly as your guests will see it. Open it on your phone before continuing.',
    openFull: 'Open Full Preview',
    continueBtn: 'Continue',
    editBtn: 'Edit',
  },
};

function PreviewPageInner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const c = COPY[lang];
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    fetchDesign(id)
      .then((res) => setPaid(res.payment_status === 'PAID'))
      .catch(() => setPaid(false));
  }, [id]);

  return (
    <div className="pvpage">
      <Navbar />
      <ProgressStepper current="preview" />
      <div className="pvpage__grid">
        {/* الأزرار يمين (أول عمود في RTL) */}
        <div className="pvpage__side">
          <h1 className="pvpage__title">{c.title}</h1>
          <p className="pvpage__sub">{c.sub}</p>
          <div className="pvpage__actions">
            <button type="button" className="pvpage__btn pvpage__btn--primary" onClick={() => navigate(`/invitation/${id}`)}>
              {c.openFull}
            </button>
            <button type="button" className="pvpage__btn pvpage__btn--gold" onClick={() => navigate(`/payment/${id}`)}>
              {c.continueBtn}
            </button>
            <button type="button" className="pvpage__btn" onClick={() => navigate(`/invitations/${id}/edit`)}>
              {c.editBtn}
            </button>
          </div>
        </div>
        {/* الهاتف يسار مغطى بالغلاف */}
        <div className="pvpage__phone">
<InvitationPhone envelopeVisible invitationId={id} />
        </div>
      </div>
    </div>
  );
}

export default function PreviewPage() {
  const { id } = useParams();
  return (
    <DesignProvider invitationId={Number(id)}>
      <PreviewPageInner />
    </DesignProvider>
  );
}

