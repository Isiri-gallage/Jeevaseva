import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { donorsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Layout from '../../components/layout/Layout';
import {
  Heart, Clock, CheckCircle,
  XCircle, AlertCircle, MessageCircle
} from 'lucide-react';
import { getTimeAgo } from '../../utils/helpers';
import Spinner from '../../components/ui/Spinner';


const STATUS_CONFIG = {
  pending: { color: '#F39C12', bg: '#FEF9E7', icon: <Clock size={14} />, label: 'Pending' },
  confirmed: { color: '#2980B9', bg: '#EBF5FB', icon: <AlertCircle size={14} />, label: 'Confirmed' },
  completed: { color: '#27AE60', bg: '#EAFAF1', icon: <CheckCircle size={14} />, label: 'Completed' },
  cancelled: { color: '#C0392B', bg: '#FADBD8', icon: <XCircle size={14} />, label: 'Cancelled' },
};

const MyDonations = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    donorsAPI.getMyDonations()
      .then(res => setDonations(res.data))
      .catch(() => toast.error('Failed to load donations'))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await donorsAPI.updateDonation(id, { status });
      toast.success(`Donation marked as ${status}!`);
      setDonations(donations.map(d => d.id === id ? { ...d, status } : d));
    } catch {
      toast.error('Failed to update donation');
    }
  };

  const filtered = filter === 'all'
    ? donations
    : donations.filter(d => d.status === filter);

  return (
    <Layout>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>My Donations</h1>
          <p style={styles.headerSubtitle}>{donations.length} total donations</p>
        </div>
        <div style={styles.filterTabs}>
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(tab => (
            <button
              key={tab}
              style={filter === tab ? styles.filterTabActive : styles.filterTab}
              onClick={() => setFilter(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <div key={key} style={{ ...styles.statCard, backgroundColor: config.bg }}>
            <div style={{ color: config.color }}>{config.icon}</div>
            <div style={{ ...styles.statValue, color: config.color }}>
              {donations.filter(d => d.status === key).length}
            </div>
            <div style={styles.statLabel}>{config.label}</div>
          </div>
        ))}
      </div>

      {/* Donations List */}
      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>
          <Heart size={48} color="#E8E8E8" />
          <h3 style={styles.emptyTitle}>No donations found</h3>
          <p style={styles.emptyText}>
            {filter === 'all' ? 'You have not responded to any requests yet' : `No ${filter} donations`}
          </p>
          <button style={styles.findBtn} onClick={() => navigate('/matching-requests')}>
            Find Matching Requests
          </button>
        </div>
      ) : (
        <div style={styles.donationsList}>
          {filtered.map(donation => {
            const config = STATUS_CONFIG[donation.status];
            return (
              <div key={donation.id} style={styles.donationCard}>
                <div style={styles.donationLeft}>
                  <div style={{ ...styles.statusIcon, backgroundColor: config.bg, color: config.color }}>
                    {config.icon}
                  </div>
                  <div>
                    <div style={styles.donationId}>Donation #{donation.id}</div>
                    <div style={styles.requestId}>Request #{donation.request_id}</div>
                    {donation.message && <div style={styles.message}>"{donation.message}"</div>}
                    <div style={styles.timeAgo}>
                      <Clock size={12} />
                      {getTimeAgo(donation.created_at)}
                    </div>
                  </div>
                </div>

                <div style={styles.donationRight}>
                  <div style={{ ...styles.statusBadge, backgroundColor: config.bg, color: config.color }}>
                    {config.icon} {config.label}
                  </div>
                  <div style={styles.actionBtns}>
                    <button style={styles.chatBtn} onClick={() => navigate(`/chat/${donation.id}`)}>
                      <MessageCircle size={14} /> Chat
                    </button>
                    {donation.status === 'pending' && (
                      <>
                        <button style={styles.confirmBtn} onClick={() => handleUpdateStatus(donation.id, 'confirmed')}>
                          <CheckCircle size={14} /> Confirm
                        </button>
                        <button style={styles.cancelBtn} onClick={() => handleUpdateStatus(donation.id, 'cancelled')}>
                          <XCircle size={14} /> Cancel
                        </button>
                      </>
                    )}
                    {donation.status === 'confirmed' && (
                      <button style={styles.completeBtn} onClick={() => handleUpdateStatus(donation.id, 'completed')}>
                        <CheckCircle size={14} /> Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  headerTitle: { fontSize: '32px', fontFamily: 'Playfair Display, serif', color: '#2C3E50' },
  headerSubtitle: { color: '#7F8C8D', marginTop: '4px' },
  filterTabs: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  filterTab: { padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: 'white', color: '#7F8C8D', fontSize: '14px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  filterTabActive: { padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#C0392B', color: 'white', fontSize: '14px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: '500' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  statValue: { fontSize: '28px', fontFamily: 'Playfair Display, serif', fontWeight: '700' },
  statLabel: { fontSize: '12px', color: '#7F8C8D' },
  loading: { textAlign: 'center', padding: '60px', color: '#7F8C8D' },
  empty: { textAlign: 'center', padding: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  emptyTitle: { fontSize: '20px', fontFamily: 'Playfair Display, serif', color: '#2C3E50' },
  emptyText: { color: '#7F8C8D', fontSize: '14px' },
  findBtn: { padding: '12px 24px', backgroundColor: '#C0392B', color: 'white', borderRadius: '10px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif', marginTop: '8px' },
  donationsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  donationCard: { backgroundColor: 'white', borderRadius: '16px', padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
  donationLeft: { display: 'flex', alignItems: 'flex-start', gap: '16px' },
  statusIcon: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  donationId: { fontSize: '15px', fontWeight: '600', color: '#2C3E50', marginBottom: '2px' },
  requestId: { fontSize: '13px', color: '#7F8C8D', marginBottom: '4px' },
  message: { fontSize: '13px', color: '#7F8C8D', fontStyle: 'italic', marginBottom: '4px' },
  timeAgo: { display: 'flex', alignItems: 'center', gap: '4px', color: '#95A5A6', fontSize: '12px' },
  donationRight: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  statusBadge: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '500' },
  actionBtns: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  chatBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#EBF5FB', color: '#2980B9', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif' },
  confirmBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#EAFAF1', color: '#27AE60', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif' },
  cancelBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#FADBD8', color: '#C0392B', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif' },
  completeBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#EBF5FB', color: '#2980B9', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif' },
};

export default MyDonations;