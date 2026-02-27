export type PageType = 'dashboard' | 'drivers' | 'documents' | 'statements' | 'salary' | 'employees';
export type StatusType = 'Applied' | 'Contacted' | 'Documents Sent';
export type DriverStatusType = 'Ready' | 'Not Ready';
export type PaymentType = 'miles' | 'percent';
export type EmploymentStatus = 'Working' | 'Fired';
export type EquipmentType = 'Van' | 'Reefer' | 'Flat Bed' | 'Any';

export interface Driver {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  position: 'Owner Operator' | 'Company Driver';
  equipment: EquipmentType;
  status: StatusType;
  date: string;
  isEmployee?: boolean;
  documents?: DocFile[];
  driverStatus?: DriverStatusType;
  paymentType?: PaymentType;
  employmentStatus?: EmploymentStatus;
  statements?: Statement[];
}

export interface DocFile {
  id: number;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
}

export interface Statement {
  id: number;
  date: string;
  amount: string;
  type: string;
}

export interface StatementData {
  driverId: number | null;
  driverName: string;
  paymentType: PaymentType;
  miles: string;
  ratePerMile: string;
  percent: string;
  grossAmount: string;
  adjustmentType: 'bonus' | 'deduction';
  adjustmentAmount: string;
  adjustmentReason: string;
}

/** A fully-calculated statement saved to the Salary page */
export interface SavedStatement {
  id: string;
  savedAt: string;        // ISO date string
  driverId: number | null;
  driverName: string;
  paymentType: PaymentType;
  miles: string;
  ratePerMile: string;
  percent: string;
  grossAmount: string;
  adjustmentType: 'bonus' | 'deduction';
  adjustmentAmount: string;
  adjustmentReason: string;
  subtotal: string;
  adjustment: string;
  total: string;
}
