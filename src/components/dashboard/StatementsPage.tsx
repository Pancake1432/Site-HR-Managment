import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatementData, SavedStatement, PaymentType } from '../../types/dashboard';
import { useCompanyData } from '../../hooks/useCompanyData';
import { useLocalOverrides } from '../../hooks/useLocalOverrides';
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
  const { applyOverrides } = useLocalOverrides();
  const navigate = useNavigate();
  const [form, setForm] = useState<StatementData>(emptyForm);
  const [showPreview, setShowPreview] = useState(false);
  const [driverSearch, setDriverSearch] = useState('');
  const [showDriverList, setShowDriverList] = useState(false);

  // Apply local overrides (paymentType, status, etc.) on top of base driver data
  const drivers = applyOverrides(companyDriversData);

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

            {/* Driver autocomplete */}
            <div className="form-group full-width" style={{ position: 'relative' }}>
              <label>Select Driver</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 15, color: 'var(--text-secondary)', pointerEvents: 'none', zIndex: 1,
                }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search and select a driver…"
                  value={driverSearch || form.driverName}
                  onFocus={() => { setDriverSearch(form.driverName || ''); setShowDriverList(true); }}
                  onChange={e => { setDriverSearch(e.target.value); setShowDriverList(true); set({ driverId: null, driverName: '' }); }}
                  onBlur={() => setTimeout(() => setShowDriverList(false), 150)}
                  style={{
                    width: '100%', padding: '11px 40px 11px 38px',
                    borderRadius: 8, border: '1px solid var(--border)',
                    background: 'var(--input-bg, #fff)', color: 'var(--text-primary)',
                    fontSize: 14, boxSizing: 'border-box', outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocusCapture={e => (e.currentTarget.style.borderColor = 'var(--accent, #667eea)')}
                  onBlurCapture={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                />
                {(driverSearch || form.driverName) && (
                  <button
                    onMouseDown={e => { e.preventDefault(); setDriverSearch(''); setShowDriverList(false); set({ driverId: null, driverName: '' }); }}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      border: 'none', background: 'none', cursor: 'pointer',
                      color: 'var(--text-secondary)', fontSize: 16, padding: 4, lineHeight: 1,
                    }}
                  >✕</button>
                )}
              </div>

              {/* Dropdown list */}
              {showDriverList && (() => {
                const filtered = drivers.filter(d =>
                  !driverSearch || d.name.toLowerCase().includes(driverSearch.toLowerCase())
                );
                return (
                  <div className="driver-dropdown-list" style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    zIndex: 100, maxHeight: 260, overflowY: 'auto',
                  }}>
                    {filtered.length === 0 ? (
                      <div style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center' }}>
                        No drivers found
                      </div>
                    ) : filtered.map(d => (
                      <div
                        key={d.id}
                        onMouseDown={() => {
                          set({ driverId: d.id, driverName: d.name, paymentType: d.paymentType ?? 'miles' });
                          setDriverSearch('');
                          setShowDriverList(false);
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 16px', cursor: 'pointer',
                          borderBottom: '1px solid var(--border)',
                          transition: 'background 0.12s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, color: '#fff', fontWeight: 700, flexShrink: 0,
                          }}>
                            {d.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{d.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d.position}</div>
                          </div>
                        </div>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
                          background: d.paymentType === 'miles' ? 'rgba(49,130,206,0.1)' : 'rgba(128,90,213,0.1)',
                          color: d.paymentType === 'miles' ? '#3182ce' : '#805ad5',
                        }}>
                          {d.paymentType === 'miles' ? '🛣️ Per Mile' : '📊 Percent'}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
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

            {/* ── Adjustment — works for both Per Mile AND Percent drivers ── */}
            <div className="form-group full-width" style={{
              borderTop: '1px solid var(--border)',
              paddingTop: 16,
              marginTop: 4,
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Emoji symbol="⚙️" size={15} />
                Adjustment
              </label>
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
                placeholder="0.00 (leave blank to skip)"
                value={form.adjustmentAmount}
                onChange={e => set({ adjustmentAmount: e.target.value })}
                onWheel={e => e.currentTarget.blur()}
              />
            </div>

            <div className="form-group">
              <label>Adjustment Reason</label>
              <input
                type="text"
                placeholder="e.g. Performance bonus, fuel deduction…"
                value={form.adjustmentReason}
                onChange={e => set({ adjustmentReason: e.target.value })}
              />
            </div>

            {/* Live adjustment preview — visible for BOTH payment types */}
            {parseFloat(form.adjustmentAmount || '0') > 0 && (
              <div className="form-group full-width">
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 16px', borderRadius: 10,
                  background: form.adjustmentType === 'bonus'
                    ? 'rgba(56,161,105,0.08)' : 'rgba(229,62,62,0.08)',
                  border: `1px solid ${form.adjustmentType === 'bonus' ? 'rgba(56,161,105,0.3)' : 'rgba(229,62,62,0.3)'}`,
                }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {form.adjustmentType === 'bonus' ? '➕ Bonus' : '➖ Deduction'}
                    {form.adjustmentReason ? ` — ${form.adjustmentReason}` : ''}
                  </span>
                  <span style={{
                    fontSize: 14, fontWeight: 700,
                    color: form.adjustmentType === 'bonus' ? '#38a169' : '#e53e3e',
                  }}>
                    {form.adjustmentType === 'bonus' ? '+' : '-'}{sym}{parseFloat(form.adjustmentAmount || '0').toFixed(2)}
                  </span>
                </div>
              </div>
            )}
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
