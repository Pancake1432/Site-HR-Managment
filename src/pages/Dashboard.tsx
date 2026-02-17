import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

type PageType = 'dashboard' | 'drivers' | 'documents' | 'statements' | 'salary' | 'employers';
type StatusType = 'Applied' | 'Contacted' | 'Documents Sent';
type DriverStatusType = 'Ready' | 'Not Ready';
type PaymentType = 'miles' | 'percent';
type EmploymentStatus = 'Working' | 'Fired';

interface Driver {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  position: string;
  status: StatusType;
  date: string;
  isEmployee?: boolean;
  documents?: Document[];
  driverStatus?: DriverStatusType;
  paymentType?: PaymentType;
  employmentStatus?: EmploymentStatus;
  statements?: Statement[];
}

interface Document {
  id: number;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
}

interface Statement {
  id: number;
  date: string;
  amount: string;
  type: string;
}

interface StatementData {
  driverId: number | null;
  driverName: string;
  paymentType: PaymentType;
  miles: string;
  ratePerMile: string;
  percent: string;
  grossAmount: string;
  adjustmentType: 'bonus' | 'deduction';
  adjustmentAmount: string;
  adjustmentReason: string;
}

// Shared data - Company Drivers
const companyDriversData: Driver[] = [
  { id: 1, name: 'John Smith', firstName: 'John', lastName: 'Smith', position: 'Owner Operator', status: 'Applied', date: '01/15/2024', isEmployee: true, driverStatus: 'Ready' },
  { id: 2, name: 'Maria Garcia', firstName: 'Maria', lastName: 'Garcia', position: 'Company Driver', status: 'Contacted', date: '01/18/2024', isEmployee: true, driverStatus: 'Not Ready' },
  { id: 3, name: 'James Wilson', firstName: 'James', lastName: 'Wilson', position: 'Van Driver', status: 'Documents Sent', date: '01/20/2024', isEmployee: true, driverStatus: 'Ready' },
  { id: 4, name: 'Patricia Brown', firstName: 'Patricia', lastName: 'Brown', position: 'Reefer Driver', status: 'Applied', date: '01/22/2024', isEmployee: true, driverStatus: 'Ready' },
  { id: 5, name: 'Robert Jones', firstName: 'Robert', lastName: 'Jones', position: 'Flat Bed Driver', status: 'Contacted', date: '01/25/2024', isEmployee: true, driverStatus: 'Not Ready' },
  { id: 6, name: 'Linda Davis', firstName: 'Linda', lastName: 'Davis', position: 'Owner Operator', status: 'Documents Sent', date: '02/01/2024', isEmployee: true, driverStatus: 'Ready' },
  { id: 7, name: 'Michael Miller', firstName: 'Michael', lastName: 'Miller', position: 'Company Driver', status: 'Applied', date: '02/03/2024', isEmployee: true, driverStatus: 'Ready' },
  { id: 8, name: 'Elizabeth Martinez', firstName: 'Elizabeth', lastName: 'Martinez', position: 'Van Driver', status: 'Contacted', date: '02/05/2024', isEmployee: true, driverStatus: 'Not Ready' },
  { id: 9, name: 'William Anderson', firstName: 'William', lastName: 'Anderson', position: 'Owner Operator', status: 'Applied', date: '02/08/2024', isEmployee: true, driverStatus: 'Ready' },
  { id: 10, name: 'Jennifer Taylor', firstName: 'Jennifer', lastName: 'Taylor', position: 'Reefer Driver', status: 'Documents Sent',  date: '02/10/2024', isEmployee: true, driverStatus: 'Ready' },
];

