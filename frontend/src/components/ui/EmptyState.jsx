import styles from './EmptyState.module.css';

/**
 * EmptyState — shown when a list has nothing in it.
 *
 * An empty region with no explanation reads as a broken page. This always says
 * what is missing and, where possible, offers the action that would fill it.
 */
const EmptyState = ({ icon, title, description, action }) => (
  <div className={styles.empty}>
    {icon && <div className={styles.icon} aria-hidden="true">{icon}</div>}
    <h3 className={styles.title}>{title}</h3>
    {description && <p className={styles.text}>{description}</p>}
    {action && <div className={styles.action}>{action}</div>}
  </div>
);

export default EmptyState;
