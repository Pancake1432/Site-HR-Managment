import { useState, useMemo } from 'react';
import { companyDriversData } from '../../data/driversData';

export default function DriversPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => companyDriversData.filter(d => {
    const q = searchQuery.toLowerCase();
    return (
      d.firstName.toLowerCase().includes(q) ||
      d.lastName.toLowerCase().includes(q) ||
      d.name.toLowerCase().includes(q)
    );
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
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
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
              <span className="cell">
                <span className={`status-badge status-driver-${d.driverStatus?.toLowerCase().replace(' ', '-')}`}>
                  {d.driverStatus}
                </span>
              </span>
              <span className="cell">{d.date}</span>
              <span className="cell"><button className="view-btn">View Details</button></span>
            </div>
          )) : <div className="no-results">No drivers found</div>}
        </div>
      </div>
    </div>
  );
}
