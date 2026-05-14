import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Layout from '../../components/layout/Layout';
import { Droplets, ArrowLeft } from 'lucide-react';
import { BLOOD_TYPES, URGENCY_LEVELS } from '../../utils/helpers';

const CreateRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    blood_type: '',
    units_needed: 1,
    urgency: 'medium',
    hospital_name: '',
    hospital_address: '',
    city: '',
    patient_name: '',
    contact_number: '',
    notes: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestsAPI.create(form);
      toast.success('Blood request created successfully!');
      navigate('/my-requests');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.backBtn} onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={18} />
          </div>
          <div>
            <h1 style={styles.headerTitle}>Create Blood Request</h1>
            <p style={styles.headerSubtitle}>Post an emergency blood request</p>
          </div>
        </div>
      </div>

      <div style={styles.formCard}>
        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Blood Info */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Blood Requirements</h2>
            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Blood Type *</label>
                <select name="blood_type" value={form.blood_type} onChange={handleChange} style={styles.input} required>
                  <option value="">Select blood type</option>
                  {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Units Needed *</label>
                <input type="number" name="units_needed" min="1" max="10" value={form.units_needed} onChange={handleChange} style={styles.input} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Urgency Level *</label>
                <select name="urgency" value={form.urgency} onChange={handleChange} style={styles.input} required>
                  {URGENCY_LEVELS.map(u => <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Hospital Info */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Hospital Information</h2>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Hospital Name *</label>
              <input type="text" name="hospital_name" value={form.hospital_name} onChange={handleChange} placeholder="e.g. National Hospital Colombo" style={styles.input} required />
            </div>
            <div style={styles.row}>
              <div style={{ ...styles.inputGroup, flex: 2 }}>
                <label style={styles.label}>Hospital Address *</label>
                <input type="text" name="hospital_address" value={form.hospital_address} onChange={handleChange} placeholder="Street address" style={styles.input} required />
              </div>
              <div style={{ ...styles.inputGroup, flex: 1 }}>
                <label style={styles.label}>City *</label>
                <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="Colombo" style={styles.input} required />
              </div>
            </div>
          </div>

          {/* Patient Info */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Patient Information</h2>
            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Patient Name *</label>
                <input type="text" name="patient_name" value={form.patient_name} onChange={handleChange} placeholder="Full name of patient" style={styles.input} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Contact Number *</label>
                <input type="text" name="contact_number" value={form.contact_number} onChange={handleChange} placeholder="07XXXXXXXX" style={styles.input} required />
              </div>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Additional Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any additional information..." style={styles.textarea} rows={3} />
            </div>
          </div>

          {/* Submit */}
          <div style={styles.submitRow}>
            <button type="button" style={styles.cancelBtn} onClick={() => navigate('/dashboard')}>Cancel</button>
            <button type="submit" style={loading ? styles.submitBtnDisabled : styles.submitBtn} disabled={loading}>
              <Droplets size={18} />
              {loading ? 'Creating...' : 'Create Blood Request'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

const styles = {
  header: { marginBottom: '24px' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  backBtn: {
    width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', color: '#2C3E50',
  },
  headerTitle: { fontSize: '28px', fontFamily: 'Playfair Display, serif', color: '#2C3E50' },
  headerSubtitle: { color: '#7F8C8D', marginTop: '4px' },
  formCard: { backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  form: { display: 'flex', flexDirection: 'column', gap: '32px' },
  section: { display: 'flex', flexDirection: 'column', gap: '16px' },
  sectionTitle: { fontSize: '18px', fontFamily: 'Playfair Display, serif', color: '#2C3E50', paddingBottom: '12px', borderBottom: '2px solid #F2F3F4' },
  row: { display: 'flex', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
  label: { fontSize: '14px', fontWeight: '500', color: '#2C3E50' },
  input: { padding: '12px 16px', borderRadius: '10px', border: '2px solid #E8E8E8', fontSize: '15px', fontFamily: 'DM Sans, sans-serif', backgroundColor: '#F9F9F9', width: '100%' },
  textarea: { padding: '12px 16px', borderRadius: '10px', border: '2px solid #E8E8E8', fontSize: '15px', fontFamily: 'DM Sans, sans-serif', backgroundColor: '#F9F9F9', width: '100%', resize: 'vertical' },
  submitRow: { display: 'flex', justifyContent: 'flex-end', gap: '12px' },
  cancelBtn: { padding: '14px 28px', borderRadius: '10px', border: '2px solid #E8E8E8', backgroundColor: 'white', color: '#7F8C8D', fontSize: '15px', fontWeight: '500', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  submitBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '10px', backgroundColor: '#C0392B', color: 'white', fontSize: '15px', fontWeight: '500', cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif' },
  submitBtnDisabled: { display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '10px', backgroundColor: '#E74C3C80', color: 'white', fontSize: '15px', fontWeight: '500', cursor: 'not-allowed', border: 'none', fontFamily: 'DM Sans, sans-serif' },
};

export default CreateRequest;