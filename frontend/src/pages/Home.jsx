import { useNavigate } from 'react-router-dom';
import { Heart, Users, Clock, Shield } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>
          🩸 <span style={styles.logoText}>RaktaSeva</span>
        </div>
        <div style={styles.navLinks}>
          <button style={styles.loginBtn} onClick={() => navigate('/login')}>
            Login
          </button>
          <button style={styles.registerBtn} onClick={() => navigate('/register')}>
            Register
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>🩸 Sri Lanka's Blood Donor Network</div>
          <h1 style={styles.heroTitle}>
            Every Drop <br />
            <span style={styles.heroHighlight}>Saves a Life</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Connecting blood donors with patients in need across Sri Lanka.
            Register as a donor or post an emergency blood request today.
          </p>
          <div style={styles.heroButtons}>
            <button
              style={styles.primaryBtn}
              onClick={() => navigate('/register')}
            >
              Become a Donor ❤️
            </button>
            <button
              style={styles.secondaryBtn}
              onClick={() => navigate('/register')}
            >
              Need Blood? Post Request
            </button>
          </div>
        </div>
        <div style={styles.heroImage}>
          <div style={styles.bloodDrop}>🩸</div>
          <div style={styles.pulseRing}></div>
        </div>
      </div>

      {/* Stats Section */}
      <div style={styles.stats}>
        {[
          { number: '10,000+', label: 'Registered Donors' },
          { number: '5,000+', label: 'Lives Saved' },
          { number: '25+', label: 'Cities Covered' },
          { number: '24/7', label: 'Emergency Support' },
        ].map((stat, i) => (
          <div key={i} style={styles.statCard}>
            <div style={styles.statNumber}>{stat.number}</div>
            <div style={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Features Section */}
      <div style={styles.features}>
        <h2 style={styles.sectionTitle}>How RaktaSeva Works</h2>
        <div style={styles.featureGrid}>
          {[
            {
              icon: <Heart size={32} color="#C0392B" />,
              title: 'Register as Donor',
              desc: 'Sign up and register your blood type and location to help patients in need.'
            },
            {
              icon: <Users size={32} color="#C0392B" />,
              title: 'Get Matched',
              desc: 'Our system automatically matches donors with compatible blood type requests nearby.'
            },
            {
              icon: <Clock size={32} color="#C0392B" />,
              title: 'Instant Alerts',
              desc: 'Receive real-time notifications when someone near you needs your blood type.'
            },
            {
              icon: <Shield size={32} color="#C0392B" />,
              title: 'Safe & Verified',
              desc: 'All donors and requests are verified to ensure safety and authenticity.'
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

      {/* CTA Section */}
      <div style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to Save a Life?</h2>
        <p style={styles.ctaSubtitle}>
          Join thousands of donors across Sri Lanka making a difference every day.
        </p>
        <button
          style={styles.ctaBtn}
          onClick={() => navigate('/register')}
        >
          Join RaktaSeva Today 🩸
        </button>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerLogo}>🩸 RaktaSeva</div>
        <p style={styles.footerText}>
          Serving Life Through Blood • Sri Lanka
        </p>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#FDFEFE',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 60px',
    backgroundColor: '#FDFEFE',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '24px',
  },
  logoText: {
    fontFamily: 'Playfair Display, serif',
    fontWeight: '700',
    color: '#C0392B',
  },
  navLinks: {
    display: 'flex',
    gap: '12px',
  },
  loginBtn: {
    padding: '10px 24px',
    borderRadius: '8px',
    border: '2px solid #C0392B',
    backgroundColor: 'transparent',
    color: '#C0392B',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
  },
  registerBtn: {
    padding: '10px 24px',
    borderRadius: '8px',
    backgroundColor: '#C0392B',
    color: 'white',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
  },
  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '80px 60px',
    background: 'linear-gradient(135deg, #FDFEFE 0%, #FADBD8 100%)',
    minHeight: '85vh',
  },
  heroContent: {
    maxWidth: '560px',
  },
  badge: {
    display: 'inline-block',
    backgroundColor: '#FADBD8',
    color: '#C0392B',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '24px',
  },
  heroTitle: {
    fontSize: '72px',
    fontFamily: 'Playfair Display, serif',
    fontWeight: '900',
    color: '#2C3E50',
    lineHeight: '1.1',
    marginBottom: '24px',
  },
  heroHighlight: {
    color: '#C0392B',
  },
  heroSubtitle: {
    fontSize: '18px',
    color: '#7F8C8D',
    lineHeight: '1.7',
    marginBottom: '40px',
  },
  heroButtons: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  primaryBtn: {
    padding: '16px 32px',
    backgroundColor: '#C0392B',
    color: 'white',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
    boxShadow: '0 4px 16px rgba(192,57,43,0.3)',
  },
  secondaryBtn: {
    padding: '16px 32px',
    backgroundColor: 'transparent',
    color: '#C0392B',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    border: '2px solid #C0392B',
    fontFamily: 'DM Sans, sans-serif',
  },
  heroImage: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '400px',
    height: '400px',
  },
  bloodDrop: {
    fontSize: '180px',
    zIndex: 2,
    animation: 'pulse 2s infinite',
  },
  pulseRing: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    backgroundColor: 'rgba(192,57,43,0.1)',
    animation: 'pulse 2s infinite',
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
    padding: '60px',
    backgroundColor: '#C0392B',
    flexWrap: 'wrap',
  },
  statCard: {
    textAlign: 'center',
    color: 'white',
  },
  statNumber: {
    fontSize: '48px',
    fontFamily: 'Playfair Display, serif',
    fontWeight: '900',
  },
  statLabel: {
    fontSize: '16px',
    opacity: 0.85,
    marginTop: '4px',
  },
  features: {
    padding: '80px 60px',
    backgroundColor: '#FDFEFE',
  },
  sectionTitle: {
    fontSize: '42px',
    fontFamily: 'Playfair Display, serif',
    textAlign: 'center',
    color: '#2C3E50',
    marginBottom: '48px',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  featureCard: {
    backgroundColor: '#F2F3F4',
    borderRadius: '16px',
    padding: '32px',
    textAlign: 'center',
    transition: 'transform 0.2s',
  },
  featureIcon: {
    marginBottom: '16px',
  },
  featureTitle: {
    fontSize: '20px',
    fontFamily: 'Playfair Display, serif',
    color: '#2C3E50',
    marginBottom: '12px',
  },
  featureDesc: {
    fontSize: '15px',
    color: '#7F8C8D',
    lineHeight: '1.6',
  },
  cta: {
    backgroundColor: '#FADBD8',
    padding: '80px 60px',
    textAlign: 'center',
  },
  ctaTitle: {
    fontSize: '48px',
    fontFamily: 'Playfair Display, serif',
    color: '#2C3E50',
    marginBottom: '16px',
  },
  ctaSubtitle: {
    fontSize: '18px',
    color: '#7F8C8D',
    marginBottom: '40px',
  },
  ctaBtn: {
    padding: '18px 48px',
    backgroundColor: '#C0392B',
    color: 'white',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
    boxShadow: '0 4px 16px rgba(192,57,43,0.3)',
  },
  footer: {
    backgroundColor: '#2C3E50',
    padding: '40px 60px',
    textAlign: 'center',
  },
  footerLogo: {
    fontSize: '24px',
    color: 'white',
    fontFamily: 'Playfair Display, serif',
    marginBottom: '8px',
  },
  footerText: {
    color: '#95A5A6',
    fontSize: '14px',
  },
};

export default Home;