import styles from './Spinner.module.css';

/**
 * Spinner — indeterminate loading indicator.
 *
 * @param {number} size      Diameter in px
 * @param {boolean} fullPage Centre in a tall region, for route-level loading
 * @param {string} label     Optional text below the spinner
 */
const Spinner = ({ size = 32, fullPage = false, label, className = '' }) => (
  <div
    className={[styles.wrapper, fullPage && styles.fullPage, className]
      .filter(Boolean)
      .join(' ')}
    // Announces the loading state to screen readers, which otherwise perceive
    // a spinning div as an empty page.
    role="status"
    aria-live="polite"
  >
    <span
      className={styles.spinner}
      style={{
        width: size,
        height: size,
        borderWidth: Math.max(2, Math.round(size / 12)),
      }}
      aria-hidden="true"
    />
    {label && <span className={styles.label}>{label}</span>}
    {!label && <span className="sr-only">Loading</span>}
  </div>
);

/**
 * Skeleton — content-shaped loading placeholder.
 *
 * Prefer this over a spinner when you know the shape of what is coming, so the
 * layout does not shift once the data lands.
 */
export const Skeleton = ({ width = '100%', height = 16, radius, className = '', style }) => (
  <span
    className={[styles.skeleton, className].filter(Boolean).join(' ')}
    style={{
      display: 'block',
      width,
      height,
      borderRadius: radius,
      ...style,
    }}
    aria-hidden="true"
  />
);

export default Spinner;
