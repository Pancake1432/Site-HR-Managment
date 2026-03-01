import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useSettings } from './contexts/SettingsContext';
import { SavedStatementsProvider } from './contexts/SavedStatementsContext';
import SettingsModal from './components/dashboard/SettingsModal';
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
  const navigate   = useNavigate();
  const location   = useLocation();
  const { settings } = useSettings();
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(false);

  // Determine active nav item from current URL
  const activePath = NAV_ITEMS
    .slice()
    .reverse() // check more-specific paths first
    .find(item => location.pathname.startsWith(item.path))?.path ?? '/dashboard';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  useEffect(() => {
    document.documentElement.classList.toggle('compact', settings.compactView);
  }, [settings.compactView]);

  useEffect(() => {
    return () => {
      document.documentElement.classList.remove('dark', 'compact');
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login', { replace: true });
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const activeItem = NAV_ITEMS.find(i => i.path === activePath);

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
              key={item.path}
              className={`nav-item ${activePath === item.path ? 'active' : ''}`}
              onClick={() => handleNavClick(item.path)}
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
        <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Open menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="mobile-topbar-title">
          <span>{activeItem?.icon}</span>
          {' '}{activeItem?.label}
        </div>
        <button className="mobile-settings-btn" onClick={() => setShowSettings(true)} aria-label="Settings">⚙️</button>
      </header>

      {/* ── MAIN CONTENT (nested routes render here) ── */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="mobile-bottom-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.path}
            className={`mobile-bottom-nav-item ${activePath === item.path ? 'active' : ''}`}
            onClick={() => handleNavClick(item.path)}
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
