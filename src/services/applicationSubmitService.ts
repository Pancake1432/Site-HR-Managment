import { ApplicationFormData } from '../types/application';
import { Driver, EquipmentType, StatusType } from '../types/dashboard';
import { DriverDocSet } from '../hooks/useDriverDocStorage';
import {
  generateApplicationPDFName,
  createApplicationPDFDataUrl,
} from '../utils/applicationPdfUtils';

// ── Storage keys ────────────────────────────────────────────────────────────

/**
 * SINGLE document storage key used by useDriverDocStorage for BOTH
 * applicants (Documents tab) and hired drivers (Drivers tab).
 */
function getDriverDocStorageKey(companyId: string): string {
  return `hr_driver_docs_${companyId}`;
}

function getApplicantsKey(companyId: string): string {
  return `hr_new_applicants_${companyId}`;
}

function getDeletedApplicantsKey(companyId: string): string {
  return `hr_deleted_applicants_${companyId}`;
}

function getApplicantOverridesKey(companyId: string): string {
  return `hr_applicant_overrides_${companyId}`;
}

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
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || '' };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ── Driver doc slot storage helpers ────────────────────────────────────────

function loadDriverDocs(companyId: string): Record<number, DriverDocSet> {
  try {
    const raw = localStorage.getItem(getDriverDocStorageKey(companyId));
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveDriverDocs(companyId: string, data: Record<number, DriverDocSet>): void {
  try {
    localStorage.setItem(getDriverDocStorageKey(companyId), JSON.stringify(data));
  } catch {
    console.warn('localStorage quota exceeded storing driver docs');
  }
}

// ── Read/write dynamic applicants ──────────────────────────────────────────

export function getNewApplicants(companyId: string): Driver[] {
  try {
    const raw = localStorage.getItem(getApplicantsKey(companyId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveNewApplicant(companyId: string, driver: Driver): void {
  const existing = getNewApplicants(companyId);
  existing.push(driver);
  localStorage.setItem(getApplicantsKey(companyId), JSON.stringify(existing));
}

// ── Deleted applicants tracking ────────────────────────────────────────────

export function getDeletedApplicantIds(companyId: string): number[] {
  try {
    const raw = localStorage.getItem(getDeletedApplicantsKey(companyId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function deleteApplicant(applicantId: number): void {
  const companyId = getCurrentCompanyId();

  const deletedIds = getDeletedApplicantIds(companyId);
  if (!deletedIds.includes(applicantId)) {
    deletedIds.push(applicantId);
    localStorage.setItem(getDeletedApplicantsKey(companyId), JSON.stringify(deletedIds));
  }

  const list = getNewApplicants(companyId).filter(a => a.id !== applicantId);
  localStorage.setItem(getApplicantsKey(companyId), JSON.stringify(list));

  const allDocs = loadDriverDocs(companyId);
  delete allDocs[applicantId];
  saveDriverDocs(companyId, allDocs);
}

// ── Applicant overrides (equipment, status, etc.) ──────────────────────────

export interface ApplicantOverride {
  equipment?: EquipmentType;
  status?: StatusType;
}

export function getApplicantOverrides(companyId: string): Record<number, ApplicantOverride> {
  try {
    const raw = localStorage.getItem(getApplicantOverridesKey(companyId));
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function saveApplicantOverride(applicantId: number, fields: ApplicantOverride): void {
  const companyId = getCurrentCompanyId();
  const overrides = getApplicantOverrides(companyId);
  overrides[applicantId] = { ...(overrides[applicantId] ?? {}), ...fields };
  localStorage.setItem(getApplicantOverridesKey(companyId), JSON.stringify(overrides));
}

// ── Hired drivers ──────────────────────────────────────────────────────────

export function getHiredDrivers(companyId: string): Driver[] {
  try {
    const raw = localStorage.getItem(getHiredDriversKey(companyId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

/**
 * Hire an applicant.
 * Both applicants and drivers share hr_driver_docs_${companyId}.
 * We copy the applicant's doc slots to the new driver ID, then clean up.
 */
export function hireApplicant(applicant: Driver, applicantDocs: DriverDocSet): void {
  const companyId = getCurrentCompanyId();

  // 1. Create hired driver record
  const existingHired = getHiredDrivers(companyId);
  const maxId = existingHired.length > 0 ? Math.max(...existingHired.map(d => d.id)) : 200;
  const newDriverId = maxId + 1;

  const dateStr = new Date().toLocaleDateString('en-US', {
    month: '2-digit', day: '2-digit', year: 'numeric',
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

  // 2. Transfer doc slots: applicant ID -> new driver ID
  const allDocs = loadDriverDocs(companyId);
  allDocs[newDriverId] = {
    cdl:             applicantDocs.cdl           ?? null,
    medicalCard:     applicantDocs.medicalCard    ?? null,
    applicationPdf:  applicantDocs.applicationPdf ?? null,
    workingContract: null, // uploaded after in-person signing & scan
  };

  // Remove old applicant slot
  delete allDocs[applicant.id];
  saveDriverDocs(companyId, allDocs);

  // 3. Remove applicant from Documents list
  const deletedIds = getDeletedApplicantIds(companyId);
  if (!deletedIds.includes(applicant.id)) {
    deletedIds.push(applicant.id);
    localStorage.setItem(getDeletedApplicantsKey(companyId), JSON.stringify(deletedIds));
  }
  const filteredList = getNewApplicants(companyId).filter(a => a.id !== applicant.id);
  localStorage.setItem(getApplicantsKey(companyId), JSON.stringify(filteredList));
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

// ── Main form submission ────────────────────────────────────────────────────

/**
 * Called when applicant submits the multi-step form.
 * Stores all 3 typed document slots directly into hr_driver_docs so the
 * Documents tab and hire transfer work without any conversion step.
 */
export async function submitApplicationToDashboard(
  formData: ApplicationFormData
): Promise<{ success: boolean; applicationId: string; pdfFileName: string }> {
  const applicationId = generateApplicationId();
  const companyId = getCurrentCompanyId();
  const { firstName, lastName } = parseFullName(formData.name);

  const dateStr = new Date().toLocaleDateString('en-US', {
    month: '2-digit', day: '2-digit', year: 'numeric',
  });

  // Assign applicant ID
  const existingNew = getNewApplicants(companyId);
  const maxId = existingNew.length > 0 ? Math.max(...existingNew.map(a => a.id)) : 100;
  const driverId = maxId + 1;

  // Save applicant record
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

  // Build Application PDF slot
  const pdfFileName = generateApplicationPDFName(formData.name, applicationId);
  const pdfDataUrl = createApplicationPDFDataUrl(formData, applicationId);

  const docSet: DriverDocSet = {
    applicationPdf: {
      id: Date.now(),
      name: pdfFileName,
      type: 'PDF',
      uploadDate: dateStr,
      size: `${Math.round(pdfDataUrl.length / 1024)} KB`,
      base64: pdfDataUrl,
    },
    cdl: null,
    medicalCard: null,
    workingContract: null,
  };

  // Attach CDL if provided
  if (formData.cdlFile) {
    try {
      const base64 = await readFileAsBase64(formData.cdlFile);
      docSet.cdl = {
        id: Date.now() + 1,
        name: formData.cdlFile.name,
        type: 'PDF',
        uploadDate: dateStr,
        size: formatFileSize(formData.cdlFile.size),
        base64,
      };
    } catch { console.warn('Failed to read CDL file'); }
  }

  // Attach Medical Card if provided
  if (formData.medicalCardFile) {
    try {
      const base64 = await readFileAsBase64(formData.medicalCardFile);
      docSet.medicalCard = {
        id: Date.now() + 2,
        name: formData.medicalCardFile.name,
        type: 'PDF',
        uploadDate: dateStr,
        size: formatFileSize(formData.medicalCardFile.size),
        base64,
      };
    } catch { console.warn('Failed to read Medical Card file'); }
  }

  // Save all slots into the shared driver doc storage
  const allDocs = loadDriverDocs(companyId);
  allDocs[driverId] = docSet;
  saveDriverDocs(companyId, allDocs);

  return { success: true, applicationId, pdfFileName };
}
