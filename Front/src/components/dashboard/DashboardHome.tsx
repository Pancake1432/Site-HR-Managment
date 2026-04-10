import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusType } from '../../types/dashboard';
import { useCompanyData } from '../../hooks/useCompanyData';
import { useDriverDocStorage, expiryStatus } from '../../hooks/useDriverDocStorage';
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
  const { getDriverDocs } = useDriverDocStorage();
  const { statements } = useSavedStatements();
  const {  } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusType | 'all'>('all');
  const [expiringDocs, setExpiringDocs]   = useState<{ driverName: string; docType: string; days: number | null }[]>([]);

  const drivers = companyDrivers;

  // Load expiring docs for all drivers when driver list changes
  useEffect(() => {
    if (companyDrivers.length === 0) return;
    const WARN_DAYS = 30;
    Promise.all(
      companyDrivers.map(d => getDriverDocs(d.id).then(docs => ({ driver: d, docs })))
    ).then(results => {
      const alerts: { driverName: string; docType: string; days: number | null }[] = [];
      results.forEach(({ driver, docs }) => {
        (['cdl', 'medicalCard'] as const).forEach(key => {
          const doc = docs[key];
          if (!doc?.expiryDate) return;
          const status = expiryStatus(doc.expiryDate);
          if (status === 'expired' || status === 'warning') {
            const ms   = new Date(doc.expiryDate).getTime() - Date.now();
            const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
            alerts.push({
              driverName: driver.name,
              docType: key === 'cdl' ? 'CDL Certificate' : 'Medical Card',
              days,
            });
          }
        });
      });
      setExpiringDocs(alerts);
    });
  }, [companyDrivers, getDriverDocs]);

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

      {/* ── Expiring Documents Alert ── */}
      {expiringDocs.length > 0 && (
        <div className="card" style={{ marginBottom: 20, borderLeft: expiringDocs.some(d => (d.days ?? 0) < 0) ? '4px solid #ef4444' : '4px solid #f59e0b' }}>
          <div className="card-header">
            <h2 className="card-title" style={{ color: expiringDocs.some(d => (d.days ?? 0) < 0) ? '#dc2626' : '#b45309' }}>
              <Emoji symbol={expiringDocs.some(d => (d.days ?? 0) < 0) ? '⛔' : '⚠️'} size={18} style={{ marginRight: 8 }} />
              {expiringDocs.filter(d => (d.days ?? 0) < 0).length > 0
                ? `${expiringDocs.filter(d => (d.days ?? 0) < 0).length} Expired Document${expiringDocs.filter(d => (d.days ?? 0) < 0).length > 1 ? 's' : ''} — Immediate Action Required`
                : `${expiringDocs.length} Document${expiringDocs.length > 1 ? 's' : ''} Expiring Within 30 Days`}
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 0 4px' }}>
            {expiringDocs.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: (item.days ?? 0) < 0 ? 'rgba(239,68,68,0.06)' : 'rgba(234,179,8,0.06)', border: `1px solid ${(item.days ?? 0) < 0 ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.25)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Emoji symbol={(item.days ?? 0) < 0 ? '⛔' : '⚠️'} size={16} />
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{item.driverName}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 8 }}>{item.docType}</span>
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: (item.days ?? 0) < 0 ? '#dc2626' : '#b45309' }}>
                  {(item.days ?? 0) < 0 ? `Expired ${Math.abs(item.days ?? 0)} days ago` : `Expires in ${item.days} days`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
