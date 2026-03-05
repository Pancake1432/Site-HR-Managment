import { useState } from 'react';
import { DriverStatusType, EmploymentStatus, PaymentType } from '../types/dashboard';

/** Fields that can be edited per-driver and saved locally */
export interface DriverOverride {
  driverStatus?:      DriverStatusType;
  employmentStatus?:  EmploymentStatus;
  paymentType?:       PaymentType;
}

function getStorageKey(): string {
  try {
    const raw  = localStorage.getItem('currentUser');
    const user = raw ? JSON.parse(raw) : null;
    return `hr_driver_overrides_${user?.companyId ?? 'unknown'}`;
  } catch {
    return 'hr_driver_overrides_unknown';
  }
}

function load(): Record<number, DriverOverride> {
  try {
    const raw = localStorage.getItem(getStorageKey());
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function persist(data: Record<number, DriverOverride>) {
  localStorage.setItem(getStorageKey(), JSON.stringify(data));
}

/**
 * Stores per-driver field overrides (status, employment status, payment type)
 * in localStorage, scoped per company.
 * The base driver list still comes from driversData — this layer sits on top.
 * When the real backend arrives, swap this hook for API calls.
 */
export function useLocalOverrides() {
  const [overrides, setOverrides] = useState<Record<number, DriverOverride>>(load);

  /** Merge the saved overrides onto a base driver array */
  const applyOverrides = <T extends { id: number }>(drivers: T[]): T[] =>
    drivers.map(d => ({ ...d, ...(overrides[d.id] ?? {}) }));

  /** Save one or more fields for a driver */
  const saveOverride = (driverId: number, fields: DriverOverride) => {
    setOverrides(prev => {
      const next = { ...prev, [driverId]: { ...(prev[driverId] ?? {}), ...fields } };
      persist(next);
      return next;
    });
  };

  return { applyOverrides, saveOverride };
}
