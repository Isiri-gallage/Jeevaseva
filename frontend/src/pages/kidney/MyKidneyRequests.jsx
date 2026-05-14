import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { kidneyAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Layout from '../../components/layout/Layout';
import {
  Heart, Plus, Building2, MapPin,
  Phone, Clock, CheckCircle, Trash2
} from 'lucide-react';
import { getTimeAgo } from '../../utils/helpers';
import Spinner from '../../components/ui/Spinner';

const MyKidneyRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    kidneyAPI.getMyRequests()
      .then(res => setRequests(res.data))
      .catch(() => toast.error('Failed to load requests'))
      .finally(() => setLoading(false));
  }, []);

  const handleClose = async (id) => {
    try {
      await kidneyAPI.updateRequest(id, { status: 'closed' });
      toast.success('Request closed!');
      setRequests(requests.map(r => r.id === id ? { ...r, status: 'closed' } : r));
    } catch {
      toast.error('Failed to close request');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this kidney request?')) return;
    try {
      await kidneyAPI.deleteRequest(id);
      toast.success('Request deleted!');
      setRequests(requests.filter(r => r.id !== id));
    } catch {
      toast.error('Failed to delete request');
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>My Kidney Requests</h1>
          <p style={styles.headerSubtitle}>{requests.length} total requests</p>
        </div>
        <button style={styles.createBtn} onClick={() => navigate('/kidney/post-request')}>
          <Plus size={18} /> New Request
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : requests.length === 0 ? (
        <div style={styles.empty}>
          <Heart size={48} color="#E8E8E8" />
          <h3 style={styles.emptyTitle}>No kidney requests yet</h3>
          <p style={styles.emptyText}>Post your first kidney request to find a willing donor</p>
          <button style={styles.emptyBtn} onClick={() => navigate('/kidney/post-request')}>
            <Plus size={16} /> Post Request
          </button>
        </div>
      ) : (
        <div style={styles.list}>
          {requests.map(request => (
            <div key={request.id} style={styles.card}>
              <div style={styles.cardLeft}>
                <div style={styles.bloodBadge}>{request.blood_type}</div>
                <div style={styles.cardInfo}>
                  <h3 style={styles.patientName}>{request.patient_name}</h3>
                  <p style={styles.age}>Age: {request.patient_age} years</p>
                  <div style={styles.details}>
                    <div style={styles.detailRow}>
                      <Building2 size={14} color="#7F8C8D" />
                      <span>{request.hospital_name}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <MapPin size={14} color="#7F8C8D" />
                      <span>{request.hospital_city}</span>
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
                </div>
              </div>

              <div style={styles.cardRight}>
                <div style={{
                  ...styles.statusBadge,
                  backgroundColor: request.status === 'open' ? '#EAFAF1' : '#F2F3F4',
                  color: request.status === 'open' ? '#27AE60' : '#7F8C8D',
                }}>
                  {request.status}
                </div>
                <div style={styles.actions}>
                  {request.status === 'open' && (
                    <button style={styles.closeBtn} onClick={() => handleClose(request.id)}>
                      <CheckCircle size={14} /> Close
                    </button>
                  )}
                  <button style={styles.deleteBtn} onClick={() => handleDelete(request.id)}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  headerTitle: { fontSize: '32px', fontFamily: 'Playfair Display, serif', color: '#2C3E50' },
  headerSubtitle: { color: '#7F8C8D', marginTop: '4px' },
  createBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#8E44AD', color: 'white', borderRadius: '10px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', border: 'none' },
  loading: { textAlign: 'center', padding: '60px', color: '#7F8C8D' },
  empty: { textAlign: 'center', padding: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  emptyTitle: { fontSize: '20px', fontFamily: 'Playfair Display, serif', color: '#2C3E50' },
  emptyText: { color: '#7F8C8D', fontSize: '14px' },
  emptyBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#8E44AD', color: 'white', borderRadius: '10px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif', marginTop: '8px' },
  list: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' },
  cardLeft: { display: 'flex', alignItems: 'flex-start', gap: '16px' },
  bloodBadge: { backgroundColor: '#F5EEF8', color: '#8E44AD', padding: '8px 14px', borderRadius: '12px', fontSize: '18px', fontWeight: '700', flexShrink: 0 },
  cardInfo: { display: 'flex', flexDirection: 'column', gap: '4px' },
  patientName: { fontSize: '18px', fontFamily: 'Playfair Display, serif', color: '#2C3E50' },
  age: { color: '#7F8C8D', fontSize: '14px', marginBottom: '8px' },
  details: { display: 'flex', flexWrap: 'wrap', gap: '12px' },
  detailRow: { display: 'flex', alignItems: 'center', gap: '6px', color: '#7F8C8D', fontSize: '13px' },
  cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' },
  statusBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', textTransform: 'capitalize' },
  actions: { display: 'flex', gap: '8px' },
  closeBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#EAFAF1', color: '#27AE60', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif' },
  deleteBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#FADBD8', color: '#C0392B', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif' },
};

export default MyKidneyRequests;