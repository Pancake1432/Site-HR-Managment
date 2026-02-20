import { Component, type ErrorInfo, type ReactNode } from 'react';
import '../../styles/errors.css';

interface Props {
  children: ReactNode;
  /** Optional custom fallback UI */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // In production you'd send this to your error tracking service, e.g.:
    // Sentry.captureException(error, { extra: errorInfo });
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    const errorMessage = this.state.error?.message ?? 'An unexpected error occurred.';
    const componentStack = this.state.errorInfo?.componentStack ?? '';

    return (
      <div className="error-page">
        <div className="error-orbit error-orbit-1" />
        <div className="error-orbit error-orbit-2" />
        <div className="error-orbit error-orbit-3" />

        <div className="error-content">
          <div className="error-status-pill">
            <span className="error-status-dot" />
            Runtime Error
          </div>

          <div className="error-code" data-text="ERR">ERR</div>

          <h1 className="error-title">The app crashed unexpectedly</h1>

          <p className="error-description">
            Something went wrong while rendering this page. Try reloading —
            if the problem persists, contact support.
          </p>

          {(errorMessage || componentStack) && (
            <div className="error-detail-card">
              <div className="error-detail-label">Error</div>
              <code>
                {errorMessage}
                {componentStack && `\n\nComponent Stack:${componentStack.substring(0, 300)}...`}
              </code>
            </div>
          )}

          <div className="error-actions">
            <button className="error-btn-primary" onClick={this.handleReload}>
              ↻ Reload Page
            </button>
            <button className="error-btn-secondary" onClick={this.handleReset}>
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}
