import { ApplicationFormData } from '../types/application';
import { Driver } from '../types/dashboard';
import { StoredDoc } from '../hooks/useDocumentStorage';
import {
  generateApplicationPDFName,
  createApplicationPDFDataUrl,
} from '../utils/applicationPdfUtils';

// ── Storage keys — MUST match the existing hooks exactly ───────────────────

/** Same key useDocumentStorage uses: hr_documents_${companyId} */
function getDocStorageKey(companyId: string): string {
  return `hr_documents_${companyId}`;
}

/** New key for dynamically-added applicants — read by getCompanyData() */
function getApplicantsKey(companyId: string): string {
  return `hr_new_applicants_${companyId}`;
}

/** Key for tracking deleted applicant IDs (covers hardcoded + dynamic) */
function getDeletedApplicantsKey(companyId: string): string {
  return `hr_deleted_applicants_${companyId}`;
}

function getCurrentCompanyId(): string {
  try {
    const raw = localStorage.getItem('currentUser');
    const user = raw ? JSON.parse(raw) : null;
    return user?.companyId ?? 'company-paks';
  } catch {
    return 'company-paks';
  }
}

function generateApplicationId(): string {
  return `APP-${Date.now().toString(36).toUpperCase()}`;
}

function parseFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
  };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ── Read/write dynamic applicants ──────────────────────────────────────────

/** Exported so driversData.ts can merge these into the applicants list */
export function getNewApplicants(companyId: string): Driver[] {
  try {
    const raw = localStorage.getItem(getApplicantsKey(companyId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNewApplicant(companyId: string, driver: Driver): void {
  const existing = getNewApplicants(companyId);
  existing.push(driver);
  localStorage.setItem(getApplicantsKey(companyId), JSON.stringify(existing));
}

// ── Deleted applicants tracking ────────────────────────────────────────────

/** Get the set of deleted applicant IDs */
export function getDeletedApplicantIds(companyId: string): number[] {
  try {
    const raw = localStorage.getItem(getDeletedApplicantsKey(companyId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Delete an applicant by ID.
 * - Removes from dynamic applicants list (if it was a form submission)
 * - Adds to deleted IDs list (so hardcoded ones are also hidden)
 * - Removes their documents from storage
 */
export function deleteApplicant(applicantId: number): void {
  const companyId = getCurrentCompanyId();

  // 1. Add to deleted IDs list
  const deletedIds = getDeletedApplicantIds(companyId);
  if (!deletedIds.includes(applicantId)) {
    deletedIds.push(applicantId);
    localStorage.setItem(getDeletedApplicantsKey(companyId), JSON.stringify(deletedIds));
  }

  // 2. Remove from dynamic applicants (if present)
  const dynamicApplicants = getNewApplicants(companyId);
  const filtered = dynamicApplicants.filter(a => a.id !== applicantId);
  localStorage.setItem(getApplicantsKey(companyId), JSON.stringify(filtered));

  // 3. Remove their documents
  const docKey = getDocStorageKey(companyId);
  try {
    const raw = localStorage.getItem(docKey);
    const allDocs: Record<number, StoredDoc[]> = raw ? JSON.parse(raw) : {};
    delete allDocs[applicantId];
    localStorage.setItem(docKey, JSON.stringify(allDocs));
  } catch { /* ignore */ }
}

// ── Read a File as base64 data URL ─────────────────────────────────────────

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// ── Store documents into useDocumentStorage's format ───────────────────────

function storeDocuments(
  companyId: string,
  driverId: number,
  documents: StoredDoc[]
): void {
  const key = getDocStorageKey(companyId);
  let allDocs: Record<number, StoredDoc[]> = {};

  try {
    const raw = localStorage.getItem(key);
    allDocs = raw ? JSON.parse(raw) : {};
  } catch { /* fresh start */ }

  const existing = allDocs[driverId] || [];
  allDocs[driverId] = [...existing, ...documents];

  try {
    localStorage.setItem(key, JSON.stringify(allDocs));
  } catch {
    console.warn('localStorage quota exceeded storing application documents');
  }
}

// ── Main submission function ───────────────────────────────────────────────

/**
 * Submits the application to the dashboard:
 * 1. Generates a unique application ID
 * 2. Creates the application PDF (From-{Name}-{ID}.pdf)
 * 3. Reads CDL and Medical Card files as base64
 * 4. Adds new applicant to localStorage → picked up by getCompanyData()
 * 5. Stores ALL documents (PDF + CDL + Medical Card) in hr_documents_${companyId}
 *    → picked up by useDocumentStorage() on the Documents page
 *
 * No downloads — everything lives in the dashboard Documents page.
 */
export async function submitApplicationToDashboard(
  formData: ApplicationFormData
): Promise<{ success: boolean; applicationId: string; pdfFileName: string }> {
  const applicationId = generateApplicationId();
  const companyId = getCurrentCompanyId();
  const { firstName, lastName } = parseFullName(formData.name);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

  // Generate PDF name: From-{Name}-{ID}.pdf
  const pdfFileName = generateApplicationPDFName(formData.name, applicationId);

  // Create the application PDF content as base64 data URL
  const pdfDataUrl = createApplicationPDFDataUrl(formData, applicationId);

  // Get next available ID (start at 100+ to avoid colliding with hardcoded IDs)
  const existingNew = getNewApplicants(companyId);
  const maxId = existingNew.length > 0
    ? Math.max(...existingNew.map(a => a.id))
    : 100;
  const driverId = maxId + 1;

  // Create the new applicant — tagged "Applied"
  const driver: Driver = {
    id: driverId,
    name: formData.name,
    firstName,
    lastName,
    position: 'Company Driver',
    equipment: 'Van',
    status: 'Applied',
    date: dateStr,
  };

  // 1. Save applicant → getCompanyData() will merge this into applicants list
  saveNewApplicant(companyId, driver);

  // 2. Build the documents array to store
  const documents: StoredDoc[] = [];

  // Application PDF — always stored
  documents.push({
    id: Date.now(),
    name: pdfFileName,
    type: 'PDF',
    uploadDate: dateStr,
    size: `${Math.round(pdfDataUrl.length / 1024)} KB`,
    base64: pdfDataUrl,
  });

  // CDL photo/file (if uploaded)
  if (formData.cdlFile) {
    try {
      const cdlBase64 = await readFileAsBase64(formData.cdlFile);
      documents.push({
        id: Date.now() + 1,
        name: formData.cdlFile.name,
        type: 'PDF',
        uploadDate: dateStr,
        size: formatFileSize(formData.cdlFile.size),
        base64: cdlBase64,
      });
    } catch {
      console.warn('Failed to read CDL file');
    }
  }

  // Medical Card photo/file (if uploaded)
  if (formData.medicalCardFile) {
    try {
      const medBase64 = await readFileAsBase64(formData.medicalCardFile);
      documents.push({
        id: Date.now() + 2,
        name: formData.medicalCardFile.name,
        type: 'PDF',
        uploadDate: dateStr,
        size: formatFileSize(formData.medicalCardFile.size),
        base64: medBase64,
      });
    } catch {
      console.warn('Failed to read Medical Card file');
    }
  }

  // 3. Store ALL documents → useDocumentStorage() will find them on Documents page
  storeDocuments(companyId, driverId, documents);

  return { success: true, applicationId, pdfFileName };
}
