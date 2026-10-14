import { useEffect, useRef } from 'react';
import './RichEditor.css';

/* مستويات حجم الخط — تكبير/تصغير تراكمي حسب حجم خط التحديد الحالي */
const SIZES = [12, 14, 16, 18, 22, 28, 36];

const ICONS = {
  undo: <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 00-15-6.7L3 13" /></svg>,
  redo: <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0115-6.7L21 13" /></svg>,
  alignRight: <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M4 6h16M10 12h10M4 18h16" /></svg>,
  alignCenter: <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M4 6h16M7 12h10M4 18h16" /></svg>,
  alignLeft: <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M4 6h16M4 12h10M4 18h16" /></svg>,
  ul: <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="1" fill="currentColor" /><circle cx="4.5" cy="12" r="1" fill="currentColor" /><circle cx="4.5" cy="18" r="1" fill="currentColor" /></svg>,
  ol: <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M10 6h10M10 12h10M10 18h10M4 5h1v4M4 9h2M4 14h2a1 1 0 011 1v1a1 1 0 01-1 1H4" /></svg>,
  clear: <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V5h16v2M9 5l-3 14M14 5l1 8M5 21h8" /></svg>,
};

/**
 * ✍️ محرر نص غني خفيف (contentEditable + execCommand) — صفر مكتبات
 * - غير مُتحكَّم به داخلياً: لا نعيد كتابة الـ DOM أثناء الكتابة (ثبات الـ caret)
 * - الـ prop value يُستخدم للمزامنة الخارجية فقط (Hydrate / Reset)
 */
export default function RichEditor({ value, onChange, dir = 'rtl', onDirChange, placeholder = '' }) {
  const ref = useRef(null);
  const internal = useRef(value || '');

  /* مزامنة خارجية فقط: أعد الكتابة حين تتغير القيمة من خارج المحرر */
  useEffect(() => {
    const next = value || '';
    if (ref.current && next !== internal.current && ref.current.innerHTML !== next) {
      ref.current.innerHTML = next;
      internal.current = next;
    }
  }, [value]);

  const emit = () => {
    internal.current = ref.current.innerHTML;
    onChange(internal.current);
  };

  const exec = (cmd, arg = null) => {
    ref.current.focus();
    document.execCommand(cmd, false, arg);
    emit();
  };

  /* أقرب مستوى حجم لحجم خط التحديد الحالي (تكبير/تصغير ذكي) */
  const currentLevel = () => {
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode) return 2;
    const node = sel.anchorNode;
    const el = node.nodeType === 1 ? node : node.parentElement;
    const px = parseFloat(window.getComputedStyle(el).fontSize) || 16;
    let best = 0;
    SIZES.forEach((s, i) => {
      if (Math.abs(s - px) < Math.abs(SIZES[best] - px)) best = i;
    });
    return best;
  };

  const stepSize = (delta) => {
    const next = Math.min(SIZES.length - 1, Math.max(0, currentLevel() + delta));
    exec('fontSize', String(next + 1));
  };

  /* منع أزرار الشريط من سرقة التركيز من منطقة الكتابة */
  const hold = (e) => e.preventDefault();

  return (
    <div className="re" dir={dir}>
      <div className="re-bar" role="toolbar" aria-label="Rich text tools">
        <button type="button" className="re-btn re-btn--txt" title="Bold" onMouseDown={hold} onClick={() => exec('bold')}><b>B</b></button>
        <button type="button" className="re-btn re-btn--txt" title="Italic" onMouseDown={hold} onClick={() => exec('italic')}><i>I</i></button>
        <button type="button" className="re-btn re-btn--txt" title="Underline" onMouseDown={hold} onClick={() => exec('underline')}><u>U</u></button>
        <button type="button" className="re-btn re-btn--txt" title="Strikethrough" onMouseDown={hold} onClick={() => exec('strikeThrough')}><s>S</s></button>
        <span className="re-sep" />
        <button type="button" className="re-btn" title="تكبير الخط" onMouseDown={hold} onClick={() => stepSize(1)}>A+</button>
        <button type="button" className="re-btn" title="تصغير الخط" onMouseDown={hold} onClick={() => stepSize(-1)}>A−</button>
        <span className="re-sep" />
        <button type="button" className="re-btn" title="محاذاة يمين" onMouseDown={hold} onClick={() => exec('justifyRight')}>{ICONS.alignRight}</button>
        <button type="button" className="re-btn" title="توسيط" onMouseDown={hold} onClick={() => exec('justifyCenter')}>{ICONS.alignCenter}</button>
        <button type="button" className="re-btn" title="محاذاة يسار" onMouseDown={hold} onClick={() => exec('justifyLeft')}>{ICONS.alignLeft}</button>
        <span className="re-sep" />
        <button type="button" className="re-btn" title="قائمة نقطية" onMouseDown={hold} onClick={() => exec('insertUnorderedList')}>{ICONS.ul}</button>
        <button type="button" className="re-btn" title="قائمة رقمية" onMouseDown={hold} onClick={() => exec('insertOrderedList')}>{ICONS.ol}</button>
        <span className="re-sep" />
        <button type="button" className={`re-btn ${dir === 'rtl' ? 'is-on' : ''}`} title="اتجاه عربي" onMouseDown={hold} onClick={() => onDirChange && onDirChange('rtl')}>RTL</button>
        <button type="button" className={`re-btn ${dir === 'ltr' ? 'is-on' : ''}`} title="اتجاه إنجليزي" onMouseDown={hold} onClick={() => onDirChange && onDirChange('ltr')}>LTR</button>
        <span className="re-sep" />
        <button type="button" className="re-btn" title="تراجع" onMouseDown={hold} onClick={() => exec('undo')}>{ICONS.undo}</button>
        <button type="button" className="re-btn" title="إعادة" onMouseDown={hold} onClick={() => exec('redo')}>{ICONS.redo}</button>
        <button type="button" className="re-btn" title="مسح التنسيق" onMouseDown={hold} onClick={() => exec('removeFormat')}>{ICONS.clear}</button>
      </div>
      <div
        ref={ref}
        className="re-area"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={emit}
        onBlur={emit}
      />
    </div>
  );
}