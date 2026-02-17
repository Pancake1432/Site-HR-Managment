import { useState, useMemo } from 'react';
import { Driver } from '../../types/dashboard';
import { companyDriversData, defaultDocuments } from '../../data/driversData';

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected]       = useState<Driver | null>(null);

  const employees = useMemo(() => companyDriversData.map(d => ({
    ...d,
    documents: defaultDocuments.map(doc => ({ ...doc })),
    statements: [
      { id: 1, date: '01/01/2024', amount: '$4,250.00', type: d.paymentType === 'miles' ? 'Miles' : 'Percentage' },
      { id: 2, date: '01/15/2024', amount: '$4,100.00', type: d.paymentType === 'miles' ? 'Miles' : 'Percentage' },
      { id: 3, date: '02/01/2024', amount: '$4,500.00', type: d.paymentType === 'miles' ? 'Miles' : 'Percentage' },
    ],
  })), []);

  const filtered = useMemo(() => employees.filter(e => {
    const q = searchQuery.toLowerCase();
    return (
      e.firstName.toLowerCase().includes(q) ||
      e.lastName.toLowerCase().includes(q) ||
      e.name.toLowerCase().includes(q)
    );
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
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="table-header employees-cols">
          <span>Name</span>
          <span>Position</span>
          <span>Payment Type</span>
          <span>Employment Status</span>
          <span>Action</span>
        </div>
        <div className="table-body">
          {filtered.length > 0 ? filtered.map(e => (
            <div key={e.id} className="table-row employees-cols">
              <span className="cell-name"><span className="row-avatar">👤</span>{e.name}</span>
              <span className="cell">{e.position}</span>
              <span className="cell">
                <span className={`payment-badge ${e.paymentType === 'miles' ? 'miles' : 'percent'}`}>
                  {e.paymentType === 'miles' ? '📏 Per Mile' : '📊 Percentage'}
                </span>
              </span>
              <span className="cell">
                <span className={`employment-badge ${e.employmentStatus?.toLowerCase()}`}>
                  {e.employmentStatus}
                </span>
              </span>
              <span className="cell">
                <button className="details-btn" onClick={() => setSelected(e)}>
                  View Full Details
                </button>
              </span>
            </div>
          )) : <div className="no-results">No employees found</div>}
        </div>
      </div>

      {/* ── DETAILS MODAL ── */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selected.name} — Full Details</h2>
              <button className="close-btn" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">

              {/* Info grid */}
              <div className="employee-info-section">
                <h3>Employee Information</h3>
                <div className="info-grid">
                  <div className="info-item"><strong>Name</strong><span>{selected.name}</span></div>
                  <div className="info-item"><strong>Position</strong><span>{selected.position}</span></div>
                  <div className="info-item"><strong>Equipment</strong><span>{selected.equipment}</span></div>
                  <div className="info-item"><strong>Payment Type</strong><span>{selected.paymentType === 'miles' ? 'Per Mile' : 'Percentage'}</span></div>
                  <div className="info-item">
                    <strong>Employment Status</strong>
                    <span className={`employment-badge ${selected.employmentStatus?.toLowerCase()}`}>
                      {selected.employmentStatus}
                    </span>
                  </div>
                  <div className="info-item"><strong>Join Date</strong><span>{selected.date}</span></div>
                </div>
              </div>

              {/* Documents */}
              <div className="employee-info-section">
                <h3>Documents ({selected.documents?.length ?? 0})</h3>
                <div className="modal-documents-list">
                  {(selected.documents ?? []).map(doc => (
                    <div key={doc.id} className="modal-document-item">
                      <div className="document-icon-small">📄</div>
                      <div className="document-info-small">
                        <strong>{doc.name}</strong>
                        <span>{doc.type} · {doc.size} · {doc.uploadDate}</span>
                      </div>
                      <button className="doc-action-btn open">Open</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statements */}
              <div className="employee-info-section">
                <h3>Statements ({selected.statements?.length ?? 0})</h3>
                <div className="modal-statements-list">
                  {(selected.statements ?? []).map(s => (
                    <div key={s.id} className="modal-statement-item">
                      <div className="statement-icon-small">📋</div>
                      <div className="statement-info-small">
                        <strong>{s.date}</strong>
                        <span>{s.type} — {s.amount}</span>
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
