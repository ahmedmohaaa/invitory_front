import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import InvitationPhone from '../../components/InvitationPhone/InvitationPhone';
import { DesignProvider } from '../DesignPage/context/DesignContext';
import './PublicInvitePage.css';

/** 🌐 صفحة الدعوة العامة للضيوف — /i/<slug> */
function PublicInviteInner({ invitationId }) {
  return (
    <div className="pubinv">
      <InvitationPhone envelopeVisible publicMode invitationId={invitationId} />
      <footer className="pubinv__foot">
        <span>Powered by</span>
        <strong>Invitory</strong>
      </footer>
    </div>
  );
}

export default function PublicInvitePage() {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const [invId, setInvId] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/public/by-slug/${slug}/`)
      .then((r) => {
        setInvId(r.data.id);
        if (r.data.title) document.title = `${r.data.title} — Invitory`;
      })
      .catch(() => setErr('expired'))
      .finally(() => setLoading(false));
  }, [slug, lang]);

  if (loading) {
    return (
      <div className="pubinv__loading">
        <div className="pubinv__loading-spin" />
        <p>{lang === 'ar' ? 'جارٍ تحميل الدعوة…' : 'Loading invitation…'}</p>
      </div>
    );
  }

  if (err || !invId) {
    return (
      <div className="pubinv__error">
        <span className="pubinv__error-ic">⏳</span>
        <h1>{lang === 'ar' ? 'هذه الدعوة غير متاحة' : 'This invitation is unavailable'}</h1>
        <p>{lang === 'ar' ? 'قد تكون منتهية الصلاحية أو غير مفعّلة من قِبل المالك.' : 'It may have expired or been disabled by the host.'}</p>
        <a href="/" className="pubinv__error-btn">
          {lang === 'ar' ? 'إنشاء دعوة جديدة' : 'Create new invitation'}
        </a>
      </div>
    );
  }

  return (
    <DesignProvider invitationId={invId}>
      <PublicInviteInner invitationId={invId} />
    </DesignProvider>
  );
}