import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { requestsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Droplets, LogOut, Plus, List,
  User, Bell, MapPin, Building2,
  Phone, Clock, Search
} from 'lucide-react';
import { URGENCY_COLORS, URGENCY_LABELS, getTimeAgo } from '../../utils/helpers';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('all');

  useEffect(() => {
    requestsAPI.getAll()
      .then(res => {
        setRequests(res.data);
        setFiltered(res.data);
      })
      .catch(() => toast.error('Failed to load requests'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = requests;
    if (filterUrgency !== 'all') {
      result = result.filter(r => r.urgency === filterUrgency);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.patient_name.toLowerCase().includes(q) ||
        r.hospital_name.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.blood_type.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, filterUrgency, requests]);

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
            <h1 style={styles.headerTitle}>Blood Requests</h1>
            <p style={styles.headerSubtitle}>All open blood requests in Sri Lanka</p>
          </div>
          <button style={styles.createBtn} onClick={() => navigate('/create-request')}>
            <Plus size={18} /> New Request
          </button>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          {[
            { label: 'Open Requests', value: requests.length, color: '#C0392B', bg: '#FADBD8', icon: <Droplets size={20} color="#C0392B" /> },
            { label: 'Critical', value: requests.filter(r => r.urgency === 'critical').length, color: '#E74C3C', bg: '#FADBD8', icon: <Bell size={20} color="#E74C3C" /> },
            { label: 'High Priority', value: requests.filter(r => r.urgency === 'high').length, color: '#E67E22', bg: '#FEF9E7', icon: <Bell size={20} color="#E67E22" /> },
            { label: 'Your Blood Type', value: user?.blood_type, color: '#27AE60', bg: '#EAFAF1', icon: <Droplets size={20} color="#27AE60" /> },
          ].map((stat, i) => (
            <div key={i} style={{ ...styles.statCard, backgroundColor: stat.bg }}>
              <div style={styles.statIcon}>{stat.icon}</div>
              <div style={{ ...styles.statValue, color: stat.color }}>{stat.value}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <div style={styles.searchBox}>
            <Search size={16} color="#7F8C8D" />
            <input
              type="text"
              placeholder="Search by name, hospital, city or blood type..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.filterTabs}>
            {['all', 'critical', 'high', 'medium', 'low'].map(tab => (
              <button
                key={tab}
                style={filterUrgency === tab ? styles.filterTabActive : styles.filterTab}
                onClick={() => setFilterUrgency(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Requests */}
        {loading ? (
          <div style={styles.loading}>Loading requests...</div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
            <Droplets size={48} color="#E8E8E8" />
            <h3 style={styles.emptyTitle}>No requests found</h3>
            <p style={styles.emptyText}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map(request => (
              <div key={request.id} style={styles.card}>
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
                <p style={styles.units}>
                  <Droplets size={14} color="#C0392B" />
                  {request.units_needed} unit(s) needed
                </p>

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
                    <Phone size={14} color="#7F8C8D" />
                    <span>{request.contact_number}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <Clock size={14} color="#7F8C8D" />
                    <span>{getTimeAgo(request.created_at)}</span>
                  </div>
                </div>

                {request.notes && (
                  <p style={styles.notes}>"{request.notes}"</p>
                )}

                <div style={styles.cardFooter}>
                  <span style={styles.requestId}>#{request.id}</span>
                  <a href={`tel:${request.contact_number}`} style={styles.callBtn}>
                    <Phone size={14} /> Call Now
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
    width: '260px', backgroundColor: '#2C3E50', display: 'flex',
    flexDirection: 'column', padding: '24px 0', position: 'fixed', height: '100vh',
  },
  sidebarLogo: {
    display: 'flex', alignItems: 'center', gap: '10px', color: 'white',
    fontFamily: 'Playfair Display, serif', fontSize: '20px',
    padding: '0 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  nav: { padding: '24px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
    borderRadius: '10px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '15px',
  },
  navItemActive: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
    borderRadius: '10px', backgroundColor: '#C0392B', color: 'white',
    cursor: 'pointer', fontSize: '15px', fontWeight: '500',
  },
  sidebarBottom: { padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  avatar: {
    width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#C0392B',
    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', fontWeight: '600',
  },
  userName: { color: 'white', fontSize: '14px', fontWeight: '500' },
  userBlood: { display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.6)', fontSize: '13px' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px' },
  main: { marginLeft: '260px', flex: 1, padding: '32px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  headerTitle: { fontSize: '32px', fontFamily: 'Playfair Display, serif', color: '#2C3E50' },
  headerSubtitle: { color: '#7F8C8D', marginTop: '4px' },
  createBtn: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
    backgroundColor: '#C0392B', color: 'white', borderRadius: '10px',
    fontSize: '15px', fontWeight: '500', cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif', border: 'none',
  },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: {
    borderRadius: '16px', padding: '20px', textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  statIcon: { display: 'flex', justifyContent: 'center', marginBottom: '8px' },
  statValue: { fontSize: '28px', fontFamily: 'Playfair Display, serif', fontWeight: '700' },
  statLabel: { fontSize: '13px', color: '#7F8C8D', marginTop: '4px' },
  filters: { display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'white',
    borderRadius: '10px', padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', flex: 1,
  },
  searchInput: { border: 'none', outline: 'none', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', width: '100%', color: '#2C3E50' },
  filterTabs: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  filterTab: {
    padding: '8px 16px', borderRadius: '8px', border: 'none',
    backgroundColor: 'white', color: '#7F8C8D', fontSize: '14px',
    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
  },
  filterTabActive: {
    padding: '8px 16px', borderRadius: '8px', border: 'none',
    backgroundColor: '#C0392B', color: 'white', fontSize: '14px',
    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: '500',
  },
  loading: { textAlign: 'center', padding: '60px', color: '#7F8C8D' },
  empty: { textAlign: 'center', padding: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  emptyTitle: { fontSize: '20px', fontFamily: 'Playfair Display, serif', color: '#2C3E50' },
  emptyText: { color: '#7F8C8D', fontSize: '14px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardHeader: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
  bloodBadge: { backgroundColor: '#FADBD8', color: '#C0392B', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: '700' },
  urgencyBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' },
  patientName: { fontSize: '18px', fontFamily: 'Playfair Display, serif', color: '#2C3E50', marginBottom: '6px' },
  units: { display: 'flex', alignItems: 'center', gap: '6px', color: '#C0392B', fontSize: '14px', fontWeight: '500', marginBottom: '12px' },
  details: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' },
  detailRow: { display: 'flex', alignItems: 'center', gap: '8px', color: '#7F8C8D', fontSize: '13px' },
  notes: { color: '#7F8C8D', fontSize: '13px', fontStyle: 'italic', marginBottom: '12px', padding: '10px', backgroundColor: '#F2F3F4', borderRadius: '8px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F2F3F4' },
  requestId: { color: '#95A5A6', fontSize: '13px' },
  callBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    backgroundColor: '#FADBD8', color: '#C0392B', padding: '8px 14px',
    borderRadius: '8px', fontSize: '13px', fontWeight: '500', textDecoration: 'none',
  },
};

export default Dashboard;