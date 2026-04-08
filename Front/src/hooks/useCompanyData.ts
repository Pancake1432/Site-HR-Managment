import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { Driver } from '../types/dashboard';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:7001';

function getToken(): string {
  return localStorage.getItem('hr_access_token') ?? '';
}

interface CompanyData {
  companyDrivers: Driver[];
  applicants:     Driver[];
  companyName:    string;
  isLoading:      boolean;
  fetchError:     string | null;
  refresh:        () => void;
}

function getCompanyNameFromToken(): string {
  try {
    const token = localStorage.getItem('hr_access_token');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.companyName ?? '';
  } catch { return ''; }
}

/**
 * Normalises a raw API record so the frontend `Driver` shape is always met.
 * The backend serialises the timestamp as `createdAt`; we alias it to `date`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeRecord(raw: any): Driver {
  return {
    ...raw,
    date:      raw.date      ?? raw.createdAt ?? '',
    name:      raw.name      ?? `${raw.firstName ?? ''} ${raw.lastName ?? ''}`.trim(),
    firstName: raw.firstName ?? '',
    lastName:  raw.lastName  ?? '',
  } as Driver;
}

export function useCompanyData(): CompanyData {
  const [companyDrivers, setCompanyDrivers] = useState<Driver[]>([]);
  const [applicants,     setApplicants]     = useState<Driver[]>([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [fetchError,     setFetchError]     = useState<string | null>(null);
  const companyName = getCompanyNameFromToken();
  const loadingRef  = useRef(false);

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);
    setFetchError(null);
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const [driversRes, applicantsRes] = await Promise.all([
        axios.get<Driver[]>(`${BASE_URL}/api/drivers`,    { headers }),
        axios.get<Driver[]>(`${BASE_URL}/api/applicants`, { headers }),
      ]);
      setCompanyDrivers((driversRes.data   ?? []).map(normalizeRecord));
      setApplicants(    (applicantsRes.data ?? []).map(normalizeRecord));
    } catch (err: unknown) {
      console.error('useCompanyData fetch error:', err);

      // Surface a human-readable message so pages can show it instead of empty tables
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setFetchError('Session expired — please log in again.');
        } else if (err.response?.status === 500) {
          setFetchError('Server error. Check the backend console for details.');
        } else if (!err.response) {
          setFetchError('Cannot reach the server. Make sure the backend is running.');
        } else {
          setFetchError(`Unexpected error (${err.response.status}).`);
        }
      } else {
        setFetchError('Unknown error loading data.');
      }
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { companyDrivers, applicants, companyName, isLoading, fetchError, refresh: load };
}
