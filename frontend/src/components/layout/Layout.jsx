import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Heart, Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

/**
 * App shell: navigation rail plus the content column.
 *
 * On desktop the rail is always visible. Below 1024px it collapses into a
 * drawer opened from the top bar.
 */
const Layout = ({ children }) => {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  // Close the drawer whenever the route changes, otherwise tapping a link on
  // mobile navigates behind a drawer that stays open on top of the new page.
  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the drawer is open so the page behind it does not
  // scroll under the user's finger.
  useEffect(() => {
    if (!navOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [navOpen]);

  return (
    <>
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

      <div className={styles.shell}>
        <header className={styles.topbar}>
          <button
            className={styles.menuButton}
            onClick={() => setNavOpen(true)}
            aria-label="Open navigation"
            aria-expanded={navOpen}
          >
            <Menu size={20} />
          </button>

          <span className={styles.topbarBrand}>
            <span className={styles.topbarMark}>
              <Heart size={14} fill="currentColor" />
            </span>
            RaktaSeva
          </span>
        </header>

        <main className={styles.main}>{children}</main>
      </div>
    </>
  );
};

/**
 * PageHeader — the title block every page opens with.
 *
 * Exported from here so all pages get identical spacing and type treatment
 * instead of each one hand-rolling its own heading.
 */
export const PageHeader = ({ title, subtitle, actions }) => (
  <div className={styles.pageHeader}>
    <div className={styles.pageHeading}>
      <h1 className={styles.pageTitle}>{title}</h1>
      {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
    </div>
    {actions && <div className={styles.pageActions}>{actions}</div>}
  </div>
);

export default Layout;
