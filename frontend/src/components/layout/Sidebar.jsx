import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Droplets, LogOut, User, Heart, BarChart2, Users
} from 'lucide-react';

// ─── Simple Linear Nav configs per role ─────────────────────

const ADMIN_NAV = [
  { icon: <BarChart2 size={17} />, label: 'Admin Stats', path: '/admin' },
  { icon: <Users size={17} />, label: 'Manage Users', path: '/admin/users' },
  { icon: <Heart size={17} fill="#8E44AD" color="#8E44AD" />, label: 'Kidney Match Hub', path: '/kidney', kidney: true },
  { icon: <Droplets size={17} />, label: 'Emergency Blood Requests', path: '/blood-requests' },
  { icon: <User size={17} />, label: 'My Profile', path: '/profile' },
];

const DONOR_NAV = [
  { icon: <Heart size={17} fill="#8E44AD" color="#8E44AD" />, label: 'Kidney Connection Hub', path: '/kidney', kidney: true },
  { icon: <Droplets size={17} />, label: 'Emergency Blood Board', path: '/donor-dashboard' },
  { icon: <User size={17} />, label: 'My Profile', path: '/profile' },
];

const PATIENT_NAV = [
  { icon: <Heart size={17} fill="#8E44AD" color="#8E44AD" />, label: 'Kidney Connection Hub', path: '/kidney', kidney: true },
  { icon: <Droplets size={17} />, label: 'Emergency Blood Board', path: '/dashboard' },
  { icon: <User size={17} />, label: 'My Profile', path: '/profile' },
];

// ─── Sidebar Component ─────────────────────────────────────

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const getNavItems = () => {
    if (user?.is_admin) return ADMIN_NAV;
    if (user?.is_donor) return DONOR_NAV;
    return PATIENT_NAV;
  };

  const navItems = getNavItems();

  return (
    <div style={styles.sidebar}>

      {/* Premium Logo */}
      <div style={styles.logoSection}>
        <div style={styles.logo} onClick={() => navigate('/')}>
          <span style={styles.logoEmoji}>🫀</span>
          <span style={styles.logoText}>RaktaSeva</span>
        </div>
        <div style={styles.tagline}>Sri Lankan Transplant Hub</div>
      </div>

      {/* Simplified User Account Card */}
      <div style={styles.userCard}>
        <div style={{
          ...styles.avatar,
          backgroundColor: user?.is_admin ? '#F39C12' : user?.is_donor ? '#8E44AD' : '#2980B9'
        }}>
          {user?.full_name?.charAt(0).toUpperCase()}
        </div>
        <div style={styles.userDetails}>
          <div style={styles.userName}>{user?.full_name}</div>
          <div style={{
            ...styles.roleTag,
            backgroundColor: user?.is_admin 
              ? 'rgba(243,156,18,0.15)' 
              : user?.is_donor 
                ? 'rgba(142,68,173,0.15)' 
                : 'rgba(41,128,185,0.15)',
            color: user?.is_admin ? '#F39C12' : user?.is_donor ? '#A569BD' : '#3498DB',
          }}>
            {user?.is_admin ? '👑 Administrator' : user?.is_donor ? '❤️ Altruistic Donor' : '🏥 Kidney Patient'}
          </div>
        </div>
      </div>

      {/* Unified Simplified Navigation */}
      <div style={styles.navContainer}>
        <div style={styles.menuLabel}>Main Navigation</div>
        {navItems.map((item, i) => {
          const active = isActive(item.path);
          return (
            <div
              key={i}
              style={active ? styles.navItemActive : styles.navItem}
              onClick={() => navigate(item.path)}
            >
              <div style={{ color: active ? '#8E44AD' : 'rgba(255,255,255,0.45)' }}>
                {item.icon}
              </div>
              <span style={{ fontWeight: active ? '700' : '500' }}>{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* Logout */}
      <div style={styles.logoutBtn} onClick={logout}>
        <LogOut size={16} />
        <span>Logout Account</span>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '245px',
    backgroundColor: '#111827', // Clean premium Slate Dark
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    overflowY: 'auto',
    borderRight: '1px solid rgba(255,255,255,0.05)',
  },
  logoSection: {
    padding: '24px 20px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', cursor: 'pointer'
  },
  logoEmoji: { fontSize: '20px' },
  logoText: {
    color: 'white', fontFamily: 'Playfair Display, serif',
    fontSize: '20px', fontWeight: '700',
  },
  tagline: {
    color: '#8E44AD', fontSize: '11px', fontWeight: '600', paddingLeft: '28px', textTransform: 'uppercase', letterSpacing: '0.5px'
  },
  userCard: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  avatar: {
    width: '36px', height: '36px', borderRadius: '10px',
    color: 'white', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '16px', fontWeight: '700', flexShrink: 0,
  },
  userDetails: { overflow: 'hidden', flex: 1 },
  userName: {
    color: 'white', fontSize: '13px', fontWeight: '600',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  roleTag: {
    display: 'inline-block', fontSize: '10.5px', fontWeight: '600',
    padding: '2px 8px', borderRadius: '20px', marginTop: '4px',
  },
  navContainer: {
    flex: 1, padding: '16px 12px',
    display: 'flex', flexDirection: 'column', gap: '4px'
  },
  menuLabel: {
    fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '12px'
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '11px 12px', borderRadius: '10px',
    color: 'rgba(255,255,255,0.65)', cursor: 'pointer',
    fontSize: '13.5px', transition: 'all 0.15s ease',
  },
  navItemActive: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '11px 12px', borderRadius: '10px',
    backgroundColor: 'rgba(142,68,173,0.12)',
    color: '#A569BD', cursor: 'pointer',
    fontSize: '13.5px', transition: 'all 0.15s ease',
    borderLeft: '4px solid #8E44AD'
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '18px 24px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '13px',
    transition: 'color 0.2s',
  },
};

export default Sidebar;