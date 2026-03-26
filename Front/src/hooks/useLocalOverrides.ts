import { useCallback } from 'react';
import { useAxios } from 'react-axios-provider-kit';
import { Driver } from '../types/dashboard';

interface OverrideFields {
  status?:           string;
  equipment?:        string;
  driverStatus?:     string;
  employmentStatus?: string;
  paymentType?:      string;
}

/**
 * Înlocuiește vechiul useLocalOverrides care salva în localStorage.
 * Acum trimite modificările direct la API via PUT /api/drivers/{id}.
 *
 * applyOverrides — returnează datele neschimbate (API are deja datele reale)
 * saveOverride   — trimite modificarea la backend
 */
export function useLocalOverrides() {
  const { client } = useAxios();

  // Datele vin direct din API, nu mai trebuie aplicat niciun override local
  const applyOverrides = useCallback(<T extends Driver>(drivers: T[]): T[] => {
    return drivers;
  }, []);

  // Trimite modificarea la backend
  const saveOverride = useCallback(async (driverId: number, fields: OverrideFields) => {
    try {
      await client.put(`/api/drivers/${driverId}`, fields);
    } catch (err) {
      console.error('saveOverride error:', err);
    }
  }, [client]);

  return { applyOverrides, saveOverride };
}
