import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.full_name}! 🩸`);
      if (user.is_admin) navigate('/admin');
      else if (user.is_donor) navigate('/donor-dashboard');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed!');
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
          <h1 style={styles.leftTitle}>
            Serving Life <br />Through Blood
          </h1>
          <p style={styles.leftSubtitle}>
            Join thousands of donors saving lives across Sri Lanka every day.
          </p>
          <div style={styles.bloodDrop}>🩸</div>
        </div>
      </div>

      {/* Right Side */}
      <div style={styles.right}>
        <div style={styles.formContainer}>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Login to your RaktaSeva account</p>

          <form onSubmit={handleSubmit} style={styles.form}>
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

            <button
              type="submit"
              style={loading ? styles.btnDisabled : styles.btn}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login →'}
            </button>
          </form>

          <p style={styles.switchText}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.link}>
              Register here
            </Link>
          </p>

          <Link to="/" style={styles.backLink}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
  },
  left: {
    flex: 1,
    background: 'linear-gradient(135deg, #C0392B 0%, #922B21 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
  },
  leftContent: {
    color: 'white',
    maxWidth: '400px',
  },
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
  bloodDrop: {
    fontSize: '100px',
  },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
    backgroundColor: '#FDFEFE',
  },
  formContainer: {
    width: '100%',
    maxWidth: '420px',
  },
  title: {
    fontSize: '36px',
    fontFamily: 'Playfair Display, serif',
    color: '#2C3E50',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#7F8C8D',
    marginBottom: '40px',
    fontSize: '15px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#2C3E50',
  },
  input: {
    padding: '14px 16px',
    borderRadius: '10px',
    border: '2px solid #E8E8E8',
    fontSize: '15px',
    fontFamily: 'DM Sans, sans-serif',
    transition: 'border-color 0.2s',
    backgroundColor: '#F2F3F4',
  },
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
  switchText: {
    textAlign: 'center',
    marginTop: '24px',
    color: '#7F8C8D',
    fontSize: '15px',
  },
  link: {
    color: '#C0392B',
    fontWeight: '600',
  },
  backLink: {
    display: 'block',
    textAlign: 'center',
    marginTop: '16px',
    color: '#95A5A6',
    fontSize: '14px',
  },
};

export default Login;