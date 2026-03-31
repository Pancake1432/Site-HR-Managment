import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import axios from 'axios';
import { SavedStatement } from '../types/dashboard';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:7001';

function getToken(): string { return localStorage.getItem('hr_access_token') ?? ''; }
function authHeaders() { return { Authorization: `Bearer ${getToken()}` }; }

interface SavedStatementsCtx {
  statements:      SavedStatement[];
  addStatement:    (s: SavedStatement) => void;
  removeStatement: (id: string) => void;
  clearStatements: () => void;
}

const Ctx = createContext<SavedStatementsCtx>({
  statements: [], addStatement: () => {}, removeStatement: () => {}, clearStatements: () => {},
});

export function SavedStatementsProvider({ children }: { children: ReactNode }) {
  const [statements, setStatements] = useState<SavedStatement[]>([]);

  useEffect(() => {
    axios.get<SavedStatement[]>(`${BASE_URL}/api/statements`, { headers: authHeaders() })
      .then(res => setStatements(res.data))
      .catch(err => console.error('Failed to load statements:', err));
  }, []);

  const addStatement = useCallback((s: SavedStatement) => {
    axios.post<SavedStatement>(`${BASE_URL}/api/statements`, s, { headers: authHeaders() })
      .then(res => setStatements(prev => [res.data, ...prev]))
      .catch(err => console.error('Failed to save statement:', err));
  }, []);

  const removeStatement = useCallback((id: string) => {
    axios.delete(`${BASE_URL}/api/statements/${id}`, { headers: authHeaders() })
      .then(() => setStatements(prev => prev.filter(s => s.id !== id)))
      .catch(err => console.error('Failed to delete statement:', err));
  }, []);

  const clearStatements = useCallback(() => {
    axios.delete(`${BASE_URL}/api/statements`, { headers: authHeaders() })
      .then(() => setStatements([]))
      .catch(err => console.error('Failed to clear statements:', err));
  }, []);

  return (
    <Ctx.Provider value={{ statements, addStatement, removeStatement, clearStatements }}>
      {children}
    </Ctx.Provider>
  );
}

export const useSavedStatements = () => useContext(Ctx);
