import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { kidneyAPI } from '../../services/api';
import Layout, { PageHeader } from '../../components/layout/Layout';
import { Button, Input, Select, Textarea } from '../../components/ui';
import { BLOOD_TYPES } from '../../utils/helpers';
import { getErrorMessage, getFieldErrors } from '../../utils/apiError';
import styles from '../../styles/FormPage.module.css';

const PostKidneyRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
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
      await kidneyAPI.createRequest({
        ...form,
        // The input yields a string; the API expects an integer.
        patient_age: Number(form.patient_age),
      });
      toast.success('Request posted. Compatible donors can now see it.');
      navigate('/kidney/my-requests');
    } catch (error) {
      setErrors(getFieldErrors(error));
      toast.error(getErrorMessage(error, 'Could not post your request'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Post a kidney request"
        subtitle="Share what you need so living donors can find you. Only the details you enter here are shown publicly."
        actions={
          <Button variant="ghost" onClick={() => navigate('/kidney')}>
            <ArrowLeft size={16} /> Back to board
          </Button>
        }
      />

      <div className={styles.wrap}>
        <div className={styles.callout}>
          <AlertCircle size={18} />
          <div>
            <p className={styles.calloutTitle}>This is visible to other users</p>
            <p className={styles.calloutText}>
              Your name, age, blood type, hospital, and city appear on the public
              board. Your contact number is only shared once you accept a donor.
            </p>
          </div>
        </div>

        <div className={styles.card}>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>

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
                  label="Age"
                  type="number"
                  name="patient_age"
                  value={form.patient_age}
                  onChange={handleChange}
                  error={errors.patient_age}
                  placeholder="Years"
                  min={1}
                  max={120}
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
                  hint="Shared only after you accept a donor"
                  placeholder="0771234567"
                  required
                />
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Hospital</h2>

              <div className={styles.row}>
                <Input
                  label="Hospital name"
                  name="hospital_name"
                  value={form.hospital_name}
                  onChange={handleChange}
                  error={errors.hospital_name}
                  placeholder="National Hospital Colombo"
                  required
                />
                <Input
                  label="City"
                  name="hospital_city"
                  value={form.hospital_city}
                  onChange={handleChange}
                  error={errors.hospital_city}
                  placeholder="Colombo"
                  required
                />
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Medical background</h2>

              <Input
                label="Time on dialysis"
                name="dialysis_duration"
                value={form.dialysis_duration}
                onChange={handleChange}
                error={errors.dialysis_duration}
                hint="Optional, but it helps donors understand your situation"
                placeholder="e.g. 2 years"
              />

              <Textarea
                label="Anything else donors should know"
                name="medical_details"
                value={form.medical_details}
                onChange={handleChange}
                error={errors.medical_details}
                hint="Optional. Do not include information you would not want a stranger to read."
                placeholder="Briefly describe your situation…"
                rows={4}
              />
            </section>

            <div className={`${styles.actions} ${styles.actionsEnd}`}>
              <Button type="submit" loading={loading}>
                Post request
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

export default PostKidneyRequest;
