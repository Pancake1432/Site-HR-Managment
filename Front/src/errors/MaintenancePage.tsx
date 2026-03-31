import { useNavigate } from 'react-router-dom';
import '../styles/errors.css';
import { Emoji } from '../components/Emoji';

export default function MaintenancePage() {
  const navigate = useNavigate();
  return (
    <div className="error-page">
      <button className="error-brand" onClick={() => navigate('/')}>
        <div className="error-brand-icon"><Emoji symbol="🏢" size={18} /></div>
        HR Manager
      </button>

      <div className="error-content">
        <div className="error-icon"><Emoji symbol="🛠️" size={38} /></div>

        <div className="error-status-pill">
          <span className="error-status-dot" />
          503 · Service Unavailable
        </div>

        <div className="error-code">503</div>

        <h1 className="error-title">Down for maintenance</h1>

        <p className="error-description">
          We're performing scheduled maintenance to improve your experience.
          We'll be back online shortly — thank you for your patience.
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

      <p className="error-footer">© 2026 Paks Logistic LLC</p>
    </div>
  );
}
