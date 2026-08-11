import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Building2, Clock, Droplets, MapPin, Phone, Search, Trash2 } from 'lucide-react';
import { adminAPI } from '../../services/api';
import Layout, { PageHeader } from '../../components/layout/Layout';
import { Badge, Button, Card, EmptyState, Input, Spinner, Tabs } from '../../components/ui';
import {
  getTimeAgo, REQUEST_STATUS_LABELS, REQUEST_STATUS_VARIANTS,
  URGENCY_LABELS, URGENCY_VARIANTS,
} from '../../utils/helpers';
import { getErrorMessage } from '../../utils/apiError';
import cards from '../../styles/Cards.module.css';
import table from '../../styles/Table.module.css';

const FILTERS = ['all', 'open', 'fulfilled', 'expired', 'cancelled'];

const ManageRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    adminAPI.getAllRequests()
      .then((res) => setRequests(res.data))
      .catch((error) => toast.error(getErrorMessage(error, 'Could not load requests')))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, patientName) => {
    if (!window.confirm(`Permanently delete the request for ${patientName}? This cannot be undone.`)) {
      return;
    }

    setBusyId(id);
    try {
      await adminAPI.deleteRequest(id);
      toast.success('Request deleted.');
      setRequests((previous) => previous.filter((request) => request.id !== id));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not delete the request'));
    } finally {
      setBusyId(null);
    }
  };

  const counts = useMemo(() => {
    const byStatus = requests.reduce((accumulator, request) => {
      accumulator[request.status] = (accumulator[request.status] || 0) + 1;
      return accumulator;
    }, {});
    return { all: requests.length, ...byStatus };
  }, [requests]);

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return requests.filter((request) => {
      if (status !== 'all' && request.status !== status) return false;
      if (!needle) return true;
      return ['patient_name', 'hospital_name', 'city', 'blood_type']
        .some((field) => String(request[field] ?? '').toLowerCase().includes(needle));
    });
  }, [requests, search, status]);

  const tabs = FILTERS.map((id) => ({
    id,
    label: id === 'all' ? 'All' : REQUEST_STATUS_LABELS[id],
    count: counts[id] || 0,
  }));

  return (
    <Layout>
      <PageHeader
        title="Manage blood requests"
        subtitle={loading ? undefined : `${requests.length} request${requests.length === 1 ? '' : 's'} on the platform`}
      />

      <div className={table.toolbar}>
        <div className={table.search}>
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by patient, hospital, city or blood type"
            icon={<Search size={16} />}
            aria-label="Search requests"
          />
        </div>
      </div>

      <Tabs tabs={tabs} value={status} onChange={setStatus} />

      {loading ? (
        <Spinner fullPage label="Loading requests" />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Droplets size={24} />}
          title={search || status !== 'all' ? 'No requests match these filters' : 'No requests yet'}
          description={search || status !== 'all' ? 'Try clearing the search or choosing a different status.' : undefined}
        />
      ) : (
        <div className={cards.grid}>
          {visible.map((request) => (
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
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(request.id, request.patient_name)}
                  disabled={busyId === request.id}
                >
                  <Trash2 size={15} /> Delete request
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default ManageRequests;
