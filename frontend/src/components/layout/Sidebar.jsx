import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Droplets, LogOut, Plus, List, User,
  Heart, BarChart2, Users, Shield,
  CheckCircle, Search
} from 'lucide-react';

// ─── Nav configs per role ──────────────────────────────────

const ADMIN_NAV = {
  blood: [
    { icon: <BarChart2 size={17} />, label: 'Dashboard', path: '/admin' },
    { icon: <Users size={17} />, label: 'Manage Users', path: '/admin/users' },
    { icon: <List size={17} />, label: 'Manage Requests', path: '/admin/requests' },
    { icon: <Droplets size={17} />, label: 'Blood Requests', path: '/blood-requests' },
  ],
  kidney: [
    { icon: <Heart size={17} />, label: 'Kidney Board', path: '/kidney' },
  ],
  account: [
    { icon: <User size={17} />, label: 'Profile', path: '/profile' },
  ],
};

const DONOR_NAV = {
  blood: [
    { icon: <Heart size={17} />, label: 'Donor Dashboard', path: '/donor-dashboard' },
    { icon: <Droplets size={17} />, label: 'Matching Requests', path: '/matching-requests' },
    { icon: <List size={17} />, label: 'My Donations', path: '/my-donations' },
  ],
  kidney: [
    { icon: <Heart size={17} />, label: 'Kidney Board', path: '/kidney' },
    { icon: <User size={17} />, label: 'Register as Donor', path: '/kidney/register-donor' },
  ],
  account: [
    { icon: <User size={17} />, label: 'Profile', path: '/profile' },
  ],
};

const PATIENT_NAV = {
  blood: [
    { icon: <Droplets size={17} />, label: 'All Requests', path: '/dashboard' },
    { icon: <Plus size={17} />, label: 'Create Request', path: '/create-request' },
    { icon: <List size={17} />, label: 'My Requests', path: '/my-requests' },
  ],
  kidney: [
    { icon: <Heart size={17} />, label: 'Kidney Board', path: '/kidney' },
    { icon: <Plus size={17} />, label: 'Post Request', path: '/kidney/post-request' },
    { icon: <List size={17} />, label: 'My Kidney Requests', path: '/kidney/my-requests' },
  ],
  account: [
    { icon: <User size={17} />, label: 'Profile', path: '/profile' },
  ],
};

