import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { UserX, Eye, UserPlus, AlertTriangle } from 'lucide-react';
import { Emoji } from '../Emoji';
import { Driver } from '../../types/dashboard';
import { useCompanyData } from '../../hooks/useCompanyData';
import { useDriverDocStorage } from '../../hooks/useDriverDocStorage';
import { useLocalOverrides } from '../../hooks/useLocalOverrides';
import { useSettings, fmtDate } from '../../contexts/SettingsContext';
import { addManualDriver, fireDriver } from '../../services/applicationSubmitService';

const POSITIONS  = ['Owner Operator', 'Company Driver'] as const;
const EQUIPMENTS = ['Van', 'Reefer', 'Flat Bed', 'Unsigned'] as const;
const STATUSES   = ['Ready', 'Not Ready'] as const;

interface AddDriverForm {
  firstName:    string;
  lastName:     string;
  position:     typeof POSITIONS[number];
  driverStatus: typeof STATUSES[number];
  equipment:    typeof EQUIPMENTS[number];
}

const EMPTY_FORM: AddDriverForm = {
  firstName:    '',
  lastName:     '',
  position:     'Company Driver',
  driverStatus: 'Not Ready',
  equipment:    'Van',
};

export default function DriversPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettings();
  const { companyDrivers, refresh } = useCompanyData();
  const { getDriverDocs, uploadDoc, deleteDoc, openDoc } = useDriverDocStorage();
  const { applyOverrides, saveOverride } = useLocalOverrides();

  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isUploading, setIsUploading]       = useState<string | null>(null);

  // ── Add Driver modal state ────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm]           = useState<AddDriverForm>(EMPTY_FORM);
  const [addCdlFile, setAddCdlFile]     = useState<File | null>(null);
  const [addMedFile, setAddMedFile]     = useState<File | null>(null);
  const [addSaving, setAddSaving]       = useState(false);

  // ── Fire Driver confirmation state ────────────────────────────────────────
  const [fireConfirmDriver, setFireConfirmDriver] = useState<Driver | null>(null);

  const addCdlRef = useRef<HTMLInputElement>(null);
  const addMedRef = useRef<HTMLInputElement>(null);

  const cdlInputRef      = useRef<HTMLInputElement>(null);
  const medicalInputRef  = useRef<HTMLInputElement>(null);
  const contractInputRef = useRef<HTMLInputElement>(null);

  // Apply any locally-saved overrides on top of base data
  const drivers = useMemo(() => applyOverrides(companyDrivers), [companyDrivers, applyOverrides]);

  // Sync modal with URL :id
  useEffect(() => {
    if (id) {
      const driver = drivers.find(d => d.id === Number(id));
      setSelectedDriver(driver ?? null);
    } else {
      setSelectedDriver(null);
    }
  }, [id, drivers]);

  // Auto-open Add Driver modal when navigated from dashboard quick action
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      setShowAddModal(true);
      // Clean the query param from the URL without adding a history entry
      navigate('/dashboard/drivers', { replace: true });
    }
  }, [location.search, navigate]);

  const filtered = useMemo(() => drivers.filter(d => {
    const q = searchQuery.toLowerCase();
    return d.firstName.toLowerCase().includes(q)
      || d.lastName.toLowerCase().includes(q)
      || d.name.toLowerCase().includes(q);
  }), [searchQuery, drivers]);

  const readyCount    = drivers.filter(d => d.driverStatus === 'Ready').length;
  const notReadyCount = drivers.filter(d => d.driverStatus === 'Not Ready').length;

  // ── Document upload handler ───────────────────────────────────────────────
  const handleFileChange = async (
    type: 'cdl' | 'medicalCard' | 'workingContract',
    file: File | undefined,
  ) => {
    if (!file || !selectedDriver) return;
    setIsUploading(type);
    try {
      await uploadDoc(selectedDriver.id, type, file, fmtDate(new Date(), settings.dateFormat));
      alert(`✅ ${getDocLabel(type)} uploaded and saved!`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '❌ Upload failed. Please try again.');
    } finally {
      setIsUploading(null);
      [cdlInputRef, medicalInputRef, contractInputRef].forEach(r => {
        if (r.current) r.current.value = '';
      });
    }
  };

  const handleDeleteDoc = (type: 'cdl' | 'medicalCard' | 'workingContract') => {
    if (!selectedDriver) return;
    if (window.confirm(`Delete ${getDocLabel(type)}? This cannot be undone.`)) {
      deleteDoc(selectedDriver.id, type);
    }
  };

  // ── Status toggle ─────────────────────────────────────────────────────────
  const toggleDriverStatus = (driver: Driver) => {
    const next = driver.driverStatus === 'Ready' ? 'Not Ready' : 'Ready';
    saveOverride(driver.id, { driverStatus: next });
    if (selectedDriver?.id === driver.id) {
      setSelectedDriver(prev => prev ? { ...prev, driverStatus: next } : prev);
    }
  };

  const getDocLabel = (type: string) =>
    ({ cdl: 'CDL Certificate', medicalCard: 'Medical Card', applicationPdf: 'Application (Form)', workingContract: 'Working Contract' }[type] ?? 'Document');

  const docDefs = [
    { key: 'cdl' as const,             icon: '📄', label: 'CDL Certificate',   ref: cdlInputRef      },
    { key: 'medicalCard' as const,     icon: '🏥', label: 'Medical Card',       ref: medicalInputRef  },
    { key: 'applicationPdf' as const,  icon: '📋', label: 'Application (Form)', ref: contractInputRef, readOnly: true },
    { key: 'workingContract' as const, icon: '✍️', label: 'Working Contract',   ref: contractInputRef },
  ];

  // ── Add Driver submit ─────────────────────────────────────────────────────
  const handleAddDriver = async () => {
    if (!addForm.firstName.trim() || !addForm.lastName.trim()) {
      alert('Please enter first and last name.');
      return;
    }
    setAddSaving(true);
    try {
      const dateStr = fmtDate(new Date(), settings.dateFormat);
      const newId   = addManualDriver(addForm);

      // Upload docs if provided
      if (addCdlFile) {
        try { await uploadDoc(newId, 'cdl', addCdlFile, dateStr); } catch { /* ignore */ }
      }
      if (addMedFile) {
        try { await uploadDoc(newId, 'medicalCard', addMedFile, dateStr); } catch { /* ignore */ }
      }

      refresh();
      setShowAddModal(false);
      setAddForm(EMPTY_FORM);
      setAddCdlFile(null);
      setAddMedFile(null);
      if (addCdlRef.current) addCdlRef.current.value = '';
      if (addMedRef.current) addMedRef.current.value = '';
    } catch (err) {
      alert('Failed to add driver. Please try again.');
    } finally {
      setAddSaving(false);
    }
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddForm(EMPTY_FORM);
    setAddCdlFile(null);
    setAddMedFile(null);
  };

  // ── Fire driver handler ───────────────────────────────────────────────────
  const handleFireDriver = () => {
    if (!fireConfirmDriver) return;
    fireDriver(fireConfirmDriver.id);
    setFireConfirmDriver(null);
    if (selectedDriver?.id === fireConfirmDriver.id) navigate('/dashboard/drivers');
    refresh();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Drivers</h1>
        <p className="page-subtitle">Manage your company drivers</p>
        <div className="stats-row">
          <div className="stat-item"><div className="stat-value">{drivers.length}</div><div className="stat-label">Total Drivers</div></div>
          <div className="stat-item"><div className="stat-value">{readyCount}</div><div className="stat-label">Ready</div></div>
          <div className="stat-item"><div className="stat-value">{notReadyCount}</div><div className="stat-label">Not Ready</div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="card-title">Overview</h2>
          <button
            className="view-btn"
            style={{ padding: '8px 16px', fontWeight: 600, background: 'var(--primary, #2563eb)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setShowAddModal(true)}
          >
            <UserPlus size={15} />
            Add Driver
          </button>
        </div>
        <div className="recruiting-stats">
          <span className="stat-badge">{drivers.length} Total Workers</span>
          <span className="stat-badge">{readyCount} Ready</span>
          <span className="stat-badge">{notReadyCount} Not Ready</span>
        </div>
        <div className="search-bar">
          <span><Emoji symbol="🔍" size={16} /></span>
          <input type="text" placeholder="Search by name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="table-header drivers-cols">
          <span>Driver</span><span>Position</span><span>Equipment</span><span>Status</span><span>Date</span><span>Action</span>
        </div>
        <div className="table-body">
          {filtered.length > 0 ? filtered.map(d => (
            <div key={d.id} className="table-row drivers-cols">
              <span className="cell-name"><span className="row-avatar"><Emoji symbol="👤" size={20} /></span>{d.name}</span>
              <span className="cell" data-label="Position">{d.position}</span>
              <span className="cell" data-label="Equipment"><span className="equip-badge">{d.equipment}</span></span>
              <span className="cell" data-label="Status">
                <button
                  className={`status-badge status-driver-${d.driverStatus?.toLowerCase().replace(' ', '-')}`}
                  style={{ cursor: 'pointer', border: 'none', background: 'none' }}
                  title="Click to toggle status"
                  onClick={() => toggleDriverStatus(d)}
                >
                  {d.driverStatus}
                </button>
              </span>
              <span className="cell" data-label="Date">{fmtDate(d.date, settings.dateFormat)}</span>
              <span className="cell" data-label="Action" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  className="view-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px' }}
                  onClick={() => navigate(`/dashboard/drivers/${d.id}`)}
                >
                  <Eye size={13} /> View
                </button>
                <button
                  onClick={() => setFireConfirmDriver(d)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '6px 12px', borderRadius: '8px', border: 'none',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                    boxShadow: '0 1px 3px rgba(239,68,68,0.35)', whiteSpace: 'nowrap',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  title="Terminate this driver"
                >
                  <UserX size={13} /> Terminate
                </button>
              </span>
            </div>
          )) : <div className="no-results">No drivers found</div>}
        </div>
      </div>

      {/* Hidden file inputs for detail modal */}
      <input ref={cdlInputRef}      type="file" accept=".pdf,application/pdf" onChange={e => handleFileChange('cdl',             e.target.files?.[0])} style={{ display: 'none' }} />
      <input ref={medicalInputRef}  type="file" accept=".pdf,application/pdf,.jpg,.jpeg,.png,image/*" onChange={e => handleFileChange('medicalCard', e.target.files?.[0])} style={{ display: 'none' }} />
      <input ref={contractInputRef} type="file" accept=".pdf,application/pdf" onChange={e => handleFileChange('workingContract', e.target.files?.[0])} style={{ display: 'none' }} />

      {/* ── Add Driver Modal ── */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeAddModal}>
          <div className="modal-content" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Driver</h2>
              <button className="close-btn" onClick={closeAddModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h3>Driver Information</h3>
                <div className="info-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>First Name *</label>
                    <input
                      type="text"
                      placeholder="John"
                      value={addForm.firstName}
                      onChange={e => setAddForm(f => ({ ...f, firstName: e.target.value }))}
                      style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, background: 'var(--input-bg, #fff)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Last Name *</label>
                    <input
                      type="text"
                      placeholder="Smith"
                      value={addForm.lastName}
                      onChange={e => setAddForm(f => ({ ...f, lastName: e.target.value }))}
                      style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, background: 'var(--input-bg, #fff)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Position</label>
                    <select
                      value={addForm.position}
                      onChange={e => setAddForm(f => ({ ...f, position: e.target.value as typeof POSITIONS[number] }))}
                      style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, background: 'var(--input-bg, #fff)', color: 'var(--text-primary)' }}
                    >
                      {POSITIONS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Status</label>
                    <select
                      value={addForm.driverStatus}
                      onChange={e => setAddForm(f => ({ ...f, driverStatus: e.target.value as typeof STATUSES[number] }))}
                      style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, background: 'var(--input-bg, #fff)', color: 'var(--text-primary)' }}
                    >
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Equipment</label>
                    <select
                      value={addForm.equipment}
                      onChange={e => setAddForm(f => ({ ...f, equipment: e.target.value as typeof EQUIPMENTS[number] }))}
                      style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, background: 'var(--input-bg, #fff)', color: 'var(--text-primary)' }}
                    >
                      {EQUIPMENTS.map(eq => <option key={eq}>{eq}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-section" style={{ marginTop: 20 }}>
                <h3>Documents <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-secondary)' }}>(optional — you can upload later)</span></h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                  {/* CDL */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card-bg, #f9fafb)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Emoji symbol="📄" size={20} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>CDL Certificate</div>
                        {addCdlFile && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{addCdlFile.name}</div>}
                      </div>
                    </div>
                    <button className="upload-doc-btn" onClick={() => addCdlRef.current?.click()} style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      {addCdlFile ? <><Emoji symbol="✅" size={14} /> Change</> : <><Emoji symbol="📤" size={14} /> Upload</>}
                    </button>
                    <input ref={addCdlRef} type="file" accept=".pdf,application/pdf" style={{ display: 'none' }} onChange={e => setAddCdlFile(e.target.files?.[0] ?? null)} />
                  </div>

                  {/* Medical Card */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card-bg, #f9fafb)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Emoji symbol="🏥" size={20} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>Medical Card</div>
                        {addMedFile && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{addMedFile.name}</div>}
                      </div>
                    </div>
                    <button className="upload-doc-btn" onClick={() => addMedRef.current?.click()} style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      {addMedFile ? <><Emoji symbol="✅" size={14} /> Change</> : <><Emoji symbol="📤" size={14} /> Upload</>}
                    </button>
                    <input ref={addMedRef} type="file" accept=".pdf,application/pdf,.jpg,.jpeg,.png,image/*" style={{ display: 'none' }} onChange={e => setAddMedFile(e.target.files?.[0] ?? null)} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
                <button
                  onClick={closeAddModal}
                  style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 14, color: 'var(--text-primary)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDriver}
                  disabled={addSaving}
                  style={{ padding: '9px 24px', borderRadius: 8, border: 'none', background: 'var(--primary, #2563eb)', color: '#fff', cursor: addSaving ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600, opacity: addSaving ? 0.7 : 1 }}
                >
                  {addSaving
                    ? <><Emoji symbol="⏳" size={14} style={{ marginRight: 5 }} /> Saving...</>
                    : <><Emoji symbol="✅" size={14} style={{ marginRight: 5 }} /> Add Driver</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Driver detail modal ── */}
      {selectedDriver && (() => {
        const docs = getDriverDocs(selectedDriver.id);
        return (
          <div className="modal-overlay" onClick={() => navigate('/dashboard/drivers')}>
            <div className="modal-content modal-xl" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedDriver.name} — Documents</h2>
                <button className="close-btn" onClick={() => navigate('/dashboard/drivers')}>✕</button>
              </div>
              <div className="modal-body">
                <div className="modal-section">
                  <h3>Driver Information</h3>
                  <div className="info-grid">
                    <div className="info-item"><span className="info-label">Position</span><span className="info-value">{selectedDriver.position}</span></div>
                    <div className="info-item"><span className="info-label">Equipment</span><span className="info-value"><span className="equip-badge">{selectedDriver.equipment}</span></span></div>
                    <div className="info-item">
                      <span className="info-label">Status</span>
                      <span className="info-value">
                        <button
                          className={`status-badge status-driver-${selectedDriver.driverStatus?.toLowerCase().replace(' ', '-')}`}
                          style={{ cursor: 'pointer', border: 'none', background: 'none' }}
                          title="Click to toggle"
                          onClick={() => toggleDriverStatus(selectedDriver)}
                        >
                          {selectedDriver.driverStatus}
                        </button>
                      </span>
                    </div>
                    <div className="info-item"><span className="info-label">Hired Date</span><span className="info-value">{fmtDate(selectedDriver.date, settings.dateFormat)}</span></div>
                  </div>
                </div>

                <div className="modal-section">
                  <div className="modal-section-header"><h3>Required Documents</h3></div>
                  <div className="driver-documents-grid">
                    {docDefs.map(({ key, icon, label, ref, readOnly }) => {
                      const doc = docs[key];
                      const uploading = isUploading === key;
                      return (
                        <div key={key} className="driver-doc-card">
                          <div className="driver-doc-header">
                            <div className="driver-doc-icon"><Emoji symbol={icon} size={22} /></div>
                            <h4>{label}</h4>
                          </div>
                          {doc ? (
                            <div className="driver-doc-info">
                              <p className="driver-doc-name">{doc.name}</p>
                              <p className="driver-doc-meta">{doc.size} · {doc.uploadDate}</p>
                              <div className="driver-doc-actions">
                                <button className="doc-action-btn open" onClick={() => openDoc(doc)}>View</button>
                                {!readOnly && (
                                  <button className="doc-action-btn delete" onClick={() => handleDeleteDoc(key as 'cdl' | 'medicalCard' | 'workingContract')}>Delete</button>
                                )}
                              </div>
                            </div>
                          ) : key === 'workingContract' ? (
                            <div className="driver-doc-empty">
                              <p style={{ marginBottom: '6px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
                                <Emoji symbol="⏳" size={14} /> Pending signature &amp; scan
                              </p>
                              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                                Upload after contract is signed in person and scanned
                              </p>
                              <button className="upload-doc-btn" disabled={uploading} onClick={() => ref.current?.click()}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                {uploading
                                  ? <><Emoji symbol="⏳" size={13} /> Uploading...</>
                                  : <><Emoji symbol="📤" size={13} /> Upload Signed Contract</>}
                              </button>
                            </div>
                          ) : (
                            <div className="driver-doc-empty">
                              <p>No {label} uploaded</p>
                              {!readOnly && (
                                <button className="upload-doc-btn" disabled={uploading} onClick={() => ref.current?.click()}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                  {uploading
                                    ? <><Emoji symbol="⏳" size={13} /> Uploading...</>
                                    : <><Emoji symbol="📤" size={13} /> Upload {label}</>}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {/* ── Fire Driver Confirmation Modal ── */}
      {fireConfirmDriver && (
        <div className="modal-overlay" onClick={() => setFireConfirmDriver(null)}>
          <div className="modal-content" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Terminate Driver</h2>
              <button className="close-btn" onClick={() => setFireConfirmDriver(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(239,68,68,0.1)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <AlertTriangle size={26} color="#ef4444" />
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                  Terminate {fireConfirmDriver.name}?
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  This will permanently remove them from the drivers list and delete all stored documents. This action cannot be undone.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'center' }}>
                <button
                  onClick={() => setFireConfirmDriver(null)}
                  style={{ padding: '9px 24px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleFireDriver}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '9px 24px', borderRadius: 8, border: 'none',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700,
                    boxShadow: '0 2px 6px rgba(239,68,68,0.4)',
                  }}
                >
                  <UserX size={15} /> Confirm Termination
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

