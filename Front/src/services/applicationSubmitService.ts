import axios from 'axios';

const BASE_URL   = import.meta.env.VITE_API_URL ?? 'https://localhost:7001';
const COMPANY_ID = 'company-paks';

function getToken(): string { return localStorage.getItem('hr_access_token') ?? ''; }
function authHeaders() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// ── Applicant equipment ───────────────────────────────────────────────────────
export async function saveApplicantOverride(
  applicantId: number,
  fields: { status?: string; equipment?: string }
): Promise<void> {
  if (fields.equipment && !fields.status) {
    await axios.put(`${BASE_URL}/api/applicants/${applicantId}/equipment`,
      { equipment: fields.equipment }, { headers: authHeaders() });
    return;
  }
  await axios.put(`${BASE_URL}/api/applicants/${applicantId}/status`,
    { status: fields.status ?? null, equipment: fields.equipment ?? null },
    { headers: authHeaders() });
}

export async function deleteApplicant(id: number): Promise<void> {
  await axios.delete(`${BASE_URL}/api/applicants/${id}`, { headers: authHeaders() });
}

export async function hireApplicant(a: { id: number }): Promise<void> {
  await axios.post(`${BASE_URL}/api/applicants/${a.id}/hire`, {}, { headers: authHeaders() });
}

export async function addManualDriver(input: {
  firstName: string; lastName: string; position: string;
  driverStatus: string; equipment: string; paymentType: string;
}): Promise<number> {
  const res = await axios.post(`${BASE_URL}/api/drivers`, {
    name: `${input.firstName} ${input.lastName}`.trim(),
    firstName: input.firstName, lastName: input.lastName,
    position: input.position, equipment: input.equipment,
    status: 'Docs Sent', driverStatus: input.driverStatus,
    paymentType: input.paymentType, employmentStatus: 'Working', isEmployee: true,
  }, { headers: authHeaders() });
  return res.data.id;
}

export async function fireDriver(id: number): Promise<void> {
  await axios.delete(`${BASE_URL}/api/drivers/${id}`, { headers: authHeaders() });
}

// ── Read file as base64 ───────────────────────────────────────────────────────
function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload  = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

// ── Submit application form ────────────────────────────────────────────────────
// 1. Sends text data → creates applicant in DB
// 2. Uploads CDL and Medical Card to /api/documents/public
export async function submitApplicationToDashboard(formData: {
  name:             string;
  cdlFile?:         File | null;
  medicalCardFile?: File | null;
  [key: string]:    unknown;
}): Promise<{ applicationId: string; pdfFileName: string }> {

  const { cdlFile, medicalCardFile, ...textData } = formData;

  // Step 1 — submit text data, get applicantId back
  const res = await axios.post(`${BASE_URL}/api/applications`, {
    ...textData,
    companyId: COMPANY_ID,
  });

  const applicationId: string = res.data.applicationId;
  const applicantId:   number = res.data.applicantId;

  // Step 2 — upload files to backend
  if (cdlFile && applicantId) {
    try {
      const base64 = await readAsBase64(cdlFile);
      await axios.post(`${BASE_URL}/api/documents/public`, {
        driverId: applicantId,
        docType:  'cdl',
        name:     cdlFile.name,
        fileType: 'PDF',
        size:     formatSize(cdlFile.size),
        base64,
      });
    } catch (err) {
      console.warn('CDL upload failed:', err);
    }
  }

  if (medicalCardFile && applicantId) {
    try {
      const base64 = await readAsBase64(medicalCardFile);
      await axios.post(`${BASE_URL}/api/documents/public`, {
        driverId: applicantId,
        docType:  'medicalCard',
        name:     medicalCardFile.name,
        fileType: 'PDF',
        size:     formatSize(medicalCardFile.size),
        base64,
      });
    } catch (err) {
      console.warn('Medical Card upload failed:', err);
    }
  }

  return { applicationId, pdfFileName: `Application-${formData.name}.pdf` };
}

// ── Legacy stubs ──────────────────────────────────────────────────────────────
export function getNewApplicants(_: string)       { return []; }
export function getDeletedApplicantIds(_: string) { return []; }
export function getApplicantOverrides(_: string)  { return {}; }
export function getHiredDrivers(_: string)        { return []; }
export function getFiredDriverIds(_: string)      { return []; }
