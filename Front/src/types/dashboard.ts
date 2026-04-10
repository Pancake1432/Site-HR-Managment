export type PageType = 'dashboard' | 'drivers' | 'documents' | 'statements' | 'salary' | 'employees';
export type StatusType = 'Applied' | 'Contacted' | 'Documents Sent';
export type DriverStatusType = 'Ready' | 'Not Ready';
export type PaymentType = 'miles' | 'percent';
export type EmploymentStatus = 'Working' | 'Fired';
export type EquipmentType = 'Unsigned' | 'Van' | 'Reefer' | 'Flat Bed';

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
  notes?: string;
  statements?: Statement[];
}

export interface DocFile {
  id: number;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  /** Semantic type used to route docs to the correct driver slot on hire */
  docType?: 'cdl' | 'medicalCard' | 'application';
  /** ISO date string — expiry date for CDL and Medical Card */
  expiryDate?: string;
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

export interface SavedStatement {
  id: string;
  savedAt: string;
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
