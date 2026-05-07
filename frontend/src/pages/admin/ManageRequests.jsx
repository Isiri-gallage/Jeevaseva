import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Users, Droplets, List, LogOut, BarChart2,
  Shield, Trash2, Search, ArrowLeft,
  MapPin, Phone, Building2, Clock
} from 'lucide-react';
import { URGENCY_COLORS, URGENCY_LABELS, getTimeAgo } from '../../utils/helpers';

const ManageRequests = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    adminAPI.getAllRequests()
      .then(res => {
        setRequests(res.data);
        setFiltered(res.data);
      })
      .catch(() => toast.error('Failed to load requests'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = requests;
    if (filterStatus !== 'all') {
      result = result.filter(r => r.status === filterStatus);
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
  }, [search, filterStatus, requests]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    try {
      await adminAPI.deleteRequest(id);
      toast.success('Request deleted!');
      setRequests(requests.filter(r => r.id !== id));
    } catch {
      toast.error('Failed to delete request');
    }
  };

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
            { icon: <BarChart2 size={18} />, label: 'Dashboard', path: '/admin' },
            { icon: <Users size={18} />, label: 'Manage Users', path: '/admin/users' },
            { icon: <List size={18} />, label: 'Manage Requests', path: '/admin/requests', active: true },
            { icon: <Droplets size={18} />, label: 'Blood Requests', path: '/dashboard' },
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

      {/* Main */}
      <div style={styles.main}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.backBtn} onClick={() => navigate('/admin')}>
              <ArrowLeft size={18} />
            </div>
            <div>
              <h1 style={styles.headerTitle}>Manage Requests</h1>
              <p style={styles.headerSubtitle}>{filtered.length} requests found</p>
            </div>
          </div>

          <div style={styles.headerRight}>
            {/* Filter */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Search */}
            <div style={styles.searchBox}>
              <Search size={16} color="#7F8C8D" />
              <input
                type="text"
                placeholder="Search requests..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>
        </div>

        {/* Requests Grid */}
        {loading ? (
          <div style={styles.loading}>Loading requests...</div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
            <Droplets size={48} color="#E8E8E8" />
            <h3 style={styles.emptyTitle}>No requests found</h3>
            <p style={styles.emptyText}>Try adjusting your search or filter</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map(request => (
              <div key={request.id} style={styles.card}>

                {/* Card Header */}
                <div style={styles.cardHeader}>
                  <div style={styles.bloodBadge}>{request.blood_type}</div>
                  <div style={{
                    ...styles.urgencyBadge,
                    backgroundColor: URGENCY_COLORS[request.urgency] + '20',
                    color: URGENCY_COLORS[request.urgency],
                  }}>
                    {URGENCY_LABELS[request.urgency]}
                  </div>
                  <div style={{
                    ...styles.statusBadge,
                    backgroundColor: request.status === 'open' ? '#EAFAF1' : '#F2F3F4',
                    color: request.status === 'open' ? '#27AE60' : '#7F8C8D',
                  }}>
                    {request.status}
                  </div>
                </div>

                {/* Patient Info */}
                <h3 style={styles.patientName}>{request.patient_name}</h3>
                <p style={styles.units}>
                  <Droplets size={14} color="#C0392B" />
                  {request.units_needed} unit(s) needed
                </p>

                {/* Details */}
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

                {/* Actions */}
                <div style={styles.cardFooter}>
                  <span style={styles.requestId}>ID: #{request.id}</span>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(request.id)}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
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
    width: '260px', backgroundColor: '#2C3E50',
    display: 'flex', flexDirection: 'column',
    position: 'fixed', height: '100vh',
  },
  sidebarTop: { padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  sidebarLogo: {
    display: 'flex', alignItems: 'center', gap: '10px',
    color: 'white', fontFamily: 'Playfair Display, serif',
    fontSize: '20px', marginBottom: '12px',
  },
  adminBadge: {
    display: 'flex', alignItems: 'center', gap: '6px',
    backgroundColor: 'rgba(192,57,43,0.3)', color: '#E74C3C',
    padding: '6px 12px', borderRadius: '8px',
    fontSize: '13px', fontWeight: '500', width: 'fit-content',
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
    alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  backBtn: {
    width: '40px', height: '40px', borderRadius: '10px',
    backgroundColor: 'white', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', color: '#2C3E50',
  },
  headerTitle: { fontSize: '28px', fontFamily: 'Playfair Display, serif', color: '#2C3E50' },
  headerSubtitle: { color: '#7F8C8D', fontSize: '14px', marginTop: '2px' },
  headerRight: { display: 'flex', gap: '12px', alignItems: 'center' },
  filterSelect: {
    padding: '10px 16px', borderRadius: '10px',
    border: '2px solid #E8E8E8', backgroundColor: 'white',
    fontSize: '14px', fontFamily: 'DM Sans, sans-serif',
    color: '#2C3E50', cursor: 'pointer',
  },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: '10px',
    backgroundColor: 'white', borderRadius: '10px',
    padding: '10px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: '260px',
  },
  searchInput: {
    border: 'none', outline: 'none', fontSize: '14px',
    fontFamily: 'DM Sans, sans-serif', width: '100%', color: '#2C3E50',
  },
  loading: { textAlign: 'center', padding: '60px', color: '#7F8C8D' },
  empty: {
    textAlign: 'center', padding: '80px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
  },
  emptyTitle: { fontSize: '20px', fontFamily: 'Playfair Display, serif', color: '#2C3E50' },
  emptyText: { color: '#7F8C8D', fontSize: '14px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: 'white', borderRadius: '16px',
    padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  cardHeader: {
    display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px',
  },
  bloodBadge: {
    backgroundColor: '#FADBD8', color: '#C0392B',
    padding: '4px 12px', borderRadius: '20px',
    fontSize: '14px', fontWeight: '700',
  },
  urgencyBadge: {
    padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500',
  },
  statusBadge: {
    padding: '4px 12px', borderRadius: '20px',
    fontSize: '13px', fontWeight: '500', textTransform: 'capitalize',
  },
  patientName: {
    fontSize: '18px', fontFamily: 'Playfair Display, serif',
    color: '#2C3E50', marginBottom: '6px',
  },
  units: {
    display: 'flex', alignItems: 'center', gap: '6px',
    color: '#C0392B', fontSize: '14px', fontWeight: '500', marginBottom: '16px',
  },
  details: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' },
  detailRow: {
    display: 'flex', alignItems: 'center', gap: '8px',
    color: '#7F8C8D', fontSize: '13px',
  },
  notes: {
    color: '#7F8C8D', fontSize: '13px',
    fontStyle: 'italic', marginBottom: '12px',
    padding: '10px', backgroundColor: '#F2F3F4', borderRadius: '8px',
  },
  cardFooter: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginTop: '16px',
    paddingTop: '16px', borderTop: '1px solid #F2F3F4',
  },
  requestId: { color: '#95A5A6', fontSize: '13px' },
  deleteBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 14px', borderRadius: '8px',
    backgroundColor: '#FADBD8', color: '#C0392B',
    fontSize: '13px', fontWeight: '500', cursor: 'pointer',
    border: 'none', fontFamily: 'DM Sans, sans-serif',
  },
};

export default ManageRequests;