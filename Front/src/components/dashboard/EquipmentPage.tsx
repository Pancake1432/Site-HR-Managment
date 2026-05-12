import { FormEvent, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'hr_equipment_items';

const EQUIPMENT_TYPES = ['Van', 'Truck', 'Trailer', 'Reefer', 'Flat Bed'] as const;
const EQUIPMENT_STATUSES = ['Available', 'In Use', 'Maintenance'] as const;

type EquipmentType = typeof EQUIPMENT_TYPES[number];
type EquipmentStatus = typeof EQUIPMENT_STATUSES[number];

interface EquipmentItem {
  id: number;
  unitNumber: string;
  type: EquipmentType;
  plateNumber: string;
  status: EquipmentStatus;
  assignedDriver: string;
  inspectionDate: string;
  notes: string;
}

type EquipmentForm = Omit<EquipmentItem, 'id'>;

const emptyForm: EquipmentForm = {
  unitNumber: '',
  type: 'Truck',
  plateNumber: '',
  status: 'Available',
  assignedDriver: '',
  inspectionDate: '',
  notes: '',
};

const demoEquipment: EquipmentItem[] = [
  {
    id: 1,
    unitNumber: 'TR-101',
    type: 'Truck',
    plateNumber: 'ABC-102',
    status: 'In Use',
    assignedDriver: 'John Miller',
    inspectionDate: '2026-06-15',
    notes: 'Assigned to weekly route.',
  },
  {
    id: 2,
    unitNumber: 'VN-204',
    type: 'Van',
    plateNumber: 'VAN-204',
    status: 'Available',
    assignedDriver: '',
    inspectionDate: '2026-07-03',
    notes: 'Ready for new driver.',
  },
  {
    id: 3,
    unitNumber: 'RF-330',
    type: 'Reefer',
    plateNumber: 'RFR-330',
    status: 'Maintenance',
    assignedDriver: 'Michael Smith',
    inspectionDate: '2026-05-25',
    notes: 'Cooling system check.',
  },
];

function statusClass(status: EquipmentStatus) {
  if (status === 'Available') return 'status-equipment-available';
  if (status === 'In Use') return 'status-equipment-in-use';
  return 'status-equipment-maintenance';
}

function loadEquipment(): EquipmentItem[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return demoEquipment;

  try {
    const parsed = JSON.parse(saved) as EquipmentItem[];
    return Array.isArray(parsed) ? parsed : demoEquipment;
  } catch {
    return demoEquipment;
  }
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>(loadEquipment);
  const [form, setForm] = useState<EquipmentForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(equipment));
  }, [equipment]);

  const filteredEquipment = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return equipment;

    return equipment.filter(item =>
      item.unitNumber.toLowerCase().includes(query)
      || item.plateNumber.toLowerCase().includes(query)
      || item.type.toLowerCase().includes(query)
      || item.status.toLowerCase().includes(query)
      || item.assignedDriver.toLowerCase().includes(query),
    );
  }, [equipment, searchQuery]);

  const availableCount = equipment.filter(item => item.status === 'Available').length;
  const inUseCount = equipment.filter(item => item.status === 'In Use').length;
  const maintenanceCount = equipment.filter(item => item.status === 'Maintenance').length;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.unitNumber.trim() || !form.plateNumber.trim()) {
      alert('Completează Unit Number și Plate Number.');
      return;
    }

    if (editingId) {
      setEquipment(prev => prev.map(item => (
        item.id === editingId ? { ...form, id: editingId } : item
      )));
      setEditingId(null);
    } else {
      const newItem: EquipmentItem = {
        ...form,
        id: Date.now(),
      };
      setEquipment(prev => [newItem, ...prev]);
    }

    setForm(emptyForm);
  };

  const handleEdit = (item: EquipmentItem) => {
    setEditingId(item.id);
    setForm({
      unitNumber: item.unitNumber,
      type: item.type,
      plateNumber: item.plateNumber,
      status: item.status,
      assignedDriver: item.assignedDriver,
      inspectionDate: item.inspectionDate,
      notes: item.notes,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Sigur vrei să ștergi acest vehicul?')) {
      setEquipment(prev => prev.filter(item => item.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Equipment</h1>
        <p className="page-subtitle">CRUD pentru gestionarea vehiculelor companiei</p>
        <div className="stats-row">
          <div className="stat-item"><div className="stat-value">{equipment.length}</div><div className="stat-label">Total Units</div></div>
          <div className="stat-item"><div className="stat-value">{availableCount}</div><div className="stat-label">Available</div></div>
          <div className="stat-item"><div className="stat-value">{inUseCount}</div><div className="stat-label">In Use</div></div>
          <div className="stat-item"><div className="stat-value">{maintenanceCount}</div><div className="stat-label">Maintenance</div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">{editingId ? 'Edit Equipment' : 'Add Equipment'}</h2>
        </div>

        <form className="equipment-form" onSubmit={handleSubmit}>
          <label>
            Unit Number
            <input
              value={form.unitNumber}
              onChange={event => setForm(prev => ({ ...prev, unitNumber: event.target.value }))}
              placeholder="ex: TR-105"
            />
          </label>

          <label>
            Type
            <select
              value={form.type}
              onChange={event => setForm(prev => ({ ...prev, type: event.target.value as EquipmentType }))}
            >
              {EQUIPMENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>

          <label>
            Plate Number
            <input
              value={form.plateNumber}
              onChange={event => setForm(prev => ({ ...prev, plateNumber: event.target.value }))}
              placeholder="ex: KLM-245"
            />
          </label>

          <label>
            Status
            <select
              value={form.status}
              onChange={event => setForm(prev => ({ ...prev, status: event.target.value as EquipmentStatus }))}
            >
              {EQUIPMENT_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>

          <label>
            Assigned Driver
            <input
              value={form.assignedDriver}
              onChange={event => setForm(prev => ({ ...prev, assignedDriver: event.target.value }))}
              placeholder="ex: John Miller"
            />
          </label>

          <label>
            Inspection Date
            <input
              type="date"
              value={form.inspectionDate}
              onChange={event => setForm(prev => ({ ...prev, inspectionDate: event.target.value }))}
            />
          </label>

          <label className="equipment-notes-field">
            Notes
            <textarea
              value={form.notes}
              onChange={event => setForm(prev => ({ ...prev, notes: event.target.value }))}
              placeholder="Notes about maintenance, route or documents"
            />
          </label>

          <div className="equipment-form-actions">
            <button className="view-btn" type="submit">
              {editingId ? 'Save Changes' : 'Add Equipment'}
            </button>
            {editingId && (
              <button className="equipment-secondary-btn" type="button" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Equipment List</h2>
        </div>

        <div className="search-bar">
          <span>🔎</span>
          <input
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            placeholder="Search by unit, plate, driver, type or status..."
          />
        </div>

        <div className="table-header equipment-cols">
          <div>Unit</div>
          <div>Type</div>
          <div>Plate</div>
          <div>Status</div>
          <div>Driver</div>
          <div>Inspection</div>
          <div>Actions</div>
        </div>

        <div className="table-body">
          {filteredEquipment.length === 0 ? (
            <div className="no-results">No equipment found.</div>
          ) : filteredEquipment.map(item => (
            <div key={item.id} className="table-row equipment-cols">
              <div className="cell-name">🚛 {item.unitNumber}</div>
              <div className="cell"><span className="equip-badge">{item.type}</span></div>
              <div className="cell">{item.plateNumber}</div>
              <div className="cell"><span className={`status-badge ${statusClass(item.status)}`}>{item.status}</span></div>
              <div className="cell">{item.assignedDriver || 'Unassigned'}</div>
              <div className="cell">{item.inspectionDate || '-'}</div>
              <div className="equipment-action-cell">
                <button className="view-btn" type="button" onClick={() => handleEdit(item)}>Edit</button>
                <button className="equipment-delete-btn" type="button" onClick={() => handleDelete(item.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
