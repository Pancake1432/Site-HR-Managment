import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSavedStatements } from '../../contexts/SavedStatementsContext';
import { useSettings, fmtCurrency, fmtDate } from '../../contexts/SettingsContext';
import { SavedStatement } from '../../types/dashboard';
import { downloadStatementPDF } from '../../utils/pdfUtils';
import { Emoji } from '../Emoji';

// ── Weekly Pay Strip ────────────────────────────────────────────────────────
// One cell per Friday (pay day), spanning the last 52 weeks.
// Color intensity = total $ paid that week. Hover shows date range + amount.
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function WeeklyPayStrip({
  statements,
  currency,
  payDay,
}: {
  statements: SavedStatement[];
  currency: string;
  payDay: number;
}) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    lines: string[];
  } | null>(null);

  const WEEKS = 52;
  const sym = currency === 'EUR' ? '€' : '$';

  // Find the most recent pay day (based on settings)
  const latestPayDay = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const dow = d.getDay();
    const diff = (dow - payDay + 7) % 7;
    d.setDate(d.getDate() - diff);
    return d;
  }, [payDay]);

  // Build a map: fridayISO -> { total, count, drivers }
  const weekMap = useMemo(() => {
    const map: Record<string, { total: number; count: number; drivers: Set<string> }> = {};
    statements.forEach((s) => {
      const d = new Date(s.savedAt);
      d.setHours(0, 0, 0, 0);
      // Find the pay day of that week
      const dow = d.getDay();
      const daysToPayDay = (payDay - dow + 7) % 7;
      const fri = new Date(d);
      fri.setDate(d.getDate() + daysToPayDay);
      const key = fri.toISOString().slice(0, 10);
      if (!map[key]) map[key] = { total: 0, count: 0, drivers: new Set() };
      map[key].total += parseFloat(s.total || '0');
      map[key].count += 1;
      map[key].drivers.add(s.driverName);
    });
    return map;
  }, [statements, payDay]);

  // Build ordered array of WEEKS weeks, newest on the right
  const weeks = useMemo(() => {
    return Array.from({ length: WEEKS }, (_, i) => {
      const fri = new Date(latestPayDay);
      fri.setDate(latestPayDay.getDate() - (WEEKS - 1 - i) * 7);
      const key = fri.toISOString().slice(0, 10);
      const data = weekMap[key];

      // Monday of that week
      const mon = new Date(fri);
      mon.setDate(fri.getDate() - 4);

      return {
        key,
        fri,
        mon,
        total: data?.total ?? 0,
        count: data?.count ?? 0,
        drivers: data?.drivers ?? new Set<string>(),
      };
    });
  }, [latestPayDay, weekMap]);

  const maxTotal = Math.max(...weeks.map((w) => w.total), 1);

  const getColor = (total: number) => {
    if (total === 0) return 'var(--heatmap-empty, #ebedf0)';
    const t = total / maxTotal;
    if (t <= 0.25) return '#9be9a8';
    if (t <= 0.5) return '#40c463';
    if (t <= 0.75) return '#30a14e';
    return '#216e39';
  };

  // Month label positions
  const monthLabels = useMemo(() => {
    const labels: { label: string; idx: number; key: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((w, i) => {
      if (w.fri.getMonth() !== lastMonth) {
        labels.push({
          label: w.fri.toLocaleString('default', { month: 'short' }),
          idx: i,
          key: w.key,
        });
        lastMonth = w.fri.getMonth();
      }
    });
    return labels;
  }, [weeks]);

  const fmtShort = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const CELL = 18, GAP = 4;

  return (
    <div style={{ position: 'relative' }}>
      {/* Month labels */}
      <div style={{ display: 'flex', marginBottom: 6, position: 'relative', height: 16 }}>
        {monthLabels.map((m) => (
          <span
            key={m.key}
            style={{
              position: 'absolute',
              left: m.idx * (CELL + GAP),
              fontSize: 11,
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
            }}
          >
            {m.label}
          </span>
        ))}
      </div>

      {/* Cells row */}
      <div style={{ display: 'flex', gap: GAP, alignItems: 'center' }}>
        {weeks.map((w) => (
          <div
            key={w.key}
            style={{
              width: CELL,
              height: CELL,
              borderRadius: 4,
              background: getColor(w.total),
              flexShrink: 0,
              cursor: w.count > 0 ? 'pointer' : 'default',
              position: 'relative',
              transition: 'transform 0.1s',
            }}
            onMouseEnter={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const prevPayDay = new Date(w.fri);
              prevPayDay.setDate(w.fri.getDate() - 7);
              const lines =
                w.count === 0
                  ? [
                      `${fmtShort(prevPayDay)} – ${fmtShort(w.fri)}`,
                      'No payouts this week',
                    ]
                  : [
                      `📅 ${fmtShort(prevPayDay)} – ${fmtShort(w.fri)}`,
                      `💰 ${sym}${w.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} paid out`,
                      `📋 ${w.count} statement${w.count !== 1 ? 's' : ''}`,
                      `👤 ${[...w.drivers].join(', ')}`,
                    ];
              setTooltip({ x: r.left + r.width / 2, y: r.top - 8, lines });
            }}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginTop: 10,
          justifyContent: 'flex-end',
        }}
      >
        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Less</span>
        {['var(--heatmap-empty, #ebedf0)', '#9be9a8', '#40c463', '#30a14e', '#216e39'].map(
          (c, i) => (
            <div
              key={i}
              style={{ width: CELL, height: CELL, borderRadius: 3, background: c }}
            />
          )
        )}
        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            background: '#1a202c',
            color: '#fff',
            fontSize: 12,
            padding: '8px 12px',
            borderRadius: 8,
            pointerEvents: 'none',
            zIndex: 9999,
            boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            whiteSpace: 'nowrap',
          }}
        >
          {tooltip.lines.map((l, i) => (
            <span key={i} style={{ opacity: i === 0 ? 0.65 : 1, fontWeight: i === 0 ? 400 : 500 }}>
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main SalaryPage ─────────────────────────────────────────────────────────
export default function SalaryPage() {
  const { statements, removeStatement, clearStatements } = useSavedStatements();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatement, setSelectedStatement] = useState<SavedStatement | null>(null);

  const totalPaid = statements
    .reduce((sum, s) => sum + parseFloat(s.total || '0'), 0)
    .toFixed(2);
  const totalBonuses = statements
    .filter((s) => s.adjustmentType === 'bonus' && parseFloat(s.adjustmentAmount || '0') > 0)
    .reduce((sum, s) => sum + parseFloat(s.adjustmentAmount || '0'), 0)
    .toFixed(2);
  const totalDeductions = statements
    .filter((s) => s.adjustmentType === 'deduction' && parseFloat(s.adjustmentAmount || '0') > 0)
    .reduce((sum, s) => sum + parseFloat(s.adjustmentAmount || '0'), 0)
    .toFixed(2);

  const filteredStatements = useMemo(() => {
    if (!searchQuery.trim()) return statements;
    const q = searchQuery.toLowerCase();
    return statements.filter((s) => s.driverName.toLowerCase().includes(q));
  }, [statements, searchQuery]);

  const handleDownload = (s: SavedStatement) =>
    downloadStatementPDF(s, settings.currency, settings.distanceUnit, settings.dateFormat);

  const handleDelete = (id: string) => {
    if (confirm('Remove this statement from Salary?')) removeStatement(id);
  };

  const handleClearAll = () => {
    if (confirm('Remove all saved statements? This cannot be undone.')) clearStatements();
  };

  if (statements.length === 0) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Salary</h1>
          <p className="page-subtitle">Saved driver payment statements</p>
        </div>
        <div className="card">
          <div className="in-progress" style={{ padding: '56px 20px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <Emoji symbol="💰" size={56} />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>No Statements Saved</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              Generate a statement and press <strong>Save to Salary</strong> to see it here.
            </p>
            <button
              className="generate-btn"
              style={{ maxWidth: 260 }}
              onClick={() => navigate('/dashboard/statements')}
            >
              Go to Statements
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Salary</h1>
        <p className="page-subtitle">Saved driver payment statements</p>
      </div>

      {/* ── 4 summary cards ── */}
      <div className="salary-summary-row salary-summary-4col">
        <div className="card salary-summary-card">
          <div className="salary-summary-label">Total Statements</div>
          <div className="salary-summary-value">{statements.length}</div>
        </div>
        <div className="card salary-summary-card salary-summary-total">
          <div className="salary-summary-label">Total Paid Out</div>
          <div className="salary-summary-value">
            {fmtCurrency(totalPaid, settings.currency)}
          </div>
        </div>
        <div className="card salary-summary-card" style={{ borderTop: '3px solid #38a169' }}>
          <div className="salary-summary-label">Total Bonuses</div>
          <div className="salary-summary-value" style={{ color: '#38a169', fontSize: 22 }}>
            +{fmtCurrency(totalBonuses, settings.currency)}
          </div>
        </div>
        <div className="card salary-summary-card" style={{ borderTop: '3px solid #e53e3e' }}>
          <div className="salary-summary-label">Total Deductions</div>
          <div className="salary-summary-value" style={{ color: '#e53e3e', fontSize: 22 }}>
            -{fmtCurrency(totalDeductions, settings.currency)}
          </div>
        </div>
      </div>

      {/* ── Weekly pay strip ── */}
      <div className="card" style={{ marginTop: 16 }}>
        <div
          className="card-header"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
        >
          <div>
            <h2 className="card-title">Weekly Pay Activity</h2>
          </div>
          <span
            style={{
              fontSize: 11,
              padding: '3px 10px',
              borderRadius: 20,
              background: 'rgba(56,161,105,0.1)',
              color: '#38a169',
              fontWeight: 600,
              border: '1px solid rgba(56,161,105,0.25)',
              whiteSpace: 'nowrap',
            }}
          >
            📅 Paid every {DAY_NAMES[parseInt(settings.payDay)]}
          </span>
        </div>
        <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
          <WeeklyPayStrip statements={statements} currency={settings.currency} payDay={parseInt(settings.payDay)} />
        </div>
      </div>

      {/* ── Statements table ── */}
      <div className="card" style={{ marginTop: 16 }}>
        <div
          className="card-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h2 className="card-title">Saved Statements</h2>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 12px', borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg-card-secondary)',
              fontSize: 13,
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>🔍</span>
              <input
                type="text"
                placeholder="Search driver…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  border: 'none', background: 'transparent',
                  outline: 'none', fontSize: 13,
                  color: 'var(--text-primary)', width: 140,
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    border: 'none', background: 'none', cursor: 'pointer',
                    color: 'var(--text-secondary)', fontSize: 14, padding: 0, lineHeight: 1,
                  }}
                >✕</button>
              )}
            </div>
          </div>
          <button
            className="salary-clear-btn"
            onClick={handleClearAll}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Emoji symbol="🗑️" size={14} /> Clear All
          </button>
        </div>

        {/* Per-driver summary banner — shown when search filters to one driver */}
        {searchQuery.trim() && filteredStatements.length > 0 &&
          new Set(filteredStatements.map(s => s.driverName)).size === 1 &&
          (() => {
            const ds = filteredStatements;
            const dTotal = ds.reduce((s, st) => s + parseFloat(st.total || '0'), 0);
            const dBonus = ds
              .filter(
                (s) =>
                  s.adjustmentType === 'bonus' && parseFloat(s.adjustmentAmount || '0') > 0
              )
              .reduce((s, st) => s + parseFloat(st.adjustmentAmount || '0'), 0);
            const dDeduct = ds
              .filter(
                (s) =>
                  s.adjustmentType === 'deduction' && parseFloat(s.adjustmentAmount || '0') > 0
              )
              .reduce((s, st) => s + parseFloat(st.adjustmentAmount || '0'), 0);
            return (
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '12px 16px',
                  margin: '0 0 16px',
                  background:
                    'linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.08))',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  flexWrap: 'wrap',
                }}
              >
                {[
                  { label: 'Driver', value: ds[0].driverName, color: 'var(--text-primary)' },
                  { label: 'Statements', value: String(ds.length), color: 'var(--text-primary)' },
                  {
                    label: 'Total Earned',
                    value: fmtCurrency(dTotal.toFixed(2), settings.currency),
                    color: 'var(--accent)',
                  },
                  ...(dBonus > 0
                    ? [
                        {
                          label: 'Bonuses',
                          value: '+' + fmtCurrency(dBonus.toFixed(2), settings.currency),
                          color: '#38a169',
                        },
                      ]
                    : []),
                  ...(dDeduct > 0
                    ? [
                        {
                          label: 'Deductions',
                          value: '-' + fmtCurrency(dDeduct.toFixed(2), settings.currency),
                          color: '#e53e3e',
                        },
                      ]
                    : []),
                ].map((item) => (
                  <div key={item.label} style={{ flex: 1, minWidth: 90 }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: 4,
                      }}
                    >
                      {item.label}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: item.color }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

        <div className="salary-table-wrapper">
          <table className="salary-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Driver</th>
                <th>Type</th>
                <th>Subtotal</th>
                <th>Adjustment</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStatements.map((s) => (
                <tr
                  key={s.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedStatement(s)}
                >
                  <td data-label="Date">
                    {fmtDate(new Date(s.savedAt), settings.dateFormat)}
                  </td>
                  <td data-label="Driver">
                    <strong>{s.driverName}</strong>
                  </td>
                  <td data-label="Type">
                    <span
                      className={`salary-badge salary-badge-${s.paymentType}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                    >
                      <Emoji symbol={s.paymentType === 'miles' ? '🛣️' : '📊'} size={14} />
                      {s.paymentType === 'miles' ? 'Per Mile' : 'Percent'}
                    </span>
                  </td>
                  <td data-label="Subtotal">
                    {fmtCurrency(s.subtotal, settings.currency)}
                  </td>
                  <td data-label="Adjustment">
                    {parseFloat(s.adjustmentAmount || '0') > 0 ? (
                      <span
                        className={
                          s.adjustmentType === 'bonus'
                            ? 'salary-adj-bonus'
                            : 'salary-adj-deduction'
                        }
                      >
                        {s.adjustmentType === 'bonus' ? '+' : '-'}
                        {fmtCurrency(s.adjustmentAmount, settings.currency)}
                        {s.adjustmentReason && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 400,
                              marginLeft: 4,
                              color: 'var(--text-secondary)',
                            }}
                          >
                            ({s.adjustmentReason})
                          </span>
                        )}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>—</span>
                    )}
                  </td>
                  <td data-label="Total">
                    <strong style={{ color: 'var(--accent)' }}>
                      {fmtCurrency(s.total, settings.currency)}
                    </strong>
                  </td>
                  <td data-label="Actions" onClick={(e) => e.stopPropagation()}>
                    <div className="salary-row-actions">
                      <button
                        className="salary-action-btn salary-action-pdf"
                        title="Download PDF"
                        onClick={() => handleDownload(s)}
                      >
                        <Emoji symbol="📄" size={16} />
                      </button>
                      <button
                        className="salary-action-btn salary-action-delete"
                        title="Delete"
                        onClick={() => handleDelete(s.id)}
                      >
                        <Emoji symbol="🗑️" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Statement detail modal ── */}
      {selectedStatement &&
        (() => {
          const s = selectedStatement;
          const du = settings.distanceUnit;
          return (
            <div className="modal-overlay" onClick={() => setSelectedStatement(null)}>
              <div
                className="modal-content modal-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>{s.driverName} — Statement Detail</h2>
                  <button
                    className="close-btn"
                    onClick={() => setSelectedStatement(null)}
                  >
                    ✕
                  </button>
                </div>
                <div className="modal-body">
                  <div className="statement-document">
                    <div className="statement-header">
                      <h1>Payment Statement</h1>
                      <p>Saved: {fmtDate(new Date(s.savedAt), settings.dateFormat)}</p>
                    </div>
                    <div className="statement-section">
                      <h3>Driver Information</h3>
                      <p>
                        <strong>Name:</strong> {s.driverName}
                      </p>
                    </div>
                    <div className="statement-section">
                      <h3>Payment Details</h3>
                      {s.paymentType === 'miles' ? (
                        <>
                          <p>
                            <strong>Payment Type:</strong> Per {du}
                          </p>
                          <p>
                            <strong>
                              {du.charAt(0).toUpperCase() + du.slice(1)} Driven:
                            </strong>{' '}
                            {s.miles} {du}
                          </p>
                          <p>
                            <strong>Rate per {du}:</strong>{' '}
                            {fmtCurrency(s.ratePerMile || '0', settings.currency)}
                          </p>
                        </>
                      ) : (
                        <>
                          <p>
                            <strong>Payment Type:</strong> Percentage
                          </p>
                          <p>
                            <strong>Percentage:</strong> {s.percent}%
                          </p>
                          <p>
                            <strong>Gross Amount:</strong>{' '}
                            {fmtCurrency(s.grossAmount || '0', settings.currency)}
                          </p>
                        </>
                      )}
                      <p>
                        <strong>Subtotal:</strong>{' '}
                        {fmtCurrency(s.subtotal, settings.currency)}
                      </p>
                    </div>
                    {parseFloat(s.adjustmentAmount || '0') > 0 && (
                      <div className="statement-section">
                        <h3>Adjustments</h3>
                        <p>
                          <strong>Type:</strong>{' '}
                          {s.adjustmentType === 'bonus' ? '➕ Bonus' : '➖ Deduction'}
                        </p>
                        <p>
                          <strong>Amount:</strong>
                          <span
                            className={
                              s.adjustmentType === 'bonus'
                                ? 'salary-adj-bonus'
                                : 'salary-adj-deduction'
                            }
                            style={{ marginLeft: 6 }}
                          >
                            {s.adjustmentType === 'bonus' ? '+' : '-'}
                            {fmtCurrency(s.adjustmentAmount, settings.currency)}
                          </span>
                        </p>
                        {s.adjustmentReason && (
                          <p>
                            <strong>Reason:</strong> {s.adjustmentReason}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="statement-section statement-total">
                      <h3>Total Payment</h3>
                      <p className="total-amount">
                        {fmtCurrency(s.total, settings.currency)}
                      </p>
                    </div>
                  </div>
                  <div className="statement-actions" style={{ marginTop: 20 }}>
                    <button
                      className="download-btn"
                      onClick={() => handleDownload(s)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <Emoji symbol="📄" size={16} /> Download PDF
                    </button>
                    <button
                      style={{
                        padding: '10px 20px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        borderRadius: 8,
                        border: 'none',
                        background: 'rgba(229,62,62,0.1)',
                        color: '#e53e3e',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                      onClick={() => {
                        handleDelete(s.id);
                        setSelectedStatement(null);
                      }}
                    >
                      <Emoji symbol="🗑️" size={16} /> Delete
                    </button>
                    <button
                      className="close-preview-btn"
                      onClick={() => setSelectedStatement(null)}
                    >
                      Close
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
