import { useNavigate } from 'react-router-dom';
import '../styles/errors.css';
import { Emoji } from '../components/Emoji';

export default function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <div className="error-page">
      <button className="error-brand" onClick={() => navigate('/')}>
        <div className="error-brand-icon"><Emoji symbol="🏢" size={18} /></div>
        HR Manager
      </button>

      <div className="error-content">
        <div className="error-icon"><Emoji symbol="🔒" size={38} /></div>

        <div className="error-status-pill">
          <span className="error-status-dot" />
          403 · Access Denied
        </div>

        <div className="error-code">403</div>

        <h1 className="error-title">You're not cleared for this</h1>

        <p className="error-description">
          Your account doesn't have permission to view this area.
          If you think this is a mistake, contact your administrator or sign in
          with a different account.
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

      <p className="error-footer">© 2026 Paks Logistic LLC</p>
    </div>
  );
}
