import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApplicationProvider, useApplicationForm } from './contexts/ApplicationContext';
import { submitApplication, saveDraft, clearDraft } from './services/applicationService';

import InfoStep from './components/application/InfoStep';
import PersonalInfoStep from './components/application/PersonalInfoStep';
import DrivingExperienceStep from './components/application/DrivingExperienceStep';
import WorkPreferencesStep from './components/application/WorkPreferencesStep';
import AvailabilityStep from './components/application/AvailabilityStep';
import DocumentsStep from './components/application/DocumentsStep';

import '../styles/application.css';

function ApplicationFormContent() {
  const navigate = useNavigate();
  const { formData, resetForm } = useApplicationForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      // Auto-save draft when moving forward
      if (currentStep > 0) {
        saveDraft(formData);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await submitApplication(formData);

      if (result.success) {
        alert(`Application submitted successfully! Your application ID is: ${result.applicationId}`);
        clearDraft();
        resetForm();
        navigate('/');
      } else {
        alert(`Failed to submit application: ${result.error}`);
      }
    } catch (error) {
      alert('An error occurred while submitting your application. Please try again.');
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="application-container">
      <div className="application-header">
        <img src="/LogoPaks.jpg" alt="Paks Logo" className="paks-logo" />
        <h1 className="paks-title">Paks Logistic LLC</h1>
      </div>

      <form onSubmit={handleSubmit} className="multi-step-form">
        {/* Step rendering */}
        {currentStep === 0 && <InfoStep />}
        {currentStep === 1 && <PersonalInfoStep />}
        {currentStep === 2 && <DrivingExperienceStep />}
        {currentStep === 3 && <WorkPreferencesStep />}
        {currentStep === 4 && <AvailabilityStep />}
        {currentStep === 5 && <DocumentsStep />}

        {/* Navigation buttons */}
        <div className="navigation">
          {currentStep === 0 && (
            <button type="button" onClick={nextStep} className="btn-primary">
              Apply Now
            </button>
          )}

          {currentStep > 0 && currentStep < 5 && (
            <>
              <button type="button" onClick={prevStep} className="btn-secondary">
                Back
              </button>
              <button type="button" onClick={nextStep} className="btn-primary">
                Next
              </button>
            </>
          )}

          {currentStep === 5 && (
            <>
              <button type="button" onClick={prevStep} className="btn-secondary" disabled={isSubmitting}>
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
