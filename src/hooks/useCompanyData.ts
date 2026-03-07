import { useState, useCallback, useEffect } from 'react';
import { getCompanyData } from '../data/driversData';

/**
 * Reads the logged-in user's companyId from localStorage and returns
 * the matching driver/applicant datasets.
 *
 * Uses useState + useEffect to guarantee fresh data on every mount
 * (tab switch, page navigation) and supports manual refresh after mutations.
 */
export function useCompanyData() {
  const loadData = useCallback(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      const user = raw ? JSON.parse(raw) : null;
      const companyId: string = user?.companyId ?? 'company-paks';
      return getCompanyData(companyId);
    } catch {
      return getCompanyData('company-paks');
    }
  }, []);

  const [data, setData] = useState(loadData);

  // Re-read from localStorage on every mount (handles tab switches / navigation)
  useEffect(() => {
    setData(loadData());
  }, [loadData]);

  /** Call after any mutation (add/delete/hire/override) to refresh the list */
  const refresh = useCallback(() => {
    setData(loadData());
  }, [loadData]);

  return { ...data, refresh };
}
