import { useState, useMemo, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Driver, EmploymentStatus } from '../../types/dashboard';
import { useCompanyData } from '../../hooks/useCompanyData';
import { useDriverDocStorage } from '../../hooks/useDriverDocStorage';
import { useSavedStatements } from '../../contexts/SavedStatementsContext';
import { useSettings, fmtDate, fmtCurrency, fmtPerDist } from '../../contexts/SettingsContext';

export default function EmployeesPage() {
  const { companyDrivers, refresh } = useCompanyData();
  const { getDriverDocs, openDoc }       = useDriverDocStorage();
  const { statements }                   = useSavedStatements();

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected]       = useState<Driver | null>(null);
  const [empDocs, setEmpDocs]          = useState<import('../../hooks/useDriverDocStorage').DriverDocSet>({ cdl: null, medicalCard: null, applicationPdf: null, workingContract: null });

  useEffect(() => {
    if (!selected) return;
    getDriverDocs(selected.id).then(setEmpDocs);
  }, [selected, getDriverDocs]);

  // Apply locally-saved overrides (status, employment status, etc.)
  const employees = useMemo(() => companyDrivers, [companyDrivers]);

  useEffect(() => {
    if (id) {
      const emp = employees.find(e => e.id === Number(id));
      setSelected(emp ?? null);
    } else {
      setSelected(null);
    }
  }, [id, employees]);

  const filtered = useMemo(() => employees.filter(e => {
    const q = searchQuery.toLowerCase();
    return e.firstName.toLowerCase().includes(q)
      || e.lastName.toLowerCase().includes(q)
      || e.name.toLowerCase().includes(q);
  }), [searchQuery, employees]);

  const workingCount = employees.filter(e => e.employmentStatus === 'Working').length;
  const firedCount   = employees.filter(e => e.employmentStatus === 'Fired').length;

  const toggleEmploymentStatus = async (emp: Driver) => {
    const next: EmploymentStatus = emp.employmentStatus === 'Working' ? 'Fired' : 'Working';
    try {
      const base = import.meta.env.VITE_API_URL ?? 'https://localhost:7001';
      const token = localStorage.getItem('hr_access_token') ?? '';
      await axios.put(`${base}/api/drivers/${emp.id}`, { employmentStatus: next }, { headers: { Authorization: `Bearer ${token}` } });
      refresh();
    } catch { /* ignore */ }
    if (selected?.id === emp.id) {
      setSelected(prev => prev ? { ...prev, employmentStatus: next } : prev);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Employees</h1>
        <p className="page-subtitle">Manage all company employees</p>
        <div className="stats-row">
          <div className="stat-item"><div className="stat-value">{employees.length}</div><div className="stat-label">Total</div></div>
          <div className="stat-item"><div className="stat-value">{workingCount}</div><div className="stat-label">Working</div></div>
          <div className="stat-item"><div className="stat-value">{firedCount}</div><div className="stat-label">Fired</div></div>
        </div>
      </div>

      <div className="card">
        <div className="search-bar">
          <span>🔍</span>
          <input type="text" placeholder="Search by name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="table-header employees-cols">
          <span>Name</span><span>Position</span><span>Payment Type</span><span>Employment Status</span><span>Action</span>
        </div>
        <div className="table-body">
          {filtered.length > 0 ? filtered.map(e => (
            <div key={e.id} className="table-row employees-cols">
              <span className="cell-name"><span className="row-avatar">👤</span>{e.name || `${e.firstName} ${e.lastName}`.trim() || "—"}</span>
              <span className="cell" data-label="Position">{e.position}</span>
              <span className="cell" data-label="Payment Type">
                <span className={`payment-badge ${e.paymentType === 'miles' ? 'miles' : 'percent'}`}>
                  {e.paymentType === 'miles' ? `📏 ${fmtPerDist(settings.distanceUnit)}` : '📊 Percentage'}
                </span>
              </span>
              <span className="cell" data-label="Employment Status">
                <button
                  className={`employment-badge ${e.employmentStatus?.toLowerCase()}`}
                  style={{ cursor: 'pointer', border: 'none', background: 'none' }}
                  title="Click to toggle status"
                  onClick={() => toggleEmploymentStatus(e)}
                >
                  {e.employmentStatus}
                </button>
              </span>
              <span className="cell" data-label="Action">
                <button className="details-btn" onClick={() => navigate(`/dashboard/employees/${e.id}`)}>View Full Details</button>
              </span>
            </div>
          )) : <div className="no-results">No employees found</div>}
        </div>
      </div>

      {/* ── Employee detail modal ── */}
      {selected && (() => {
        const docs = empDocs;
        const docList = [
          docs.cdl             && { ...docs.cdl,             label: 'CDL Certificate'  },
          docs.medicalCard     && { ...docs.medicalCard,     label: 'Medical Card'     },
          docs.workingContract && { ...docs.workingContract, label: 'Working Contract' },
        ].filter(Boolean) as (typeof docs.cdl & { label: string })[];

        // Statements saved from the Statements page for this driver
        const employeeStatements = statements.filter(s => s.driverId === selected.id);

        return (
          <div className="modal-overlay" onClick={() => navigate('/dashboard/employees')}>
            <div className="modal-content modal-xl" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selected.name || `${selected.firstName} ${selected.lastName}`.trim() || "—"} — Full Details</h2>
                <button className="close-btn" onClick={() => navigate('/dashboard/employees')}>✕</button>
              </div>
              <div className="modal-body">

                {/* Info */}
                <div className="employee-info-section">
                  <h3>Employee Information</h3>
                  <div className="info-grid">
                    <div className="info-item"><strong>Name</strong><span>{selected.name || `${selected.firstName} ${selected.lastName}`.trim() || "—"}</span></div>
                    <div className="info-item"><strong>Position</strong><span>{selected.position}</span></div>
                    <div className="info-item"><strong>Equipment</strong><span>{selected.equipment}</span></div>
                    <div className="info-item"><strong>Payment Type</strong><span>{selected.paymentType === 'miles' ? fmtPerDist(settings.distanceUnit) : 'Percentage'}</span></div>
                    <div className="info-item">
                      <strong>Employment Status</strong>
                      <button
                        className={`employment-badge ${selected.employmentStatus?.toLowerCase()}`}
                        style={{ cursor: 'pointer', border: 'none', background: 'none' }}
                        title="Click to toggle"
                        onClick={() => toggleEmploymentStatus(selected)}
                      >
                        {selected.employmentStatus}
                      </button>
                    </div>
                    <div className="info-item"><strong>Join Date</strong><span>{fmtDate(selected.date, settings.dateFormat)}</span></div>
                  </div>
                </div>

                {/* Documents — pulled from useDriverDocStorage */}
                <div className="employee-info-section">
                  <h3>Documents ({docList.length})</h3>
                  {docList.length > 0 ? (
                    <div className="modal-documents-list">
                      {docList.map(doc => doc && (
                        <div key={doc.id} className="modal-document-item">
                          <div className="document-icon-small">📄</div>
                          <div className="document-info-small">
                            <strong>{doc.label}</strong>
                            <span>{doc.name} · {doc.size} · {doc.uploadDate}</span>
                          </div>
                          <button className="doc-action-btn open" onClick={() => openDoc(selected.id, doc)}>Open</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                      No documents uploaded yet. Upload them from the Drivers page.
                    </p>
                  )}
                </div>

                {/* Statements — pulled from SavedStatementsContext */}
                <div className="employee-info-section">
                  <h3>Statements ({employeeStatements.length})</h3>
                  {employeeStatements.length > 0 ? (
                    <div className="modal-statements-list">
                      {employeeStatements.map(s => (
                        <div key={s.id} className="modal-statement-item">
                          <div className="statement-icon-small">📋</div>
                          <div className="statement-info-small">
                            <strong>{fmtDate(new Date(s.savedAt), settings.dateFormat)}</strong>
                            <span>
                              {s.paymentType === 'miles' ? fmtPerDist(settings.distanceUnit) : 'Percentage'}
                              {' '}— Total: {fmtCurrency(Number(s.total), settings.currency)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                      No statements saved yet. Generate one from the Statements page.
                    </p>
                  )}
                </div>

              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
