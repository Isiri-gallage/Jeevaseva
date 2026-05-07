import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { BLOOD_TYPES } from '../../utils/helpers';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    blood_type: '',
    is_donor: false,
    city: '',
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.register(form);
      toast.success('Account created successfully! Please login 🩸');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Left Side */}
      <div style={styles.left}>
        <div style={styles.leftContent}>
          <div style={styles.logo}>🩸 RaktaSeva</div>
          <h1 style={styles.leftTitle}>Join the <br />Movement</h1>
          <p style={styles.leftSubtitle}>
            Every donor is a hero. Register today and be ready to save a life when it matters most.
          </p>
          <div style={styles.steps}>
            {[
              'Create your account',
              'Set your blood type',
              'Register as donor',
              'Start saving lives',
            ].map((step, i) => (
              <div key={i} style={styles.step}>
                <div style={styles.stepNumber}>{i + 1}</div>
                <span style={styles.stepText}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div style={styles.right}>
        <div style={styles.formContainer}>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join RaktaSeva and save lives</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Full Name */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Your full name"
                style={styles.input}
                required
              />
            </div>

            {/* Email */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                style={styles.input}
                required
              />
            </div>

            {/* Phone */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="07XXXXXXXX"
                style={styles.input}
                required
              />
            </div>

            {/* Password */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={styles.input}
                required
              />
            </div>

            {/* Blood Type + City Row */}
            <div style={styles.row}>
              <div style={{ ...styles.inputGroup, flex: 1 }}>
                <label style={styles.label}>Blood Type</label>
                <select
                  name="blood_type"
                  value={form.blood_type}
                  onChange={handleChange}
                  style={styles.input}
                  required
                >
                  <option value="">Select</option>
                  {BLOOD_TYPES.map(bt => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>
              <div style={{ ...styles.inputGroup, flex: 1 }}>
                <label style={styles.label}>City</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Colombo"
                  style={styles.input}
                />
              </div>
            </div>

            {/* Donor Checkbox */}
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                name="is_donor"
                id="is_donor"
                checked={form.is_donor}
                onChange={handleChange}
                style={styles.checkbox}
              />
              <label htmlFor="is_donor" style={styles.checkboxLabel}>
                ❤️ Register me as a blood donor
              </label>
            </div>

            <button
              type="submit"
              style={loading ? styles.btnDisabled : styles.btn}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>

          <p style={styles.switchText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.link}>Login here</Link>
          </p>

          <Link to="/" style={styles.backLink}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh' },
  left: {
    flex: 1,
    background: 'linear-gradient(135deg, #922B21 0%, #C0392B 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
  },
  leftContent: { color: 'white', maxWidth: '400px' },
  logo: {
    fontSize: '22px',
    fontFamily: 'Playfair Display, serif',
    marginBottom: '40px',
    opacity: 0.9,
  },
  leftTitle: {
    fontSize: '52px',
    fontFamily: 'Playfair Display, serif',
    fontWeight: '900',
    lineHeight: '1.1',
    marginBottom: '20px',
  },
  leftSubtitle: {
    fontSize: '16px',
    opacity: 0.85,
    lineHeight: '1.7',
    marginBottom: '40px',
  },
  steps: { display: 'flex', flexDirection: 'column', gap: '16px' },
  step: { display: 'flex', alignItems: 'center', gap: '16px' },
  stepNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    flexShrink: 0,
  },
  stepText: { fontSize: '15px', opacity: 0.9 },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 60px',
    backgroundColor: '#FDFEFE',
    overflowY: 'auto',
  },
  formContainer: { width: '100%', maxWidth: '420px' },
  title: {
    fontSize: '36px',
    fontFamily: 'Playfair Display, serif',
    color: '#2C3E50',
    marginBottom: '8px',
  },
  subtitle: { color: '#7F8C8D', marginBottom: '32px', fontSize: '15px' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: '500', color: '#2C3E50' },
  input: {
    padding: '13px 16px',
    borderRadius: '10px',
    border: '2px solid #E8E8E8',
    fontSize: '15px',
    fontFamily: 'DM Sans, sans-serif',
    backgroundColor: '#F2F3F4',
    width: '100%',
  },
  row: { display: 'flex', gap: '16px' },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#FADBD8',
    borderRadius: '10px',
  },
  checkbox: { width: '18px', height: '18px', cursor: 'pointer' },
  checkboxLabel: { fontSize: '15px', color: '#C0392B', fontWeight: '500', cursor: 'pointer' },
  btn: {
    padding: '16px',
    backgroundColor: '#C0392B',
    color: 'white',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
    marginTop: '8px',
    boxShadow: '0 4px 16px rgba(192,57,43,0.3)',
  },
  btnDisabled: {
    padding: '16px',
    backgroundColor: '#E74C3C80',
    color: 'white',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'not-allowed',
    fontFamily: 'DM Sans, sans-serif',
    marginTop: '8px',
  },
  switchText: { textAlign: 'center', marginTop: '24px', color: '#7F8C8D', fontSize: '15px' },
  link: { color: '#C0392B', fontWeight: '600' },
  backLink: { display: 'block', textAlign: 'center', marginTop: '16px', color: '#95A5A6', fontSize: '14px' },
};

export default Register;