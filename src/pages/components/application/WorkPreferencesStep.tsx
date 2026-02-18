import { useApplicationForm } from '../../contexts/ApplicationContext';

export default function WorkPreferencesStep() {
  const { formData, updateField } = useApplicationForm();

  return (
    <div className="step active">
      <h2>Step 3 of 5: Work Preferences</h2>
      <div className="form-fields">
        <div className="form-group">
          <label>Do you have routes or regions you dislike driving through?</label>
          <input
            type="text"
            value={formData.dislike}
            onChange={e => updateField('dislike', e.target.value)}
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
                onChange={e => updateField('hos', e.target.value)}
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
                onChange={e => updateField('hos', e.target.value)}
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
                onChange={e => updateField('overnightPark', e.target.value)}
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
                onChange={e => updateField('overnightPark', e.target.value)}
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
            onChange={e => updateField('specialConsideration', e.target.value)}
            placeholder="I would like to take my pet with me..."
            required
          />
        </div>

        <div className="form-group">
          <label>What is your availability for being on the road? (We prefer 3-4+ weeks)</label>
          <input
            type="text"
            value={formData.onRoad}
            onChange={e => updateField('onRoad', e.target.value)}
            placeholder="I can be on the road for 4 weeks or more..."
            required
          />
        </div>
      </div>
    </div>
  );
}
