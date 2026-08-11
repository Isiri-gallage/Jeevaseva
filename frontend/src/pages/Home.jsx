import { useNavigate } from 'react-router-dom';
import {
  Heart, Users, Shield, Activity, ArrowRight, Droplets,
  MessageCircle, CheckCircle2, Lock,
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import styles from './Home.module.css';

/*
 * Content lives in arrays above the markup rather than inline in the JSX.
 * Keeps the render tree readable and makes the copy easy to find and edit
 * later — the first step toward translating this into Sinhala and Tamil.
 */
const STATS = [
  { value: '150+', label: 'Connections made' },
  { value: '2,400+', label: 'Registered donors' },
  { value: 'Free', label: 'Always non-commercial' },
  { value: '24/7', label: 'Emergency blood board' },
];

const STEPS = [
  {
    step: 'Step 01',
    icon: <Activity size={20} />,
    title: 'Post your request',
    text: 'Share your blood type, hospital, and dialysis history. Compatible donors see it immediately.',
  },
  {
    step: 'Step 02',
    icon: <Users size={20} />,
    title: 'A donor reaches out',
    text: 'Living donors browse open requests and express interest. You choose who to connect with.',
  },
  {
    step: 'Step 03',
    icon: <MessageCircle size={20} />,
    title: 'Talk privately',
    text: 'Accepting a donor opens a private, authenticated chat. Only the two of you can read it.',
  },
  {
    step: 'Step 04',
    icon: <Shield size={20} />,
    title: 'Move to the hospital',
    text: 'Track progress through to handover. Every transplant happens at a registered Sri Lankan hospital.',
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>

      {/* ─── Navigation ─────────────────────────────────── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <button className={styles.logo} onClick={() => navigate('/')}>
            <span className={styles.logoMark}>
              <Heart size={15} fill="currentColor" />
            </span>
            RaktaSeva
          </button>

          <div className={styles.navActions}>
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Log in
            </Button>
            <Button size="sm" pill onClick={() => navigate('/register')}>
              Get started
            </Button>
          </div>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────── */}
      <header className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />

        <div className={`${styles.section} ${styles.heroGrid}`}>
          <div className={styles.reveal}>
            <span className={styles.eyebrow}>
              <Heart size={12} fill="var(--color-accent)" color="var(--color-accent)" />
              Sri Lanka&apos;s living-donor network
            </span>

            <h1 className={styles.title}>
              A kidney patient shouldn&apos;t have to{' '}
              <span className={styles.titleAccent}>search alone.</span>
            </h1>

            <p className={styles.lede}>
              RaktaSeva connects people waiting for a kidney with living donors who
              want to help — directly, privately, and without a fee. When a match
              is made, you both take it to a transplant centre from there.
            </p>

            <div className={styles.heroActions}>
              <Button size="lg" onClick={() => navigate('/register')}>
                Find a donor <ArrowRight size={17} />
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate('/register')}>
                <Heart size={16} /> Offer to donate
              </Button>
            </div>

            <div className={styles.trustRow}>
              <span className={styles.trustItem}>
                <CheckCircle2 size={15} color="var(--color-success)" /> Free forever
              </span>
              <span className={styles.trustItem}>
                <Lock size={15} color="var(--color-success)" /> Private by default
              </span>
              <span className={styles.trustItem}>
                <Shield size={15} color="var(--color-success)" /> Hospital-verified handover
              </span>
            </div>
          </div>

          <div className={styles.heroCard}>
            <span className={`${styles.ring} ${styles.ringOuter}`} aria-hidden="true" />
            <span className={`${styles.ring} ${styles.ringInner}`} aria-hidden="true" />
            <span className={styles.heroCardGlyph} role="img" aria-label="Kidney">
              🫀
            </span>
            <span className={styles.heroChip}>O+ → A+ compatible</span>
          </div>
        </div>
      </header>

      {/* ─── Stats ──────────────────────────────────────── */}
      <div className={styles.section}>
        <div className={styles.stats}>
          {STATS.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── How it works ───────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionBlock}`}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>From request to handover</h2>
          <p className={styles.sectionLede}>
            Four steps, each one visible to both sides. No intermediaries, no
            brokers, and no payment at any point.
          </p>
        </div>

        <div className={styles.featureGrid}>
          {STEPS.map((item) => (
            <Card key={item.title} padding="lg">
              <div className={styles.featureIcon}>{item.icon}</div>
              <div className={styles.featureStep}>{item.step}</div>
              <h3 className={styles.featureTitle}>{item.title}</h3>
              <p className={styles.featureText}>{item.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── Blood donation ─────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionBlock}`}>
        <div className={styles.bloodPanel}>
          <div>
            <Badge variant="blood" size="lg">
              <Droplets size={13} /> Emergency blood
            </Badge>

            <h2 className={styles.sectionTitle} style={{ marginTop: 'var(--space-5)' }}>
              Need blood tonight?
            </h2>
            <p className={styles.sectionLede} style={{ marginBottom: 'var(--space-8)' }}>
              The same donor base powers an emergency blood board. Post the
              hospital and blood type, and compatible donors nearby are notified
              straight away.
            </p>

            <Button variant="blood" onClick={() => navigate('/register')}>
              Open the blood board <ArrowRight size={16} />
            </Button>
          </div>

          <div className={styles.bloodGlyph} role="img" aria-label="Blood drop">
            🩸
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.cta}>
          <h2 className={styles.ctaTitle}>One person can end someone&apos;s wait</h2>
          <p className={styles.ctaLede}>
            Whether you are searching for a kidney or willing to give one, joining
            takes about a minute.
          </p>
          <Button size="lg" variant="secondary" pill onClick={() => navigate('/register')}>
            Join RaktaSeva <ArrowRight size={17} />
          </Button>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────── */}
      <footer className={`${styles.section} ${styles.footer}`}>
        <div className={styles.footerInner}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>
              <Heart size={15} fill="currentColor" />
            </span>
            RaktaSeva
          </div>
          <p className={styles.footerNote}>
            Connecting kidney patients and living donors · Sri Lanka
          </p>
        </div>

        {/* Stated plainly rather than buried in terms — a platform in this space
          * has an obligation to be unambiguous about what it is not. */}
        <p className={styles.disclaimer}>
          RaktaSeva is a connection platform, not a medical service. We do not
          perform tissue typing, crossmatch testing, or organ allocation, and we
          are not involved in any surgical decision. Every connection made here
          must proceed through a registered transplant centre. Buying or selling
          organs is illegal in Sri Lanka; this platform is strictly for
          altruistic, unpaid donation.
        </p>
      </footer>
    </div>
  );
};

export default Home;
