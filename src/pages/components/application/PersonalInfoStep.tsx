import { useApplicationForm } from '../../contexts/ApplicationContext';

export default function PersonalInfoStep() {
  const { formData, updateField } = useApplicationForm();

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').substring(0, 10);
    return digits.replace(/^(\d{3})(\d{0,3})(\d{0,4})$/, (_, p1, p2, p3) => {
      let output = p1;
      if (p2) output += '-' + p2;
      if (p3) output += '-' + p3;
      return output;
    });
  };

  const handlePhoneChange = (value: string) => {
    updateField('phone', formatPhoneNumber(value));
  };

  return (
    <div className="step active">
      <h2>Step 1 of 5: Personal Information</h2>
      <div className="form-fields">
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => updateField('name', e.target.value)}
            placeholder="John Smith"
            required
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={e => handlePhoneChange(e.target.value)}
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
            onChange={e => updateField('email', e.target.value)}
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
              onChange={e => updateField('city', e.target.value)}
              placeholder="City"
              required
            />
            <input
              type="text"
              value={formData.state}
              onChange={e => updateField('state', e.target.value)}
              placeholder="State"
              maxLength={2}
              required
            />
            <input
              type="text"
              value={formData.zip}
              onChange={e => updateField('zip', e.target.value)}
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
            onChange={e => updateField('familyStatus', e.target.value)}
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
