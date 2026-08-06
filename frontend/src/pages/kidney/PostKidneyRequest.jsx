import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { kidneyAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Layout from '../../components/layout/Layout';
import { Heart, ArrowLeft } from 'lucide-react';
import { BLOOD_TYPES } from '../../utils/helpers';

const PostKidneyRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    patient_name: '',
    patient_age: '',
    blood_type: '',
    contact_number: '',
    hospital_name: '',
    hospital_city: '',
    medical_details: '',
    dialysis_duration: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await kidneyAPI.createRequest({
        ...form,
        patient_age: parseInt(form.patient_age),
      });
      toast.success('Kidney request posted successfully! 🫀');
      navigate('/kidney/my-requests');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to post request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.backBtn} onClick={() => navigate('/kidney')}>
            <ArrowLeft size={18} />
          </div>
          <div>
            <h1 style={styles.headerTitle}>Post Kidney Request</h1>
            <p style={styles.headerSubtitle}>Share your need to find a willing donor</p>
          </div>
        </div>
      </div>

      <div style={styles.formCard}>
        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Patient Info */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Patient Information</h2>
            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Patient Name *</label>
                <input type="text" name="patient_name" value={form.patient_name} onChange={handleChange} placeholder="Full name of patient" style={styles.input} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Patient Age *</label>
                <input type="number" name="patient_age" value={form.patient_age} onChange={handleChange} placeholder="Age in years" style={styles.input} required min="1" max="100" />
              </div>
            </div>
            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Blood Type *</label>
                <select name="blood_type" value={form.blood_type} onChange={handleChange} style={styles.input} required>
                  <option value="">Select blood type</option>
                  {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Contact Number *</label>
                <input type="text" name="contact_number" value={form.contact_number} onChange={handleChange} placeholder="07XXXXXXXX" style={styles.input} required />
              </div>
            </div>
          </div>

          {/* Hospital Info */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Hospital Information</h2>
            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Hospital Name *</label>
                <input type="text" name="hospital_name" value={form.hospital_name} onChange={handleChange} placeholder="e.g. Colombo National Hospital" style={styles.input} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>City *</label>
                <input type="text" name="hospital_city" value={form.hospital_city} onChange={handleChange} placeholder="e.g. Colombo" style={styles.input} required />
              </div>
            </div>
          </div>

          {/* Medical Info */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Medical Information</h2>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Dialysis Duration</label>
              <input type="text" name="dialysis_duration" value={form.dialysis_duration} onChange={handleChange} placeholder="e.g. 2 years" style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Medical Details</label>
              <textarea name="medical_details" value={form.medical_details} onChange={handleChange} placeholder="Brief description of medical condition and urgency..." style={styles.textarea} rows={4} />
            </div>
          </div>

          {/* Disclaimer */}
          <div style={styles.disclaimer}>
            <p style={styles.disclaimerText}>
              ⚠️ By posting this request, you understand that RaktaSeva only facilitates
              connections between patients and willing donors. All medical procedures must
              be conducted through licensed medical professionals and hospitals in Sri Lanka.
            </p>
          </div>

          {/* Buttons */}
          <div style={styles.submitRow}>
            <button type="button" style={styles.cancelBtn} onClick={() => navigate('/kidney')}>
              Cancel
            </button>
            <button type="submit" style={loading ? styles.submitBtnDisabled : styles.submitBtn} disabled={loading}>
              <Heart size={18} />
              {loading ? 'Posting...' : 'Post Kidney Request'}
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
  backBtn: { width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', color: '#2C3E50' },
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
  disclaimer: { backgroundColor: '#FEF9E7', border: '1px solid #F39C12', borderRadius: '12px', padding: '16px 20px' },
  disclaimerText: { color: '#7D6608', fontSize: '14px', lineHeight: '1.6' },
  submitRow: { display: 'flex', justifyContent: 'flex-end', gap: '12px' },
  cancelBtn: { padding: '14px 28px', borderRadius: '10px', border: '2px solid #E8E8E8', backgroundColor: 'white', color: '#7F8C8D', fontSize: '15px', fontWeight: '500', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  submitBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '10px', backgroundColor: '#8E44AD', color: 'white', fontSize: '15px', fontWeight: '500', cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif' },
  submitBtnDisabled: { display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '10px', backgroundColor: '#A569BD80', color: 'white', fontSize: '15px', fontWeight: '500', cursor: 'not-allowed', border: 'none', fontFamily: 'DM Sans, sans-serif' },
};

export default PostKidneyRequest;