import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Driver } from '../../types/dashboard';
import { useCompanyData } from '../../hooks/useCompanyData';
import { useDriverDocStorage } from '../../hooks/useDriverDocStorage';
import { useLocalOverrides } from '../../hooks/useLocalOverrides';
import { useSettings, fmtDate } from '../../contexts/SettingsContext';

export default function DriversPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { companyDrivers } = useCompanyData();
  const { getDriverDocs, uploadDoc, deleteDoc, openDoc } = useDriverDocStorage();
  const { applyOverrides, saveOverride } = useLocalOverrides();

  const [searchQuery, setSearchQuery]     = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isUploading, setIsUploading]     = useState<string | null>(null); // key of uploading doc

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
    // Update selected if modal is open
    if (selectedDriver?.id === driver.id) {
      setSelectedDriver(prev => prev ? { ...prev, driverStatus: next } : prev);
    }
  };

  const getDocLabel = (type: string) =>
    ({ cdl: 'CDL Certificate', medicalCard: 'Medical Card', workingContract: 'Working Contract' }[type] ?? 'Document');

  const docDefs = [
    { key: 'cdl' as const,             icon: '📄', label: 'CDL Certificate',  ref: cdlInputRef      },
    { key: 'medicalCard' as const,     icon: '🏥', label: 'Medical Card',     ref: medicalInputRef  },
    { key: 'workingContract' as const, icon: '📝', label: 'Working Contract', ref: contractInputRef },
  ];

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
        <div className="card-header"><h2 className="card-title">Overview</h2></div>
        <div className="recruiting-stats">
          <span className="stat-badge">{drivers.length} Total Workers</span>
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
              <span className="cell" data-label="Action">
                <button className="view-btn" onClick={() => navigate(`/dashboard/drivers/${d.id}`)}>View Details</button>
              </span>
            </div>
          )) : <div className="no-results">No drivers found</div>}
        </div>
      </div>

      {/* Hidden file inputs */}
      <input ref={cdlInputRef}      type="file" accept=".pdf,application/pdf" onChange={e => handleFileChange('cdl',             e.target.files?.[0])} style={{ display: 'none' }} />
      <input ref={medicalInputRef}  type="file" accept=".pdf,application/pdf" onChange={e => handleFileChange('medicalCard',     e.target.files?.[0])} style={{ display: 'none' }} />
      <input ref={contractInputRef} type="file" accept=".pdf,application/pdf" onChange={e => handleFileChange('workingContract', e.target.files?.[0])} style={{ display: 'none' }} />

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
                    {docDefs.map(({ key, icon, label, ref }) => {
                      const doc = docs[key];
                      const uploading = isUploading === key;
                      return (
                        <div key={key} className="driver-doc-card">
                          <div className="driver-doc-header"><div className="driver-doc-icon">{icon}</div><h4>{label}</h4></div>
                          {doc ? (
                            <div className="driver-doc-info">
                              <p className="driver-doc-name">{doc.name}</p>
                              <p className="driver-doc-meta">{doc.size} · {doc.uploadDate}</p>
                              <div className="driver-doc-actions">
                                <button className="doc-action-btn open"   onClick={() => openDoc(doc)}>View</button>
                                <button className="doc-action-btn delete" onClick={() => handleDeleteDoc(key)}>Delete</button>
                              </div>
                            </div>
                          ) : (
                            <div className="driver-doc-empty">
                              <p>No {label} uploaded</p>
                              <button className="upload-doc-btn" disabled={uploading} onClick={() => ref.current?.click()}>
                                {uploading ? '⏳ Uploading...' : `📤 Upload ${label}`}
                              </button>
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
    </div>
  );
}
