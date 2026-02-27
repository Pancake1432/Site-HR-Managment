import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('currentUser');

  if (!isLoggedIn) {
    // Redirect to login, remembering where they tried to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

/** Redirect already-logged-in users away from /login back to dashboard */
export function PublicOnlyRoute({ children }: Props) {
  const isLoggedIn = !!localStorage.getItem('currentUser');
  if (isLoggedIn) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
