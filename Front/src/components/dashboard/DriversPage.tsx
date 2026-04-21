import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { UserX, Eye, UserPlus, AlertTriangle } from 'lucide-react';
import { Emoji } from '../Emoji';
import { Driver } from '../../types/dashboard';
import { useCompanyData } from '../../hooks/useCompanyData';
import { useDriverDocStorage, DriverDocSet, expiryStatus, daysUntilExpiry } from '../../hooks/useDriverDocStorage';
import { useLocalOverrides } from '../../hooks/useLocalOverrides';
import { useSettings, fmtDate } from '../../contexts/SettingsContext';
import { addManualDriver, fireDriver } from '../../services/applicationSubmitService';

const POSITIONS     = ['Owner Operator', 'Company Driver'] as const;
const EQUIPMENTS    = ['Van', 'Reefer', 'Flat Bed', 'Unsigned'] as const;
const STATUSES      = ['Ready', 'Not Ready'] as const;
const PAYMENT_TYPES = ['miles', 'percent'] as const;
const PAGE_SIZE     = 10;

interface AddDriverForm {
  firstName:    string;
  lastName:     string;
  position:     typeof POSITIONS[number];
  driverStatus: typeof STATUSES[number];
  equipment:    typeof EQUIPMENTS[number];
  paymentType:  typeof PAYMENT_TYPES[number];
}

const EMPTY_FORM: AddDriverForm = {
  firstName: '', lastName: '',
  position: 'Company Driver', driverStatus: 'Not Ready',
  equipment: 'Van', paymentType: 'miles',
};

const EMPTY_DOCS: DriverDocSet = {
  cdl: null, medicalCard: null, applicationPdf: null, workingContract: null,
};

