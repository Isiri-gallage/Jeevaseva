import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.content}>
            <div style={styles.icon}>⚠️</div>
            <h1 style={styles.title}>Something went wrong</h1>
            <p style={styles.message}>
              An unexpected error occurred. Please refresh the page.
            </p>
            <button
              style={styles.btn}
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', backgroundColor: '#F2F3F4',
  },
  content: {
    textAlign: 'center', backgroundColor: 'white',
    borderRadius: '16px', padding: '48px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', maxWidth: '400px',
  },
  icon: { fontSize: '48px', marginBottom: '16px' },
  title: {
    fontSize: '24px', fontFamily: 'Playfair Display, serif',
    color: '#2C3E50', marginBottom: '12px',
  },
  message: { color: '#7F8C8D', marginBottom: '24px', lineHeight: '1.6' },
  btn: {
    padding: '12px 32px', backgroundColor: '#C0392B', color: 'white',
    borderRadius: '10px', border: 'none', fontSize: '15px',
    fontWeight: '500', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
  },
};

export default ErrorBoundary;