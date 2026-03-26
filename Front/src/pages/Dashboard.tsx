import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { SavedStatementsProvider } from '../contexts/SavedStatementsContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import SettingsModal from '../components/dashboard/SettingsModal';
import { Emoji } from '../components/Emoji';
import '../styles/dashboard.css';

// Admin sees all pages
const ADMIN_NAV = [
  { path: '/dashboard',            icon: '📊', label: 'Dashboard'  },
  { path: '/dashboard/documents',  icon: '📄', label: 'Documents'  },
  { path: '/dashboard/drivers',    icon: '🚚', label: 'Drivers'    },
  { path: '/dashboard/statements', icon: '📋', label: 'Statements' },
  { path: '/dashboard/salary',     icon: '💰', label: 'Salary'     },
  { path: '/dashboard/employees',  icon: '👥', label: 'Employees'  },
];

// Accounting sees only financial pages
const ACCOUNTING_NAV = [
  { path: '/dashboard',            icon: '📊', label: 'Dashboard'  },
  { path: '/dashboard/statements', icon: '📋', label: 'Statements' },
  { path: '/dashboard/salary',     icon: '💰', label: 'Salary'     },
  { path: '/dashboard/employees',  icon: '👥', label: 'Employees'  },
];

function DashboardLayout() {
  const navigate     = useNavigate();
  const location     = useLocation();
  const { settings } = useSettings();
  const { user, isAccounting } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  const NAV_ITEMS = isAccounting ? ACCOUNTING_NAV : ADMIN_NAV;

  const activePath = NAV_ITEMS
    .slice().reverse()
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

  // Redirect accounting users away from restricted pages
  useEffect(() => {
    if (isAccounting) {
      const restricted = ['/dashboard/documents', '/dashboard/drivers'];
      if (restricted.some(p => location.pathname.startsWith(p))) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [location.pathname, isAccounting, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('hr_access_token');
    window.location.href = '/login';
  };

  const activeItem = NAV_ITEMS.find(i => i.path === activePath);

  return (
    <div className="container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon"><Emoji symbol="🏢" size={20} label="Company" /></div>
          <span>HR Manager</span>
        </div>

        {/* Role badge */}
        {isAccounting && (
          <div style={{ padding: '4px 16px 8px', fontSize: 11, color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            📊 Accounting
          </div>
        )}

        <nav className="nav-items">
          {NAV_ITEMS.map(item => (
            <div
              key={item.path}
              className={`nav-item ${activePath === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon"><Emoji symbol={item.icon} size={18} label={item.label} /></span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="logout" onClick={handleLogout}>
          <span className="nav-icon"><Emoji symbol="🚪" size={18} label="Logout" /></span>
          <span>Logout</span>
        </div>
      </aside>

      {/* MOBILE TOPBAR */}
      <div className="mobile-topbar">
        <div className="mobile-topbar-logo">
          <Emoji symbol="🏢" size={20} label="Company" />
          <span>HR Manager</span>
        </div>
        <div className="mobile-topbar-actions">
          <button className="mobile-topbar-btn" onClick={() => setShowSettings(true)} aria-label="Settings">⚙️</button>
          <button className="mobile-topbar-btn mobile-topbar-logout" onClick={handleLogout} aria-label="Logout">🚪</button>
        </div>
      </div>

      {/* MAIN */}
      <main className="main-content">
        <SavedStatementsProvider>
          <Outlet />
        </SavedStatementsProvider>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="mobile-bottom-nav">
        {NAV_ITEMS.map(item => (
          <div
            key={item.path}
            className={`mobile-bottom-nav-item ${activePath === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <Emoji symbol={item.icon} size={22} label={item.label} />
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Settings button */}
      <button className="settings-fab" onClick={() => setShowSettings(true)} aria-label="Settings">
        ⚙️
      </button>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthProvider>
      <DashboardLayout />
    </AuthProvider>
  );
}
