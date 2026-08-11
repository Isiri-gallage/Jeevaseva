import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowRight, Bell, Building2, CheckCircle, Droplets, Heart, ShieldCheck, Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import Layout, { PageHeader } from '../../components/layout/Layout';
import { Badge, Card, Skeleton } from '../../components/ui';
import { getErrorMessage } from '../../utils/apiError';
import styles from '../../styles/Dashboard.module.css';
import page from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then((res) => setStats(res.data))
      .catch((error) => toast.error(getErrorMessage(error, 'Could not load platform stats')))
      .finally(() => setLoading(false));
  }, []);

  const tiles = [
    { label: 'Total users', value: stats?.total_users, icon: <Users size={18} />, tint: styles.iconAccent },
    { label: 'Donors', value: stats?.total_donors, icon: <Heart size={18} />, tint: styles.iconBlood },
    { label: 'Blood requests', value: stats?.total_requests, icon: <Droplets size={18} />, tint: styles.iconAccent },
    { label: 'Open requests', value: stats?.open_requests, icon: <Bell size={18} />, tint: styles.iconSuccess },
    { label: 'Donations', value: stats?.total_donations, icon: <CheckCircle size={18} />, tint: styles.iconWarning },
  ];

  const actions = [
    { icon: <Users size={20} />, title: 'Manage users', desc: 'Verify, suspend, or promote accounts', path: '/admin/users' },
    { icon: <Droplets size={20} />, title: 'Manage requests', desc: 'Review and remove blood requests', path: '/admin/requests' },
    { icon: <Building2 size={20} />, title: 'Blood board', desc: 'All open blood requests', path: '/blood-requests' },
    { icon: <Heart size={20} />, title: 'Kidney board', desc: 'Patient requests and living donors', path: '/kidney' },
  ];

  return (
    <Layout>
      <PageHeader
        title={`Welcome back, ${user?.full_name?.split(' ')[0] || ''}`}
        subtitle="Platform activity at a glance."
        actions={<Badge variant="warning" size="lg"><ShieldCheck size={13} /> Admin access</Badge>}
      />

      <div className={page.statGrid}>
        {tiles.map((tile) => (
          <Card key={tile.label} padding="md">
            <div className={styles.stat}>
              <span className={`${styles.statIcon} ${tile.tint}`}>{tile.icon}</span>
              {/* A skeleton rather than "0" while loading — showing a real
                * number that is not the real number is worse than showing none. */}
              {loading
                ? <Skeleton width="3rem" height={28} />
                : <span className={styles.statValue}>{tile.value ?? 0}</span>}
              <span className={styles.statLabel}>{tile.label}</span>
            </div>
          </Card>
        ))}
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Quick actions</h2>
        </div>

        <div className={page.actionGrid}>
          {actions.map((action) => (
            <Card
              key={action.path}
              as="button"
              padding="lg"
              interactive
              className={page.action}
              onClick={() => navigate(action.path)}
            >
              <span className={`${styles.statIcon} ${styles.iconAccent}`}>{action.icon}</span>
              <span className={page.actionBody}>
                <span className={page.actionTitle}>{action.title}</span>
                <span className={page.actionDesc}>{action.desc}</span>
              </span>
              <ArrowRight size={16} className={page.actionArrow} />
            </Card>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default AdminDashboard;
