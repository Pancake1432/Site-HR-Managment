import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

type PageType = 'dashboard' | 'drivers' | 'documents' | 'statements' | 'salary' | 'employers';

function Dashboard() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState<PageType>('dashboard');

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">🏢</div>
          <span>HR Manager</span>
        </div>

        <nav className="nav-items">
          <div 
            className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActivePage('dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </div>
          <div 
            className={`nav-item ${activePage === 'drivers' ? 'active' : ''}`}
            onClick={() => setActivePage('drivers')}
          >
            <span className="nav-icon">🚗</span>
            <span>Drivers</span>
          </div>
          <div 
            className={`nav-item ${activePage === 'documents' ? 'active' : ''}`}
            onClick={() => setActivePage('documents')}
          >
            <span className="nav-icon">📄</span>
            <span>Documents</span>
          </div>
          <div 
            className={`nav-item ${activePage === 'statements' ? 'active' : ''}`}
            onClick={() => setActivePage('statements')}
          >
            <span className="nav-icon">📋</span>
            <span>Statements</span>
          </div>
          <div 
            className={`nav-item ${activePage === 'salary' ? 'active' : ''}`}
            onClick={() => setActivePage('salary')}
          >
            <span className="nav-icon">💰</span>
            <span>Salary</span>
          </div>
          <div 
            className={`nav-item ${activePage === 'employers' ? 'active' : ''}`}
            onClick={() => setActivePage('employers')}
          >
            <span className="nav-icon">👥</span>
            <span>Employers</span>
          </div>
        </nav>

        <div className="logout" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          <span>Logout</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {activePage === 'dashboard' && <DashboardPage />}
        {activePage === 'drivers' && <DriversPage />}
        {activePage === 'documents' && <DocumentsPage />}
        {activePage === 'statements' && <StatementsPage />}
        {activePage === 'salary' && <SalaryPage />}
        {activePage === 'employers' && <EmployersPage />}
      </main>

      <div className="settings-icon">⚙️</div>
    </div>
  );
}

// Dashboard Page Component
function DashboardPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Track, manage and control all HR activities</p>
        <div className="stats-row">
          <div className="stat-item">
            <div className="stat-value">27</div>
            <div className="stat-label">Active drivers</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">15</div>
            <div className="stat-label">Pending approvals</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">$847k</div>
            <div className="stat-label">Total payroll</div>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recruiting</h2>
          </div>
          <div className="recruiting-stats">
            <span className="stat-badge">15 Active</span>
            <span className="stat-badge">44 Applied</span>
            <span className="stat-badge">22 Contacted</span>
            <span className="stat-badge">3 Documents Sent</span>
          </div>
          <div className="candidates-header">
            <span>Candidates</span>
            <span>Job position</span>
            <span>Status</span>
          </div>
          <div className="candidates-list">
            <div className="candidate-item">
              <div className="candidate-avatar">👤</div>
              <span>John Doe</span>
              <span>Owner Operator</span>
              <span className="status-badge status-applied">Applied</span>
            </div>
            <div className="candidate-item">
              <div className="candidate-avatar">👤</div>
              <span>Jane Smith</span>
              <span>Company Driver</span>
              <span className="status-badge status-contacted">Contacted</span>
            </div>
            <div className="candidate-item">
              <div className="candidate-avatar">👤</div>
              <span>Mike Johnson</span>
              <span>Owner Operator</span>
              <span className="status-badge status-documents">Documents Sent</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Quick Actions</h2>
          </div>
          <div className="quick-actions">
            <button className="action-btn">
              <span className="action-icon">➕</span>
              <span>Add New Driver</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">📄</span>
              <span>Generate Statement</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">📊</span>
              <span>View Reports</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">💰</span>
              <span>Process Payroll</span>
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Activities</h2>
        </div>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-icon">📝</span>
            <div className="activity-content">
              <strong>New application received</strong>
              <span className="activity-time">John Doe applied for Owner Operator position</span>
            </div>
            <span className="activity-date">2 hours ago</span>
          </div>
          <div className="activity-item">
            <span className="activity-icon">✅</span>
            <div className="activity-content">
              <strong>Document approved</strong>
              <span className="activity-time">Jane Smith's contract was approved</span>
            </div>
            <span className="activity-date">5 hours ago</span>
          </div>
          <div className="activity-item">
            <span className="activity-icon">💵</span>
            <div className="activity-content">
              <strong>Payroll processed</strong>
              <span className="activity-time">Weekly payroll completed successfully</span>
            </div>
            <span className="activity-date">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Other page components
function DriversPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Drivers</h1>
      </div>
      <div className="card">
        <p>Drivers management coming soon...</p>
      </div>
    </div>
  );
}

function DocumentsPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Documents</h1>
      </div>
      <div className="card">
        <p>Document management coming soon...</p>
      </div>
    </div>
  );
}

function StatementsPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Statements</h1>
      </div>
      <div className="card">
        <p>Statement management coming soon...</p>
      </div>
    </div>
  );
}

function SalaryPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Salary</h1>
      </div>
      <div className="card">
        <p>Salary management coming soon...</p>
      </div>
    </div>
  );
}

function EmployersPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Employers</h1>
      </div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Employers</h2>
        </div>
        <div className="candidates-header">
          <span className="candidates-stat"><strong>15</strong> Active Workers</span>
          <span className="candidates-stat"><strong>2</strong> Vacation</span>
        </div>
        <div className="search-bar">
          <span>🔍</span>
          <input type="text" placeholder="Search through employers..." />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
