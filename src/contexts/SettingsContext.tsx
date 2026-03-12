import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Note: useEffect is still used for persisting settings to localStorage.

export type Currency = 'USD' | 'EUR';
export type DistUnit = 'miles' | 'km';
export type DateFmt  = 'MM/DD/YY' | 'DD/MM/YY';
export type PayDay   = '0' | '1' | '2' | '3' | '4' | '5' | '6'; // Sun=0 … Sat=6

export interface AppSettings {
  darkMode:           boolean;
  currency:           Currency;
  distanceUnit:       DistUnit;
  dateFormat:         DateFmt;
  payDay:             PayDay;
  compactView:        boolean;
  emailNotifications: boolean;
  autoSave:           boolean;
}

const DEFAULTS: AppSettings = {
  darkMode:           false,
  currency:           'USD',
  distanceUnit:       'miles',
  dateFormat:         'MM/DD/YY',
  payDay:             '5',   // Friday
  compactView:        false,
  emailNotifications: true,
  autoSave:           true,
};

interface SettingsCtx {
  settings: AppSettings;
  update: <K extends keyof AppSettings>(key: K, val: AppSettings[K]) => void;
}

const Ctx = createContext<SettingsCtx>({ settings: DEFAULTS, update: () => {} });

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const s = localStorage.getItem('hr_settings');
      return s ? { ...DEFAULTS, ...JSON.parse(s) } : DEFAULTS;
    } catch { return DEFAULTS; }
  });

  useEffect(() => { localStorage.setItem('hr_settings', JSON.stringify(settings)); }, [settings]);

  const update = <K extends keyof AppSettings>(key: K, val: AppSettings[K]) =>
    setSettings(prev => ({ ...prev, [key]: val }));

  // Theme classes are applied via a React-managed wrapper div.
  // CSS selectors use `.dark` and `.compact` (not `html.dark`).
  const themeClass = [
    settings.darkMode    ? 'dark'    : '',
    settings.compactView ? 'compact' : '',
  ].filter(Boolean).join(' ') || undefined;

  return (
    <Ctx.Provider value={{ settings, update }}>
      <div className={themeClass} style={{ display: 'contents' }}>
        {children}
      </div>
    </Ctx.Provider>
  );
}

export const useSettings = () => useContext(Ctx);

/* ── Labels ── */
export const CURRENCY_SYMBOLS: Record<Currency, string> = { USD: '$', EUR: '€' };
export const CURRENCY_LABELS:  Record<Currency, string> = { USD: 'US Dollar ($)', EUR: 'Euro (€)' };
export const DIST_LABELS:      Record<DistUnit, string> = { miles: 'Miles (mi)', km: 'Kilometres (km)' };
export const DATE_LABELS:      Record<DateFmt,  string> = { 'MM/DD/YY': 'MM/DD/YY (US)', 'DD/MM/YY': 'DD/MM/YY (EU)' };
export const PAY_DAY_LABELS:   Record<PayDay,   string> = {
  '0': 'Sunday', '1': 'Monday', '2': 'Tuesday', '3': 'Wednesday',
  '4': 'Thursday', '5': 'Friday', '6': 'Saturday',
};

/* ─────────────────────────────────────────────────────────────────
   FORMAT HELPERS — import these in any component
───────────────────────────────────────────────────────────────── */

/**
 * Re-format a stored date string (any common format) into the user's chosen format.
 * Handles: MM/DD/YYYY, MM/DD/YY, DD/MM/YYYY, YYYY-MM-DD, JS Date objects.
 */
export function fmtDate(raw: string | Date | undefined | null, fmt: DateFmt): string {
  if (!raw) return '—';
  let d: Date;

  if (raw instanceof Date) {
    d = raw;
  } else {
    const s = raw.trim();
    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
      d = new Date(s + 'T00:00:00');
    // MM/DD/YYYY or MM/DD/YY
    } else if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(s)) {
      const [m, day, y] = s.split('/').map(Number);
      const year = y < 100 ? 2000 + y : y;
      d = new Date(year, m - 1, day);
    } else {
      return raw as string; // unrecognised — return as-is
    }
  }

  if (isNaN(d.getTime())) return raw as string;

  const mm  = String(d.getMonth() + 1).padStart(2, '0');
  const dd  = String(d.getDate()).padStart(2, '0');
  const yy  = String(d.getFullYear()).slice(-2);

  return fmt === 'DD/MM/YY' ? `${dd}/${mm}/${yy}` : `${mm}/${dd}/${yy}`;
}

/**
 * Format a numeric amount as currency string.
 * fmtCurrency(4250, 'USD') → '$4,250.00'
 * fmtCurrency(4250, 'EUR') → '€4,250.00'
 */
export function fmtCurrency(amount: number | string, currency: Currency): string {
  const n = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]/g, '')) : amount;
  if (isNaN(n)) return `${CURRENCY_SYMBOLS[currency]}0.00`;
  const sym = CURRENCY_SYMBOLS[currency];
  return `${sym}${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Returns the short distance label for the current unit.
 * fmtDistLabel('miles') → 'mi'   fmtDistLabel('km') → 'km'
 */
export function fmtDistUnit(unit: DistUnit): string {
  return unit === 'km' ? 'km' : 'mi';
}

/**
 * Returns "Per Mile" or "Per KM" for payment badges.
 */
export function fmtPerDist(unit: DistUnit): string {
  return unit === 'km' ? 'Per KM' : 'Per Mile';
}