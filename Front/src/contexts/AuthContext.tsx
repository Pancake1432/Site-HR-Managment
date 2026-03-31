import { createContext, useContext, ReactNode, useMemo } from 'react';

export interface AuthUser {
  email:       string;
  name:        string;
  role:        string;        // "admin" | "accounting"
  companyId:   string;
  companyName: string;
}

interface AuthContextValue {
  user:          AuthUser | null;
  isLoggedIn:    boolean;
  isAdmin:       boolean;
  isAccounting:  boolean;
  logout:        () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null, isLoggedIn: false, isAdmin: false, isAccounting: false, logout: () => {},
});

function decodeToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return {
      email:       payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ?? payload.email ?? '',
      name:        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ?? payload.name ?? '',
      role:        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? payload.role ?? 'admin',
      companyId:   payload.companyId   ?? '',
      companyName: payload.companyName ?? '',
    };
  } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useMemo(() => {
    const token = localStorage.getItem('hr_access_token');
    return token ? decodeToken(token) : null;
  }, []);

  const logout = () => {
    localStorage.removeItem('hr_access_token');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn:   !!user,
      isAdmin:      user?.role === 'admin',
      isAccounting: user?.role === 'accounting',
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
