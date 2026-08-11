import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Building2, Clock, Droplets, MapPin, Phone, Search } from 'lucide-react';
import { requestsAPI } from '../../services/api';
import Layout, { PageHeader } from '../../components/layout/Layout';
import { Badge, Card, EmptyState, Input, Spinner } from '../../components/ui';
import { getTimeAgo, URGENCY_LABELS, URGENCY_VARIANTS } from '../../utils/helpers';
import { getErrorMessage } from '../../utils/apiError';
import cards from '../../styles/Cards.module.css';
import dash from '../../styles/Dashboard.module.css';
import table from '../../styles/Table.module.css';

const BloodRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    requestsAPI.getAll()
      .then((res) => setRequests(res.data))
      .catch((error) => toast.error(getErrorMessage(error, 'Could not load blood requests')))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return requests;
    return requests.filter((request) =>
      ['patient_name', 'hospital_name', 'city', 'blood_type']
        .some((field) => String(request[field] ?? '').toLowerCase().includes(needle))
    );
  }, [requests, search]);

  const countByUrgency = (level) =>
    requests.filter((request) => request.urgency === level).length;

  const stats = [
    { label: 'Open requests', value: requests.length, tint: dash.iconBlood },
    { label: 'Critical', value: countByUrgency('critical'), tint: dash.iconBlood },
    { label: 'High', value: countByUrgency('high'), tint: dash.iconWarning },
    { label: 'Medium', value: countByUrgency('medium'), tint: dash.iconWarning },
  ];

  return (
    <Layout>
      <PageHeader
        title="Blood requests"
        subtitle="Every open blood request across the platform."
      />

      <div className={dash.statGrid}>
        {stats.map((stat) => (
          <Card key={stat.label} padding="md">
            <div className={dash.stat}>
              <span className={`${dash.statIcon} ${stat.tint}`}>
                <Droplets size={18} />
              </span>
              <span className={dash.statValue}>{stat.value}</span>
              <span className={dash.statLabel}>{stat.label}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className={table.toolbar}>
        <div className={table.search}>
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by patient, hospital, city or blood type"
            icon={<Search size={16} />}
            aria-label="Search blood requests"
          />
        </div>
      </div>

      {loading ? (
        <Spinner fullPage label="Loading requests" />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Droplets size={24} />}
          title={search ? 'No requests match your search' : 'No open blood requests'}
          description={
            search
              ? 'Try a different hospital, city, or blood type.'
              : 'New emergency requests will appear here as they are posted.'
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
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default BloodRequests;
