import { useMemo } from 'react';
import { getCompanyData } from '../data/driversData';

/**
 * Reads the logged-in user's companyId from localStorage and returns
 * the matching driver/applicant datasets.
 *
 * When the real backend is wired in, swap the localStorage read here
 * for an API call — every component stays untouched.
 */
export function useCompanyData() {
  return useMemo(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      const user = raw ? JSON.parse(raw) : null;
      const companyId: string = user?.companyId ?? 'company-paks';
      return getCompanyData(companyId);
    } catch {
      return getCompanyData('company-paks');
    }
  }, []);
}
