import { useState } from 'react';
import { DocFile } from '../types/dashboard';

export interface StoredDriverDoc extends DocFile {
  base64?: string;
}

export interface DriverDocSet {
  cdl:             StoredDriverDoc | null;
  medicalCard:     StoredDriverDoc | null;
  applicationPdf:  StoredDriverDoc | null;   // transferred from form on hire
  workingContract: StoredDriverDoc | null;   // uploaded after in-person signing/scan
}

const MAX_INLINE_BYTES = 1.5 * 1024 * 1024;

function getStorageKey(): string {
  try {
    const raw  = localStorage.getItem('currentUser');
    const user = raw ? JSON.parse(raw) : null;
    return `hr_driver_docs_${user?.companyId ?? 'unknown'}`;
  } catch {
    return 'hr_driver_docs_unknown';
  }
}

const EMPTY_SET: DriverDocSet = { cdl: null, medicalCard: null, applicationPdf: null, workingContract: null };

function load(): Record<number, DriverDocSet> {
  try {
    const raw = localStorage.getItem(getStorageKey());
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function persist(data: Record<number, DriverDocSet>) {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(data));
  } catch {
    console.warn('localStorage quota exceeded — driver docs saved for this session only.');
  }
}

function formatSize(b: number) {
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1024 / 1024).toFixed(1) + ' MB';
}

/**
 * Persists the three structured driver documents (CDL, Medical Card, Working Contract)
 * to localStorage, scoped per company.
 * Files ≤ 1.5 MB are stored as base64 so they can be opened after a reload.
 */
export function useDriverDocStorage() {
  const [allDocs, setAllDocs] = useState<Record<number, DriverDocSet>>(load);

  const getDriverDocs = (driverId: number): DriverDocSet =>
    allDocs[driverId] ?? EMPTY_SET;

  const uploadDoc = (
    driverId: number,
    type: keyof DriverDocSet,
    file: File,
    dateStr: string,
  ): Promise<void> =>
    new Promise((resolve, reject) => {
      if (!file.type.includes('pdf')) {
        reject(new Error('Please upload PDF files only'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const doc: StoredDriverDoc = {
          id:         Date.now(),
          name:       file.name,
          type:       'PDF',
          uploadDate: dateStr,
          size:       formatSize(file.size),
          base64:     file.size <= MAX_INLINE_BYTES ? (reader.result as string) : undefined,
        };
        setAllDocs(prev => {
          const next = {
            ...prev,
            [driverId]: { ...(prev[driverId] ?? EMPTY_SET), [type]: doc },
          };
          persist(next);
          return next;
        });
        resolve();
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const deleteDoc = (driverId: number, type: keyof DriverDocSet) => {
    setAllDocs(prev => {
      const next = { ...prev, [driverId]: { ...(prev[driverId] ?? EMPTY_SET), [type]: null } };
      persist(next);
      return next;
    });
  };

  const openDoc = (doc: StoredDriverDoc) => {
    if (doc.base64) {
      const win = window.open();
      if (win) {
        win.document.write(
          `<style>*{margin:0;padding:0}body,html{height:100%;overflow:hidden}</style>` +
          `<iframe src="${doc.base64}" style="width:100%;height:100%;border:none;display:block;"></iframe>`
        );
        win.document.title = doc.name;
      }
    } else {
      alert(`"${doc.name}" is too large to store in the browser.\nRe-upload the file to view it.`);
    }
  };

  return { getDriverDocs, uploadDoc, deleteDoc, openDoc };
}
