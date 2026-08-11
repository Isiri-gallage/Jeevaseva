import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Building2, Clock, Droplets, Heart, MapPin, Phone, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { donorsAPI } from '../../services/api';
import Layout, { PageHeader } from '../../components/layout/Layout';
import { Badge, Button, Card, EmptyState, Input, Spinner } from '../../components/ui';
import { getTimeAgo, URGENCY_LABELS, URGENCY_VARIANTS } from '../../utils/helpers';
import { getErrorMessage } from '../../utils/apiError';
import cards from '../../styles/Cards.module.css';

const MatchingRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    donorsAPI.getMatchingRequests()
      .then((res) => setRequests(res.data))
      .catch((error) => toast.error(getErrorMessage(error, 'Could not load matching requests')))
      .finally(() => setLoading(false));
  }, []);

  const handleRespond = async (requestId) => {
    setBusyId(requestId);
    try {
      await donorsAPI.respond({
        request_id: requestId,
        message: 'I am available to donate.',
      });
      toast.success('Response sent. The patient can now contact you.');
      navigate('/my-donations');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not send your response'));
    } finally {
      setBusyId(null);
    }
  };

  /*
   * Derived with useMemo rather than mirrored into a second useState.
   *
   * The old version kept `filtered` in state and re-synced it from a useEffect,
   * which renders twice for every keystroke and lets the copy drift out of date
   * if anything else ever mutates `requests`.
   */
  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return requests;
    return requests.filter((request) =>
      ['patient_name', 'hospital_name', 'city']
        .some((field) => String(request[field] ?? '').toLowerCase().includes(needle))
    );
  }, [requests, search]);

  return (
    <Layout>
      <PageHeader
        title="Matching requests"
        subtitle={`Open requests compatible with your blood type (${user?.blood_type}).`}
      />

      <div style={{ maxWidth: '32rem', marginBottom: 'var(--space-6)' }}>
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by patient, hospital or city"
          icon={<Search size={16} />}
          aria-label="Search requests"
        />
      </div>

      {loading ? (
        <Spinner fullPage label="Finding compatible requests" />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Droplets size={24} />}
          title={search ? 'No requests match your search' : 'No compatible requests right now'}
          description={
            search
              ? 'Try a different hospital or city.'
              : `Nobody currently needs ${user?.blood_type}-compatible blood. We will show new requests here as they are posted.`
          }
        />
      ) : (
        <div className={cards.grid}>
          {visible.map((request) => (
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
                  <Phone size={15} />
                  <span className={cards.detailValue}>{request.contact_number}</span>
                </span>
                <span className={cards.detail}>
                  <Clock size={15} />
                  <span className={cards.detailValue}>Posted {getTimeAgo(request.created_at)}</span>
                </span>
              </div>

              {request.notes && <p className={cards.quote}>{request.notes}</p>}

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
    </Layout>
  );
};

export default MatchingRequests;
