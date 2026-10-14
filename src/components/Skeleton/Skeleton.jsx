import './Skeleton.css';

/**
 * Luxurious shimmer skeleton (transform-only shine).
 * variants: 'card' | 'phone'
 */
export default function Skeleton({ count = 3, variant = 'card', label = '' }) {
  return (
    <div className={`skeleton skeleton--${variant}`} role="status" aria-label={label || 'Loading'}>
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton__item" key={i} style={{ animationDelay: `${i * 90}ms` }}>
          <span className="skeleton__shine" aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}