// Shared data - Applicants (DATE ONLY - NO TIME)
const allApplicantsData: Driver[] = [
  { id: 1, name: 'John Doe', firstName: 'John', lastName: 'Doe', position: 'Owner Operator', status: 'Applied', date: '07/22/23' },
  { id: 2, name: 'Jane Smith', firstName: 'Jane', lastName: 'Smith', position: 'Company Driver', status: 'Contacted', date: '07/22/23' },
  { id: 3, name: 'Mike Johnson', firstName: 'Mike', lastName: 'Johnson', position: 'Owner Operator', status: 'Documents Sent', date: '07/22/23' },
  { id: 4, name: 'Sarah Williams', firstName: 'Sarah', lastName: 'Williams', position: 'Van Driver', status: 'Applied', date: '07/23/23' },
  { id: 5, name: 'David Brown', firstName: 'David', lastName: 'Brown', position: 'Reefer Driver', status: 'Contacted', date: '07/23/23' },
  { id: 6, name: 'Emily Davis', firstName: 'Emily', lastName: 'Davis', position: 'Flat Bed Driver', status: 'Documents Sent', date: '07/24/23' },
  { id: 7, name: 'Michael Wilson', firstName: 'Michael', lastName: 'Wilson', position: 'Owner Operator', status: 'Applied', date: '07/24/23' },
  { id: 8, name: 'Jennifer Martinez', firstName: 'Jennifer', lastName: 'Martinez', position: 'Van Driver', status: 'Contacted', date: '07/25/23' },
  { id: 9, name: 'Robert Taylor', firstName: 'Robert', lastName: 'Taylor', position: 'Company Driver', status: 'Applied', date: '07/25/23' },
  { id: 10, name: 'Jessica Anderson', firstName: 'Jessica', lastName: 'Anderson', position: 'Owner Operator', status: 'Documents Sent', date: '07/26/23' },
];

