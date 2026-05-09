import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { donorsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Droplets, LogOut, Heart, List,
  CheckCircle, Clock, MapPin, Building2,
  ToggleLeft, ToggleRight, User
} from 'lucide-react';
import { URGENCY_COLORS, URGENCY_LABELS, getTimeAgo } from '../../utils/helpers';

const DonorDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [matchingRequests, setMatchingRequests] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  useEffect(() => {
    Promise.all([
      donorsAPI.getMatchingRequests(),
      donorsAPI.getMyDonations(),
    ]).then(([reqRes, donRes]) => {
      setMatchingRequests(reqRes.data);
      setDonations(donRes.data);
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleAvailability = async () => {
    setTogglingAvailability(true);
    try {
      await donorsAPI.updateAvailability(!user.is_available);
      updateUser({ ...user, is_available: !user.is_available });
      toast.success(
        user.is_available
          ? 'You are now unavailable for donations'
          : 'You are now available for donations!'
      );
    } catch {
      toast.error('Failed to update availability');
    } finally {
      setTogglingAvailability(false);
    }
  };

  const handleRespond = async (requestId) => {
    try {
      await donorsAPI.respond({ request_id: requestId, message: 'I am available to donate!' });
      toast.success('Response sent successfully!');
      navigate('/my-donations');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to respond');
    }
  };

  return (
    <div style={styles.container}>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <Droplets size={22} color="#E74C3C" />
          <span>RaktaSeva</span>
        </div>

        <nav style={styles.nav}>
          {[
            { icon: <Heart size={18} />, label: 'Donor Dashboard', path: '/donor-dashboard', active: true },
            { icon: <Droplets size={18} />, label: 'Matching Requests', path: '/matching-requests' },
            { icon: <List size={18} />, label: 'My Donations', path: '/my-donations' },
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
              <div style={styles.userBlood}>
                <Droplets size={12} color="#E74C3C" /> {user?.blood_type}
              </div>
            </div>
          </div>
          <div style={styles.logoutBtn} onClick={logout}>
            <LogOut size={16} />
            <span>Logout</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={styles.main}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>Donor Dashboard</h1>
            <p style={styles.headerSubtitle}>Welcome back, {user?.full_name}!</p>
          </div>

          {/* Availability Toggle */}
          <div style={{
            ...styles.availabilityCard,
            backgroundColor: user?.is_available ? '#EAFAF1' : '#FADBD8',
            borderColor: user?.is_available ? '#27AE60' : '#C0392B',
          }}>
            <div>
              <div style={{
                ...styles.availabilityStatus,
                color: user?.is_available ? '#27AE60' : '#C0392B'
              }}>
                {user?.is_available ? 'Available to Donate' : 'Unavailable'}
              </div>
              <div style={styles.availabilityHint}>Toggle your availability</div>
            </div>
            <button
              style={{
                ...styles.toggleBtn,
                backgroundColor: user?.is_available ? '#27AE60' : '#C0392B',
              }}
              onClick={handleToggleAvailability}
              disabled={togglingAvailability}
            >
              {user?.is_available
                ? <ToggleRight size={28} color="white" />
                : <ToggleLeft size={28} color="white" />
              }
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          {[
            {
              label: 'Matching Requests',
              value: matchingRequests.length,
              icon: <Droplets size={24} color="#C0392B" />,
              color: '#C0392B', bg: '#FADBD8',
            },
            {
              label: 'My Donations',
              value: donations.length,
              icon: <Heart size={24} color="#27AE60" />,
              color: '#27AE60', bg: '#EAFAF1',
            },
            {
              label: 'Completed',
              value: donations.filter(d => d.status === 'completed').length,
              icon: <CheckCircle size={24} color="#2980B9" />,
              color: '#2980B9', bg: '#EBF5FB',
            },
            {
              label: 'Pending',
              value: donations.filter(d => d.status === 'pending').length,
              icon: <Clock size={24} color="#F39C12" />,
              color: '#F39C12', bg: '#FEF9E7',
            },
          ].map((stat, i) => (
            <div key={i} style={{ ...styles.statCard, backgroundColor: stat.bg }}>
              <div style={styles.statIcon}>{stat.icon}</div>
              <div style={{ ...styles.statValue, color: stat.color }}>{stat.value}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Matching Requests */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Requests Matching Your Blood Type</h2>
            <button
              style={styles.viewAllBtn}
              onClick={() => navigate('/matching-requests')}
            >
              View All
            </button>
          </div>

          {loading ? (
            <div style={styles.loading}>Loading...</div>
          ) : matchingRequests.length === 0 ? (
            <div style={styles.empty}>
              <Droplets size={40} color="#E8E8E8" />
              <p>No matching requests at the moment</p>
            </div>
          ) : (
            <div style={styles.requestsGrid}>
              {matchingRequests.slice(0, 3).map(request => (
                <div key={request.id} style={styles.requestCard}>
                  <div style={styles.cardHeader}>
                    <div style={styles.bloodBadge}>{request.blood_type}</div>
                    <div style={{
                      ...styles.urgencyBadge,
                      backgroundColor: URGENCY_COLORS[request.urgency] + '20',
                      color: URGENCY_COLORS[request.urgency],
                    }}>
                      {URGENCY_LABELS[request.urgency]}
                    </div>
                  </div>

                  <h3 style={styles.patientName}>{request.patient_name}</h3>

                  <div style={styles.details}>
                    <div style={styles.detailRow}>
                      <Building2 size={14} color="#7F8C8D" />
                      <span>{request.hospital_name}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <MapPin size={14} color="#7F8C8D" />
                      <span>{request.city}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <Droplets size={14} color="#C0392B" />
                      <span style={{ color: '#C0392B', fontWeight: '500' }}>
                        {request.units_needed} unit(s) needed
                      </span>
                    </div>
                    <div style={styles.detailRow}>
                      <Clock size={14} color="#7F8C8D" />
                      <span>{getTimeAgo(request.created_at)}</span>
                    </div>
                  </div>

                  <button
                    style={styles.respondBtn}
                    onClick={() => handleRespond(request.id)}
                  >
                    <Heart size={16} />
                    I Can Donate
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#F2F3F4' },
  sidebar: {
    width: '260px', backgroundColor: '#2C3E50',
    display: 'flex', flexDirection: 'column',
    padding: '24px 0', position: 'fixed', height: '100vh',
  },
  sidebarLogo: {
    display: 'flex', alignItems: 'center', gap: '10px',
    color: 'white', fontFamily: 'Playfair Display, serif',
    fontSize: '20px', padding: '0 24px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
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
  userBlood: {
    display: 'flex', alignItems: 'center', gap: '4px',
    color: 'rgba(255,255,255,0.6)', fontSize: '13px',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px',
  },
  main: { marginLeft: '260px', flex: 1, padding: '32px' },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px',
  },
  headerTitle: { fontSize: '32px', fontFamily: 'Playfair Display, serif', color: '#2C3E50' },
  headerSubtitle: { color: '#7F8C8D', marginTop: '4px' },
  availabilityCard: {
    display: 'flex', alignItems: 'center', gap: '16px',
    padding: '16px 24px', borderRadius: '12px', border: '2px solid',
  },
  availabilityStatus: { fontSize: '15px', fontWeight: '600' },
  availabilityHint: { fontSize: '12px', color: '#7F8C8D', marginTop: '2px' },
  toggleBtn: {
    border: 'none', borderRadius: '8px', padding: '6px',
    cursor: 'pointer', display: 'flex', alignItems: 'center',
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px', marginBottom: '32px',
  },
  statCard: {
    borderRadius: '16px', padding: '24px',
    textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  statIcon: { display: 'flex', justifyContent: 'center', marginBottom: '12px' },
  statValue: { fontSize: '36px', fontFamily: 'Playfair Display, serif', fontWeight: '700' },
  statLabel: { fontSize: '13px', color: '#7F8C8D', marginTop: '4px' },
  section: { marginBottom: '32px' },
  sectionHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '16px',
  },
  sectionTitle: { fontSize: '22px', fontFamily: 'Playfair Display, serif', color: '#2C3E50' },
  viewAllBtn: {
    padding: '8px 16px', backgroundColor: '#FADBD8',
    color: '#C0392B', borderRadius: '8px', fontSize: '14px',
    fontWeight: '500', cursor: 'pointer', border: 'none',
    fontFamily: 'DM Sans, sans-serif',
  },
  loading: { textAlign: 'center', padding: '40px', color: '#7F8C8D' },
  empty: {
    textAlign: 'center', padding: '40px', color: '#7F8C8D',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
  },
  requestsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  requestCard: {
    backgroundColor: 'white', borderRadius: '16px',
    padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  cardHeader: {
    display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap',
  },
  bloodBadge: {
    backgroundColor: '#FADBD8', color: '#C0392B',
    padding: '4px 12px', borderRadius: '20px',
    fontSize: '14px', fontWeight: '700',
  },
  urgencyBadge: {
    padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500',
  },
  patientName: {
    fontSize: '18px', fontFamily: 'Playfair Display, serif',
    color: '#2C3E50', marginBottom: '12px',
  },
  details: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' },
  detailRow: {
    display: 'flex', alignItems: 'center', gap: '8px',
    color: '#7F8C8D', fontSize: '13px',
  },
  respondBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    width: '100%', padding: '12px', backgroundColor: '#C0392B',
    color: 'white', borderRadius: '10px', fontSize: '15px',
    fontWeight: '500', cursor: 'pointer', border: 'none',
    fontFamily: 'DM Sans, sans-serif',
  },
};

export default DonorDashboard;