import { useNavigate } from 'react-router-dom';
import '../../styles/errors.css';

interface MaintenancePageProps {
  /** Optional estimated time back online, e.g. "5 minutes" */
  eta?: string;
}

export default function MaintenancePage({ eta }: MaintenancePageProps) {
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <div className="error-orbit error-orbit-1" />
      <div className="error-orbit error-orbit-2" />
      <div className="error-orbit error-orbit-3" />

      <div className="error-content">
        <div className="error-status-pill">
          <span className="error-status-dot" />
          503 · Service Unavailable
        </div>

        <div className="error-code" data-text="503">503</div>

        <h1 className="error-title">Down for maintenance</h1>

        <p className="error-description">
          We're performing scheduled maintenance to improve your experience.
        </p>

        <div className="error-divider" />

        <div className="error-actions">
          <button className="error-btn-primary" onClick={() => window.location.reload()}>
            ↻ Check Again
          </button>
          <button className="error-btn-secondary" onClick={() => navigate('/')}>
            ← Home
          </button>
        </div>
      </div>
    </div>
  );
}
