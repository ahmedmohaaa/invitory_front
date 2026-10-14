import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import Navbar from '../../components/Navbar/Navbar';
import { fetchDesign } from '../DesignPage/services/designService';
import {fetchShareData} from '../../services/share'
import {
  fetchRSVPList, fetchRSVPStats, updateRSVP, deleteRSVP, exportRSVPs,
} from '../../services/rsvps';
import { fetchCheckinList, fetchCheckinStats, exportCheckins } from '../../services/checkins';
import { markRead } from '../../services/notifications';
import './GuestsDashboardPage.css';

const COPY = {
  ar: {
    title: 'لوحة إدارة الضيوف',
    back: 'رجوع',
    export: '⬇ تصدير CSV',
    exportDoor: '⬇ قائمة الحضور الفعلي',
    remind: '💬 تذكير عبر واتساب',
    daysLeft: 'يوم متبقٍ على الحدث',
    passed: 'انتهى الحدث',
    tabRsvp: '💌 التأكيدات',
    tabDoor: '🚪 وصول الباب',
    cards: {
      responses: 'إجمالي الردود', attending: 'سيحضرون', declining: 'لن يحضروا',
      guests: 'إجمالي الضيوف', checkins: 'وصلوا الباب', rate: 'نسبة الاستجابة',
    },
    dTotal: 'إجمالي الداخلين', dFresh: 'آخر 5 دقائق', dHour: 'آخر ساعة',
    dDup: 'مسح مكرر', dRate: 'معدل الوصول', dTimeline: '📈 الوصول حسب الساعة',
    rAll: 'كل الوقت', rToday: 'اليوم', rHour: 'آخر ساعة', rFresh: 'آخر 5 دقائق',
    thTime: 'وقت الوصول', thCross: 'الحالة الإلكترونية',
    crossOk: '✅ أكد وحضر', crossNo: '⚠️ أكد عدم الحضور لكنه وصل', crossNew: '🆕 وصل بدون تأكيد',
    dEmpty: 'لا يوجد وصول مسجل بعد — فعّل QR عند الباب ليبدأ العد.',
    search: 'ابحث بالاسم أو الرسالة…',
    statusAll: 'كل الحالات', statusAtt: 'سيحضر', statusDec: 'لن يحضر',
    orderNew: 'الأحدث أولاً', orderOld: 'الأقدم أولاً', orderName: 'الاسم (أ-ي)', orderGuests: 'الأكثر مرافقين',
    thName: 'الضيف', thStatus: 'الحالة', thGuests: 'المرافقون', thDate: 'تاريخ الرد', thActions: 'إجراءات',
    att: 'سيحضر ✅', dec: 'لن يحضر ❌',
    toggle: 'تبديل الحالة', del: 'حذف',
    confirmDel: 'حذف هذا الرد نهائياً؟',
    empty: 'لا توجد ردود مطابقة بعد.',
    page: 'صفحة', of: 'من',
    prev: 'السابق', next: 'التالي',
    wishesTitle: '💌 جدار التهاني',
    wishesEmpty: 'لا توجد تهانٍ مكتوبة بعد.',
    live: 'يُحدَّث تلقائياً كل 12 ثانية',
  },
  en: {
    title: 'Guest Management Dashboard',
    back: 'Back',
    export: '⬇ Export CSV',
    exportDoor: '⬇ Actual attendance list',
    remind: '💬 WhatsApp reminder',
    daysLeft: 'days left to the event',
    passed: 'Event passed',
    tabRsvp: '💌 RSVPs',
    tabDoor: '🚪 Door check-in',
    cards: {
      responses: 'Total responses', attending: 'Attending', declining: 'Declining',
      guests: 'Total guests', checkins: 'Checked-in', rate: 'Response rate',
    },
    dTotal: 'Total entries', dFresh: 'Last 5 min', dHour: 'Last hour',
    dDup: 'Duplicate scans', dRate: 'Arrival rate', dTimeline: '📈 Arrivals by hour',
    rAll: 'All time', rToday: 'Today', rHour: 'Last hour', rFresh: 'Last 5 min',
    thTime: 'Arrival time', thCross: 'Electronic status',
    crossOk: '✅ RSVP’d & arrived', crossNo: '️ RSVP’d NO but arrived', crossNew: '🆕 Walk-in (no RSVP)',
    dEmpty: 'No check-ins yet — enable door QR to start counting.',
    search: 'Search by name or message…',
    statusAll: 'All statuses', statusAtt: 'Attending', statusDec: 'Declining',
    orderNew: 'Newest first', orderOld: 'Oldest first', orderName: 'Name (A-Z)', orderGuests: 'Most companions',
    thName: 'Guest', thStatus: 'Status', thGuests: 'Companions', thDate: 'Response date', thActions: 'Actions',
    att: 'Attending ✅', dec: 'Declining ❌',
    toggle: 'Toggle status', del: 'Delete',
    confirmDel: 'Delete this response permanently?',
    empty: 'No matching responses yet.',
    page: 'Page', of: 'of',
    prev: 'Prev', next: 'Next',
    wishesTitle: '💌 Wishes wall',
    wishesEmpty: 'No written wishes yet.',
    live: 'Auto-refreshes every 12s',
  },
};

