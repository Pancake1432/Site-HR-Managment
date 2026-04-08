import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusType } from '../../types/dashboard';
import { useCompanyData } from '../../hooks/useCompanyData';
import { useSavedStatements } from '../../contexts/SavedStatementsContext';
import { useAuth } from '../../contexts/AuthContext';
import { saveApplicantOverride } from '../../services/applicationSubmitService';
import StatusDropdown from './StatusDropdown';
import DashboardCharts from './DashboardCharts';
import { useSettings, fmtDate, CURRENCY_SYMBOLS, fmtDistUnit } from '../../contexts/SettingsContext';
import { Emoji } from '../Emoji';

export default function DashboardHome() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { companyDrivers, applicants, refresh, isLoading, fetchError } = useCompanyData();
  const { statements } = useSavedStatements();
  const {  } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusType | 'all'>('all');

  const drivers = companyDrivers;

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

  const handleStatusChange = useCallback(async (applicantId: number, newStatus: StatusType) => {
    await saveApplicantOverride(applicantId, { status: newStatus });
    refresh();
  }, [refresh]);

  const sym = CURRENCY_SYMBOLS[settings.currency];

  if (isLoading) {
    return (
      <div className="page">
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 16 }}>
          <Emoji symbol="⏳" size={24} /> Loading dashboard data…
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {fetchError && (
        <div style={{
          margin: '0 0 16px', padding: '12px 16px', borderRadius: 10,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#dc2626', fontSize: 14, display: 'flex', alignItems: 'center',
          gap: 10, justifyContent: 'space-between',
        }}>
          <span><strong>⚠️ Could not load data:</strong> {fetchError}</span>
          <button
            onClick={refresh}
            style={{ padding: '5px 14px', borderRadius: 7, border: '1px solid #dc2626',
              background: 'transparent', color: '#dc2626', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
          >
            Retry
          </button>
        </div>
      )}
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
        {/* RECRUITING */}
        <div className="card">
          <div className="card-header"><h2 className="card-title">Recruiting</h2></div>
          <div className="recruiting-stats">
            <span className="stat-badge">{applicants.length} Applications</span>
            <span className="stat-badge">{counts.applied} Applied</span>
            <span className="stat-badge">{counts.contacted} Contacted</span>
            <span className="stat-badge">{counts.docs} Docs Sent</span>
          </div>
          <div className="search-bar">
            <Emoji symbol="🔍" size={16} />
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
                <span className="cell-name">
                  <span className="row-avatar"><Emoji symbol="👤" size={20} /></span>
                  {a.name}
                </span>
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

        {/* QUICK ACTIONS */}
        <div className="card">
          <div className="card-header"><h2 className="card-title">Quick Actions</h2></div>
          <div className="quick-actions">
            {[
              { icon: '➕', label: 'Add New Driver',     action: () => navigate('/dashboard/drivers?add=true')     },
              { icon: '📄', label: 'Generate Statement', action: () => navigate('/dashboard/statements')   },
              { icon: '📁', label: 'Manage Documents',   action: () => navigate('/dashboard/documents')    },
              { icon: '👥', label: 'View All Drivers',   action: () => navigate('/dashboard/drivers')      },
              { icon: '🏢', label: 'Employee Records',   action: () => navigate('/dashboard/employees')    },
              { icon: '💰', label: 'Process Payroll',    action: () => navigate('/dashboard/salary')       },
            ].map(btn => (
              <button key={btn.label} className="action-btn" onClick={btn.action}>
                <span className="action-icon"><Emoji symbol={btn.icon} size={20} /></span>
                <span>{btn.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY — real events */}
      <div className="card">
        <div className="card-header"><h2 className="card-title">Recent Activities</h2></div>
        <div className="activity-list">
          {(() => {
            const events: { icon: string; title: string; sub: string; date: string; key: string }[] = [];

            // New applications
            applicants.slice(0, 3).forEach(a => events.push({
              icon: '📝', key: `app-${a.id}`,
              title: 'New application received',
              sub: `${a.name || `${a.firstName} ${a.lastName}`.trim() || 'Unknown'} applied for ${a.position}`,
              date: new Date(a.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }),
            }));

            // New drivers added
            companyDrivers.filter(d => d.employmentStatus === 'Working').slice(0, 2).forEach(d => events.push({
              icon: '🚚', key: `drv-${d.id}`,
              title: 'Driver added',
              sub: `${d.name || `${d.firstName} ${d.lastName}`.trim() || 'Unknown'} — ${d.position} (${d.equipment})`,
              date: new Date(d.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }),
            }));

            // Recent statements
            statements.slice(0, 3).forEach(s => events.push({
              icon: '📋', key: `stmt-${s.id}`,
              title: `Statement created for ${s.driverName}`,
              sub: `${s.paymentType === 'miles' ? `${s.miles} ${fmtDistUnit(settings.distanceUnit)}` : `${s.percent}% gross`} → Total: ${sym}${s.total}`,
              date: new Date(s.savedAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }),
            }));

            // Terminated drivers
            companyDrivers.filter(d => d.employmentStatus === 'Fired').slice(0, 2).forEach(d => events.push({
              icon: '🔴', key: `fired-${d.id}`,
              title: 'Driver terminated',
              sub: `${d.name || `${d.firstName} ${d.lastName}`.trim() || 'Unknown'} — ${d.position}`,
              date: new Date(d.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }),
            }));

            // Sort by date descending and take top 6 (guard against undefined dates)
            const sorted = events
              .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
              .slice(0, 6);

            return sorted.length > 0 ? sorted.map(item => (
              <div key={item.key} className="activity-item">
                <span className="activity-icon"><Emoji symbol={item.icon} size={22} /></span>
                <div className="activity-content">
                  <strong>{item.title}</strong>
                  <span className="activity-time">{item.sub}</span>
                </div>
                <span className="activity-date">{item.date}</span>
              </div>
            )) : (
              <div className="activity-item">
                <span className="activity-icon"><Emoji symbol="📋" size={22} /></span>
                <div className="activity-content">
                  <strong>No recent activity</strong>
                  <span className="activity-time">Activity will appear here as you use the system</span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
