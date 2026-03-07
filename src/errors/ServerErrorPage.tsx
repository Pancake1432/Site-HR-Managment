import { useNavigate } from 'react-router-dom';
import '../styles/errors.css';

interface ServerErrorPageProps {
  errorMessage?: string;
}

export default function ServerErrorPage({ errorMessage }: ServerErrorPageProps) {
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <div className="error-orbit error-orbit-1" />
      <div className="error-orbit error-orbit-2" />
      <div className="error-orbit error-orbit-3" />

      <div className="error-content">
        <div className="error-status-pill">
          <span className="error-status-dot" />
          500 · Server Error
        </div>

        <div className="error-code" data-text="500">500</div>

        <h1 className="error-title">Something broke on our end</h1>

        <p className="error-description">
          An unexpected error occurred on the server. Our team has been
          notified. Please try again in a moment — it usually clears up quickly.
        </p>

        {errorMessage && (
          <div className="error-detail-card">
            <div className="error-detail-label">Error Details</div>
            <code>{errorMessage}</code>
          </div>
        )}

        <div className="error-actions">
          <button className="error-btn-primary" onClick={() => window.location.reload()}>
            ↻ Reload Page
          </button>
          <button className="error-btn-secondary" onClick={() => navigate('/')}>
            ← Home
          </button>
        </div>
      </div>
    </div>
  );
}
