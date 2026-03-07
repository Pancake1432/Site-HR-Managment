import { useNavigate } from 'react-router-dom';
import '../styles/errors.css';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="error-page">
      {/* Orbit decorations */}
      <div className="error-orbit error-orbit-1" />
      <div className="error-orbit error-orbit-2" />
      <div className="error-orbit error-orbit-3" />

      <div className="error-content">
        <div className="error-status-pill">
          <span className="error-status-dot" />
          404 · Page Not Found
        </div>

        <div className="error-code" data-text="404">404</div>

        <h1 className="error-title">You've drifted off the map</h1>

        <p className="error-description">
          The page you're looking for doesn't exist, was moved, or you may
          have followed a broken link. Double-check the URL and try again.
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
    </div>
  );
}
