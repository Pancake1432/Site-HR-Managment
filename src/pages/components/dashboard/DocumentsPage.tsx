import { useState, useMemo, useRef } from 'react';
import { Driver, DocFile } from '../../types/dashboard';
import { allApplicantsData } from '../../data/driversData';

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  
  // Store documents per driver in state (each driver starts with NO documents)
  const [driverDocuments, setDriverDocuments] = useState<Record<number, DocFile[]>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Map drivers with their documents (empty by default)
  const driversWithDocs = useMemo(() => allApplicantsData.map(d => ({
    ...d,
    documents: driverDocuments[d.id] || [], // Empty array if no documents uploaded
  })), [driverDocuments]);

  const filtered = useMemo(() => driversWithDocs.filter(d => {
    const q = searchQuery.toLowerCase();
    return (
      d.firstName.toLowerCase().includes(q) ||
      d.lastName.toLowerCase().includes(q) ||
      d.name.toLowerCase().includes(q)
    );
  }), [searchQuery, driversWithDocs]);

  const handleOpen = (driver: typeof driversWithDocs[0]) => {
    setSelectedDriver(driver);
  };

  const handleAddDocument = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDriver) return;

    // Only allow PDFs
    if (!file.type.includes('pdf')) {
      alert('Please upload PDF files only');
      return;
    }

    // Create a new document entry
    const newDoc: DocFile = {
      id: Date.now(), // Unique ID
      name: file.name,
      type: 'PDF',
      uploadDate: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      size: formatFileSize(file.size),
    };

    // Add document to this driver's collection
    setDriverDocuments(prev => ({
      ...prev,
      [selectedDriver.id]: [...(prev[selectedDriver.id] || []), newDoc]
    }));

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    console.log('✅ Document uploaded:', newDoc);
    alert(`✅ Document "${file.name}" uploaded successfully!`);
  };

  const handleDelete = (docId: number) => {
    if (!selectedDriver) return;
    
    if (window.confirm('Delete this document? This action cannot be undone.')) {
      setDriverDocuments(prev => ({
        ...prev,
        [selectedDriver.id]: (prev[selectedDriver.id] || []).filter(d => d.id !== docId)
      }));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

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
                    <p>{d.position} · {d.equipment}</p>
                  </div>
                </div>
                <div className="document-card-stats">
                  <span>{d.documents.length} Documents</span>
                </div>
              </div>
              <button className="open-btn" onClick={() => handleOpen(d)}>Open</button>
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
        <div className="modal-overlay" onClick={() => setSelectedDriver(null)}>
          <div className="modal-content modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedDriver.name} — Documents</h2>
              <button className="close-btn" onClick={() => setSelectedDriver(null)}>✕</button>
            </div>
            <div className="modal-body">

              {/* Documents list */}
              <div className="modal-section">
                <div className="modal-section-header">
                  <h3>Documents ({currentDriverDocs.length})</h3>
                  <button className="add-document-btn" onClick={handleAddDocument}>
                    ➕ Add Document
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
                        <button className="doc-action-btn open">Open</button>
                        <button className="doc-action-btn delete" onClick={() => handleDelete(doc.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="no-documents">
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>📂</div>
                      <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>No documents uploaded yet</p>
                      <p style={{ fontSize: '14px', color: '#718096' }}>
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
