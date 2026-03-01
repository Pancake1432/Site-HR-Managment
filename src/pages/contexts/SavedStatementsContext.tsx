import { createContext, useContext, useState, ReactNode } from 'react';
import { SavedStatement } from '../types/dashboard';

interface SavedStatementsCtx {
  statements: SavedStatement[];
  addStatement: (s: SavedStatement) => void;
  removeStatement: (id: string) => void;
  clearStatements: () => void;
}

// ── Old shared key (pre multi-company) — remove on first mount ───────────────
const LEGACY_KEY = 'hr_saved_statements';

/** Each company gets its own isolated key */
function getStorageKey(): string {
  try {
    const raw = localStorage.getItem('currentUser');
    const user = raw ? JSON.parse(raw) : null;
    const companyId: string = user?.companyId ?? 'unknown';
    return `hr_saved_statements_${companyId}`;
  } catch {
    return 'hr_saved_statements_unknown';
  }
}

/** Wipe the old shared key so stale cross-company data cannot leak */
function migrateLegacyKey() {
  if (localStorage.getItem(LEGACY_KEY) !== null) {
    localStorage.removeItem(LEGACY_KEY);
  }
}

function load(): SavedStatement[] {
  migrateLegacyKey();
  try {
    const raw = localStorage.getItem(getStorageKey());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(list: SavedStatement[]) {
  localStorage.setItem(getStorageKey(), JSON.stringify(list));
}

const Ctx = createContext<SavedStatementsCtx>({
  statements: [],
  addStatement: () => {},
  removeStatement: () => {},
  clearStatements: () => {},
});

export function SavedStatementsProvider({ children }: { children: ReactNode }) {
  const [statements, setStatements] = useState<SavedStatement[]>(load);

  const addStatement = (s: SavedStatement) => {
    setStatements(prev => {
      const next = [s, ...prev];
      persist(next);
      return next;
    });
  };

  const removeStatement = (id: string) => {
    setStatements(prev => {
      const next = prev.filter(s => s.id !== id);
      persist(next);
      return next;
    });
  };

  const clearStatements = () => {
    setStatements([]);
    localStorage.removeItem(getStorageKey());
  };

  return (
    <Ctx.Provider value={{ statements, addStatement, removeStatement, clearStatements }}>
      {children}
    </Ctx.Provider>
  );
}

export const useSavedStatements = () => useContext(Ctx);
