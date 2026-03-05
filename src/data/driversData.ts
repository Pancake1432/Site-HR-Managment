import { Driver } from '../types/dashboard';
import { getNewApplicants, getDeletedApplicantIds, getApplicantOverrides, getHiredDrivers, getFiredDriverIds } from '../services/applicationSubmitService';

// ─────────────────────────────────────────────────────────────────────────────
// COMPANY DATA MAP
// Key = companyId (matches the one stored in localStorage on login)
// Each entry has its own employees (companyDrivers) and applicants
//
// To add a new company:
//   1. Add an entry here with a unique companyId key
//   2. Add a matching login account in LoginPage.tsx
// ─────────────────────────────────────────────────────────────────────────────

interface CompanyDataset {
  companyName:    string;
  companyDrivers: Driver[];
  applicants:     Driver[];
}

export const allCompanyData: Record<string, CompanyDataset> = {

  // ── Company 1: Paks Logistic ─────────────────────────────────────────────
  'company-paks': {
    companyName: 'Paks Logistic LLC',
    companyDrivers: [
      { id: 1,  name: 'John Smith',         firstName: 'John',      lastName: 'Smith',    position: 'Owner Operator', equipment: 'Van',      status: 'Applied',        date: '01/15/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'percent', employmentStatus: 'Working' },
      { id: 2,  name: 'Maria Garcia',       firstName: 'Maria',     lastName: 'Garcia',   position: 'Company Driver', equipment: 'Reefer',   status: 'Contacted',      date: '01/18/2024', isEmployee: true, driverStatus: 'Not Ready', paymentType: 'miles',   employmentStatus: 'Fired'   },
      { id: 3,  name: 'James Wilson',       firstName: 'James',     lastName: 'Wilson',   position: 'Company Driver', equipment: 'Van',      status: 'Documents Sent', date: '01/20/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'miles',   employmentStatus: 'Working' },
      { id: 4,  name: 'Patricia Brown',     firstName: 'Patricia',  lastName: 'Brown',    position: 'Owner Operator', equipment: 'Reefer',   status: 'Applied',        date: '01/22/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'percent', employmentStatus: 'Working' },
      { id: 5,  name: 'Robert Jones',       firstName: 'Robert',    lastName: 'Jones',    position: 'Company Driver', equipment: 'Flat Bed', status: 'Contacted',      date: '01/25/2024', isEmployee: true, driverStatus: 'Not Ready', paymentType: 'percent', employmentStatus: 'Working' },
      { id: 6,  name: 'Linda Davis',        firstName: 'Linda',     lastName: 'Davis',    position: 'Owner Operator', equipment: 'Van',      status: 'Documents Sent', date: '02/01/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'percent', employmentStatus: 'Working' },
      { id: 7,  name: 'Michael Miller',     firstName: 'Michael',   lastName: 'Miller',   position: 'Company Driver', equipment: 'Van',      status: 'Applied',        date: '02/03/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'miles',   employmentStatus: 'Working' },
      { id: 8,  name: 'Elizabeth Martinez', firstName: 'Elizabeth', lastName: 'Martinez', position: 'Company Driver', equipment: 'Flat Bed', status: 'Contacted',      date: '02/05/2024', isEmployee: true, driverStatus: 'Not Ready', paymentType: 'miles',   employmentStatus: 'Fired'   },
      { id: 9,  name: 'William Anderson',   firstName: 'William',   lastName: 'Anderson', position: 'Owner Operator', equipment: 'Reefer',   status: 'Applied',        date: '02/08/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'percent', employmentStatus: 'Working' },
      { id: 10, name: 'Jennifer Taylor',    firstName: 'Jennifer',  lastName: 'Taylor',   position: 'Company Driver', equipment: 'Reefer',   status: 'Documents Sent', date: '02/10/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'miles',   employmentStatus: 'Working' },
    ],
    applicants: [
      { id: 1,  name: 'John Doe',          firstName: 'John',     lastName: 'Doe',      position: 'Owner Operator', equipment: 'Van',      status: 'Applied',        date: '07/22/23' },
      { id: 2,  name: 'Jane Smith',        firstName: 'Jane',     lastName: 'Smith',    position: 'Company Driver', equipment: 'Reefer',   status: 'Contacted',      date: '07/22/23' },
      { id: 3,  name: 'Mike Johnson',      firstName: 'Mike',     lastName: 'Johnson',  position: 'Owner Operator', equipment: 'Flat Bed', status: 'Documents Sent', date: '07/22/23' },
      { id: 4,  name: 'Sarah Williams',    firstName: 'Sarah',    lastName: 'Williams', position: 'Company Driver', equipment: 'Van',      status: 'Applied',        date: '07/23/23' },
      { id: 5,  name: 'David Brown',       firstName: 'David',    lastName: 'Brown',    position: 'Company Driver', equipment: 'Reefer',   status: 'Contacted',      date: '07/23/23' },
      { id: 6,  name: 'Emily Davis',       firstName: 'Emily',    lastName: 'Davis',    position: 'Owner Operator', equipment: 'Flat Bed', status: 'Documents Sent', date: '07/24/23' },
      { id: 7,  name: 'Michael Wilson',    firstName: 'Michael',  lastName: 'Wilson',   position: 'Owner Operator', equipment: 'Van',      status: 'Applied',        date: '07/24/23' },
      { id: 8,  name: 'Jennifer Martinez', firstName: 'Jennifer', lastName: 'Martinez', position: 'Company Driver', equipment: 'Van',      status: 'Contacted',      date: '07/25/23' },
      { id: 9,  name: 'Robert Taylor',     firstName: 'Robert',   lastName: 'Taylor',   position: 'Company Driver', equipment: 'Flat Bed', status: 'Applied',        date: '07/25/23' },
      { id: 10, name: 'Jessica Anderson',  firstName: 'Jessica',  lastName: 'Anderson', position: 'Owner Operator', equipment: 'Reefer',   status: 'Documents Sent', date: '07/26/23' },
    ],
  },

  // ── Company 2: Swift Transport ───────────────────────────────────────────
  'company-swift': {
    companyName: 'Swift Transport Inc',
    companyDrivers: [
      { id: 1, name: 'Carlos Rivera',   firstName: 'Carlos',   lastName: 'Rivera',   position: 'Company Driver', equipment: 'Van',      status: 'Applied',        date: '03/01/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'miles',   employmentStatus: 'Working' },
      { id: 2, name: 'Anna Kowalski',   firstName: 'Anna',     lastName: 'Kowalski', position: 'Owner Operator', equipment: 'Reefer',   status: 'Contacted',      date: '03/05/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'percent', employmentStatus: 'Working' },
      { id: 3, name: 'Tony Nguyen',     firstName: 'Tony',     lastName: 'Nguyen',   position: 'Company Driver', equipment: 'Flat Bed', status: 'Documents Sent', date: '03/08/2024', isEmployee: true, driverStatus: 'Not Ready', paymentType: 'miles',   employmentStatus: 'Working' },
      { id: 4, name: 'Diana Petrov',    firstName: 'Diana',    lastName: 'Petrov',   position: 'Owner Operator', equipment: 'Van',      status: 'Applied',        date: '03/10/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'percent', employmentStatus: 'Working' },
      { id: 5, name: 'Marcus Johnson',  firstName: 'Marcus',   lastName: 'Johnson',  position: 'Company Driver', equipment: 'Van',      status: 'Contacted',      date: '03/14/2024', isEmployee: true, driverStatus: 'Not Ready', paymentType: 'miles',   employmentStatus: 'Fired'   },
      { id: 6, name: 'Sophie Laurent',  firstName: 'Sophie',   lastName: 'Laurent',  position: 'Company Driver', equipment: 'Reefer',   status: 'Documents Sent', date: '03/18/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'miles',   employmentStatus: 'Working' },
    ],
    applicants: [
      { id: 1, name: 'Kevin Park',      firstName: 'Kevin',    lastName: 'Park',     position: 'Company Driver', equipment: 'Van',      status: 'Applied',        date: '03/20/24' },
      { id: 2, name: 'Lucia Morales',   firstName: 'Lucia',    lastName: 'Morales',  position: 'Owner Operator', equipment: 'Reefer',   status: 'Contacted',      date: '03/21/24' },
      { id: 3, name: 'Frank Müller',    firstName: 'Frank',    lastName: 'Müller',   position: 'Company Driver', equipment: 'Flat Bed', status: 'Documents Sent', date: '03/22/24' },
      { id: 4, name: 'Yuki Tanaka',     firstName: 'Yuki',     lastName: 'Tanaka',   position: 'Owner Operator', equipment: 'Van',      status: 'Applied',        date: '03/23/24' },
      { id: 5, name: 'Dmitri Volkov',   firstName: 'Dmitri',   lastName: 'Volkov',   position: 'Company Driver', equipment: 'Reefer',   status: 'Contacted',      date: '03/24/24' },
    ],
  },

  // ── Company 3: Eagle Freight ─────────────────────────────────────────────
  'company-eagle': {
    companyName: 'Eagle Freight Solutions',
    companyDrivers: [
      { id: 1, name: 'Tom Bradley',     firstName: 'Tom',      lastName: 'Bradley',  position: 'Owner Operator', equipment: 'Flat Bed', status: 'Applied',        date: '04/01/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'percent', employmentStatus: 'Working' },
      { id: 2, name: 'Nina Osei',       firstName: 'Nina',     lastName: 'Osei',     position: 'Company Driver', equipment: 'Van',      status: 'Documents Sent', date: '04/03/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'miles',   employmentStatus: 'Working' },
      { id: 3, name: 'Paul Reyes',      firstName: 'Paul',     lastName: 'Reyes',    position: 'Company Driver', equipment: 'Reefer',   status: 'Contacted',      date: '04/06/2024', isEmployee: true, driverStatus: 'Not Ready', paymentType: 'miles',   employmentStatus: 'Working' },
      { id: 4, name: 'Clara Hoffmann',  firstName: 'Clara',    lastName: 'Hoffmann', position: 'Owner Operator', equipment: 'Van',      status: 'Applied',        date: '04/09/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'percent', employmentStatus: 'Working' },
    ],
    applicants: [
      { id: 1, name: 'Alex Turner',     firstName: 'Alex',     lastName: 'Turner',   position: 'Owner Operator', equipment: 'Flat Bed', status: 'Applied',        date: '04/10/24' },
      { id: 2, name: 'Priya Sharma',    firstName: 'Priya',    lastName: 'Sharma',   position: 'Company Driver', equipment: 'Reefer',   status: 'Contacted',      date: '04/11/24' },
      { id: 3, name: 'Ben Castillo',    firstName: 'Ben',      lastName: 'Castillo', position: 'Company Driver', equipment: 'Van',      status: 'Applied',        date: '04/12/24' },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — kept for backward compat during migration
// ─────────────────────────────────────────────────────────────────────────────
export const defaultDocuments = [
  { id: 1, name: 'CDL Certificate',  type: 'PDF', uploadDate: '01/15/2024', size: '1.8 MB' },
  { id: 2, name: 'Medical Card',     type: 'PDF', uploadDate: '01/15/2024', size: '1.2 MB' },
  { id: 3, name: 'Working Contract', type: 'PDF', uploadDate: '01/15/2024', size: '2.5 MB' },
];

/**
 * Returns the dataset for the given companyId.
 * - Merges new applicants from form submissions
 * - Filters out deleted applicants
 * - Applies equipment overrides
 * - Merges hired drivers into companyDrivers
 */
export function getCompanyData(companyId: string) {
  const base = allCompanyData[companyId] ?? allCompanyData['company-paks'];
  const dynamicApplicants = getNewApplicants(companyId);
  const deletedIds = getDeletedApplicantIds(companyId);
  const overrides = getApplicantOverrides(companyId);
  const hiredDrivers = getHiredDrivers(companyId);
  const firedIds     = getFiredDriverIds(companyId);

  // ── Applicants: merge dynamic + filter deleted + apply overrides ──
  const allApplicants = [...base.applicants, ...dynamicApplicants];

  const filteredApplicants = allApplicants
    .filter(a => !deletedIds.includes(a.id))
    .map(a => {
      const override = overrides[a.id];
      return override ? { ...a, ...override } : a;
    });

  // ── Company Drivers: merge hardcoded + hired, then remove fired ──
  const allDrivers = [...base.companyDrivers, ...hiredDrivers]
    .filter(d => !firedIds.includes(d.id));

  return {
    ...base,
    companyDrivers: allDrivers,
    applicants: filteredApplicants,
  };
}
