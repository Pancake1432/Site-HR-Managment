import { useNavigate } from 'react-router-dom';
import '../styles/errors.css';
import { Emoji } from '../components/Emoji';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="error-page">
      <button className="error-brand" onClick={() => navigate('/')}>
        <div className="error-brand-icon"><Emoji symbol="🏢" size={18} /></div>
        HR Manager
      </button>

      <div className="error-content">
        <div className="error-icon"><Emoji symbol="🗺️" size={38} /></div>

        <div className="error-status-pill">
          <span className="error-status-dot" />
          404 · Page Not Found
        </div>

        <div className="error-code">404</div>

        <h1 className="error-title">You've drifted off the map</h1>

        <p className="error-description">
          This page doesn't exist, was moved, or you followed a broken link.
          Double-check the URL and try again.
        </p>

        <div className="error-actions">
          <button className="error-btn-primary" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
          <button className="error-btn-secondary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>

      <p className="error-footer">© 2026 Paks Logistic LLC</p>
    </div>
  );
}
