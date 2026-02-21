import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ApplicationForm from './pages/ApplicationForm';
import NotFoundPage from './pages/errors/NotFoundPage';
import ForbiddenPage from './pages/errors/ForbiddenPage';
import ServerErrorPage from './pages/errors/ServerErrorPage';
import MaintenancePage from './pages/errors/MaintenancePage';
import ErrorBoundary from './pages/errors/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* ── Main routes ── */}
          <Route path="/"          element={<LandingPage />} />
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/apply"     element={<ApplicationForm />} />

          {/* ── Error routes (can also be triggered programmatically) ── */}
          <Route path="/403"       element={<ForbiddenPage />} />
          <Route path="/500"       element={<ServerErrorPage />} />
          <Route path="/503"       element={<MaintenancePage />} />

          {/* ── Catch-all 404 ── */}
          <Route path="*"          element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
