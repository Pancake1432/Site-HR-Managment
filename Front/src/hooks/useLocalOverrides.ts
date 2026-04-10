import { useCallback } from 'react';
import axios from 'axios';
import { Driver } from '../types/dashboard';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:7001';
function getToken() { return localStorage.getItem('hr_access_token') ?? ''; }

interface OverrideFields {
  status?:           string;
  equipment?:        string;
  driverStatus?:     string;
  employmentStatus?: string;
  paymentType?:      string;
  notes?:            string;
}

export function useLocalOverrides() {
  const applyOverrides = useCallback(<T extends Driver>(drivers: T[]): T[] => drivers, []);

  const saveOverride = useCallback(async (driverId: number, fields: OverrideFields) => {
    try {
      await axios.put(
        `${BASE_URL}/api/drivers/${driverId}`,
        fields,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
    } catch (err) {
      console.error('saveOverride error:', err);
    }
  }, []);

  return { applyOverrides, saveOverride };
}
