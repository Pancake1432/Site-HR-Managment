import { useState } from 'react';
import { DocFile } from '../types/dashboard';

/** DocFile extended with optional base64 content for in-browser Open */
export interface StoredDoc extends DocFile {
  base64?: string; // stored only if file is small enough (<= 1.5 MB)
}

// Max file size to store as base64 in localStorage (1.5 MB raw → ~2 MB encoded)
const MAX_INLINE_BYTES = 1.5 * 1024 * 1024;

function getStorageKey(): string {
  try {
    const raw = localStorage.getItem('currentUser');
    const user = raw ? JSON.parse(raw) : null;
    const companyId: string = user?.companyId ?? 'unknown';
    return `hr_documents_${companyId}`;
  } catch {
    return 'hr_documents_unknown';
  }
}

function load(): Record<number, StoredDoc[]> {
  try {
    const raw = localStorage.getItem(getStorageKey());
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persist(docs: Record<number, StoredDoc[]>) {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(docs));
  } catch {
    // localStorage quota exceeded — silently keep in-memory state
    console.warn('localStorage quota exceeded. Documents saved for this session only.');
  }
}

/**
 * Persists driver documents to localStorage scoped by company.
 * Files <= 1.5 MB are stored as base64 so the Open button works after reload.
 * Larger files show in the list but must be re-uploaded to open.
 */
export function useDocumentStorage() {
  const [driverDocuments, setDriverDocuments] = useState<Record<number, StoredDoc[]>>(load);

  const addDocument = (driverId: number, file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const base64 = file.size <= MAX_INLINE_BYTES
          ? (reader.result as string)
          : undefined;

        const newDoc: StoredDoc = {
          id: Date.now(),
          name: file.name,
          type: 'PDF',
          uploadDate: new Date().toLocaleDateString('en-US', {
            month: '2-digit', day: '2-digit', year: 'numeric',
          }),
          size: formatFileSize(file.size),
          base64,
        };

        setDriverDocuments(prev => {
          const next = {
            ...prev,
            [driverId]: [...(prev[driverId] || []), newDoc],
          };
          persist(next);
          return next;
        });

        resolve();
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const removeDocument = (driverId: number, docId: number) => {
    setDriverDocuments(prev => {
      const next = {
        ...prev,
        [driverId]: (prev[driverId] || []).filter(d => d.id !== docId),
      };
      persist(next);
      return next;
    });
  };

  const openDocument = (doc: StoredDoc) => {
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
      alert(
        `"${doc.name}" is too large to store in the browser.\n\nThe file entry is saved but you need to re-upload the file to open it.`
      );
    }
  };

  return { driverDocuments, addDocument, removeDocument, openDocument };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
