import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Building2, CheckCircle, Clock, Droplets, MapPin, MessageCircle, Plus, Trash2,
} from 'lucide-react';
import { requestsAPI, donorsAPI } from '../../services/api';
import Layout, { PageHeader } from '../../components/layout/Layout';
import { Badge, Button, Card, EmptyState, Spinner, Tabs } from '../../components/ui';
import {
  getTimeAgo, REQUEST_STATUS_LABELS, REQUEST_STATUS_VARIANTS,
  URGENCY_LABELS, URGENCY_VARIANTS,
} from '../../utils/helpers';
import { getErrorMessage } from '../../utils/apiError';
import cards from '../../styles/Cards.module.css';

const FILTERS = ['all', 'open', 'fulfilled', 'expired', 'cancelled'];

const MyRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    requestsAPI.getMyRequests()
      .then((res) => setRequests(res.data))
      .catch((error) => toast.error(getErrorMessage(error, 'Could not load your requests')))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkFulfilled = async (id) => {
    setBusyId(id);
    try {
      await requestsAPI.update(id, { status: 'fulfilled' });
      toast.success('Marked as fulfilled.');
      setRequests((previous) =>
        previous.map((request) => (request.id === id ? { ...request, status: 'fulfilled' } : request))
      );
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not update the request'));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this request permanently?')) return;

    setBusyId(id);
    try {
      await requestsAPI.delete(id);
      toast.success('Request deleted.');
      setRequests((previous) => previous.filter((request) => request.id !== id));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not delete the request'));
    } finally {
      setBusyId(null);
    }
  };

  const handleChat = async (requestId) => {
    try {
      const { data } = await donorsAPI.getDonationByRequest(requestId);
      navigate(`/chat/${data.id}`);
    } catch {
      toast('No donor has responded to this request yet.');
    }
  };

  // Counts come from the unfiltered list so the tabs do not all read zero once
  // a filter is applied.
  const counts = useMemo(() => {
    const byStatus = requests.reduce((accumulator, request) => {
      accumulator[request.status] = (accumulator[request.status] || 0) + 1;
      return accumulator;
    }, {});
    return { all: requests.length, ...byStatus };
  }, [requests]);

  const visible = useMemo(
    () => (filter === 'all' ? requests : requests.filter((request) => request.status === filter)),
    [requests, filter]
  );

  const tabs = FILTERS.map((id) => ({
    id,
    label: id === 'all' ? 'All' : REQUEST_STATUS_LABELS[id],
    count: counts[id] || 0,
  }));

  return (
    <Layout>
      <PageHeader
        title="My blood requests"
        subtitle={loading ? undefined : `${requests.length} request${requests.length === 1 ? '' : 's'} posted`}
        actions={
          <Button onClick={() => navigate('/create-request')}>
            <Plus size={16} /> New request
          </Button>
        }
      />

      <Tabs tabs={tabs} value={filter} onChange={setFilter} />

      {loading ? (
        <Spinner fullPage label="Loading your requests" />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Droplets size={24} />}
          title={filter === 'all' ? 'No requests yet' : `No ${filter} requests`}
          description={
            filter === 'all'
              ? 'Posting a request notifies donors with a compatible blood type in your city.'
              : 'Try a different filter to see your other requests.'
          }
          action={
            filter === 'all' && (
              <Button onClick={() => navigate('/create-request')}>
                <Plus size={16} /> Post your first request
              </Button>
            )
          }
        />
      ) : (
        <div className={cards.stack}>
          {visible.map((request) => {
            const busy = busyId === request.id;
            const isOpen = request.status === 'open';

            return (
              <Card key={request.id} padding="lg">
                <div className={cards.tags}>
                  <span className={cards.bloodType}>{request.blood_type}</span>
                  <Badge variant={REQUEST_STATUS_VARIANTS[request.status] || 'neutral'}>
                    {REQUEST_STATUS_LABELS[request.status] || request.status}
                  </Badge>
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

                {request.notes && <p className={cards.quote}>{request.notes}</p>}

                <div className={cards.actions}>
                  <Button variant="secondary" size="sm" onClick={() => handleChat(request.id)}>
                    <MessageCircle size={15} /> Chat with donor
                  </Button>

                  {isOpen && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleMarkFulfilled(request.id)}
                      disabled={busy}
                    >
                      <CheckCircle size={15} /> Mark fulfilled
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(request.id)}
                    disabled={busy}
                  >
                    <Trash2 size={15} /> Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

export default MyRequests;