// ─── Sidebar Component ─────────────────────────────────────

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const getNav = () => {
    if (user?.is_admin) return ADMIN_NAV;
    if (user?.is_donor) return DONOR_NAV;
    return PATIENT_NAV;
  };

  const nav = getNav();

  const NavItem = ({ item, kidney = false }) => (
    <div
      style={
        isActive(item.path)
          ? kidney
            ? styles.navItemKidneyActive
            : styles.navItemActive
          : styles.navItem
      }
      onClick={() => navigate(item.path)}
    >
      {item.icon}
      <span>{item.label}</span>
    </div>
  );

  return (
    <div style={styles.sidebar}>

      {/* Logo */}
      <div style={styles.logoSection}>
        <div style={styles.logo}>
          <Droplets size={24} color="#E74C3C" />
          <span style={styles.logoText}>RaktaSeva</span>
        </div>
        <div style={styles.tagline}>Serving Life 🩸🫀</div>
      </div>

      {/* User Card */}
      <div style={styles.userCard}>
        <div style={{
          ...styles.avatar,
          backgroundColor: user?.is_admin ? '#F39C12' : user?.is_donor ? '#C0392B' : '#2980B9'
        }}>
          {user?.full_name?.charAt(0).toUpperCase()}
        </div>
        <div style={styles.userDetails}>
          <div style={styles.userName}>{user?.full_name}</div>
          <div style={{
            ...styles.roleTag,
            backgroundColor: user?.is_admin ? 'rgba(243,156,18,0.2)' : user?.is_donor ? 'rgba(192,57,43,0.2)' : 'rgba(41,128,185,0.2)',
            color: user?.is_admin ? '#F39C12' : user?.is_donor ? '#E74C3C' : '#2980B9',
          }}>
            {user?.is_admin ? '👑 Administrator' : user?.is_donor ? '❤️ Blood Donor' : '🏥 Patient'}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={styles.navContainer}>

        {/* Blood Section */}
        <div style={styles.navGroup}>
          <div style={styles.groupLabel}>
            <div style={styles.groupLabelDot} />
            <span>BLOOD DONATION</span>
          </div>
          {nav.blood.map((item, i) => (
            <NavItem key={i} item={item} kidney={false} />
          ))}
        </div>

        {/* Kidney Section */}
        <div style={styles.navGroup}>
          <div style={{ ...styles.groupLabel, color: '#A569BD' }}>
            <div style={{ ...styles.groupLabelDot, backgroundColor: '#8E44AD' }} />
            <span>KIDNEY DONATION</span>
          </div>
          {nav.kidney.map((item, i) => (
            <NavItem key={i} item={item} kidney={true} />
          ))}
        </div>

        {/* Account Section */}
        <div style={styles.navGroup}>
          <div style={{ ...styles.groupLabel, color: '#7F8C8D' }}>
            <div style={{ ...styles.groupLabelDot, backgroundColor: '#7F8C8D' }} />
            <span>ACCOUNT</span>
          </div>
          {nav.account.map((item, i) => (
            <NavItem key={i} item={item} kidney={false} />
          ))}
        </div>

      </div>

      {/* Logout */}
      <div style={styles.logoutBtn} onClick={logout}>
        <LogOut size={16} />
        <span>Logout</span>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '245px',
    backgroundColor: '#1B2631',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    overflowY: 'auto',
  },
  logoSection: {
    padding: '24px 20px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px',
  },
  logoText: {
    color: 'white', fontFamily: 'Playfair Display, serif',
    fontSize: '20px', fontWeight: '700',
  },
  tagline: {
    color: 'rgba(255,255,255,0.3)', fontSize: '12px', paddingLeft: '34px',
  },
  userCard: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '14px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  avatar: {
    width: '36px', height: '36px', borderRadius: '8px',
    color: 'white', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '15px', fontWeight: '700', flexShrink: 0,
  },
  userDetails: { overflow: 'hidden', flex: 1 },
  userName: {
    color: 'white', fontSize: '13px', fontWeight: '600',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  roleTag: {
    display: 'inline-block', fontSize: '11px', fontWeight: '500',
    padding: '2px 8px', borderRadius: '20px', marginTop: '4px',
  },
  navContainer: {
    flex: 1, padding: '8px 10px',
    overflowY: 'auto',
  },
  navGroup: { marginBottom: '4px' },
  groupLabel: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '14px 10px 6px',
    color: '#E74C3C',
    fontSize: '10px', fontWeight: '700', letterSpacing: '1px',
  },
  groupLabelDot: {
    width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#E74C3C',
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '9px 12px', borderRadius: '8px',
    color: 'rgba(255,255,255,0.55)', cursor: 'pointer',
    fontSize: '13.5px', marginBottom: '1px',
  },
  navItemActive: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '9px 12px', borderRadius: '8px',
    backgroundColor: 'rgba(192,57,43,0.25)',
    borderLeft: '3px solid #E74C3C',
    color: '#E74C3C', cursor: 'pointer',
    fontSize: '13.5px', fontWeight: '600', marginBottom: '1px',
  },
  navItemKidneyActive: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '9px 12px', borderRadius: '8px',
    backgroundColor: 'rgba(142,68,173,0.25)',
    borderLeft: '3px solid #8E44AD',
    color: '#A569BD', cursor: 'pointer',
    fontSize: '13.5px', fontWeight: '600', marginBottom: '1px',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '16px 20px',
    borderTop: '1px solid rgba(255,255,255,0.07)',
    color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '13px',
  },
};

export default Sidebar;