function Dashboard() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState<PageType>('dashboard');
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">🏢</div>
          <span>HR Manager</span>
        </div>

        <nav className="nav-items">
          <div 
            className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActivePage('dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </div>
          <div 
            className={`nav-item ${activePage === 'drivers' ? 'active' : ''}`}
            onClick={() => setActivePage('drivers')}
          >
            <span className="nav-icon">🚗</span>
            <span>Drivers</span>
          </div>
          <div 
            className={`nav-item ${activePage === 'documents' ? 'active' : ''}`}
            onClick={() => setActivePage('documents')}
          >
            <span className="nav-icon">📄</span>
            <span>Documents</span>
          </div>
          <div 
            className={`nav-item ${activePage === 'statements' ? 'active' : ''}`}
            onClick={() => setActivePage('statements')}
          >
            <span className="nav-icon">📋</span>
            <span>Statements</span>
          </div>
          <div 
            className={`nav-item ${activePage === 'salary' ? 'active' : ''}`}
            onClick={() => setActivePage('salary')}
          >
            <span className="nav-icon">💰</span>
            <span>Salary</span>
          </div>
          <div 
            className={`nav-item ${activePage === 'employers' ? 'active' : ''}`}
            onClick={() => setActivePage('employers')}
          >
            <span className="nav-icon">👥</span>
            <span>Employers</span>
          </div>
        </nav>

        <div className="logout" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          <span>Logout</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {activePage === 'dashboard' && <DashboardPage onNavigate={setActivePage} />}
        {activePage === 'drivers' && <DriversPage />}
        {activePage === 'documents' && <DocumentsPage />}
        {activePage === 'statements' && <StatementsPage />}
        {activePage === 'salary' && <SalaryPage />}
        {activePage === 'employers' && <EmployersPage />}
      </main>

      <div className="settings-icon" onClick={() => setShowSettings(true)}>⚙️</div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Settings</h2>
              <button className="close-btn" onClick={() => setShowSettings(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="in-progress">
                <div className="progress-icon">🚧</div>
                <h3>In Progress</h3>
                <p>Settings functionality is currently under development.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Dashboard Page Component
function DashboardPage({ onNavigate }: { onNavigate: (page: PageType) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusType | 'all'>('all');
  const navigate = useNavigate();

  const allApplicants = allApplicantsData;
  const companyDrivers = companyDriversData;

  // Calculate dynamic stats
  const activeDriversCount = companyDrivers.filter(d => d.driverStatus === 'Ready').length;
  const pendingApprovalsCount = allApplicants.length;

  // Filter applicants based on search and status
  const filteredApplicants = useMemo(() => {
    return allApplicants.filter(applicant => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = applicant.firstName.toLowerCase().includes(searchLower) || 
                           applicant.lastName.toLowerCase().includes(searchLower) ||
                           applicant.name.toLowerCase().includes(searchLower);
      const matchesStatus = statusFilter === 'all' || applicant.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  // Count by status
  const statusCounts = useMemo(() => {
    return {
      applied: allApplicants.filter(a => a.status === 'Applied').length,
      contacted: allApplicants.filter(a => a.status === 'Contacted').length,
      documents: allApplicants.filter(a => a.status === 'Documents Sent').length,
    };
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Track, manage and control all HR activities</p>
        <div className="stats-row">
          <div className="stat-item">
            <div className="stat-value">{activeDriversCount}</div>
            <div className="stat-label">Active drivers</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{pendingApprovalsCount}</div>
            <div className="stat-label">Pending approvals</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">$847k</div>
            <div className="stat-label">Total payroll</div>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recruiting</h2>
          </div>
          <div className="recruiting-stats">
            <span className="stat-badge">{allApplicants.length} Applications</span>
            <span className="stat-badge">{statusCounts.applied} Applied</span>
            <span className="stat-badge">{statusCounts.contacted} Contacted</span>
            <span className="stat-badge">{statusCounts.documents} Documents Sent</span>
          </div>

          {/* Search Bar */}
          <div className="search-bar">
            <span>🔍</span>
            <input 
              type="text" 
              placeholder="Search through candidates..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filters */}
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${statusFilter === 'Applied' ? 'active' : ''}`}
              onClick={() => setStatusFilter('Applied')}
            >
              Applied
            </button>
            <button 
              className={`filter-btn ${statusFilter === 'Contacted' ? 'active' : ''}`}
              onClick={() => setStatusFilter('Contacted')}
            >
              Contacted
            </button>
            <button 
              className={`filter-btn ${statusFilter === 'Documents Sent' ? 'active' : ''}`}
              onClick={() => setStatusFilter('Documents Sent')}
            >
              Documents Sent
            </button>
          </div>

          <div className="recruiting-header">
            <span>Candidates</span>
            <span>Job position</span>
            <span>Status</span>
            <span>Date</span>
            <span>Action</span>
          </div>
          <div className="recruiting-list scrollable">
            {filteredApplicants.length > 0 ? (
              filteredApplicants.map((applicant) => (
                <div key={applicant.id} className="recruiting-item">
                  <div className="recruiting-avatar">👤</div>
                  <span className="recruiting-name">{applicant.name}</span>
                  <span className="recruiting-position">{applicant.position}</span>
                  <span className={`status-badge status-recruiting-${applicant.status.toLowerCase().replace(' ', '-')}`}>
                    {applicant.status}
                  </span>
                  <span className="recruiting-date">{applicant.date}</span>
                  <button className="check-btn">Check Application</button>
                </div>
              ))
            ) : (
              <div className="no-results">No candidates found</div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Quick Actions</h2>
          </div>
          <div className="quick-actions">
            <button className="action-btn" onClick={() => navigate('/apply')}>
              <span className="action-icon">➕</span>
              <span>Add New Driver</span>
            </button>
            <button className="action-btn" onClick={() => onNavigate('statements')}>
              <span className="action-icon">📄</span>
              <span>Generate Statement</span>
            </button>
            <button className="action-btn" onClick={() => onNavigate('documents')}>
              <span className="action-icon">📁</span>
              <span>Manage Documents</span>
            </button>
            <button className="action-btn" onClick={() => onNavigate('drivers')}>
              <span className="action-icon">👥</span>
              <span>View All Drivers</span>
            </button>
            <button className="action-btn" onClick={() => onNavigate('employers')}>
              <span className="action-icon">🏢</span>
              <span>Employee Records</span>
            </button>
            <button className="action-btn" onClick={() => onNavigate('salary')}>
              <span className="action-icon">💰</span>
              <span>Process Payroll</span>
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Activities</h2>
        </div>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-icon">📝</span>
            <div className="activity-content">
              <strong>New application received</strong>
              <span className="activity-time">John Doe applied for Owner Operator position</span>
            </div>
            <span className="activity-date">2 hours ago</span>
          </div>
          <div className="activity-item">
            <span className="activity-icon">✅</span>
            <div className="activity-content">
              <strong>Document approved</strong>
              <span className="activity-time">Jane Smith's contract was approved</span>
            </div>
            <span className="activity-date">5 hours ago</span>
          </div>
          <div className="activity-item">
            <span className="activity-icon">💵</span>
            <div className="activity-content">
              <strong>Payroll processed</strong>
              <span className="activity-time">Weekly payroll completed successfully</span>
            </div>
            <span className="activity-date">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Drivers Page Component  
function DriversPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const companyDrivers = companyDriversData;

  const filteredDrivers = useMemo(() => {
    return companyDrivers.filter(driver => {
      const searchLower = searchQuery.toLowerCase();
      return driver.firstName.toLowerCase().includes(searchLower) || 
             driver.lastName.toLowerCase().includes(searchLower) ||
             driver.name.toLowerCase().includes(searchLower);
    });
  }, [searchQuery]);

  const activeDrivers = companyDrivers.filter(d => d.driverStatus === 'Ready').length;
  const inactiveDrivers = companyDrivers.filter(d => d.driverStatus === 'Not Ready').length;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Drivers</h1>
        <p className="page-subtitle">Manage your company drivers</p>
        <div className="stats-row">
          <div className="stat-item">
            <div className="stat-value">{companyDrivers.length}</div>
            <div className="stat-label">Total Drivers</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{activeDrivers}</div>
            <div className="stat-label">Ready</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{inactiveDrivers}</div>
            <div className="stat-label">Not Ready</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Overview</h2>
        </div>
        <div className="recruiting-stats">
          <span className="stat-badge">{companyDrivers.length} Total Workers</span>
          <span className="stat-badge">{activeDrivers} Ready</span>
          <span className="stat-badge">{inactiveDrivers} Not Ready</span>
        </div>

        <div className="search-bar">
          <span>🔍</span>
          <input 
            type="text" 
            placeholder="Search through drivers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="drivers-header">
          <span>Driver</span>
          <span>Position</span>
          <span>Status</span>
          <span>Date</span>
          <span>Action</span>
        </div>
        <div className="drivers-list">
          {filteredDrivers.length > 0 ? (
            filteredDrivers.map((driver) => (
              <div key={driver.id} className="driver-item">
                <div className="driver-avatar">👤</div>
                <span className="driver-name">{driver.name}</span>
                <span className="driver-position">{driver.position}</span>
                <span className={`status-badge status-driver-${driver.driverStatus?.toLowerCase().replace(' ', '-')}`}>
                  {driver.driverStatus}
                </span>
                <span className="driver-date">{driver.date}</span>
                <button className="view-btn">View Details</button>
              </div>
            ))
          ) : (
            <div className="no-results">No drivers found</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Documents Page Component
function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showDocModal, setShowDocModal] = useState(false);

  // Company drivers with CDL, Medical Card, Working Contract, and last statement
  const companyDrivers: Driver[] = companyDriversData.map(driver => ({
    ...driver,
    documents: [
      { id: 1, name: 'CDL Certificate', type: 'PDF', uploadDate: '01/15/2024', size: '1.8 MB' },
      { id: 2, name: 'Medical Card', type: 'PDF', uploadDate: '01/15/2024', size: '1.2 MB' },
      { id: 3, name: 'Working Contract', type: 'PDF', uploadDate: '01/15/2024', size: '2.5 MB' },
    ],
    statements: [
      { id: 1, date: '02/01/2024', amount: '$4,250.00', type: 'Miles' },
    ]
  }));

  const filteredDrivers = useMemo(() => {
    return companyDrivers.filter(driver => {
      const searchLower = searchQuery.toLowerCase();
      return driver.firstName.toLowerCase().includes(searchLower) || 
             driver.lastName.toLowerCase().includes(searchLower) ||
             driver.name.toLowerCase().includes(searchLower);
    });
  }, [searchQuery]);

  const handleOpenDocuments = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowDocModal(true);
  };

  const handleDeleteDocument = (docId: number) => {
    if (selectedDriver && window.confirm('Are you sure you want to delete this document?')) {
      setSelectedDriver({
        ...selectedDriver,
        documents: selectedDriver.documents?.filter(doc => doc.id !== docId)
      });
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
            placeholder="Search through drivers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="documents-grid">
          {filteredDrivers.length > 0 ? (
            filteredDrivers.map((driver) => (
              <div key={driver.id} className="document-card">
                <div className="document-card-header">
                  <div className="candidate-avatar">👤</div>
                  <div className="document-card-info">
                    <h3>{driver.name}</h3>
                    <p>{driver.position}</p>
                  </div>
                </div>
                <div className="document-card-stats">
                  <span>{driver.documents?.length || 0} Documents</span>
                  <span>{driver.statements?.length || 0} Statements</span>
                </div>
                <button 
                  className="open-btn"
                  onClick={() => handleOpenDocuments(driver)}
                >
                  Open
                </button>
              </div>
            ))
          ) : (
            <div className="no-results">No drivers found</div>
          )}
        </div>
      </div>

      {/* Document Modal */}
      {showDocModal && selectedDriver && (
        <div className="modal-overlay" onClick={() => setShowDocModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedDriver.name} - Documents & Statements</h2>
              <button className="close-btn" onClick={() => setShowDocModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h3>Documents</h3>
                <button className="add-document-btn">
                  <span>➕</span> Add New Document
                </button>
                <div className="documents-list">
                  {selectedDriver.documents && selectedDriver.documents.length > 0 ? (
                    selectedDriver.documents.map((doc) => (
                      <div key={doc.id} className="document-item">
                        <div className="document-icon">📄</div>
                        <div className="document-info">
                          <h4>{doc.name}</h4>
                          <p>{doc.type} • {doc.size} • {doc.uploadDate}</p>
                        </div>
                        <div className="document-actions">
                          <button className="doc-action-btn open">Open</button>
                          <button 
                            className="doc-action-btn delete"
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-documents">No documents uploaded yet</p>
                  )}
                </div>
              </div>

              <div className="modal-section">
                <h3>Latest Statement</h3>
                <div className="documents-list">
                  {selectedDriver.statements && selectedDriver.statements.length > 0 ? (
                    selectedDriver.statements.map((statement) => (
                      <div key={statement.id} className="document-item">
                        <div className="document-icon">📋</div>
                        <div className="document-info">
                          <h4>Payment Statement - {statement.date}</h4>
                          <p>{statement.type} • {statement.amount}</p>
                        </div>
                        <div className="document-actions">
                          <button className="doc-action-btn open">View</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-documents">No statements available</p>
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

// Statements Page Component
function StatementsPage() {
  const [statementData, setStatementData] = useState<StatementData>({
    driverId: null,
    driverName: '',
    paymentType: 'miles',
    miles: '',
    ratePerMile: '',
    percent: '',
    grossAmount: '',
    adjustmentType: 'bonus',
    adjustmentAmount: '',
    adjustmentReason: '',
  });
  const [showPreview, setShowPreview] = useState(false);

  const companyDrivers = companyDriversData.map(driver => ({
    id: driver.id,
    name: driver.name
  }));

  const calculateTotal = () => {
    let subtotal = 0;
    
    if (statementData.paymentType === 'miles') {
      subtotal = parseFloat(statementData.miles || '0') * parseFloat(statementData.ratePerMile || '0');
    } else {
      const percent = parseFloat(statementData.percent || '0') / 100;
      subtotal = parseFloat(statementData.grossAmount || '0') * percent;
    }

    const adjustment = parseFloat(statementData.adjustmentAmount || '0');
    const total = statementData.adjustmentType === 'bonus' 
      ? subtotal + adjustment 
      : subtotal - adjustment;

    return {
      subtotal: subtotal.toFixed(2),
      adjustment: adjustment.toFixed(2),
      total: total.toFixed(2),
    };
  };

  const handleGenerate = () => {
    if (!statementData.driverName) {
      alert('Please select a driver');
      return;
    }

    if (statementData.paymentType === 'miles') {
      if (!statementData.miles || !statementData.ratePerMile) {
        alert('Please enter miles and rate per mile');
        return;
      }
    } else {
      if (!statementData.percent || !statementData.grossAmount) {
        alert('Please enter percentage and gross amount');
        return;
      }
    }

    setShowPreview(true);
  };

  const handleDownloadPDF = () => {
    alert('PDF download functionality would be implemented here');
  };

  const totals = calculateTotal();

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Statements</h1>
        <p className="page-subtitle">Generate driver payment statements</p>
      </div>

      <div className="card statement-form-card">
        <div className="card-header">
          <h2 className="card-title">Create Statement</h2>
        </div>

        <div className="form-grid">
          <div className="form-group full-width">
            <label>Select Driver</label>
            <select 
              value={statementData.driverId || ''}
              onChange={(e) => {
                const driver = companyDrivers.find(d => d.id === parseInt(e.target.value));
                setStatementData({
                  ...statementData,
                  driverId: driver ? driver.id : null,
                  driverName: driver ? driver.name : '',
                });
              }}
            >
              <option value="">Choose a driver...</option>
              {companyDrivers.map(driver => (
                <option key={driver.id} value={driver.id}>{driver.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group full-width">
            <label>Payment Type</label>
            <div className="custom-radio-group">
              <label className={`custom-radio ${statementData.paymentType === 'miles' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="paymentType" 
                  value="miles"
                  checked={statementData.paymentType === 'miles'}
                  onChange={(e) => setStatementData({
                    ...statementData,
                    paymentType: e.target.value as PaymentType,
                  })}
                />
                <span className="radio-icon">🛣️</span>
                <span>Miles</span>
              </label>
              <label className={`custom-radio ${statementData.paymentType === 'percent' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="paymentType" 
                  value="percent"
                  checked={statementData.paymentType === 'percent'}
                  onChange={(e) => setStatementData({
                    ...statementData,
                    paymentType: e.target.value as PaymentType,
                  })}
                />
                <span className="radio-icon">📊</span>
                <span>Percentage</span>
              </label>
            </div>
          </div>

          {statementData.paymentType === 'miles' ? (
            <>
              <div className="form-group">
                <label>Miles Driven</label>
                <input 
                  type="number" 
                  placeholder="Enter miles"
                  value={statementData.miles}
                  onChange={(e) => setStatementData({
                    ...statementData,
                    miles: e.target.value,
                  })}
                />
              </div>
              <div className="form-group">
                <label>Rate per Mile ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="Enter rate"
                  value={statementData.ratePerMile}
                  onChange={(e) => setStatementData({
                    ...statementData,
                    ratePerMile: e.target.value,
                  })}
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Percentage (%)</label>
                <input 
                  type="number" 
                  placeholder="Enter percentage"
                  value={statementData.percent}
                  onChange={(e) => setStatementData({
                    ...statementData,
                    percent: e.target.value,
                  })}
                />
              </div>
              <div className="form-group">
                <label>Gross Amount ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="Enter gross amount"
                  value={statementData.grossAmount}
                  onChange={(e) => setStatementData({
                    ...statementData,
                    grossAmount: e.target.value,
                  })}
                />
              </div>
            </>
          )}

          <div className="form-group full-width">
            <label>Adjustment Type</label>
            <div className="custom-radio-group">
              <label className={`custom-radio ${statementData.adjustmentType === 'bonus' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="adjustmentType" 
                  value="bonus"
                  checked={statementData.adjustmentType === 'bonus'}
                  onChange={(e) => setStatementData({
                    ...statementData,
                    adjustmentType: e.target.value as 'bonus' | 'deduction',
                  })}
                />
                <span className="radio-icon">➕</span>
                <span>Bonus</span>
              </label>
              <label className={`custom-radio ${statementData.adjustmentType === 'deduction' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="adjustmentType" 
                  value="deduction"
                  checked={statementData.adjustmentType === 'deduction'}
                  onChange={(e) => setStatementData({
                    ...statementData,
                    adjustmentType: e.target.value as 'bonus' | 'deduction',
                  })}
                />
                <span className="radio-icon">➖</span>
                <span>Deduction</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Adjustment Amount ($)</label>
            <input 
              type="number" 
              step="0.01"
              placeholder="Enter amount"
              value={statementData.adjustmentAmount}
              onChange={(e) => setStatementData({
                ...statementData,
                adjustmentAmount: e.target.value,
              })}
            />
          </div>

          <div className="form-group">
            <label>Adjustment Reason</label>
            <input 
              type="text" 
              placeholder="Enter reason for adjustment"
              value={statementData.adjustmentReason}
              onChange={(e) => setStatementData({
                ...statementData,
                adjustmentReason: e.target.value,
              })}
            />
          </div>
        </div>

        <button className="generate-btn" onClick={handleGenerate}>
          Generate Statement
        </button>
      </div>

      {/* Statement Preview Modal - WIDER */}
      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="modal-content statement-preview-modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Statement Preview</h2>
              <button className="close-btn" onClick={() => setShowPreview(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="statement-document">
                <div className="statement-header">
                  <h1>Payment Statement</h1>
                  <p>Date: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="statement-section">
                  <h3>Driver Information</h3>
                  <p><strong>Name:</strong> {statementData.driverName}</p>
                </div>

                <div className="statement-section">
                  <h3>Payment Details</h3>
                  {statementData.paymentType === 'miles' ? (
                    <>
                      <p><strong>Payment Type:</strong> Miles</p>
                      <p><strong>Miles Driven:</strong> {statementData.miles}</p>
                      <p><strong>Rate per Mile:</strong> ${statementData.ratePerMile}</p>
                      <p><strong>Subtotal:</strong> ${totals.subtotal}</p>
                    </>
                  ) : (
                    <>
                      <p><strong>Payment Type:</strong> Percentage</p>
                      <p><strong>Percentage:</strong> {statementData.percent}%</p>
                      <p><strong>Gross Amount:</strong> ${statementData.grossAmount}</p>
                      <p><strong>Subtotal:</strong> ${totals.subtotal}</p>
                    </>
                  )}
                </div>

                {statementData.adjustmentAmount && parseFloat(statementData.adjustmentAmount) > 0 && (
                  <div className="statement-section">
                    <h3>Adjustments</h3>
                    <p><strong>Type:</strong> {statementData.adjustmentType === 'bonus' ? 'Bonus' : 'Deduction'}</p>
                    <p><strong>Amount:</strong> {statementData.adjustmentType === 'bonus' ? '+' : '-'}${totals.adjustment}</p>
                    {statementData.adjustmentReason && (
                      <p><strong>Reason:</strong> {statementData.adjustmentReason}</p>
                    )}
                  </div>
                )}

                <div className="statement-section statement-total">
                  <h3>Total Payment</h3>
                  <p className="total-amount">${totals.total}</p>
                </div>
              </div>

              <div className="statement-actions">
                <button className="download-btn" onClick={handleDownloadPDF}>
                  Download PDF
                </button>
                <button className="close-preview-btn" onClick={() => setShowPreview(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SalaryPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Salary</h1>
      </div>
      <div className="card">
        <p>Salary management coming soon...</p>
      </div>
    </div>
  );
}

function EmployersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Driver | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Demo company employees with complete information
  const companyEmployees: Driver[] = companyDriversData.map(driver => ({
    ...driver,
    paymentType: driver.id % 2 === 0 ? 'percent' : 'miles',
    employmentStatus: driver.id === 3 ? 'Fired' : 'Working',
    documents: [
      { id: 1, name: 'CDL Certificate', type: 'PDF', uploadDate: '01/15/2024', size: '1.8 MB' },
      { id: 2, name: 'Medical Card', type: 'PDF', uploadDate: '01/15/2024', size: '1.2 MB' },
      { id: 3, name: 'Working Contract', type: 'PDF', uploadDate: '01/15/2024', size: '2.5 MB' },
    ],
    statements: [
      { id: 1, date: '01/01/2024', amount: '$4,250.00', type: 'Miles' },
      { id: 2, date: '01/15/2024', amount: '$4,100.00', type: 'Miles' },
      { id: 3, date: '02/01/2024', amount: '$4,500.00', type: 'Miles' },
    ]
  }));

  const filteredEmployees = useMemo(() => {
    return companyEmployees.filter(employee => {
      const searchLower = searchQuery.toLowerCase();
      return employee.firstName.toLowerCase().includes(searchLower) || 
             employee.lastName.toLowerCase().includes(searchLower) ||
             employee.name.toLowerCase().includes(searchLower);
    });
  }, [searchQuery]);

  const workingCount = companyEmployees.filter(e => e.employmentStatus === 'Working').length;
  const firedCount = companyEmployees.filter(e => e.employmentStatus === 'Fired').length;

  const handleViewDetails = (employee: Driver) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Employers</h1>
        <p className="page-subtitle">Manage all company employees</p>
        <div className="stats-row">
          <div className="stat-item">
            <div className="stat-value">{companyEmployees.length}</div>
            <div className="stat-label">Total Employees</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{workingCount}</div>
            <div className="stat-label">Working</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{firedCount}</div>
            <div className="stat-label">Fired</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="search-bar">
          <span>🔍</span>
          <input 
            type="text" 
            placeholder="Search through employees..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="employers-header">
          <span>Name</span>
          <span>Position</span>
          <span>Payment Type</span>
          <span>Employment Status</span>
          <span>Action</span>
        </div>
        <div className="employers-list">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => (
              <div key={employee.id} className="employer-item">
                <div className="employer-avatar">👤</div>
                <span className="employer-name">{employee.name}</span>
                <span className="employer-position">{employee.position}</span>
                <span className="employer-payment">
                  {employee.paymentType === 'miles' ? (
                    <span className="payment-badge miles">📏 Per Mile</span>
                  ) : (
                    <span className="payment-badge percent">📊 Percentage</span>
                  )}
                </span>
                <span className={`employment-badge ${employee.employmentStatus?.toLowerCase()}`}>
                  {employee.employmentStatus}
                </span>
                <button 
                  className="details-btn"
                  onClick={() => handleViewDetails(employee)}
                >
                  View Full Details
                </button>
              </div>
            ))
          ) : (
            <div className="no-results">No employees found</div>
          )}
        </div>
      </div>

      {/* Employee Details Modal */}
      {showDetailsModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content employee-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedEmployee.name} - Full Details</h2>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="employee-info-section">
                <h3>Employee Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Name:</strong>
                    <span>{selectedEmployee.name}</span>
                  </div>
                  <div className="info-item">
                    <strong>Position:</strong>
                    <span>{selectedEmployee.position}</span>
                  </div>
                  <div className="info-item">
                    <strong>Payment Type:</strong>
                    <span>{selectedEmployee.paymentType === 'miles' ? 'Per Mile' : 'Percentage'}</span>
                  </div>
                  <div className="info-item">
                    <strong>Employment Status:</strong>
                    <span className={`employment-badge ${selectedEmployee.employmentStatus?.toLowerCase()}`}>
                      {selectedEmployee.employmentStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="employee-info-section">
                <h3>Documents ({selectedEmployee.documents?.length || 0})</h3>
                <div className="modal-documents-list">
                  {selectedEmployee.documents && selectedEmployee.documents.length > 0 ? (
                    selectedEmployee.documents.map((doc) => (
                      <div key={doc.id} className="modal-document-item">
                        <div className="document-icon-small">📄</div>
                        <div className="document-info-small">
                          <strong>{doc.name}</strong>
                          <span>{doc.type} • {doc.size} • {doc.uploadDate}</span>
                        </div>
                        <button className="doc-action-btn open-small">Open</button>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No documents available</p>
                  )}
                </div>
              </div>

              <div className="employee-info-section">
                <h3>Statements ({selectedEmployee.statements?.length || 0})</h3>
                <div className="modal-statements-list">
                  {selectedEmployee.statements && selectedEmployee.statements.length > 0 ? (
                    selectedEmployee.statements.map((statement) => (
                      <div key={statement.id} className="modal-statement-item">
                        <div className="statement-icon-small">📋</div>
                        <div className="statement-info-small">
                          <strong>{statement.date}</strong>
                          <span>{statement.type} - {statement.amount}</span>
                        </div>
                        <button className="doc-action-btn open-small">View</button>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No statements available</p>
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

export default Dashboard;
