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
 * Fetches drivers and applicants using plain axios (not useAxios hook).
 * This avoids infinite re-render loops caused by unstable client references
 * from react-axios-provider-kit.
 */
export function useCompanyData(): CompanyData {
  const [companyDrivers, setCompanyDrivers] = useState<Driver[]>([]);
  const [applicants,     setApplicants]     = useState<Driver[]>([]);
  const companyName = getCompanyNameFromToken();
  const loadingRef = useRef(false);

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const [driversRes, applicantsRes] = await Promise.all([
        axios.get<Driver[]>(`${BASE_URL}/api/drivers`,    { headers }),
        axios.get<Driver[]>(`${BASE_URL}/api/applicants`, { headers }),
      ]);
      setCompanyDrivers(driversRes.data);
      setApplicants(applicantsRes.data);
    } catch (err) {
      console.error('useCompanyData fetch error:', err);
    } finally {
      loadingRef.current = false;
    }
  }, []); // ← empty deps — stable reference, no re-render loops

  useEffect(() => {
    load();
  }, [load]);

  return { companyDrivers, applicants, companyName, refresh: load };
}
