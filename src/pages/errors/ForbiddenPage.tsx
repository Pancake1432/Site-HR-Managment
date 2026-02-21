import { useNavigate } from 'react-router-dom';
import '../../styles/errors.css';

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <div className="error-orbit error-orbit-1" />
      <div className="error-orbit error-orbit-2" />
      <div className="error-orbit error-orbit-3" />

      <div className="error-content">
        <div className="error-status-pill">
          <span className="error-status-dot" />
          403 · Access Denied
        </div>

        <div className="error-code" data-text="403">403</div>

        <h1 className="error-title">You're not cleared for this</h1>

        <p className="error-description">
          Your account doesn't have permission to access this area.
          If you think this is a mistake, contact your administrator or
          try logging in with a different account.
        </p>

        <div className="error-actions">
          <button className="error-btn-primary" onClick={() => navigate('/login')}>
            🔑 Sign In
          </button>
          <button className="error-btn-secondary" onClick={() => navigate('/')}>
            ← Home
          </button>
        </div>
      </div>
    </div>
  );
}
