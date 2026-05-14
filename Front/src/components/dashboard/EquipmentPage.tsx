import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useSettings } from '../../contexts/SettingsContext';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:7001';
function getToken() { return localStorage.getItem('hr_access_token') ?? ''; }
function authH()    { return { Authorization: `Bearer ${getToken()}` }; }

// ── Types ─────────────────────────────────────────────────────────────────────
const EQUIPMENT_TYPES    = ['Van', 'Truck', 'Trailer', 'Reefer', 'Flat Bed'] as const;
const EQUIPMENT_STATUSES = ['Available', 'In Use', 'Maintenance'] as const;
type EqType   = typeof EQUIPMENT_TYPES[number];
type EqStatus = typeof EQUIPMENT_STATUSES[number];

interface EquipmentItem {
  id: number; unitNumber: string; type: EqType; plateNumber: string; vin: string;
  status: EqStatus; assignedDriver: string; assignedDriverId: number | null;
  inspectionDate: string; notes: string;
}
interface DriverOption { id: number; name: string; }
type EqForm = Omit<EquipmentItem, 'id'>;

const EMPTY: EqForm = {
  unitNumber: '', type: 'Truck', plateNumber: '', vin: '',
  status: 'Available', assignedDriver: '', assignedDriverId: null,
  inspectionDate: '', notes: '',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeEq(r: any): EquipmentItem {
  return {
    id: r.id ?? 0, unitNumber: r.unitNumber ?? '', type: r.type ?? 'Truck',
    plateNumber: r.plateNumber ?? '', vin: r.vin ?? '', status: r.status ?? 'Available',
    assignedDriver: r.assignedDriver ?? '', assignedDriverId: r.assignedDriverId ?? null,
    inspectionDate: r.inspectionDate ?? '', notes: r.notes ?? '',
  };
}

function statusCls(s: EqStatus) {
  return s === 'Available' ? 'status-equipment-available'
       : s === 'In Use'    ? 'status-equipment-in-use'
       : 'status-equipment-maintenance';
}

// ── Custom Date Picker (3 dropdowns: Month / Day / Year) ──────────────────────
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

function DatePicker({ value, onChange, iStyle }: {
  value: string;  // yyyy-MM-dd or ''
  onChange: (v: string) => void;
  iStyle: React.CSSProperties;
}) {
  // Parse value
  const parsed = value ? value.split('-') : ['', '', ''];
  const [year,  setYear]  = useState(parsed[0]);
  const [month, setMonth] = useState(parsed[1] ? String(parseInt(parsed[1])) : '');
  const [day,   setDay]   = useState(parsed[2] ? String(parseInt(parsed[2])) : '');

  // Sync if parent resets (e.g. form clear)
  useEffect(() => {
    const p = value ? value.split('-') : ['', '', ''];
    setYear(p[0] ?? '');
    setMonth(p[1] ? String(parseInt(p[1])) : '');
    setDay(p[2]   ? String(parseInt(p[2])) : '');
  }, [value]);

  const emit = (y: string, m: string, d: string) => {
    if (y && m && d) {
      const mm = m.padStart(2, '0');
      const dd = d.padStart(2, '0');
      onChange(`${y}-${mm}-${dd}`);
    } else if (!y && !m && !d) {
      onChange('');
    }
  };

  const numDays = (month && year) ? daysInMonth(parseInt(month), parseInt(year)) : 31;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  const selectStyle: React.CSSProperties = {
    ...iStyle,
    flex: 1,
    minWidth: 0,
    cursor: 'pointer',
  };

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {/* Month */}
      <select
        value={month}
        onChange={e => { setMonth(e.target.value); emit(year, e.target.value, day); }}
        style={{ ...selectStyle, flex: 2 }}
      >
        <option value="">Month</option>
        {MONTHS.map((name, i) => (
          <option key={i + 1} value={String(i + 1)}>{name}</option>
        ))}
      </select>

      {/* Day */}
      <select
        value={day}
        onChange={e => { setDay(e.target.value); emit(year, month, e.target.value); }}
        style={{ ...selectStyle, flex: 1 }}
      >
        <option value="">Day</option>
        {Array.from({ length: numDays }, (_, i) => i + 1).map(d => (
          <option key={d} value={String(d)}>{d}</option>
        ))}
      </select>

      {/* Year */}
      <select
        value={year}
        onChange={e => { setYear(e.target.value); emit(e.target.value, month, day); }}
        style={{ ...selectStyle, flex: 1.5 }}
      >
        <option value="">Year</option>
        {years.map(y => (
          <option key={y} value={String(y)}>{y}</option>
        ))}
      </select>

      {/* Clear button — only shown when a date is set */}
      {value && (
        <button
          type="button"
          onClick={() => { setYear(''); setMonth(''); setDay(''); onChange(''); }}
          style={{
            background: 'none', border: '1px solid var(--border)', borderRadius: 8,
            color: 'var(--text-secondary)', cursor: 'pointer', padding: '0 10px',
            fontSize: 16, lineHeight: 1, flexShrink: 0,
          }}
          title="Clear date"
        >×</button>
      )}
    </div>
  );
}

