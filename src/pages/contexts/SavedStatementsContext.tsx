import { createContext, useContext, useState, ReactNode } from 'react';
import { SavedStatement } from '../types/dashboard';

interface SavedStatementsCtx {
  statements: SavedStatement[];
  addStatement: (s: SavedStatement) => void;
  removeStatement: (id: string) => void;
  clearStatements: () => void;
}

const STORAGE_KEY = 'hr_saved_statements';

function load(): SavedStatement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(list: SavedStatement[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
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
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <Ctx.Provider value={{ statements, addStatement, removeStatement, clearStatements }}>
      {children}
    </Ctx.Provider>
  );
}

export const useSavedStatements = () => useContext(Ctx);
