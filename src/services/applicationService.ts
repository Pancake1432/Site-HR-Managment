import { ApplicationFormData } from '../types/application';
import { submitApplicationToDashboard } from './applicationSubmitService';

/**
 * Submits the application:
 * - Generates the PDF (From-{Name}-{ID}.pdf)
 * - Reads and stores CDL + Medical Card photos into dashboard documents
 * - Adds a new applicant to the dashboard recruiting page with "Applied" tag
 */
export async function submitApplication(formData: ApplicationFormData): Promise<{
  success: boolean;
  applicationId?: string;
  error?: string;
}> {
  try {
    console.log('📤 Starting application submission...');

    // Submit to the dashboard (creates applicant + stores PDF + uploaded files)
    const result = await submitApplicationToDashboard(formData);

    console.log('✅ Application submitted:', {
      id: result.applicationId,
      pdf: result.pdfFileName,
      name: formData.name,
    });

    return {
      success: true,
      applicationId: result.applicationId,
    };
  } catch (error) {
    console.error('❌ Application submission error:', error);

    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Saves application draft to local storage
 */
export function saveDraft(formData: Partial<ApplicationFormData>): void {
  try {
    const { cdlFile, medicalCardFile, ...serializableData } = formData;
    localStorage.setItem('application_draft', JSON.stringify(serializableData));
    localStorage.setItem('application_draft_timestamp', new Date().toISOString());
    console.log('💾 Draft saved');
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
    if (draft) {
      console.log('📂 Draft loaded');
      return JSON.parse(draft);
    }
    return null;
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
    console.log('🗑️ Draft cleared');
  } catch (error) {
    console.error('Failed to clear draft:', error);
  }
}
