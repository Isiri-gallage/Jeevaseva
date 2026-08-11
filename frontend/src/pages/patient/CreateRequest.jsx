import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { requestsAPI } from '../../services/api';
import Layout, { PageHeader } from '../../components/layout/Layout';
import { Button, Input, Select, Textarea } from '../../components/ui';
import { BLOOD_TYPES, URGENCY_LABELS, URGENCY_LEVELS } from '../../utils/helpers';
import { getErrorMessage, getFieldErrors } from '../../utils/apiError';
import styles from '../../styles/FormPage.module.css';

const URGENCY_OPTIONS = URGENCY_LEVELS.map((level) => ({
  value: level,
  label: URGENCY_LABELS[level],
}));

const CreateRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
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
      await requestsAPI.create({ ...form, units_needed: Number(form.units_needed) });
      toast.success('Request posted. Compatible donors have been notified.');
      navigate('/my-requests');
    } catch (error) {
      setErrors(getFieldErrors(error));
      toast.error(getErrorMessage(error, 'Could not create the request'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Request blood"
        subtitle="Post an emergency request. Donors with a compatible blood type in your area will see it."
        actions={
          <Button variant="ghost" onClick={() => navigate('/my-requests')}>
            <ArrowLeft size={16} /> My requests
          </Button>
        }
      />

      <div className={styles.wrap}>
        <div className={styles.callout}>
          <AlertCircle size={18} />
          <div>
            <p className={styles.calloutTitle}>For life-threatening emergencies, call 1990 first</p>
            <p className={styles.calloutText}>
              RaktaSeva helps you find donors, but it is not an emergency service
              and nobody is guaranteed to respond. Contact your hospital&apos;s
              blood bank in parallel.
            </p>
          </div>
        </div>

        <div className={styles.card}>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>What is needed</h2>

              <div className={styles.rowThree}>
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
                  label="Units needed"
                  type="number"
                  name="units_needed"
                  value={form.units_needed}
                  onChange={handleChange}
                  error={errors.units_needed}
                  min={1}
                  max={20}
                  required
                />
                <Select
                  label="Urgency"
                  name="urgency"
                  value={form.urgency}
                  onChange={handleChange}
                  error={errors.urgency}
                  options={URGENCY_OPTIONS}
                  required
                />
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Hospital</h2>

              <Input
                label="Hospital name"
                name="hospital_name"
                value={form.hospital_name}
                onChange={handleChange}
                error={errors.hospital_name}
                placeholder="National Hospital Colombo"
                required
              />

              <div className={styles.row}>
                <Input
                  label="Hospital address"
                  name="hospital_address"
                  value={form.hospital_address}
                  onChange={handleChange}
                  error={errors.hospital_address}
                  placeholder="Street address"
                  required
                />
                <Input
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  error={errors.city}
                  hint="Used to find donors nearby"
                  placeholder="Colombo"
                  required
                />
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Patient</h2>

              <div className={styles.row}>
                <Input
                  label="Patient name"
                  name="patient_name"
                  value={form.patient_name}
                  onChange={handleChange}
                  error={errors.patient_name}
                  placeholder="Full name"
                  required
                />
                <Input
                  label="Contact number"
                  type="tel"
                  name="contact_number"
                  value={form.contact_number}
                  onChange={handleChange}
                  error={errors.contact_number}
                  placeholder="0771234567"
                  required
                />
              </div>

              <Textarea
                label="Additional notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                error={errors.notes}
                hint="Optional — ward number, visiting hours, who to ask for"
                placeholder="Anything that helps a donor find you…"
                rows={3}
              />
            </section>

            <div className={`${styles.actions} ${styles.actionsEnd}`}>
              <Button type="submit" loading={loading}>Post request</Button>
              <Button type="button" variant="ghost" onClick={() => navigate('/my-requests')}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateRequest;
