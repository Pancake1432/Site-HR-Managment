import { useState } from 'react';
import { useApplicationForm } from '../../contexts/ApplicationContext';

function validateEmail(email: string): string {
  if (!email) return 'Email is required';
  if (!email.includes('@')) return 'Email must contain @';
  const parts = email.split('@');
  if (!parts[1] || !parts[1].includes('.')) return 'Email must contain a domain like .com';
  if (parts[1].startsWith('.') || parts[1].endsWith('.')) return 'Invalid domain format';
  return '';
}

function validatePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return 'Phone number is required';
  if (digits.length < 10) return 'Phone number must be 10 digits';
  return '';
}

function validateZip(zip: string): string {
  if (!zip) return 'ZIP code is required';
  if (!/^\d{5}$/.test(zip)) return 'ZIP code must be 5 digits';
  return '';
}

export default function PersonalInfoStep() {
  const { formData, updateField } = useApplicationForm();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').substring(0, 10);
    return digits.replace(/^(\d{3})(\d{0,3})(\d{0,4})$/, (_, p1, p2, p3) => {
      let output = p1;
      if (p2) output += '-' + p2;
      if (p3) output += '-' + p3;
      return output;
    });
  };

  const touch = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

  const emailError  = touched.email  ? validateEmail(formData.email)   : '';
  const phoneError  = touched.phone  ? validatePhone(formData.phone)   : '';
  const zipError    = touched.zip    ? validateZip(formData.zip)       : '';
  const nameError   = touched.name   && !formData.name.trim()  ? 'Full name is required'  : '';
  const cityError   = touched.city   && !formData.city.trim()  ? 'City is required'        : '';
  const stateError  = touched.state  && !formData.state.trim() ? 'State is required'       : '';
  const familyError = touched.family && !formData.familyStatus  ? 'Please select a status' : '';

  return (
    <div className="step active">
      <h2>Step 1 of 5: Personal Information</h2>
      <div className="form-fields">

        {/* Full Name */}
        <div className="form-group">
          <label>Full Name <span style={{ color: 'var(--error, #ef4444)' }}>*</span></label>
          <input
            type="text"
            value={formData.name}
            onChange={e => updateField('name', e.target.value)}
            onBlur={() => touch('name')}
            placeholder="John Smith"
            style={nameError ? { borderColor: '#ef4444' } : {}}
          />
          {nameError && <span style={{ color: '#ef4444', fontSize: 12 }}>{nameError}</span>}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label>Phone Number <span style={{ color: '#ef4444' }}>*</span></label>
          <input
            type="tel"
            value={formData.phone}
            onChange={e => updateField('phone', formatPhoneNumber(e.target.value))}
            onBlur={() => touch('phone')}
            placeholder="000-000-0000"
            maxLength={12}
            style={phoneError ? { borderColor: '#ef4444' } : {}}
          />
          {phoneError && <span style={{ color: '#ef4444', fontSize: 12 }}>{phoneError}</span>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
          <input
            type="text"
            value={formData.email}
            onChange={e => updateField('email', e.target.value)}
            onBlur={() => touch('email')}
            placeholder="mail@example.com"
            style={emailError ? { borderColor: '#ef4444' } : {}}
          />
          {emailError && <span style={{ color: '#ef4444', fontSize: 12 }}>{emailError}</span>}
        </div>

        {/* City / State / Zip */}
        <div className="form-group">
          <label>Where are you living now? City, State, Zip <span style={{ color: '#ef4444' }}>*</span></label>
          <div className="address-fields">
            <div>
              <input
                type="text"
                value={formData.city}
                onChange={e => updateField('city', e.target.value)}
                onBlur={() => touch('city')}
                placeholder="City"
                style={cityError ? { borderColor: '#ef4444' } : {}}
              />
              {cityError && <span style={{ color: '#ef4444', fontSize: 12 }}>{cityError}</span>}
            </div>
            <div>
              <input
                type="text"
                value={formData.state}
                onChange={e => updateField('state', e.target.value.toUpperCase())}
                onBlur={() => touch('state')}
                placeholder="ST"
                maxLength={2}
                style={stateError ? { borderColor: '#ef4444' } : {}}
              />
              {stateError && <span style={{ color: '#ef4444', fontSize: 12 }}>{stateError}</span>}
            </div>
            <div>
              <input
                type="text"
                value={formData.zip}
                onChange={e => updateField('zip', e.target.value.replace(/\D/g, '').substring(0, 5))}
                onBlur={() => touch('zip')}
                placeholder="00000"
                maxLength={5}
                style={zipError ? { borderColor: '#ef4444' } : {}}
              />
              {zipError && <span style={{ color: '#ef4444', fontSize: 12 }}>{zipError}</span>}
            </div>
          </div>
        </div>

        {/* Family Status */}
        <div className="form-group">
          <label>Current Family Status <span style={{ color: '#ef4444' }}>*</span></label>
          <select
            value={formData.familyStatus}
            onChange={e => updateField('familyStatus', e.target.value)}
            onBlur={() => touch('family')}
            style={familyError ? { borderColor: '#ef4444' } : {}}
          >
            <option value="">Select...</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
          {familyError && <span style={{ color: '#ef4444', fontSize: 12 }}>{familyError}</span>}
        </div>

      </div>
    </div>
  );
}
