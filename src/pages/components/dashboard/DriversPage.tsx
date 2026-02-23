import { useState, useMemo, useRef } from 'react';
import { Driver, DocFile } from '../../types/dashboard';
import { companyDriversData } from '../../data/driversData';
import { useSettings, fmtDate } from '../../contexts/SettingsContext';

interface DriverDocuments {
  cdl: DocFile | null;
  medicalCard: DocFile | null;
  workingContract: DocFile | null;
}

export default function DriversPage() {
  const { settings } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [driverDocuments, setDriverDocuments] = useState<Record<number, DriverDocuments>>({});
  const cdlInputRef      = useRef<HTMLInputElement>(null);
  const medicalInputRef  = useRef<HTMLInputElement>(null);
  const contractInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => companyDriversData.filter(d => {
    const q = searchQuery.toLowerCase();
    return d.firstName.toLowerCase().includes(q) || d.lastName.toLowerCase().includes(q) || d.name.toLowerCase().includes(q);
  }), [searchQuery]);

  const readyCount    = companyDriversData.filter(d => d.driverStatus === 'Ready').length;
  const notReadyCount = companyDriversData.filter(d => d.driverStatus === 'Not Ready').length;

  const handleFileUpload = (type: 'cdl' | 'medicalCard' | 'workingContract', file: File) => {
    if (!selectedDriver) return;
    if (!file.type.includes('pdf')) { alert('Please upload PDF files only'); return; }
    const newDoc: DocFile = {
      id: Date.now(), name: file.name, type: 'PDF',
      uploadDate: fmtDate(new Date(), settings.dateFormat),
      size: formatFileSize(file.size),
    };
    setDriverDocuments(prev => ({
      ...prev,
      [selectedDriver.id]: { ...(prev[selectedDriver.id] || { cdl: null, medicalCard: null, workingContract: null }), [type]: newDoc }
    }));
    alert(`✅ ${getDocumentLabel(type)} uploaded successfully!`);
  };

  const handleDeleteDocument = (type: 'cdl' | 'medicalCard' | 'workingContract') => {
    if (!selectedDriver) return;
    if (window.confirm(`Delete ${getDocumentLabel(type)}? This action cannot be undone.`)) {
      setDriverDocuments(prev => ({
        ...prev,
        [selectedDriver.id]: { ...(prev[selectedDriver.id] || { cdl: null, medicalCard: null, workingContract: null }), [type]: null }
      }));
    }
  };

  const formatFileSize = (b: number) =>
    b < 1024 ? b + ' B' : b < 1024*1024 ? (b/1024).toFixed(1)+' KB' : (b/1024/1024).toFixed(1)+' MB';

  const getDocumentLabel = (type: string) =>
    ({ cdl: 'CDL Certificate', medicalCard: 'Medical Card', workingContract: 'Working Contract' }[type] ?? 'Document');

  const currentDocs = selectedDriver
    ? (driverDocuments[selectedDriver.id] || { cdl: null, medicalCard: null, workingContract: null })
    : { cdl: null, medicalCard: null, workingContract: null };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Drivers</h1>
        <p className="page-subtitle">Manage your company drivers</p>
        <div className="stats-row">
          <div className="stat-item"><div className="stat-value">{companyDriversData.length}</div><div className="stat-label">Total Drivers</div></div>
          <div className="stat-item"><div className="stat-value">{readyCount}</div><div className="stat-label">Ready</div></div>
          <div className="stat-item"><div className="stat-value">{notReadyCount}</div><div className="stat-label">Not Ready</div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2 className="card-title">Overview</h2></div>
        <div className="recruiting-stats">
          <span className="stat-badge">{companyDriversData.length} Total Workers</span>
          <span className="stat-badge">{readyCount} Ready</span>
          <span className="stat-badge">{notReadyCount} Not Ready</span>
        </div>
        <div className="search-bar">
          <span>🔍</span>
          <input type="text" placeholder="Search by name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="table-header drivers-cols">
          <span>Driver</span><span>Position</span><span>Equipment</span><span>Status</span><span>Date</span><span>Action</span>
        </div>
        <div className="table-body">
          {filtered.length > 0 ? filtered.map(d => (
            <div key={d.id} className="table-row drivers-cols">
              <span className="cell-name"><span className="row-avatar">👤</span>{d.name}</span>
              <span className="cell" data-label="Position">{d.position}</span>
              <span className="cell" data-label="Equipment"><span className="equip-badge">{d.equipment}</span></span>
              <span className="cell" data-label="Status">
                <span className={`status-badge status-driver-${d.driverStatus?.toLowerCase().replace(' ', '-')}`}>{d.driverStatus}</span>
              </span>
              <span className="cell" data-label="Date">{fmtDate(d.date, settings.dateFormat)}</span>
              <span className="cell" data-label="Action">
                <button className="view-btn" onClick={() => setSelectedDriver(d)}>View Details</button>
              </span>
            </div>
          )) : <div className="no-results">No drivers found</div>}
        </div>
      </div>

      {/* Hidden file inputs */}
      <input ref={cdlInputRef} type="file" accept=".pdf,application/pdf" onChange={e => e.target.files?.[0] && handleFileUpload('cdl', e.target.files[0])} style={{ display: 'none' }} />
      <input ref={medicalInputRef} type="file" accept=".pdf,application/pdf" onChange={e => e.target.files?.[0] && handleFileUpload('medicalCard', e.target.files[0])} style={{ display: 'none' }} />
      <input ref={contractInputRef} type="file" accept=".pdf,application/pdf" onChange={e => e.target.files?.[0] && handleFileUpload('workingContract', e.target.files[0])} style={{ display: 'none' }} />

      {selectedDriver && (
        <div className="modal-overlay" onClick={() => setSelectedDriver(null)}>
          <div className="modal-content modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedDriver.name} — Documents</h2>
              <button className="close-btn" onClick={() => setSelectedDriver(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h3>Driver Information</h3>
                <div className="info-grid">
                  <div className="info-item"><span className="info-label">Position</span><span className="info-value">{selectedDriver.position}</span></div>
                  <div className="info-item"><span className="info-label">Equipment</span><span className="info-value"><span className="equip-badge">{selectedDriver.equipment}</span></span></div>
                  <div className="info-item"><span className="info-label">Status</span><span className="info-value"><span className={`status-badge status-driver-${selectedDriver.driverStatus?.toLowerCase().replace(' ', '-')}`}>{selectedDriver.driverStatus}</span></span></div>
                  <div className="info-item"><span className="info-label">Hired Date</span><span className="info-value">{fmtDate(selectedDriver.date, settings.dateFormat)}</span></div>
                </div>
              </div>
              <div className="modal-section">
                <div className="modal-section-header"><h3>Required Documents</h3></div>
                <div className="driver-documents-grid">
                  {[
                    { key: 'cdl' as const, icon: '📄', label: 'CDL Certificate', ref: cdlInputRef, doc: currentDocs.cdl },
                    { key: 'medicalCard' as const, icon: '🏥', label: 'Medical Card', ref: medicalInputRef, doc: currentDocs.medicalCard },
                    { key: 'workingContract' as const, icon: '📝', label: 'Working Contract', ref: contractInputRef, doc: currentDocs.workingContract },
                  ].map(({ key, icon, label, ref, doc }) => (
                    <div key={key} className="driver-doc-card">
                      <div className="driver-doc-header"><div className="driver-doc-icon">{icon}</div><h4>{label}</h4></div>
                      {doc ? (
                        <div className="driver-doc-info">
                          <p className="driver-doc-name">{doc.name}</p>
                          <p className="driver-doc-meta">{doc.size} · {fmtDate(doc.uploadDate, settings.dateFormat)}</p>
                          <div className="driver-doc-actions">
                            <button className="doc-action-btn open">View</button>
                            <button className="doc-action-btn delete" onClick={() => handleDeleteDocument(key)}>Delete</button>
                          </div>
                        </div>
                      ) : (
                        <div className="driver-doc-empty">
                          <p>No {label} uploaded</p>
                          <button className="upload-doc-btn" onClick={() => ref.current?.click()}>📤 Upload {label}</button>
                        </div>
                      )}
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
