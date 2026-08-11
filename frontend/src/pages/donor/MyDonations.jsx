import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  AlertCircle, CheckCircle, Clock, Heart, MessageCircle, XCircle,
} from 'lucide-react';
import { donorsAPI } from '../../services/api';
import Layout, { PageHeader } from '../../components/layout/Layout';
import { Badge, Button, Card, EmptyState, Spinner, Tabs } from '../../components/ui';
import { DONATION_STATUS_VARIANTS, getTimeAgo } from '../../utils/helpers';
import { getErrorMessage } from '../../utils/apiError';
import cards from '../../styles/Cards.module.css';
import styles from './MyDonations.module.css';

const STATUSES = [
  { id: 'pending', label: 'Pending', icon: <Clock size={16} /> },
  { id: 'confirmed', label: 'Confirmed', icon: <AlertCircle size={16} /> },
  { id: 'completed', label: 'Completed', icon: <CheckCircle size={16} /> },
  { id: 'cancelled', label: 'Cancelled', icon: <XCircle size={16} /> },
];

const MyDonations = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    donorsAPI.getMyDonations()
      .then((res) => setDonations(res.data))
      .catch((error) => toast.error(getErrorMessage(error, 'Could not load your donations')))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateStatus = async (id, status) => {
    if (status === 'cancelled' && !window.confirm('Cancel this donation? The patient will be notified.')) {
      return;
    }

    setBusyId(id);
    try {
      await donorsAPI.updateDonation(id, { status });
      toast.success(`Donation marked as ${status}.`);
      setDonations((previous) =>
        previous.map((donation) => (donation.id === id ? { ...donation, status } : donation))
      );
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not update the donation'));
    } finally {
      setBusyId(null);
    }
  };

  const counts = useMemo(() => {
    const byStatus = donations.reduce((accumulator, donation) => {
      accumulator[donation.status] = (accumulator[donation.status] || 0) + 1;
      return accumulator;
    }, {});
    return { all: donations.length, ...byStatus };
  }, [donations]);

  const visible = useMemo(
    () => (filter === 'all' ? donations : donations.filter((d) => d.status === filter)),
    [donations, filter]
  );

  const tabs = [
    { id: 'all', label: 'All', count: counts.all },
    ...STATUSES.map((status) => ({
      id: status.id,
      label: status.label,
      count: counts[status.id] || 0,
    })),
  ];

  return (
    <Layout>
      <PageHeader
        title="My donations"
        subtitle={loading ? undefined : `${donations.length} response${donations.length === 1 ? '' : 's'} to blood requests`}
        actions={
          <Button variant="secondary" onClick={() => navigate('/matching-requests')}>
            Find requests
          </Button>
        }
      />

      {/* Summary tiles across the four lifecycle states. */}
      <div className={styles.stats}>
        {STATUSES.map((status) => (
          <Card key={status.id} padding="sm" variant="flat">
            <div className={styles.statTop}>
              <span className={styles.statIcon}>{status.icon}</span>
              <span className={styles.statValue}>{counts[status.id] || 0}</span>
            </div>
            <span className={styles.statLabel}>{status.label}</span>
          </Card>
        ))}
      </div>

      <Tabs tabs={tabs} value={filter} onChange={setFilter} />

      {loading ? (
        <Spinner fullPage label="Loading your donations" />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Heart size={24} />}
          title={filter === 'all' ? 'No donations yet' : `No ${filter} donations`}
          description={
            filter === 'all'
              ? 'When you respond to a blood request it appears here so you can track it through to completion.'
              : 'Try a different filter to see your other donations.'
          }
          action={
            filter === 'all' && (
              <Button onClick={() => navigate('/matching-requests')}>
                Find matching requests
              </Button>
            )
          }
        />
      ) : (
        <div className={cards.stack}>
          {visible.map((donation) => {
            const busy = busyId === donation.id;
            const isPending = donation.status === 'pending';
            const isConfirmed = donation.status === 'confirmed';

            return (
              <Card key={donation.id} padding="lg">
                <div className={cards.tags}>
                  <Badge variant={DONATION_STATUS_VARIANTS[donation.status] || 'neutral'} dot>
                    {donation.status}
                  </Badge>
                </div>

                <h3 className={cards.name}>Donation #{donation.id}</h3>
                <p className={cards.meta}>For blood request #{donation.request_id}</p>

                <div className={cards.details}>
                  <span className={cards.detail}>
                    <Clock size={15} />
                    <span className={cards.detailValue}>
                      Responded {getTimeAgo(donation.created_at)}
                    </span>
                  </span>
                </div>

                {donation.message && <p className={cards.quote}>{donation.message}</p>}

                <div className={cards.actions}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/chat/${donation.id}`)}
                  >
                    <MessageCircle size={15} /> Chat
                  </Button>

                  {isPending && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(donation.id, 'confirmed')}
                      disabled={busy}
                    >
                      <CheckCircle size={15} /> Confirm
                    </Button>
                  )}

                  {isConfirmed && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(donation.id, 'completed')}
                      disabled={busy}
                    >
                      <CheckCircle size={15} /> Mark completed
                    </Button>
                  )}

                  {(isPending || isConfirmed) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdateStatus(donation.id, 'cancelled')}
                      disabled={busy}
                    >
                      <XCircle size={15} /> Cancel
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

export default MyDonations;
