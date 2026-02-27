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
import ProtectedRoute, { PublicOnlyRoute } from './pages/components/ProtectedRoute';

import DashboardHome  from './pages/components/dashboard/DashboardHome';
import DriversPage    from './pages/components/dashboard/DriversPage';
import DocumentsPage  from './pages/components/dashboard/DocumentsPage';
import StatementsPage from './pages/components/dashboard/StatementsPage';
import SalaryPage     from './pages/components/dashboard/SalaryPage';
import EmployeesPage  from './pages/components/dashboard/EmployeesPage';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/apply" element={<ApplicationForm />} />

          {/* ── Auth routes (redirect to dashboard if already logged in) ── */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />

          {/* ── Protected dashboard with nested sub-routes ── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            {/* /dashboard  → home */}
            <Route index element={<DashboardHome />} />

            {/* /dashboard/documents  &  /dashboard/documents/:id */}
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="documents/:id" element={<DocumentsPage />} />

            {/* /dashboard/drivers  &  /dashboard/drivers/:id */}
            <Route path="drivers" element={<DriversPage />} />
            <Route path="drivers/:id" element={<DriversPage />} />

            {/* /dashboard/statements */}
            <Route path="statements" element={<StatementsPage />} />

            {/* /dashboard/salary */}
            <Route path="salary" element={<SalaryPage />} />

            {/* /dashboard/employees  &  /dashboard/employees/:id */}
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="employees/:id" element={<EmployeesPage />} />
          </Route>

          {/* ── Error routes ── */}
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="/500" element={<ServerErrorPage />} />
          <Route path="/503" element={<MaintenancePage />} />

          {/* ── Catch-all 404 ── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
