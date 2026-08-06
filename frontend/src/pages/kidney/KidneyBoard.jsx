import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { kidneyAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Layout from '../../components/layout/Layout';
import {
  Heart, Plus, Search, Phone, MessageSquare,
  Building2, MapPin, Clock, AlertCircle,
  Activity, ArrowRight, CheckCircle, XCircle, Users
} from 'lucide-react';
import { getTimeAgo } from '../../utils/helpers';
import Spinner from '../../components/ui/Spinner';

const KidneyBoard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Tab State: 'requests', 'matches', 'donors'
  const [activeTab, setActiveTab] = useState('requests');
  
  // Data States
  const [requests, setRequests] = useState([]);
  const [donors, setDonors] = useState([]);
  const [matches, setMatches] = useState([]);
  const [donorProfile, setDonorProfile] = useState(null);
  
  // Loading & Search
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Load all necessary data
  useEffect(() => {
    setLoading(true);
    const promises = [
      kidneyAPI.getAllRequests(),
      kidneyAPI.getAllDonors(),
      kidneyAPI.getMyMatches()
    ];

    // Try loading donor profile if user might have registered
    promises.push(
      kidneyAPI.getMyDonorProfile()
        .then(res => res.data)
        .catch(() => null)
    );

    Promise.all(promises)
      .then(([reqRes, donorRes, matchRes, profileData]) => {
        setRequests(reqRes.data);
        setDonors(donorRes.data);
        setMatches(matchRes.data);
        setDonorProfile(profileData);
      })
      .catch(() => toast.error('Failed to load connection board data'))
      .finally(() => setLoading(false));
  }, []);

  // ABO compatibility matching utility
  const getABOCompatibility = (donorBT, patientBT) => {
    if (!donorBT || !patientBT) return { compatible: false, text: 'Unknown', label: 'Mismatch' };
    
    // Strip rhesus factor (+/-) as ABO is key for initial matching
    const d = donorBT.replace(/[+-]/g, '').trim();
    const p = patientBT.replace(/[+-]/g, '').trim();

    if (d === 'O') {
      return { compatible: true, text: 'Highly Compatible (Universal Donor)', color: '#27AE60', bg: '#EAFAF1' };
    }
    if (p === 'AB') {
      return { compatible: true, text: 'Compatible (Universal Recipient)', color: '#27AE60', bg: '#EAFAF1' };
    }
    if (d === p) {
      return { compatible: true, text: 'Compatible (Exact Match)', color: '#2ecc71', bg: '#EAFDF3' };
    }
    return { compatible: false, text: 'ABO Incompatible', color: '#E74C3C', bg: '#FDEDEC' };
  };

  // Express interest / respond to a request
  const handleExpressInterest = async (requestId) => {
    if (!donorProfile) {
      toast.error('You must register as a kidney donor first!');
      setActiveTab('donors');
      navigate('/kidney/register-donor');
      return;
    }

    setActionLoading(true);
    try {
      await kidneyAPI.respondToRequest({
        request_id: requestId,
        message: `Hello, I saw your request and am willing to coordinate. My blood group is ${donorProfile.blood_type}. Let's coordinate.`
      });
      toast.success('Your offer has been submitted! Secure connection is pending patient\'s contact approval. 🫀');
      
      // Reload matches
      const matchRes = await kidneyAPI.getMyMatches();
      setMatches(matchRes.data);
      setActiveTab('matches');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to express interest');
    } finally {
      setActionLoading(false);
    }
  };

  // Accept a match offer (Patient moves match to contacted)
  const handleAcceptContact = async (matchId) => {
    setActionLoading(true);
    try {
      await kidneyAPI.updateMatchStatus(matchId, 'contacted');
      toast.success('Connection request accepted! Secure chat is now unlocked. 💬');
      
      // Reload matches
      const matchRes = await kidneyAPI.getMyMatches();
      setMatches(matchRes.data);
    } catch (err) {
      toast.error('Failed to accept contact');
    } finally {
      setActionLoading(false);
    }
  };

  // Progress match status
  const handleUpdateStatus = async (matchId, nextStatus) => {
    setActionLoading(true);
    try {
      await kidneyAPI.updateMatchStatus(matchId, nextStatus);
      toast.success(`Connection status updated to "${nextStatus.replace('_', ' ')}"!`);
      
      // Reload matches
      const matchRes = await kidneyAPI.getMyMatches();
      setMatches(matchRes.data);
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter requests by search term
  const filteredRequests = requests.filter(r => {
    const q = search.toLowerCase();
    return (
      r.patient_name.toLowerCase().includes(q) ||
      r.hospital_name.toLowerCase().includes(q) ||
      r.hospital_city.toLowerCase().includes(q) ||
      r.blood_type.toLowerCase().includes(q)
    );
  });

  // Filter donors by search term
  const filteredDonors = donors.filter(d => {
    const q = search.toLowerCase();
    return (
      d.full_name.toLowerCase().includes(q) ||
      d.city.toLowerCase().includes(q) ||
      d.blood_type.toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      {/* Header Banner */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>Kidney Connection Hub 🫀</h1>
          <p style={styles.headerSubtitle}>Discover compatible donors and coordinate directly for hospital handovers</p>
        </div>
        <div style={styles.headerBtns}>
          {!donorProfile ? (
            <button style={styles.donorBtn} onClick={() => navigate('/kidney/register-donor')}>
              <Heart size={16} fill="#8E44AD" /> Register as Donor
            </button>
          ) : (
            <div style={styles.profileBadge}>
              <Heart size={14} fill="#8E44AD" color="#8E44AD" /> Active Donor ({donorProfile.blood_type})
            </div>
          )}
          <button style={styles.createBtn} onClick={() => navigate('/kidney/post-request')}>
            <Plus size={16} /> Post Patient Request
          </button>
        </div>
      </div>

      {/* Info Warning */}
      <div style={styles.disclaimer}>
        <AlertCircle size={20} color="#7D3C98" />
        <p style={styles.disclaimerText}>
          <strong>Healthcare Coordination:</strong> RaktaSeva connects patients and donors. 
          All medical examinations (tissue typing, cross-matching) and legal clearances must be 
          conducted independently in registered hospitals under Sri Lankan regulations.
        </p>
      </div>

      {/* Tab Switcher */}
      <div style={styles.tabsContainer}>
        <div
          style={activeTab === 'requests' ? styles.tabActive : styles.tab}
          onClick={() => { setActiveTab('requests'); setSearch(''); }}
        >
          <Activity size={16} />
          <span>Patient Requests ({requests.length})</span>
        </div>
        <div
          style={activeTab === 'matches' ? styles.tabActive : styles.tab}
          onClick={() => { setActiveTab('matches'); setSearch(''); }}
        >
          <MessageSquare size={16} />
          <span>My Connection Matches ({matches.length})</span>
        </div>
        <div
          style={activeTab === 'donors' ? styles.tabActive : styles.tab}
          onClick={() => { setActiveTab('donors'); setSearch(''); }}
        >
          <Users size={16} />
          <span>Registered Donors ({donors.length})</span>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* TAB 1: PATIENT REQUESTS */}
          {activeTab === 'requests' && (
            <div>
              <div style={styles.searchBar}>
                <Search size={16} color="#7F8C8D" />
                <input
                  type="text"
                  placeholder="Search requests by name, hospital, city or blood type..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={styles.searchInput}
                />
              </div>

              {filteredRequests.length === 0 ? (
                <div style={styles.empty}>
                  <Heart size={48} color="#E8E8E8" />
                  <h3 style={styles.emptyTitle}>No active requests found</h3>
                  <p style={styles.emptyText}>Be the first to post a kidney request or refine search terms</p>
                </div>
              ) : (
                <div style={styles.grid}>
                  {filteredRequests.map(req => {
                    const isOwnRequest = req.patient_id === user.id;
                    const compatibility = donorProfile 
                      ? getABOCompatibility(donorProfile.blood_type, req.blood_type)
                      : null;

                    return (
                      <div key={req.id} style={styles.card}>
                        <div style={styles.cardHeader}>
                          <div style={styles.bloodBadge}>{req.blood_type}</div>
                          <div style={styles.kidneyBadge}>🫀 Kidney Patient</div>
                          {isOwnRequest && <div style={styles.ownBadge}>Your Post</div>}
                        </div>

                        <h3 style={styles.patientName}>{req.patient_name}</h3>
                        <p style={styles.age}>Age: {req.patient_age} years</p>

                        <div style={styles.details}>
                          <div style={styles.detailRow}>
                            <Building2 size={14} color="#7F8C8D" />
                            <span>{req.hospital_name}</span>
                          </div>
                          <div style={styles.detailRow}>
                            <MapPin size={14} color="#7F8C8D" />
                            <span>{req.hospital_city}</span>
                          </div>
                          <div style={styles.detailRow}>
                            <Clock size={14} color="#7F8C8D" />
                            <span>Posted {getTimeAgo(req.created_at)}</span>
                          </div>
                          {req.dialysis_duration && (
                            <div style={styles.detailRow}>
                              <Activity size={14} color="#7F8C8D" />
                              <span>On Dialysis: {req.dialysis_duration}</span>
                            </div>
                          )}
                        </div>

                        {req.medical_details && (
                          <p style={styles.medicalText}>"{req.medical_details}"</p>
                        )}

                        {/* ABO Compatibility Alerts for Donors */}
                        {donorProfile && !isOwnRequest && (
                          <div style={{ ...styles.compatAlert, backgroundColor: compatibility.bg, color: compatibility.color }}>
                            <Activity size={14} />
                            <span>{compatibility.text}</span>
                          </div>
                        )}

                        <div style={styles.cardActions}>
                          {isOwnRequest ? (
                            <button style={styles.secondaryBtn} onClick={() => navigate('/kidney/my-requests')}>
                              Manage Post
                            </button>
                          ) : (
                            <button
                              style={styles.primaryBtn}
                              onClick={() => handleExpressInterest(req.id)}
                              disabled={actionLoading}
                            >
                              <Heart size={14} fill="white" /> Offer Kidney Connection
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY CONNECTION MATCHES & STAGE TRACKER */}
          {activeTab === 'matches' && (
            <div>
              {matches.length === 0 ? (
                <div style={styles.empty}>
                  <MessageSquare size={48} color="#E8E8E8" />
                  <h3 style={styles.emptyTitle}>No active matches yet</h3>
                  <p style={styles.emptyText}>
                    If you are a donor, offer coordination on a request. 
                    If you are a patient, wait for donors to contact you.
                  </p>
                </div>
              ) : (
                <div style={styles.matchList}>
                  {matches.map(m => {
                    const isDonor = m.donor_id === user.id;
                    const contactName = isDonor ? m.patient_name : m.donor_name;
                    const contactRole = isDonor ? '🏥 Patient' : '❤️ Donor';
                    const targetContact = isDonor ? m.patient_contact : m.donor_contact;
                    
                    const progressSteps = [
                      { id: 'pending_contact', label: 'Offered', desc: 'Waiting approval' },
                      { id: 'contacted', label: 'In Contact', desc: 'Secure Chat Active' },
                      { id: 'hospital', label: 'Hospital Coordination', desc: 'Medical testing' },
                      { id: 'completed', label: 'Handover Completed', desc: 'Handover complete' }
                    ];

                    const currentIdx = progressSteps.findIndex(s => s.id === m.status);

                    return (
                      <div key={m.id} style={styles.matchCard}>
                        {/* Match Title bar */}
                        <div style={styles.matchCardTop}>
                          <div>
                            <span style={styles.roleLabel}>{contactRole} Link</span>
                            <h3 style={styles.matchName}>Coordination with {contactName}</h3>
                            <span style={styles.matchMeta}>
                              Blood Type: <strong>{isDonor ? m.patient_blood_type : m.donor_blood_type}</strong> | City: {isDonor ? m.hospital_city : m.donor_city}
                            </span>
                          </div>

                          <div style={styles.matchActionsTop}>
                            <button
                              style={styles.chatLinkBtn}
                              onClick={() => navigate(`/chat/kidney/${m.id}`)}
                              disabled={m.status === 'pending_contact'}
                              title={m.status === 'pending_contact' ? 'Unlock chat by accepting connection first' : 'Open real-time chat'}
                            >
                              <MessageSquare size={16} /> 
                              {m.status === 'pending_contact' ? 'Chat Locked' : 'Open Secure Chat'}
                            </button>
                          </div>
                        </div>

                        {/* Interactive Timeline Tracker */}
                        <div style={styles.timelineContainer}>
                          {progressSteps.map((step, idx) => {
                            const isDone = idx <= currentIdx && m.status !== 'cancelled';
                            const isCurrent = idx === currentIdx;
                            return (
                              <div key={step.id} style={styles.timelineStep}>
                                <div style={{
                                  ...styles.timelineDot,
                                  backgroundColor: isDone ? '#8E44AD' : '#BDC3C7',
                                  transform: isCurrent ? 'scale(1.2)' : 'none',
                                  boxShadow: isCurrent ? '0 0 10px rgba(142,68,173,0.5)' : 'none'
                                }}>
                                  {isDone && <CheckCircle size={12} color="white" />}
                                </div>
                                <div style={styles.timelineLabel}>{step.label}</div>
                                <div style={styles.timelineDesc}>{step.desc}</div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Donor Initial Message */}
                        {m.message && (
                          <div style={styles.matchMessage}>
                            <strong>Offer Message:</strong> "{m.message}"
                          </div>
                        )}

                        {/* Action buttons inside match card */}
                        <div style={styles.matchCardFooter}>
                          <div style={styles.phoneGroup}>
                            {m.status !== 'pending_contact' && (
                              <a href={`tel:${targetContact}`} style={styles.phoneLink}>
                                <Phone size={14} /> Call direct: {targetContact}
                              </a>
                            )}
                          </div>

                          <div style={styles.footerBtns}>
                            {/* Patient approving connection */}
                            {!isDonor && m.status === 'pending_contact' && (
                              <button
                                style={styles.successBtn}
                                onClick={() => handleAcceptContact(m.id)}
                                disabled={actionLoading}
                              >
                                Accept Connection & Unlock Chat
                              </button>
                            )}

                            {/* Standard connection status updates */}
                            {m.status === 'contacted' && (
                              <button
                                style={styles.workflowBtn}
                                onClick={() => handleUpdateStatus(m.id, 'hospital')}
                                disabled={actionLoading}
                              >
                                Move to Hospital Coordination <ArrowRight size={14} />
                              </button>
                            )}

                            {m.status === 'hospital' && (
                              <button
                                style={styles.workflowBtn}
                                onClick={() => handleUpdateStatus(m.id, 'completed')}
                                disabled={actionLoading}
                              >
                                Mark Connection Completed <CheckCircle size={14} />
                              </button>
                            )}

                            {m.status !== 'completed' && m.status !== 'cancelled' && (
                              <button
                                style={styles.cancelLinkBtn}
                                onClick={() => handleUpdateStatus(m.id, 'cancelled')}
                                disabled={actionLoading}
                              >
                                <XCircle size={14} /> Cancel Connection
                              </button>
                            )}

                            {m.status === 'cancelled' && (
                              <span style={styles.cancelledBadge}>Cancelled Connection</span>
                            )}
                            {m.status === 'completed' && (
                              <span style={styles.completedBadge}>Completed Match! 🎉</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REGISTERED DONORS DISCOVERY */}
          {activeTab === 'donors' && (
            <div>
              <div style={styles.searchBar}>
                <Search size={16} color="#7F8C8D" />
                <input
                  type="text"
                  placeholder="Search registered donors by name, city or blood type..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={styles.searchInput}
                />
              </div>

              {filteredDonors.length === 0 ? (
                <div style={styles.empty}>
                  <Users size={48} color="#E8E8E8" />
                  <h3 style={styles.emptyTitle}>No registered donors found</h3>
                  <p style={styles.emptyText}>Be the first to register as a donor or refine search terms</p>
                </div>
              ) : (
                <div style={styles.grid}>
                  {filteredDonors.map(donor => {
                    const isSelfDonor = donor.user_id === user.id;
                    return (
                      <div key={donor.id} style={styles.card}>
                        <div style={styles.cardHeader}>
                          <div style={{ ...styles.bloodBadge, backgroundColor: '#EBFAF1', color: '#27AE60' }}>
                            {donor.blood_type}
                          </div>
                          <div style={{ ...styles.kidneyBadge, backgroundColor: '#F5EEF8', color: '#8E44AD' }}>
                            Willing Donor
                          </div>
                          {isSelfDonor && <div style={styles.ownBadge}>You</div>}
                        </div>

                        <h3 style={styles.patientName}>{donor.full_name}</h3>
                        <p style={styles.age}>Age: {donor.age} years</p>

                        <div style={styles.details}>
                          <div style={styles.detailRow}>
                            <MapPin size={14} color="#7F8C8D" />
                            <span>Lives in: {donor.city}</span>
                          </div>
                          <div style={styles.detailRow}>
                            <Clock size={14} color="#7F8C8D" />
                            <span>Registered {getTimeAgo(donor.created_at)}</span>
                          </div>
                        </div>

                        {donor.reason_to_donate && (
                          <p style={styles.medicalText}>
                            <strong>Motivation:</strong> "{donor.reason_to_donate}"
                          </p>
                        )}

                        <div style={styles.cardActions}>
                          {isSelfDonor ? (
                            <button
                              style={styles.secondaryBtn}
                              onClick={() => navigate('/profile')}
                            >
                              Edit Donor Profile
                            </button>
                          ) : (
                            <div style={styles.donorInfoBadge}>
                              Coordinate with donors via Patients' Request cards. Offers will show up under matches.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' },
  headerTitle: { fontSize: '32px', fontFamily: 'Playfair Display, serif', color: '#2C3E50' },
  headerSubtitle: { color: '#7F8C8D', marginTop: '4px' },
  headerBtns: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' },
  donorBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#F5EEF8', color: '#8E44AD', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif' },
  createBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#8E44AD', color: 'white', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif' },
  profileBadge: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#EBFAF1', color: '#27AE60', borderRadius: '10px', fontSize: '14px', fontWeight: '600' },
  disclaimer: { display: 'flex', alignItems: 'flex-start', gap: '12px', backgroundColor: '#F9F7FC', border: '1px solid #D7BDE2', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' },
  disclaimerText: { color: '#5B2C6F', fontSize: '14px', lineHeight: '1.6' },
  tabsContainer: { display: 'flex', gap: '8px', borderBottom: '2px solid #E8E8E8', marginBottom: '24px', flexWrap: 'wrap' },
  tab: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', color: '#7F8C8D', cursor: 'pointer', fontWeight: '500', fontSize: '15px', borderBottom: '3px solid transparent', transition: 'all 0.2s' },
  tabActive: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', color: '#8E44AD', cursor: 'pointer', fontWeight: '600', fontSize: '15px', borderBottom: '3px solid #8E44AD', transition: 'all 0.2s' },
  searchBar: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', borderRadius: '10px', padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '24px' },
  searchInput: { border: 'none', outline: 'none', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', width: '100%', color: '#2C3E50' },
  empty: { textAlign: 'center', padding: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  emptyTitle: { fontSize: '20px', fontFamily: 'Playfair Display, serif', color: '#2C3E50' },
  emptyText: { color: '#7F8C8D', fontSize: '14px', maxWidth: '400px', lineHeight: '1.5' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '20px' },
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' },
  cardHeader: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' },
  bloodBadge: { backgroundColor: '#FADBD8', color: '#C0392B', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: '700' },
  kidneyBadge: { backgroundColor: '#F5EEF8', color: '#8E44AD', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  ownBadge: { backgroundColor: '#EBF5FB', color: '#2980B9', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', marginLeft: 'auto' },
  patientName: { fontSize: '18px', fontFamily: 'Playfair Display, serif', color: '#2C3E50', marginBottom: '4px', fontWeight: '700' },
  age: { color: '#7F8C8D', fontSize: '14px', marginBottom: '12px' },
  details: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', flex: 1 },
  detailRow: { display: 'flex', alignItems: 'center', gap: '8px', color: '#7F8C8D', fontSize: '13px' },
  medicalText: { color: '#7F8C8D', fontSize: '13px', fontStyle: 'italic', padding: '12px', backgroundColor: '#F9F9F9', borderRadius: '8px', marginBottom: '16px', borderLeft: '3px solid #D7BDE2' },
  compatAlert: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', marginBottom: '16px' },
  cardActions: { marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #F2F3F4' },
  primaryBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', backgroundColor: '#8E44AD', color: 'white', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif' },
  secondaryBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', backgroundColor: '#F2F3F4', color: '#2C3E50', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif' },
  donorInfoBadge: { fontSize: '12px', color: '#7F8C8D', textAlign: 'center', backgroundColor: '#F9F9F9', padding: '8px', borderRadius: '6px' },
  matchList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  matchCard: { backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '5px solid #8E44AD' },
  matchCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F2F3F4', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' },
  roleLabel: { display: 'inline-block', fontSize: '11px', fontWeight: '600', color: '#8E44AD', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' },
  matchName: { fontSize: '19px', fontFamily: 'Playfair Display, serif', color: '#2C3E50', fontWeight: '700' },
  matchMeta: { fontSize: '13px', color: '#7F8C8D', marginTop: '4px', display: 'block' },
  matchActionsTop: { display: 'flex', gap: '8px' },
  chatLinkBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#8E44AD', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  timelineContainer: { display: 'flex', justifyContent: 'space-between', padding: '16px 8px 24px', backgroundColor: '#FAF9FC', borderRadius: '12px', marginBottom: '20px', flexWrap: 'wrap', gap: '16px', position: 'relative' },
  timelineStep: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minWidth: '100px' },
  timelineDot: { width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', transition: 'all 0.3s' },
  timelineLabel: { fontSize: '13px', fontWeight: '600', color: '#2C3E50', marginBottom: '2px' },
  timelineDesc: { fontSize: '11px', color: '#7F8C8D' },
  matchMessage: { backgroundColor: '#F9F9F9', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', color: '#7F8C8D', marginBottom: '20px', borderLeft: '3px solid #8E44AD' },
  matchCardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
  phoneGroup: { display: 'flex', alignItems: 'center' },
  phoneLink: { display: 'flex', alignItems: 'center', gap: '6px', color: '#8E44AD', fontWeight: '600', textDecoration: 'none', fontSize: '14px' },
  footerBtns: { display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginLeft: 'auto' },
  successBtn: { padding: '10px 20px', backgroundColor: '#27AE60', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  workflowBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', backgroundColor: '#8E44AD', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  cancelLinkBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '10px 16px', backgroundColor: 'transparent', color: '#C0392B', border: '1px solid #FADBD8', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  cancelledBadge: { backgroundColor: '#FDEDEC', color: '#E74C3C', padding: '6px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600' },
  completedBadge: { backgroundColor: '#EAFAF1', color: '#27AE60', padding: '6px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600' },
};

export default KidneyBoard;