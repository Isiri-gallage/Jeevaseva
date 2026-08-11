import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart2, Droplets, FilePlus2, Heart, HeartHandshake, LayoutGrid,
  LogOut, Moon, Sun, User, Users, ClipboardList, Inbox,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import styles from './Sidebar.module.css';

/*
 * Navigation is data, not markup.
 *
 * Each role gets a list of groups; the component just renders whatever it is
 * handed. Adding a page later means adding one object here rather than editing
 * JSX in three places.
 *
 * `exact: true` marks routes that should only highlight on an precise match —
 * without it, /kidney would stay highlighted while you are on
 * /kidney/my-requests, which makes the sidebar look broken.
 */
const KIDNEY_GROUP = {
  label: 'Kidney',
  items: [
    { icon: <LayoutGrid size={17} />, label: 'Kidney board', path: '/kidney', exact: true },
    { icon: <FilePlus2 size={17} />, label: 'Post a request', path: '/kidney/post-request' },
    { icon: <ClipboardList size={17} />, label: 'My requests', path: '/kidney/my-requests' },
    { icon: <HeartHandshake size={17} />, label: 'Register as donor', path: '/kidney/register-donor' },
  ],
};

const ACCOUNT_GROUP = {
  label: 'Account',
  items: [{ icon: <User size={17} />, label: 'Profile', path: '/profile' }],
};

const NAV_BY_ROLE = {
  admin: [
    {
      label: 'Administration',
      items: [
        { icon: <BarChart2 size={17} />, label: 'Dashboard', path: '/admin', exact: true },
        { icon: <Users size={17} />, label: 'Manage users', path: '/admin/users' },
        { icon: <Inbox size={17} />, label: 'Manage requests', path: '/admin/requests' },
        { icon: <Droplets size={17} />, label: 'Blood requests', path: '/blood-requests' },
      ],
    },
    KIDNEY_GROUP,
    ACCOUNT_GROUP,
  ],

  donor: [
    KIDNEY_GROUP,
    {
      label: 'Blood',
      items: [
        { icon: <Droplets size={17} />, label: 'Donor dashboard', path: '/donor-dashboard' },
        { icon: <Heart size={17} />, label: 'Matching requests', path: '/matching-requests' },
        { icon: <ClipboardList size={17} />, label: 'My donations', path: '/my-donations' },
      ],
    },
    ACCOUNT_GROUP,
  ],

  patient: [
    KIDNEY_GROUP,
    {
      label: 'Blood',
      items: [
        { icon: <FilePlus2 size={17} />, label: 'Request blood', path: '/create-request' },
        { icon: <ClipboardList size={17} />, label: 'My blood requests', path: '/my-requests' },
      ],
    },
    ACCOUNT_GROUP,
  ],
};

const roleOf = (user) => {
  if (user?.is_admin) return 'admin';
  if (user?.is_donor) return 'donor';
  return 'patient';
};

const ROLE_LABEL = {
  admin: 'Administrator',
  donor: 'Living donor',
  patient: 'Patient',
};

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const role = roleOf(user);
  const groups = NAV_BY_ROLE[role];

  // Escape closes the drawer — expected behaviour for any overlay, and the
  // only way out for keyboard users if the backdrop is not reachable.
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const isActive = (item) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

  const go = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {open && (
        <button
          type="button"
          className={styles.backdrop}
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={[styles.sidebar, open && styles.open].filter(Boolean).join(' ')}
        aria-label="Main navigation"
      >
        <button className={styles.brand} onClick={() => go('/kidney')}>
          <span className={styles.brandMark}>
            <Heart size={17} fill="currentColor" />
          </span>
          <span>
            <span className={styles.brandName}>RaktaSeva</span>
            <span className={styles.brandTag}>Donor network</span>
          </span>
        </button>

        <nav className={styles.nav}>
          {groups.map((group) => (
            <div key={group.label} className={styles.group}>
              <div className={styles.groupLabel}>{group.label}</div>

              {group.items.map((item) => {
                const active = isActive(item);
                return (
                  <button
                    key={item.path}
                    className={[styles.item, active && styles.itemActive]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => go(item.path)}
                    // Tells assistive tech which item represents the current
                    // page — colour alone does not convey that.
                    aria-current={active ? 'page' : undefined}
                  >
                    <span className={styles.itemIcon}>{item.icon}</span>
                    <span className={styles.itemLabel}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className={styles.footer}>
          <button className={styles.user} onClick={() => go('/profile')}>
            <span
              className={[
                styles.avatar,
                styles[`avatar${role.charAt(0).toUpperCase()}${role.slice(1)}`],
              ].join(' ')}
            >
              {user?.full_name?.charAt(0).toUpperCase() || '?'}
            </span>
            <span className={styles.userMeta}>
              <span className={styles.userName}>{user?.full_name}</span>
              <span className={styles.userRole}>{ROLE_LABEL[role]}</span>
            </span>
          </button>

          <div className={styles.footerActions}>
            <button
              className={styles.footerButton}
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light appearance' : 'Switch to dark appearance'}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              {isDark ? 'Light' : 'Dark'}
            </button>

            <button
              className={`${styles.footerButton} ${styles.logout}`}
              onClick={logout}
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
