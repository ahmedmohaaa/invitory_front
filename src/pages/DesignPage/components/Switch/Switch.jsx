import './Switch.css';

/**
 * 🎚️ مفتاح تبديل ذهبي موحّد (RTL/LTR آمن) — يُستخدم في كل مراحل الـ Toggles
 * لمنع تكرار كود المفتاح بين الخطوات (6، 8، 10، 15، 16، 18...)
 */
export default function Switch({ checked = false, onChange, label, hint }) {
  return (
    <div className="sw-row">
      {(label || hint) && (
        <div className="sw-row__txt">
          {label && <p className="sw-row__label">{label}</p>}
          {hint && <p className="sw-row__hint">{hint}</p>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={!!checked}
        className={`sw ${checked ? 'is-on' : ''}`}
        onClick={() => onChange && onChange(!checked)}
      >
        <span className="sw__knob" aria-hidden="true" />
      </button>
    </div>
  );
}