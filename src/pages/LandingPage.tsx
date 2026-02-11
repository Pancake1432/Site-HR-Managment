import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-content">
        <div className="logo-section">
          <div className="logo-icon">🏢</div>
          <h1 className="main-title">HR Management System</h1>
          <p className="subtitle">Streamline your hiring and management process</p>
        </div>

        <div className="action-cards">
          <div className="action-card" onClick={() => navigate('/login')}>
            <div className="card-icon">🔐</div>
            <h2>HR Manager Login</h2>
            <p>Access your dashboard to manage drivers, documents, and payroll</p>
            <button className="card-button">Login to Dashboard</button>
          </div>

          <div className="action-card" onClick={() => navigate('/apply')}>
            <div className="card-icon">📝</div>
            <h2>Driver Application</h2>
            <p>Apply to join Paks Logistic LLC as a professional driver</p>
            <button className="card-button">Apply Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
