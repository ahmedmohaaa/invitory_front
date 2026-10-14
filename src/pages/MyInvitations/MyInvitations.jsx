import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import api from '../../services/api';
import './MyInvitations.css';
import { fetchUnread } from '../../services/notifications';
import { saveAsTemplate } from '../../services/templates';

// داخل المكوّن:
/* نصوص ثنائية اللغة — ذاتية الاحتواء */
const COPY = {
  ar: {
    title: 'دعواتي',
    tagline: 'كل دعوة تحكي حكايتك — هنا تدير كروتك الرقمية، تتابع تأكيد الحضور لحظة بلحظة، وتفتح معرض ذكرياتك في مكان واحد يليق بك.',
    createNew: 'إنشاء دعوة',
    codeLabel: 'رمز المستخدم',
    stats: { total: 'الإجمالي', published: 'منشورة', drafts: 'مسودات', rsvps: 'تأكيدات الحضور' },
    search: 'ابحث عن دعواتك بالاسم أو رقم الحجز...',
    filters: { all: 'الكل', paid: 'مدفوعة', unpaid: 'غير مدفوعة' },
    bookingsTitle: 'الحجوزات',
    th: { bookingNo: 'رقم الحجز', bookingDate: 'تاريخ الحجز', eventDate: 'تاريخ المناسبة', payment: 'الدفع', rsvp: 'الحضور', gallery: 'المعرض', actions: 'إجراءات' },
    paid: 'مدفوع', unpaid: 'غير مدفوع',
    responses: 'ردود', photos: 'صور',
    act: { view: 'عرض الكرت', edit: 'تعديل الكرت', gallery: 'لقطات ومعرض', delete: 'حذف', share: 'صفحة المشاركة', open: 'فتح الدعوة', dashboard: 'إدارة الضيوف' },
    previewTitle: 'معاينة الكرت',
    galleryTitle: 'لقطات ومعرض الدعوة',
    tabCaptured: 'لقطات الضيوف', tabGallery: 'المعرض المختار',
    emptyPhotos: 'لا توجد صور هنا بعد — شارك رمز QR ليبدأ ضيوفك بمشاركة اللحظات.',
    emptyTitle: 'لا توجد دعوات بعد',
    emptySub: 'ابدأ حكايتك الآن — أنشئ أول دعوة رقمية خلال دقائق.',
    deleteTitle: 'حذف الدعوة',
    deleteSub: 'سيتم حذف الدعوة وجميع بياناتها نهائياً. لا يمكن التراجع.',
    cancel: 'إلغاء', confirm: 'حذف نهائي', deleting: 'جارٍ الحذف...',
    noDate: '—',
    status: { ACTIVE: 'منشورة', DRAFT: 'مسودة', EXPIRED: 'منتهية' },
    lbl: { bookingNo: 'رقم الحجز', eventDate: 'تاريخ المناسبة', location: 'المكان', status: 'الحالة' },
    noLocation: 'غير محدد',
    noLinkYet: 'الرابط لم يُولَّد بعد — أكمل التصميم والدفع',
  saveAsTemplate: 'حفظ كقالب',
tplTitle: 'نشر الدعوة كقالب',
tplCode: 'رمز القالب (مثل W046)',
tplName: 'اسم القالب',
tplCat: 'التصنيف',
tplSubmit: 'نشر القالب',
tplSaving: 'جارٍ النشر…',
tplDone: 'تم نشر القالب بنجاح ✓',
},
  en: {
    title: 'My Invitations',
    tagline: 'Every invitation tells your story — manage your digital cards, track RSVPs live, and open your memory gallery, all in one place worthy of you.',
    createNew: 'Create New',
    codeLabel: 'User code',
    stats: { total: 'Total', published: 'Published', drafts: 'Drafts', rsvps: 'RSVPs' },
    search: 'Search your invitations by name or booking no...',
    filters: { all: 'All', paid: 'Paid', unpaid: 'Unpaid' },
    bookingsTitle: 'Bookings',
    th: { bookingNo: 'Booking No', bookingDate: 'Booking Date', eventDate: 'Event Date', payment: 'Payment', rsvp: 'RSVP', gallery: 'Gallery', actions: 'Actions' },
    paid: 'Paid', unpaid: 'Unpaid',
    responses: 'responses', photos: 'Photos',
    act: { view: 'View card', edit: 'Edit card', gallery: 'Captures & gallery', delete: 'Delete', share: 'Share page', open: 'Open invitation', dashboard: 'Manage guests' },
    previewTitle: 'Card Preview',
    galleryTitle: 'Invitation Captures & Gallery',
    tabCaptured: 'Guest Captures', tabGallery: 'Selected Gallery',
    emptyPhotos: 'No photos here yet — share your QR code and let guests start capturing moments.',
    emptyTitle: 'No invitations yet',
    emptySub: 'Start your story now — create your first digital invitation in minutes.',
    deleteTitle: 'Delete Invitation',
    deleteSub: 'The invitation and all its data will be permanently deleted. This cannot be undone.',
    cancel: 'Cancel', confirm: 'Delete Forever', deleting: 'Deleting...',
    noDate: '—',
    status: { ACTIVE: 'Published', DRAFT: 'Draft', EXPIRED: 'Expired' },
    lbl: { bookingNo: 'Booking No', eventDate: 'Event Date', location: 'Location', status: 'Status' },
    noLocation: 'Not set',
    noLinkYet: 'Link not generated yet — finish design and payment',saveAsTemplate: 'Save as template',
tplTitle: 'Publish as template',
tplCode: 'Template code (e.g. W046)',
tplName: 'Template name',
tplCat: 'Category',
tplSubmit: 'Publish template',
tplSaving: 'Publishing…',
tplDone: 'Template published successfully ✓',
  },
};

