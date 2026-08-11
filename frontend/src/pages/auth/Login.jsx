import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Heart, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/ui';
import { getErrorMessage, getFieldErrors } from '../../utils/apiError';
import styles from './Auth.module.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    // Clear this field's error as soon as the user edits it — leaving a stale
    // error under a field they are actively fixing is needlessly discouraging.
    setErrors((previous) => (previous[name] ? { ...previous, [name]: undefined } : previous));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.full_name.split(' ')[0]}`);

      if (user.is_admin) navigate('/admin');
      else navigate('/kidney');
    } catch (error) {
      setErrors(getFieldErrors(error));
      toast.error(getErrorMessage(error, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>

      {/* ─── Brand panel ────────────────────────────────── */}
      <aside className={styles.aside}>
        <Link to="/" className={styles.asideBrand}>
          <span className={styles.asideMark}>
            <Heart size={17} fill="currentColor" />
          </span>
          RaktaSeva
        </Link>

        <div className={styles.asideBody}>
          <h1 className={styles.asideTitle}>
            Somebody is waiting for the message you send today.
          </h1>
          <p className={styles.asideText}>
            Sign in to check your matches, answer a request, or continue a
            conversation you have already started.
          </p>
        </div>

        <p className={styles.asideFoot}>
          RaktaSeva is a free, non-commercial platform. All transplants proceed
          through registered Sri Lankan hospitals.
        </p>

        <span className={styles.asideGlyph} aria-hidden="true">🫀</span>
      </aside>

      {/* ─── Form ───────────────────────────────────────── */}
      <div className={styles.formSide}>
        <div className={styles.formWrap}>
          <Link to="/" className={styles.mobileBrand}>
            <span className={styles.mobileMark}>
              <Heart size={15} fill="currentColor" />
            </span>
            RaktaSeva
          </Link>

          <h2 className={styles.title}>Welcome back</h2>
          <p className={styles.subtitle}>Sign in to your account to continue.</p>

          {/* noValidate turns off the browser's own bubbles so our styled,
            * screen-reader-linked errors are the only ones shown. */}
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <Input
              label="Email address"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="you@example.com"
              icon={<Mail size={16} />}
              autoComplete="email"
              // Focuses the first field on load so a keyboard user can start
              // typing immediately.
              autoFocus
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
              icon={<Lock size={16} />}
              autoComplete="current-password"
              required
            />

            <Button type="submit" size="lg" loading={loading} fullWidth>
              Sign in <ArrowRight size={17} />
            </Button>
          </form>

          <p className={styles.switch}>
            New to RaktaSeva?{' '}
            <Link to="/register" className={styles.link}>Create an account</Link>
          </p>

          <Link to="/" className={styles.backHome}>
            <ArrowLeft size={15} /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
