import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import api from '../../services/api';
import { fetchTemplateCards } from '../../services/templates';
import './TemplatesPage.css';

const COPY = {
  ar: {
    eyebrow: '✦ معرض القوالب ✦',
    title: 'قوالب تُشبه حكايتك',
    sub: 'مجموعة مختارة بعناية — كل قالب صُمم ليحكي قصة مختلفة. اختر ما يشبهك وابدأ التصميم خلال ثوانٍ.',
    search: 'ابحث برمز القالب أو اسمه…',
    all: 'الكل',
    found: (n) => `تم العثور على ${n} قالب`,
    preview: 'معاينة',
    select: 'اختار',
    selecting: 'جارٍ التجهيز…',
    loading: 'جارٍ التحميل…',
    end: 'وصلت لنهاية المعرض ✨',
    empty: 'لا توجد قوالب مطابقة — جرّب تصنيفاً أو بحثاً آخر.',
    modalUse: 'ابدأ التصميم بهذا القالب',
    modalCode: 'رمز القالب',
    modalCat: 'التصنيف',
    loginFirst: 'سجّل دخولك أولاً لاختيار القالب',
  },
  en: {
    eyebrow: '✦ Templates Gallery ',
    title: 'Templates that feel like your story',
    sub: 'A hand-picked collection — every template tells a different story. Choose yours and start designing in seconds.',
    search: 'Search by code or name…',
    all: 'All',
    found: (n) => `${n} templates found`,
    preview: 'Preview',
    select: 'Select',
    selecting: 'Preparing…',
    loading: 'Loading…',
    end: 'You reached the end ✨',
    empty: 'No matching templates — try another category or search.',
    modalUse: 'Start designing with this template',
    modalCode: 'Code',
    modalCat: 'Category',
    loginFirst: 'Login first to select a template',
  },
};

/* توحيد شكل بيانات القالب مهما اختلفت أسماء الحقول */
const norm = (t) => ({
  id: t.id,
  code: t.code || `T${t.id}`,
  name: t.name || t.title || '',
  category: t.category_label || t.category || '',
  image: t.thumbnail || t.image || t.preview_image || t.preview_url || t.thumbnail_url || '',
});

