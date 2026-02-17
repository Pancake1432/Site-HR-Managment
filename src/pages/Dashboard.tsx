import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageType } from './types/dashboard';

import DashboardHome  from './components/dashboard/DashboardHome';
import DriversPage    from './components/dashboard/DriversPage';
import DocumentsPage  from './components/dashboard/DocumentsPage';
import StatementsPage from './components/dashboard/StatementsPage';
import SalaryPage     from './components/dashboard/SalaryPage';
import EmployeesPage  from './components/dashboard/EmployeesPage';

import '../styles/dashboard.css';

const NAV_ITEMS: { key: PageType; icon: string; label: string }[] = [
  { key: 'dashboard',  icon: '📊', label: 'Dashboard'  },
  { key: 'drivers',    icon: '🚗', label: 'Drivers'    },
  { key: 'documents',  icon: '📄', label: 'Documents'  },
  { key: 'statements', icon: '📋', label: 'Statements' },
  { key: 'salary',     icon: '💰', label: 'Salary'     },
  { key: 'employees',  icon: '👥', label: 'Employees'  },
];

export default function Dashboard() {
  const navigate                        = useNavigate();
  const [activePage, setActivePage]     = useState<PageType>('dashboard');
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="container">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">🏢</div>
          <span>HR Manager</span>
        </div>

        <nav className="nav-items">
          {NAV_ITEMS.map(item => (
            <div
              key={item.key}
              className={`nav-item ${activePage === item.key ? 'active' : ''}`}
              onClick={() => setActivePage(item.key)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="logout" onClick={() => navigate('/')}>
          <span className="nav-icon">🚪</span>
          <span>Logout</span>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="main-content">
        {activePage === 'dashboard'  && <DashboardHome  onNavigate={setActivePage} />}
        {activePage === 'drivers'    && <DriversPage />}
        {activePage === 'documents'  && <DocumentsPage />}
        {activePage === 'statements' && <StatementsPage />}
        {activePage === 'salary'     && <SalaryPage />}
        {activePage === 'employees'  && <EmployeesPage />}
      </main>

      {/* ── SETTINGS FAB ── */}
      <div className="settings-icon" onClick={() => setShowSettings(true)}>⚙️</div>

      {/* ── SETTINGS MODAL ── */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content settings-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Settings</h2>
              <button className="close-btn" onClick={() => setShowSettings(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="in-progress">
                <div className="progress-icon">🚧</div>
                <h3>In Progress</h3>
                <p>Settings functionality is currently under development.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
