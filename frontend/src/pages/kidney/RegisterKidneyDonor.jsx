import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, HeartHandshake } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { kidneyAPI } from '../../services/api';
import Layout, { PageHeader } from '../../components/layout/Layout';
import { Button, Input, Select, Textarea } from '../../components/ui';
import { BLOOD_TYPES } from '../../utils/helpers';
import { getErrorMessage, getFieldErrors } from '../../utils/apiError';
import styles from '../../styles/FormPage.module.css';

const RegisterKidneyDonor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  // Prefilled from the account so the donor is not retyping what we already
  // know. Every value stays editable.
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    age: '',
    blood_type: user?.blood_type || '',
    contact_number: user?.phone || '',
    city: user?.city || '',
    medical_conditions: '',
    reason_to_donate: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => (previous[name] ? { ...previous, [name]: undefined } : previous));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await kidneyAPI.registerDonor({ ...form, age: Number(form.age) });
      toast.success('You are registered as a living donor.');
      navigate('/kidney');
    } catch (error) {
      setErrors(getFieldErrors(error));
      toast.error(getErrorMessage(error, 'Could not complete registration'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Register as a living donor"
        subtitle="Add yourself to the donor directory so patients know someone is willing to help."
        actions={
          <Button variant="ghost" onClick={() => navigate('/kidney')}>
            <ArrowLeft size={16} /> Back to board
          </Button>
        }
      />

      <div className={styles.wrap}>
        <div className={styles.callout}>
          <HeartHandshake size={18} />
          <div>
            <p className={styles.calloutTitle}>Registering commits you to nothing</p>
            <p className={styles.calloutText}>
              It means you are willing to be contacted. You decide whether to
              respond to any request, you can withdraw at any time, and every
              medical and legal decision happens between you, the patient, and a
              transplant centre — never on this platform.
            </p>
          </div>
        </div>

        <div className={styles.card}>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>About you</h2>

              <div className={styles.row}>
                <Input
                  label="Full name"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  error={errors.full_name}
                  placeholder="Your full name"
                  required
                />
                <Input
                  label="Age"
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  error={errors.age}
                  placeholder="Years"
                  min={18}
                  max={100}
                  hint="Living donors must be 18 or over"
                  required
                />
              </div>

              <div className={styles.row}>
                <Select
                  label="Blood type"
                  name="blood_type"
                  value={form.blood_type}
                  onChange={handleChange}
                  error={errors.blood_type}
                  options={BLOOD_TYPES}
                  placeholder="Select blood type"
                  required
                />
                <Input
                  label="Contact number"
                  type="tel"
                  name="contact_number"
                  value={form.contact_number}
                  onChange={handleChange}
                  error={errors.contact_number}
                  hint="Shared only with a patient you connect with"
                  placeholder="0771234567"
                  required
                />
              </div>

              <Input
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                error={errors.city}
                hint="Helps patients find donors near their hospital"
                placeholder="Colombo"
                required
              />
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Medical background</h2>

              <Textarea
                label="Existing medical conditions"
                name="medical_conditions"
                value={form.medical_conditions}
                onChange={handleChange}
                error={errors.medical_conditions}
                hint="Optional. A transplant centre will assess you properly — this is only for context."
                placeholder="e.g. none known"
                rows={3}
              />

              <Textarea
                label="Why you want to donate"
                name="reason_to_donate"
                value={form.reason_to_donate}
                onChange={handleChange}
                error={errors.reason_to_donate}
                hint="Optional. Shown on your donor card."
                placeholder="Share as much or as little as you like…"
                rows={3}
              />
            </section>

            <div className={`${styles.actions} ${styles.actionsEnd}`}>
              <Button type="submit" loading={loading}>
                Register as donor
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate('/kidney')}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterKidneyDonor;
