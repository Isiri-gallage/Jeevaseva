import { useNavigate } from 'react-router-dom';
import { Heart, Users, Shield, Activity, ArrowRight, Droplets } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.logo} onClick={() => navigate('/')}>
          <span style={styles.logoEmoji}>🫀</span>
          <span style={styles.logoText}>RaktaSeva</span>
        </div>
        <div style={styles.navLinks}>
          <button style={styles.loginBtn} onClick={() => navigate('/login')}>
            Log In
          </button>
          <button style={styles.registerBtn} onClick={() => navigate('/register')}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>
            <Heart size={14} fill="#8E44AD" color="#8E44AD" />
            <span>Sri Lanka's Premium Organ & Blood Matching Network</span>
          </div>
          <h1 style={styles.heroTitle}>
            A Living Gift.<br />
            <span style={styles.heroHighlight}>Connecting Kidney Donors</span> <br />
            with Patients.
          </h1>
          <p style={styles.heroSubtitle}>
            A simplified, secure platform for kidney patients to discover willing altruistic donors, 
            unlock instant coordination chat, and transition smoothly to hospital handovers. 
            Includes a supportive emergency blood request network.
          </p>
          <div style={styles.heroButtons}>
            <button
              style={styles.primaryBtn}
              onClick={() => navigate('/register')}
            >
              Register as Kidney Donor <Heart size={16} fill="white" />
            </button>
            <button
              style={styles.secondaryBtn}
              onClick={() => navigate('/register')}
            >
              Need a Kidney? Post Request <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <div style={styles.heroVisual}>
          <div style={styles.visualCard}>
            <div style={styles.visualHeart}>🫀</div>
            <div style={styles.visualRings}></div>
            <div style={styles.compatBadge}>O+ ➔ A+ Compatible</div>
          </div>
        </div>
      </div>

      {/* Simplified Stats */}
      <div style={styles.stats}>
        {[
          { number: '150+', label: 'Successful Matches' },
          { number: '2,400+', label: 'Registered Donors' },
          { number: '100% Free', label: 'Altruistic & Non-Commercial' },
          { number: '24/7 Support', label: 'Emergency Blood Network' },
        ].map((stat, i) => (
          <div key={i} style={styles.statCard}>
            <div style={styles.statNumber}>{stat.number}</div>
            <div style={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Core Focus Section: Kidney Matching */}
      <div style={styles.features}>
        <h2 style={styles.sectionTitle}>How We Connect Patients & Donors</h2>
        <div style={styles.featureGrid}>
          {[
            {
              icon: <Activity size={32} color="#8E44AD" />,
              title: 'ABO Cross-Matching',
              desc: 'Our engine automatically calculates compatibility metrics so patients and donors instantly know if they can match.'
            },
            {
              icon: <Users size={32} color="#8E44AD" />,
              title: 'Direct Connection',
              desc: 'Donors express interest, and patients accept. Connection approvals instantly unlock secure direct contact.'
            },
            {
              icon: <MessageSquareIcon size={32} color="#8E44AD" />,
              title: 'Secure Coordination Chat',
              desc: 'Introduce yourselves, exchange details, and coordinate your clinical schedules via WebSocket-based real-time chat.'
            },
            {
              icon: <Shield size={32} color="#8E44AD" />,
              title: 'Hospital Handover',
              desc: 'Track connection progress directly on the platform until handover is complete. All surgeries happen in registered Sri Lankan hospitals.'
            },
          ].map((feature, i) => (
            <div key={i} style={styles.featureCard}>
              <div style={styles.featureIcon}>{feature.icon}</div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDesc}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary Service Section: Blood Requests */}
      <div style={styles.bloodSection}>
        <div style={styles.bloodContainer}>
          <div style={styles.bloodTextSide}>
            <div style={styles.bloodBadge}>
              <Droplets size={14} fill="#C0392B" color="#C0392B" />
              <span>Emergency Blood Support</span>
            </div>
            <h2 style={styles.bloodTitle}>Need Blood Urgently?</h2>
            <p style={styles.bloodDesc}>
              RaktaSeva also maintains an emergency-tier blood requests board. 
              If you or your loved ones require blood units immediately at any Sri Lankan hospital, 
              post a request and get matched with compatible blood donors nearby in minutes.
            </p>
            <button style={styles.bloodBtn} onClick={() => navigate('/register')}>
              Access Emergency Blood Board
            </button>
          </div>
          <div style={styles.bloodIconSide}>
            <div style={styles.bloodDropAnimation}>🩸</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={styles.cta}>
        <h2 style={styles.ctaTitle}>Make a Difference Today</h2>
        <p style={styles.ctaSubtitle}>
          Whether you want to offer the gift of life as a kidney donor or require emergency blood units, join us.
        </p>
        <button
          style={styles.ctaBtn}
          onClick={() => navigate('/register')}
        >
          Join RaktaSeva Network 🫀
        </button>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerLogo}>🫀 RaktaSeva</div>
        <p style={styles.footerText}>
          Serving Life Through Organ & Blood Matching • Sri Lanka
        </p>
      </footer>
    </div>
  );
};

// Simple Lucide wrapper fallback in case of icon mismatch
const MessageSquareIcon = ({ size, color }) => (
  <Heart size={size} color={color} fill={color} />
);

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#FAF9FC', color: '#2C3E50', fontFamily: 'DM Sans, sans-serif' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 60px', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', position: 'sticky', top: 0, zIndex: 100 },
  logo: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '24px', cursor: 'pointer' },
  logoEmoji: { fontSize: '26px' },
  logoText: { fontFamily: 'Playfair Display, serif', fontWeight: '700', color: '#8E44AD' },
  navLinks: { display: 'flex', gap: '12px' },
  loginBtn: { padding: '10px 24px', borderRadius: '8px', border: '2px solid #8E44AD', backgroundColor: 'transparent', color: '#8E44AD', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  registerBtn: { padding: '10px 24px', borderRadius: '8px', backgroundColor: '#8E44AD', color: 'white', border: 'none', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  hero: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '80px 60px', background: 'linear-gradient(135deg, #FAF9FC 0%, #F5EEF8 100%)', minHeight: '80vh', flexWrap: 'wrap', gap: '40px' },
  heroContent: { maxWidth: '640px', flex: 1, minWidth: '320px' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#F5EEF8', color: '#8E44AD', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', marginBottom: '24px' },
  heroTitle: { fontSize: '56px', fontFamily: 'Playfair Display, serif', fontWeight: '900', color: '#1B2631', lineHeight: '1.15', marginBottom: '24px' },
  heroHighlight: { color: '#8E44AD' },
  heroSubtitle: { fontSize: '17px', color: '#7F8C8D', lineHeight: '1.7', marginBottom: '40px' },
  heroButtons: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  primaryBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 32px', backgroundColor: '#8E44AD', color: 'white', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', border: 'none', fontFamily: 'DM Sans, sans-serif', boxShadow: '0 4px 16px rgba(142,68,173,0.3)' },
  secondaryBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 32px', backgroundColor: 'transparent', color: '#8E44AD', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', border: '2px solid #8E44AD', fontFamily: 'DM Sans, sans-serif' },
  heroVisual: { display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minWidth: '300px' },
  visualCard: { position: 'relative', width: '300px', height: '300px', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 12px 40px rgba(142,68,173,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
  visualHeart: { fontSize: '120px', zIndex: 2, filter: 'drop-shadow(0 4px 12px rgba(142,68,173,0.2))' },
  visualRings: { position: 'absolute', width: '220px', height: '220px', borderRadius: '50%', border: '2px dashed rgba(142,68,173,0.25)', animation: 'spin 30s linear infinite' },
  compatBadge: { position: 'absolute', bottom: '24px', backgroundColor: '#EBFAF1', color: '#27AE60', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', boxShadow: '0 2px 8px rgba(39,174,96,0.15)' },
  stats: { display: 'flex', justifyContent: 'space-around', padding: '40px 60px', backgroundColor: '#8E44AD', flexWrap: 'wrap', gap: '24px' },
  statCard: { textAlign: 'center', color: 'white', minWidth: '150px' },
  statNumber: { fontSize: '42px', fontFamily: 'Playfair Display, serif', fontWeight: '800' },
  statLabel: { fontSize: '14px', opacity: 0.85, marginTop: '4px' },
  features: { padding: '80px 60px', backgroundColor: 'white' },
  sectionTitle: { fontSize: '38px', fontFamily: 'Playfair Display, serif', textAlign: 'center', color: '#1B2631', marginBottom: '48px' },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' },
  featureCard: { backgroundColor: '#FAF9FC', borderRadius: '16px', padding: '32px', textAlign: 'left', border: '1px solid #F5EEF8' },
  featureIcon: { marginBottom: '20px' },
  featureTitle: { fontSize: '20px', fontFamily: 'Playfair Display, serif', color: '#1B2631', marginBottom: '12px', fontWeight: '700' },
  featureDesc: { fontSize: '14.5px', color: '#7F8C8D', lineHeight: '1.6' },
  bloodSection: { padding: '80px 60px', background: 'linear-gradient(135deg, #FFF5F5 0%, #FADBD8 100%)' },
  bloodContainer: { display: 'flex', maxWidth: '1100px', margin: '0 auto', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '40px' },
  bloodTextSide: { flex: 1.2, minWidth: '320px' },
  bloodBadge: { display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#FADBD8', color: '#C0392B', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', marginBottom: '16px' },
  bloodTitle: { fontSize: '36px', fontFamily: 'Playfair Display, serif', color: '#78281F', marginBottom: '20px' },
  bloodDesc: { fontSize: '16px', color: '#641E16', lineHeight: '1.7', marginBottom: '32px' },
  bloodBtn: { padding: '14px 28px', backgroundColor: '#C0392B', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: '0 4px 16px rgba(192,57,43,0.2)' },
  bloodIconSide: { flex: 0.8, display: 'flex', justifyContent: 'center', minWidth: '240px' },
  bloodDropAnimation: { fontSize: '110px' },
  cta: { backgroundColor: '#FAF9FC', padding: '80px 60px', textAlign: 'center', borderTop: '1px solid #F5EEF8' },
  ctaTitle: { fontSize: '40px', fontFamily: 'Playfair Display, serif', color: '#1B2631', marginBottom: '16px' },
  ctaSubtitle: { fontSize: '17px', color: '#7F8C8D', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' },
  ctaBtn: { padding: '18px 48px', backgroundColor: '#8E44AD', color: 'white', border: 'none', borderRadius: '12px', fontSize: '17px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: '0 4px 16px rgba(142,68,173,0.3)' },
  footer: { backgroundColor: '#1B2631', padding: '40px 60px', textAlign: 'center' },
  footerLogo: { fontSize: '24px', color: 'white', fontFamily: 'Playfair Display, serif', marginBottom: '8px' },
  footerText: { color: '#95A5A6', fontSize: '13px' },
};

export default Home;