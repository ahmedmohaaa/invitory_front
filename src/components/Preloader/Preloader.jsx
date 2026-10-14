import { useEffect, useState } from 'react';
import BrandLogo from '../BrandLogo/BrandLogo';
import './Preloader.css';

/**
 * شاشة تحميل فاخرة: تظهر شعار Invitory عند دخول الموقع / الـ reload
 * ثم تتلاشى بسلاسة بعد اكتمال تحميل الصفحة (بحد أدنى زمني للظهور).
 */
const Preloader = () => {
  const [hidden, setHidden] = useState(false); // بدء التلاشي
  const [gone, setGone] = useState(false);     // إزالة من الـ DOM

  useEffect(() => {
    const MIN_VISIBLE = 1400;
    const start = Date.now();
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      const wait = Math.max(0, MIN_VISIBLE - (Date.now() - start));
      setTimeout(() => {
        setHidden(true);
        setTimeout(() => setGone(true), 650); // بعد انتهاء transition
      }, wait);
    };

    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish, { once: true });

    const safety = setTimeout(finish, 3500); // أمان: لا تعلق الشاشة أبداً
    return () => {
      window.removeEventListener('load', finish);
      clearTimeout(safety);
    };
  }, []);

  if (gone) return null;

  return (
    <div className={`preloader ${hidden ? 'is-hidden' : ''}`} aria-hidden="true">
      <BrandLogo withTagline animated />
    </div>
  );
};

export default Preloader;