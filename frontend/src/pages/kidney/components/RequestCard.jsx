import { Activity, Building2, Clock, Heart, MapPin } from 'lucide-react';
import { Badge, Button, Card } from '../../../components/ui';
import { getTimeAgo } from '../../../utils/helpers';
import styles from '../../../styles/Cards.module.css';

/**
 * A single patient's kidney request.
 *
 * @param {object} request
 * @param {boolean} isOwn            Viewer posted this request
 * @param {object|null} compatibility  Result of getABOCompatibility, or null
 *                                     when the viewer is not a registered donor
 */
const RequestCard = ({ request, isOwn, compatibility, onOffer, onManage, busy }) => (
  <Card padding="lg">
    <div className={styles.tags}>
      <span className={styles.bloodType}>{request.blood_type}</span>
      <Badge variant="accent">Kidney patient</Badge>
      {isOwn && <Badge variant="neutral">Your post</Badge>}
    </div>

    <h3 className={styles.name}>{request.patient_name}</h3>
    <p className={styles.meta}>{request.patient_age} years old</p>

    <div className={styles.details}>
      <span className={styles.detail}>
        <Building2 size={15} />
        <span className={styles.detailValue}>{request.hospital_name}</span>
      </span>
      <span className={styles.detail}>
        <MapPin size={15} />
        <span className={styles.detailValue}>{request.hospital_city}</span>
      </span>
      <span className={styles.detail}>
        <Clock size={15} />
        <span className={styles.detailValue}>Posted {getTimeAgo(request.created_at)}</span>
      </span>
      {request.dialysis_duration && (
        <span className={styles.detail}>
          <Activity size={15} />
          <span className={styles.detailValue}>On dialysis: {request.dialysis_duration}</span>
        </span>
      )}
    </div>

    {request.medical_details && (
      <p className={styles.quote}>{request.medical_details}</p>
    )}

    {/* Only shown to registered donors — nobody else has a blood type on file
      * to compare against. */}
    {compatibility && !isOwn && (
      <div
        className={[
          styles.compat,
          compatibility.compatible ? styles.compatOk : styles.compatNo,
        ].join(' ')}
      >
        <Activity size={15} aria-hidden="true" />
        {compatibility.label}
      </div>
    )}

    <div className={styles.actions}>
      {isOwn ? (
        <Button variant="secondary" fullWidth onClick={onManage}>
          Manage post
        </Button>
      ) : (
        <Button fullWidth onClick={onOffer} disabled={busy}>
          <Heart size={15} /> Offer to donate
        </Button>
      )}
    </div>

    {compatibility && !isOwn && (
      <span className={styles.compatNote}>
        ABO screening only. Tissue typing and a crossmatch at a transplant
        centre determine actual suitability.
      </span>
    )}
  </Card>
);

export default RequestCard;
