import { useApplicationForm } from '../../contexts/ApplicationContext';

export default function AvailabilityStep() {
  const { formData, updateField } = useApplicationForm();

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
                onChange={e => updateField('drugTest', e.target.value)}
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
                onChange={e => updateField('drugTest', e.target.value)}
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
                onChange={e => updateField('securingUnloading', e.target.value)}
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
                onChange={e => updateField('securingUnloading', e.target.value)}
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
            onChange={e => updateField('salaryExpectation', e.target.value)}
            placeholder="$1500-$2000"
            required
          />
        </div>
      </div>
    </div>
  );
}
