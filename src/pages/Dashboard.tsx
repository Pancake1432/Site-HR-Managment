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
  { key: 'documents',  icon: '📄', label: 'Documents'  },
  { key: 'drivers',    icon: '🚚', label: 'Drivers'    },
  { key: 'statements', icon: '📋', label: 'Statements' },
  { key: 'salary',     icon: '💰', label: 'Salary'     },
  { key: 'employees',  icon: '👥', label: 'Employees'  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState<PageType>('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigateToDocuments = (driverId: number) => {
    setSelectedDriverId(driverId);
    setActivePage('documents');
  };

  const handlePageChange = (page: PageType) => {
    if (page !== 'documents') {
      setSelectedDriverId(null);
    }
    setActivePage(page);
    setSidebarOpen(false);
  };

  return (
    <div className="container">
      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="logo">
          <div className="logo-icon">🏢</div>
          <span>HR Manager</span>
        </div>

        <nav className="nav-items">
          {NAV_ITEMS.map(item => (
            <div
              key={item.key}
              className={`nav-item ${activePage === item.key ? 'active' : ''}`}
              onClick={() => handlePageChange(item.key)}
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

      {/* ── MOBILE TOP BAR ── */}
      <header className="mobile-topbar">
        <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Open menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="mobile-topbar-title">
          <span>{NAV_ITEMS.find(i => i.key === activePage)?.icon}</span>
          {' '}{NAV_ITEMS.find(i => i.key === activePage)?.label}
        </div>
        <button className="mobile-settings-btn" onClick={() => setShowSettings(true)} aria-label="Settings">⚙️</button>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="main-content">
        {activePage === 'dashboard' && (
          <DashboardHome 
            onNavigate={handlePageChange}
            onCheckApplicant={handleNavigateToDocuments}
          />
        )}
        {activePage === 'documents' && (
          <DocumentsPage 
            selectedDriverId={selectedDriverId}
            onClose={() => setSelectedDriverId(null)}
          />
        )}
        {activePage === 'drivers'    && <DriversPage />}
        {activePage === 'statements' && <StatementsPage />}
        {activePage === 'salary'     && <SalaryPage />}
        {activePage === 'employees'  && <EmployeesPage />}
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="mobile-bottom-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.key}
            className={`mobile-bottom-nav-item ${activePage === item.key ? 'active' : ''}`}
            onClick={() => handlePageChange(item.key)}
          >
            <span className="mobile-bottom-nav-icon">{item.icon}</span>
            <span className="mobile-bottom-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ── SETTINGS FAB (desktop only) ── */}
      <div className="settings-icon desktop-only" onClick={() => setShowSettings(true)}>⚙️</div>

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
