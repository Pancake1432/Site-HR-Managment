import { useNavigate } from 'react-router-dom';
import '../styles/errors.css';
import { Emoji } from '../components/Emoji';

interface ServerErrorPageProps {
  errorMessage?: string;
}

export default function ServerErrorPage({ errorMessage }: ServerErrorPageProps) {
  const navigate = useNavigate();
  return (
    <div className="error-page">
      <button className="error-brand" onClick={() => navigate('/')}>
        <div className="error-brand-icon"><Emoji symbol="🏢" size={18} /></div>
        HR Manager
      </button>

      <div className="error-content">
        <div className="error-icon"><Emoji symbol="⚙️" size={38} /></div>

        <div className="error-status-pill">
          <span className="error-status-dot" />
          500 · Server Error
        </div>

        <div className="error-code">500</div>

        <h1 className="error-title">Something broke on our end</h1>

        <p className="error-description">
          An unexpected error occurred on the server. Our team has been notified.
          Please try again in a moment — it usually clears up quickly.
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

      <p className="error-footer">© 2026 Paks Logistic LLC</p>
    </div>
  );
}
