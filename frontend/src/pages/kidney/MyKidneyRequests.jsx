import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Building2, CheckCircle, Clock, Heart, MapPin, Phone, Plus, Trash2,
} from 'lucide-react';
import { kidneyAPI } from '../../services/api';
import Layout, { PageHeader } from '../../components/layout/Layout';
import { Badge, Button, Card, EmptyState, Spinner } from '../../components/ui';
import { getTimeAgo } from '../../utils/helpers';
import { getErrorMessage } from '../../utils/apiError';
import cards from '../../styles/Cards.module.css';

const STATUS_VARIANT = {
  open: 'success',
  closed: 'neutral',
  fulfilled: 'accent',
};

const MyKidneyRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    kidneyAPI.getMyRequests()
      .then((res) => setRequests(res.data))
      .catch((error) => toast.error(getErrorMessage(error, 'Could not load your requests')))
      .finally(() => setLoading(false));
  }, []);

  const handleClose = async (id) => {
    setBusyId(id);
    try {
      await kidneyAPI.updateRequest(id, { status: 'closed' });
      toast.success('Request closed. It is no longer shown to donors.');
      setRequests((previous) =>
        previous.map((request) => (request.id === id ? { ...request, status: 'closed' } : request))
      );
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not close the request'));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this request permanently? Donors who already offered will lose the connection.')) {
      return;
    }

    setBusyId(id);
    try {
      await kidneyAPI.deleteRequest(id);
      toast.success('Request deleted.');
      setRequests((previous) => previous.filter((request) => request.id !== id));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not delete the request'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="My kidney requests"
        subtitle={
          loading
            ? undefined
            : `${requests.length} request${requests.length === 1 ? '' : 's'} posted`
        }
        actions={
          <Button onClick={() => navigate('/kidney/post-request')}>
            <Plus size={16} /> New request
          </Button>
        }
      />

      {loading ? (
        <Spinner fullPage label="Loading your requests" />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<Heart size={24} />}
          title="You have not posted a request yet"
          description="Posting a request puts your details in front of registered living donors with a compatible blood type."
          action={
            <Button onClick={() => navigate('/kidney/post-request')}>
              <Plus size={16} /> Post your first request
            </Button>
          }
        />
      ) : (
        <div className={cards.stack}>
          {requests.map((request) => {
            const isOpen = request.status === 'open';
            const busy = busyId === request.id;

            return (
              <Card key={request.id} padding="lg">
                <div className={cards.tags}>
                  <span className={cards.bloodType}>{request.blood_type}</span>
                  <Badge variant={STATUS_VARIANT[request.status] || 'neutral'}>
                    {request.status}
                  </Badge>
                </div>

                <h3 className={cards.name}>{request.patient_name}</h3>
                <p className={cards.meta}>{request.patient_age} years old</p>

                <div className={cards.details}>
                  <span className={cards.detail}>
                    <Building2 size={15} />
                    <span className={cards.detailValue}>{request.hospital_name}</span>
                  </span>
                  <span className={cards.detail}>
                    <MapPin size={15} />
                    <span className={cards.detailValue}>{request.hospital_city}</span>
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

                {request.medical_details && (
                  <p className={cards.quote}>{request.medical_details}</p>
                )}

                <div className={cards.actions}>
                  {isOpen && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleClose(request.id)}
                      disabled={busy}
                    >
                      <CheckCircle size={15} /> Close request
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

export default MyKidneyRequests;
