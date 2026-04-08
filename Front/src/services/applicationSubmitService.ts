/**
 * All operations go to the backend API.
 * Functions keep the same signatures as before — components do not change.
 */

import axios from 'axios';
import { ApplicationFormData } from '../types/application';
import {
  createApplicationPDFDataUrl,
  generateApplicationPDFName,
} from '../utils/applicationPdfUtils';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:7001';

function getToken(): string {
  return localStorage.getItem('hr_access_token') ?? '';
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

/** Read a File as a base64 data URL (e.g. "data:application/pdf;base64,….") */
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function formatSize(bytes: number): string {
  return bytes < 1_048_576
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / 1_048_576).toFixed(1)} MB`;
}

// ── Applicant overrides (status, equipment) ──────────────────────────────────
export async function saveApplicantOverride(
  applicantId: number,
  fields: { status?: string; equipment?: string }
): Promise<void> {
  await axios.put(
    `${BASE_URL}/api/applicants/${applicantId}/status`,
    { status: fields.status, equipment: fields.equipment },
    { headers: authHeaders() }
  );
}

// ── Delete applicant ──────────────────────────────────────────────────────────
export async function deleteApplicant(applicantId: number): Promise<void> {
  await axios.delete(
    `${BASE_URL}/api/applicants/${applicantId}`,
    { headers: authHeaders() }
  );
}

// ── Hire applicant → becomes driver ──────────────────────────────────────────
export async function hireApplicant(applicant: { id: number }): Promise<void> {
  await axios.post(
    `${BASE_URL}/api/applicants/${applicant.id}/hire`,
    {},
    { headers: authHeaders() }
  );
}

// ── Add manual driver ─────────────────────────────────────────────────────────
export async function addManualDriver(input: {
  firstName:    string;
  lastName:     string;
  position:     string;
  driverStatus: string;
  equipment:    string;
  paymentType:  string;
}): Promise<number> {
  const res = await axios.post(
    `${BASE_URL}/api/drivers`,
    {
      name:             `${input.firstName} ${input.lastName}`.trim(),
      firstName:        input.firstName,
      lastName:         input.lastName,
      position:         input.position,
      equipment:        input.equipment,
      status:           'Applied',
      driverStatus:     input.driverStatus,
      paymentType:      input.paymentType,
      employmentStatus: 'Working',
      isEmployee:       true,
    },
    { headers: authHeaders() }
  );
  // The API wraps the created driver inside ActionResponse: { data: { id, ... } }
  return res.data?.data?.id ?? res.data?.id ?? 0;
}

// ── Fire driver ───────────────────────────────────────────────────────────────
export async function fireDriver(driverId: number): Promise<void> {
  await axios.delete(
    `${BASE_URL}/api/drivers/${driverId}`,
    { headers: authHeaders() }
  );
}

// ── Submit application form (public — no auth needed) ─────────────────────────
export async function submitApplicationToDashboard(formData: {
  name: string;
  [key: string]: unknown;
}): Promise<{ applicationId: string; pdfFileName: string }> {

  // Read companyId from URL: /apply?company=company-paks
  const urlParams = new URLSearchParams(window.location.search);
  const companyId = urlParams.get('company') ?? 'company-paks';

  // Submit text fields only — strip File objects before JSON serialisation
  const res = await axios.post(`${BASE_URL}/api/applications`, {
    ...formData,
    cdlFile:         undefined,
    medicalCardFile: undefined,
    companyId,
  });

  const { applicationId, applicantId } = res.data;

  if (applicantId) {
    // 1. Upload the filled-in application form (steps 1–4) as an HTML document
    try {
      const pdfName   = generateApplicationPDFName(formData.name as string, applicationId);
      const base64Doc = createApplicationPDFDataUrl(
        formData as unknown as ApplicationFormData,
        applicationId
      );
      await axios.post(`${BASE_URL}/api/documents/public`, {
        driverId: applicantId,
        docType:  'applicationPdf',
        name:     pdfName,
        fileType: 'HTML',
        size:     `${Math.round(base64Doc.length / 1024)} KB`,
        base64:   base64Doc,
      });
    } catch (err) {
      console.warn('Could not upload application form document:', err);
    }

    // 2. Upload CDL file if the applicant provided one in step 5
    const cdlFile = formData.cdlFile as File | null | undefined;
    if (cdlFile instanceof File) {
      try {
        const base64 = await readFileAsBase64(cdlFile);
        await axios.post(`${BASE_URL}/api/documents/public`, {
          driverId: applicantId,
          docType:  'cdl',
          name:     cdlFile.name,
          fileType: cdlFile.type || 'application/pdf',
          size:     formatSize(cdlFile.size),
          base64,
        });
      } catch (err) {
        console.warn('Could not upload CDL file:', err);
      }
    }

    // 3. Upload Medical Card file if provided
    const medFile = formData.medicalCardFile as File | null | undefined;
    if (medFile instanceof File) {
      try {
        const base64 = await readFileAsBase64(medFile);
        await axios.post(`${BASE_URL}/api/documents/public`, {
          driverId: applicantId,
          docType:  'medicalCard',
          name:     medFile.name,
          fileType: medFile.type || 'application/pdf',
          size:     formatSize(medFile.size),
          base64,
        });
      } catch (err) {
        console.warn('Could not upload Medical Card file:', err);
      }
    }
  }

  return {
    applicationId,
    pdfFileName: `Application-${formData.name}.pdf`,
  };
}

// ── Getters (kept for compatibility — data now lives in the backend) ──────────
export function getNewApplicants(_companyId: string) { return []; }
export function getDeletedApplicantIds(_companyId: string) { return []; }
export function getApplicantOverrides(_companyId: string) { return {}; }
export function getHiredDrivers(_companyId: string) { return []; }
export function getFiredDriverIds(_companyId: string) { return []; }
