import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppAxiosProvider }  from './providers/AppAxiosProvider';
import { HealthGuard }       from './components/HealthGuard';
import LandingPage           from './pages/LandingPage';
import LoginPage             from './pages/LoginPage';
import Dashboard             from './pages/Dashboard';
import ApplicationForm       from './pages/ApplicationForm';
import NotFoundPage          from './errors/NotFoundPage';
import ForbiddenPage         from './errors/ForbiddenPage';
import ServerErrorPage       from './errors/ServerErrorPage';
import MaintenancePage       from './errors/MaintenancePage';
import ErrorBoundary         from './errors/ErrorBoundary';
import ProtectedRoute, { PublicOnlyRoute } from './components/ProtectedRoute';

import DashboardHome       from './components/dashboard/DashboardHome';
import AccountingDashboard from './components/dashboard/AccountingDashboard';
import DriversPage         from './components/dashboard/DriversPage';
import DocumentsPage       from './components/dashboard/DocumentsPage';
import StatementsPage      from './components/dashboard/StatementsPage';
import SalaryPage          from './components/dashboard/SalaryPage';
import EmployeesPage       from './components/dashboard/EmployeesPage';

import InfoStep              from './components/application/InfoStep';
import PersonalInfoStep      from './components/application/PersonalInfoStep';
import DrivingExperienceStep from './components/application/DrivingExperienceStep';
import WorkPreferencesStep   from './components/application/WorkPreferencesStep';
import AvailabilityStep      from './components/application/AvailabilityStep';
import DocumentsStep         from './components/application/DocumentsStep';

// Smart Dashboard Home — shows admin or accounting view based on role
function SmartDashboardHome() {
  const token = localStorage.getItem('hr_access_token');
  let role = 'admin';
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? payload.role ?? 'admin';
    } catch { /* ignore */ }
  }
  return role === 'accounting' ? <AccountingDashboard /> : <DashboardHome />;
}

function AppContent() {
  return (
    <AppAxiosProvider>
      <HealthGuard>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/apply" element={<ApplicationForm />}>
            <Route index element={<Navigate to="info" replace />} />
            <Route path="info"               element={<InfoStep />} />
            <Route path="personal-info"      element={<PersonalInfoStep />} />
            <Route path="driving-experience" element={<DrivingExperienceStep />} />
            <Route path="work-preferences"   element={<WorkPreferencesStep />} />
            <Route path="availability"       element={<AvailabilityStep />} />
            <Route path="documents"          element={<DocumentsStep />} />
          </Route>

          <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
            <Route index                element={<SmartDashboardHome />} />
            <Route path="documents"     element={<DocumentsPage />} />
            <Route path="documents/:id" element={<DocumentsPage />} />
            <Route path="drivers"       element={<DriversPage />} />
            <Route path="drivers/:id"   element={<DriversPage />} />
            <Route path="statements"    element={<StatementsPage />} />
            <Route path="salary"        element={<SalaryPage />} />
            <Route path="employees"     element={<EmployeesPage />} />
            <Route path="employees/:id" element={<EmployeesPage />} />
          </Route>

          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="/500" element={<ServerErrorPage />} />
          <Route path="/503" element={<MaintenancePage />} />
          <Route path="*"    element={<NotFoundPage />} />
        </Routes>
      </HealthGuard>
    </AppAxiosProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
