import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext(null);

/**
 * Provides: lang ('ar'|'en'), dir, t(key), toggleLang()
 * Syncs <html lang dir> + document.title for SEO.
 */
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('invitory-lang') || 'ar');

  useEffect(() => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.title = lang === 'ar'
      ? 'Invitory | دعوات رقمية فاخرة لكل مناسبة'
      : 'Invitory | Luxury Digital Invitations for Every Occasion';
    localStorage.setItem('invitory-lang', lang);
  }, [lang]);

  /** Dot-path getter: t('nav.home') */
  const t = useCallback(
    (key) => key.split('.').reduce((o, k) => (o ? o[k] : undefined), translations[lang]) ?? key,
    [lang]
  );

  const toggleLang = useCallback(() => setLang((p) => (p === 'ar' ? 'en' : 'ar')), []);
  const value = useMemo(() => ({ lang, dir: lang === 'ar' ? 'rtl' : 'ltr', t, toggleLang }), [lang, t, toggleLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);