/* 🍩 رسم دائري SVG */
const Donut = ({ attending, declining, labelAtt, labelDec }) => {
  const total = attending + declining;
  const ratio = total ? attending / total : 0;
  const C = 2 * Math.PI * 40;
  return (
    <div className="gd-donut-wrap">
      <svg viewBox="0 0 100 100" className="gd-donut">
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(248,113,113,.75)" strokeWidth="13" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(74,222,128,.9)" strokeWidth="13" strokeLinecap="round"
          strokeDasharray={`${C * ratio} ${C}`} transform="rotate(-90 50 50)" />
        <text x="50" y="48" textAnchor="middle" className="gd-donut__num">{attending}</text>
        <text x="50" y="63" textAnchor="middle" className="gd-donut__lbl">{labelAtt}</text>
      </svg>
      <div className="gd-donut__legend">
        <span><i className="gd-dot gd-dot--yes" /> {labelAtt}: {attending}</span>
        <span><i className="gd-dot gd-dot--no" /> {labelDec}: {declining}</span>
      </div>
    </div>
  );
};

export default function GuestsDashboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const c = COPY[lang];

  const [tab, setTab] = useState('rsvp');

  const [meta, setMeta] = useState({ title: '', date: '' });
  const [stats, setStats] = useState(null);
  const [rows, setRows] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [shareLink, setShareLink] = useState('');

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [count, setCount] = useState(0);

  const [qInput, setQInput] = useState('');
  const [q, setQ] = useState('');
  const [statusF, setStatusF] = useState('all');
  const [ordering, setOrdering] = useState('-created_at');
  const [busyId, setBusyId] = useState(null);

  /* 🚪 حالة تبويب الباب */
  const [doorRows, setDoorRows] = useState([]);
  const [doorPage, setDoorPage] = useState(1);
  const [doorPages, setDoorPages] = useState(1);
  const [doorStats, setDoorStats] = useState(null);
  const [doorRange, setDoorRange] = useState('all');
  const [doorQInput, setDoorQInput] = useState('');
  const [doorQ, setDoorQ] = useState('');

  /* 🔔 تصفير شارة التنبيهات عند فتح اللوحة */
  useEffect(() => { markRead(id).catch(() => {}); }, [id]);

  useEffect(() => {
    const t = setTimeout(() => { setQ(qInput); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [qInput]);
  useEffect(() => {
    const t = setTimeout(() => { setDoorQ(doorQInput); setDoorPage(1); }, 350);
    return () => clearTimeout(t);
  }, [doorQInput]);

  useEffect(() => {
    fetchDesign(id)
      .then((d) => setMeta({ title: d.title || d.data?.info?.title || '', date: d.data?.info?.date || '' }))
      .catch(() => {});
    fetchShareData(id).then((s) => setShareLink(s.share_link || '')).catch(() => {});
  }, [id]);

  const loadStats = useCallback(() => { fetchRSVPStats(id).then(setStats).catch(() => {}); }, [id]);
  useEffect(() => {
    loadStats();
    const t = setInterval(loadStats, 12000);
    return () => clearInterval(t);
  }, [loadStats]);

  const loadList = useCallback(() => {
    fetchRSVPList({ invitation_id: id, page, page_size: 10, status: statusF, q, ordering })
      .then((d) => { setRows(d.results); setPages(d.pages); setCount(d.count); })
      .catch(() => {});
  }, [id, page, statusF, q, ordering]);
  useEffect(() => { loadList(); }, [loadList]);

  const loadWishes = useCallback(() => {
    fetchRSVPList({ invitation_id: id, page_size: 50, has_message: 1, ordering: '-created_at' })
      .then((d) => setWishes(d.results))
      .catch(() => {});
  }, [id]);
  useEffect(() => { loadWishes(); }, [loadWishes]);

  /* 🚪 تحميلات الباب */
  const loadDoorStats = useCallback(() => { fetchCheckinStats(id).then(setDoorStats).catch(() => {}); }, [id]);
  useEffect(() => {
    if (tab !== 'door') return undefined;
    loadDoorStats();
    const t = setInterval(loadDoorStats, 12000);
    return () => clearInterval(t);
  }, [tab, loadDoorStats]);

  const loadDoorList = useCallback(() => {
    fetchCheckinList({ invitation_id: id, page: doorPage, page_size: 10, range: doorRange, q: doorQ })
      .then((d) => { setDoorRows(d.results); setDoorPages(d.pages); })
      .catch(() => {});
  }, [id, doorPage, doorRange, doorQ]);
  useEffect(() => { if (tab === 'door') loadDoorList(); }, [tab, loadDoorList]);

  const refreshAll = () => { loadList(); loadStats(); loadWishes(); };

  const toggleAttending = async (row) => {
    setBusyId(row.id);
    try { await updateRSVP(row.id, { attending: !row.attending }); refreshAll(); }
    catch { /* تجاهل */ } finally { setBusyId(null); }
  };

  const removeRow = async (row) => {
    if (!window.confirm(c.confirmDel)) return;
    setBusyId(row.id);
    try { await deleteRSVP(row.id); refreshAll(); }
    catch { /* تجاهل */ } finally { setBusyId(null); }
  };

  const remindWhatsapp = () => {
    if (!shareLink) return;
    const text = lang === 'ar'
      ? `تذكير لطيف 💌 ننتظر تأكيد حضوركم لمناسبة ${meta.title || 'دعوتنا'}:\n${shareLink}`
      : `A gentle reminder 💌 We await your RSVP for ${meta.title || 'our event'}:\n${shareLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  const fmtDate = (iso) => new Date(iso).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="gd">
      <Navbar />

      <div className="container gd__wrap">
        <header className="gd__head">
          <button className="gd__back" onClick={() => navigate('/my-invitations')}>← {c.back}</button>
          <div className="gd__head-txt">
            <h1>{c.title}</h1>
            <p>
              {meta.title || '—'}
              {stats?.days_left != null && (
                <span className="gd__days">
                  {stats.days_left >= 0 ? `${stats.days_left} ${c.daysLeft}` : c.passed}
                </span>
              )}
            </p>
          </div>
          <div className="gd__head-actions">
            {shareLink && <button className="gd__btn gd__btn--ghost" onClick={remindWhatsapp}>{c.remind}</button>}
            {tab === 'rsvp' && <button className="gd__btn" onClick={() => exportRSVPs(id)}>{c.export}</button>}
          </div>
        </header>

        {/* 🔀 التبويبان */}
        <div className="gd__tabs">
          <button className={`gd__tab ${tab === 'rsvp' ? 'is-active' : ''}`} onClick={() => setTab('rsvp')}>{c.tabRsvp}</button>
          <button className={`gd__tab ${tab === 'door' ? 'is-active' : ''}`} onClick={() => setTab('door')}>{c.tabDoor}</button>
        </div>

        {/* ═══════════ تبويب التأكيدات ═══════════ */}
        {tab === 'rsvp' && (
          <>
            <section className="gd__cards">
              <div className="gd-card"><span className="gd-card__num">{stats?.total_responses ?? 0}</span><span className="gd-card__lbl">{c.cards.responses}</span></div>
              <div className="gd-card gd-card--yes"><span className="gd-card__num">{stats?.attending ?? 0}</span><span className="gd-card__lbl">{c.cards.attending}</span></div>
              <div className="gd-card gd-card--no"><span className="gd-card__num">{stats?.declining ?? 0}</span><span className="gd-card__lbl">{c.cards.declining}</span></div>
              <div className="gd-card gd-card--gold"><span className="gd-card__num">{stats?.total_guests ?? 0}</span><span className="gd-card__lbl">{c.cards.guests}</span></div>
              <div className="gd-card"><span className="gd-card__num">{stats?.checkins ?? 0}</span><span className="gd-card__lbl">{c.cards.checkins}</span></div>
              <div className="gd-card gd-card--gold"><span className="gd-card__num">{stats?.response_rate ?? 0}%</span><span className="gd-card__lbl">{c.cards.rate}</span></div>
            </section>

            <section className="gd__mid">
              <Donut attending={stats?.attending ?? 0} declining={stats?.declining ?? 0} labelAtt={c.statusAtt} labelDec={c.statusDec} />
              <div className="gd__filters">
                <input className="gd__search" value={qInput} onChange={(e) => setQInput(e.target.value)} placeholder={c.search} />
                <select className="gd__select" value={statusF} onChange={(e) => { setStatusF(e.target.value); setPage(1); }}>
                  <option value="all">{c.statusAll}</option>
                  <option value="attending">{c.statusAtt}</option>
                  <option value="declining">{c.statusDec}</option>
                </select>
                <select className="gd__select" value={ordering} onChange={(e) => setOrdering(e.target.value)}>
                  <option value="-created_at">{c.orderNew}</option>
                  <option value="created_at">{c.orderOld}</option>
                  <option value="guest_name">{c.orderName}</option>
                  <option value="-guests_count">{c.orderGuests}</option>
                </select>
              </div>
            </section>

            <section className="gd__table-wrap">
              <table className="gd__table">
                <thead>
                  <tr><th>{c.thName}</th><th>{c.thStatus}</th><th>{c.thGuests}</th><th>{c.thDate}</th><th>{c.thActions}</th></tr>
                </thead>
                <tbody>
                  {rows.length === 0 && <tr><td colSpan={5} className="gd__empty">{c.empty}</td></tr>}
                  {rows.map((r) => (
                    <tr key={r.id} className={busyId === r.id ? 'is-busy' : ''}>
                      <td>
                        <strong>{r.guest_name}</strong>
                        {r.message && <span className="gd__msg-hint" title={r.message}>💬</span>}
                      </td>
                      <td><span className={`gd-badge ${r.attending ? 'gd-badge--yes' : 'gd-badge--no'}`}>{r.attending ? c.att : c.dec}</span></td>
                      <td>{r.guests_count}</td>
                      <td className="gd__date">{fmtDate(r.created_at)}</td>
                      <td>
                        <div className="gd__row-actions">
                          <button className="gd__icon-btn" title={c.toggle} onClick={() => toggleAttending(r)}>⇄</button>
                          <button className="gd__icon-btn gd__icon-btn--del" title={c.del} onClick={() => removeRow(r)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="gd__pager">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹ {c.prev}</button>
                <span>{c.page} {page} {c.of} {pages} · {count}</span>
                <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>{c.next} ›</button>
              </div>
              <p className="gd__live-note">● {c.live}</p>
            </section>

            <section className="gd__wishes">
              <h2>{c.wishesTitle}</h2>
              {wishes.length === 0 ? (
                <p className="gd__empty">{c.wishesEmpty}</p>
              ) : (
                <div className="gd__wishes-grid">
                  {wishes.map((w) => (
                    <article key={w.id} className="gd-wish">
                      <p className="gd-wish__txt">“{w.message}”</p>
                      <footer>— {w.guest_name}</footer>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* ═══════════ تبويب وصول الباب ═══════════ */}
        {tab === 'door' && (
          <>
            <section className="gd__cards">
              <div className="gd-card gd-card--gold"><span className="gd-card__num">{doorStats?.total ?? 0}</span><span className="gd-card__lbl">{c.dTotal}</span></div>
              <div className="gd-card gd-card--yes"><span className="gd-card__num">{doorStats?.fresh ?? 0}</span><span className="gd-card__lbl">{c.dFresh}</span></div>
              <div className="gd-card"><span className="gd-card__num">{doorStats?.last_hour ?? 0}</span><span className="gd-card__lbl">{c.dHour}</span></div>
              <div className="gd-card gd-card--no"><span className="gd-card__num">{doorStats?.duplicates ?? 0}</span><span className="gd-card__lbl">{c.dDup}</span></div>
              <div className="gd-card gd-card--gold"><span className="gd-card__num">{doorStats?.arrival_rate ?? 0}%</span><span className="gd-card__lbl">{c.dRate}</span></div>
              <div className="gd-card gd-card--action"><button className="gd__btn" onClick={() => exportCheckins(id)}>{c.exportDoor}</button></div>
            </section>

            {doorStats?.timeline?.length > 0 && (
              <section className="gd__timeline">
                <h3>{c.dTimeline}</h3>
                <div className="gd__timeline-bars">
                  {doorStats.timeline.map((b, i) => {
                    const max = Math.max(...doorStats.timeline.map((x) => x.count), 1);
                    const h = Math.round((b.count / max) * 90) + 8;
                    const hourLabel = new Date(b.hour).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit' });
                    return (
                      <div key={i} className="gd__tbar" title={`${hourLabel}: ${b.count}`}>
                        <span style={{ height: `${h}px` }} />
                        <i>{hourLabel}</i>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="gd__filters gd__filters--door">
              <input className="gd__search" value={doorQInput} onChange={(e) => setDoorQInput(e.target.value)} placeholder={c.search} />
              <select className="gd__select" value={doorRange} onChange={(e) => { setDoorRange(e.target.value); setDoorPage(1); }}>
                <option value="all">{c.rAll}</option>
                <option value="today">{c.rToday}</option>
                <option value="hour">{c.rHour}</option>
                <option value="fresh">{c.rFresh}</option>
              </select>
            </section>

            <section className="gd__table-wrap">
              <table className="gd__table">
                <thead>
                  <tr><th>{c.thName}</th><th>{c.thTime}</th><th>{c.thCross}</th></tr>
                </thead>
                <tbody>
                  {doorRows.length === 0 && <tr><td colSpan={3} className="gd__empty">{c.dEmpty}</td></tr>}
                  {doorRows.map((r) => (
                    <tr key={r.id}>
                      <td><strong>{r.guest_name}</strong></td>
                      <td className="gd__date">{fmtDate(r.scanned_at)}</td>
                      <td>
                        {r.rsvp_match ? (
                          r.rsvp_attending
                            ? <span className="gd-badge gd-badge--yes">{c.crossOk}</span>
                            : <span className="gd-badge gd-badge--warn">{c.crossNo}</span>
                        ) : (
                          <span className="gd-badge gd-badge--new">{c.crossNew}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="gd__pager">
                <button disabled={doorPage <= 1} onClick={() => setDoorPage((p) => p - 1)}>‹ {c.prev}</button>
                <span>{c.page} {doorPage} {c.of} {doorPages}</span>
                <button disabled={doorPage >= doorPages} onClick={() => setDoorPage((p) => p + 1)}>{c.next} ›</button>
              </div>
              <p className="gd__live-note">● {c.live}</p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}