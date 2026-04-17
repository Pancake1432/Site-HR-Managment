import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Driver, EmploymentStatus, EquipmentType } from '../../types/dashboard';
import { useCompanyData } from '../../hooks/useCompanyData';
import { useLocalOverrides } from '../../hooks/useLocalOverrides';
import { useDriverDocStorage, DriverDocSet } from '../../hooks/useDriverDocStorage';
import { useSavedStatements } from '../../contexts/SavedStatementsContext';
import { useSettings, fmtDate, fmtCurrency, fmtPerDist } from '../../contexts/SettingsContext';
import EquipmentDropdown from './EquipmentDropdown';
import { Emoji } from '../Emoji';

const PAGE_SIZE = 10;

const EMPTY_DOCS: DriverDocSet = {
  cdl: null, medicalCard: null, applicationPdf: null, workingContract: null,
};

export default function EmployeesPage() {
  const { companyDrivers, refresh } = useCompanyData();
  const { applyOverrides, saveOverride } = useLocalOverrides();
  const { getDriverDocs, openDoc }       = useDriverDocStorage();
  const { statements }                   = useSavedStatements();

  const { id }       = useParams<{ id: string }>();
  const navigate     = useNavigate();
  const { settings } = useSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage]   = useState(1);
  const [selected, setSelected]       = useState<Driver | null>(null);

  // Docs loaded async for the open modal
  const [selectedDocs, setSelectedDocs] = useState<DriverDocSet>(EMPTY_DOCS);

  // Local edit state for equipment and notes inside the modal
  const [editEquipment, setEditEquipment] = useState<EquipmentType>('Van');
  const [editNotes,     setEditNotes]     = useState('');
  const [notesSaving,   setNotesSaving]   = useState(false);
  const [notesSaved,    setNotesSaved]    = useState(false);

  const employees = useMemo(() => applyOverrides(companyDrivers), [companyDrivers, applyOverrides]);

  // Sync selected employee from URL param
  useEffect(() => {
    if (id) {
      const emp = employees.find(e => e.id === Number(id));
      setSelected(emp ?? null);
    } else {
      setSelected(null);
    }
  }, [id, employees]);

  // When modal opens, seed local edit fields and load docs
  useEffect(() => {
    if (!selected) {
      setSelectedDocs(EMPTY_DOCS);
      return;
    }
    setEditEquipment((selected.equipment as EquipmentType) ?? 'Van');
    setEditNotes(selected.notes ?? '');
    setNotesSaved(false);
    getDriverDocs(selected.id).then(setSelectedDocs);
  }, [selected, getDriverDocs]);

  // Reset to page 1 when search query changes
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const filtered = useMemo(() => employees.filter(e => {
    const q = searchQuery.toLowerCase();
    return e.firstName.toLowerCase().includes(q)
      || e.lastName.toLowerCase().includes(q)
      || e.name.toLowerCase().includes(q);
  }), [searchQuery, employees]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const workingCount = employees.filter(e => e.employmentStatus === 'Working').length;
  const firedCount   = employees.filter(e => e.employmentStatus === 'Fired').length;

  // ── Toggle employment status ──────────────────────────────────────────────
  const toggleEmploymentStatus = async (emp: Driver) => {
    const next: EmploymentStatus = emp.employmentStatus === 'Working' ? 'Fired' : 'Working';
    await saveOverride(emp.id, { employmentStatus: next });
    if (selected?.id === emp.id) {
      setSelected(prev => prev ? { ...prev, employmentStatus: next } : prev);
    }
    refresh();
  };

  // ── Save equipment change ─────────────────────────────────────────────────
  const handleEquipmentChange = async (newEquipment: EquipmentType) => {
    if (!selected) return;
    setEditEquipment(newEquipment);
    await saveOverride(selected.id, { equipment: newEquipment });
    setSelected(prev => prev ? { ...prev, equipment: newEquipment } : prev);
    refresh();
  };

  // ── Save notes ────────────────────────────────────────────────────────────
  const handleSaveNotes = async () => {
    if (!selected) return;
    setNotesSaving(true);
    try {
      await saveOverride(selected.id, { notes: editNotes });
      setSelected(prev => prev ? { ...prev, notes: editNotes } : prev);
      setNotesSaved(true);
      refresh();
      setTimeout(() => setNotesSaved(false), 2500);
    } finally {
      setNotesSaving(false);
    }
  };

  const employeeStatements = selected
    ? statements.filter(s => s.driverId === selected.id)
    : [];

  const docList = [
    selectedDocs.cdl             && { ...selectedDocs.cdl,             label: 'CDL Certificate'   },
    selectedDocs.medicalCard     && { ...selectedDocs.medicalCard,     label: 'Medical Card'      },
    selectedDocs.applicationPdf  && { ...selectedDocs.applicationPdf,  label: 'Application (Form)'},
    selectedDocs.workingContract && { ...selectedDocs.workingContract, label: 'Working Contract'  },
  ].filter(Boolean) as (NonNullable<typeof selectedDocs.cdl> & { label: string })[];

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
          <Emoji symbol="🔍" size={16} />
          <input type="text" placeholder="Search by name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="table-header employees-cols">
          <span>Name</span><span>Position</span><span>Equipment</span><span>Payment Type</span><span>Employment Status</span><span>Action</span>
        </div>
        <div className="table-body">
          {paginated.length > 0 ? paginated.map(e => (
            <div key={e.id} className="table-row employees-cols">
              <span className="cell-name"><span className="row-avatar"><Emoji symbol="👤" size={20} /></span>{e.name}</span>
              <span className="cell" data-label="Position">{e.position}</span>
              <span className="cell" data-label="Equipment">
                <span className="equip-badge">{e.equipment}</span>
              </span>
              <span className="cell" data-label="Payment Type">
                <span className={`payment-badge ${e.paymentType === 'miles' ? 'miles' : 'percent'}`}>
                  {e.paymentType === 'miles'
                    ? <><Emoji symbol="📏" size={13} /> {fmtPerDist(settings.distanceUnit)}</>
                    : <><Emoji symbol="📊" size={13} /> Percentage</>}
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
                <button className="details-btn" onClick={() => navigate(`/dashboard/employees/${e.id}`)}>
                  View Full Details
                </button>
              </span>
            </div>
          )) : <div className="no-results">No employees found</div>}
        </div>
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 0 4px' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1, fontSize: 13, color: 'var(--text-primary)' }}
            >← Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                style={{ width: 34, height: 34, borderRadius: 7, border: 'none', background: p === currentPage ? 'var(--primary, #2563eb)' : 'var(--card-bg, #f9fafb)', color: p === currentPage ? '#fff' : 'var(--text-primary)', cursor: 'pointer', fontSize: 13, fontWeight: p === currentPage ? 700 : 400 }}
              >{p}</button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1, fontSize: 13, color: 'var(--text-primary)' }}
            >Next →</button>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 4 }}>{filtered.length} employees</span>
          </div>
        )}
      </div>

      {/* ── Employee detail modal ── */}
      {selected && (
        <div className="modal-overlay" onClick={() => navigate('/dashboard/employees')}>
          <div className="modal-content modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selected.name} — Full Details</h2>
              <button className="close-btn" onClick={() => navigate('/dashboard/employees')}>✕</button>
            </div>
            <div className="modal-body">

              {/* ── Employee Information ── */}
              <div className="employee-info-section">
                <h3>Employee Information</h3>
                <div className="info-grid">
                  <div className="info-item"><strong>Name</strong><span>{selected.name}</span></div>
                  <div className="info-item"><strong>Position</strong><span>{selected.position}</span></div>

                  {/* Equipment — editable dropdown */}
                  <div className="info-item">
                    <strong>Equipment</strong>
                    <EquipmentDropdown
                      value={editEquipment}
                      onChange={handleEquipmentChange}
                    />
                  </div>

                  <div className="info-item">
                    <strong>Payment Type</strong>
                    <span>{selected.paymentType === 'miles' ? fmtPerDist(settings.distanceUnit) : 'Percentage'}</span>
                  </div>
                  <div className="info-item">
                    <strong>Employment Status</strong>
                    <button
                      className={`employment-badge ${selected.employmentStatus?.toLowerCase()}`}
                      style={{ cursor: 'pointer', border: 'none', background: 'none', textAlign: 'left', padding: 0 }}
                      title="Click to toggle"
                      onClick={() => toggleEmploymentStatus(selected)}
                    >
                      {selected.employmentStatus}
                    </button>
                  </div>
                  <div className="info-item">
                    <strong>Join Date</strong>
                    <span>{fmtDate(selected.date, settings.dateFormat)}</span>
                  </div>
                </div>
              </div>

              {/* ── Notes ── */}
              <div className="employee-info-section">
                <h3>Internal Notes</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>
                  Visible only to dispatchers and admins. Use this for truck number, trailer, phone, contacts, or any other info.
                </p>
                <textarea
                  value={editNotes}
                  onChange={e => { setEditNotes(e.target.value); setNotesSaved(false); }}
                  placeholder="e.g. Truck #4821 · Trailer T-09 · Cell: 555-0100 · Prefers night routes..."
                  rows={4}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    border: '1px solid var(--border)', fontSize: 14,
                    background: 'var(--input-bg, #fff)', color: 'var(--text-primary)',
                    resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6,
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                  <button
                    onClick={handleSaveNotes}
                    disabled={notesSaving}
                    style={{
                      padding: '7px 20px', borderRadius: 8, border: 'none',
                      background: 'var(--primary, #2563eb)', color: '#fff',
                      cursor: notesSaving ? 'not-allowed' : 'pointer',
                      fontSize: 13, fontWeight: 600, opacity: notesSaving ? 0.7 : 1,
                    }}
                  >
                    {notesSaving ? 'Saving…' : 'Save Notes'}
                  </button>
                  {notesSaved && (
                    <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 500 }}>
                      <Emoji symbol="✅" size={13} /> Saved
                    </span>
                  )}
                </div>
              </div>

              {/* ── Documents ── */}
              <div className="employee-info-section">
                <h3>Documents ({docList.length})</h3>
                {docList.length > 0 ? (
                  <div className="modal-documents-list">
                    {docList.map(doc => (
                      <div key={doc.id} className="modal-document-item">
                        <div className="document-icon-small"><Emoji symbol="📄" size={18} /></div>
                        <div className="document-info-small">
                          <strong>{doc.label}</strong>
                          <span>{doc.name} · {doc.size} · {doc.uploadDate}</span>
                        </div>
                        <button
                          className="doc-action-btn open"
                          onClick={() => openDoc(selected.id, doc)}
                        >
                          Open
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                    No documents uploaded yet. Upload them from the Drivers page.
                  </p>
                )}
              </div>

              {/* ── Statements ── */}
              <div className="employee-info-section">
                <h3>Statements ({employeeStatements.length})</h3>
                {employeeStatements.length > 0 ? (
                  <div className="modal-statements-list">
                    {employeeStatements.map(s => (
                      <div key={s.id} className="modal-statement-item">
                        <div className="statement-icon-small"><Emoji symbol="📋" size={18} /></div>
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
      )}
    </div>
  );
}
