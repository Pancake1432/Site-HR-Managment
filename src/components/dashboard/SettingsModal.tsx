import {
  useSettings,
  CURRENCY_LABELS, DIST_LABELS, DATE_LABELS,
  Currency, DistUnit, DateFmt,
} from '../../contexts/SettingsContext';
import { Emoji } from '../Emoji';

interface Props {
  onClose: () => void;
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="stg-section-header">
      <span className="stg-section-icon"><Emoji symbol={icon} size={16} /></span>
      <span className="stg-section-title">{title}</span>
    </div>
  );
}

function ToggleRow({
  label, sub, checked, onChange,
}: { label: string; sub?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="stg-row">
      <div className="stg-row-text">
        <span className="stg-row-label">{label}</span>
        {sub && <span className="stg-row-sub">{sub}</span>}
      </div>
      <button
        className={`stg-toggle ${checked ? 'stg-toggle--on' : ''}`}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
      >
        <span className="stg-toggle-thumb" />
      </button>
    </div>
  );
}

function SegmentRow<T extends string>({
  label, sub, value, options, onChange,
}: {
  label: string; sub?: string;
  value: T; options: Record<T, string>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="stg-row stg-row--col">
      <div className="stg-row-text">
        <span className="stg-row-label">{label}</span>
        {sub && <span className="stg-row-sub">{sub}</span>}
      </div>
      <div className="stg-segment">
        {(Object.entries(options) as [T, string][]).map(([key, display]) => (
          <button
            key={key}
            className={`stg-segment-btn ${value === key ? 'stg-segment-btn--active' : ''}`}
            onClick={() => onChange(key)}
          >
            {display}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Main modal ── */
export default function SettingsModal({ onClose }: Props) {
  const { settings, update } = useSettings();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content stg-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div className="stg-modal-title-wrap">
            <span className="stg-modal-icon"><Emoji symbol="⚙️" size={20} /></span>
            <h2>Settings</h2>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body stg-body">

          {/* ── APPEARANCE ── */}
          <SectionHeader icon="🎨" title="Appearance" />
          <div className="stg-card">
            <ToggleRow
              label="Dark Mode"
              sub="Switch to a darker interface"
              checked={settings.darkMode}
              onChange={v => update('darkMode', v)}
            />
            <div className="stg-divider" />
            <ToggleRow
              label="Compact View"
              sub="Reduce spacing for more content on screen"
              checked={settings.compactView}
              onChange={v => update('compactView', v)}
            />
          </div>

          {/* ── REGIONAL ── */}
          <SectionHeader icon="🌍" title="Regional" />
          <div className="stg-card">
            <SegmentRow<Currency>
              label="Currency"
              sub="Used across salary and payroll pages"
              value={settings.currency}
              options={CURRENCY_LABELS as Record<Currency, string>}
              onChange={v => update('currency', v)}
            />
            <div className="stg-divider" />
            <SegmentRow<DistUnit>
              label="Distance Unit"
              sub="Used for per-mile / per-km pay calculations"
              value={settings.distanceUnit}
              options={DIST_LABELS as Record<DistUnit, string>}
              onChange={v => update('distanceUnit', v)}
            />
            <div className="stg-divider" />
            <SegmentRow<DateFmt>
              label="Date Format"
              sub="Applied to all dates shown in the dashboard"
              value={settings.dateFormat}
              options={DATE_LABELS as Record<DateFmt, string>}
              onChange={v => update('dateFormat', v)}
            />
          </div>

          {/* ── NOTIFICATIONS ── */}
          <SectionHeader icon="🔔" title="Notifications" />
          <div className="stg-card">
            <ToggleRow
              label="Email Notifications"
              sub="Receive updates on new applications and documents"
              checked={settings.emailNotifications}
              onChange={v => update('emailNotifications', v)}
            />
          </div>

          {/* ── DATA ── */}
          <SectionHeader icon="💾" title="Data" />
          <div className="stg-card">
            <ToggleRow
              label="Auto-Save"
              sub="Automatically save changes as you make them"
              checked={settings.autoSave}
              onChange={v => update('autoSave', v)}
            />
          </div>

          {/* ── FOOTER ── */}
          <p className="stg-footer">
            Settings are saved automatically in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}
