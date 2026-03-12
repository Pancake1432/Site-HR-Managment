import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Driver, EquipmentType, StatusType } from '../../types/dashboard';
import { useCompanyData } from '../../hooks/useCompanyData';
import { useDriverDocStorage, DriverDocSet } from '../../hooks/useDriverDocStorage';
import { deleteApplicant, saveApplicantOverride, hireApplicant } from '../../services/applicationSubmitService';
import EquipmentDropdown from './EquipmentDropdown';
import StatusDropdown from './StatusDropdown';
import { Emoji } from '../Emoji';

/** Count how many of the 3 required slots are filled */
function filledDocCount(docs: DriverDocSet): number {
  return [docs.cdl, docs.medicalCard, docs.applicationPdf].filter(Boolean).length;
}

/** CDL + Medical Card required; Application PDF is optional */
function canHireDocs(docs: DriverDocSet): boolean {
  return !!(docs.cdl && docs.medicalCard);
}

export default function DocumentsPage() {
  const { applicants: allApplicantsData, refresh } = useCompanyData();
  const { getDriverDocs, uploadDoc, deleteDoc, openDoc } = useDriverDocStorage();

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [hireHovered, setHireHovered] = useState(false);
  const [deleteHovered, setDeleteHovered] = useState(false);

  const cdlInputRef     = useRef<HTMLInputElement>(null);
  const medInputRef     = useRef<HTMLInputElement>(null);

  // Auto-open modal when :id is in the URL
  useEffect(() => {
    if (id) {
      const driver = allApplicantsData.find(d => d.id === Number(id));
      if (driver) setSelectedDriver(driver);
    } else {
      setSelectedDriver(null);
    }
  }, [id, allApplicantsData]);

  const filtered = useMemo(() => allApplicantsData.filter(d => {
    const q = searchQuery.toLowerCase();
    return (
      d.firstName.toLowerCase().includes(q) ||
      d.lastName.toLowerCase().includes(q) ||
      d.name.toLowerCase().includes(q)
    );
  }), [searchQuery, allApplicantsData]);

  const handleOpen = (driver: Driver) => navigate(`/dashboard/documents/${driver.id}`);
  const handleClose = () => navigate('/dashboard/documents');

  const handleUpload = async (
    type: 'cdl' | 'medicalCard',
    file: File | undefined,
  ) => {
    if (!file || !selectedDriver) return;
    setIsUploading(type);
    try {
      await uploadDoc(
        selectedDriver.id,
        type,
        file,
        new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : '❌ Upload failed.');
    } finally {
      setIsUploading(null);
      if (cdlInputRef.current) cdlInputRef.current.value = '';
      if (medInputRef.current) medInputRef.current.value = '';
    }
  };

  const handleDelete = (type: 'cdl' | 'medicalCard') => {
    if (!selectedDriver) return;
    const label = type === 'cdl' ? 'CDL' : 'Medical Card';
    if (window.confirm(`Delete ${label}? This cannot be undone.`)) {
      deleteDoc(selectedDriver.id, type);
    }
  };

  const handleDeleteDriver = useCallback(() => {
    if (!selectedDriver) return;
    if (window.confirm(`Delete ${selectedDriver.name} and all their documents?\n\nThis cannot be undone.`)) {
      deleteApplicant(selectedDriver.id);
      navigate('/dashboard/documents');
      refresh();
    }
  }, [selectedDriver, navigate, refresh]);

  const handleEquipmentChange = useCallback((driverId: number, equipment: EquipmentType) => {
    saveApplicantOverride(driverId, { equipment });
    if (selectedDriver?.id === driverId) setSelectedDriver(prev => prev ? { ...prev, equipment } : prev);
    refresh();
  }, [refresh, selectedDriver]);

  const handleStatusChange = useCallback((driverId: number, status: StatusType) => {
    saveApplicantOverride(driverId, { status });
    if (selectedDriver?.id === driverId) setSelectedDriver(prev => prev ? { ...prev, status } : prev);
    refresh();
  }, [refresh, selectedDriver]);

  const handleHire = useCallback(() => {
    if (!selectedDriver) return;
    const docs = getDriverDocs(selectedDriver.id);
    if (window.confirm(`Hire ${selectedDriver.name}?\n\nThey will be moved to the Drivers section.`)) {
      hireApplicant(selectedDriver, docs);
      navigate('/dashboard/documents');
      refresh();
    }
  }, [selectedDriver, getDriverDocs, navigate, refresh]);

  // ── Slot definitions (3 required for applicants) ──
  const slotDefs = [
    { key: 'applicationPdf' as const, icon: '📋', label: 'Application (Form)', readOnly: true  },
    { key: 'cdl'            as const, icon: '📄', label: 'CDL',                readOnly: false, ref: cdlInputRef },
    { key: 'medicalCard'    as const, icon: '🏥', label: 'Medical Card',        readOnly: false, ref: medInputRef },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Documents</h1>
        <p className="page-subtitle">Manage applicant documents</p>
      </div>

      <div className="card">
        <div className="search-bar">
          <span><Emoji symbol="🔍" size={16} /></span>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="documents-grid">
          {filtered.length > 0 ? filtered.map(d => {
            const docs = getDriverDocs(d.id);
            const count = filledDocCount(docs);
            return (
              <div key={d.id} className="document-card">
                <div className="document-card-content">
                  <div className="document-card-header">
                    <div className="candidate-avatar"><Emoji symbol="👤" size={22} /></div>
                    <div className="document-card-info">
                      <h3>{d.name}</h3>
                      <p>{d.position}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', margin: '8px 0', flexWrap: 'wrap' }}>
                    <StatusDropdown value={d.status} onChange={s => handleStatusChange(d.id, s)} />
                    <EquipmentDropdown value={d.equipment} onChange={eq => handleEquipmentChange(d.id, eq)} />
                  </div>
                  <div className="document-card-stats" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: docs.applicationPdf ? '#c6f6d5' : '#edf2f7', color: docs.applicationPdf ? '#276749' : '#718096' }}>
                      Form {docs.applicationPdf ? '✓' : '–'}
                    </span>
                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: docs.cdl ? '#c6f6d5' : '#fed7d7', color: docs.cdl ? '#276749' : '#9b2c2c' }}>
                      CDL {docs.cdl ? '✓' : '✗'}
                    </span>
                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: docs.medicalCard ? '#c6f6d5' : '#fed7d7', color: docs.medicalCard ? '#276749' : '#9b2c2c' }}>
                      Medical {docs.medicalCard ? '✓' : '✗'}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>{count}/3 documents</p>
                </div>
                <button className="open-btn" onClick={() => handleOpen(d)}>Open</button>
              </div>
            );
          }) : <div className="no-results">No applicants found</div>}
        </div>
      </div>

      {/* Hidden file inputs */}
      <input ref={cdlInputRef} type="file" accept=".pdf,application/pdf" onChange={e => handleUpload('cdl', e.target.files?.[0])} style={{ display: 'none' }} />
      <input ref={medInputRef} type="file" accept=".pdf,application/pdf" onChange={e => handleUpload('medicalCard', e.target.files?.[0])} style={{ display: 'none' }} />

      {/* ── DOCUMENT MODAL ── */}
      {selectedDriver && (() => {
        const docs = getDriverDocs(selectedDriver.id);
        const canHire = selectedDriver.equipment !== 'Unsigned'
          && selectedDriver.status === 'Applied'
          && canHireDocs(docs);

        return (
          <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content modal-xl" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedDriver.name} — Documents</h2>
                <button className="close-btn" onClick={handleClose}>✕</button>
              </div>
              <div className="modal-body">

                {/* Driver info */}
                <div className="modal-section">
                  <h3>Applicant Information</h3>
                  <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                    <div className="info-item">
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary, #718096)' }}>Position</span>
                      <span style={{ fontWeight: 500 }}>{selectedDriver.position}</span>
                    </div>
                    <div className="info-item">
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary, #718096)', marginBottom: '4px', display: 'block' }}>Status</span>
                      <StatusDropdown value={selectedDriver.status} onChange={s => handleStatusChange(selectedDriver.id, s)} />
                    </div>
                    <div className="info-item">
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary, #718096)', marginBottom: '4px', display: 'block' }}>Equipment</span>
                      <EquipmentDropdown value={selectedDriver.equipment} onChange={eq => handleEquipmentChange(selectedDriver.id, eq)} />
                    </div>
                    <div className="info-item">
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary, #718096)' }}>Date</span>
                      <span style={{ fontWeight: 500 }}>{selectedDriver.date}</span>
                    </div>
                  </div>
                </div>

                {/* 3 typed document slots */}
                <div className="modal-section">
                  <div className="modal-section-header">
                    <h3>Documents ({filledDocCount(docs)}/3)</h3>
                  </div>
                  <div className="driver-documents-grid">
                    {slotDefs.map(({ key, icon, label, readOnly, ref }) => {
                      const doc = docs[key];
                      const uploading = isUploading === key;
                      return (
                        <div key={key} className="driver-doc-card">
                          <div className="driver-doc-header">
                            <div className="driver-doc-icon"><Emoji symbol={icon} size={20} /></div>
                            <h4>{label}</h4>
                          </div>
                          {doc ? (
                            <div className="driver-doc-info">
                              <p className="driver-doc-name">{doc.name}</p>
                              <p className="driver-doc-meta">{doc.size} · {doc.uploadDate}</p>
                              <div className="driver-doc-actions">
                                <button className="doc-action-btn open" onClick={() => openDoc(doc)}>View</button>
                                {!readOnly && (
                                  <button className="doc-action-btn delete" onClick={() => handleDelete(key as 'cdl' | 'medicalCard')}>Delete</button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="driver-doc-empty">
                              {readOnly ? (
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                  Auto-filled when applicant submits the form
                                </p>
                              ) : (
                                <>
                                  <p>No {label} uploaded</p>
                                  <button
                                    className="upload-doc-btn"
                                    disabled={!!uploading}
                                    onClick={() => ref?.current?.click()}
                                  >
                                    {uploading ? <><Emoji symbol="⏳" size={14} /> Uploading...</> : <><Emoji symbol="📤" size={14} /> Upload {label}</>}
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

                {/* Action buttons */}
                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {canHire && (
                    <button
                      onClick={handleHire}
                      onMouseEnter={() => setHireHovered(true)}
                      onMouseLeave={() => setHireHovered(false)}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', boxShadow: hireHovered ? '0 4px 16px rgba(72, 187, 120, 0.4)' : '0 2px 8px rgba(72, 187, 120, 0.3)', transform: hireHovered ? 'translateY(-1px)' : 'translateY(0)' }}
                    >
                      <Emoji symbol="✅" size={16} style={{ marginRight: 6 }} /> Hired — Move to Drivers
                    </button>
                  )}
                  {!canHire && (
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                      {!canHireDocs(docs)
                        ? `⚠️ Upload CDL and Medical Card to enable hiring`
                        : selectedDriver.equipment === 'Unsigned'
                        ? '⚠️ Assign equipment before hiring'
                        : '⚠️ Status must be "Applied" to hire'}
                    </p>
                  )}
                  <button
                    onClick={handleDeleteDriver}
                    onMouseEnter={() => setDeleteHovered(true)}
                    onMouseLeave={() => setDeleteHovered(false)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e53e3e', background: deleteHovered ? '#e53e3e' : 'transparent', color: deleteHovered ? 'white' : '#e53e3e', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
                  >
                    🗑️ Delete Applicant & All Documents
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}