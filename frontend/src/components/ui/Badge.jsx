import styles from './Badge.module.css';

/**
 * Badge — compact status label.
 *
 * @param {'neutral'|'accent'|'success'|'warning'|'danger'|'blood'} variant
 * @param {'md'|'lg'} size
 * @param {boolean} dot  Prefix with a status dot in the variant colour
 */
const Badge = ({
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  children,
  ...rest
}) => {
  const classes = [
    styles.badge,
    styles[variant],
    size === 'lg' && styles.lg,
    dot && styles.dot,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
};

export default Badge;
