import { useNavigate } from 'react-router-dom';
import { useSavedStatements } from '../../contexts/SavedStatementsContext';
import { useSettings, fmtCurrency, fmtDate } from '../../contexts/SettingsContext';
import { SavedStatement } from '../../types/dashboard';
import { downloadStatementPDF } from '../../utils/pdfUtils';
import { Emoji } from '../Emoji';

export default function SalaryPage() {
  const { statements, removeStatement, clearStatements } = useSavedStatements();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const totalPaid = statements
    .reduce((sum, s) => sum + parseFloat(s.total || '0'), 0)
    .toFixed(2);

  const handleDownload = (s: SavedStatement) => {
    downloadStatementPDF(s, settings.currency, settings.distanceUnit, settings.dateFormat);
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove this statement from Salary?')) removeStatement(id);
  };

  const handleClearAll = () => {
    if (confirm('Remove all saved statements? This cannot be undone.')) clearStatements();
  };

  if (statements.length === 0) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Salary</h1>
          <p className="page-subtitle">Saved driver payment statements</p>
        </div>
        <div className="card">
          <div className="in-progress" style={{ padding: '56px 20px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <Emoji symbol="💰" size={56} />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>No Statements Saved</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              Generate a statement and press <strong>Save to Salary</strong> to see it here.
            </p>
            <button
              className="generate-btn"
              style={{ maxWidth: 260 }}
              onClick={() => navigate('/dashboard/statements')}
            >
              Go to Statements
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Salary</h1>
        <p className="page-subtitle">Saved driver payment statements</p>
      </div>

      <div className="salary-summary-row">
        <div className="card salary-summary-card">
          <div className="salary-summary-label">Total Statements</div>
          <div className="salary-summary-value">{statements.length}</div>
        </div>
        <div className="card salary-summary-card salary-summary-total">
          <div className="salary-summary-label">Total Paid Out</div>
          <div className="salary-summary-value">{fmtCurrency(totalPaid, settings.currency)}</div>
        </div>
        <div className="card salary-summary-card">
          <div className="salary-summary-label">Unique Drivers</div>
          <div className="salary-summary-value">
            {new Set(statements.map(s => s.driverId)).size}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title">Saved Statements</h2>
          <button className="salary-clear-btn" onClick={handleClearAll}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Emoji symbol="🗑️" size={14} /> Clear All
          </button>
        </div>

        <div className="salary-table-wrapper">
          <table className="salary-table">
            <thead>
              <tr>
                <th>Date</th><th>Driver</th><th>Type</th>
                <th>Subtotal</th><th>Adjustment</th><th>Total</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {statements.map(s => (
                <tr key={s.id}>
                  <td data-label="Date">{fmtDate(new Date(s.savedAt), settings.dateFormat)}</td>
                  <td data-label="Driver"><strong>{s.driverName}</strong></td>
                  <td data-label="Type">
                    <span className={`salary-badge salary-badge-${s.paymentType}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <Emoji symbol={s.paymentType === 'miles' ? '🛣️' : '📊'} size={14} />
                      {s.paymentType === 'miles' ? 'Per Mile' : 'Percent'}
                    </span>
                  </td>
                  <td data-label="Subtotal">{fmtCurrency(s.subtotal, settings.currency)}</td>
                  <td data-label="Adjustment">
                    {parseFloat(s.adjustmentAmount || '0') > 0 ? (
                      <span className={s.adjustmentType === 'bonus' ? 'salary-adj-bonus' : 'salary-adj-deduction'}>
                        {s.adjustmentType === 'bonus' ? '+' : '-'}{fmtCurrency(s.adjustment, settings.currency)}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>—</span>
                    )}
                  </td>
                  <td data-label="Total"><strong style={{ color: 'var(--accent)' }}>{fmtCurrency(s.total, settings.currency)}</strong></td>
                  <td data-label="Actions">
                    <div className="salary-row-actions">
                      <button className="salary-action-btn salary-action-pdf" title="Download PDF"
                        onClick={() => handleDownload(s)}>
                        <Emoji symbol="📄" size={16} />
                      </button>
                      <button className="salary-action-btn salary-action-delete" title="Delete"
                        onClick={() => handleDelete(s.id)}>
                        <Emoji symbol="🗑️" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
