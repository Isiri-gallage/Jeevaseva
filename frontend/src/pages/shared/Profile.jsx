import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Droplets, LogOut, Plus, List, User,
  CheckCircle, Shield, Heart, Edit2, Save,
  BarChart2, Users, BarChart
} from 'lucide-react';
import { BLOOD_TYPES } from '../../utils/helpers';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    blood_type: user?.blood_type || '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      toast.success('Profile updated!');
      setEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic nav based on role
  const getNavItems = () => {
    if (user?.is_admin) {
      return [
        { icon: <BarChart2 size={18} />, label: 'Dashboard', path: '/admin' },
        { icon: <Users size={18} />, label: 'Manage Users', path: '/admin/users' },
        { icon: <List size={18} />, label: 'Manage Requests', path: '/admin/requests' },
        { icon: <Droplets size={18} />, label: 'Blood Requests', path: '/blood-requests' },
        { icon: <User size={18} />, label: 'Profile', path: '/profile', active: true },
      ];
    }
    if (user?.is_donor) {
      return [
        { icon: <Heart size={18} />, label: 'Donor Dashboard', path: '/donor-dashboard' },
        { icon: <Droplets size={18} />, label: 'Matching Requests', path: '/matching-requests' },
        { icon: <List size={18} />, label: 'My Donations', path: '/my-donations' },
        { icon: <User size={18} />, label: 'Profile', path: '/profile', active: true },
      ];
    }
    return [
      { icon: <Droplets size={18} />, label: 'All Requests', path: '/dashboard' },
      { icon: <List size={18} />, label: 'My Requests', path: '/my-requests' },
      { icon: <Plus size={18} />, label: 'Create Request', path: '/create-request' },
      { icon: <User size={18} />, label: 'Profile', path: '/profile', active: true },
    ];
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
          {getNavItems().map((item, i) => (
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
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>My Profile</h1>
            <p style={styles.headerSubtitle}>Manage your account information</p>
          </div>
          <button
            style={editing ? styles.saveBtn : styles.editBtn}
            onClick={editing ? handleSave : () => setEditing(true)}
            disabled={loading}
          >
            {editing
              ? <><Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}</>
              : <><Edit2 size={16} /> Edit Profile</>
            }
          </button>
        </div>

        <div style={styles.content}>

          {/* Profile Card */}
          <div style={styles.profileCard}>
            <div style={styles.profileAvatar}>
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div style={styles.profileName}>{user?.full_name}</div>
            <div style={styles.profileEmail}>{user?.email}</div>

            {/* Badges */}
            <div style={styles.badges}>
              <div style={styles.bloodBadge}>
                <Droplets size={14} color="#C0392B" />
                {user?.blood_type}
              </div>
              {user?.is_verified && (
                <div style={styles.verifiedBadge}>
                  <CheckCircle size={14} />
                  Verified
                </div>
              )}
              {user?.is_admin && (
                <div style={styles.adminBadge}>
                  <Shield size={14} />
                  Admin
                </div>
              )}
              {user?.is_donor && (
                <div style={styles.donorBadge}>
                  <Heart size={14} />
                  Donor
                </div>
              )}
            </div>

            {/* Availability for donors */}
            {user?.is_donor && (
              <div style={{
                ...styles.availabilityBadge,
                backgroundColor: user?.is_available ? '#EAFAF1' : '#FADBD8',
                color: user?.is_available ? '#27AE60' : '#C0392B',
              }}>
                {user?.is_available ? '✓ Available to Donate' : '✗ Currently Unavailable'}
              </div>
            )}

            {/* Role Badge */}
            <div style={styles.roleBadge}>
              {user?.is_admin ? '👑 Administrator' : user?.is_donor ? '❤️ Blood Donor' : '🏥 Patient'}
            </div>
          </div>

          {/* Info Card */}
          <div style={styles.infoCard}>
            <h2 style={styles.sectionTitle}>Personal Information</h2>

            <div style={styles.formGrid}>

              {/* Full Name */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                {editing ? (
                  <input
                    type="text" name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    style={styles.input}
                  />
                ) : (
                  <div style={styles.value}>{user?.full_name}</div>
                )}
              </div>

              {/* Email */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <div style={styles.value}>{user?.email}</div>
                <div style={styles.hint}>Email cannot be changed</div>
              </div>

              {/* Phone */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone Number</label>
                {editing ? (
                  <input
                    type="text" name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    style={styles.input}
                  />
                ) : (
                  <div style={styles.value}>{user?.phone}</div>
                )}
              </div>

              {/* City */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>City</label>
                {editing ? (
                  <input
                    type="text" name="city"
                    value={form.city}
                    onChange={handleChange}
                    style={styles.input}
                  />
                ) : (
                  <div style={styles.value}>{user?.city || 'Not set'}</div>
                )}
              </div>

              {/* Blood Type */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Blood Type</label>
                {editing ? (
                  <select
                    name="blood_type"
                    value={form.blood_type}
                    onChange={handleChange}
                    style={styles.input}
                  >
                    {BLOOD_TYPES.map(bt => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                ) : (
                  <div style={styles.value}>{user?.blood_type}</div>
                )}
              </div>

            </div>

            {/* Divider */}
            <div style={styles.divider} />

            {/* Account Info */}
            <h2 style={styles.sectionTitle}>Account Information</h2>
            <div style={styles.accountGrid}>
              {[
                {
                  label: 'Account Status',
                  value: user?.is_active ? 'Active' : 'Inactive',
                  color: user?.is_active ? '#27AE60' : '#C0392B',
                  bg: user?.is_active ? '#EAFAF1' : '#FADBD8',
                },
                {
                  label: 'Verification',
                  value: user?.is_verified ? 'Verified' : 'Not Verified',
                  color: user?.is_verified ? '#27AE60' : '#F39C12',
                  bg: user?.is_verified ? '#EAFAF1' : '#FEF9E7',
                },
                {
                  label: 'Role',
                  value: user?.is_admin ? 'Administrator' : user?.is_donor ? 'Donor' : 'Patient',
                  color: '#2980B9',
                  bg: '#EBF5FB',
                },
                {
                  label: 'Donor Status',
                  value: user?.is_donor
                    ? user?.is_available ? 'Available' : 'Unavailable'
                    : 'Not a Donor',
                  color: user?.is_donor
                    ? user?.is_available ? '#27AE60' : '#E67E22'
                    : '#7F8C8D',
                  bg: user?.is_donor
                    ? user?.is_available ? '#EAFAF1' : '#FEF9E7'
                    : '#F2F3F4',
                },
              ].map((item, i) => (
                <div key={i} style={{ ...styles.accountItem, backgroundColor: item.bg }}>
                  <div style={styles.accountLabel}>{item.label}</div>
                  <div style={{ ...styles.accountValue, color: item.color }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Donor specific info */}
            {user?.is_donor && (
              <>
                <div style={styles.divider} />
                <h2 style={styles.sectionTitle}>Donor Information</h2>
                <div style={styles.donorInfo}>
                  <div style={styles.donorInfoItem}>
                    <Droplets size={20} color="#C0392B" />
                    <div>
                      <div style={styles.donorInfoLabel}>Blood Type</div>
                      <div style={styles.donorInfoValue}>{user?.blood_type}</div>
                    </div>
                  </div>
                  <div style={styles.donorInfoItem}>
                    <CheckCircle size={20} color="#27AE60" />
                    <div>
                      <div style={styles.donorInfoLabel}>Availability</div>
                      <div style={{
                        ...styles.donorInfoValue,
                        color: user?.is_available ? '#27AE60' : '#E67E22'
                      }}>
                        {user?.is_available ? 'Available' : 'Unavailable'}
                      </div>
                    </div>
                  </div>
                  <div style={styles.donorInfoItem}>
                    <Shield size={20} color="#2980B9" />
                    <div>
                      <div style={styles.donorInfoLabel}>Verification</div>
                      <div style={{
                        ...styles.donorInfoValue,
                        color: user?.is_verified ? '#27AE60' : '#F39C12'
                      }}>
                        {user?.is_verified ? 'Verified Donor' : 'Pending Verification'}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
  headerTitle: { fontSize: '32px', fontFamily: 'Playfair Display, serif', color: '#2C3E50' },
  headerSubtitle: { color: '#7F8C8D', marginTop: '4px' },
  editBtn: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
    backgroundColor: 'white', color: '#2C3E50', borderRadius: '10px',
    fontSize: '15px', fontWeight: '500', cursor: 'pointer',
    border: '2px solid #E8E8E8', fontFamily: 'DM Sans, sans-serif',
  },
  saveBtn: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
    backgroundColor: '#C0392B', color: 'white', borderRadius: '10px',
    fontSize: '15px', fontWeight: '500', cursor: 'pointer',
    border: 'none', fontFamily: 'DM Sans, sans-serif',
  },
  content: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px' },
  profileCard: {
    backgroundColor: 'white', borderRadius: '16px', padding: '32px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center', height: 'fit-content',
  },
  profileAvatar: {
    width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#C0392B',
    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '36px', fontWeight: '600', margin: '0 auto 16px',
  },
  profileName: { fontSize: '20px', fontFamily: 'Playfair Display, serif', color: '#2C3E50', marginBottom: '4px' },
  profileEmail: { color: '#7F8C8D', fontSize: '14px', marginBottom: '20px' },
  badges: { display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '16px' },
  bloodBadge: {
    display: 'flex', alignItems: 'center', gap: '4px',
    backgroundColor: '#FADBD8', color: '#C0392B',
    padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
  },
  verifiedBadge: {
    display: 'flex', alignItems: 'center', gap: '4px',
    backgroundColor: '#EAFAF1', color: '#27AE60',
    padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500',
  },
  adminBadge: {
    display: 'flex', alignItems: 'center', gap: '4px',
    backgroundColor: '#FEF9E7', color: '#F39C12',
    padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500',
  },
  donorBadge: {
    display: 'flex', alignItems: 'center', gap: '4px',
    backgroundColor: '#FADBD8', color: '#C0392B',
    padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500',
  },
  availabilityBadge: {
    padding: '8px 16px', borderRadius: '8px',
    fontSize: '13px', fontWeight: '500', marginBottom: '12px',
  },
  roleBadge: {
    backgroundColor: '#F2F3F4', color: '#2C3E50',
    padding: '8px 16px', borderRadius: '8px',
    fontSize: '13px', fontWeight: '500', marginTop: '8px',
  },
  infoCard: {
    backgroundColor: 'white', borderRadius: '16px', padding: '32px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  sectionTitle: {
    fontSize: '18px', fontFamily: 'Playfair Display, serif',
    color: '#2C3E50', marginBottom: '20px',
  },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: '500', color: '#7F8C8D', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: {
    padding: '12px 16px', borderRadius: '10px', border: '2px solid #E8E8E8',
    fontSize: '15px', fontFamily: 'DM Sans, sans-serif', backgroundColor: '#F9F9F9',
  },
  value: { fontSize: '15px', color: '#2C3E50', fontWeight: '500', padding: '4px 0' },
  hint: { fontSize: '12px', color: '#95A5A6' },
  divider: { height: '1px', backgroundColor: '#F2F3F4', margin: '24px 0' },
  accountGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  accountItem: { borderRadius: '10px', padding: '16px' },
  accountLabel: { fontSize: '13px', color: '#7F8C8D', marginBottom: '6px' },
  accountValue: { fontSize: '15px', fontWeight: '600' },
  donorInfo: { display: 'flex', gap: '24px', flexWrap: 'wrap' },
  donorInfoItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    backgroundColor: '#F2F3F4', borderRadius: '10px', padding: '16px', flex: 1,
  },
  donorInfoLabel: { fontSize: '13px', color: '#7F8C8D', marginBottom: '4px' },
  donorInfoValue: { fontSize: '15px', fontWeight: '600', color: '#2C3E50' },
};

export default Profile;