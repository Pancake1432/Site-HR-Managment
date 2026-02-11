import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/application.css';

interface FormData {
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  zip: string;
  familyStatus: string;
  drivingExperience: string;
  previousCompany: string;
  reasonForLeaving: string;
  felonies: string;
  drivingRecord: string;
  workedReefer: string;
  dislike: string;
  hos: string;
  overnightPark: string;
  specialConsideration: string;
  onRoad: string;
  drugTest: string;
  securingUnloading: string;
  salaryExpectation: string;
  cdlFile: File | null;
  medicalCardFile: File | null;
}

function ApplicationForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
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
  });

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').substring(0, 10);
    return digits.replace(/^(\d{3})(\d{0,3})(\d{0,4})$/, (_, p1, p2, p3) => {
      let output = p1;
      if (p2) output += '-' + p2;
      if (p3) output += '-' + p3;
      return output;
    });
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === 'phone') {
      value = formatPhoneNumber(value);
    }
    setFormData({ ...formData, [field]: value });
  };

  const handleFileChange = (field: 'cdlFile' | 'medicalCardFile', file: File | null) => {
    setFormData({ ...formData, [field]: file });
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Application submitted successfully!');
    navigate('/');
  };

  return (
    <div className="application-container">
      <div className="application-header">
        <img src="/images/LogoPaks.jpg" alt="Paks Logo" className="paks-logo" />
        <h1 className="paks-title">Paks Logistic LLC</h1>
      </div>

      <form onSubmit={handleSubmit} className="multi-step-form">
        {currentStep === 0 && <InfoStep />}
        {currentStep === 1 && <PersonalInfoStep formData={formData} handleInputChange={handleInputChange} />}
        {currentStep === 2 && <DrivingExperienceStep formData={formData} handleInputChange={handleInputChange} />}
        {currentStep === 3 && <WorkPreferencesStep formData={formData} handleInputChange={handleInputChange} />}
        {currentStep === 4 && <AvailabilityStep formData={formData} handleInputChange={handleInputChange} />}
        {currentStep === 5 && <DocumentsStep formData={formData} handleFileChange={handleFileChange} />}

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
              <button type="button" onClick={prevStep} className="btn-secondary">
                Back
              </button>
              <button type="submit" className="btn-primary">
                Submit Application
              </button>
            </>
          )}
        </div>

        <button type="button" onClick={() => navigate('/')} className="back-home">
          ← Back to Home
        </button>
      </form>
    </div>
  );
}

// Step Components
function InfoStep() {
  return (
    <div className="step active">
      <div className="job-info">
        <div className="job-section">
          <h2>Minimum Hiring Requirements:</h2>
          <ul>
            <li>Minimum 1 year of CDL experience.</li>
            <li>Must have 1 moving violations or one accident and one violation in the last 3 years.</li>
            <li>Able to pass Drug Test.</li>
            <li>Experience working with Refrigerated Freight.</li>
          </ul>
        </div>

        <img src="/images/Truck.jpg" alt="Truck" className="truck-image" />

        <div className="job-section">
          <h2>We Offer:</h2>
          <ul>
            <li>Pay average $1500-$2500 Weekly</li>
            <li>Miles average 2800-3200 Weekly</li>
            <li>$0.70/mi</li>
            <li>Direct deposit every Thursday</li>
            <li>24/7 Dispatch</li>
            <li>24/7 Breakdown support</li>
            <li>Volvo VNL 2022 D13 (365,840 mi)</li>
          </ul>
        </div>

        <div className="job-section">
          <h3>Let's grow together.</h3>
          <p>
            Based in Miami FL and Gresham OR, Paks Logistic LLC is a family owned and operated Trucking Company. 
            Paks Logistic is your reliable freight company; we invest in our people, we work as a team, we always 
            make sure we perform at our highest ability and ALWAYS make sure our drivers are satisfied. We recruit 
            and hire professional drivers that know how to deliver a quality service.
          </p>
        </div>
      </div>
    </div>
  );
}

