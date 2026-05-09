import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Users, Droplets, List, LogOut, BarChart2,
  ShieldCheck, Heart, Bell, CheckCircle,
  ArrowRight, Building2, Shield, User
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then(res => setStats(res.data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={styles.container}>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarTop}>
          <div style={styles.sidebarLogo}>
            <Droplets size={22} color="#E74C3C" />
            <span>RaktaSeva</span>
          </div>
          <div style={styles.adminBadge}>
            <Shield size={14} />
            <span>Admin Panel</span>
          </div>
        </div>

        <nav style={styles.nav}>
          {[
            { icon: <BarChart2 size={18} />, label: 'Dashboard', path: '/admin', active: true },
            { icon: <Users size={18} />, label: 'Manage Users', path: '/admin/users' },
            { icon: <List size={18} />, label: 'Manage Requests', path: '/admin/requests' },
            { icon: <Droplets size={18} />, label: 'Blood Requests', path: '/dashboard' },
            { icon: <User size={18} />, label: 'Profile', path: '/profile' },
          ].map((item, i) => (
            <div
              key={i}
              style={item.active ? styles.navItemActive : styles.navItem}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div style={styles.sidebarBottom}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={styles.userName}>{user?.full_name}</div>
              <div style={styles.userRole}>Administrator</div>
            </div>
          </div>
          <div style={styles.logoutBtn} onClick={logout}>
            <LogOut size={16} />
            <span>Logout</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>Admin Dashboard</h1>
            <p style={styles.headerSubtitle}>
              Welcome back, {user?.full_name}! Here's what's happening on RaktaSeva.
            </p>
          </div>
          <div style={styles.headerBadge}>
            <ShieldCheck size={16} />
            <span>Admin Access</span>
          </div>
        </div>

        {loading ? (
          <div style={styles.loading}>Loading stats...</div>
        ) : (
          <>
            {/* Stats Cards */}
            <div style={styles.statsGrid}>
              {[
                {
                  label: 'Total Users',
                  value: stats?.total_users,
                  icon: <Users size={24} color="#2980B9" />,
                  color: '#2980B9',
                  bg: '#EBF5FB',
                },
                {
                  label: 'Total Donors',
                  value: stats?.total_donors,
                  icon: <Heart size={24} color="#C0392B" />,
                  color: '#C0392B',
                  bg: '#FADBD8',
                },
                {
                  label: 'Total Requests',
                  value: stats?.total_requests,
                  icon: <Droplets size={24} color="#8E44AD" />,
                  color: '#8E44AD',
                  bg: '#F5EEF8',
                },
                {
                  label: 'Open Requests',
                  value: stats?.open_requests,
                  icon: <Bell size={24} color="#27AE60" />,
                  color: '#27AE60',
                  bg: '#EAFAF1',
                },
                {
                  label: 'Total Donations',
                  value: stats?.total_donations,
                  icon: <CheckCircle size={24} color="#F39C12" />,
                  color: '#F39C12',
                  bg: '#FEF9E7',
                },
              ].map((stat, i) => (
                <div key={i} style={{ ...styles.statCard, backgroundColor: stat.bg }}>
                  <div style={styles.statIcon}>{stat.icon}</div>
                  <div style={{ ...styles.statValue, color: stat.color }}>
                    {stat.value}
                  </div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Quick Actions</h2>
              <div style={styles.actionsGrid}>
                {[
                  {
                    icon: <Users size={32} color="#2980B9" />,
                    title: 'Manage Users',
                    desc: 'View, verify, ban or promote users',
                    path: '/admin/users',
                    color: '#2980B9',
                    bg: '#EBF5FB',
                  },
                  {
                    icon: <Droplets size={32} color="#C0392B" />,
                    title: 'Manage Requests',
                    desc: 'View and delete blood requests',
                    path: '/admin/requests',
                    color: '#C0392B',
                    bg: '#FADBD8',
                  },
                  {
                    icon: <Building2 size={32} color="#27AE60" />,
                    title: 'View All Requests',
                    desc: 'See all open blood requests',
                    path: '/dashboard',
                    color: '#27AE60',
                    bg: '#EAFAF1',
                  },
                ].map((action, i) => (
                  <div
                    key={i}
                    style={styles.actionCard}
                    onClick={() => navigate(action.path)}
                  >
                    <div style={{ ...styles.actionIconBox, backgroundColor: action.bg }}>
                      {action.icon}
                    </div>
                    <h3 style={{ ...styles.actionTitle, color: action.color }}>
                      {action.title}
                    </h3>
                    <p style={styles.actionDesc}>{action.desc}</p>
                    <div style={{ ...styles.actionArrow, color: action.color }}>
                      <ArrowRight size={18} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Health */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Platform Health</h2>
              <div style={styles.healthCard}>
                {[
                  {
                    label: 'Donor Rate',
                    value: stats?.total_users > 0
                      ? Math.round((stats?.total_donors / stats?.total_users) * 100)
                      : 0,
                    suffix: '%',
                    color: '#C0392B',
                  },
                  {
                    label: 'Request Fulfillment',
                    value: stats?.total_requests > 0
                      ? Math.round(((stats?.total_requests - stats?.open_requests) / stats?.total_requests) * 100)
                      : 0,
                    suffix: '%',
                    color: '#27AE60',
                  },
                  {
                    label: 'Open Requests',
                    value: stats?.open_requests,
                    suffix: '',
                    color: '#E67E22',
                  },
                ].map((item, i) => (
                  <div key={i} style={styles.healthItem}>
                    <div style={styles.healthLabel}>{item.label}</div>
                    <div style={styles.healthBarContainer}>
                      <div style={{
                        ...styles.healthBar,
                        width: `${Math.min(item.value, 100)}%`,
                        backgroundColor: item.color,
                      }} />
                    </div>
                    <div style={{ ...styles.healthValue, color: item.color }}>
                      {item.value}{item.suffix}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#F2F3F4' },
  sidebar: {
    width: '260px', backgroundColor: '#2C3E50',
    display: 'flex', flexDirection: 'column',
    position: 'fixed', height: '100vh',
  },
  sidebarTop: {
    padding: '24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  sidebarLogo: {
    display: 'flex', alignItems: 'center', gap: '10px',
    color: 'white', fontFamily: 'Playfair Display, serif',
    fontSize: '20px', marginBottom: '12px',
  },
  adminBadge: {
    display: 'flex', alignItems: 'center', gap: '6px',
    backgroundColor: 'rgba(192,57,43,0.3)',
    color: '#E74C3C', padding: '6px 12px',
    borderRadius: '8px', fontSize: '13px', fontWeight: '500',
    width: 'fit-content',
  },
  nav: {
    padding: '24px 12px', flex: 1,
    display: 'flex', flexDirection: 'column', gap: '4px',
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 16px', borderRadius: '10px',
    color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '15px',
  },
  navItemActive: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 16px', borderRadius: '10px',
    backgroundColor: '#C0392B', color: 'white',
    cursor: 'pointer', fontSize: '15px', fontWeight: '500',
  },
  sidebarBottom: { padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  avatar: {
    width: '40px', height: '40px', borderRadius: '50%',
    backgroundColor: '#C0392B', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', fontWeight: '600',
  },
  userName: { color: 'white', fontSize: '14px', fontWeight: '500' },
  userRole: { color: '#F39C12', fontSize: '12px' },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px',
  },
  main: { marginLeft: '260px', flex: 1, padding: '32px' },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '32px',
  },
  headerTitle: {
    fontSize: '32px', fontFamily: 'Playfair Display, serif', color: '#2C3E50',
  },
  headerSubtitle: { color: '#7F8C8D', marginTop: '4px' },
  headerBadge: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: '#FADBD8', color: '#C0392B',
    padding: '8px 16px', borderRadius: '8px',
    fontSize: '14px', fontWeight: '500',
  },
  loading: { textAlign: 'center', padding: '60px', color: '#7F8C8D' },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '16px', marginBottom: '32px',
  },
  statCard: {
    borderRadius: '16px', padding: '24px',
    textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  statIcon: { display: 'flex', justifyContent: 'center', marginBottom: '12px' },
  statValue: {
    fontSize: '36px', fontFamily: 'Playfair Display, serif', fontWeight: '700',
  },
  statLabel: { fontSize: '13px', color: '#7F8C8D', marginTop: '4px' },
  section: { marginBottom: '32px' },
  sectionTitle: {
    fontSize: '22px', fontFamily: 'Playfair Display, serif',
    color: '#2C3E50', marginBottom: '16px',
  },
  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  actionCard: {
    backgroundColor: 'white', borderRadius: '16px',
    padding: '24px', cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  actionIconBox: {
    width: '60px', height: '60px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '16px',
  },
  actionTitle: {
    fontSize: '18px', fontFamily: 'Playfair Display, serif', marginBottom: '8px',
  },
  actionDesc: { color: '#7F8C8D', fontSize: '14px', lineHeight: '1.5' },
  actionArrow: { marginTop: '16px' },
  healthCard: {
    backgroundColor: 'white', borderRadius: '16px',
    padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column', gap: '24px',
  },
  healthItem: { display: 'flex', alignItems: 'center', gap: '16px' },
  healthLabel: { width: '160px', fontSize: '14px', color: '#2C3E50', fontWeight: '500' },
  healthBarContainer: {
    flex: 1, height: '10px', backgroundColor: '#F2F3F4',
    borderRadius: '5px', overflow: 'hidden',
  },
  healthBar: { height: '100%', borderRadius: '5px' },
  healthValue: { width: '50px', fontSize: '14px', fontWeight: '600', textAlign: 'right' },
};

export default AdminDashboard;