import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ApplicationForm from './pages/ApplicationForm';
import NotFoundPage from './errors/NotFoundPage';
import ForbiddenPage from './errors/ForbiddenPage';
import ServerErrorPage from './errors/ServerErrorPage';
import MaintenancePage from './errors/MaintenancePage';
import ErrorBoundary from './errors/ErrorBoundary';
import ProtectedRoute, { PublicOnlyRoute } from './components/ProtectedRoute';

import DashboardHome  from './components/dashboard/DashboardHome';
import DriversPage    from './components/dashboard/DriversPage';
import DocumentsPage  from './components/dashboard/DocumentsPage';
import StatementsPage from './components/dashboard/StatementsPage';
import SalaryPage     from './components/dashboard/SalaryPage';
import EmployeesPage  from './components/dashboard/EmployeesPage';

import InfoStep              from './components/application/InfoStep';
import PersonalInfoStep      from './components/application/PersonalInfoStep';
import DrivingExperienceStep from './components/application/DrivingExperienceStep';
import WorkPreferencesStep   from './components/application/WorkPreferencesStep';
import AvailabilityStep      from './components/application/AvailabilityStep';
import DocumentsStep         from './components/application/DocumentsStep';

function App() {
  return (
    <ErrorBoundary>
        <Router>
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/" element={<LandingPage />} />

          {/* ── Application form with nested step routes ── */}
          <Route path="/apply" element={<ApplicationForm />}>
            {/* /apply  → redirect to /apply/info */}
            <Route index element={<Navigate to="info" replace />} />
            <Route path="info"               element={<InfoStep />} />
            <Route path="personal-info"      element={<PersonalInfoStep />} />
            <Route path="driving-experience" element={<DrivingExperienceStep />} />
            <Route path="work-preferences"   element={<WorkPreferencesStep />} />
            <Route path="availability"       element={<AvailabilityStep />} />
            <Route path="documents"          element={<DocumentsStep />} />
          </Route>

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
