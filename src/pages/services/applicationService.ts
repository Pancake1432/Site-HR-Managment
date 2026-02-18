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
      console.log(`📁 Mock upload: ${file.name} → ${mockUrl}`);
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
    console.log('📤 Starting application submission...');
    
    // Step 1: Upload files if they exist (OPTIONAL)
    let cdlFileUrl = '';
    let medicalCardFileUrl = '';

    if (formData.cdlFile) {
      console.log('📄 Uploading CDL...');
      cdlFileUrl = await uploadFile(formData.cdlFile, 'cdl-documents');
    } else {
      console.log('⚠️ No CDL file provided (optional)');
    }

    if (formData.medicalCardFile) {
      console.log('📄 Uploading Medical Card...');
      medicalCardFileUrl = await uploadFile(formData.medicalCardFile, 'medical-cards');
    } else {
      console.log('⚠️ No Medical Card file provided (optional)');
    }

    // Step 2: Prepare submission data
    const applicationId = generateApplicationId();
    
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

      // Documents (may be empty)
      cdlFileUrl: cdlFileUrl || undefined,
      medicalCardFileUrl: medicalCardFileUrl || undefined,

      // Metadata
      submittedAt: new Date().toISOString(),
      status: 'pending',
      id: applicationId,
    };

    console.log('📋 Application data prepared:', {
      id: applicationId,
      name: submission.name,
      email: submission.email,
      hasDocuments: !!(cdlFileUrl || medicalCardFileUrl)
    });

    // Step 3: Send to backend API
    // TODO: Replace with your actual API endpoint
    
    // DEVELOPMENT MODE: Mock successful submission
    // Comment out this block and uncomment the fetch below when backend is ready
    console.log('🔧 DEVELOPMENT MODE: Using mock submission');
    console.log('📊 Full submission data:', submission);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock success
    return {
      success: true,
      applicationId: submission.id,
    };

    // PRODUCTION MODE: Uncomment this when backend is ready
    /*
    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submission),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    console.log('✅ Application submitted successfully:', result);

    return {
      success: true,
      applicationId: result.id || submission.id,
    };
    */

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
 * Generates a unique application ID
 */
function generateApplicationId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `APP-${timestamp}-${random}`;
}

/**
 * Saves application draft to local storage
 * Useful for allowing users to continue later
 */
export function saveDraft(formData: Partial<ApplicationFormData>): void {
  try {
    // Don't save File objects to localStorage (they can't be serialized)
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
