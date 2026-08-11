import { Clock, MapPin } from 'lucide-react';
import { Badge, Button, Card } from '../../../components/ui';
import { getTimeAgo } from '../../../utils/helpers';
import styles from '../../../styles/Cards.module.css';

/** A registered living donor in the public directory. */
const DonorCard = ({ donor, isSelf, onEditProfile }) => (
  <Card padding="lg">
    <div className={styles.tags}>
      <span className={`${styles.bloodType} ${styles.bloodTypeDonor}`}>
        {donor.blood_type}
      </span>
      <Badge variant="success">Willing donor</Badge>
      {isSelf && <Badge variant="neutral">You</Badge>}
    </div>

    <h3 className={styles.name}>{donor.full_name}</h3>
    <p className={styles.meta}>{donor.age} years old</p>

    <div className={styles.details}>
      <span className={styles.detail}>
        <MapPin size={15} />
        <span className={styles.detailValue}>{donor.city}</span>
      </span>
      <span className={styles.detail}>
        <Clock size={15} />
        <span className={styles.detailValue}>Registered {getTimeAgo(donor.created_at)}</span>
      </span>
    </div>

    {donor.reason_to_donate && (
      <p className={styles.quote}>{donor.reason_to_donate}</p>
    )}

    {isSelf ? (
      <div className={styles.actions}>
        <Button variant="secondary" fullWidth onClick={onEditProfile}>
          Edit donor profile
        </Button>
      </div>
    ) : (
      // Deliberately no "contact" button here. Connections start from a
      // patient's request so both sides opt in, rather than letting anyone
      // cold-message a donor from a public directory.
      <p className={styles.hintBox}>
        Donors respond to patient requests. Post a request and compatible
        donors will be able to offer.
      </p>
    )}
  </Card>
);

export default DonorCard;
