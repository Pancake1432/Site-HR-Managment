import { ApplicationFormData, ApplicationSubmission } from '../types/application';

/**
 * Handles file upload to storage service (e.g., AWS S3, Firebase Storage)
 * Replace this with actual file upload implementation
 */
async function uploadFile(file: File, folder: string): Promise<string> {
  // TODO: Implement actual file upload to your storage service
  // For now, return a mock URL
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockUrl = `https://storage.example.com/${folder}/${Date.now()}_${file.name}`;
      resolve(mockUrl);
    }, 500);
  });
}

/**
 * Submits the application to the backend API
 * @param formData - The completed application form data
 * @returns Promise with the submission result
 */
export async function submitApplication(formData: ApplicationFormData): Promise<{
  success: boolean;
  applicationId?: string;
  error?: string;
}> {
  try {
    // Step 1: Upload files if they exist
    let cdlFileUrl = '';
    let medicalCardFileUrl = '';

    if (formData.cdlFile) {
      cdlFileUrl = await uploadFile(formData.cdlFile, 'cdl-documents');
    }

    if (formData.medicalCardFile) {
      medicalCardFileUrl = await uploadFile(formData.medicalCardFile, 'medical-cards');
    }

    // Step 2: Prepare submission data
    const submission: ApplicationSubmission = {
      // Personal info
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      familyStatus: formData.familyStatus,

      // Driving experience
      drivingExperience: formData.drivingExperience,
      previousCompany: formData.previousCompany,
      reasonForLeaving: formData.reasonForLeaving,
      felonies: formData.felonies,
      drivingRecord: formData.drivingRecord,
      workedReefer: formData.workedReefer,

      // Work preferences
      dislike: formData.dislike,
      hos: formData.hos,
      overnightPark: formData.overnightPark,
      specialConsideration: formData.specialConsideration,
      onRoad: formData.onRoad,

      // Availability
      drugTest: formData.drugTest,
      securingUnloading: formData.securingUnloading,
      salaryExpectation: formData.salaryExpectation,

      // Documents
      cdlFileUrl,
      medicalCardFileUrl,

      // Metadata
      submittedAt: new Date().toISOString(),
      status: 'pending',
      id: generateApplicationId(),
    };

    // Step 3: Send to backend API
    // TODO: Replace with your actual API endpoint
    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submission),
    });

    if (!response.ok) {
      throw new Error('Failed to submit application');
    }

    const result = await response.json();

    return {
      success: true,
      applicationId: result.id || submission.id,
    };

  } catch (error) {
    console.error('Application submission error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Generates a unique application ID
 */
function generateApplicationId(): string {
  return `APP-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}

/**
 * Saves application draft to local storage
 * Useful for allowing users to continue later
 */
export function saveDraft(formData: Partial<ApplicationFormData>): void {
  try {
    localStorage.setItem('application_draft', JSON.stringify(formData));
    localStorage.setItem('application_draft_timestamp', new Date().toISOString());
  } catch (error) {
    console.error('Failed to save draft:', error);
  }
}

/**
 * Loads application draft from local storage
 */
export function loadDraft(): Partial<ApplicationFormData> | null {
  try {
    const draft = localStorage.getItem('application_draft');
    return draft ? JSON.parse(draft) : null;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
}

/**
 * Clears the saved draft
 */
export function clearDraft(): void {
  try {
    localStorage.removeItem('application_draft');
    localStorage.removeItem('application_draft_timestamp');
  } catch (error) {
    console.error('Failed to clear draft:', error);
  }
}
