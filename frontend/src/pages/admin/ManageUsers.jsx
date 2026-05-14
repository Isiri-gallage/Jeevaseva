import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Layout from '../../components/layout/Layout';
import {
  Search, CheckCircle, Ban,
  ShieldCheck, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminAPI.getAllUsers()
      .then(res => { setUsers(res.data); setFiltered(res.data); })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(users.filter(u =>
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.city?.toLowerCase().includes(q)
    ));
  }, [search, users]);

  const handleVerify = async (id) => {
    try {
      await adminAPI.verifyUser(id);
      toast.success('User verified!');
      setUsers(users.map(u => u.id === id ? { ...u, is_verified: true } : u));
    } catch { toast.error('Failed to verify user'); }
  };

  const handleBan = async (id) => {
    try {
      await adminAPI.banUser(id);
      toast.success('User banned!');
      setUsers(users.map(u => u.id === id ? { ...u, is_active: false } : u));
    } catch { toast.error('Failed to ban user'); }
  };

  const handleUnban = async (id) => {
    try {
      await adminAPI.unbanUser(id);
      toast.success('User unbanned!');
      setUsers(users.map(u => u.id === id ? { ...u, is_active: true } : u));
    } catch { toast.error('Failed to unban user'); }
  };

  const handleMakeAdmin = async (id) => {
    try {
      await adminAPI.makeAdmin(id);
      toast.success('User is now admin!');
      setUsers(users.map(u => u.id === id ? { ...u, is_admin: true } : u));
    } catch { toast.error('Failed to make admin'); }
  };

  return (
    <Layout>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.backBtn} onClick={() => navigate('/admin')}>
            <ArrowLeft size={18} />
          </div>
          <div>
            <h1 style={styles.headerTitle}>Manage Users</h1>
            <p style={styles.headerSubtitle}>{filtered.length} users found</p>
          </div>
        </div>
        <div style={styles.searchBox}>
          <Search size={16} color="#7F8C8D" />
          <input
            type="text"
            placeholder="Search by name, email or city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading users...</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Contact</th>
                <th style={styles.th}>Blood Type</th>
                <th style={styles.th}>City</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Roles</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={styles.tableRow}>
                  <td style={styles.td}>
                    <div style={styles.userCell}>
                      <div style={styles.userAvatar}>{u.full_name?.charAt(0).toUpperCase()}</div>
                      <div>
                        <div style={styles.userName2}>{u.full_name}</div>
                        <div style={styles.userId}>ID: {u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.email}>{u.email}</div>
                    <div style={styles.phone}>{u.phone}</div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.bloodBadge}>{u.blood_type}</div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.cityText}>{u.city || '-'}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.statusCell}>
                      <span style={{ ...styles.statusBadge, backgroundColor: u.is_active ? '#EAFAF1' : '#FADBD8', color: u.is_active ? '#27AE60' : '#C0392B' }}>
                        {u.is_active ? 'Active' : 'Banned'}
                      </span>
                      {u.is_verified && (
                        <span style={styles.verifiedBadge}>
                          <CheckCircle size={12} /> Verified
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.rolesCell}>
                      {u.is_admin && <span style={styles.adminRoleBadge}>Admin</span>}
                      {u.is_donor && <span style={styles.donorRoleBadge}>Donor</span>}
                      {!u.is_admin && !u.is_donor && <span style={styles.patientRoleBadge}>Patient</span>}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionsCell}>
                      {!u.is_verified && (
                        <button style={styles.verifyBtn} onClick={() => handleVerify(u.id)}>
                          <CheckCircle size={14} /> Verify
                        </button>
                      )}
                      {u.is_active ? (
                        <button style={styles.banBtn} onClick={() => handleBan(u.id)} disabled={u.is_admin}>
                          <Ban size={14} /> Ban
                        </button>
                      ) : (
                        <button style={styles.unbanBtn} onClick={() => handleUnban(u.id)}>
                          <CheckCircle size={14} /> Unban
                        </button>
                      )}
                      {!u.is_admin && (
                        <button style={styles.makeAdminBtn} onClick={() => handleMakeAdmin(u.id)}>
                          <ShieldCheck size={14} /> Admin
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  backBtn: { width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', color: '#2C3E50' },
  headerTitle: { fontSize: '28px', fontFamily: 'Playfair Display, serif', color: '#2C3E50' },
  headerSubtitle: { color: '#7F8C8D', fontSize: '14px', marginTop: '2px' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', borderRadius: '10px', padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: '320px' },
  searchInput: { border: 'none', outline: 'none', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', width: '100%', color: '#2C3E50' },
  loading: { textAlign: 'center', padding: '60px', color: '#7F8C8D' },
  tableContainer: { backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { backgroundColor: '#F2F3F4' },
  th: { padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#7F8C8D', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tableRow: { borderTop: '1px solid #F2F3F4' },
  td: { padding: '16px' },
  userCell: { display: 'flex', alignItems: 'center', gap: '12px' },
  userAvatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FADBD8', color: '#C0392B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '600', flexShrink: 0 },
  userName2: { fontSize: '14px', fontWeight: '500', color: '#2C3E50' },
  userId: { fontSize: '12px', color: '#95A5A6' },
  email: { fontSize: '13px', color: '#2C3E50' },
  phone: { fontSize: '12px', color: '#7F8C8D' },
  bloodBadge: { backgroundColor: '#FADBD8', color: '#C0392B', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', display: 'inline-block' },
  cityText: { fontSize: '13px', color: '#7F8C8D' },
  statusCell: { display: 'flex', flexDirection: 'column', gap: '4px' },
  statusBadge: { padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', display: 'inline-block' },
  verifiedBadge: { display: 'flex', alignItems: 'center', gap: '4px', color: '#27AE60', fontSize: '12px' },
  rolesCell: { display: 'flex', gap: '4px', flexWrap: 'wrap' },
  adminRoleBadge: { backgroundColor: '#FEF9E7', color: '#F39C12', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' },
  donorRoleBadge: { backgroundColor: '#FADBD8', color: '#C0392B', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' },
  patientRoleBadge: { backgroundColor: '#EBF5FB', color: '#2980B9', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' },
  actionsCell: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  verifyBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '6px', backgroundColor: '#EAFAF1', color: '#27AE60', fontSize: '12px', fontWeight: '500', cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif' },
  banBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '6px', backgroundColor: '#FADBD8', color: '#C0392B', fontSize: '12px', fontWeight: '500', cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif' },
  unbanBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '6px', backgroundColor: '#EAFAF1', color: '#27AE60', fontSize: '12px', fontWeight: '500', cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif' },
  makeAdminBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '6px', backgroundColor: '#FEF9E7', color: '#F39C12', fontSize: '12px', fontWeight: '500', cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif' },
};

export default ManageUsers;