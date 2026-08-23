import { useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, Droplets, Edit2, Heart, Monitor, Moon, Shield, Sun, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { authAPI } from '../../services/api';
import Layout, { PageHeader } from '../../components/layout/Layout';
import { Badge, Button, Card, Input, Select } from '../../components/ui';
import { BLOOD_TYPES } from '../../utils/helpers';
import { getErrorMessage, getFieldErrors } from '../../utils/apiError';
import styles from './Profile.module.css';

/*
 * Three options rather than a two-way toggle.
 *
 * "System" is a distinct choice from light or dark: it means "keep following
 * the OS", which a binary switch cannot express once the user has picked a
 * side. ThemeContext already stores the preference this way.
 */
const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: <Sun size={15} /> },
  { value: 'dark', label: 'Dark', icon: <Moon size={15} /> },
  { value: 'system', label: 'System', icon: <Monitor size={15} /> },
];

const roleOf = (user) => {
  if (user?.is_admin) return { key: 'admin', label: 'Administrator' };
  if (user?.is_donor) return { key: 'donor', label: 'Living donor' };
  return { key: 'patient', label: 'Patient' };
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { preference, setTheme } = useTheme();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    blood_type: user?.blood_type || '',
  });

  const role = roleOf(user);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => (previous[name] ? { ...previous, [name]: undefined } : previous));
  };

  const startEditing = () => {
    // Reset the draft from the current user, so cancelling and reopening does
    // not resurrect abandoned edits.
    setForm({
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      city: user?.city || '',
      blood_type: user?.blood_type || '',
    });
    setErrors({});
    setEditing(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const { data } = await authAPI.updateProfile(form);
      updateUser(data);
      toast.success('Profile updated.');
      setEditing(false);
    } catch (error) {
      setErrors(getFieldErrors(error));
      toast.error(getErrorMessage(error, 'Could not update your profile'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Profile"
        subtitle="Your account details and how you appear to other people on the platform."
        actions={
          !editing && (
            <Button variant="secondary" onClick={startEditing}>
              <Edit2 size={16} /> Edit profile
            </Button>
          )
        }
      />

      <div className={styles.layout}>

        {/* ─── Identity ───────────────────────────────────── */}
        <Card padding="lg">
          <div className={styles.identity}>
            <span
              className={[
                styles.avatar,
                role.key === 'admin' && styles.avatarAdmin,
                role.key === 'patient' && styles.avatarPatient,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {user?.full_name?.charAt(0).toUpperCase() || '?'}
            </span>

            <span className={styles.name}>{user?.full_name}</span>
            <span className={styles.email}>{user?.email}</span>

            <div className={styles.badges}>
              <Badge variant="blood"><Droplets size={12} /> {user?.blood_type}</Badge>
              <Badge variant="neutral">{role.label}</Badge>
              {user?.is_verified && (
                <Badge variant="success"><CheckCircle size={12} /> Verified</Badge>
              )}
              {user?.is_admin && (
                <Badge variant="warning"><Shield size={12} /> Admin</Badge>
              )}
              {user?.is_donor && (
                <Badge variant="accent"><Heart size={12} /> Donor</Badge>
              )}
            </div>
          </div>
        </Card>

        {/* ─── Details ────────────────────────────────────── */}
        <Card padding="lg">
          {editing ? (
            <form onSubmit={handleSave}>
              <h2 className={styles.sectionTitle}>Edit details</h2>

              <div className={styles.fields}>
                <Input
                  label="Full name"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  error={errors.full_name}
                  required
                />
                <Input
                  label="Phone number"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  hint="10 digits"
                  required
                />
                <Select
                  label="Blood type"
                  name="blood_type"
                  value={form.blood_type}
                  onChange={handleChange}
                  error={errors.blood_type}
                  options={BLOOD_TYPES}
                  placeholder="Select"
                />
                <Input
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  error={errors.city}
                />
              </div>

              <div className={styles.actions}>
                <Button type="submit" loading={loading}>Save changes</Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditing(false)}
                  disabled={loading}
                >
                  <X size={16} /> Cancel
                </Button>
              </div>
            </form>
          ) : (
            <>
              <h2 className={styles.sectionTitle}>Personal details</h2>

              <div className={styles.fields}>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Full name</span>
                  <span className={styles.fieldValue}>{user?.full_name}</span>
                </div>

                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Email</span>
                  <span className={styles.fieldValue}>{user?.email}</span>
                  <span className={styles.fieldNote}>Email cannot be changed</span>
                </div>

                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Phone</span>
                  <span className={styles.fieldValue}>{user?.phone}</span>
                </div>

                <div className={styles.field}>
                  <span className={styles.fieldLabel}>City</span>
                  <span className={styles.fieldValue}>{user?.city || 'Not set'}</span>
                </div>

                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Blood type</span>
                  <span className={styles.fieldValue}>{user?.blood_type}</span>
                </div>
              </div>

              <div className={styles.divider} />

              <h2 className={styles.sectionTitle}>Account status</h2>

              <div className={styles.tiles}>
                <div className={styles.tile}>
                  <span className={styles.tileLabel}>Account</span>
                  <span
                    className={`${styles.tileValue} ${user?.is_active ? styles.tileOk : styles.tileWarn}`}
                  >
                    {user?.is_active ? 'Active' : 'Suspended'}
                  </span>
                </div>

                <div className={styles.tile}>
                  <span className={styles.tileLabel}>Verification</span>
                  <span
                    className={`${styles.tileValue} ${user?.is_verified ? styles.tileOk : styles.tileWarn}`}
                  >
                    {user?.is_verified ? 'Verified' : 'Not verified'}
                  </span>
                </div>

                <div className={styles.tile}>
                  <span className={styles.tileLabel}>Role</span>
                  <span className={`${styles.tileValue} ${styles.tileMuted}`}>{role.label}</span>
                </div>

                <div className={styles.tile}>
                  <span className={styles.tileLabel}>Donor status</span>
                  <span
                    className={`${styles.tileValue} ${user?.is_donor ? styles.tileOk : styles.tileMuted}`}
                  >
                    {user?.is_donor ? 'Registered' : 'Not a donor'}
                  </span>
                </div>
              </div>

              {/* ─── Appearance ───────────────────────────
                * Moved here from the sidebar. Theme is a set-once preference,
                * not something worth a permanent slot in primary navigation. */}
              <h2 className={styles.sectionTitle}>Appearance</h2>

              <div
                className={styles.settingRow}
                role="radiogroup"
                aria-label="Appearance"
              >
                <div>
                  <span className={styles.settingLabel}>Theme</span>
                  <span className={styles.settingHint}>
                    Choose a light or dark appearance, or follow your device
                    setting automatically.
                  </span>
                </div>

                <div className={styles.segmented}>
                  {THEME_OPTIONS.map((option) => {
                    const active = preference === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        className={[styles.segment, active && styles.segmentActive]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => setTheme(option.value)}
                      >
                        {option.icon}
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
