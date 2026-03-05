import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatementData, SavedStatement, PaymentType } from '../../types/dashboard';
import { useCompanyData } from '../../hooks/useCompanyData';
import { useSettings, fmtDate, fmtCurrency, fmtDistUnit, CURRENCY_SYMBOLS } from '../../contexts/SettingsContext';
import { useSavedStatements } from '../../contexts/SavedStatementsContext';
import { downloadStatementPDF } from '../../utils/pdfUtils';
import { Emoji } from '../Emoji';

const emptyForm: StatementData = {
  driverId: null, driverName: '',
  paymentType: 'miles',
  miles: '', ratePerMile: '',
  percent: '', grossAmount: '',
  adjustmentType: 'bonus',
  adjustmentAmount: '', adjustmentReason: '',
};

export default function StatementsPage() {
  const { settings } = useSettings();
  const { addStatement } = useSavedStatements();
  const { companyDrivers: companyDriversData, companyName } = useCompanyData();
  const navigate = useNavigate();
  const [form, setForm] = useState<StatementData>(emptyForm);
  const [showPreview, setShowPreview] = useState(false);

  const sym      = CURRENCY_SYMBOLS[settings.currency];
  const distUnit = fmtDistUnit(settings.distanceUnit);

  const set = (partial: Partial<StatementData>) => setForm(f => ({ ...f, ...partial }));

  const calc = () => {
    const sub = form.paymentType === 'miles'
      ? parseFloat(form.miles || '0') * parseFloat(form.ratePerMile || '0')
      : parseFloat(form.grossAmount || '0') * (parseFloat(form.percent || '0') / 100);
    const adj = parseFloat(form.adjustmentAmount || '0');
    return {
      sub:   sub.toFixed(2),
      adj:   adj.toFixed(2),
      total: (form.adjustmentType === 'bonus' ? sub + adj : sub - adj).toFixed(2),
    };
  };

  const handleGenerate = () => {
    if (!form.driverName) return alert('Please select a driver');
    if (form.paymentType === 'miles' && (!form.miles || !form.ratePerMile))
      return alert(`Please enter ${distUnit} driven and rate per ${distUnit}`);
    if (form.paymentType === 'percent' && (!form.percent || !form.grossAmount))
      return alert('Please enter percentage and gross amount');
    setShowPreview(true);
  };

  const buildSavedStatement = (): SavedStatement => {
    const totals = calc();
    return {
      id: `stmt-${Date.now()}`,
      savedAt: new Date().toISOString(),
      driverId: form.driverId,
      driverName: form.driverName,
      paymentType: form.paymentType as PaymentType,
      miles: form.miles,
      ratePerMile: form.ratePerMile,
      percent: form.percent,
      grossAmount: form.grossAmount,
      adjustmentType: form.adjustmentType,
      adjustmentAmount: form.adjustmentAmount,
      adjustmentReason: form.adjustmentReason,
      subtotal: totals.sub,
      adjustment: totals.adj,
      total: totals.total,
    };
  };

  // ── Action handlers ───────────────────────────────────────────────────────

  const handleSaveToSalary = () => {
    addStatement(buildSavedStatement());
    setShowPreview(false);
    navigate('/dashboard/salary');
  };

  const handleDownloadPDF = () => {
    downloadStatementPDF(buildSavedStatement(), settings.currency, settings.distanceUnit, settings.dateFormat, companyName);
    setShowPreview(false);
  };

  const handleClose = () => setShowPreview(false);

  const totals = calc();

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Statements</h1>
        <p className="page-subtitle">Generate driver payment statements</p>
      </div>
      <center>
        <div className="card statement-form-card">
          <div className="card-header"><h2 className="card-title">Create Statement</h2></div>
          <div className="form-grid">

            {/* Driver select */}
            <div className="form-group full-width">
              <label>Select Driver</label>
              <select value={form.driverId ?? ''}
                onChange={e => {
                  const d = companyDriversData.find(d => d.id === parseInt(e.target.value));
                  set({ driverId: d?.id ?? null, driverName: d?.name ?? '' });
                }}>
                <option value="">Choose a driver...</option>
                {companyDriversData.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            {/* Payment type */}
            <div className="form-group full-width">
              <label>Payment Type</label>
              <div className="custom-radio-group">
                {(['miles', 'percent'] as PaymentType[]).map(v => (
                  <label key={v} className={`custom-radio ${form.paymentType === v ? 'active' : ''}`}>
                    <input type="radio" name="paymentType" value={v} checked={form.paymentType === v}
                      onChange={() => set({ paymentType: v })} />
                    <span className="radio-icon"><Emoji symbol={v === 'miles' ? '🛣️' : '📊'} size={16} /></span>
                    <span>{v === 'miles' ? distUnit.toUpperCase() : 'Percentage'}</span>
                  </label>
                ))}
              </div>
            </div>

            {form.paymentType === 'miles' ? <>
              <div className="form-group">
                <label>{distUnit.charAt(0).toUpperCase() + distUnit.slice(1)} Driven</label>
                <input
                  type="number"
                  placeholder={`Enter ${distUnit}`}
                  value={form.miles}
                  onChange={e => set({ miles: e.target.value })}
                  onWheel={e => e.currentTarget.blur()}
                />
              </div>

              <div className="form-group">
                <label>Rate per {distUnit} ({sym})</label>
                <input
                  type="number"
                  placeholder="Enter rate"
                  value={form.ratePerMile}
                  onChange={e => set({ ratePerMile: e.target.value })}
                  onWheel={e => e.currentTarget.blur()}
                />
              </div>
            </> : <>
              <div className="form-group">
                <label>Percentage (%)</label>
                <input
                  type="number"
                  placeholder="Enter percentage"
                  value={form.percent}
                  onChange={e => set({ percent: e.target.value })}
                  onWheel={e => e.currentTarget.blur()}
                />
              </div>

              <div className="form-group">
                <label>Gross Amount ({sym})</label>
                <input
                  type="number"
                  placeholder="Enter gross"
                  value={form.grossAmount}
                  onChange={(e) => set({ grossAmount: e.target.value })}
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>
            </>}

            {/* Adjustment type */}
            <div className="form-group full-width">
              <label>Adjustment Type</label>
              <div className="custom-radio-group">
                {(['bonus', 'deduction'] as const).map(v => (
                  <label
                    key={v}
                    className={`custom-radio ${form.adjustmentType === v ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="adjType"
                      value={v}
                      checked={form.adjustmentType === v}
                      onChange={() => set({ adjustmentType: v })}
                    />
                    <span className="radio-icon"><Emoji symbol={v === 'bonus' ? '➕' : '➖'} size={16} /></span>
                    <span>{v.charAt(0).toUpperCase() + v.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Adjustment Amount ({sym})</label>
              <input
                type="number"
                placeholder="Enter amount"
                value={form.adjustmentAmount}
                onChange={e => set({ adjustmentAmount: e.target.value })}
                onWheel={e => e.currentTarget.blur()}
              />
            </div>

            <div className="form-group">
              <label>Adjustment Reason</label>
              <input
                type="text"
                placeholder="Enter reason"
                value={form.adjustmentReason}
                onChange={e => set({ adjustmentReason: e.target.value })}
              />
            </div>
          </div>
          <button className="generate-btn" onClick={handleGenerate}>Generate Statement</button>
        </div>
      </center>

      {showPreview && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Statement Preview</h2>
              <button className="close-btn" onClick={handleClose}>✕</button>
            </div>
            <div className="modal-body">
              <div className="statement-document">
                <div className="statement-header">
                  <h1>Payment Statement</h1>
                  <p>Date: {fmtDate(new Date(), settings.dateFormat)}</p>
                </div>
                <div className="statement-section">
                  <h3>Driver Information</h3>
                  <p><strong>Name:</strong> {form.driverName}</p>
                </div>
                <div className="statement-section">
                  <h3>Payment Details</h3>
                  {form.paymentType === 'miles' ? <>
                    <p><strong>Payment Type:</strong> Per {distUnit}</p>
                    <p><strong>{distUnit.charAt(0).toUpperCase() + distUnit.slice(1)} Driven:</strong> {form.miles} {distUnit}</p>
                    <p><strong>Rate per {distUnit}:</strong> {fmtCurrency(form.ratePerMile || '0', settings.currency)}</p>
                  </> : <>
                    <p><strong>Payment Type:</strong> Percentage</p>
                    <p><strong>Percentage:</strong> {form.percent}%</p>
                    <p><strong>Gross Amount:</strong> {fmtCurrency(form.grossAmount || '0', settings.currency)}</p>
                  </>}
                  <p><strong>Subtotal:</strong> {fmtCurrency(totals.sub, settings.currency)}</p>
                </div>
                {parseFloat(form.adjustmentAmount || '0') > 0 && (
                  <div className="statement-section">
                    <h3>Adjustments</h3>
                    <p><strong>Type:</strong> {form.adjustmentType === 'bonus' ? 'Bonus' : 'Deduction'}</p>
                    <p><strong>Amount:</strong> {form.adjustmentType === 'bonus' ? '+' : '-'}{fmtCurrency(totals.adj, settings.currency)}</p>
                    {form.adjustmentReason && <p><strong>Reason:</strong> {form.adjustmentReason}</p>}
                  </div>
                )}
                <div className="statement-section statement-total">
                  <h3>Total Payment</h3>
                  <p className="total-amount">{fmtCurrency(totals.total, settings.currency)}</p>
                </div>
                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#a0aec0' }}>
                  {companyName}
                </div>
              </div>

              {/* ── 3-button action bar ── */}
              <div className="statement-actions">
                <button className="save-salary-btn" onClick={handleSaveToSalary}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Emoji symbol="💾" size={16} /> Save to Salary
                </button>
                <button className="download-btn" onClick={handleDownloadPDF}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Emoji symbol="📄" size={16} /> Download PDF
                </button>
                <button className="close-preview-btn" onClick={handleClose}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
