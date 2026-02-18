import { createContext, useContext, useState, ReactNode } from 'react';
import { ApplicationFormData } from '../types/application';

interface ApplicationContextType {
  formData: ApplicationFormData;
  updateField: <K extends keyof ApplicationFormData>(field: K, value: ApplicationFormData[K]) => void;
  updateFields: (fields: Partial<ApplicationFormData>) => void;
  resetForm: () => void;
}

const defaultFormData: ApplicationFormData = {
  name: '',
  phone: '',
  email: '',
  city: '',
  state: '',
  zip: '',
  familyStatus: '',
  drivingExperience: '',
  previousCompany: '',
  reasonForLeaving: '',
  felonies: '',
  drivingRecord: '',
  workedReefer: '',
  dislike: '',
  hos: '',
  overnightPark: '',
  specialConsideration: '',
  onRoad: '',
  drugTest: '',
  securingUnloading: '',
  salaryExpectation: '',
  cdlFile: null,
  medicalCardFile: null,
};

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<ApplicationFormData>(defaultFormData);

  const updateField = <K extends keyof ApplicationFormData>(
    field: K,
    value: ApplicationFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateFields = (fields: Partial<ApplicationFormData>) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  const resetForm = () => {
    setFormData(defaultFormData);
  };

  return (
    <ApplicationContext.Provider value={{ formData, updateField, updateFields, resetForm }}>
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplicationForm() {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplicationForm must be used within ApplicationProvider');
  }
  return context;
}
