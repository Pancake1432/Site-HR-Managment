import { ApplicationFormData } from '../types/application';

/**
 * Generates the PDF file name: From-{Name}-{ID}.pdf
 */
export function generateApplicationPDFName(
  applicantName: string,
  applicationId: string
): string {
  const sanitized = applicantName.replace(/\s+/g, '-');
  return `From-${sanitized}-${applicationId}.pdf`;
}

/**
 * Creates a base64 data URL of the application for document storage.
 * This gets stored in the same format useDocumentStorage expects.
 */
export function createApplicationPDFDataUrl(
  formData: ApplicationFormData,
  applicationId: string
): string {
  const html = buildApplicationHTML(formData, applicationId);
  return `data:text/html;base64,${btoa(unescape(encodeURIComponent(html)))}`;
}

function buildApplicationHTML(
  formData: ApplicationFormData,
  applicationId: string
): string {
  const submittedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Driver Application - ${formData.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a202c; padding: 40px; }
    .doc { max-width: 720px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 3px solid #667eea; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { font-size: 28px; font-weight: 700; color: #667eea; margin-bottom: 4px; }
    .header .subtitle { font-size: 16px; color: #4a5568; font-weight: 500; }
    .header .meta { font-size: 11px; color: #a0aec0; margin-top: 8px; }
    .badge { display: inline-block; background: #667eea; color: white; padding: 3px 14px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 8px; }
    .section { margin-bottom: 24px; }
    .section h3 { font-size: 14px; font-weight: 700; color: #4a5568; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px 12px; font-size: 13px; vertical-align: top; }
    td:first-child { color: #718096; font-weight: 500; width: 40%; }
    td:last-child { color: #1a202c; }
    tr:nth-child(even) td { background: #f7fafc; }
    .documents-note { background: #ebf4ff; border: 1px solid #bee3f8; border-radius: 8px; padding: 14px 18px; margin-top: 10px; font-size: 12px; color: #2b6cb0; }
    .documents-note strong { display: block; margin-bottom: 4px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #a0aec0; }
    @media print { body { padding: 20px; } .doc { max-width: 100%; } }
  </style>
</head>
<body>
  <div class="doc">
    <div class="header">
      <h1>Paks Logistic LLC</h1>
      <div class="subtitle">New Driver Application</div>
      <div class="meta">Application ID: ${applicationId} &nbsp;|&nbsp; Submitted: ${submittedDate}</div>
      <div class="badge">Applied</div>
    </div>
    <div class="section">
      <h3>Personal Information</h3>
      <table>
        <tr><td>Full Name</td><td>${formData.name}</td></tr>
        <tr><td>Phone</td><td>${formData.phone}</td></tr>
        <tr><td>Email</td><td>${formData.email}</td></tr>
        <tr><td>City</td><td>${formData.city}</td></tr>
        <tr><td>State</td><td>${formData.state}</td></tr>
        <tr><td>ZIP Code</td><td>${formData.zip}</td></tr>
        <tr><td>Family Status</td><td>${formData.familyStatus}</td></tr>
      </table>
    </div>
    <div class="section">
      <h3>Driving Experience</h3>
      <table>
        <tr><td>Years of Experience</td><td>${formData.drivingExperience}</td></tr>
        <tr><td>Previous Company</td><td>${formData.previousCompany || 'N/A'}</td></tr>
        <tr><td>Reason for Leaving</td><td>${formData.reasonForLeaving || 'N/A'}</td></tr>
        <tr><td>Felonies</td><td>${formData.felonies}</td></tr>
        <tr><td>Driving Record</td><td>${formData.drivingRecord}</td></tr>
        <tr><td>Reefer Experience</td><td>${formData.workedReefer}</td></tr>
      </table>
    </div>
    <div class="section">
      <h3>Work Preferences</h3>
      <table>
        <tr><td>Dislikes / Restrictions</td><td>${formData.dislike || 'None'}</td></tr>
        <tr><td>Hours of Service Knowledge</td><td>${formData.hos}</td></tr>
        <tr><td>Overnight Parking</td><td>${formData.overnightPark}</td></tr>
        <tr><td>Special Considerations</td><td>${formData.specialConsideration || 'None'}</td></tr>
        <tr><td>Time on Road</td><td>${formData.onRoad}</td></tr>
      </table>
    </div>
    <div class="section">
      <h3>Availability &amp; Expectations</h3>
      <table>
        <tr><td>Drug Test</td><td>${formData.drugTest}</td></tr>
        <tr><td>Securing / Unloading</td><td>${formData.securingUnloading}</td></tr>
        <tr><td>Salary Expectation</td><td>${formData.salaryExpectation}</td></tr>
      </table>
    </div>
    <div class="section">
      <h3>Uploaded Documents</h3>
      <div class="documents-note">
        <strong>Attached Files:</strong>
        ${formData.cdlFile ? 'CDL: ' + formData.cdlFile.name : 'CDL: Not provided'}<br />
        ${formData.medicalCardFile ? 'Medical Card: ' + formData.medicalCardFile.name : 'Medical Card: Not provided'}
      </div>
    </div>
    <div class="footer">Paks Logistic LLC &mdash; Driver Application &mdash; Generated ${submittedDate}</div>
  </div>
</body>
</html>`;
}
