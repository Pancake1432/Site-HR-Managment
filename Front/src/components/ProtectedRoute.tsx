import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

interface Props { children: ReactNode; }

function isLoggedIn(): boolean {
  const token = localStorage.getItem('hr_access_token');
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    // Check token expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('hr_access_token');
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export default function ProtectedRoute({ children }: Props) {
  const location = useLocation();
  if (!isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

export function PublicOnlyRoute({ children }: Props) {
  if (isLoggedIn()) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
