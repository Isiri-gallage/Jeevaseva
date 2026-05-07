import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { requestsAPI } from '../../services/api';
import { URGENCY_COLORS, URGENCY_LABELS, getTimeAgo } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Plus, LogOut, User, Droplets, Bell, List } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestsAPI.getAll()
      .then(res => setRequests(res.data))
      .catch(() => toast.error('Failed to load requests'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={styles.container}>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>🩸 RaktaSeva</div>

        <nav style={styles.nav}>
          {[
            { icon: <Droplets size={18} />, label: 'All Requests', path: '/dashboard', active: true },
            { icon: <List size={18} />, label: 'My Requests', path: '/my-requests' },
            { icon: <Plus size={18} />, label: 'Create Request', path: '/create-request' },
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
              <div style={styles.userBlood}>🩸 {user?.blood_type}</div>
            </div>
          </div>
          <div style={styles.logoutBtn} onClick={logout}>
            <LogOut size={18} />
            <span>Logout</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>Blood Requests</h1>
            <p style={styles.headerSubtitle}>
              All open blood requests in Sri Lanka
            </p>
          </div>
          <button
            style={styles.createBtn}
            onClick={() => navigate('/create-request')}
          >
            <Plus size={18} /> New Request
          </button>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          {[
            { label: 'Open Requests', value: requests.length, color: '#C0392B' },
            { label: 'Critical', value: requests.filter(r => r.urgency === 'critical').length, color: '#E74C3C' },
            { label: 'High Priority', value: requests.filter(r => r.urgency === 'high').length, color: '#E67E22' },
            { label: 'Your Blood Type', value: user?.blood_type, color: '#27AE60' },
          ].map((stat, i) => (
            <div key={i} style={styles.statCard}>
              <div style={{ ...styles.statValue, color: stat.color }}>{stat.value}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Requests List */}
        {loading ? (
          <div style={styles.loading}>Loading requests...</div>
        ) : requests.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>🩸</div>
            <h3>No open requests</h3>
            <p>Be the first to post a blood request</p>
          </div>
        ) : (
          <div style={styles.requestsGrid}>
            {requests.map(request => (
              <div key={request.id} style={styles.requestCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.bloodTypeBadge}>
                    {request.blood_type}
                  </div>
                  <div style={{
                    ...styles.urgencyBadge,
                    backgroundColor: URGENCY_COLORS[request.urgency] + '20',
                    color: URGENCY_COLORS[request.urgency]
                  }}>
                    {URGENCY_LABELS[request.urgency]}
                  </div>
                </div>

                <h3 style={styles.patientName}>{request.patient_name}</h3>
                <p style={styles.hospital}>🏥 {request.hospital_name}</p>
                <p style={styles.city}>📍 {request.city}</p>
                <p style={styles.units}>🩸 {request.units_needed} unit(s) needed</p>

                {request.notes && (
                  <p style={styles.notes}>"{request.notes}"</p>
                )}

                <div style={styles.cardFooter}>
                  <span style={styles.timeAgo}>
                    {getTimeAgo(request.created_at)}
                  </span>
                  <a href={`tel:${request.contact_number}`} style={styles.callBtn}>
                    📞 Call
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#F2F3F4' },
  sidebar: {
    width: '260px',
    backgroundColor: '#2C3E50',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 0',
    position: 'fixed',
    height: '100vh',
  },
  sidebarLogo: {
    color: 'white',
    fontFamily: 'Playfair Display, serif',
    fontSize: '20px',
    padding: '0 24px 32px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  nav: { padding: '24px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 16px', borderRadius: '10px',
    color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '15px',
    transition: 'all 0.2s',
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
  userBlood: { color: 'rgba(255,255,255,0.6)', fontSize: '13px' },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px',
    padding: '8px 0',
  },
  main: { marginLeft: '260px', flex: 1, padding: '32px' },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '32px',
  },
  headerTitle: { fontSize: '32px', fontFamily: 'Playfair Display, serif', color: '#2C3E50' },
  headerSubtitle: { color: '#7F8C8D', marginTop: '4px' },
  createBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '12px 24px', backgroundColor: '#C0392B',
    color: 'white', borderRadius: '10px', fontSize: '15px',
    fontWeight: '500', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
  },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' },
  statCard: {
    backgroundColor: 'white', borderRadius: '12px',
    padding: '20px', textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  statValue: { fontSize: '32px', fontFamily: 'Playfair Display, serif', fontWeight: '700' },
  statLabel: { fontSize: '13px', color: '#7F8C8D', marginTop: '4px' },
  loading: { textAlign: 'center', padding: '60px', color: '#7F8C8D', fontSize: '18px' },
  empty: { textAlign: 'center', padding: '60px', color: '#7F8C8D' },
  emptyIcon: { fontSize: '60px', marginBottom: '16px' },
  requestsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  requestCard: {
    backgroundColor: 'white', borderRadius: '16px',
    padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  bloodTypeBadge: {
    backgroundColor: '#FADBD8', color: '#C0392B',
    padding: '6px 14px', borderRadius: '20px',
    fontSize: '16px', fontWeight: '700',
  },
  urgencyBadge: {
    padding: '6px 12px', borderRadius: '20px',
    fontSize: '13px', fontWeight: '500',
  },
  patientName: { fontSize: '18px', fontFamily: 'Playfair Display, serif', color: '#2C3E50', marginBottom: '8px' },
  hospital: { color: '#7F8C8D', fontSize: '14px', marginBottom: '4px' },
  city: { color: '#7F8C8D', fontSize: '14px', marginBottom: '4px' },
  units: { color: '#C0392B', fontSize: '14px', fontWeight: '500', marginBottom: '8px' },
  notes: { color: '#7F8C8D', fontSize: '13px', fontStyle: 'italic', marginBottom: '8px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F2F3F4' },
  timeAgo: { color: '#95A5A6', fontSize: '13px' },
  callBtn: {
    backgroundColor: '#FADBD8', color: '#C0392B',
    padding: '8px 16px', borderRadius: '8px',
    fontSize: '13px', fontWeight: '500', textDecoration: 'none',
  },
};

export default Dashboard;