import { useEffect, useState } from 'react';
import { fetchHealth, getApiBase } from './lib/api.js';

export default function App() {
  const [health, setHealth] = useState({ state: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetchHealth()
      .then(({ status, body }) => {
        if (cancelled) return;
        setHealth({ state: 'done', status, body });
      })
      .catch((err) => {
        if (cancelled) return;
        setHealth({ state: 'error', message: err && err.message ? err.message : 'Request failed.' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 720 }}>
      <h1>GameHub — MVP 0 Foundation</h1>
      <p>React + Vite + JavaScript frontend (Bun) talking to Express backend.</p>
      <p>
        API base: <code>{getApiBase()}</code>
      </p>
      <h2>Backend health</h2>
      <pre style={{ background: '#f4f4f4', padding: 12, borderRadius: 8 }}>
        {JSON.stringify(health, null, 2)}
      </pre>
      <p>MVP 0 only. No tables, reservations, sessions, billing, F&amp;B, payments, or reports here.</p>
    </div>
  );
}
