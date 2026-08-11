import styles from './Card.module.css';

/**
 * Card — an elevated content surface.
 *
 * @param {'none'|'sm'|'md'|'lg'} padding
 * @param {'default'|'flat'|'accent'} variant
 * @param {boolean} interactive  Adds hover lift. Only set this when the card is
 *                               genuinely clickable.
 * @param {string} as            Element to render ('div', 'article', 'button'...)
 */
const Card = ({
  padding = 'md',
  variant = 'default',
  interactive = false,
  as: Tag = 'div',
  className = '',
  children,
  ...rest
}) => {
  const padKey = `pad${padding.charAt(0).toUpperCase()}${padding.slice(1)}`;

  const classes = [
    styles.card,
    styles[padKey],
    variant !== 'default' && styles[variant],
    interactive && styles.interactive,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
};

const CardHeader = ({ className = '', children, ...rest }) => (
  <div className={[styles.header, className].filter(Boolean).join(' ')} {...rest}>
    {children}
  </div>
);

const CardTitle = ({ className = '', children, ...rest }) => (
  <h3 className={[styles.title, className].filter(Boolean).join(' ')} {...rest}>
    {children}
  </h3>
);

const CardSubtitle = ({ className = '', children, ...rest }) => (
  <p className={[styles.subtitle, className].filter(Boolean).join(' ')} {...rest}>
    {children}
  </p>
);

const CardFooter = ({ className = '', children, ...rest }) => (
  <div className={[styles.footer, className].filter(Boolean).join(' ')} {...rest}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Subtitle = CardSubtitle;
Card.Footer = CardFooter;

export default Card;
