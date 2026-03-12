import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { SavedStatementsProvider } from '../contexts/SavedStatementsContext';
import SettingsModal from '../components/dashboard/SettingsModal';
import { Emoji } from '../components/Emoji';
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
  const [showSettings, setShowSettings] = useState(false);

  const activePath = NAV_ITEMS
    .slice()
    .reverse()
    .find(item => location.pathname.startsWith(item.path))?.path ?? '/dashboard';

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login', { replace: true });
  };

  const activeItem = NAV_ITEMS.find(i => i.path === activePath);

  return (
    <div className="container">

      {/* SIDEBAR (desktop only) */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon"><Emoji symbol="🏢" size={20} label="Company" /></div>
          <span>HR Manager</span>
        </div>

        <nav className="nav-items">
          {NAV_ITEMS.map(item => (
            <div
              key={item.path}
              className={`nav-item ${activePath === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon"><Emoji symbol={item.icon} size={18} /></span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="logout" onClick={handleLogout}>
          <span className="nav-icon"><Emoji symbol="🚪" size={18} label="Logout" /></span>
          <span>Logout</span>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <header className="mobile-topbar">
        <div className="mobile-topbar-brand">
          <div className="mobile-topbar-logo"><Emoji symbol="🏢" size={20} /></div>
        </div>
        <div className="mobile-topbar-center">
          <span className="mobile-topbar-app">HR Manager</span>
          <span className="mobile-topbar-page">
            {activeItem && <Emoji symbol={activeItem.icon} size={14} style={{ marginRight: 4 }} />}
            {activeItem?.label}
          </span>
        </div>
        <div className="mobile-topbar-actions">
          <button className="mobile-topbar-btn" onClick={() => setShowSettings(true)} aria-label="Settings">
            <Emoji symbol="⚙️" size={18} />
          </button>
          <button className="mobile-topbar-btn mobile-topbar-logout" onClick={handleLogout} aria-label="Logout">
            <Emoji symbol="🚪" size={18} />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="mobile-bottom-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.path}
            className={`mobile-bottom-nav-item ${activePath === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="mobile-bottom-nav-icon"><Emoji symbol={item.icon} size={20} /></span>
            <span className="mobile-bottom-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* SETTINGS FAB (desktop only) */}
      <div className="settings-icon desktop-only" onClick={() => setShowSettings(true)}>
        <Emoji symbol="⚙️" size={20} />
      </div>

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
