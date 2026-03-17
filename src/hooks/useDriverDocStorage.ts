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

const MAX_INLINE_BYTES = 3 * 1024 * 1024; // 3 MB

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
      const allowed = file.type.includes('pdf') || file.type.startsWith('image/');
      if (!allowed) {
        reject(new Error('Please upload a PDF or image file (JPG, PNG, etc.)'));
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
      try {
        // Convert base64 data URL → Blob → object URL (avoids popup blockers)
        const [header, data] = doc.base64.split(',');
        const mime = header.match(/:(.*?);/)?.[1] ?? 'application/octet-stream';
        const bytes = atob(data);
        const arr = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
        const blob = new Blob([arr], { type: mime });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.target   = '_blank';
        a.rel      = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
      } catch {
        alert(`Could not open "${doc.name}". Please try re-uploading the file.`);
      }
    } else {
      alert(`"${doc.name}" is too large to store in the browser.\nRe-upload the file to view it.`);
    }
  };

  return { getDriverDocs, uploadDoc, deleteDoc, openDoc };
}
