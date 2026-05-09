import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { requestsAPI, donorsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Droplets, LogOut, Plus, List,
  User, Clock, MapPin, Building2,
  CheckCircle, Trash2, MessageCircle
} from 'lucide-react';
import { URGENCY_COLORS, URGENCY_LABELS, getTimeAgo } from '../../utils/helpers';

const STATUS_CONFIG = {
  open: { color: '#27AE60', bg: '#EAFAF1', label: 'Open' },
  fulfilled: { color: '#2980B9', bg: '#EBF5FB', label: 'Fulfilled' },
  expired: { color: '#95A5A6', bg: '#F2F3F4', label: 'Expired' },
  cancelled: { color: '#C0392B', bg: '#FADBD8', label: 'Cancelled' },
};

const MyRequests = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    requestsAPI.getMyRequests()
      .then(res => setRequests(res.data))
      .catch(() => toast.error('Failed to load requests'))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkFulfilled = async (id) => {
    try {
      await requestsAPI.update(id, { status: 'fulfilled' });
      toast.success('Request marked as fulfilled!');
      setRequests(requests.map(r => r.id === id ? { ...r, status: 'fulfilled' } : r));
    } catch {
      toast.error('Failed to update request');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    try {
      await requestsAPI.delete(id);
      toast.success('Request deleted!');
      setRequests(requests.filter(r => r.id !== id));
    } catch {
      toast.error('Failed to delete request');
    }
  };

  const handleChat = async (requestId) => {
    try {
      const res = await donorsAPI.getDonationByRequest(requestId);
      navigate(`/chat/${res.data.id}`);
    } catch {
      toast.error('No donor has responded to this request yet!');
    }
  };

  const filtered = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter);

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
            { icon: <Droplets size={18} />, label: 'All Requests', path: '/dashboard' },
            { icon: <List size={18} />, label: 'My Requests', path: '/my-requests', active: true },
            { icon: <Plus size={18} />, label: 'Create Request', path: '/create-request' },
            { icon: <User size={18} />, label: 'Profile', path: '/profile' },
          ].map((item, i) => (
            <div key={i}
              style={item.active ? styles.navItemActive : styles.navItem}
              onClick={() => navigate(item.path)}
            >
              {item.icon}<span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div style={styles.sidebarBottom}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>{user?.full_name?.charAt(0).toUpperCase()}</div>
            <div>
              <div style={styles.userName}>{user?.full_name}</div>
              <div style={styles.userBlood}>
                <Droplets size={12} color="#E74C3C" /> {user?.blood_type}
              </div>
            </div>
          </div>
          <div style={styles.logoutBtn} onClick={logout}>
            <LogOut size={16} /><span>Logout</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>My Requests</h1>
            <p style={styles.headerSubtitle}>{requests.length} total requests</p>
          </div>
          <button style={styles.createBtn} onClick={() => navigate('/create-request')}>
            <Plus size={18} /> New Request
          </button>
        </div>

        {/* Filter Tabs */}
        <div style={styles.filterTabs}>
          {['all', 'open', 'fulfilled', 'expired', 'cancelled'].map(tab => (
            <button
              key={tab}
              style={filter === tab ? styles.filterTabActive : styles.filterTab}
              onClick={() => setFilter(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={styles.loading}>Loading requests...</div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
            <Droplets size={48} color="#E8E8E8" />
            <h3 style={styles.emptyTitle}>No requests found</h3>
            <p style={styles.emptyText}>
              {filter === 'all'
                ? "You haven't created any requests yet"
                : `No ${filter} requests`}
            </p>
            <button
              style={styles.createEmptyBtn}
              onClick={() => navigate('/create-request')}
            >
              <Plus size={16} /> Create Request
            </button>
          </div>
        ) : (
          <div style={styles.list}>
            {filtered.map(request => {
              const statusConfig = STATUS_CONFIG[request.status];
              return (
                <div key={request.id} style={styles.card}>
                  <div style={styles.cardLeft}>
                    <div style={styles.bloodBadge}>{request.blood_type}</div>
                    <div style={styles.cardInfo}>
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
                            {request.units_needed} unit(s)
                          </span>
                        </div>
                        <div style={styles.detailRow}>
                          <Clock size={14} color="#7F8C8D" />
                          <span>{getTimeAgo(request.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={styles.cardRight}>
                    <div style={{
                      ...styles.urgencyBadge,
                      backgroundColor: URGENCY_COLORS[request.urgency] + '20',
                      color: URGENCY_COLORS[request.urgency],
                    }}>
                      {URGENCY_LABELS[request.urgency]}
                    </div>
                    <div style={{
                      ...styles.statusBadge,
                      backgroundColor: statusConfig.bg,
                      color: statusConfig.color,
                    }}>
                      {statusConfig.label}
                    </div>

                    <div style={styles.actions}>
                      {request.status === 'open' && (
                        <>
                          <button
                            style={styles.fulfillBtn}
                            onClick={() => handleMarkFulfilled(request.id)}
                          >
                            <CheckCircle size={14} /> Fulfilled
                          </button>
                          <button
                            style={styles.chatBtn}
                            onClick={() => handleChat(request.id)}
                          >
                            <MessageCircle size={14} /> Chat
                          </button>
                        </>
                      )}
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDelete(request.id)}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '24px',
  },
  headerTitle: { fontSize: '32px', fontFamily: 'Playfair Display, serif', color: '#2C3E50' },
  headerSubtitle: { color: '#7F8C8D', marginTop: '4px' },
  createBtn: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
    backgroundColor: '#C0392B', color: 'white', borderRadius: '10px',
    fontSize: '15px', fontWeight: '500', cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif', border: 'none',
  },
  filterTabs: { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' },
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
  empty: {
    textAlign: 'center', padding: '80px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
  },
  emptyTitle: { fontSize: '20px', fontFamily: 'Playfair Display, serif', color: '#2C3E50' },
  emptyText: { color: '#7F8C8D', fontSize: '14px' },
  createEmptyBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '12px 24px', backgroundColor: '#C0392B', color: 'white',
    borderRadius: '10px', fontSize: '15px', fontWeight: '500',
    cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif', marginTop: '8px',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: {
    backgroundColor: 'white', borderRadius: '16px', padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px',
  },
  cardLeft: { display: 'flex', alignItems: 'flex-start', gap: '16px' },
  bloodBadge: {
    backgroundColor: '#FADBD8', color: '#C0392B', padding: '8px 14px',
    borderRadius: '12px', fontSize: '18px', fontWeight: '700', flexShrink: 0,
  },
  cardInfo: { display: 'flex', flexDirection: 'column', gap: '8px' },
  patientName: { fontSize: '18px', fontFamily: 'Playfair Display, serif', color: '#2C3E50' },
  details: { display: 'flex', flexWrap: 'wrap', gap: '12px' },
  detailRow: { display: 'flex', alignItems: 'center', gap: '6px', color: '#7F8C8D', fontSize: '13px' },
  cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' },
  urgencyBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' },
  statusBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' },
  actions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  fulfillBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 14px', backgroundColor: '#EAFAF1', color: '#27AE60',
    borderRadius: '8px', fontSize: '13px', fontWeight: '500',
    cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif',
  },
  chatBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 14px', backgroundColor: '#EBF5FB', color: '#2980B9',
    borderRadius: '8px', fontSize: '13px', fontWeight: '500',
    cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif',
  },
  deleteBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 14px', backgroundColor: '#FADBD8', color: '#C0392B',
    borderRadius: '8px', fontSize: '13px', fontWeight: '500',
    cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif',
  },
};

export default MyRequests;