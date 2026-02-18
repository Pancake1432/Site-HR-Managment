import { useApplicationForm } from '../../contexts/ApplicationContext';

export default function DrivingExperienceStep() {
  const { formData, updateField } = useApplicationForm();

  return (
    <div className="step active">
      <h2>Step 2 of 5: Driving Experience</h2>
      <div className="form-fields">
        <div className="form-group">
          <label>How many years of CDL A driving experience do you have?</label>
          <select
            value={formData.drivingExperience}
            onChange={e => updateField('drivingExperience', e.target.value)}
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
            onChange={e => updateField('previousCompany', e.target.value)}
            placeholder="Company Example LLC"
          />
        </div>

        <div className="form-group">
          <label>Why you left from the previous company?</label>
          <input
            type="text"
            value={formData.reasonForLeaving}
            onChange={e => updateField('reasonForLeaving', e.target.value)}
            placeholder="Reason for leaving"
          />
        </div>

        <div className="form-group">
          <label>Do you have any felonies or accidents in the past?</label>
          <input
            type="text"
            value={formData.felonies}
            onChange={e => updateField('felonies', e.target.value)}
            placeholder="Yes or No"
            required
          />
        </div>

        <div className="form-group">
          <label>Do you have a clean driving record? Any tickets or accidents in the last 3-5 years?</label>
          <input
            type="text"
            value={formData.drivingRecord}
            onChange={e => updateField('drivingRecord', e.target.value)}
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
                onChange={e => updateField('workedReefer', e.target.value)}
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
                onChange={e => updateField('workedReefer', e.target.value)}
              />
              No
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
