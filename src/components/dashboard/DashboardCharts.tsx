import { useEffect, useRef } from 'react';
import { Emoji } from '../Emoji';

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface DonutSlice {
  value: number;
  color: string;
  label: string;
}

interface BarItem {
  label: string;
  value: number;
  color: string;
  emoji: string;
}

/* ─────────────────────────────────────────────
   ANIMATED COUNTER HOOK
───────────────────────────────────────────── */
function useAnimatedNumber(target: number, duration = 600) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(0);

  useEffect(() => {
    const start = prev.current;
    const end = target;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * ease);
      if (ref.current) ref.current.textContent = String(current);
      if (progress < 1) requestAnimationFrame(tick);
      else prev.current = end;
    };

    requestAnimationFrame(tick);
  }, [target, duration]);

  return ref;
}

/* ─────────────────────────────────────────────
   DONUT CHART
───────────────────────────────────────────── */
interface DonutProps {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: number;
}

function DonutChart({ slices, size = 140, thickness = 22, centerLabel, centerValue }: DonutProps) {
  const countRef = useAnimatedNumber(centerValue ?? 0);
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const total = slices.reduce((s, d) => s + d.value, 0);

  let offset = 0;
  const paths = slices.map((slice, i) => {
    const pct = total > 0 ? slice.value / total : 0;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const strokeDashoffset = -(offset * circumference);
    offset += pct;
    return (
      <circle
        key={i}
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={slice.color}
        strokeWidth={thickness}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        style={{
          transition:
            'stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1), stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)',
        }}
      />
    );
  });

  return (
    <div className="dc-donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        {/* track ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--bg-card-secondary)"
          strokeWidth={thickness}
        />
        {total > 0 ? (
          paths
        ) : (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--border)"
            strokeWidth={thickness}
            strokeDasharray={`${circumference * 0.3} ${circumference * 0.7}`}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="dc-donut-center">
        <span className="dc-donut-value" ref={countRef}>{centerValue ?? 0}</span>
        {centerLabel && <span className="dc-donut-sub">{centerLabel}</span>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   BAR CHART
───────────────────────────────────────────── */
interface BarChartProps {
  items: BarItem[];
}

function BarChart({ items }: BarChartProps) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="dc-bar-list">
      {items.map((item) => (
        <div key={item.label} className="dc-bar-row">
          <div className="dc-bar-meta">
            <span className="dc-bar-emoji"><Emoji symbol={item.emoji} size={18} /></span>
            <span className="dc-bar-label">{item.label}</span>
            <span className="dc-bar-count">{item.value}</span>
          </div>
          <div className="dc-bar-track">
            <div
              className="dc-bar-fill"
              style={{
                width: `${(item.value / max) * 100}%`,
                background: item.color,
                transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   LEGEND
───────────────────────────────────────────── */
function Legend({ slices }: { slices: DonutSlice[] }) {
  const total = slices.reduce((s, d) => s + d.value, 0);
  return (
    <div className="dc-legend">
      {slices.map((s) => (
        <div key={s.label} className="dc-legend-item">
          <span className="dc-legend-dot" style={{ background: s.color }} />
          <span className="dc-legend-label">{s.label}</span>
          <span className="dc-legend-value">{s.value}</span>
          <span className="dc-legend-pct">
            {total > 0 ? `${Math.round((s.value / total) * 100)}%` : '0%'}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */
interface DashboardChartsProps {
  applied: number;
  contacted: number;
  docsSent: number;
  driversReady: number;
  driversNotReady: number;
  equipmentCounts: Record<string, number>;
}

export default function DashboardCharts({
  applied,
  contacted,
  docsSent,
  driversReady,
  driversNotReady,
  equipmentCounts,
}: DashboardChartsProps) {
  const totalApplicants = applied + contacted + docsSent;
  const totalDrivers = driversReady + driversNotReady;

  const recruitingSlices: DonutSlice[] = [
    { value: applied,   color: '#3b82f6', label: 'Applied'   },
    { value: contacted, color: '#f59e0b', label: 'Contacted' },
    { value: docsSent,  color: '#10b981', label: 'Docs Sent' },
  ];

  const driverSlices: DonutSlice[] = [
    { value: driversReady,    color: '#667eea', label: 'Ready'     },
    { value: driversNotReady, color: '#e879f9', label: 'Not Ready' },
  ];

  const EQUIP_COLORS: Record<string, string> = {
    Van:        '#667eea',
    Reefer:     '#06b6d4',
    'Flat Bed': '#f59e0b',
    Any:        '#a78bfa',
  };
  const EQUIP_EMOJI: Record<string, string> = {
    Van: '🚐', Reefer: '❄️', 'Flat Bed': '🚛', Any: '🔄',
  };

  const barItems: BarItem[] = Object.entries(equipmentCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label,
      value,
      color: EQUIP_COLORS[label] ?? '#94a3b8',
      emoji: EQUIP_EMOJI[label] ?? '🚚',
    }));

  return (
    <div className="dc-grid">
      {/* ── CHART 1: RECRUITING PIPELINE ── */}
      <div className="dc-card">
        <div className="dc-card-header">
          <h3 className="dc-title">Recruiting Pipeline</h3>
          <span className="dc-badge">{totalApplicants} total</span>
        </div>
        <div className="dc-donut-layout">
          <DonutChart
            slices={recruitingSlices}
            centerValue={totalApplicants}
            centerLabel="Total"
          />
          <Legend slices={recruitingSlices} />
        </div>
      </div>

      {/* ── CHART 2: DRIVER READINESS ── */}
      <div className="dc-card">
        <div className="dc-card-header">
          <h3 className="dc-title">Driver Readiness</h3>
          <span className="dc-badge">{totalDrivers} drivers</span>
        </div>
        <div className="dc-donut-layout">
          <DonutChart
            slices={driverSlices}
            centerValue={driversReady}
            centerLabel="Ready"
          />
          <Legend slices={driverSlices} />
        </div>
      </div>

      {/* ── CHART 3: EQUIPMENT MIX ── */}
      <div className="dc-card">
        <div className="dc-card-header">
          <h3 className="dc-title">Equipment Mix</h3>
          <span className="dc-badge">
            {Object.values(equipmentCounts).reduce((a, b) => a + b, 0)} company drivers
          </span>
        </div>
        <BarChart items={barItems} />
      </div>
    </div>
  );
}
