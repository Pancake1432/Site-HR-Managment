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
    console.warn('localStorage quota exceeded. Documents saved for this session only.');
  }
}

/** Check if a base64 data URL is HTML content (application PDFs are stored as HTML) */
function isHtmlDataUrl(base64: string): boolean {
  return base64.startsWith('data:text/html');
}

/** Decode a base64 data URL back to its raw string content */
function decodeBase64DataUrl(dataUrl: string): string {
  const base64Part = dataUrl.split(',')[1];
  return decodeURIComponent(escape(atob(base64Part)));
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
    if (!doc.base64) {
      alert(
        `"${doc.name}" is too large to store in the browser.\n\nThe file entry is saved but you need to re-upload the file to open it.`
      );
      return;
    }

    // Convert stored content to a Blob URL and open in a new tab.
    // Avoids direct DOM manipulation (win.document.write / innerHTML).
    if (isHtmlDataUrl(doc.base64)) {
      const html = decodeBase64DataUrl(doc.base64);
      const blob = new Blob([html], { type: 'text/html' });
      const url  = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } else {
      // Real PDFs / images — open the base64 data URL directly in a new tab.
      window.open(doc.base64, '_blank', 'noopener,noreferrer');
    }
  };

  const downloadDocument = (doc: StoredDoc) => {
    if (!doc.base64) {
      alert(
        `"${doc.name}" is too large to store in the browser.\n\nRe-upload the file to download it.`
      );
      return;
    }

    // Open the document in a new tab from a Blob URL so the user can save it.
    // For HTML-based application PDFs the browser's Save-as-PDF / print dialog is available.
    if (isHtmlDataUrl(doc.base64)) {
      const html = decodeBase64DataUrl(doc.base64);
      const blob = new Blob([html], { type: 'text/html' });
      const url  = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } else {
      // Real PDFs / images: create a Blob URL and open in new tab.
      // The browser offers native Save / Download options from there.
      const [header, data] = doc.base64.split(',');
      const mime = header.match(/:(.*?);/)?.[1] ?? 'application/octet-stream';
      const bytes = atob(data);
      const arr   = new Uint8Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
      const blob  = new Blob([arr], { type: mime });
      const url   = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    }
  };

  return { driverDocuments, addDocument, removeDocument, openDocument, downloadDocument };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
