import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { kidneyAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Layout from '../../components/layout/Layout';
import {
  Heart, Plus, Search, Phone,
  Building2, MapPin, Clock, AlertCircle
} from 'lucide-react';
import { getTimeAgo } from '../../utils/helpers';
import Spinner from '../../components/ui/Spinner';

const KidneyBoard = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    kidneyAPI.getAllRequests()
      .then(res => { setRequests(res.data); setFiltered(res.data); })
      .catch(() => toast.error('Failed to load kidney requests'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(requests.filter(r =>
      r.patient_name.toLowerCase().includes(q) ||
      r.hospital_name.toLowerCase().includes(q) ||
      r.hospital_city.toLowerCase().includes(q) ||
      r.blood_type.toLowerCase().includes(q)
    ));
  }, [search, requests]);

  return (
    <Layout>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>Kidney Request Board</h1>
          <p style={styles.headerSubtitle}>Connecting kidney patients with willing donors in Sri Lanka</p>
        </div>
        <div style={styles.headerBtns}>
          <button style={styles.donorBtn} onClick={() => navigate('/kidney/register-donor')}>
            <Heart size={16} /> Register as Donor
          </button>
          <button style={styles.createBtn} onClick={() => navigate('/kidney/post-request')}>
            <Plus size={16} /> Post Request
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={styles.disclaimer}>
        <AlertCircle size={18} color="#E67E22" />
        <p style={styles.disclaimerText}>
          <strong>Important:</strong> RaktaSeva only connects willing donors with patients.
          All medical evaluation, compatibility testing and surgery must be done through
          registered hospitals and medical professionals in Sri Lanka.
        </p>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {[
          { label: 'Open Requests', value: requests.length, color: '#8E44AD', bg: '#F5EEF8' },
          { label: 'Patients Waiting', value: requests.length, color: '#C0392B', bg: '#FADBD8' },
          { label: 'Cities', value: [...new Set(requests.map(r => r.hospital_city))].length, color: '#2980B9', bg: '#EBF5FB' },
          { label: 'Blood Types', value: [...new Set(requests.map(r => r.blood_type))].length, color: '#27AE60', bg: '#EAFAF1' },
        ].map((stat, i) => (
          <div key={i} style={{ ...styles.statCard, backgroundColor: stat.bg }}>
            <div style={{ ...styles.statValue, color: stat.color }}>{stat.value}</div>
            <div style={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
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

      {/* Requests */}
      {loading ? (
         <Spinner />
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>
          <Heart size={48} color="#E8E8E8" />
          <h3 style={styles.emptyTitle}>No kidney requests found</h3>
          <p style={styles.emptyText}>Be the first to post a kidney request</p>
          <button style={styles.emptyBtn} onClick={() => navigate('/kidney/post-request')}>
            <Plus size={16} /> Post Request
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map(request => (
            <div key={request.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.bloodBadge}>{request.blood_type}</div>
                <div style={styles.kidneyBadge}>🫀 Kidney</div>
                <div style={{
                  ...styles.statusBadge,
                  backgroundColor: request.status === 'open' ? '#EAFAF1' : '#F2F3F4',
                  color: request.status === 'open' ? '#27AE60' : '#7F8C8D',
                }}>
                  {request.status}
                </div>
              </div>
              <h3 style={styles.patientName}>{request.patient_name}</h3>
              <p style={styles.age}>Age: {request.patient_age} years</p>
              <div style={styles.details}>
                <div style={styles.detailRow}><Building2 size={14} color="#7F8C8D" /><span>{request.hospital_name}</span></div>
                <div style={styles.detailRow}><MapPin size={14} color="#7F8C8D" /><span>{request.hospital_city}</span></div>
                <div style={styles.detailRow}><Phone size={14} color="#7F8C8D" /><span>{request.contact_number}</span></div>
                {request.dialysis_duration && (
                  <div style={styles.detailRow}><Clock size={14} color="#7F8C8D" /><span>On dialysis: {request.dialysis_duration}</span></div>
                )}
              </div>
              {request.medical_details && <p style={styles.medicalDetails}>"{request.medical_details}"</p>}
              <div style={styles.cardFooter}>
                <span style={styles.timeAgo}>{getTimeAgo(request.created_at)}</span>
                <a href={`tel:${request.contact_number}`} style={styles.callBtn}>
                  <Phone size={14} /> Contact
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' },
  headerTitle: { fontSize: '32px', fontFamily: 'Playfair Display, serif', color: '#2C3E50' },
  headerSubtitle: { color: '#7F8C8D', marginTop: '4px' },
  headerBtns: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  donorBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#F5EEF8', color: '#8E44AD', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif' },
  createBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#8E44AD', color: 'white', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif' },
  disclaimer: { display: 'flex', alignItems: 'flex-start', gap: '12px', backgroundColor: '#FEF9E7', border: '1px solid #F39C12', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' },
  disclaimerText: { color: '#7D6608', fontSize: '14px', lineHeight: '1.6' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { borderRadius: '16px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  statValue: { fontSize: '32px', fontFamily: 'Playfair Display, serif', fontWeight: '700' },
  statLabel: { fontSize: '13px', color: '#7F8C8D', marginTop: '4px' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', borderRadius: '10px', padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '24px' },
  searchInput: { border: 'none', outline: 'none', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', width: '100%', color: '#2C3E50' },
  loading: { textAlign: 'center', padding: '60px', color: '#7F8C8D' },
  empty: { textAlign: 'center', padding: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  emptyTitle: { fontSize: '20px', fontFamily: 'Playfair Display, serif', color: '#2C3E50' },
  emptyText: { color: '#7F8C8D', fontSize: '14px' },
  emptyBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#8E44AD', color: 'white', borderRadius: '10px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif', marginTop: '8px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardHeader: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
  bloodBadge: { backgroundColor: '#FADBD8', color: '#C0392B', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: '700' },
  kidneyBadge: { backgroundColor: '#F5EEF8', color: '#8E44AD', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' },
  statusBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', textTransform: 'capitalize' },
  patientName: { fontSize: '18px', fontFamily: 'Playfair Display, serif', color: '#2C3E50', marginBottom: '4px' },
  age: { color: '#7F8C8D', fontSize: '14px', marginBottom: '12px' },
  details: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' },
  detailRow: { display: 'flex', alignItems: 'center', gap: '8px', color: '#7F8C8D', fontSize: '13px' },
  medicalDetails: { color: '#7F8C8D', fontSize: '13px', fontStyle: 'italic', padding: '10px', backgroundColor: '#F2F3F4', borderRadius: '8px', marginBottom: '12px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F2F3F4' },
  timeAgo: { color: '#95A5A6', fontSize: '13px' },
  callBtn: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#F5EEF8', color: '#8E44AD', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', textDecoration: 'none' },
};

export default KidneyBoard;