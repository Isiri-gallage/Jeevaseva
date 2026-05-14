import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { kidneyAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Layout from '../../components/layout/Layout';
import { Heart, ArrowLeft } from 'lucide-react';
import { BLOOD_TYPES } from '../../utils/helpers';

const RegisterKidneyDonor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    age: '',
    blood_type: user?.blood_type || '',
    contact_number: user?.phone || '',
    city: user?.city || '',
    medical_conditions: '',
    reason_to_donate: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await kidneyAPI.registerDonor({
        ...form,
        age: parseInt(form.age),
      });
      toast.success('Registered as kidney donor successfully! 🫀');
      navigate('/kidney');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to register');
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
            <h1 style={styles.headerTitle}>Register as Kidney Donor</h1>
            <p style={styles.headerSubtitle}>Express your willingness to donate a kidney</p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div style={styles.infoCard}>
        <Heart size={24} color="#8E44AD" />
        <div>
          <h3 style={styles.infoTitle}>What does this mean?</h3>
          <p style={styles.infoText}>
            Registering as a kidney donor means you are <strong>willing to be contacted</strong> by
            patients who need a kidney. This does not commit you to anything. All decisions are
            made between you, the patient, and medical professionals.
          </p>
        </div>
      </div>

      <div style={styles.formCard}>
        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Personal Info */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Personal Information</h2>
            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name *</label>
                <input type="text" name="full_name" value={form.full_name} onChange={handleChange} style={styles.input} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Age *</label>
                <input type="number" name="age" value={form.age} onChange={handleChange} placeholder="Your age" style={styles.input} required min="18" max="65" />
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
            <div style={styles.inputGroup}>
              <label style={styles.label}>City *</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="Your city" style={styles.input} required />
            </div>
          </div>

          {/* Medical Info */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Medical Information</h2>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Any Medical Conditions</label>
              <textarea name="medical_conditions" value={form.medical_conditions} onChange={handleChange} placeholder="List any medical conditions (optional)..." style={styles.textarea} rows={3} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Reason to Donate</label>
              <textarea name="reason_to_donate" value={form.reason_to_donate} onChange={handleChange} placeholder="Why do you want to donate? (optional)..." style={styles.textarea} rows={3} />
            </div>
          </div>

          {/* Disclaimer */}
          <div style={styles.disclaimer}>
            <p style={styles.disclaimerText}>
              ⚠️ By registering, you confirm that you are voluntarily expressing interest
              in kidney donation. RaktaSeva does not conduct medical evaluations.
              All medical procedures must be done through licensed hospitals in Sri Lanka.
              You can withdraw your registration at any time.
            </p>
          </div>

          <div style={styles.submitRow}>
            <button type="button" style={styles.cancelBtn} onClick={() => navigate('/kidney')}>
              Cancel
            </button>
            <button type="submit" style={loading ? styles.submitBtnDisabled : styles.submitBtn} disabled={loading}>
              <Heart size={18} />
              {loading ? 'Registering...' : 'Register as Kidney Donor'}
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
  infoCard: { display: 'flex', alignItems: 'flex-start', gap: '16px', backgroundColor: '#F5EEF8', borderRadius: '12px', padding: '20px', marginBottom: '24px', border: '1px solid #D7BDE2' },
  infoTitle: { fontSize: '16px', fontFamily: 'Playfair Display, serif', color: '#6C3483', marginBottom: '8px' },
  infoText: { color: '#7D3C98', fontSize: '14px', lineHeight: '1.6' },
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

export default RegisterKidneyDonor;