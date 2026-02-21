import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-content">
        <div className="logo-section">
          <h1 className="main-title">🏢 HR Management System</h1>
          <p className="subtitle">Streamline your hiring and management process</p>
        </div>

        <div className="action-cards">
          <div className="action-card">
            <div className="card-icon">🔐</div>
            <h2>HR Manager Portal</h2>
            <p>Access your dashboard to manage drivers, documents, and payroll</p>
            <button className="card-button primary full-width" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>

          <div className="action-card">
            <div className="card-icon">📝</div>
            <h2>Driver Application</h2>
            <p>Apply to join Paks Logistic LLC as a professional driver</p>
            <button className="card-button primary full-width" onClick={() => navigate('/apply')}>
              Apply Now
            </button>
          </div>
        </div>

        <footer className="landing-footer">
          <p>© 2026 Paks Logistic LLC. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;
