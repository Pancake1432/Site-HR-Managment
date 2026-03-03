import { ApplicationFormData } from '../types/application';
import { Driver, EquipmentType } from '../types/dashboard';
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

/** Same key useDriverDocStorage uses: hr_driver_docs_${companyId} */
function getDriverDocStorageKey(companyId: string): string {
  return `hr_driver_docs_${companyId}`;
}

/** New key for dynamically-added applicants — read by getCompanyData() */
function getApplicantsKey(companyId: string): string {
  return `hr_new_applicants_${companyId}`;
}

/** Key for tracking deleted applicant IDs (covers hardcoded + dynamic) */
function getDeletedApplicantsKey(companyId: string): string {
  return `hr_deleted_applicants_${companyId}`;
}

/** Key for applicant field overrides (equipment, status, etc.) */
function getApplicantOverridesKey(companyId: string): string {
  return `hr_applicant_overrides_${companyId}`;
}

/** Key for hired drivers — merged into companyDrivers by getCompanyData() */
function getHiredDriversKey(companyId: string): string {
  return `hr_hired_drivers_${companyId}`;
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

// ── Applicant overrides (equipment, etc.) ──────────────────────────────────

export interface ApplicantOverride {
  equipment?: EquipmentType;
}

/** Get all applicant overrides for the current company */
export function getApplicantOverrides(companyId: string): Record<number, ApplicantOverride> {
  try {
    const raw = localStorage.getItem(getApplicantOverridesKey(companyId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Update equipment (or other fields) for an applicant */
export function saveApplicantOverride(applicantId: number, fields: ApplicantOverride): void {
  const companyId = getCurrentCompanyId();
  const overrides = getApplicantOverrides(companyId);
  overrides[applicantId] = { ...(overrides[applicantId] ?? {}), ...fields };
  localStorage.setItem(getApplicantOverridesKey(companyId), JSON.stringify(overrides));
}

// ── Hired drivers ──────────────────────────────────────────────────────────

/** Get all hired drivers for a company — merged into companyDrivers by getCompanyData() */
export function getHiredDrivers(companyId: string): Driver[] {
  try {
    const raw = localStorage.getItem(getHiredDriversKey(companyId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Hire an applicant — moves them from Documents to Drivers:
 * 1. Creates a Driver entry with isEmployee=true, driverStatus, paymentType, etc.
 * 2. Saves to hr_hired_drivers — picked up by Drivers page via getCompanyData()
 * 3. Transfers CDL + Medical Card to hr_driver_docs (useDriverDocStorage format)
 *    and stores the application PDF as the working contract
 * 4. Removes the applicant from Documents page (marks as deleted + cleans docs)
 */
export function hireApplicant(applicant: Driver, documents: StoredDoc[]): void {
  const companyId = getCurrentCompanyId();

  // ── 1. Create a new driver ID (200+ range to avoid collisions) ──
  const existingHired = getHiredDrivers(companyId);
  const maxId = existingHired.length > 0
    ? Math.max(...existingHired.map(d => d.id))
    : 200;
  const newDriverId = maxId + 1;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

  const hiredDriver: Driver = {
    id: newDriverId,
    name: applicant.name,
    firstName: applicant.firstName,
    lastName: applicant.lastName,
    position: applicant.position,
    equipment: applicant.equipment === 'Unsigned' ? 'Van' : applicant.equipment,
    status: 'Applied',
    date: dateStr,
    isEmployee: true,
    driverStatus: 'Not Ready',
    paymentType: 'miles',
    employmentStatus: 'Working',
  };

  existingHired.push(hiredDriver);
  localStorage.setItem(getHiredDriversKey(companyId), JSON.stringify(existingHired));

  // ── 2. Transfer documents to useDriverDocStorage format ──
  // DriverDocSet = { cdl, medicalCard, workingContract }
  // Application PDF (name starts with "From-") → workingContract slot
  // First non-PDF-named upload → CDL
  // Second non-PDF-named upload → Medical Card
  const driverDocKey = getDriverDocStorageKey(companyId);
  let driverDocs: Record<string, { cdl: unknown; medicalCard: unknown; workingContract: unknown }> = {};

  try {
    const raw = localStorage.getItem(driverDocKey);
    driverDocs = raw ? JSON.parse(raw) : {};
  } catch { /* fresh */ }

  const appPdf = documents.find(d => d.name.startsWith('From-'));
  const uploadedDocs = documents.filter(d => !d.name.startsWith('From-'));
  const cdlDoc = uploadedDocs[0] || null;
  const medDoc = uploadedDocs[1] || null;

  driverDocs[newDriverId] = {
    cdl: cdlDoc ? { id: cdlDoc.id, name: cdlDoc.name, type: cdlDoc.type, uploadDate: cdlDoc.uploadDate, size: cdlDoc.size, base64: cdlDoc.base64 } : null,
    medicalCard: medDoc ? { id: medDoc.id, name: medDoc.name, type: medDoc.type, uploadDate: medDoc.uploadDate, size: medDoc.size, base64: medDoc.base64 } : null,
    workingContract: appPdf ? { id: appPdf.id, name: appPdf.name, type: appPdf.type, uploadDate: appPdf.uploadDate, size: appPdf.size, base64: appPdf.base64 } : null,
  };

  try {
    localStorage.setItem(driverDocKey, JSON.stringify(driverDocs));
  } catch {
    console.warn('localStorage quota exceeded storing hired driver docs');
  }

  // ── 3. Remove applicant from Documents page ──
  // Mark as deleted so they disappear from the applicants list
  const deletedIds = getDeletedApplicantIds(companyId);
  if (!deletedIds.includes(applicant.id)) {
    deletedIds.push(applicant.id);
    localStorage.setItem(getDeletedApplicantsKey(companyId), JSON.stringify(deletedIds));
  }

  // Remove from dynamic applicants list too
  const dynamicApplicants = getNewApplicants(companyId);
  const filtered = dynamicApplicants.filter(a => a.id !== applicant.id);
  localStorage.setItem(getApplicantsKey(companyId), JSON.stringify(filtered));

  // Remove their documents from the Documents storage
  const docKey = getDocStorageKey(companyId);
  try {
    const raw = localStorage.getItem(docKey);
    const allDocs: Record<number, StoredDoc[]> = raw ? JSON.parse(raw) : {};
    delete allDocs[applicant.id];
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

  const pdfFileName = generateApplicationPDFName(formData.name, applicationId);
  const pdfDataUrl = createApplicationPDFDataUrl(formData, applicationId);

  const existingNew = getNewApplicants(companyId);
  const maxId = existingNew.length > 0
    ? Math.max(...existingNew.map(a => a.id))
    : 100;
  const driverId = maxId + 1;

  const driver: Driver = {
    id: driverId,
    name: formData.name,
    firstName,
    lastName,
    position: 'Company Driver',
    equipment: 'Unsigned',
    status: 'Documents Sent',
    date: dateStr,
  };

  saveNewApplicant(companyId, driver);

  const documents: StoredDoc[] = [];

  documents.push({
    id: Date.now(),
    name: pdfFileName,
    type: 'PDF',
    uploadDate: dateStr,
    size: `${Math.round(pdfDataUrl.length / 1024)} KB`,
    base64: pdfDataUrl,
  });

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

  storeDocuments(companyId, driverId, documents);

  return { success: true, applicationId, pdfFileName };
}
