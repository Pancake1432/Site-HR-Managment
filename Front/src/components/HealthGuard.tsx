import { useHealthCheck } from '../hooks/useHealthCheck';

// ── HealthGuard ───────────────────────────────────────────────────────────────
// Verifică la pornire dacă backendul răspunde.
// Cât timp verifică → afișează loading spinner.
// Backend oprit    → useHealthCheck face redirect la /500.
// Backend online   → randează copiii normal.

export function HealthGuard({ children }: { children: React.ReactNode }) {
  const { isChecking, isOffline } = useHealthCheck();

  if (isChecking || isOffline) {
    return (
      <div style={{
        minHeight:      '100vh',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        background:     '#141210',
        gap:            16,
      }}>
        <div style={{
          width:        40,
          height:       40,
          borderRadius: '50%',
          border:       '3px solid #3a3530',
          borderTop:    '3px solid #e08a00',
          animation:    'spin 0.8s linear infinite',
        }} />
        <p style={{ color: '#a09890', fontSize: 14, margin: 0 }}>
          Connecting to server...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <>{children}</>;
}
