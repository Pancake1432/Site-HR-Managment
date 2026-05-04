import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import axios from 'axios';
import { SavedStatement } from '../types/dashboard';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:7001';
function getToken() { return localStorage.getItem('hr_access_token') ?? ''; }
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

  const loadStatements = useCallback(() => {
    const token = getToken();
    if (!token) return;
    axios.get<SavedStatement[]>(`${BASE_URL}/api/statements`, { headers: authHeaders() })
      .then(res => setStatements(res.data))
      .catch(() => {});
  }, []);

  // Initial load
  useEffect(() => { loadStatements(); }, [loadStatements]);

  // SSE listener — silently reload when backend broadcasts "refresh"
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let alive = true;

    function connect() {
      if (!alive) return;
      es = new EventSource(`${BASE_URL}/api/events?access_token=${token}`);
      es.onmessage = (event) => {
        if (event.data === 'refresh') loadStatements();
      };
      es.onerror = () => {
        es?.close();
        if (alive) reconnectTimer = setTimeout(connect, 5_000);
      };
    }

    connect();
    return () => {
      alive = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      es?.close();
    };
  }, [loadStatements]);

  const addStatement = useCallback((s: SavedStatement) => {
    axios.post<SavedStatement>(`${BASE_URL}/api/statements`, s, { headers: authHeaders() })
      .then(res => setStatements(prev => [res.data, ...prev]))
      .catch(() => setStatements(prev => [s, ...prev]));
  }, []);

  const removeStatement = useCallback((id: string) => {
    axios.delete(`${BASE_URL}/api/statements/${id}`, { headers: authHeaders() })
      .catch(() => {});
    setStatements(prev => prev.filter(s => s.id !== id));
  }, []);

  const clearStatements = useCallback(() => {
    axios.delete(`${BASE_URL}/api/statements`, { headers: authHeaders() })
      .catch(() => {});
    setStatements([]);
  }, []);

  return (
    <Ctx.Provider value={{ statements, addStatement, removeStatement, clearStatements }}>
      {children}
    </Ctx.Provider>
  );
}

export const useSavedStatements = () => useContext(Ctx);