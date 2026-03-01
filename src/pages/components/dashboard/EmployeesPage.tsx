import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Driver } from '../../types/dashboard';
import { defaultDocuments } from '../../data/driversData';
import { useCompanyData } from '../../hooks/useCompanyData';
import { useSettings, fmtDate, fmtCurrency, fmtPerDist } from '../../contexts/SettingsContext';

export default function EmployeesPage() {
  const { companyDrivers: companyDriversData } = useCompanyData();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<Driver | null>(null);

  const employees = useMemo(() => companyDriversData.map(d => ({
    ...d,
    documents: defaultDocuments.map(doc => ({ ...doc })),
    statements: [
      { id: 1, date: '01/01/2024', amount: '4250', type: d.paymentType === 'miles' ? 'miles' : 'percent' },
      { id: 2, date: '01/15/2024', amount: '4100', type: d.paymentType === 'miles' ? 'miles' : 'percent' },
      { id: 3, date: '02/01/2024', amount: '4500', type: d.paymentType === 'miles' ? 'miles' : 'percent' },
    ],
  })), []);

  // Sync modal with URL param :id
  useEffect(() => {
    if (id) {
      const numId = Number(id);
      const emp = employees.find(e => e.id === numId);
      setSelected(emp ?? null);
    } else {
      setSelected(null);
    }
  }, [id, employees]);

  const filtered = useMemo(() => employees.filter(e => {
    const q = searchQuery.toLowerCase();
    return e.firstName.toLowerCase().includes(q) || e.lastName.toLowerCase().includes(q) || e.name.toLowerCase().includes(q);
  }), [searchQuery, employees]);

  const workingCount = employees.filter(e => e.employmentStatus === 'Working').length;
  const firedCount   = employees.filter(e => e.employmentStatus === 'Fired').length;

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
              <span className="cell-name"><span className="row-avatar">👤</span>{e.name}</span>
              <span className="cell" data-label="Position">{e.position}</span>
              <span className="cell" data-label="Payment Type">
                <span className={`payment-badge ${e.paymentType === 'miles' ? 'miles' : 'percent'}`}>
                  {e.paymentType === 'miles' ? `📏 ${fmtPerDist(settings.distanceUnit)}` : '📊 Percentage'}
                </span>
              </span>
              <span className="cell" data-label="Employment Status">
                <span className={`employment-badge ${e.employmentStatus?.toLowerCase()}`}>{e.employmentStatus}</span>
              </span>
              <span className="cell" data-label="Action">
                <button className="details-btn" onClick={() => navigate(`/dashboard/employees/${e.id}`)}>View Full Details</button>
              </span>
            </div>
          )) : <div className="no-results">No employees found</div>}
        </div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => navigate('/dashboard/employees')}>
          <div className="modal-content modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selected.name} — Full Details</h2>
              <button className="close-btn" onClick={() => navigate('/dashboard/employees')}>✕</button>
            </div>
            <div className="modal-body">
              <div className="employee-info-section">
                <h3>Employee Information</h3>
                <div className="info-grid">
                  <div className="info-item"><strong>Name</strong><span>{selected.name}</span></div>
                  <div className="info-item"><strong>Position</strong><span>{selected.position}</span></div>
                  <div className="info-item"><strong>Equipment</strong><span>{selected.equipment}</span></div>
                  <div className="info-item"><strong>Payment Type</strong><span>{selected.paymentType === 'miles' ? fmtPerDist(settings.distanceUnit) : 'Percentage'}</span></div>
                  <div className="info-item">
                    <strong>Employment Status</strong>
                    <span className={`employment-badge ${selected.employmentStatus?.toLowerCase()}`}>{selected.employmentStatus}</span>
                  </div>
                  <div className="info-item"><strong>Join Date</strong><span>{fmtDate(selected.date, settings.dateFormat)}</span></div>
                </div>
              </div>

              <div className="employee-info-section">
                <h3>Documents ({selected.documents?.length ?? 0})</h3>
                <div className="modal-documents-list">
                  {(selected.documents ?? []).map(doc => (
                    <div key={doc.id} className="modal-document-item">
                      <div className="document-icon-small">📄</div>
                      <div className="document-info-small">
                        <strong>{doc.name}</strong>
                        <span>{doc.type} · {doc.size} · {fmtDate(doc.uploadDate, settings.dateFormat)}</span>
                      </div>
                      <button className="doc-action-btn open">Open</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="employee-info-section">
                <h3>Statements ({selected.statements?.length ?? 0})</h3>
                <div className="modal-statements-list">
                  {(selected.statements ?? []).map(s => (
                    <div key={s.id} className="modal-statement-item">
                      <div className="statement-icon-small">📋</div>
                      <div className="statement-info-small">
                        <strong>{fmtDate(s.date, settings.dateFormat)}</strong>
                        <span>
                          {s.type === 'miles' ? fmtPerDist(settings.distanceUnit) : 'Percentage'} — {fmtCurrency(Number(s.amount), settings.currency)}
                        </span>
                      </div>
                      <button className="doc-action-btn open">View</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
