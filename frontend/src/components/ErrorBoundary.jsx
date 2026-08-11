import { Component } from 'react';
import { AlertTriangle, Home, RotateCw } from 'lucide-react';
import styles from './ErrorBoundary.module.css';

/**
 * Catches render errors anywhere below it and shows a recovery screen instead
 * of React unmounting the whole tree into a blank white page.
 *
 * Must stay a class component: getDerivedStateFromError and componentDidCatch
 * have no hook equivalent, so this is one of the few places where a class is
 * still the only option.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // In production this is where an error reporter (Sentry, Rollbar, …) would
    // be called. Logging to the console is the honest placeholder until one is
    // wired up — a crash nobody is told about is a crash nobody fixes.
    console.error('Uncaught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    // A full navigation rather than a router push: the router lives inside the
    // tree that just crashed, so it cannot be trusted to still work.
    window.location.assign('/');
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const isDevelopment = process.env.NODE_ENV === 'development';

    return (
      <div className={styles.container} role="alert">
        <div className={styles.card}>
          <div className={styles.icon}>
            <AlertTriangle size={24} />
          </div>

          <h1 className={styles.title}>Something went wrong</h1>

          <p className={styles.message}>
            An unexpected error stopped this page from loading. Your data is
            safe — reloading usually fixes it.
          </p>

          <div className={styles.actions}>
            <button className={styles.button} onClick={this.handleReload}>
              <RotateCw size={16} /> Reload page
            </button>
            <button
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={this.handleGoHome}
            >
              <Home size={16} /> Go home
            </button>
          </div>

          {isDevelopment && this.state.error && (
            <details className={styles.details}>
              <summary className={styles.summary}>
                Error details (development only)
              </summary>
              <pre className={styles.trace}>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
