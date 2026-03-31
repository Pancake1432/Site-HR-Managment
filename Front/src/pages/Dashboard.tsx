import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { SavedStatementsProvider } from '../contexts/SavedStatementsContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import SettingsModal from '../components/dashboard/SettingsModal';
import { Emoji } from '../components/Emoji';
import '../styles/dashboard.css';

const ADMIN_NAV = [
  { path: '/dashboard',            icon: '📊', label: 'Dashboard'  },
  { path: '/dashboard/documents',  icon: '📄', label: 'Documents'  },
  { path: '/dashboard/drivers',    icon: '🚚', label: 'Drivers'    },
  { path: '/dashboard/statements', icon: '📋', label: 'Statements' },
  { path: '/dashboard/salary',     icon: '💰', label: 'Salary'     },
  { path: '/dashboard/employees',  icon: '👥', label: 'Employees'  },
];

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

  return (
    <div className="container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon"><Emoji symbol="🏢" size={20} label="Company" /></div>
          <span>HR Manager</span>
        </div>

        {/* Accounting badge — improved */}
        {isAccounting && (
          <div style={{
            margin: '0 10px 16px',
            padding: '6px 10px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
          }}>
            <span style={{ fontSize: 14 }}>📊</span>
            <div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px', lineHeight: 1 }}>
                Logged in as
              </div>
              <div style={{ fontSize: 12, color: '#fff', fontWeight: 700, letterSpacing: '0.5px' }}>
                Accounting
              </div>
            </div>
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
      <button className="settings-icon" onClick={() => setShowSettings(true)} aria-label="Settings">
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
