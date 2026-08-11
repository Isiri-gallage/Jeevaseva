import { ArrowRight, Check, CheckCircle, MessageSquare, Phone, XCircle } from 'lucide-react';
import { Badge, Button, Card } from '../../../components/ui';
import styles from '../../../styles/Cards.module.css';

/*
 * The connection lifecycle. Keeping it as data means the timeline and the
 * "what happens next" button are driven by the same source, so they can never
 * disagree about which stage the match is in.
 */
export const MATCH_STAGES = [
  { id: 'pending_contact', label: 'Offered', desc: 'Awaiting patient' },
  { id: 'contacted', label: 'In contact', desc: 'Chat unlocked' },
  { id: 'hospital', label: 'Hospital', desc: 'Medical testing' },
  { id: 'completed', label: 'Completed', desc: 'Handover done' },
];

/** The single action that advances this match, or null if there is none. */
const nextStep = (status) => {
  if (status === 'contacted') {
    return { status: 'hospital', label: 'Move to hospital coordination', icon: <ArrowRight size={15} /> };
  }
  if (status === 'hospital') {
    return { status: 'completed', label: 'Mark as completed', icon: <CheckCircle size={15} /> };
  }
  return null;
};

const MatchCard = ({ match, isDonor, busy, onAccept, onUpdateStatus, onOpenChat }) => {
  const counterpartName = isDonor ? match.patient_name : match.donor_name;
  const counterpartRole = isDonor ? 'Patient' : 'Donor';
  const contactNumber = isDonor ? match.patient_contact : match.donor_contact;
  const bloodType = isDonor ? match.patient_blood_type : match.donor_blood_type;
  const city = isDonor ? match.hospital_city : match.donor_city;

  const cancelled = match.status === 'cancelled';
  const completed = match.status === 'completed';
  const locked = match.status === 'pending_contact';

  const currentIndex = MATCH_STAGES.findIndex((stage) => stage.id === match.status);
  const advance = nextStep(match.status);

  return (
    <Card padding="lg">
      <div className={styles.matchTop}>
        <div>
          <span className={styles.matchRole}>{counterpartRole} connection</span>
          <h3 className={styles.name}>{counterpartName}</h3>
          <p className={styles.meta}>
            Blood type {bloodType}{city ? ` · ${city}` : ''}
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenChat}
          disabled={locked || cancelled}
          title={locked ? 'Chat unlocks once the patient accepts' : 'Open secure chat'}
        >
          <MessageSquare size={15} />
          {locked ? 'Chat locked' : 'Open chat'}
        </Button>
      </div>

      {/* Timeline. Hidden once cancelled — showing progress through a workflow
        * that has been abandoned is misleading. */}
      {!cancelled && (
        <div className={styles.timeline}>
          {MATCH_STAGES.map((stage, index) => {
            const done = index <= currentIndex;
            const current = index === currentIndex;
            return (
              <div key={stage.id} className={styles.step}>
                <span
                  className={[
                    styles.dot,
                    done && styles.dotDone,
                    current && styles.dotCurrent,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden="true"
                >
                  {done && <Check size={13} strokeWidth={3} />}
                </span>
                <span>
                  <span className={styles.stepLabel}>{stage.label}</span>
                  <span className={styles.stepDesc}>{stage.desc}</span>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {match.message && <p className={styles.quote}>{match.message}</p>}

      <div className={styles.matchFooter}>
        {/* Phone number is withheld until the patient accepts — that acceptance
          * is the consent step for sharing contact details. */}
        {!locked && !cancelled && contactNumber && (
          <a href={`tel:${contactNumber}`} className={styles.callLink}>
            <Phone size={15} /> {contactNumber}
          </a>
        )}

        <div className={styles.footerActions}>
          {cancelled && <Badge variant="neutral">Cancelled</Badge>}
          {completed && <Badge variant="success">Completed</Badge>}

          {!isDonor && locked && (
            <Button size="sm" onClick={onAccept} disabled={busy}>
              Accept and unlock chat
            </Button>
          )}

          {advance && (
            <Button size="sm" onClick={() => onUpdateStatus(advance.status)} disabled={busy}>
              {advance.label} {advance.icon}
            </Button>
          )}

          {!completed && !cancelled && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onUpdateStatus('cancelled')}
              disabled={busy}
            >
              <XCircle size={15} /> Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MatchCard;