function PersonalInfoStep({ formData, handleInputChange }: any) {
  return (
    <div className="step active">
      <h2>Step 1 of 5: Personal Information</h2>
      <div className="form-fields">
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="John Smith"
            required
          />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="000-000-0000"
            maxLength={12}
            required
          />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="mail@example.com"
            required
          />
        </div>
        <div className="form-group">
          <label>Where are you living now? City, State, Zip</label>
          <div className="address-fields">
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="City"
              required
            />
            <input
              type="text"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="State"
              maxLength={2}
              required
            />
            <input
              type="text"
              value={formData.zip}
              onChange={(e) => handleInputChange('zip', e.target.value)}
              placeholder="Zip"
              maxLength={5}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label>Current Family Status</label>
          <select
            value={formData.familyStatus}
            onChange={(e) => handleInputChange('familyStatus', e.target.value)}
            required
          >
            <option value="">Select...</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function DrivingExperienceStep({ formData, handleInputChange }: any) {
  return (
    <div className="step active">
      <h2>Step 2 of 5: Driving Experience</h2>
      <div className="form-fields">
        <div className="form-group">
          <label>How many years of CDL A driving experience do you have?</label>
          <select
            value={formData.drivingExperience}
            onChange={(e) => handleInputChange('drivingExperience', e.target.value)}
            required
          >
            <option value="">Select...</option>
            <option value="1year">Less than 1 year</option>
            <option value="1-2years">1-2 years</option>
            <option value="3-5years">3-5 years</option>
            <option value="5+years">5+ years</option>
          </select>
        </div>
        <div className="form-group">
          <label>Where are you working now or where have you worked before? (Company Name)</label>
          <input
            type="text"
            value={formData.previousCompany}
            onChange={(e) => handleInputChange('previousCompany', e.target.value)}
            placeholder="Company Example LLC"
          />
        </div>
        <div className="form-group">
          <label>Why you left from the previous company?</label>
          <input
            type="text"
            value={formData.reasonForLeaving}
            onChange={(e) => handleInputChange('reasonForLeaving', e.target.value)}
            placeholder="Reason for leaving"
          />
        </div>
        <div className="form-group">
          <label>Do you have any felonies or accidents in the past?</label>
          <input
            type="text"
            value={formData.felonies}
            onChange={(e) => handleInputChange('felonies', e.target.value)}
            placeholder="Yes or No"
            required
          />
        </div>
        <div className="form-group">
          <label>Do you have a clean driving record? Any tickets or accidents in the last 3-5 years?</label>
          <input
            type="text"
            value={formData.drivingRecord}
            onChange={(e) => handleInputChange('drivingRecord', e.target.value)}
            placeholder="Yes or No"
            required
          />
        </div>
        <div className="form-group radio-group">
          <label>Have you worked with reefer units before?</label>
          <div className="radio-options">
            <label>
              <input
                type="radio"
                name="workedReefer"
                value="yes"
                checked={formData.workedReefer === 'yes'}
                onChange={(e) => handleInputChange('workedReefer', e.target.value)}
                required
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="workedReefer"
                value="no"
                checked={formData.workedReefer === 'no'}
                onChange={(e) => handleInputChange('workedReefer', e.target.value)}
              />
              No
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkPreferencesStep({ formData, handleInputChange }: any) {
  return (
    <div className="step active">
      <h2>Step 3 of 5: Work Preferences</h2>
      <div className="form-fields">
        <div className="form-group">
          <label>Do you have routes or regions you dislike driving through?</label>
          <input
            type="text"
            value={formData.dislike}
            onChange={(e) => handleInputChange('dislike', e.target.value)}
            placeholder="I would like to avoid NY island."
            required
          />
        </div>
        <div className="form-group radio-group">
          <label>Are you familiar with DOT regulations and Hours of Service (HOS) rules?</label>
          <div className="radio-options">
            <label>
              <input
                type="radio"
                name="hos"
                value="yes"
                checked={formData.hos === 'yes'}
                onChange={(e) => handleInputChange('hos', e.target.value)}
                required
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="hos"
                value="no"
                checked={formData.hos === 'no'}
                onChange={(e) => handleInputChange('hos', e.target.value)}
              />
              No
            </label>
          </div>
        </div>
        <div className="form-group radio-group">
          <label>Are you comfortable with overnight parking at different locations?</label>
          <div className="radio-options">
            <label>
              <input
                type="radio"
                name="overnightPark"
                value="yes"
                checked={formData.overnightPark === 'yes'}
                onChange={(e) => handleInputChange('overnightPark', e.target.value)}
                required
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="overnightPark"
                value="no"
                checked={formData.overnightPark === 'no'}
                onChange={(e) => handleInputChange('overnightPark', e.target.value)}
              />
              No
            </label>
          </div>
        </div>
        <div className="form-group">
          <label>Do you have any restrictions or special considerations for your work?</label>
          <input
            type="text"
            value={formData.specialConsideration}
            onChange={(e) => handleInputChange('specialConsideration', e.target.value)}
            placeholder="I would like to take my pet with me..."
            required
          />
        </div>
        <div className="form-group">
          <label>What is your availability for being on the road? (We prefer 3-4+ weeks)</label>
          <input
            type="text"
            value={formData.onRoad}
            onChange={(e) => handleInputChange('onRoad', e.target.value)}
            placeholder="I can be on the road for 4 weeks or more..."
            required
          />
        </div>
      </div>
    </div>
  );
}

function AvailabilityStep({ formData, handleInputChange }: any) {
  return (
    <div className="step active">
      <h2>Step 4 of 5: Availability and Final Steps</h2>
      <div className="form-fields">
        <div className="form-group radio-group">
          <label>Are you willing to submit to a pre-employment drug test?</label>
          <div className="radio-options">
            <label>
              <input
                type="radio"
                name="drugTest"
                value="yes"
                checked={formData.drugTest === 'yes'}
                onChange={(e) => handleInputChange('drugTest', e.target.value)}
                required
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="drugTest"
                value="no"
                checked={formData.drugTest === 'no'}
                onChange={(e) => handleInputChange('drugTest', e.target.value)}
              />
              No
            </label>
          </div>
        </div>
        <div className="form-group radio-group">
          <label>Do you have experience with load securing and unloading procedures?</label>
          <div className="radio-options">
            <label>
              <input
                type="radio"
                name="securingUnloading"
                value="yes"
                checked={formData.securingUnloading === 'yes'}
                onChange={(e) => handleInputChange('securingUnloading', e.target.value)}
                required
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="securingUnloading"
                value="no"
                checked={formData.securingUnloading === 'no'}
                onChange={(e) => handleInputChange('securingUnloading', e.target.value)}
              />
              No
            </label>
          </div>
        </div>
        <div className="form-group">
          <label>What are your salary expectations per week?</label>
          <input
            type="text"
            value={formData.salaryExpectation}
            onChange={(e) => handleInputChange('salaryExpectation', e.target.value)}
            placeholder="$1500-$2000"
            required
          />
        </div>
      </div>
    </div>
  );
}

function DocumentsStep({ formData, handleFileChange }: any) {
  return (
    <div className="step active">
      <h2>Step 5 of 5: Upload Documents</h2>
      <div className="upload-section">
        <p className="upload-note">
          If the upload option is not working, please send your CDL and medical card via email to dispatch@pakslogistic.com
        </p>
        <div className="upload-form">
          <div className="upload-block">
            <label htmlFor="cdl" className="upload-label">
              📁 Upload Your CDL
            </label>
            <input
              type="file"
              id="cdl"
              accept="image/*"
              onChange={(e) => handleFileChange('cdlFile', e.target.files?.[0] || null)}
              required
            />
            <span className="file-name">
              {formData.cdlFile ? formData.cdlFile.name : 'No file chosen'}
            </span>
          </div>
          <div className="upload-block">
            <label htmlFor="medicalCard" className="upload-label">
              📁 Upload Your Medical Card
            </label>
            <input
              type="file"
              id="medicalCard"
              accept="image/*"
              onChange={(e) => handleFileChange('medicalCardFile', e.target.files?.[0] || null)}
              required
            />
            <span className="file-name">
              {formData.medicalCardFile ? formData.medicalCardFile.name : 'No file chosen'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicationForm;
