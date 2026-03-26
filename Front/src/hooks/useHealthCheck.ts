import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAxios } from 'react-axios-provider-kit';

type HealthStatus = 'checking' | 'online' | 'offline';

// ── useHealthCheck ────────────────────────────────────────────────────────────
// Apelează GET /api/health la pornirea aplicației.
// Backend ONLINE  → status = "online", aplicația continuă normal.
// Backend OPRIT   → status = "offline", redirect automat la /500.

export function useHealthCheck() {
  const { client } = useAxios();
  const navigate   = useNavigate();
  const [status, setStatus] = useState<HealthStatus>('checking');

  useEffect(() => {
    let cancelled = false;

    async function check() {
      setStatus('checking');
      try {
        await client.get('/api/health');
        if (!cancelled) setStatus('online');
      } catch {
        if (!cancelled) {
          setStatus('offline');
          navigate('/500', { replace: true });
        }
      }
    }

    check();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    status,
    isOnline:   status === 'online',
    isChecking: status === 'checking',
    isOffline:  status === 'offline',
  };
}
