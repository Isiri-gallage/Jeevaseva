import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Activity, AlertCircle, Heart, HeartHandshake, MessageSquare, Plus, Search, Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { kidneyAPI } from '../../services/api';
import Layout, { PageHeader } from '../../components/layout/Layout';
import { Badge, Button, EmptyState, Input, Spinner, Tabs } from '../../components/ui';
import { getABOCompatibility } from '../../utils/compatibility';
import { getErrorMessage } from '../../utils/apiError';
import RequestCard from './components/RequestCard';
import DonorCard from './components/DonorCard';
import MatchCard from './components/MatchCard';
import cards from '../../styles/Cards.module.css';
import styles from './KidneyBoard.module.css';

const TAB = { REQUESTS: 'requests', MATCHES: 'matches', DONORS: 'donors' };

/** Case-insensitive match of a query against several fields of a record. */
const matches = (record, fields, query) => {
  if (!query) return true;
  const needle = query.toLowerCase();
  return fields.some((field) => String(record[field] ?? '').toLowerCase().includes(needle));
};

const KidneyBoard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(TAB.REQUESTS);
  const [search, setSearch] = useState('');

  const [requests, setRequests] = useState([]);
  const [donors, setDonors] = useState([]);
  const [connections, setConnections] = useState([]);
  const [donorProfile, setDonorProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [requestRes, donorRes, matchRes, profile] = await Promise.all([
        kidneyAPI.getAllRequests(),
        kidneyAPI.getAllDonors(),
        kidneyAPI.getMyMatches(),
        // A 404 here just means "not registered as a donor", which is a normal
        // state rather than an error, so it is swallowed into null.
        kidneyAPI.getMyDonorProfile().then((res) => res.data).catch(() => null),
      ]);

      setRequests(requestRes.data);
      setDonors(donorRes.data);
      setConnections(matchRes.data);
      setDonorProfile(profile);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not load the kidney board'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const refreshConnections = async () => {
    const res = await kidneyAPI.getMyMatches();
    setConnections(res.data);
  };

  // ─── Actions ─────────────────────────────────────────────

  const handleOffer = async (requestId) => {
    if (!donorProfile) {
      toast('Register as a donor first so patients can see your details.');
      navigate('/kidney/register-donor');
      return;
    }

    setBusy(true);
    try {
      await kidneyAPI.respondToRequest({
        request_id: requestId,
        message:
          `Hello, I saw your request and I am willing to help. ` +
          `My blood type is ${donorProfile.blood_type}.`,
      });
      toast.success('Offer sent. The patient will be asked to accept.');
      await refreshConnections();
      setActiveTab(TAB.MATCHES);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not send your offer'));
    } finally {
      setBusy(false);
    }
  };

  const handleAccept = async (matchId) => {
    setBusy(true);
    try {
      await kidneyAPI.updateMatchStatus(matchId, 'contacted');
      toast.success('Connection accepted. Secure chat is now open.');
      await refreshConnections();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not accept the connection'));
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateStatus = async (matchId, status) => {
    // Cancelling cannot be undone from the UI, so it gets a confirmation step.
    // The old code cancelled instantly on a single click.
    if (status === 'cancelled' &&
        !window.confirm('Cancel this connection? The other person will be notified and the chat will close.')) {
      return;
    }

    setBusy(true);
    try {
      await kidneyAPI.updateMatchStatus(matchId, status);
      toast.success('Connection updated.');
      await refreshConnections();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not update the connection'));
    } finally {
      setBusy(false);
    }
  };

  // ─── Derived data ────────────────────────────────────────
  // useMemo so filtering does not re-run on every unrelated render.

  const visibleRequests = useMemo(
    () => requests.filter((request) =>
      matches(request, ['patient_name', 'hospital_name', 'hospital_city', 'blood_type'], search)),
    [requests, search]
  );

  const visibleDonors = useMemo(
    () => donors.filter((donor) => matches(donor, ['full_name', 'city', 'blood_type'], search)),
    [donors, search]
  );

  const tabs = [
    { id: TAB.REQUESTS, label: 'Patient requests', icon: <Activity size={16} />, count: requests.length },
    { id: TAB.MATCHES, label: 'My connections', icon: <MessageSquare size={16} />, count: connections.length },
    { id: TAB.DONORS, label: 'Donors', icon: <Users size={16} />, count: donors.length },
  ];

  const showSearch = activeTab !== TAB.MATCHES;

  return (
    <Layout>
      <PageHeader
        title="Kidney board"
        subtitle="Browse patient requests, offer to donate, and track connections through to hospital handover."
        actions={
          <>
            {donorProfile ? (
              <Badge variant="success" size="lg" dot>
                Registered donor · {donorProfile.blood_type}
              </Badge>
            ) : (
              <Button variant="secondary" onClick={() => navigate('/kidney/register-donor')}>
                <HeartHandshake size={16} /> Become a donor
              </Button>
            )}
            <Button onClick={() => navigate('/kidney/post-request')}>
              <Plus size={16} /> Post a request
            </Button>
          </>
        }
      />

      <div className={styles.notice}>
        <AlertCircle size={18} />
        <p>
          <span className={styles.noticeTitle}>RaktaSeva connects people, it does not provide medical care. </span>
          Tissue typing, crossmatching, and every legal clearance must be carried
          out independently at a registered Sri Lankan hospital.
        </p>
      </div>

      <Tabs
        tabs={tabs}
        value={activeTab}
        onChange={(id) => { setActiveTab(id); setSearch(''); }}
      />

      {loading ? (
        <Spinner fullPage label="Loading the board" />
      ) : (
        <>
          {showSearch && (
            <div className={styles.search}>
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={
                  activeTab === TAB.REQUESTS
                    ? 'Search by name, hospital, city or blood type'
                    : 'Search donors by name, city or blood type'
                }
                icon={<Search size={16} />}
                aria-label="Search"
              />
            </div>
          )}

          {/* ─── Patient requests ─────────────────────────── */}
          {activeTab === TAB.REQUESTS && (
            visibleRequests.length === 0 ? (
              <EmptyState
                icon={<Heart size={24} />}
                title={search ? 'No requests match your search' : 'No open requests yet'}
                description={
                  search
                    ? 'Try a different hospital, city, or blood type.'
                    : 'When a patient posts a kidney request it will appear here for compatible donors to see.'
                }
                action={
                  !search && (
                    <Button onClick={() => navigate('/kidney/post-request')}>
                      <Plus size={16} /> Post the first request
                    </Button>
                  )
                }
              />
            ) : (
              <div className={cards.grid}>
                {visibleRequests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    isOwn={request.patient_id === user.id}
                    compatibility={
                      donorProfile
                        ? getABOCompatibility(donorProfile.blood_type, request.blood_type)
                        : null
                    }
                    busy={busy}
                    onOffer={() => handleOffer(request.id)}
                    onManage={() => navigate('/kidney/my-requests')}
                  />
                ))}
              </div>
            )
          )}

          {/* ─── My connections ───────────────────────────── */}
          {activeTab === TAB.MATCHES && (
            connections.length === 0 ? (
              <EmptyState
                icon={<MessageSquare size={24} />}
                title="No connections yet"
                description="Offer to donate on a patient's request, or wait for a donor to respond to yours. Accepted connections open a private chat."
                action={
                  <Button variant="secondary" onClick={() => setActiveTab(TAB.REQUESTS)}>
                    Browse requests
                  </Button>
                }
              />
            ) : (
              <div className={cards.stack}>
                {connections.map((connection) => (
                  <MatchCard
                    key={connection.id}
                    match={connection}
                    isDonor={connection.donor_id === user.id}
                    busy={busy}
                    onAccept={() => handleAccept(connection.id)}
                    onUpdateStatus={(status) => handleUpdateStatus(connection.id, status)}
                    onOpenChat={() => navigate(`/chat/kidney/${connection.id}`)}
                  />
                ))}
              </div>
            )
          )}

          {/* ─── Donor directory ──────────────────────────── */}
          {activeTab === TAB.DONORS && (
            visibleDonors.length === 0 ? (
              <EmptyState
                icon={<Users size={24} />}
                title={search ? 'No donors match your search' : 'No registered donors yet'}
                description={
                  search
                    ? 'Try a different city or blood type.'
                    : 'Registering adds you to this directory so patients can see there is someone willing to help.'
                }
                action={
                  !search && !donorProfile && (
                    <Button onClick={() => navigate('/kidney/register-donor')}>
                      <HeartHandshake size={16} /> Register as a donor
                    </Button>
                  )
                }
              />
            ) : (
              <div className={cards.grid}>
                {visibleDonors.map((donor) => (
                  <DonorCard
                    key={donor.id}
                    donor={donor}
                    isSelf={donor.user_id === user.id}
                    onEditProfile={() => navigate('/profile')}
                  />
                ))}
              </div>
            )
          )}
        </>
      )}
    </Layout>
  );
};

export default KidneyBoard;
