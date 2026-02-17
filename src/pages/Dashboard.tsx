import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

type PageType = 'dashboard' | 'drivers' | 'documents' | 'statements' | 'salary' | 'employees';
type StatusType = 'Applied' | 'Contacted' | 'Documents Sent';
type DriverStatusType = 'Ready' | 'Not Ready';
type PaymentType = 'miles' | 'percent';
type EmploymentStatus = 'Working' | 'Fired';
type EquipmentType = 'Van' | 'Reefer' | 'Flat Bed' | 'Any';

interface Driver {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  position: 'Owner Operator' | 'Company Driver';
  equipment: EquipmentType;
  status: StatusType;
  date: string;
  isEmployee?: boolean;
  documents?: DocFile[];
  driverStatus?: DriverStatusType;
  paymentType?: PaymentType;
  employmentStatus?: EmploymentStatus;
  statements?: Statement[];
}

interface DocFile {
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

const companyDriversData: Driver[] = [
  { id: 1,  name: 'John Smith',       firstName: 'John',      lastName: 'Smith',     position: 'Owner Operator', equipment: 'Van',     status: 'Applied',        date: '01/15/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'percent', employmentStatus: 'Working' },
  { id: 2,  name: 'Maria Garcia',     firstName: 'Maria',     lastName: 'Garcia',    position: 'Company Driver', equipment: 'Reefer',  status: 'Contacted',      date: '01/18/2024', isEmployee: true, driverStatus: 'Not Ready', paymentType: 'miles',   employmentStatus: 'Working' },
  { id: 3,  name: 'James Wilson',     firstName: 'James',     lastName: 'Wilson',    position: 'Company Driver', equipment: 'Van',     status: 'Documents Sent', date: '01/20/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'miles',   employmentStatus: 'Fired'   },
  { id: 4,  name: 'Patricia Brown',   firstName: 'Patricia',  lastName: 'Brown',     position: 'Owner Operator', equipment: 'Reefer',  status: 'Applied',        date: '01/22/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'percent', employmentStatus: 'Working' },
  { id: 5,  name: 'Robert Jones',     firstName: 'Robert',    lastName: 'Jones',     position: 'Company Driver', equipment: 'Flat Bed',status: 'Contacted',      date: '01/25/2024', isEmployee: true, driverStatus: 'Not Ready', paymentType: 'percent', employmentStatus: 'Working' },
  { id: 6,  name: 'Linda Davis',      firstName: 'Linda',     lastName: 'Davis',     position: 'Owner Operator', equipment: 'Any',     status: 'Documents Sent', date: '02/01/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'percent', employmentStatus: 'Working' },
  { id: 7,  name: 'Michael Miller',   firstName: 'Michael',   lastName: 'Miller',    position: 'Company Driver', equipment: 'Van',     status: 'Applied',        date: '02/03/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'miles',   employmentStatus: 'Working' },
  { id: 8,  name: 'Elizabeth Martinez',firstName:'Elizabeth', lastName: 'Martinez',  position: 'Company Driver', equipment: 'Flat Bed',status: 'Contacted',      date: '02/05/2024', isEmployee: true, driverStatus: 'Not Ready', paymentType: 'miles',   employmentStatus: 'Working' },
  { id: 9,  name: 'William Anderson', firstName: 'William',   lastName: 'Anderson',  position: 'Owner Operator', equipment: 'Reefer',  status: 'Applied',        date: '02/08/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'percent', employmentStatus: 'Working' },
  { id: 10, name: 'Jennifer Taylor',  firstName: 'Jennifer',  lastName: 'Taylor',    position: 'Company Driver', equipment: 'Reefer',  status: 'Documents Sent', date: '02/10/2024', isEmployee: true, driverStatus: 'Ready',     paymentType: 'miles',   employmentStatus: 'Working' },
];

const allApplicantsData: Driver[] = [
  { id: 1,  name: 'John Doe',        firstName: 'John',      lastName: 'Doe',       position: 'Owner Operator', equipment: 'Van',     status: 'Applied',        date: '07/22/23' },
  { id: 2,  name: 'Jane Smith',      firstName: 'Jane',      lastName: 'Smith',     position: 'Company Driver', equipment: 'Reefer',  status: 'Contacted',      date: '07/22/23' },
  { id: 3,  name: 'Mike Johnson',    firstName: 'Mike',      lastName: 'Johnson',   position: 'Owner Operator', equipment: 'Flat Bed',status: 'Documents Sent', date: '07/22/23' },
  { id: 4,  name: 'Sarah Williams',  firstName: 'Sarah',     lastName: 'Williams',  position: 'Company Driver', equipment: 'Van',     status: 'Applied',        date: '07/23/23' },
  { id: 5,  name: 'David Brown',     firstName: 'David',     lastName: 'Brown',     position: 'Company Driver', equipment: 'Reefer',  status: 'Contacted',      date: '07/23/23' },
  { id: 6,  name: 'Emily Davis',     firstName: 'Emily',     lastName: 'Davis',     position: 'Owner Operator', equipment: 'Flat Bed',status: 'Documents Sent', date: '07/24/23' },
  { id: 7,  name: 'Michael Wilson',  firstName: 'Michael',   lastName: 'Wilson',    position: 'Owner Operator', equipment: 'Any',     status: 'Applied',        date: '07/24/23' },
  { id: 8,  name: 'Jennifer Martinez',firstName:'Jennifer',  lastName: 'Martinez',  position: 'Company Driver', equipment: 'Van',     status: 'Contacted',      date: '07/25/23' },
  { id: 9,  name: 'Robert Taylor',   firstName: 'Robert',    lastName: 'Taylor',    position: 'Company Driver', equipment: 'Flat Bed',status: 'Applied',        date: '07/25/23' },
  { id: 10, name: 'Jessica Anderson',firstName: 'Jessica',   lastName: 'Anderson',  position: 'Owner Operator', equipment: 'Reefer',  status: 'Documents Sent', date: '07/26/23' },
];

function Dashboard() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState<PageType>('dashboard');
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="container">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">🏢</div>
          <span>HR Manager</span>
        </div>
        <nav className="nav-items">
          {([
            { key: 'dashboard', icon: '📊', label: 'Dashboard' },
            { key: 'drivers',   icon: '🚗', label: 'Drivers'   },
            { key: 'documents', icon: '📄', label: 'Documents' },
            { key: 'statements',icon: '📋', label: 'Statements'},
            { key: 'salary',    icon: '💰', label: 'Salary'    },
            { key: 'employees', icon: '👥', label: 'Employees' },
          ] as {key: PageType; icon: string; label: string}[]).map(item => (
            <div key={item.key}
              className={`nav-item ${activePage === item.key ? 'active' : ''}`}
              onClick={() => setActivePage(item.key)}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="logout" onClick={() => navigate('/')}>
          <span className="nav-icon">🚪</span>
          <span>Logout</span>
        </div>
      </aside>

      <main className="main-content">
        {activePage === 'dashboard'  && <DashboardPage  onNavigate={setActivePage} />}
        {activePage === 'drivers'    && <DriversPage />}
        {activePage === 'documents'  && <DocumentsPage />}
        {activePage === 'statements' && <StatementsPage />}
        {activePage === 'salary'     && <SalaryPage />}
        {activePage === 'employees'  && <EmployeesPage />}
      </main>

      <div className="settings-icon" onClick={() => setShowSettings(true)}>⚙️</div>

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content settings-modal" onClick={e => e.stopPropagation()}>
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

/* ─── DASHBOARD ──────────────────────────────────────────────────────────── */
function DashboardPage({ onNavigate }: { onNavigate: (p: PageType) => void }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusType | 'all'>('all');

  const activeDriversCount = companyDriversData.filter(d => d.driverStatus === 'Ready').length;
  const pendingCount       = allApplicantsData.length;

  const filtered = useMemo(() => allApplicantsData.filter(a => {
    const q = searchQuery.toLowerCase();
    const matchSearch = a.firstName.toLowerCase().includes(q) || a.lastName.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
    return matchSearch && (statusFilter === 'all' || a.status === statusFilter);
  }), [searchQuery, statusFilter]);

  const counts = useMemo(() => ({
    applied:   allApplicantsData.filter(a => a.status === 'Applied').length,
    contacted: allApplicantsData.filter(a => a.status === 'Contacted').length,
    docs:      allApplicantsData.filter(a => a.status === 'Documents Sent').length,
  }), []);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Track, manage and control all HR activities</p>
        <div className="stats-row">
          <div className="stat-item"><div className="stat-value">{activeDriversCount}</div><div className="stat-label">Active drivers</div></div>
          <div className="stat-item"><div className="stat-value">{pendingCount}</div><div className="stat-label">Pending approvals</div></div>
          <div className="stat-item"><div className="stat-value">$847k</div><div className="stat-label">Total payroll</div></div>
        </div>
      </div>

      <div className="content-grid">
        {/* RECRUITING */}
        <div className="card">
          <div className="card-header"><h2 className="card-title">Recruiting</h2></div>
          <div className="recruiting-stats">
            <span className="stat-badge">{allApplicantsData.length} Applications</span>
            <span className="stat-badge">{counts.applied} Applied</span>
            <span className="stat-badge">{counts.contacted} Contacted</span>
            <span className="stat-badge">{counts.docs} Documents Sent</span>
          </div>
          <div className="search-bar">
            <span>🔍</span>
            <input type="text" placeholder="Search through candidates..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="filter-buttons">
            {(['all','Applied','Contacted','Documents Sent'] as const).map(f => (
              <button key={f} className={`filter-btn ${statusFilter === f ? 'active' : ''}`} onClick={() => setStatusFilter(f)}>
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>

          {/* Header row */}
          <div className="table-header recruiting-cols">
            <span>Candidates</span>
            <span>Position</span>
            <span>Equipment</span>
            <span>Status</span>
            <span>Date</span>
            <span>Action</span>
          </div>
          <div className="table-body scrollable">
            {filtered.length > 0 ? filtered.map(a => (
              <div key={a.id} className="table-row recruiting-cols">
                <span className="cell-name"><span className="row-avatar">👤</span>{a.name}</span>
                <span className="cell">{a.position}</span>
                <span className="cell"><span className="equip-badge">{a.equipment}</span></span>
                <span className="cell"><span className={`status-badge status-recruiting-${a.status.toLowerCase().replace(' ', '-')}`}>{a.status}</span></span>
                <span className="cell">{a.date}</span>
                <span className="cell"><button className="check-btn">Check</button></span>
              </div>
            )) : <div className="no-results">No candidates found</div>}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="card">
          <div className="card-header"><h2 className="card-title">Quick Actions</h2></div>
          <div className="quick-actions">
            {[
              { icon: '➕', label: 'Add New Driver',    action: () => navigate('/application') },
              { icon: '📄', label: 'Generate Statement',action: () => onNavigate('statements')  },
              { icon: '📁', label: 'Manage Documents',  action: () => onNavigate('documents')   },
              { icon: '👥', label: 'View All Drivers',  action: () => onNavigate('drivers')     },
              { icon: '🏢', label: 'Employee Records',  action: () => onNavigate('employees')   },
              { icon: '💰', label: 'Process Payroll',   action: () => onNavigate('salary')      },
            ].map(btn => (
              <button key={btn.label} className="action-btn" onClick={btn.action}>
                <span className="action-icon">{btn.icon}</span>
                <span>{btn.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2 className="card-title">Recent Activities</h2></div>
        <div className="activity-list">
          {[
            { icon:'📝', title:'New application received', sub:'John Doe applied for Owner Operator position', time:'2 hours ago' },
            { icon:'✅', title:'Document approved',         sub:"Jane Smith's contract was approved",          time:'5 hours ago' },
            { icon:'💵', title:'Payroll processed',         sub:'Weekly payroll completed successfully',       time:'1 day ago'   },
          ].map(item => (
            <div key={item.title} className="activity-item">
              <span className="activity-icon">{item.icon}</span>
              <div className="activity-content"><strong>{item.title}</strong><span className="activity-time">{item.sub}</span></div>
              <span className="activity-date">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── DRIVERS ────────────────────────────────────────────────────────────── */
function DriversPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => companyDriversData.filter(d => {
    const q = searchQuery.toLowerCase();
    return d.firstName.toLowerCase().includes(q) || d.lastName.toLowerCase().includes(q) || d.name.toLowerCase().includes(q);
  }), [searchQuery]);

  const readyCount    = companyDriversData.filter(d => d.driverStatus === 'Ready').length;
  const notReadyCount = companyDriversData.filter(d => d.driverStatus === 'Not Ready').length;

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
          <input type="text" placeholder="Search through drivers..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>

        <div className="table-header drivers-cols">
          <span>Driver</span>
          <span>Position</span>
          <span>Equipment</span>
          <span>Status</span>
          <span>Date</span>
          <span>Action</span>
        </div>
        <div className="table-body">
          {filtered.length > 0 ? filtered.map(d => (
            <div key={d.id} className="table-row drivers-cols">
              <span className="cell-name"><span className="row-avatar">👤</span>{d.name}</span>
              <span className="cell">{d.position}</span>
              <span className="cell"><span className="equip-badge">{d.equipment}</span></span>
              <span className="cell"><span className={`status-badge status-driver-${d.driverStatus?.toLowerCase().replace(' ', '-')}`}>{d.driverStatus}</span></span>
              <span className="cell">{d.date}</span>
              <span className="cell"><button className="view-btn">View Details</button></span>
            </div>
          )) : <div className="no-results">No drivers found</div>}
        </div>
      </div>
    </div>
  );
}

/* ─── DOCUMENTS ──────────────────────────────────────────────────────────── */
function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [driverDocs, setDriverDocs] = useState<DocFile[]>([]);

  const driversWithDocs = useMemo(() => companyDriversData.map(d => ({
    ...d,
    documents: [
      { id: 1, name: 'CDL Certificate',  type: 'PDF', uploadDate: '01/15/2024', size: '1.8 MB' },
      { id: 2, name: 'Medical Card',     type: 'PDF', uploadDate: '01/15/2024', size: '1.2 MB' },
      { id: 3, name: 'Working Contract', type: 'PDF', uploadDate: '01/15/2024', size: '2.5 MB' },
    ] as DocFile[],
    statements: [{ id: 1, date: '02/01/2024', amount: '$4,250.00', type: 'Miles' }] as Statement[],
  })), []);

  const filtered = useMemo(() => driversWithDocs.filter(d => {
    const q = searchQuery.toLowerCase();
    return d.firstName.toLowerCase().includes(q) || d.lastName.toLowerCase().includes(q) || d.name.toLowerCase().includes(q);
  }), [searchQuery, driversWithDocs]);

  const handleOpen = (driver: typeof driversWithDocs[0]) => {
    setSelectedDriver(driver);
    setDriverDocs(driver.documents);
  };

  return (
    <div className="page">
      <div className="page-header"><h1 className="page-title">Documents</h1><p className="page-subtitle">Manage driver documents</p></div>
      <div className="card">
        <div className="search-bar">
          <span>🔍</span>
          <input type="text" placeholder="Search through drivers..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="documents-grid">
          {filtered.length > 0 ? filtered.map(d => (
            <div key={d.id} className="document-card">
              <div className="document-card-header">
                <div className="candidate-avatar">👤</div>
                <div className="document-card-info"><h3>{d.name}</h3><p>{d.position} · {d.equipment}</p></div>
              </div>
              <div className="document-card-stats">
                <span>{d.documents.length} Documents</span>
                <span>{d.statements.length} Statements</span>
              </div>
              <button className="open-btn" onClick={() => handleOpen(d)}>Open</button>
            </div>
          )) : <div className="no-results">No drivers found</div>}
        </div>
      </div>

      {selectedDriver && (
        <div className="modal-overlay" onClick={() => setSelectedDriver(null)}>
          <div className="modal-content modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedDriver.name} — Documents & Statements</h2>
              <button className="close-btn" onClick={() => setSelectedDriver(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <div className="modal-section-header">
                  <h3>Documents</h3>
                  <button className="add-document-btn">➕ Add Document</button>
                </div>
                <div className="documents-list">
                  {driverDocs.map(doc => (
                    <div key={doc.id} className="document-item">
                      <div className="document-icon">📄</div>
                      <div className="document-info"><h4>{doc.name}</h4><p>{doc.type} · {doc.size} · {doc.uploadDate}</p></div>
                      <div className="document-actions">
                        <button className="doc-action-btn open">Open</button>
                        <button className="doc-action-btn delete" onClick={() => {
                          if (window.confirm('Delete this document?')) setDriverDocs(prev => prev.filter(d => d.id !== doc.id));
                        }}>Delete</button>
                      </div>
                    </div>
                  ))}
                  {driverDocs.length === 0 && <p className="no-documents">No documents uploaded yet</p>}
                </div>
              </div>
              <div className="modal-section">
                <h3>Latest Statement</h3>
                <div className="documents-list">
                  {(selectedDriver.statements ?? []).map(s => (
                    <div key={s.id} className="document-item">
                      <div className="document-icon">📋</div>
                      <div className="document-info"><h4>Payment Statement — {s.date}</h4><p>{s.type} · {s.amount}</p></div>
                      <div className="document-actions"><button className="doc-action-btn open">View</button></div>
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

/* ─── STATEMENTS ─────────────────────────────────────────────────────────── */
function StatementsPage() {
  const [data, setData] = useState<StatementData>({
    driverId: null, driverName: '',
    paymentType: 'miles', miles: '', ratePerMile: '', percent: '', grossAmount: '',
    adjustmentType: 'bonus', adjustmentAmount: '', adjustmentReason: '',
  });
  const [showPreview, setShowPreview] = useState(false);

  const calc = () => {
    let sub = data.paymentType === 'miles'
      ? parseFloat(data.miles||'0') * parseFloat(data.ratePerMile||'0')
      : parseFloat(data.grossAmount||'0') * (parseFloat(data.percent||'0') / 100);
    const adj = parseFloat(data.adjustmentAmount||'0');
    return { sub: sub.toFixed(2), adj: adj.toFixed(2), total: (data.adjustmentType === 'bonus' ? sub+adj : sub-adj).toFixed(2) };
  };

  const handleGenerate = () => {
    if (!data.driverName) return alert('Please select a driver');
    if (data.paymentType === 'miles' && (!data.miles || !data.ratePerMile)) return alert('Please enter miles and rate per mile');
    if (data.paymentType === 'percent' && (!data.percent || !data.grossAmount)) return alert('Please enter percentage and gross amount');
    setShowPreview(true);
  };

  const totals = calc();

  return (
    <div className="page">
      <div className="page-header"><h1 className="page-title">Statements</h1><p className="page-subtitle">Generate driver payment statements</p></div>
      <div className="card statement-form-card">
        <div className="card-header"><h2 className="card-title">Create Statement</h2></div>
        <div className="form-grid">
          <div className="form-group full-width">
            <label>Select Driver</label>
            <select value={data.driverId||''} onChange={e => {
              const d = companyDriversData.find(d => d.id === parseInt(e.target.value));
              setData({...data, driverId: d?.id??null, driverName: d?.name??''});
            }}>
              <option value="">Choose a driver...</option>
              {companyDriversData.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div className="form-group full-width">
            <label>Payment Type</label>
            <div className="custom-radio-group">
              {(['miles','percent'] as PaymentType[]).map(v => (
                <label key={v} className={`custom-radio ${data.paymentType === v ? 'active':''}`}>
                  <input type="radio" name="paymentType" value={v} checked={data.paymentType===v} onChange={() => setData({...data,paymentType:v})} />
                  <span className="radio-icon">{v==='miles'?'🛣️':'📊'}</span>
                  <span>{v==='miles'?'Miles':'Percentage'}</span>
                </label>
              ))}
            </div>
          </div>

          {data.paymentType === 'miles' ? <>
            <div className="form-group"><label>Miles Driven</label><input type="number" placeholder="Enter miles" value={data.miles} onChange={e=>setData({...data,miles:e.target.value})} /></div>
            <div className="form-group"><label>Rate per Mile ($)</label><input type="number" step="0.01" placeholder="Enter rate" value={data.ratePerMile} onChange={e=>setData({...data,ratePerMile:e.target.value})} /></div>
          </> : <>
            <div className="form-group"><label>Percentage (%)</label><input type="number" placeholder="Enter percentage" value={data.percent} onChange={e=>setData({...data,percent:e.target.value})} /></div>
            <div className="form-group"><label>Gross Amount ($)</label><input type="number" step="0.01" placeholder="Enter gross" value={data.grossAmount} onChange={e=>setData({...data,grossAmount:e.target.value})} /></div>
          </>}

          <div className="form-group full-width">
            <label>Adjustment Type</label>
            <div className="custom-radio-group">
              {(['bonus','deduction'] as const).map(v => (
                <label key={v} className={`custom-radio ${data.adjustmentType===v?'active':''}`}>
                  <input type="radio" name="adjType" value={v} checked={data.adjustmentType===v} onChange={() => setData({...data,adjustmentType:v})} />
                  <span className="radio-icon">{v==='bonus'?'➕':'➖'}</span>
                  <span>{v.charAt(0).toUpperCase()+v.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group"><label>Adjustment Amount ($)</label><input type="number" step="0.01" placeholder="Enter amount" value={data.adjustmentAmount} onChange={e=>setData({...data,adjustmentAmount:e.target.value})} /></div>
          <div className="form-group"><label>Adjustment Reason</label><input type="text" placeholder="Enter reason" value={data.adjustmentReason} onChange={e=>setData({...data,adjustmentReason:e.target.value})} /></div>
        </div>
        <button className="generate-btn" onClick={handleGenerate}>Generate Statement</button>
      </div>

      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="modal-content modal-xl" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h2>Statement Preview</h2><button className="close-btn" onClick={()=>setShowPreview(false)}>✕</button></div>
            <div className="modal-body">
              <div className="statement-document">
                <div className="statement-header"><h1>Payment Statement</h1><p>Date: {new Date().toLocaleDateString()}</p></div>
                <div className="statement-section"><h3>Driver Information</h3><p><strong>Name:</strong> {data.driverName}</p></div>
                <div className="statement-section">
                  <h3>Payment Details</h3>
                  {data.paymentType === 'miles' ? <>
                    <p><strong>Payment Type:</strong> Miles</p>
                    <p><strong>Miles Driven:</strong> {data.miles}</p>
                    <p><strong>Rate per Mile:</strong> ${data.ratePerMile}</p>
                    <p><strong>Subtotal:</strong> ${totals.sub}</p>
                  </> : <>
                    <p><strong>Payment Type:</strong> Percentage</p>
                    <p><strong>Percentage:</strong> {data.percent}%</p>
                    <p><strong>Gross Amount:</strong> ${data.grossAmount}</p>
                    <p><strong>Subtotal:</strong> ${totals.sub}</p>
                  </>}
                </div>
                {data.adjustmentAmount && parseFloat(data.adjustmentAmount) > 0 && (
                  <div className="statement-section">
                    <h3>Adjustments</h3>
                    <p><strong>Type:</strong> {data.adjustmentType === 'bonus' ? 'Bonus' : 'Deduction'}</p>
                    <p><strong>Amount:</strong> {data.adjustmentType==='bonus'?'+':'-'}${totals.adj}</p>
                    {data.adjustmentReason && <p><strong>Reason:</strong> {data.adjustmentReason}</p>}
                  </div>
                )}
                <div className="statement-section statement-total"><h3>Total Payment</h3><p className="total-amount">${totals.total}</p></div>
              </div>
              <div className="statement-actions">
                <button className="download-btn" onClick={()=>alert('PDF download would be implemented here')}>Download PDF</button>
                <button className="close-preview-btn" onClick={()=>setShowPreview(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── SALARY ─────────────────────────────────────────────────────────────── */
function SalaryPage() {
  return (
    <div className="page">
      <div className="page-header"><h1 className="page-title">Salary</h1></div>
      <div className="card"><p>Salary management coming soon...</p></div>
    </div>
  );
}

/* ─── EMPLOYEES ──────────────────────────────────────────────────────────── */
function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<Driver | null>(null);

  const employees = useMemo(() => companyDriversData.map(d => ({
    ...d,
    documents: [
      { id: 1, name: 'CDL Certificate',  type: 'PDF', uploadDate: '01/15/2024', size: '1.8 MB' },
      { id: 2, name: 'Medical Card',     type: 'PDF', uploadDate: '01/15/2024', size: '1.2 MB' },
      { id: 3, name: 'Working Contract', type: 'PDF', uploadDate: '01/15/2024', size: '2.5 MB' },
    ] as DocFile[],
    statements: [
      { id: 1, date: '01/01/2024', amount: '$4,250.00', type: d.paymentType==='miles'?'Miles':'Percentage' },
      { id: 2, date: '01/15/2024', amount: '$4,100.00', type: d.paymentType==='miles'?'Miles':'Percentage' },
      { id: 3, date: '02/01/2024', amount: '$4,500.00', type: d.paymentType==='miles'?'Miles':'Percentage' },
    ] as Statement[],
  })), []);

  const filtered = useMemo(() => employees.filter(e => {
    const q = searchQuery.toLowerCase();
    return e.firstName.toLowerCase().includes(q) || e.lastName.toLowerCase().includes(q) || e.name.toLowerCase().includes(q);
  }), [searchQuery, employees]);

  const workingCount = employees.filter(e => e.employmentStatus === 'Working').length;
  const firedCount   = employees.filter(e => e.employmentStatus === 'Fired').length;

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
          <span>🔍</span>
          <input type="text" placeholder="Search through employees..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>

        <div className="table-header employees-cols">
          <span>Name</span>
          <span>Position</span>
          <span>Payment Type</span>
          <span>Employment Status</span>
          <span>Action</span>
        </div>
        <div className="table-body">
          {filtered.length > 0 ? filtered.map(e => (
            <div key={e.id} className="table-row employees-cols">
              <span className="cell-name"><span className="row-avatar">👤</span>{e.name}</span>
              <span className="cell">{e.position}</span>
              <span className="cell">
                {/* Owner Operator = percent only; Company Driver = miles or percent */}
                <span className={`payment-badge ${e.paymentType === 'miles' ? 'miles' : 'percent'}`}>
                  {e.paymentType === 'miles' ? '📏 Per Mile' : '📊 Percentage'}
                </span>
              </span>
              <span className="cell">
                <span className={`employment-badge ${e.employmentStatus?.toLowerCase()}`}>{e.employmentStatus}</span>
              </span>
              <span className="cell"><button className="details-btn" onClick={() => setSelected(e)}>View Full Details</button></span>
            </div>
          )) : <div className="no-results">No employees found</div>}
        </div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selected.name} — Full Details</h2>
              <button className="close-btn" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="employee-info-section">
                <h3>Employee Information</h3>
                <div className="info-grid">
                  <div className="info-item"><strong>Name</strong><span>{selected.name}</span></div>
                  <div className="info-item"><strong>Position</strong><span>{selected.position}</span></div>
                  <div className="info-item"><strong>Equipment</strong><span>{selected.equipment}</span></div>
                  <div className="info-item"><strong>Payment Type</strong><span>{selected.paymentType === 'miles' ? 'Per Mile' : 'Percentage'}</span></div>
                  <div className="info-item"><strong>Employment Status</strong>
                    <span className={`employment-badge ${selected.employmentStatus?.toLowerCase()}`}>{selected.employmentStatus}</span>
                  </div>
                  <div className="info-item"><strong>Join Date</strong><span>{selected.date}</span></div>
                </div>
              </div>

              <div className="employee-info-section">
                <h3>Documents ({selected.documents?.length ?? 0})</h3>
                <div className="modal-documents-list">
                  {(selected.documents ?? []).map(doc => (
                    <div key={doc.id} className="modal-document-item">
                      <div className="document-icon-small">📄</div>
                      <div className="document-info-small"><strong>{doc.name}</strong><span>{doc.type} · {doc.size} · {doc.uploadDate}</span></div>
                      <button className="doc-action-btn open">Open</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="employee-info-section">
                <h3>Statements ({selected.statements?.length ?? 0})</h3>
                <div className="modal-statements-list">
                  {(selected.statements ?? []).map(s => (
                    <div key={s.id} className="modal-statement-item">
                      <div className="statement-icon-small">📋</div>
                      <div className="statement-info-small"><strong>{s.date}</strong><span>{s.type} — {s.amount}</span></div>
                      <button className="doc-action-btn open">View</button>
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

export default Dashboard;
