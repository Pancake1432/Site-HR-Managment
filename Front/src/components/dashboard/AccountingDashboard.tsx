import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanyData } from '../../hooks/useCompanyData';
import { useSavedStatements } from '../../contexts/SavedStatementsContext';
import { useSettings, fmtCurrency, fmtDistUnit } from '../../contexts/SettingsContext';
import { Emoji } from '../Emoji';

export default function AccountingDashboard() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { companyDrivers } = useCompanyData();
  const { statements } = useSavedStatements();

  const stats = useMemo(() => {
    const working = companyDrivers.filter(d => d.employmentStatus === 'Working').length;
    const fired   = companyDrivers.filter(d => d.employmentStatus === 'Fired').length;
    const totalPaid = statements.reduce((sum, s) => sum + (parseFloat(String(s.total)) || 0), 0);
    const avgPay    = statements.length > 0 ? totalPaid / statements.length : 0;
    const perMile   = companyDrivers.filter(d => d.paymentType === 'miles').length;
    const percent   = companyDrivers.filter(d => d.paymentType === 'percent').length;
    return { working, fired, totalPaid, avgPay, perMile, percent };
  }, [companyDrivers, statements]);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Accounting Dashboard</h1>
        <p className="page-subtitle">Financial overview — Paks Logistic LLC</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { icon: '👥', label: 'Active Employees', value: stats.working, color: '#48bb78' },
          { icon: '📋', label: 'Total Statements',  value: statements.length, color: 'var(--accent)' },
          { icon: '💵', label: 'Total Paid Out',     value: `${fmtCurrency(stats.totalPaid, settings.currency)}`, color: '#f6ad55' },
          { icon: '📊', label: 'Avg per Statement',  value: `${fmtCurrency(stats.avgPay, settings.currency)}`, color: '#76e4f7' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}><Emoji symbol={stat.icon} size={32} /></div>
            <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="content-grid">
        <div className="card">
          <div className="card-header"><h2 className="card-title">Quick Actions</h2></div>
          <div className="quick-actions">
            {[
              { icon: '📋', label: 'Generate Statement', action: () => navigate('/dashboard/statements') },
              { icon: '💰', label: 'View Salary Report',  action: () => navigate('/dashboard/salary') },
              { icon: '👥', label: 'Employee Records',    action: () => navigate('/dashboard/employees') },
            ].map(btn => (
              <button key={btn.label} className="action-btn" onClick={btn.action}>
                <span className="action-icon"><Emoji symbol={btn.icon} size={20} /></span>
                <span>{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Payment type breakdown */}
        <div className="card">
          <div className="card-header"><h2 className="card-title">Payment Type Breakdown</h2></div>
          <div style={{ padding: '16px 0' }}>
            {[
              { label: 'Per Mile drivers',    value: stats.perMile,  total: companyDrivers.length, color: '#667eea' },
              { label: 'Per Percent drivers', value: stats.percent,  total: companyDrivers.length, color: '#f6ad55' },
              { label: 'Active',              value: stats.working,  total: companyDrivers.length, color: '#48bb78' },
              { label: 'Terminated',          value: stats.fired,    total: companyDrivers.length, color: '#f87171' },
            ].map(row => (
              <div key={row.label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                  <span style={{ color: 'var(--text-primary)' }}>{row.label}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{row.value} / {row.total}</span>
                </div>
                <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${row.total > 0 ? (row.value / row.total) * 100 : 0}%`, background: row.color, borderRadius: 4, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Statements */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header"><h2 className="card-title">Recent Statements</h2></div>
        <div className="activity-list">
          {statements.slice(0, 6).length > 0 ? statements.slice(0, 6).map(s => (
            <div key={s.id} className="activity-item">
              <span className="activity-icon"><Emoji symbol="📋" size={22} /></span>
              <div className="activity-content">
                <strong>Statement for {s.driverName}</strong>
                <span className="activity-time">
                  {s.paymentType === 'miles'
                    ? `${s.miles} ${fmtDistUnit(settings.distanceUnit)} × ${s.ratePerMile}/${fmtDistUnit(settings.distanceUnit)}`
                    : `${s.percent}% of ${s.grossAmount}`}
                  {' → '}<strong style={{ color: '#48bb78' }}>{fmtCurrency(parseFloat(String(s.total)) || 0, settings.currency)}</strong>
                </span>
              </div>
              <span className="activity-date">{new Date(s.savedAt).toLocaleDateString()}</span>
            </div>
          )) : (
            <div className="activity-item">
              <span className="activity-icon"><Emoji symbol="📋" size={22} /></span>
              <div className="activity-content">
                <strong>No statements yet</strong>
                <span className="activity-time">Generate your first statement</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
