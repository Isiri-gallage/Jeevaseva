import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Ban, CheckCircle, Search, ShieldCheck, Undo2, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import Layout, { PageHeader } from '../../components/layout/Layout';
import { Badge, Button, EmptyState, Input, Spinner } from '../../components/ui';
import { getErrorMessage } from '../../utils/apiError';
import styles from '../../styles/Table.module.css';

const ManageUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    adminAPI.getAllUsers()
      .then((res) => setUsers(res.data))
      .catch((error) => toast.error(getErrorMessage(error, 'Could not load users')))
      .finally(() => setLoading(false));
  }, []);

  /** Every row action follows the same shape, so they share one runner. */
  const runAction = async (id, action, patch, successMessage) => {
    setBusyId(id);
    try {
      await action(id);
      toast.success(successMessage);
      setUsers((previous) =>
        previous.map((item) => (item.id === id ? { ...item, ...patch } : item))
      );
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not update the user'));
    } finally {
      setBusyId(null);
    }
  };

  const handleBan = (id, name) => {
    if (!window.confirm(`Suspend ${name}? They will be unable to sign in.`)) return;
    runAction(id, adminAPI.banUser, { is_active: false }, 'User suspended.');
  };

  const handleMakeAdmin = (id, name) => {
    // Promotion cannot be undone from this screen, so it gets a confirmation.
    if (!window.confirm(`Make ${name} an administrator? This grants full access to every user and request.`)) return;
    runAction(id, adminAPI.makeAdmin, { is_admin: true }, 'User promoted to admin.');
  };

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((item) =>
      ['full_name', 'email', 'city']
        .some((field) => String(item[field] ?? '').toLowerCase().includes(needle))
    );
  }, [users, search]);

  return (
    <Layout>
      <PageHeader
        title="Manage users"
        subtitle={loading ? undefined : `${users.length} registered account${users.length === 1 ? '' : 's'}`}
      />

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email or city"
            icon={<Search size={16} />}
            aria-label="Search users"
          />
        </div>
      </div>

      {loading ? (
        <Spinner fullPage label="Loading users" />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Users size={24} />}
          title={search ? 'No users match your search' : 'No users yet'}
          description={search ? 'Try a different name, email, or city.' : undefined}
        />
      ) : (
        <div className={styles.scroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>User</th>
                <th className={styles.th}>Contact</th>
                <th className={styles.th}>Blood type</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th} style={{ textAlign: 'end' }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {visible.map((item) => {
                const busy = busyId === item.id;
                // An admin must not be able to suspend or demote themselves and
                // lock the whole platform out of administration.
                const isSelf = item.id === currentUser?.id;

                return (
                  <tr key={item.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div className={styles.person}>
                        <span className={styles.avatar}>
                          {item.full_name?.charAt(0).toUpperCase()}
                        </span>
                        <span style={{ minWidth: 0 }}>
                          <span className={styles.personName}>{item.full_name}</span>
                          <span className={styles.personMeta}>{item.email}</span>
                        </span>
                      </div>
                    </td>

                    <td className={`${styles.td} ${styles.tdMuted}`}>
                      {item.phone}
                      <br />
                      {item.city || '—'}
                    </td>

                    <td className={styles.td}>
                      <Badge variant="blood">{item.blood_type}</Badge>
                    </td>

                    <td className={styles.td}>
                      <div className={styles.badges}>
                        {item.is_admin && <Badge variant="warning">Admin</Badge>}
                        {item.is_donor && <Badge variant="accent">Donor</Badge>}
                        {item.is_verified
                          ? <Badge variant="success">Verified</Badge>
                          : <Badge variant="neutral">Unverified</Badge>}
                        {!item.is_active && <Badge variant="danger">Suspended</Badge>}
                      </div>
                    </td>

                    <td className={styles.td}>
                      <div className={styles.rowActions}>
                        {!item.is_verified && (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={busy}
                            onClick={() => runAction(
                              item.id, adminAPI.verifyUser, { is_verified: true }, 'User verified.'
                            )}
                          >
                            <CheckCircle size={14} /> Verify
                          </Button>
                        )}

                        {!item.is_admin && !isSelf && (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={busy}
                            onClick={() => handleMakeAdmin(item.id, item.full_name)}
                          >
                            <ShieldCheck size={14} /> Make admin
                          </Button>
                        )}

                        {item.is_active ? (
                          !isSelf && (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={busy}
                              onClick={() => handleBan(item.id, item.full_name)}
                            >
                              <Ban size={14} /> Suspend
                            </Button>
                          )
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={busy}
                            onClick={() => runAction(
                              item.id, adminAPI.unbanUser, { is_active: true }, 'User restored.'
                            )}
                          >
                            <Undo2 size={14} /> Restore
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

export default ManageUsers;
