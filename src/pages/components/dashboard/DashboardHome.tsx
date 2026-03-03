import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusType } from '../../types/dashboard';
import { useCompanyData } from '../../hooks/useCompanyData';
import { useLocalOverrides } from '../../hooks/useLocalOverrides';
import { saveApplicantOverride } from '../../services/applicationSubmitService';
import StatusDropdown from './StatusDropdown';
import DashboardCharts from './DashboardCharts';
import { useSettings, fmtDate, CURRENCY_SYMBOLS } from '../../contexts/SettingsContext';

export default function DashboardHome() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { companyDrivers, applicants, refresh } = useCompanyData();
  const { applyOverrides } = useLocalOverrides();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusType | 'all'>('all');

  // Apply locally-saved status overrides so charts stay in sync with DriversPage
  const drivers = useMemo(() => applyOverrides(companyDrivers), [companyDrivers, applyOverrides]);

  const counts = useMemo(() => ({
    applied:   applicants.filter(a => a.status === 'Applied').length,
    contacted: applicants.filter(a => a.status === 'Contacted').length,
    docs:      applicants.filter(a => a.status === 'Documents Sent').length,
  }), [applicants]);

  const driversReady    = drivers.filter(d => d.driverStatus === 'Ready').length;
  const driversNotReady = drivers.filter(d => d.driverStatus === 'Not Ready').length;

  const equipmentCounts = useMemo(() =>
    drivers.reduce<Record<string, number>>((acc, d) => {
      acc[d.equipment] = (acc[d.equipment] || 0) + 1; return acc;
    }, {}), [drivers]);

  const filtered = useMemo(() => applicants.filter(a => {
    const q = searchQuery.toLowerCase();
    const matchSearch = a.firstName.toLowerCase().includes(q)
      || a.lastName.toLowerCase().includes(q)
      || a.name.toLowerCase().includes(q);
    return matchSearch && (statusFilter === 'all' || a.status === statusFilter);
  }), [searchQuery, statusFilter, applicants]);

  const handleStatusChange = useCallback((applicantId: number, newStatus: StatusType) => {
    saveApplicantOverride(applicantId, { status: newStatus });
    refresh();
  }, [refresh]);

  const sym = CURRENCY_SYMBOLS[settings.currency];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Track, manage and control all HR activities</p>
      </div>

      <DashboardCharts
        applied={counts.applied} contacted={counts.contacted} docsSent={counts.docs}
        driversReady={driversReady} driversNotReady={driversNotReady}
        equipmentCounts={equipmentCounts}
      />

      <div className="content-grid">
        {/* ── RECRUITING ── */}
        <div className="card">
          <div className="card-header"><h2 className="card-title">Recruiting</h2></div>
          <div className="recruiting-stats">
            <span className="stat-badge">{applicants.length} Applications</span>
            <span className="stat-badge">{counts.applied} Applied</span>
            <span className="stat-badge">{counts.contacted} Contacted</span>
            <span className="stat-badge">{counts.docs} Docs Sent</span>
          </div>
          <div className="search-bar">
            <span>🔍</span>
            <input type="text" placeholder="Search through candidates..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="filter-buttons">
            {(['all', 'Applied', 'Contacted', 'Documents Sent'] as const).map(f => (
              <button key={f} className={`filter-btn ${statusFilter === f ? 'active' : ''}`}
                onClick={() => setStatusFilter(f)}>{f === 'all' ? 'All' : f}</button>
            ))}
          </div>
          <div className="table-header recruiting-cols">
            <span>Candidates</span><span>Position</span><span>Equipment</span>
            <span>Status</span><span>Date</span><span>Action</span>
          </div>
          <div className="table-body scrollable">
            {filtered.length > 0 ? filtered.map(a => (
              <div key={a.id} className="table-row recruiting-cols">
                <span className="cell-name"><span className="row-avatar">👤</span>{a.name}</span>
                <span className="cell" data-label="Position">{a.position}</span>
                <span className="cell" data-label="Equipment"><span className="equip-badge">{a.equipment}</span></span>
                <span className="cell" data-label="Status">
                  <StatusDropdown value={a.status} onChange={s => handleStatusChange(a.id, s)} />
                </span>
                <span className="cell" data-label="Date">{fmtDate(a.date, settings.dateFormat)}</span>
                <span className="cell" data-label="Action">
                  <button className="check-btn" onClick={() => navigate(`/dashboard/documents/${a.id}`)}>Check</button>
                </span>
              </div>
            )) : <div className="no-results">No candidates found</div>}
          </div>
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div className="card">
          <div className="card-header"><h2 className="card-title">Quick Actions</h2></div>
          <div className="quick-actions">
            {[
              { icon: '➕', label: 'Add New Driver',     action: () => navigate('/apply')                  },
              { icon: '📄', label: 'Generate Statement', action: () => navigate('/dashboard/statements')   },
              { icon: '📁', label: 'Manage Documents',   action: () => navigate('/dashboard/documents')    },
              { icon: '👥', label: 'View All Drivers',   action: () => navigate('/dashboard/drivers')      },
              { icon: '🏢', label: 'Employee Records',   action: () => navigate('/dashboard/employees')    },
              { icon: '💰', label: 'Process Payroll',    action: () => navigate('/dashboard/salary')       },
            ].map(btn => (
              <button key={btn.label} className="action-btn" onClick={btn.action}>
                <span className="action-icon">{btn.icon}</span><span>{btn.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── RECENT ACTIVITY ── */}
      <div className="card">
        <div className="card-header"><h2 className="card-title">Recent Activities</h2></div>
        <div className="activity-list">
          {[
            { icon: '📝', title: 'New application received', sub: 'John Doe applied for Owner Operator position', time: '2 hours ago' },
            { icon: '✅', title: 'Document approved',         sub: "Jane Smith's contract was approved",          time: '5 hours ago' },
            { icon: '💵', title: 'Payroll processed',         sub: `Weekly payroll of ${sym}847k completed`,     time: '1 day ago'   },
          ].map(item => (
            <div key={item.title} className="activity-item">
              <span className="activity-icon">{item.icon}</span>
              <div className="activity-content">
                <strong>{item.title}</strong>
                <span className="activity-time">{item.sub}</span>
              </div>
              <span className="activity-date">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