export default function TemplatesPage() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const c = COPY[lang];

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [visible, setVisible] = useState(() => new Set());

  /* ✅ بيانات الكروت: أول خلفية + أسماء الصفحة الأولى لكل قالب */
  const [cardPv, setCardPv] = useState({});

  const loadingRef = useRef(false);
  const pageRef = useRef(1);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  /* 📥 تحميل صفحة من القوالب */
  const loadPage = useCallback(async (pageNum) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const res = await api.get('/templates/', {
        params: { is_active: 'true', page: pageNum, page_size: 12, ordering: 'code' },
      });
      const data = res.data;
      const list = Array.isArray(data) ? data : (data.results || []);
      const count = Array.isArray(data) ? list.length : (data.count ?? list.length);
      setItems((prev) => (pageNum === 1 ? list.map(norm) : [...prev, ...list.map(norm)]));
      setTotal(count);
      setHasMore(list.length === 12);
      pageRef.current = pageNum;
      setPage(pageNum);
    } catch {
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPage(1); }, [loadPage]);

  /* ✅ جلب بيانات الكروت (أول خلفية + أسماء) لكل القوالب عند التحميل */
  useEffect(() => {
    fetchTemplateCards()
      .then((list) => {
        const map = {};
        (list || []).forEach((p) => {
          if (p && p.template_id != null) map[p.template_id] = p;
        });
        setCardPv(map);
      })
      .catch(() => setCardPv({}));
  }, []);

  /* 👁 مراقب كشف البطاقات عند التمرير (Stagger Reveal) */
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            const id = Number(en.target.dataset.id);
            setVisible((prev) => {
              if (prev.has(id)) return prev;
              const s = new Set(prev);
              s.add(id);
              return s;
            });
            observerRef.current?.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    return () => observerRef.current?.disconnect();
  }, []);

  const cardRef = useCallback((el) => {
    if (el && observerRef.current) observerRef.current.observe(el);
  }, []);

  /* ♾️ التحميل اللانهائي */
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      (es) => {
        if (es[0].isIntersecting && !loadingRef.current && hasMore) {
          loadPage(pageRef.current + 1);
        }
      },
      { rootMargin: '350px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loadPage]);

  /*  الفلترة المحلية (تصنيف + بحث) */
  const categories = useMemo(() => {
    const set = new Set();
    items.forEach((t) => { if (t.category) set.add(t.category); });
    return Array.from(set);
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((t) => {
      const okCat = category === 'all' || t.category === category;
      const okQ = !q || t.code.toLowerCase().includes(q) || t.name.toLowerCase().includes(q);
      return okCat && okQ;
    });
  }, [items, category, search]);

  const isFiltering = category !== 'all' || search.trim() !== '';
  const shownCount = isFiltering ? filtered.length : total;

  /* 🎯 اختيار قالب → إنشاء دعوة مسودة → المصمم */
  const handleSelect = async (t) => {
    if (!user) {
      window.alert(c.loginFirst);
      navigate('/login');
      return;
    }
    setBusyId(t.id);
    try {
      const res = await api.post(`/templates/${t.id}/start/`);
      navigate(`/invitations/${res.data.invitation_id}/edit`);
    } catch {
      navigate('/invitations/create');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="tp">
      {/* خلفية زخرفية حية */}
      <span className="tp__orb tp__orb--1" aria-hidden="true" />
      <span className="tp__orb tp__orb--2" aria-hidden="true" />
      <span className="tp__orb tp__orb--3" aria-hidden="true" />

      <Navbar />

      {/* الترويسة */}
      <header className="tp__hero container">
        <span className="tp__eyebrow">{c.eyebrow}</span>
        <h1 className="tp__title">{c.title}</h1>
        <p className="tp__sub">{c.sub}</p>

        <div className="tp__tools">
          <label className="tp__search">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
            </svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={c.search} />
          </label>
          <span className="tp__count">{c.found(shownCount)}</span>
        </div>

        <div className="tp__chips">
          <button className={`tp__chip ${category === 'all' ? 'is-active' : ''}`} onClick={() => setCategory('all')}>
            {c.all}
          </button>
          {categories.map((cat) => (
            <button key={cat} className={`tp__chip ${category === cat ? 'is-active' : ''}`} onClick={() => setCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* الشبكة */}
      <main className="tp__grid container">
        {filtered.length === 0 && !loading ? (
          <p className="tp__empty">{c.empty}</p>
        ) : (
          filtered.map((t, i) => {
            const cp = cardPv[t.id];
            return (
              <article
                key={t.id}
                data-id={t.id}
                ref={cardRef}
                className={`tp-card ${visible.has(t.id) ? 'is-visible' : ''}`}
                style={{ transitionDelay: `${(i % 6) * 80}ms` }}
              >
                {/* 📱 إطار الهاتف */}
                <div className="tp-phone">
                  <span className="tp-phone__notch" aria-hidden="true" />
                  <span className="tp-phone__side tp-phone__side--l" aria-hidden="true" />
                  <span className="tp-phone__side tp-phone__side--r" aria-hidden="true" />
                  <div className="tp-phone__screen">
                    {cp && cp.first_bg ? (
                      /* ✅ صورة الكرت الذكية: أول خلفية + أسماء الصفحة الأولى */
                      <div className="tpl-thumb" style={{ backgroundImage: `url(${cp.first_bg})` }}>
                        <div className="tpl-thumb__names">
                          <span>{cp.name1}</span>
                          {cp.name2 && <span className="tpl-thumb__amp">&</span>}
                          {cp.name2 && <span>{cp.name2}</span>}
                          {cp.title && !cp.name1 && !cp.name2 && <span className="tpl-thumb__title">{cp.title}</span>}
                        </div>
                      </div>
                    ) : t.image ? (
                      <img src={t.image} alt={t.name || t.code} loading="lazy" />
                    ) : (
                      <div className="tp-phone__placeholder"><span>{t.code}</span></div>
                    )}
                    <span className="tp-phone__sheen" aria-hidden="true" />
                  </div>
                </div>

                {/* الأزرار */}
                <div className="tp-actions">
                  {/* ✅ المعاينة → صفحة كاملة بتجربة الدعوة العامة */}
                  <button className="tp-btn tp-btn--preview" onClick={() => navigate(`/template-preview/${t.id}`)}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                    {c.preview}
                  </button>
                  <button className="tp-btn tp-btn--select" onClick={() => handleSelect(t)} disabled={busyId === t.id}>
                    {busyId === t.id ? c.selecting : c.select}
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" className="tp-arrow" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </button>
                </div>

                <p className="tp-code">{t.code}</p>
                <p className="tp-cat">{t.category}</p>
              </article>
            );
          })
        )}
      </main>

      {/* ♾️ نقطة التحميل اللانهائي */}
      <div className="tp__sentinel" ref={sentinelRef}>
        {loading && <div className="tp__loader"><span /><span /><span /></div>}
        {!hasMore && items.length > 0 && <p className="tp__end">{c.end}</p>}
      </div>

      <Footer />
    </div>
  );
}