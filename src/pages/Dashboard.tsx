import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { SavedStatementsProvider } from '../contexts/SavedStatementsContext';
import SettingsModal from '../components/dashboard/SettingsModal';
import '../styles/dashboard.css';

const NAV_ITEMS = [
  { path: '/dashboard',            icon: '📊', label: 'Dashboard'  },
  { path: '/dashboard/documents',  icon: '📄', label: 'Documents'  },
  { path: '/dashboard/drivers',    icon: '🚚', label: 'Drivers'    },
  { path: '/dashboard/statements', icon: '📋', label: 'Statements' },
  { path: '/dashboard/salary',     icon: '💰', label: 'Salary'     },
  { path: '/dashboard/employees',  icon: '👥', label: 'Employees'  },
];

function DashboardLayout() {
  const navigate     = useNavigate();
  const location     = useLocation();
  const { settings } = useSettings();
  const [showSettings, setShowSettings] = useState(false);

  const activePath = NAV_ITEMS
    .slice()
    .reverse()
    .find(item => location.pathname.startsWith(item.path))?.path ?? '/dashboard';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  useEffect(() => {
    document.documentElement.classList.toggle('compact', settings.compactView);
  }, [settings.compactView]);

  useEffect(() => {
    return () => { document.documentElement.classList.remove('dark', 'compact'); };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login', { replace: true });
  };

  const activeItem = NAV_ITEMS.find(i => i.path === activePath);

  return (
    <div className="container">

      {/* ── SIDEBAR (desktop only) ── */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">🏢</div>
          <span>HR Manager</span>
        </div>

        <nav className="nav-items">
          {NAV_ITEMS.map(item => (
            <div
              key={item.path}
              className={`nav-item ${activePath === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="logout" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          <span>Logout</span>
        </div>
      </aside>

      {/* ── MOBILE TOP BAR ── */}
      <header className="mobile-topbar">
        <div className="mobile-topbar-brand">
          <div className="mobile-topbar-logo">🏢</div>
        </div>
        <div className="mobile-topbar-center">
          <span className="mobile-topbar-app">HR Manager</span>
          <span className="mobile-topbar-page">{activeItem?.icon} {activeItem?.label}</span>
        </div>
        <div className="mobile-topbar-actions">
          <button className="mobile-topbar-btn" onClick={() => setShowSettings(true)} aria-label="Settings">⚙️</button>
          <button className="mobile-topbar-btn mobile-topbar-logout" onClick={handleLogout} aria-label="Logout">🚪</button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="mobile-bottom-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.path}
            className={`mobile-bottom-nav-item ${activePath === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="mobile-bottom-nav-icon">{item.icon}</span>
            <span className="mobile-bottom-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ── SETTINGS FAB (desktop only) ── */}
      <div className="settings-icon desktop-only" onClick={() => setShowSettings(true)}>⚙️</div>

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <SavedStatementsProvider>
      <DashboardLayout />
    </SavedStatementsProvider>
  );
}
