import { useState, useCallback } from 'react';
import { getCompanyData } from '../data/driversData';

/**
 * Reads the logged-in user's companyId from localStorage and returns
 * the matching driver/applicant datasets.
 *
 * Uses useState so the data can be refreshed after mutations (e.g. deleting an applicant).
 */
export function useCompanyData() {
  const getInitialData = () => {
    try {
      const raw = localStorage.getItem('currentUser');
      const user = raw ? JSON.parse(raw) : null;
      const companyId: string = user?.companyId ?? 'company-paks';
      return getCompanyData(companyId);
    } catch {
      return getCompanyData('company-paks');
    }
  };

  const [data, setData] = useState(getInitialData);

  /** Call this after any mutation (add/delete applicant) to refresh the list */
  const refresh = useCallback(() => {
    setData(getInitialData());
  }, []);

  return { ...data, refresh };
}
