import { useState, useMemo } from 'react';
import { Driver, DocFile } from '../../types/dashboard';
import { allApplicantsData, defaultDocuments } from '../../data/driversData';

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery]     = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [driverDocs, setDriverDocs]       = useState<DocFile[]>([]);

  const driversWithDocs = useMemo(() => allApplicantsData.map(d => ({
    ...d,
    documents: defaultDocuments.map(doc => ({ ...doc })) as DocFile[],
  })), []);

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
    setDriverDocs([...driver.documents]);
  };

  const handleDelete = (docId: number) => {
    if (window.confirm('Delete this document?')) {
      setDriverDocs(prev => prev.filter(d => d.id !== docId));
    }
  };

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
              <button className="open-btn" onClick={() => handleOpen(d)}>Open</button>
            </div>
          )) : <div className="no-results">No drivers found</div>}
        </div>
      </div>

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
                  <h3>Documents</h3>
                  <button className="add-document-btn">➕ Add Document</button>
                </div>
                <div className="documents-list">
                  {driverDocs.length > 0 ? driverDocs.map(doc => (
                    <div key={doc.id} className="document-item">
                      <div className="document-icon">📄</div>
                      <div className="document-info">
                        <h4>{doc.name}</h4>
                        <p>{doc.type} · {doc.size} · {doc.uploadDate}</p>
                      </div>
                      <div className="document-actions">
                        <button className="doc-action-btn open">Open</button>
                        <button className="doc-action-btn delete" onClick={() => handleDelete(doc.id)}>Delete</button>
                      </div>
                    </div>
                  )) : <p className="no-documents">No documents uploaded yet</p>}
                </div>
              </div>

              

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