export default function DriversPage() {
  const { id } = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { settings } = useSettings();
  const dateScheme = settings.darkMode ? 'dark' : 'light' as const;
  const { companyDrivers, refresh } = useCompanyData();
  const { getDriverDocs, uploadDoc, deleteDoc, openDoc, setDocExpiry } = useDriverDocStorage();
  const { applyOverrides, saveOverride } = useLocalOverrides();

  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isUploading, setIsUploading]       = useState<string | null>(null);
  const [currentPage, setCurrentPage]       = useState(1);

  const [cdlExpiry, setCdlExpiry]   = useState('');
  const [medExpiry, setMedExpiry]   = useState('');
  const [editingExpiry, setEditingExpiry] = useState<string | null>(null); // key of doc being edited

  const [selectedDriverDocs, setSelectedDriverDocs] = useState<DriverDocSet>(EMPTY_DOCS);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm]           = useState<AddDriverForm>(EMPTY_FORM);
  const [addCdlFile, setAddCdlFile]     = useState<File | null>(null);
  const [addMedFile, setAddMedFile]     = useState<File | null>(null);
  const [addCdlExpiry, setAddCdlExpiry] = useState('');
  const [addMedExpiry, setAddMedExpiry] = useState('');
  const [addSaving, setAddSaving]       = useState(false);

  const [fireConfirmDriver, setFireConfirmDriver] = useState<Driver | null>(null);

  const addCdlRef      = useRef<HTMLInputElement>(null);
  const addMedRef      = useRef<HTMLInputElement>(null);
  const cdlInputRef    = useRef<HTMLInputElement>(null);
  const medicalInputRef  = useRef<HTMLInputElement>(null);
  const contractInputRef = useRef<HTMLInputElement>(null);

  const drivers = useMemo(() => applyOverrides(companyDrivers), [companyDrivers, applyOverrides]);

  useEffect(() => {
    if (id) {
      const driver = drivers.find(d => d.id === Number(id));
      setSelectedDriver(driver ?? null);
    } else {
      setSelectedDriver(null);
    }
  }, [id, drivers]);

  useEffect(() => {
    if (!selectedDriver) { setSelectedDriverDocs(EMPTY_DOCS); return; }
    getDriverDocs(selectedDriver.id).then(setSelectedDriverDocs);
  }, [selectedDriver, getDriverDocs]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      setShowAddModal(true);
      navigate('/dashboard/drivers', { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const filtered = useMemo(() => drivers.filter(d => {
    const q = searchQuery.toLowerCase();
    return d.firstName.toLowerCase().includes(q)
      || d.lastName.toLowerCase().includes(q)
      || d.name.toLowerCase().includes(q);
  }), [searchQuery, drivers]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const readyCount    = drivers.filter(d => d.driverStatus === 'Ready').length;
  const notReadyCount = drivers.filter(d => d.driverStatus === 'Not Ready').length;

  const handleFileChange = async (type: 'cdl' | 'medicalCard' | 'workingContract', file: File | undefined) => {
    if (!file || !selectedDriver) return;
    setIsUploading(type);
    const expiry = type === 'cdl' ? cdlExpiry : type === 'medicalCard' ? medExpiry : undefined;
    try {
      await uploadDoc(selectedDriver.id, type, file, expiry || undefined);
      const updated = await getDriverDocs(selectedDriver.id);
      setSelectedDriverDocs(updated);
      if (type === 'cdl') setCdlExpiry('');
      if (type === 'medicalCard') setMedExpiry('');
      alert(`✅ ${getDocLabel(type)} uploaded and saved!`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '❌ Upload failed. Please try again.');
    } finally {
      setIsUploading(null);
      [cdlInputRef, medicalInputRef, contractInputRef].forEach(r => { if (r.current) r.current.value = ''; });
    }
  };

  const handleDeleteDoc = (type: 'cdl' | 'medicalCard' | 'workingContract') => {
    if (!selectedDriver) return;
    const doc = selectedDriverDocs[type];
    if (!doc) return;
    if (window.confirm(`Delete ${getDocLabel(type)}? This cannot be undone.`)) {
      deleteDoc(selectedDriver.id, String(doc.id));
      setSelectedDriverDocs(prev => ({ ...prev, [type]: null }));
    }
  };

  const toggleDriverStatus = async (driver: Driver) => {
    if (driver.employmentStatus === 'Fired') return;
    const next = driver.driverStatus === 'Ready' ? 'Not Ready' : 'Ready';
    await saveOverride(driver.id, { driverStatus: next });
    if (selectedDriver?.id === driver.id)
      setSelectedDriver(prev => prev ? { ...prev, driverStatus: next } : prev);
    refresh();
  };

  const getDocLabel = (type: string) =>
    ({ cdl: 'CDL Certificate', medicalCard: 'Medical Card', applicationPdf: 'Application (Form)', workingContract: 'Working Contract' }[type] ?? 'Document');

  const docDefs = [
    { key: 'cdl' as const,             icon: '📄', label: 'CDL Certificate',   ref: cdlInputRef,      hasExpiry: true,  readOnly: false },
    { key: 'medicalCard' as const,     icon: '🏥', label: 'Medical Card',       ref: medicalInputRef,  hasExpiry: true,  readOnly: false },
    { key: 'applicationPdf' as const,  icon: '📋', label: 'Application (Form)', ref: contractInputRef, hasExpiry: false, readOnly: true  },
    { key: 'workingContract' as const, icon: '✍️', label: 'Working Contract',   ref: contractInputRef, hasExpiry: false, readOnly: false },
  ];

  const handleSetExpiry = async (_docKey: string, docId: number, newExpiry: string) => {
    await setDocExpiry(docId, newExpiry);
    const updated = await getDriverDocs(selectedDriver!.id);
    setSelectedDriverDocs(updated);
    setEditingExpiry(null);
  };

  const handleAddDriver = async () => {
    if (!addForm.firstName.trim() || !addForm.lastName.trim()) { alert('Please enter first and last name.'); return; }
    setAddSaving(true);
    try {
      const newId = await addManualDriver(addForm);
      if (addCdlFile) { try { await uploadDoc(newId, 'cdl', addCdlFile, addCdlExpiry || undefined); } catch { /* ignore */ } }
      if (addMedFile) { try { await uploadDoc(newId, 'medicalCard', addMedFile, addMedExpiry || undefined); } catch { /* ignore */ } }
      refresh();
      setShowAddModal(false);
      setAddForm(EMPTY_FORM);
      setAddCdlFile(null); setAddMedFile(null);
      setAddCdlExpiry(''); setAddMedExpiry('');
      if (addCdlRef.current) addCdlRef.current.value = '';
      if (addMedRef.current) addMedRef.current.value = '';
    } catch { alert('Failed to add driver. Please try again.'); }
    finally { setAddSaving(false); }
  };

  const closeAddModal = () => {
    setShowAddModal(false); setAddForm(EMPTY_FORM);
    setAddCdlFile(null); setAddMedFile(null);
    setAddCdlExpiry(''); setAddMedExpiry('');
  };

  const handleFireDriver = async () => {
    if (!fireConfirmDriver) return;
    await fireDriver(fireConfirmDriver.id);
    setFireConfirmDriver(null);
    if (selectedDriver?.id === fireConfirmDriver.id) navigate('/dashboard/drivers');
    refresh();
  };

  const iStyle: React.CSSProperties = { padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, background: 'var(--bg-card)', color: 'var(--text-primary)', colorScheme: dateScheme };

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
          <button className="view-btn" style={{ padding: '8px 16px', fontWeight: 600, background: 'var(--primary, #2563eb)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setShowAddModal(true)}>
            <UserPlus size={15} /> Add Driver
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
          {paginated.length > 0 ? paginated.map(d => (
            <div key={d.id} className="table-row drivers-cols">
              <span className="cell-name"><span className="row-avatar"><Emoji symbol="👤" size={20} /></span>{d.name}</span>
              <span className="cell" data-label="Position">{d.position}</span>
              <span className="cell" data-label="Equipment"><span className="equip-badge">{d.equipment}</span></span>
              <span className="cell" data-label="Status">
                <button className={`status-badge status-driver-${d.driverStatus?.toLowerCase().replace(' ', '-')}`} style={{ cursor: d.employmentStatus === 'Fired' ? 'not-allowed' : 'pointer', border: 'none', background: 'none', opacity: d.employmentStatus === 'Fired' ? 0.6 : 1 }} onClick={() => toggleDriverStatus(d)}>
                  {d.driverStatus}
                </button>
              </span>
              <span className="cell" data-label="Date">{fmtDate(d.date, settings.dateFormat)}</span>
              <span className="cell" data-label="Action" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button className="view-btn" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px' }} onClick={() => navigate(`/dashboard/drivers/${d.id}`)}>
                  <Eye size={13} /> View
                </button>
                <button onClick={() => setFireConfirmDriver(d)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  <UserX size={13} /> Terminate
                </button>
              </span>
            </div>
          )) : <div className="no-results">No drivers found</div>}
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 0 4px' }}>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1, fontSize: 13, color: 'var(--text-primary)' }}>← Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setCurrentPage(p)} style={{ width: 34, height: 34, borderRadius: 7, border: 'none', background: p === currentPage ? 'var(--primary, #2563eb)' : 'var(--card-bg, #f9fafb)', color: p === currentPage ? '#fff' : 'var(--text-primary)', cursor: 'pointer', fontSize: 13, fontWeight: p === currentPage ? 700 : 400 }}>{p}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1, fontSize: 13, color: 'var(--text-primary)' }}>Next →</button>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 4 }}>{filtered.length} drivers</span>
          </div>
        )}
      </div>

      <input ref={cdlInputRef}      type="file" accept=".pdf,application/pdf" onChange={e => handleFileChange('cdl', e.target.files?.[0])} style={{ display: 'none' }} />
      <input ref={medicalInputRef}  type="file" accept=".pdf,application/pdf,.jpg,.jpeg,.png,image/*" onChange={e => handleFileChange('medicalCard', e.target.files?.[0])} style={{ display: 'none' }} />
      <input ref={contractInputRef} type="file" accept=".pdf,application/pdf" onChange={e => handleFileChange('workingContract', e.target.files?.[0])} style={{ display: 'none' }} />

      {showAddModal && (
        <div className="modal-overlay" onClick={closeAddModal}>
          <div className="modal-content" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Add Driver</h2><button className="close-btn" onClick={closeAddModal}>✕</button></div>
            <div className="modal-body">
              <div className="modal-section">
                <h3>Driver Information</h3>
                <div className="info-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>First Name *</label>
                    <input type="text" placeholder="John" value={addForm.firstName} onChange={e => setAddForm(f => ({ ...f, firstName: e.target.value }))} style={iStyle} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Last Name *</label>
                    <input type="text" placeholder="Smith" value={addForm.lastName} onChange={e => setAddForm(f => ({ ...f, lastName: e.target.value }))} style={iStyle} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Position</label>
                    <select value={addForm.position} onChange={e => { const pos = e.target.value as typeof POSITIONS[number]; setAddForm(f => ({ ...f, position: pos, paymentType: pos === 'Owner Operator' ? 'percent' : f.paymentType })); }} style={iStyle}>
                      {POSITIONS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Status</label>
                    <select value={addForm.driverStatus} onChange={e => setAddForm(f => ({ ...f, driverStatus: e.target.value as typeof STATUSES[number] }))} style={iStyle}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Equipment</label>
                    <select value={addForm.equipment} onChange={e => setAddForm(f => ({ ...f, equipment: e.target.value as typeof EQUIPMENTS[number] }))} style={iStyle}>
                      {EQUIPMENTS.map(eq => <option key={eq}>{eq}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Payment Type</label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {(addForm.position === 'Owner Operator' ? ['percent'] : PAYMENT_TYPES).map(pt => (
                        <label key={pt} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 8, border: `2px solid ${addForm.paymentType === pt ? 'var(--accent, #667eea)' : 'var(--border)'}`, cursor: 'pointer', flex: 1, justifyContent: 'center', background: addForm.paymentType === pt ? 'rgba(102,126,234,0.08)' : 'transparent' }}>
                          <input type="radio" name="addPaymentType" value={pt} checked={addForm.paymentType === pt} onChange={() => setAddForm(f => ({ ...f, paymentType: pt as typeof PAYMENT_TYPES[number] }))} style={{ display: 'none' }} />
                          <Emoji symbol={pt === 'miles' ? '🛣️' : '📊'} size={16} />
                          <span style={{ fontSize: 14, fontWeight: 600, color: addForm.paymentType === pt ? 'var(--accent, #667eea)' : 'var(--text-primary)' }}>{pt === 'miles' ? 'Per Mile' : 'Per Percent'}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-section" style={{ marginTop: 20 }}>
                <h3>Documents <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-secondary)' }}>(optional)</span></h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                  {[
                    { label: 'CDL Certificate', icon: '📄', file: addCdlFile, setFile: setAddCdlFile, ref: addCdlRef, expiry: addCdlExpiry, setExpiry: setAddCdlExpiry, accept: '.pdf,application/pdf' },
                    { label: 'Medical Card',    icon: '🏥', file: addMedFile, setFile: setAddMedFile, ref: addMedRef, expiry: addMedExpiry, setExpiry: setAddMedExpiry, accept: '.pdf,application/pdf,.jpg,.jpeg,.png,image/*' },
                  ].map(({ label, icon, file, setFile, ref, expiry, setExpiry, accept }) => (
                    <div key={label} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Emoji symbol={icon} size={20} />
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                            {file && <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{file.name}</div>}
                          </div>
                        </div>
                        <button className="upload-doc-btn" onClick={() => ref.current?.click()} style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          {file ? <><Emoji symbol="✅" size={14} /> Change</> : <><Emoji symbol="📤" size={14} /> Upload</>}
                        </button>
                        <input ref={ref} type="file" accept={accept} style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] ?? null)} />
                      </div>
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <label style={{ fontSize: 12, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Expiry date:</label>
                        <input type="date" value={expiry} onChange={e => setExpiry(e.target.value)} style={{ ...iStyle, fontSize: 12, padding: '4px 8px', flex: 1, colorScheme: dateScheme }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
                <button onClick={closeAddModal} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 14, color: 'var(--text-primary)' }}>Cancel</button>
                <button onClick={handleAddDriver} disabled={addSaving} style={{ padding: '9px 24px', borderRadius: 8, border: 'none', background: 'var(--primary, #2563eb)', color: '#fff', cursor: addSaving ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600, opacity: addSaving ? 0.7 : 1 }}>
                  {addSaving ? <><Emoji symbol="⏳" size={14} style={{ marginRight: 5 }} /> Saving...</> : <><Emoji symbol="✅" size={14} style={{ marginRight: 5 }} /> Add Driver</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedDriver && (
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
                      <button className={`status-badge status-driver-${selectedDriver.driverStatus?.toLowerCase().replace(' ', '-')}`} style={{ cursor: selectedDriver.employmentStatus === 'Fired' ? 'not-allowed' : 'pointer', border: 'none', background: 'none', opacity: selectedDriver.employmentStatus === 'Fired' ? 0.6 : 1 }} onClick={() => toggleDriverStatus(selectedDriver)}>
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
                  {docDefs.map(({ key, icon, label, ref, readOnly, hasExpiry }) => {
                    const doc      = selectedDriverDocs[key];
                    const uploading = isUploading === key;
                    const status   = expiryStatus(doc?.expiryDate);
                    const days     = daysUntilExpiry(doc?.expiryDate);
                    return (
                      <div key={key} className="driver-doc-card" style={status === 'expired' ? { border: '1px solid #ef4444' } : status === 'warning' ? { border: '1px solid #f59e0b' } : {}}>
                        <div className="driver-doc-header">
                          <div className="driver-doc-icon"><Emoji symbol={icon} size={22} /></div>
                          <h4>{label}</h4>
                        </div>
                        {doc ? (
                          <div className="driver-doc-info">
                            <p className="driver-doc-name">{doc.name}</p>
                            <p className="driver-doc-meta">{doc.size} · {doc.uploadDate}</p>

                            {/* ── Expiry date display / inline editor ── */}
                            {hasExpiry && (
                              <div style={{ marginTop: 6 }}>
                                {editingExpiry === key ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <input
                                      type="date"
                                      defaultValue={doc.expiryDate ? doc.expiryDate.substring(0, 10) : ''}
                                      id={`expiry-input-${key}`}
                                      style={{ fontSize: 12, padding: '3px 7px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', colorScheme: dateScheme }}
                                    />
                                    <button
                                      onClick={() => {
                                        const input = document.getElementById(`expiry-input-${key}`) as HTMLInputElement;
                                        handleSetExpiry(key, doc.id, input.value);
                                      }}
                                      style={{ fontSize: 11, padding: '3px 9px', borderRadius: 5, border: 'none', background: '#667eea', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
                                    >Save</button>
                                    <button
                                      onClick={() => setEditingExpiry(null)}
                                      style={{ fontSize: 11, padding: '3px 8px', borderRadius: 5, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                    >✕</button>
                                  </div>
                                ) : doc.expiryDate ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <p style={{ fontSize: 12, fontWeight: 600, color: status === 'expired' ? '#dc2626' : status === 'warning' ? '#b45309' : '#16a34a', margin: 0 }}>
                                      {status === 'expired' ? `⛔ Expired ${Math.abs(days!)} days ago`
                                        : status === 'warning' ? `⚠ Expires in ${days} days`
                                        : `✅ Valid until ${new Date(doc.expiryDate).toLocaleDateString()}`}
                                    </p>
                                    <button onClick={() => setEditingExpiry(key)} style={{ fontSize: 11, padding: '2px 7px', borderRadius: 5, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>Edit</button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setEditingExpiry(key)}
                                    style={{ fontSize: 12, padding: '3px 10px', borderRadius: 5, border: '1px dashed var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                  >
                                    + Set expiry date
                                  </button>
                                )}
                              </div>
                            )}

                            <div className="driver-doc-actions" style={{ marginTop: 8 }}>
                              <button className="doc-action-btn open" onClick={() => openDoc(selectedDriver?.id, doc)}>View</button>
                              {!readOnly && (
                                <button className="doc-action-btn delete" onClick={() => handleDeleteDoc(key as 'cdl' | 'medicalCard' | 'workingContract')}>Delete</button>
                              )}
                            </div>
                          </div>
                        ) : key === 'workingContract' ? (
                          <div className="driver-doc-empty">
                            <p style={{ marginBottom: '6px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}><Emoji symbol="⏳" size={14} /> Pending signature &amp; scan</p>
                            <button className="upload-doc-btn" disabled={uploading} onClick={() => ref.current?.click()} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                              {uploading ? <><Emoji symbol="⏳" size={13} /> Uploading...</> : <><Emoji symbol="📤" size={13} /> Upload Signed Contract</>}
                            </button>
                          </div>
                        ) : (
                          <div className="driver-doc-empty">
                            <p style={{ marginBottom: 8 }}>No {label} uploaded</p>
                            {!readOnly && (
                              <>
                                {hasExpiry && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                    <label style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Expiry:</label>
                                    <input type="date" value={key === 'cdl' ? cdlExpiry : medExpiry} onChange={e => key === 'cdl' ? setCdlExpiry(e.target.value) : setMedExpiry(e.target.value)} style={{ fontSize: 12, padding: '3px 7px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', colorScheme: dateScheme }} />
                                  </div>
                                )}
                                <button className="upload-doc-btn" disabled={uploading} onClick={() => ref.current?.click()} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                  {uploading ? <><Emoji symbol="⏳" size={13} /> Uploading...</> : <><Emoji symbol="📤" size={13} /> Upload {label}</>}
                                </button>
                              </>
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
      )}

      {fireConfirmDriver && (
        <div className="modal-overlay" onClick={() => setFireConfirmDriver(null)}>
          <div className="modal-content" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Terminate Driver</h2><button className="close-btn" onClick={() => setFireConfirmDriver(null)}>✕</button></div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <AlertTriangle size={26} color="#ef4444" />
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Terminate {fireConfirmDriver.name}?</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  This will permanently remove them from the drivers list and delete all stored documents and salary statements. This action cannot be undone.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'center' }}>
                <button onClick={() => setFireConfirmDriver(null)} style={{ padding: '9px 24px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>Cancel</button>
                <button onClick={handleFireDriver} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
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