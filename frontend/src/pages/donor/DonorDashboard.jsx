import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Building2, CheckCircle, Clock, Droplets, Heart, MapPin,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { donorsAPI } from '../../services/api';
import Layout, { PageHeader } from '../../components/layout/Layout';
import { Badge, Button, Card, EmptyState, Spinner } from '../../components/ui';
import { getTimeAgo, URGENCY_LABELS, URGENCY_VARIANTS } from '../../utils/helpers';
import { getErrorMessage } from '../../utils/apiError';
import cards from '../../styles/Cards.module.css';
import styles from '../../styles/Dashboard.module.css';

const DonorDashboard = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [matchingRequests, setMatchingRequests] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingAvailability, setTogglingAvailability] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    Promise.all([donorsAPI.getMatchingRequests(), donorsAPI.getMyDonations()])
      .then(([requestRes, donationRes]) => {
        setMatchingRequests(requestRes.data);
        setDonations(donationRes.data);
      })
      .catch((error) => toast.error(getErrorMessage(error, 'Could not load your dashboard')))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleAvailability = async () => {
    const next = !user.is_available;
    setTogglingAvailability(true);
    try {
      await donorsAPI.updateAvailability(next);
      updateUser({ ...user, is_available: next });
      toast.success(next ? 'You are now shown as available.' : 'You are now shown as unavailable.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not update your availability'));
    } finally {
      setTogglingAvailability(false);
    }
  };

  const handleRespond = async (requestId) => {
    setBusyId(requestId);
    try {
      await donorsAPI.respond({ request_id: requestId, message: 'I am available to donate.' });
      toast.success('Response sent.');
      navigate('/my-donations');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not send your response'));
    } finally {
      setBusyId(null);
    }
  };

  const stats = [
    {
      label: 'Matching requests',
      value: matchingRequests.length,
      icon: <Droplets size={18} />,
      tint: styles.iconBlood,
    },
    {
      label: 'Total donations',
      value: donations.length,
      icon: <Heart size={18} />,
      tint: styles.iconAccent,
    },
    {
      label: 'Completed',
      value: donations.filter((donation) => donation.status === 'completed').length,
      icon: <CheckCircle size={18} />,
      tint: styles.iconSuccess,
    },
    {
      label: 'Pending',
      value: donations.filter((donation) => donation.status === 'pending').length,
      icon: <Clock size={18} />,
      tint: styles.iconWarning,
    },
  ];

  return (
    <Layout>
      <PageHeader
        title={`Welcome back, ${user?.full_name?.split(' ')[0] || ''}`}
        subtitle={`You are registered as a ${user?.blood_type} blood donor.`}
      />

      <div className={styles.availability}>
        <div className={styles.availabilityText}>
          <span
            className={`${styles.availabilityState} ${
              user?.is_available ? styles.availableOn : styles.availableOff
            }`}
          >
            {user?.is_available ? 'Available to donate' : 'Not currently available'}
          </span>
          <span className={styles.availabilityHint}>
            {user?.is_available
              ? 'Patients with a compatible blood type can see and contact you.'
              : 'You are hidden from new requests until you turn this back on.'}
          </span>
        </div>

        <span className={`${styles.switch} ${user?.is_available ? styles.switchOn : ''}`}>
          <input
            type="checkbox"
            className={styles.switchInput}
            checked={Boolean(user?.is_available)}
            onChange={handleToggleAvailability}
            disabled={togglingAvailability}
            aria-label="Available to donate"
          />
          <span className={styles.switchKnob} />
        </span>
      </div>

      <div className={styles.statGrid}>
        {stats.map((stat) => (
          <Card key={stat.label} padding="md">
            <div className={styles.stat}>
              <span className={`${styles.statIcon} ${stat.tint}`}>{stat.icon}</span>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          </Card>
        ))}
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Requests matching your blood type</h2>
          {matchingRequests.length > 3 && (
            <Button variant="ghost" size="sm" onClick={() => navigate('/matching-requests')}>
              View all {matchingRequests.length}
            </Button>
          )}
        </div>

        {loading ? (
          <Spinner label="Loading requests" />
        ) : matchingRequests.length === 0 ? (
          <EmptyState
            icon={<Droplets size={24} />}
            title="No compatible requests right now"
            description={`Nobody currently needs ${user?.blood_type}-compatible blood. New requests will appear here.`}
          />
        ) : (
          <div className={cards.grid}>
            {/* Only the three most recent — this is a summary, and the full list
              * lives one click away. */}
            {matchingRequests.slice(0, 3).map((request) => (
              <Card key={request.id} padding="lg">
                <div className={cards.tags}>
                  <span className={cards.bloodType}>{request.blood_type}</span>
                  <Badge variant={URGENCY_VARIANTS[request.urgency] || 'neutral'} dot>
                    {URGENCY_LABELS[request.urgency] || request.urgency}
                  </Badge>
                </div>

                <h3 className={cards.name}>{request.patient_name}</h3>
                <p className={cards.meta}>
                  {request.units_needed} unit{request.units_needed === 1 ? '' : 's'} needed
                </p>

                <div className={cards.details}>
                  <span className={cards.detail}>
                    <Building2 size={15} />
                    <span className={cards.detailValue}>{request.hospital_name}</span>
                  </span>
                  <span className={cards.detail}>
                    <MapPin size={15} />
                    <span className={cards.detailValue}>{request.city}</span>
                  </span>
                  <span className={cards.detail}>
                    <Clock size={15} />
                    <span className={cards.detailValue}>Posted {getTimeAgo(request.created_at)}</span>
                  </span>
                </div>

                <div className={cards.actions}>
                  <Button
                    variant="blood"
                    fullWidth
                    onClick={() => handleRespond(request.id)}
                    disabled={busyId === request.id}
                  >
                    <Heart size={15} /> I can donate
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default DonorDashboard;