// ── Driver search ─────────────────────────────────────────────────────────────
function DriverSearch({ value, drivers, onChange, iStyle }: {
  value: string; drivers: DriverOption[]; iStyle: React.CSSProperties;
  onChange: (name: string, id: number | null) => void;
}) {
  const [q, setQ]       = useState(value);
  const [open, setOpen] = useState(false);
  const [hi, setHi]     = useState(-1);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQ(value); }, [value]);

  const list = useMemo(() => {
    const lq = q.trim().toLowerCase();
    return lq ? drivers.filter(d => d.name.toLowerCase().includes(lq)) : drivers;
  }, [q, drivers]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const pick  = (d: DriverOption) => { setQ(d.name); onChange(d.name, d.id); setOpen(false); };
  const clear = () => { setQ(''); onChange('', null); setOpen(false); };

  const onKey = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi(h => Math.min(h + 1, list.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setHi(h => Math.max(h - 1, -1)); }
    if (e.key === 'Enter' && hi >= 0) { e.preventDefault(); pick(list[hi]); }
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          value={q} autoComplete="off" placeholder="Search driver or leave empty…"
          onChange={e => { setQ(e.target.value); setOpen(true); setHi(-1); onChange(e.target.value, null); }}
          onFocus={() => setOpen(true)} onKeyDown={onKey}
          style={{ ...iStyle, width: '100%', boxSizing: 'border-box', paddingRight: q ? 32 : undefined }}
        />
        {q && (
          <button type="button" onClick={clear} style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', fontSize: 17, lineHeight: 1, padding: 0,
          }}>×</button>
        )}
      </div>
      {open && (
        <ul style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 9999,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 8, margin: 0, padding: 0, listStyle: 'none',
          maxHeight: 220, overflowY: 'auto',
          boxShadow: '0 8px 28px rgba(0,0,0,0.22)',
        }}>
          <li onMouseDown={e => { e.preventDefault(); clear(); }} style={{
            padding: '9px 13px', cursor: 'pointer', fontStyle: 'italic', fontSize: 13,
            color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)',
            background: hi === -1 ? 'var(--bg-card-secondary)' : 'transparent',
          }}>— Unassigned</li>
          {list.map((d, i) => (
            <li key={d.id} onMouseDown={e => { e.preventDefault(); pick(d); }} style={{
              padding: '9px 13px', cursor: 'pointer', color: 'var(--text-primary)', fontSize: 14,
              background: hi === i ? 'var(--bg-card-secondary)' : 'transparent',
              borderBottom: i < list.length - 1 ? '1px solid var(--border)' : undefined,
            }}>{d.name}</li>
          ))}
          {list.length === 0 && (
            <li style={{ padding: '9px 13px', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: 13 }}>
              No drivers found
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

// ── Error state type ──────────────────────────────────────────────────────────
type FormErrors = { unitNumber?: string; plateNumber?: string; general?: string };

// ── Modal ─────────────────────────────────────────────────────────────────────
function EquipmentModal({ editingItem, drivers, onClose, onSaved }: {
  editingItem: EquipmentItem | null;
  drivers: DriverOption[];
  onClose: () => void;
  onSaved: (wasEdit: boolean) => void;
}) {
  const { settings } = useSettings();
  const isEdit = editingItem !== null;

  const [form, setForm] = useState<EqForm>(isEdit ? {
    unitNumber: editingItem.unitNumber, type: editingItem.type,
    plateNumber: editingItem.plateNumber, vin: editingItem.vin,
    status: editingItem.status, assignedDriver: editingItem.assignedDriver,
    assignedDriverId: editingItem.assignedDriverId,
    inspectionDate: editingItem.inspectionDate, notes: editingItem.notes,
  } : EMPTY);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Input style — identical to DriversPage iStyle
  const iStyle: React.CSSProperties = {
    padding: '8px 10px', borderRadius: 8,
    border: '1px solid var(--border)',
    fontSize: 14,
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    colorScheme: settings.darkMode ? 'dark' : 'light',
    width: '100%', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const errStyle = (field: keyof FormErrors): React.CSSProperties =>
    errors[field]
      ? { ...iStyle, border: '1.5px solid #ef4444', background: 'rgba(239,68,68,0.06)' }
      : iStyle;

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.unitNumber.trim()) e.unitNumber = 'Unit Number is required.';
    if (!form.plateNumber.trim()) e.plateNumber = 'Plate Number is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setErrors({});
    const payload = {
      unitNumber:       form.unitNumber.trim(),
      type:             form.type,
      plateNumber:      form.plateNumber.trim(),
      vin:              form.vin.trim(),
      status:           form.status,
      assignedDriver:   form.assignedDriver.trim(),
      assignedDriverId: form.assignedDriverId,
      inspectionDate:   form.inspectionDate || null,
      notes:            form.notes.trim() || null,
    };
    try {
      if (isEdit) {
        await axios.put(`${BASE_URL}/api/equipment/${editingItem.id}`, payload, { headers: authH() });
      } else {
        await axios.post(`${BASE_URL}/api/equipment`, payload, { headers: authH() });
      }
      onSaved(isEdit);
      onClose();
    } catch {
      setErrors({ general: 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // Generic field setter — fixes TS2536 by keeping the generic on EqForm only
  const setField = <K extends keyof EqForm>(k: K, v: EqForm[K]) => {
    setForm(p => ({ ...p, [k]: v }));
    // Clear the matching error when the user edits that field
    if (k === 'unitNumber') setErrors(p => ({ ...p, unitNumber: undefined }));
    if (k === 'plateNumber') setErrors(p => ({ ...p, plateNumber: undefined }));
  };

  const labelSt: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: 6,
    fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-content" style={{ maxWidth: 680 }}>
        <div className="modal-header">
          <h2>{isEdit ? '✏️ Edit Equipment' : '➕ Add Equipment'}</h2>
          <button className="close-btn" onClick={onClose} type="button">×</button>
        </div>

        <div className="modal-body">
          {/* General error */}
          {errors.general && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 18, padding: '11px 15px',
              background: 'rgba(239,68,68,0.1)', color: '#ef4444',
              borderRadius: 8, fontSize: 14, fontWeight: 500,
              border: '1px solid rgba(239,68,68,0.25)',
            }}>
              <span style={{ fontSize: 18 }}>⚠️</span> {errors.general}
            </div>
          )}

          {!isEdit && (
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 18, marginTop: -4 }}>
              Fields marked with <span style={{ color: '#ef4444' }}>*</span> are required.
            </p>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Row 1: Unit | Type | Plate */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16 }}>
              <label style={labelSt}>
                <span>Unit Number <span style={{ color: '#ef4444' }}>*</span></span>
                <input
                  value={form.unitNumber}
                  onChange={e => setField('unitNumber', e.target.value)}
                  placeholder="ex: TR-105"
                  style={errStyle('unitNumber')}
                />
                {errors.unitNumber && <span style={{ color:'#ef4444', fontSize:12 }}>⚠ {errors.unitNumber}</span>}
              </label>

              <label style={labelSt}>
                Type
                <select value={form.type} onChange={e => setField('type', e.target.value as EqType)} style={iStyle}>
                  {EQUIPMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>

              <label style={labelSt}>
                <span>Plate Number <span style={{ color: '#ef4444' }}>*</span></span>
                <input
                  value={form.plateNumber}
                  onChange={e => setField('plateNumber', e.target.value)}
                  placeholder="ex: KLM-245"
                  style={errStyle('plateNumber')}
                />
                {errors.plateNumber && <span style={{ color:'#ef4444', fontSize:12 }}>⚠ {errors.plateNumber}</span>}
              </label>
            </div>

            {/* Row 2: Status (narrow) | Assigned Driver | Inspection Date (wide) */}
            <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1fr 1.6fr', gap: 16, marginBottom: 16 }}>
              <label style={labelSt}>
                Status
                <select value={form.status} onChange={e => setField('status', e.target.value as EqStatus)} style={iStyle}>
                  {EQUIPMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>

              <label style={labelSt}>
                Assigned Driver
                <DriverSearch
                  value={form.assignedDriver} drivers={drivers} iStyle={iStyle}
                  onChange={(name, id) => setForm(p => ({ ...p, assignedDriver: name, assignedDriverId: id }))}
                />
              </label>

              <label style={labelSt}>
                Inspection Date
                <DatePicker
                  value={form.inspectionDate}
                  onChange={v => setField('inspectionDate', v)}
                  iStyle={iStyle}
                />
              </label>
            </div>

            {/* Row 3: VIN full width */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelSt}>
                VIN #
                <input
                  value={form.vin}
                  onChange={e => setField('vin', e.target.value.toUpperCase())}
                  placeholder="17-character Vehicle Identification Number"
                  maxLength={17}
                  style={{ ...iStyle, fontFamily: 'monospace', letterSpacing: 2 }}
                />
              </label>
            </div>

            {/* Row 4: Notes full width */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelSt}>
                Notes
                <textarea
                  value={form.notes}
                  onChange={e => setField('notes', e.target.value)}
                  placeholder="Notes about maintenance, route or documents"
                  rows={3}
                  style={{ ...iStyle, resize: 'vertical', minHeight: 80 }}
                />
              </label>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
              <button type="button" onClick={onClose} className="equipment-secondary-btn"
                style={{ padding: '9px 22px', fontSize: 14 }}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className="view-btn"
                style={{ padding: '9px 24px', fontSize: 14, opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Equipment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EquipmentPage() {
  const [equipment,   setEquipment]   = useState<EquipmentItem[]>([]);
  const [drivers,     setDrivers]     = useState<DriverOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [toast,       setToast]       = useState<string | null>(null);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const loadDrivers = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/drivers`, { headers: authH() });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setDrivers((res.data as any[]).map(d => ({
        id: d.id,
        name: d.name ?? `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim(),
      })));
    } catch { /* best-effort */ }
  }, []);

  const loadEquipment = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await axios.get(`${BASE_URL}/api/equipment`, { headers: authH() });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setEquipment((res.data as any[]).map(normalizeEq));
    } catch {
      setError('Failed to load equipment. Check your connection and try again.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadEquipment(); loadDrivers(); }, [loadEquipment, loadDrivers]);

  // SSE real-time refresh
  useEffect(() => {
    const token = getToken(); if (!token) return;
    const es = new EventSource(`${BASE_URL}/api/events?access_token=${encodeURIComponent(token)}`);
    es.onmessage = e => { if (e.data === 'refresh') loadEquipment(); };
    return () => es.close();
  }, [loadEquipment]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return equipment;
    return equipment.filter(i =>
      i.unitNumber.toLowerCase().includes(q)     || i.plateNumber.toLowerCase().includes(q) ||
      i.vin.toLowerCase().includes(q)            || i.type.toLowerCase().includes(q) ||
      i.status.toLowerCase().includes(q)         || i.assignedDriver.toLowerCase().includes(q),
    );
  }, [equipment, searchQuery]);

  const counts = {
    total:       equipment.length,
    available:   equipment.filter(i => i.status === 'Available').length,
    inUse:       equipment.filter(i => i.status === 'In Use').length,
    maintenance: equipment.filter(i => i.status === 'Maintenance').length,
  };

  const openAdd    = () => { setEditingItem(null); setModalOpen(true); };
  const openEdit   = (item: EquipmentItem) => { setEditingItem(item); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingItem(null); };

  const handleSaved = (wasEdit: boolean) => {
    loadEquipment();
    showToast(wasEdit ? 'Equipment updated successfully.' : 'Equipment added successfully.');
  };

  const handleDelete = async (item: EquipmentItem) => {
    if (!window.confirm(`Delete "${item.unitNumber}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${BASE_URL}/api/equipment/${item.id}`, { headers: authH() });
      showToast('Equipment deleted.');
      loadEquipment();
    } catch {
      setError('Failed to delete. Please try again.');
    }
  };

  return (
    <div className="page">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff',
          padding: '11px 22px', borderRadius: 10, fontWeight: 600, fontSize: 14,
          boxShadow: '0 4px 20px rgba(99,102,241,0.4)', animation: 'slideUp 0.3s ease',
        }}>{toast}</div>
      )}

      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">Equipment</h1>
        <p className="page-subtitle">Manage company vehicles and trailers</p>
        <div className="stats-row">
          <div className="stat-item"><div className="stat-value">{counts.total}</div><div className="stat-label">Total Units</div></div>
          <div className="stat-item"><div className="stat-value">{counts.available}</div><div className="stat-label">Available</div></div>
          <div className="stat-item"><div className="stat-value">{counts.inUse}</div><div className="stat-label">In Use</div></div>
          <div className="stat-item"><div className="stat-value">{counts.maintenance}</div><div className="stat-label">Maintenance</div></div>
        </div>
      </div>

      {/* Equipment list card */}
      <div className="card">
        <div className="card-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h2 className="card-title">Equipment List</h2>
          <button className="view-btn" onClick={openAdd} style={{ padding: '8px 18px', fontSize: 13 }}>
            + Add Equipment
          </button>
        </div>

        {error && (
          <div style={{
            display:'flex', alignItems:'center', gap:10, margin:'0 0 16px',
            padding:'11px 15px', background:'rgba(239,68,68,0.1)', color:'#ef4444',
            borderRadius:8, fontSize:14, fontWeight:500, border:'1px solid rgba(239,68,68,0.25)',
          }}>
            <span style={{ fontSize:18 }}>⚠️</span>{error}
          </div>
        )}

        <div className="search-bar">
          <span>🔎</span>
          <input
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by unit, plate, VIN, driver, type or status…"
          />
        </div>

        {loading ? (
          <div style={{ padding:40, textAlign:'center', color:'var(--text-secondary)', fontSize:15 }}>
            Loading equipment…
          </div>
        ) : (
          <>
            <div className="table-header equipment-cols">
              <div>Unit</div><div>Type</div><div>Plate</div>
              <div>Status</div><div>Driver</div><div>Inspection</div><div>Actions</div>
            </div>
            <div className="table-body">
              {filtered.length === 0 ? (
                <div className="no-results">
                  {equipment.length === 0
                    ? 'No equipment yet. Click "+ Add Equipment" to get started.'
                    : 'No results match your search.'}
                </div>
              ) : filtered.map(item => (
                <div key={item.id} className="table-row equipment-cols">
                  <div className="cell-name">🚛 {item.unitNumber}</div>
                  <div className="cell"><span className="equip-badge">{item.type}</span></div>
                  <div className="cell">{item.plateNumber}</div>
                  <div className="cell">
                    <span className={`status-badge ${statusCls(item.status)}`}>{item.status}</span>
                  </div>
                  <div className="cell">{item.assignedDriver || 'Unassigned'}</div>
                  <div className="cell">{item.inspectionDate || '—'}</div>
                  <div className="equipment-action-cell">
                    <button className="view-btn"             type="button" onClick={() => openEdit(item)}>Edit</button>
                    <button className="equipment-delete-btn" type="button" onClick={() => handleDelete(item)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <EquipmentModal
          editingItem={editingItem}
          drivers={drivers}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}