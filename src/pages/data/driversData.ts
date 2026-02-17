import { Driver } from '../types/dashboard';

export const companyDriversData: Driver[] = [
  { id: 1,  name: 'John Smith',         firstName: 'John',      lastName: 'Smith',    position: 'Owner Operator', equipment: 'Van',      status: 'Applied',        date: '01/15/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'percent', employmentStatus: 'Working' },
  { id: 2,  name: 'Maria Garcia',       firstName: 'Maria',     lastName: 'Garcia',   position: 'Company Driver', equipment: 'Reefer',   status: 'Contacted',      date: '01/18/2024', isEmployee: true, driverStatus: 'Not Ready', paymentType: 'miles',   employmentStatus: 'Working' },
  { id: 3,  name: 'James Wilson',       firstName: 'James',     lastName: 'Wilson',   position: 'Company Driver', equipment: 'Van',      status: 'Documents Sent', date: '01/20/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'miles',   employmentStatus: 'Fired'   },
  { id: 4,  name: 'Patricia Brown',     firstName: 'Patricia',  lastName: 'Brown',    position: 'Owner Operator', equipment: 'Reefer',   status: 'Applied',        date: '01/22/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'percent', employmentStatus: 'Working' },
  { id: 5,  name: 'Robert Jones',       firstName: 'Robert',    lastName: 'Jones',    position: 'Company Driver', equipment: 'Flat Bed', status: 'Contacted',      date: '01/25/2024', isEmployee: true, driverStatus: 'Not Ready', paymentType: 'percent', employmentStatus: 'Working' },
  { id: 6,  name: 'Linda Davis',        firstName: 'Linda',     lastName: 'Davis',    position: 'Owner Operator', equipment: 'Any',      status: 'Documents Sent', date: '02/01/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'percent', employmentStatus: 'Working' },
  { id: 7,  name: 'Michael Miller',     firstName: 'Michael',   lastName: 'Miller',   position: 'Company Driver', equipment: 'Van',      status: 'Applied',        date: '02/03/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'miles',   employmentStatus: 'Working' },
  { id: 8,  name: 'Elizabeth Martinez', firstName: 'Elizabeth', lastName: 'Martinez', position: 'Company Driver', equipment: 'Flat Bed', status: 'Contacted',      date: '02/05/2024', isEmployee: true, driverStatus: 'Not Ready', paymentType: 'miles',   employmentStatus: 'Working' },
  { id: 9,  name: 'William Anderson',   firstName: 'William',   lastName: 'Anderson', position: 'Owner Operator', equipment: 'Reefer',   status: 'Applied',        date: '02/08/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'percent', employmentStatus: 'Working' },
  { id: 10, name: 'Jennifer Taylor',    firstName: 'Jennifer',  lastName: 'Taylor',   position: 'Company Driver', equipment: 'Reefer',   status: 'Documents Sent', date: '02/10/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'miles',   employmentStatus: 'Working' },
];

export const allApplicantsData: Driver[] = [
  { id: 1,  name: 'John Doe',          firstName: 'John',     lastName: 'Doe',      position: 'Owner Operator', equipment: 'Van',      status: 'Applied',        date: '07/22/23' },
  { id: 2,  name: 'Jane Smith',        firstName: 'Jane',     lastName: 'Smith',    position: 'Company Driver', equipment: 'Reefer',   status: 'Contacted',      date: '07/22/23' },
  { id: 3,  name: 'Mike Johnson',      firstName: 'Mike',     lastName: 'Johnson',  position: 'Owner Operator', equipment: 'Flat Bed', status: 'Documents Sent', date: '07/22/23' },
  { id: 4,  name: 'Sarah Williams',    firstName: 'Sarah',    lastName: 'Williams', position: 'Company Driver', equipment: 'Van',      status: 'Applied',        date: '07/23/23' },
  { id: 5,  name: 'David Brown',       firstName: 'David',    lastName: 'Brown',    position: 'Company Driver', equipment: 'Reefer',   status: 'Contacted',      date: '07/23/23' },
  { id: 6,  name: 'Emily Davis',       firstName: 'Emily',    lastName: 'Davis',    position: 'Owner Operator', equipment: 'Flat Bed', status: 'Documents Sent', date: '07/24/23' },
  { id: 7,  name: 'Michael Wilson',    firstName: 'Michael',  lastName: 'Wilson',   position: 'Owner Operator', equipment: 'Any',      status: 'Applied',        date: '07/24/23' },
  { id: 8,  name: 'Jennifer Martinez', firstName: 'Jennifer', lastName: 'Martinez', position: 'Company Driver', equipment: 'Van',      status: 'Contacted',      date: '07/25/23' },
  { id: 9,  name: 'Robert Taylor',     firstName: 'Robert',   lastName: 'Taylor',   position: 'Company Driver', equipment: 'Flat Bed', status: 'Applied',        date: '07/25/23' },
  { id: 10, name: 'Jessica Anderson',  firstName: 'Jessica',  lastName: 'Anderson', position: 'Owner Operator', equipment: 'Reefer',   status: 'Documents Sent', date: '07/26/23' },
];

export const defaultDocuments = [
  { id: 1, name: 'CDL Certificate',  type: 'PDF', uploadDate: '01/15/2024', size: '1.8 MB' },
  { id: 2, name: 'Medical Card',     type: 'PDF', uploadDate: '01/15/2024', size: '1.2 MB' },
  { id: 3, name: 'Working Contract', type: 'PDF', uploadDate: '01/15/2024', size: '2.5 MB' },
];
