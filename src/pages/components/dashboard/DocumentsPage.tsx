import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Driver, EquipmentType } from '../../types/dashboard';
import { useCompanyData } from '../../hooks/useCompanyData';
import { useDocumentStorage } from '../../hooks/useDocumentStorage';
import { deleteApplicant, saveApplicantOverride } from '../../services/applicationSubmitService';
import EquipmentDropdown from './EquipmentDropdown';

export default function DocumentsPage() {
  const { applicants: allApplicantsData, refresh } = useCompanyData();
  const { driverDocuments, addDocument, removeDocument, openDocument, downloadDocument } = useDocumentStorage();

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Merge persisted documents into each driver
  const driversWithDocs = useMemo(() => allApplicantsData.map(d => ({
    ...d,
    documents: driverDocuments[d.id] || [],
  })), [allApplicantsData, driverDocuments]);

  // Auto-open modal when :id is in the URL
  useEffect(() => {
    if (id) {
      const driver = driversWithDocs.find(d => d.id === Number(id));
      if (driver) setSelectedDriver(driver);
    } else {
      setSelectedDriver(null);
    }
  }, [id, driversWithDocs]);

  const filtered = useMemo(() => driversWithDocs.filter(d => {
    const q = searchQuery.toLowerCase();
    return (
      d.firstName.toLowerCase().includes(q) ||
      d.lastName.toLowerCase().includes(q) ||
      d.name.toLowerCase().includes(q)
    );
  }), [searchQuery, driversWithDocs]);

  const handleOpen = (driver: typeof driversWithDocs[0]) => {
    navigate(`/dashboard/documents/${driver.id}`);
  };

  const handleClose = () => navigate('/dashboard/documents');

  const handleAddDocument = () => fileInputRef.current?.click();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDriver) return;

    if (!file.type.includes('pdf')) {
      alert('Please upload PDF files only');
      return;
    }

    setIsUploading(true);
    try {
      await addDocument(selectedDriver.id, file);
      alert(`✅ "${file.name}" uploaded and saved successfully!`);
    } catch {
      alert('❌ Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteDoc = (docId: number) => {
    if (!selectedDriver) return;
    if (window.confirm('Delete this document? This cannot be undone.')) {
      removeDocument(selectedDriver.id, docId);
    }
  };

  const handleDeleteDriver = useCallback((e: React.MouseEvent, driver: Driver) => {
    e.stopPropagation();
    if (window.confirm(`Delete ${driver.name} and all their documents?\n\nThis cannot be undone.`)) {
      deleteApplicant(driver.id);
      if (selectedDriver?.id === driver.id) {
        navigate('/dashboard/documents');
      }
      refresh();
    }
  }, [selectedDriver, navigate, refresh]);

  const handleEquipmentChange = useCallback((driverId: number, equipment: EquipmentType) => {
    saveApplicantOverride(driverId, { equipment });
    // Also update selectedDriver if the modal is open for this driver
    if (selectedDriver?.id === driverId) {
      setSelectedDriver(prev => prev ? { ...prev, equipment } : prev);
    }
    refresh();
  }, [refresh, selectedDriver]);

  const currentDriverDocs = selectedDriver ? (driverDocuments[selectedDriver.id] || []) : [];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Documents</h1>
        <p className="page-subtitle">Manage driver documents</p>
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

        <div className="documents-grid">
          {filtered.length > 0 ? filtered.map(d => (
            <div key={d.id} className="document-card">
              <div className="document-card-content">
                <div className="document-card-header">
                  <div className="candidate-avatar">👤</div>
                  <div className="document-card-info">
                    <h3>{d.name}</h3>
                    <p>{d.position}</p>
                  </div>
                </div>
                <div style={{ margin: '8px 0' }}>
                  <EquipmentDropdown
                    value={d.equipment}
                    onChange={(eq) => handleEquipmentChange(d.id, eq)}
                  />
                </div>
                <div className="document-card-stats">
                  <span>{d.documents.length} Documents</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="open-btn" onClick={() => handleOpen(d)}>Open</button>
                <button
                  className="open-btn"
                  style={{ background: '#e53e3e', color: 'white' }}
                  onClick={(e) => handleDeleteDriver(e, d)}
                >
                  Delete
                </button>
              </div>
            </div>
          )) : <div className="no-results">No drivers found</div>}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {/* ── DOCUMENT MODAL ── */}
      {selectedDriver && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedDriver.name} — Documents</h2>
              <button className="close-btn" onClick={handleClose}>✕</button>
            </div>
            <div className="modal-body">
              {/* Driver info with editable equipment */}
              <div className="modal-section">
                <h3>Driver Information</h3>
                <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                  <div className="info-item">
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary, #718096)' }}>Position</span>
                    <span style={{ fontWeight: 500 }}>{selectedDriver.position}</span>
                  </div>
                  <div className="info-item">
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary, #718096)' }}>Status</span>
                    <span className={`status-badge status-${selectedDriver.status.toLowerCase().replace(' ', '-')}`}>
                      {selectedDriver.status}
                    </span>
                  </div>
                  <div className="info-item">
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary, #718096)', marginBottom: '4px', display: 'block' }}>Equipment</span>
                    <EquipmentDropdown
                      value={selectedDriver.equipment}
                      onChange={(eq) => handleEquipmentChange(selectedDriver.id, eq)}
                    />
                  </div>
                  <div className="info-item">
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary, #718096)' }}>Date</span>
                    <span style={{ fontWeight: 500 }}>{selectedDriver.date}</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <div className="modal-section-header">
                  <h3>Documents ({currentDriverDocs.length})</h3>
                  <button
                    className="add-document-btn"
                    onClick={handleAddDocument}
                    disabled={isUploading}
                  >
                    {isUploading ? '⏳ Uploading...' : '➕ Add Document'}
                  </button>
                </div>

                <div className="documents-list">
                  {currentDriverDocs.length > 0 ? currentDriverDocs.map(doc => (
                    <div key={doc.id} className="document-item">
                      <div className="document-icon">📄</div>
                      <div className="document-info">
                        <h4>{doc.name}</h4>
                        <p>{doc.type} · {doc.size} · {doc.uploadDate}</p>
                      </div>
                      <div className="document-actions">
                        <button
                          className="doc-action-btn open"
                          onClick={() => openDocument(doc)}
                        >
                          Open
                        </button>
                        <button
                          className="doc-action-btn open"
                          onClick={() => downloadDocument(doc)}
                        >
                          Download
                        </button>
                        <button
                          className="doc-action-btn delete"
                          onClick={() => handleDeleteDoc(doc.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="no-documents">
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>📂</div>
                      <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                        No documents uploaded yet
                      </p>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        Click "Add Document" above to upload PDFs for {selectedDriver.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
