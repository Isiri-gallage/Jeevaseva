import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Heart, Lock, Mail, MapPin, Phone, User } from 'lucide-react';
import { authAPI } from '../../services/api';
import { Button, Input, Select } from '../../components/ui';
import { BLOOD_TYPES } from '../../utils/helpers';
import { getErrorMessage, getFieldErrors } from '../../utils/apiError';
import styles from './Auth.module.css';

const STEPS = [
  'Create your account',
  'Add your blood type and city',
  'Post a request or offer to donate',
  'Connect and coordinate privately',
];

const Register = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    blood_type: '',
    is_donor: false,
    city: '',
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((previous) => ({ ...previous, [name]: type === 'checkbox' ? checked : value }));
    setErrors((previous) => (previous[name] ? { ...previous, [name]: undefined } : previous));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // city is optional server-side; send undefined rather than "" so the
      // backend stores NULL instead of an empty string.
      await authAPI.register({ ...form, city: form.city.trim() || undefined });
      toast.success('Account created. Please sign in.');
      navigate('/login');
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      setErrors(fieldErrors);
      toast.error(getErrorMessage(error, 'Registration failed'));
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
          <h1 className={styles.asideTitle}>Four steps to your first connection.</h1>

          <div className={styles.steps}>
            {STEPS.map((step, index) => (
              <div key={step} className={styles.step}>
                <span className={styles.stepNumber}>{index + 1}</span>
                {step}
              </div>
            ))}
          </div>
        </div>

        <p className={styles.asideFoot}>
          Registering does not commit you to anything. You choose whether to
          respond to a request, and you can withdraw at any point.
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

          <h2 className={styles.title}>Create your account</h2>
          <p className={styles.subtitle}>Free, and takes about a minute.</p>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <Input
              label="Full name"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              error={errors.full_name}
              placeholder="Nimal Perera"
              icon={<User size={16} />}
              autoComplete="name"
              autoFocus
              required
            />

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
              required
            />

            <Input
              label="Phone number"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              error={errors.phone}
              hint="10 digits, e.g. 0771234567"
              placeholder="0771234567"
              icon={<Phone size={16} />}
              autoComplete="tel"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              hint="At least 8 characters, including a letter and a number"
              placeholder="••••••••"
              icon={<Lock size={16} />}
              autoComplete="new-password"
              required
            />

            <div className={styles.row}>
              <Select
                label="Blood type"
                name="blood_type"
                value={form.blood_type}
                onChange={handleChange}
                error={errors.blood_type}
                options={BLOOD_TYPES}
                placeholder="Select"
                required
              />

              <Input
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                error={errors.city}
                placeholder="Colombo"
                icon={<MapPin size={16} />}
                autoComplete="address-level2"
              />
            </div>

            {/* The whole card is the label, so tapping anywhere in it toggles
              * the checkbox — a much larger target than the 18px box alone. */}
            <label
              className={[styles.checkboxCard, form.is_donor && styles.checkboxCardChecked]
                .filter(Boolean)
                .join(' ')}
            >
              <input
                type="checkbox"
                name="is_donor"
                checked={form.is_donor}
                onChange={handleChange}
                className={styles.checkbox}
              />
              <span>
                <span className={styles.checkboxLabel}>
                  I am willing to donate
                </span>
                <span className={styles.checkboxHint}>
                  Shows you compatible requests and lets patients find you. You
                  are never obliged to respond, and you can turn this off later.
                </span>
              </span>
            </label>

            <Button type="submit" size="lg" loading={loading} fullWidth>
              Create account <ArrowRight size={17} />
            </Button>
          </form>

          <p className={styles.switch}>
            Already registered?{' '}
            <Link to="/login" className={styles.link}>Sign in</Link>
          </p>

          <Link to="/" className={styles.backHome}>
            <ArrowLeft size={15} /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
