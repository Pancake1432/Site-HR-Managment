import { useApplicationForm } from '../../contexts/ApplicationContext';

export default function DocumentsStep() {
  const { formData, updateField } = useApplicationForm();

  const handleFileChange = (field: 'cdlFile' | 'medicalCardFile', file: File | null) => {
    updateField(field, file);
  };

  return (
    <div className="step active">
      <h2>Step 5 of 5: Upload Documents (Optional)</h2>
      <div className="upload-section">
        <p className="upload-note">
          You can upload your CDL and Medical Card now, or send them later via email to dispatch@pakslogistic.com
        </p>
        <div className="upload-form">
          <div className="upload-block">
            <label htmlFor="cdl" className="upload-label">
              📁 Upload Your CDL (Optional)
            </label>
            <input
              type="file"
              id="cdl"
              accept="image/*,.pdf"
              onChange={e => handleFileChange('cdlFile', e.target.files?.[0] || null)}
            />
            <span className="file-name">
              {formData.cdlFile ? formData.cdlFile.name : 'No file chosen'}
            </span>
          </div>

          <div className="upload-block">
            <label htmlFor="medicalCard" className="upload-label">
              📁 Upload Your Medical Card (Optional)
            </label>
            <input
              type="file"
              id="medicalCard"
              accept="image/*,.pdf"
              onChange={e => handleFileChange('medicalCardFile', e.target.files?.[0] || null)}
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
