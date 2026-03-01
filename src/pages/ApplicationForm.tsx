import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { ApplicationProvider, useApplicationForm } from './contexts/ApplicationContext';
import { submitApplication, saveDraft, clearDraft } from './services/applicationService';
import { useState } from 'react';
import '../styles/application.css';

// ── Step definitions (order matters) ────────────────────────────────────────
const STEPS = [
  { path: 'info',               label: 'Info'               },
  { path: 'personal-info',      label: 'Personal Info'      },
  { path: 'driving-experience', label: 'Driving Experience' },
  { path: 'work-preferences',   label: 'Work Preferences'   },
  { path: 'availability',       label: 'Availability'       },
  { path: 'documents',          label: 'Documents'          },
] as const;

// Derive current step index from URL
function useCurrentStep() {
  const { pathname } = useLocation();
  const slug = pathname.split('/').pop() ?? '';
  const idx = STEPS.findIndex(s => s.path === slug);
  return idx === -1 ? 0 : idx;
}

function ApplicationFormContent() {
  const navigate    = useNavigate();
  const { formData, resetForm } = useApplicationForm();
  const currentStep = useCurrentStep();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Validation per step ───────────────────────────────────────────────────
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: return true; // Info step has no inputs

      case 1: // Personal Information
        return !!(
          formData.name.trim() &&
          formData.phone.trim() &&
          formData.email.trim() &&
          formData.city.trim() &&
          formData.state.trim() &&
          formData.zip.trim() &&
          formData.familyStatus
        );

      case 2: // Driving Experience
        return !!(
          formData.drivingExperience &&
          formData.felonies.trim() &&
          formData.drivingRecord.trim() &&
          formData.workedReefer
        );

      case 3: // Work Preferences
        return !!(
          formData.dislike.trim() &&
          formData.hos &&
          formData.overnightPark &&
          formData.specialConsideration.trim() &&
          formData.onRoad.trim()
        );

      case 4: // Availability
        return !!(
          formData.drugTest &&
          formData.securingUnloading &&
          formData.salaryExpectation.trim()
        );

      case 5: return true; // Documents are optional

      default: return false;
    }
  };

  // ── Navigation helpers ────────────────────────────────────────────────────
  const goToStep = (index: number) => {
    navigate(`/apply/${STEPS[index].path}`);
  };

  const nextStep = () => {
    if (!isStepValid(currentStep)) {
      alert('Please fill in all required fields before proceeding.');
      return;
    }
    if (currentStep < STEPS.length - 1) {
      if (currentStep > 0) saveDraft(formData);
      goToStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) goToStep(currentStep - 1);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await submitApplication(formData);

      if (result.success) {
        alert(
          `Application submitted successfully!\n\nYour application ID is: ${result.applicationId}\n\nWe will review your application and contact you soon.`
        );
        clearDraft();
        resetForm();
        navigate('/');
      } else {
        alert(
          `Failed to submit application:\n\n${result.error}\n\nPlease try again or contact dispatch@pakslogistic.com for assistance.`
        );
      }
    } catch (error) {
      alert('An error occurred while submitting your application.\n\nPlease try again or contact dispatch@pakslogistic.com');
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="application-container">
      <div className="application-header">
        <img src="/LogoPaks.jpg" alt="Paks Logo" className="paks-logo" />
        <h1 className="paks-title">Paks Logistic LLC</h1>
      </div>

      <form onSubmit={handleSubmit} className="multi-step-form">
        {/* Step content rendered by nested route */}
        <Outlet />

        {/* Navigation buttons */}
        <div className="navigation">
          {currentStep === 0 && (
            <button type="button" onClick={nextStep} className="btn-primary">
              Apply Now
            </button>
          )}

          {currentStep > 0 && !isLastStep && (
            <>
              <button type="button" onClick={prevStep} className="btn-secondary">
                Back
              </button>
              <button type="button" onClick={nextStep} className="btn-primary">
                Next
              </button>
            </>
          )}

          {isLastStep && (
            <>
              <button
                type="button"
                onClick={prevStep}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Back
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="back-home"
          disabled={isSubmitting}
        >
          ← Back to Home
        </button>
      </form>
    </div>
  );
}

export default function ApplicationForm() {
  return (
    <ApplicationProvider>
      <ApplicationFormContent />
    </ApplicationProvider>
  );
}