/* أيقونات SVG خفيفة — معرّفة مرة واحدة ومعاد استخدامها */
const I = {
  plus: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>,
  mail: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>,
  phone: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 4h4l2 5-3 2a12 12 0 005 5l2-3 5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" /></svg>,
  search: <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>,
  cal: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>,
  eyeStat: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  draft: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></svg>,
  rsvp: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>,
  users: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>,
  img: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M3 17l5-4 4 3 4-4 5 5" /></svg>,
  eye: <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  edit: <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></svg>,
  cam: <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 8h3l2-3h8l2 3h3v12H3z" /><circle cx="12" cy="13" r="3.5" /></svg>,
  del: <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6" /></svg>,
  x: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>,
  env: <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>,
  /* ✅ أيقونات جديدة للزرين */
  share: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" /></svg>,
  ext: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" /></svg>,
  dash: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3v18h18" /><path d="M7 14l4-4 4 4 5-5" /></svg>,
};

export default function MyInvitations() {
  const [unreadMap, setUnreadMap] = useState({});

  const { lang } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const c = COPY[lang];

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [payFilter, setPayFilter] = useState('all');

  const [previewItem, setPreviewItem] = useState(null);
  const [galleryItem, setGalleryItem] = useState(null);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryTab, setGalleryTab] = useState('CAPTURED');
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);
const [tplItem, setTplItem] = useState(null);
const [tplForm, setTplForm] = useState({ code: '', name: '', category: 'wedding' });
const [tplSaving, setTplSaving] = useState(false);
const isStaff = !!(user?.is_staff || user?.is_superuser);
  /* حماية الصفحة */
  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true });
  }, [user, authLoading, navigate]);

  const fetchList = useCallback(() => {
    setLoading(true);
    api.get('/invitations/', { params: { ordering: '-created_at', page_size: '100' } })
      .then((res) => setItems(res.data.results || res.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { if (user) fetchList(); }, [user, fetchList]);
  /* 🔔 خريطة الردود الجديدة لكل دعوة */
  useEffect(() => {
    if (!user) return;
    fetchUnread()
      .then((d) => {
        const map = {};
        (d.items || []).forEach((it) => { map[it.invitation_id] = it.count; });
        setUnreadMap(map);
      })
      .catch(() => {});
  }, [user, items]);


  const openGallery = (inv) => {
    setGalleryItem(inv);
    setGalleryTab('CAPTURED');
    setGalleryLoading(true);
    api.get(`/invitations/${inv.id}/photos/`)
      .then((res) => setGalleryPhotos(res.data || []))
      .catch(() => setGalleryPhotos([]))
      .finally(() => setGalleryLoading(false));
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/invitations/${deleteItem.id}/`);
      setDeleteItem(null);
      fetchList();
    } catch { /* تجاهل */ } finally { setDeleting(false); }
  };

  const fmt = (d) => d
    ? new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : c.noDate;

  const q = search.trim().toLowerCase();
  const filtered = items.filter((inv) => {
    const matchQ = !q || (inv.title || '').toLowerCase().includes(q) || (inv.booking_no || '').toLowerCase().includes(q);
    const matchPay = payFilter === 'all' || inv.payment_status === payFilter.toUpperCase();
    return matchQ && matchPay;
  });
  const submitTemplate = async () => {
    if (!tplForm.code.trim()) return;
    setTplSaving(true);
    try {
      await saveAsTemplate({ invitation_id: tplItem.id, ...tplForm });
      window.alert(c.tplDone);
      setTplItem(null);
      setTplForm({ code: '', name: '', category: 'wedding' });
    } catch (e) {
      window.alert(e?.response?.data?.error || 'Error');
    } finally {
      setTplSaving(false);
    }
  };
  const stats = {
    total: items.length,
    published: items.filter((i) => i.status === 'ACTIVE').length,
    drafts: items.filter((i) => i.status === 'DRAFT').length,
    rsvps: items.reduce((s, i) => s + (i.responses_count || 0), 0),
  };

  const statusCls = { ACTIVE: 'mi-badge--paid', DRAFT: 'mi-badge--draft', EXPIRED: 'mi-badge--expired' };
  const galleryShown = galleryPhotos.filter((p) => p.source === galleryTab);

  /* ✅ دالة مساعدة لفتح رابط الدعوة العام */
  const openPublicLink = (inv) => {
    if (!inv.share_slug) return;
    const url = `${window.location.origin}/i/${inv.share_slug}`;
    window.open(url, '_blank', 'noopener');
  };

  return (
    <div className="mi-page">
      <Navbar />

      <main className="mi-main">
        <div className="container">
          {/* الترويسة + زر الإنشاء */}
          <header className="mi-head">
            <div>
              <h1 className="mi-title">{c.title}</h1>
              <p className="mi-tagline">{c.tagline}</p>
            </div>
            <Link to="/invitations/create" className="mi-create">
              <span className="mi-create__sheen" aria-hidden="true" />
              {I.plus}
              <span>{c.createNew}</span>
            </Link>
          </header>

          {/* شريط بيانات المستخدم */}
          <div className="mi-strip">
            <span className="mi-strip__item">{I.mail} {user?.email}</span>
            {user?.phone && <span className="mi-strip__item">{I.phone} <b dir="ltr">{user.phone}</b></span>}
            <span className="mi-strip__item mi-strip__code"># {(user?.username || '').toUpperCase()}</span>
          </div>

          {/* الإحصائيات */}
          <div className="mi-stats">
            <div className="mi-stat">
              <span className="mi-stat__icon mi-stat__icon--blue">{I.cal}</span>
              <div><p className="mi-stat__label">{c.stats.total}</p><p className="mi-stat__value">{stats.total}</p></div>
            </div>
            <div className="mi-stat">
              <span className="mi-stat__icon mi-stat__icon--green">{I.eyeStat}</span>
              <div><p className="mi-stat__label">{c.stats.published}</p><p className="mi-stat__value">{stats.published}</p></div>
            </div>
            <div className="mi-stat">
              <span className="mi-stat__icon mi-stat__icon--orange">{I.draft}</span>
              <div><p className="mi-stat__label">{c.stats.drafts}</p><p className="mi-stat__value">{stats.drafts}</p></div>
            </div>
            <div className="mi-stat">
              <span className="mi-stat__icon mi-stat__icon--purple">{I.rsvp}</span>
              <div><p className="mi-stat__label">{c.stats.rsvps}</p><p className="mi-stat__value">{stats.rsvps}</p></div>
            </div>
          </div>

          {/* البحث + الفلاتر */}
          <div className="mi-tools">
            <label className="mi-search">
              {I.search}
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={c.search} />
            </label>
            <div className="mi-seg">
              {['all', 'paid', 'unpaid'].map((k) => (
                <button key={k} className={`mi-seg__btn ${payFilter === k ? 'is-active' : ''}`} onClick={() => setPayFilter(k)}>
                  {c.filters[k]}
                </button>
              ))}
            </div>
          </div>

          {/* جدول الحجوزات */}
          <div className="mi-tablecard">
            <h2 className="mi-tablecard__title">{c.bookingsTitle}</h2>

            {loading ? (
              <div>
                <div className="mi-skel" /><div className="mi-skel" /><div className="mi-skel" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="mi-empty">
                {I.env}
                <h3>{c.emptyTitle}</h3>
                <p>{c.emptySub}</p>
                <Link to="/invitations/create" className="mi-create">
                  <span className="mi-create__sheen" aria-hidden="true" />
                  {I.plus}<span>{c.createNew}</span>
                </Link>
              </div>
            ) : (
              <div className="mi-tablewrap">
                <table className="mi-table">
                  <thead>
                    <tr>
                      <th>{c.th.bookingNo}</th>
                      <th>{c.th.bookingDate}</th>
                      <th>{c.th.eventDate}</th>
                      <th>{c.th.payment}</th>
                      <th>{c.th.rsvp}</th>
                      <th>{c.th.gallery}</th>
                      <th>{c.th.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((inv) => {
                      const isPaid = inv.payment_status === 'PAID';
                      const canOpen = isPaid && !!inv.share_slug;
                      return (
                        <tr key={inv.id}>
                          <td>
                            <button className="mi-bno" onClick={() => setPreviewItem(inv)}>{inv.booking_no}</button>
                            <span className="mi-btitle">{inv.title}</span>
                                                        {unreadMap[inv.id] > 0 && (
                              <span className="mi-unread" title={lang === 'ar' ? 'ردود جديدة' : 'New responses'}>
                                {unreadMap[inv.id]}
                              </span>
                            )}
                          </td>
                          <td>{fmt(inv.created_at)}</td>
                          <td>{fmt(inv.event_date)}</td>
                          <td>
                            <span className={`mi-badge ${inv.payment_status === 'PAID' ? 'mi-badge--paid' : 'mi-badge--unpaid'}`}>
                              {inv.payment_status === 'PAID' ? c.paid : c.unpaid}
                            </span>
                          </td>
                          <td><span className="mi-cell">{I.users} {inv.responses_count || 0} {c.responses}</span></td>
                          <td><span className="mi-cell">{I.img} {inv.photos_count || 0} {c.photos}</span></td>
                          <td>
                            <div className="mi-actions">
                              <button className="mi-act mi-act--view" title={c.act.view} aria-label={c.act.view} onClick={() => setPreviewItem(inv)}>{I.eye}</button>
                              <button className="mi-act mi-act--edit" title={c.act.edit} aria-label={c.act.edit} onClick={() => navigate(`/invitations/${inv.id}/edit`)}>{I.edit}</button>
                              <button className="mi-act mi-act--cam" title={c.act.gallery} aria-label={c.act.gallery} onClick={() => openGallery(inv)}>{I.cam}</button>
                              <button className="mi-act mi-act--del" title={c.act.delete} aria-label={c.act.delete} onClick={() => setDeleteItem(inv)}>{I.del}</button>

                              {/* ✅ زر صفحة المشاركة — يظهر فقط للمدفوعة */}
                              {isPaid && (
                                <button
                                  className="mi-act mi-act--share"
                                  title={c.act.share}
                                  aria-label={c.act.share}
                                  onClick={() => navigate(`/share/${inv.id}`)}
                                >
                                  {I.share}
                                </button>
                              )}

                              {/* ✅ زر فتح الدعوة العام — يظهر فقط للمدفوعة مع slug */}
                              {isPaid && (
                                <button
                                  className={`mi-act mi-act--open ${!canOpen ? 'is-disabled' : ''}`}
                                  title={canOpen ? c.act.open : c.noLinkYet}
                                  aria-label={c.act.open}
                                  disabled={!canOpen}
                                  onClick={() => openPublicLink(inv)}
                                >
                                  {I.ext}
                                </button>
                              )}

                              {/* ✅ زر لوحة إدارة الضيوف — يظهر فقط للمدفوعة */}
                              {isPaid && (
                                <button
                                  className="mi-act mi-act--dashboard"
                                  title={c.act.dashboard}
                                  aria-label={c.act.dashboard}
                                  onClick={() => navigate(`/dashboard/${inv.id}`)}
                                >
                                  {I.dash}
                                </button>
                              )}

                                   <button
                                className="mi-act mi-act--tpl"
                                title={c.saveAsTemplate}
                                aria-label={c.saveAsTemplate}
                                onClick={() => setTplItem(inv)}
                              >
                                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8-6.1-3.5-6.1 3.5 1.4-6.8L2.2 9.1l6.9-.8z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* ═══ مودال المعاينة ═══ */}
      {previewItem && (
        <div className="mi-backdrop" onClick={() => setPreviewItem(null)}>
          <div className="mi-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mi-modal__head">
              <h3 className="mi-modal__title">{c.previewTitle}</h3>
              <button className="mi-modal__close" onClick={() => setPreviewItem(null)} aria-label="Close">{I.x}</button>
            </div>
            <div className="mi-preview">
              <div
                className={`mi-preview__cover ${previewItem.template_thumbnail ? '' : 'mi-preview__cover--plain'}`}
                style={previewItem.template_thumbnail ? { backgroundImage: `url(${previewItem.template_thumbnail})` } : undefined}
              >
                <span className={`mi-badge ${statusCls[previewItem.status]} mi-preview__status`}>
                  {c.status[previewItem.status] || previewItem.status}
                </span>
              </div>
              <dl className="mi-preview__body">
                <div className="mi-preview__row"><dt>{c.lbl.bookingNo}</dt><dd>{previewItem.booking_no}</dd></div>
                <div className="mi-preview__row"><dt>{c.lbl.eventDate}</dt><dd>{fmt(previewItem.event_date)}</dd></div>
                <div className="mi-preview__row"><dt>{c.lbl.location}</dt><dd>{previewItem.location || c.noLocation}</dd></div>
                <div className="mi-preview__row"><dt>{c.th.payment}</dt><dd>{previewItem.payment_status === 'PAID' ? c.paid : c.unpaid}</dd></div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {/* ═══ مودال اللقطات والمعرض ═══ */}
      {galleryItem && (
        <div className="mi-backdrop" onClick={() => setGalleryItem(null)}>
          <div className="mi-modal mi-modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="mi-modal__head">
              <h3 className="mi-modal__title">{c.galleryTitle} — {galleryItem.title}</h3>
              <button className="mi-modal__close" onClick={() => setGalleryItem(null)} aria-label="Close">{I.x}</button>
            </div>
            <div className="mi-tabs">
              <button className={`mi-tab ${galleryTab === 'CAPTURED' ? 'is-active' : ''}`} onClick={() => setGalleryTab('CAPTURED')}>{c.tabCaptured}</button>
              <button className={`mi-tab ${galleryTab === 'GALLERY' ? 'is-active' : ''}`} onClick={() => setGalleryTab('GALLERY')}>{c.tabGallery}</button>
            </div>
            {galleryLoading ? (
              <div><div className="mi-skel" /><div className="mi-skel" /></div>
            ) : galleryShown.length === 0 ? (
              <p className="mi-empty-photos">{c.emptyPhotos}</p>
            ) : (
              <div className="mi-photos">
                {galleryShown.map((p) => (
                  <figure className="mi-photo" key={p.id}>
                    <img src={p.image_url} alt={p.caption || galleryItem.title} loading="lazy" />
                    {p.caption && <figcaption className="mi-photo__cap">{p.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ مودال تأكيد الحذف ═══ */}
      {deleteItem && (
        <div className="mi-backdrop" onClick={() => setDeleteItem(null)}>
          <div className="mi-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mi-danger">
              <span className="mi-danger__icon">{I.del}</span>
              <h3 className="mi-modal__title">{c.deleteTitle} — {deleteItem.title}</h3>
              <p>{c.deleteSub}</p>
              <div className="mi-danger__actions">
                <button className="mi-btn-cancel" onClick={() => setDeleteItem(null)}>{c.cancel}</button>
                <button className="mi-btn-del" onClick={confirmDelete} disabled={deleting}>
                  {deleting ? c.deleting : c.confirm}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

            {/* ═══ مودال نشر الدعوة كقالب (أدمن) ═══ */}
      {tplItem && (
        <div className="mi-backdrop" onClick={() => setTplItem(null)}>
          <div className="mi-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mi-modal__head">
              <h3 className="mi-modal__title">{c.tplTitle} — {tplItem.title}</h3>
              <button className="mi-modal__close" onClick={() => setTplItem(null)} aria-label="Close">{I.x}</button>
            </div>
            <div className="mi-tpl-form">
              <label>
                {c.tplCode}
                <input value={tplForm.code} onChange={(e) => setTplForm({ ...tplForm, code: e.target.value })} placeholder="W046" />
              </label>
              <label>
                {c.tplName}
                <input value={tplForm.name} onChange={(e) => setTplForm({ ...tplForm, name: e.target.value })} />
              </label>
              <label>
                {c.tplCat}
                <select value={tplForm.category} onChange={(e) => setTplForm({ ...tplForm, category: e.target.value })}>
                  <option value="wedding">Wedding</option>
                  <option value="engagement">Engagement</option>
                  <option value="birthday">Birthday</option>
                  <option value="graduation">Graduation</option>
                  <option value="corporate">Corporate</option>
                </select>
              </label>
              <button
                className="mi-btn-del mi-tpl-submit"
                disabled={tplSaving || !tplForm.code.trim()}
                onClick={submitTemplate}
              >
                {tplSaving ? c.tplSaving : c.tplSubmit}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

