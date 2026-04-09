import { useCallback } from 'react';
import axios from 'axios';
import { DocFile } from '../types/dashboard';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:7001';
function getToken() { return localStorage.getItem('hr_access_token') ?? ''; }
function authHeaders() { return { Authorization: `Bearer ${getToken()}` }; }

export interface StoredDriverDoc extends DocFile { base64?: string; }

export interface DriverDocSet {
  cdl:             StoredDriverDoc | null;
  medicalCard:     StoredDriverDoc | null;
  applicationPdf:  StoredDriverDoc | null;
  workingContract: StoredDriverDoc | null;
  [key: string]:   StoredDriverDoc | null;
}

const EMPTY_SET: DriverDocSet = {
  cdl: null, medicalCard: null, applicationPdf: null, workingContract: null,
};

function formatSize(bytes: number): string {
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload  = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

interface ApiDoc {
  id: number; driverId: number; docType: string;
  name: string; fileType: string; uploadedAt: string;
  size: string; base64: string; expiryDate?: string;
}

function apiDocToStored(d: ApiDoc): StoredDriverDoc {
  return {
    id:         d.id,
    name:       d.name,
    type:       d.fileType,
    uploadDate: d.uploadedAt,
    size:       d.size,
    base64:     d.base64,
    expiryDate: d.expiryDate,
  };
}

/** Returns days until expiry (negative = already expired). null if no expiry set. */
export function daysUntilExpiry(expiryDate?: string): number | null {
  if (!expiryDate) return null;
  const diff = new Date(expiryDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** Returns 'expired' | 'warning' (≤30 days) | 'ok' | null */
export function expiryStatus(expiryDate?: string): 'expired' | 'warning' | 'ok' | null {
  const days = daysUntilExpiry(expiryDate);
  if (days === null) return null;
  if (days < 0)  return 'expired';
  if (days <= 30) return 'warning';
  return 'ok';
}

export function useDriverDocStorage() {
  const getDriverDocs = useCallback(async (driverId: number): Promise<DriverDocSet> => {
    try {
      const res = await axios.get<ApiDoc[]>(
        `${BASE_URL}/api/documents/${driverId}`,
        { headers: authHeaders() }
      );
      const set: DriverDocSet = { ...EMPTY_SET };
      for (const doc of res.data) {
        const stored = apiDocToStored(doc);
        if      (doc.docType === 'cdl')             set.cdl             = stored;
        else if (doc.docType === 'medicalCard')     set.medicalCard     = stored;
        else if (doc.docType === 'applicationPdf')  set.applicationPdf  = stored;
        else if (doc.docType === 'workingContract') set.workingContract = stored;
      }
      return set;
    } catch { return { ...EMPTY_SET }; }
  }, []);

  const uploadDoc = useCallback(async (
    driverId: number,
    type: keyof DriverDocSet,
    file: File,
    expiryDate?: string,
  ): Promise<void> => {
    const base64 = await readAsBase64(file);
    await axios.post(`${BASE_URL}/api/documents`, {
      driverId,
      docType:    type,
      name:       file.name,
      fileType:   'PDF',
      size:       formatSize(file.size),
      base64,
      expiryDate: expiryDate || null,
    }, { headers: authHeaders() });
  }, []);

  const deleteDoc = useCallback(async (_driverId: number, docId: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/api/documents/${docId}`, { headers: authHeaders() });
  }, []);

  const openDoc = useCallback((_driverId: number | undefined, doc: StoredDriverDoc): void => {
    if (!doc.base64) return;
    try {
      const [header, data] = doc.base64.split(',');
      const mime = header.match(/:(.*?);/)?.[1] ?? 'application/octet-stream';
      const bytes = atob(data);
      const arr = new Uint8Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
      const blob = new Blob([arr], { type: mime });
      window.open(URL.createObjectURL(blob), '_blank');
    } catch { window.open(doc.base64, '_blank'); }
  }, []);

  return { getDriverDocs, uploadDoc, deleteDoc, openDoc };
}
