import { ApplicationFormData } from '../types/application';
import { submitApplicationToDashboard } from './applicationSubmitService';

export async function submitApplication(formData: ApplicationFormData): Promise<{
  success: boolean; applicationId?: string; error?: string;
}> {
  try {
    const result = await submitApplicationToDashboard({
      name:             formData.name,
      phone:            formData.phone,
      email:            formData.email,
      city:             formData.city,
      state:            formData.state,
      zip:              formData.zip,
      familyStatus:     formData.familyStatus,
      drivingExperience:    formData.drivingExperience,
      previousCompany:      formData.previousCompany,
      reasonForLeaving:     formData.reasonForLeaving,
      felonies:             formData.felonies,
      drivingRecord:        formData.drivingRecord,
      workedReefer:         formData.workedReefer,
      dislike:              formData.dislike,
      hos:                  formData.hos,
      overnightPark:        formData.overnightPark,
      specialConsideration: formData.specialConsideration,
      onRoad:               formData.onRoad,
      drugTest:             formData.drugTest,
      securingUnloading:    formData.securingUnloading,
      salaryExpectation:    formData.salaryExpectation,
      // Files passed separately — submitApplicationToDashboard handles them
      cdlFile:         formData.cdlFile,
      medicalCardFile: formData.medicalCardFile,
    });
    return { success: true, applicationId: result.applicationId };
  } catch (error) {
    console.error('Application submission error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Server error. Please try again.',
    };
  }
}

export function saveDraft(_: Partial<ApplicationFormData>): void {}
export function loadDraft(): Partial<ApplicationFormData> | null { return null; }
export function clearDraft(): void {}
