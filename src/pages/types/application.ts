export interface ApplicationFormData {
  // Personal Information (Step 1)
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  zip: string;
  familyStatus: string;

  // Driving Experience (Step 2)
  drivingExperience: string;
  previousCompany: string;
  reasonForLeaving: string;
  felonies: string;
  drivingRecord: string;
  workedReefer: string;

  // Work Preferences (Step 3)
  dislike: string;
  hos: string;
  overnightPark: string;
  specialConsideration: string;
  onRoad: string;

  // Availability (Step 4)
  drugTest: string;
  securingUnloading: string;
  salaryExpectation: string;

  // Documents (Step 5)
  cdlFile: File | null;
  medicalCardFile: File | null;
}

export interface ApplicationSubmission extends Omit<ApplicationFormData, 'cdlFile' | 'medicalCardFile'> {
  // For database storage - files will be stored separately
  cdlFileUrl?: string;
  medicalCardFileUrl?: string;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  id: string;
}
