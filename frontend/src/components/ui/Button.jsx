import styles from './Button.module.css';

/**
 * Button
 *
 * @param {'primary'|'secondary'|'ghost'|'danger'|'blood'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} loading   Shows a spinner and blocks clicks
 * @param {boolean} fullWidth Stretch to the container width
 * @param {boolean} pill      Fully rounded ends
 * @param {boolean} iconOnly  Square target with no text padding
 *
 * Any other prop (onClick, type, aria-label, ...) is forwarded to the element.
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  pill = false,
  iconOnly = false,
  disabled = false,
  className = '',
  children,
  ...rest
}) => {
  // Falsy entries are filtered out so we never emit "btn  undefined".
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    pill && styles.pill,
    iconOnly && styles.iconOnly,
    loading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      // A loading button must not be clickable twice — this is what prevents
      // duplicate form submissions on a slow connection.
      disabled={disabled || loading}
      // Tells screen readers the control is mid-action rather than broken.
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      <span className={styles.label}>{children}</span>
    </button>
  );
};

export default Button;
