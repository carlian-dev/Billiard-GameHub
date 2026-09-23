import { useEffect, useMemo, useState } from 'react';
import {
  getApiBase,
  login,
  logout,
  fetchMe,
  createCashier,
  fetchCashiers,
  updateCashier,
} from './lib/api.js';

function navigate(path) {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

function usePath() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  return path;
}

const theme = {
  bg: '#050607',
  bgSoft: '#0a0d0f',
  card: '#101416',
  card2: '#141a1d',
  cardBorder: '#21282d',
  input: '#121619',
  inputBorder: '#2a3238',
  inputFocus: '#2fd47e',
  text: '#f4f6f6',
  muted: '#a3abb2',
  faint: '#69727b',
  accent: '#2fd47e',
  accentDim: 'rgba(47,212,126,0.13)',
  danger: '#ff7a7a',
  dangerBg: 'rgba(229,72,77,0.12)',
  radius: 14,
  shadow: '0 18px 50px rgba(0,0,0,0.55)',
};

const css = `
  * { box-sizing: border-box; }
  html, body, #root { margin: 0; min-height: 100%; }
  body { background: ${theme.bg}; color: ${theme.text}; font-family: ui-sans-system, -apple-system, "Segoe UI", Roboto, Inter, sans-serif; -webkit-font-smoothing: antialiased; }
  a, button { font-family: inherit; }
  input:focus, button:focus-visible { outline: 2px solid ${theme.accent}; outline-offset: 2px; }
  .gh-btn { transition: transform .12s ease, opacity .12s ease, background .12s ease; }
  .gh-btn:hover:not(:disabled) { transform: translateY(-1px); }
  .gh-btn:disabled { opacity: .55; cursor: not-allowed; transform: none; }
  .gh-action:hover:not(:disabled) { background: #1c2328 !important; border-color: #39434b !important; }
  .gh-row:hover td { background: #12181b; }
  .gh-toast { animation: ghIn .25s ease; }
  @keyframes ghIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  @keyframes ghPulse { 0%,100% { opacity: 1; } 50% { opacity: .45; } }
  .gh-skeleton { animation: ghPulse 1.2s ease infinite; }
  @media (max-width: 960px) {
    .gh-login-wrap { flex-direction: column !important; gap: 28px !important; padding: 0 20px !important; margin-top: 10px !important; }
    .gh-hero { font-size: 44px !important; }
    .gh-card { width: 100% !important; max-width: 520px; }
    .gh-form-grid { grid-template-columns: 1fr !important; }
    .gh-create-btn { min-width: 0 !important; width: 100%; }
    .gh-nav-links { display: none !important; }
    .gh-content { padding: 0 16px 48px !important; }
    .gh-toolbar { flex-direction: column !important; align-items: stretch !important; }
    .gh-search { max-width: none !important; }
  }
`;

const s = {
  page: { background: `radial-gradient(1000px 500px at 20% -10%, rgba(47,212,126,0.08), transparent), ${theme.bg}`, color: theme.text, minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  topLink: { padding: '20px 30px 0', color: theme.muted, fontSize: 14, cursor: 'pointer', width: 'fit-content' },
  loginWrap: { display: 'flex', gap: 70, alignItems: 'center', justifyContent: 'center', maxWidth: 1180, margin: '48px auto', padding: '0 40px', flexWrap: 'wrap', flex: 1, width: '100%' },
  brandRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 26 },
  brandName: { fontWeight: 800, fontSize: 19, letterSpacing: 0.2 },
  eyebrow: { letterSpacing: 2.5, fontSize: 11, color: theme.accent, fontWeight: 800, marginBottom: 14 },
  hero: { fontSize: 68, lineHeight: 0.95, fontWeight: 850, margin: '0 0 16px', letterSpacing: -1.5 },
  sub: { color: theme.muted, fontSize: 16, lineHeight: 1.6, maxWidth: 430, margin: '0 0 24px' },
  pillRow: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  pill: { display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: theme.muted, background: 'rgba(255,255,255,0.03)', border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: '9px 15px' },
  dotLive: { width: 8, height: 8, borderRadius: 999, background: theme.accent, display: 'inline-block', boxShadow: '0 0 10px rgba(47,212,126,0.9)' },
  dotDim: { width: 8, height: 8, borderRadius: 999, background: '#5a6169', display: 'inline-block' },
  card: { width: 430, background: `linear-gradient(180deg, ${theme.card2}, ${theme.card})`, border: `1px solid ${theme.cardBorder}`, borderRadius: theme.radius, padding: 30, boxShadow: theme.shadow },
  cardTitle: { fontSize: 30, fontWeight: 850, margin: '0 0 6px', letterSpacing: -0.5 },
  cardSub: { color: theme.muted, fontSize: 14, margin: '0 0 20px', lineHeight: 1.55 },
  label: { display: 'block', fontSize: 11, letterSpacing: 1.4, fontWeight: 800, color: theme.muted, margin: '16px 0 8px' },
  input: { width: '100%', background: theme.input, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: 10, padding: '13px 14px', fontSize: 14.5, outline: 'none' },
  inputWrap: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: 8, top: 8, background: 'transparent', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: 12, padding: '6px 10px', borderRadius: 8 },
  primaryBtn: { width: '100%', marginTop: 20, background: '#fff', color: '#000', border: 'none', borderRadius: 999, padding: '14px 16px', fontSize: 15, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  error: { background: theme.dangerBg, border: '1px solid rgba(229,72,77,0.35)', color: '#ffb4b4', fontSize: 13, marginTop: 12, padding: '10px 12px', borderRadius: 10 },
  toast: { background: theme.accentDim, border: '1px solid rgba(47,212,126,0.35)', color: '#b8f4d4', fontSize: 13, marginTop: 12, padding: '10px 12px', borderRadius: 10 },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 30px', color: theme.faint, fontSize: 13, borderTop: `1px solid ${theme.cardBorder}`, marginTop: 'auto' },
  footerLink: { textDecoration: 'underline', cursor: 'pointer', color: theme.muted },
  nav: { position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: 18, padding: '13px 24px', borderBottom: `1px solid ${theme.cardBorder}`, background: 'rgba(5,6,7,0.92)', backdropFilter: 'blur(10px)' },
  navLinks: { display: 'flex', gap: 20, fontSize: 11.5, letterSpacing: 1.6, marginLeft: 24 },
  navLink: { color: theme.faint, fontWeight: 700, whiteSpace: 'nowrap' },
  navLinkActive: { color: '#fff', fontWeight: 800, whiteSpace: 'nowrap', borderBottom: `2px solid ${theme.accent}`, paddingBottom: 4 },
  adminBadge: { fontSize: 10, letterSpacing: 1.2, border: `1px solid ${theme.cardBorder}`, background: 'rgba(255,255,255,0.04)', borderRadius: 999, padding: '5px 11px', color: theme.muted, fontWeight: 800 },
  userPill: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${theme.cardBorder}`, background: 'rgba(255,255,255,0.03)', borderRadius: 999, padding: '8px 14px', fontSize: 13, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  logoutBtn: { background: 'transparent', color: theme.text, border: `1px solid ${theme.inputBorder}`, borderRadius: 10, padding: '9px 15px', fontSize: 11.5, letterSpacing: 1.2, fontWeight: 800, cursor: 'pointer' },
  content: { maxWidth: 1140, margin: '32px auto', padding: '0 28px 64px', width: '100%' },
  sectionEyebrow: { fontSize: 11, letterSpacing: 2.2, color: theme.accent, fontWeight: 800 },
  sectionTitle: { fontSize: 34, fontWeight: 850, margin: '8px 0', letterSpacing: -0.8 },
  sectionSub: { color: theme.muted, fontSize: 14.5, maxWidth: 620, lineHeight: 1.6, margin: '0 0 20px' },
  statsRow: { display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' },
  stat: { flex: '1 1 160px', background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 12, padding: '14px 16px' },
  statNum: { fontSize: 24, fontWeight: 850 },
  statLabel: { fontSize: 11, letterSpacing: 1.2, color: theme.muted, fontWeight: 700, marginTop: 4 },
  formCard: { background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: theme.radius, padding: 20, marginBottom: 18, boxShadow: '0 10px 30px rgba(0,0,0,0.35)' },
  formTitle: { fontSize: 13, fontWeight: 800, letterSpacing: 1.2, color: theme.muted, margin: '0 0 12px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 240px', gap: 12 },
  smallInput: { background: theme.input, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: 10, padding: '12px 13px', fontSize: 13.5, width: '100%', outline: 'none' },
  createBtn: { marginTop: 14, background: '#fff', color: '#000', border: 'none', borderRadius: 999, padding: '12px 22px', fontWeight: 800, fontSize: 14, cursor: 'pointer', minWidth: 220 },
  toolbar: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 },
  search: { flex: '1 1 240px', maxWidth: 340, background: theme.input, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: 999, padding: '11px 16px', fontSize: 13.5, outline: 'none' },
  filterBtn: (active) => ({ background: active ? '#fff' : 'transparent', color: active ? '#000' : theme.muted, border: `1px solid ${active ? '#fff' : theme.inputBorder}`, borderRadius: 999, padding: '9px 15px', fontSize: 12, fontWeight: 800, cursor: 'pointer', letterSpacing: 0.4 }),
  tableCard: { background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: theme.radius, padding: '4px 8px 10px', overflow: 'hidden' },
  tableScroll: { overflowX: 'auto' },
  th: { textAlign: 'left', fontSize: 10.5, letterSpacing: 1.4, color: theme.faint, padding: '15px 12px', fontWeight: 800, whiteSpace: 'nowrap' },
  td: { padding: '14px 12px', fontSize: 13.5, borderTop: '1px solid #1a2024', whiteSpace: 'nowrap' },
  statusActive: { fontSize: 11, fontWeight: 800, letterSpacing: 0.6, color: theme.accent, background: theme.accentDim, border: '1px solid rgba(47,212,126,0.3)', borderRadius: 999, padding: '6px 12px', display: 'inline-block' },
  statusArchived: { fontSize: 11, fontWeight: 800, letterSpacing: 0.6, color: '#a3abb2', background: 'rgba(163,171,178,0.1)', border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: '6px 12px', display: 'inline-block' },
  actionBtn: { background: 'rgba(255,255,255,0.03)', color: theme.text, border: `1px solid ${theme.inputBorder}`, borderRadius: 999, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginRight: 8, marginBottom: 4 },
  empty: { textAlign: 'center', padding: '44px 20px', color: theme.muted },
};

function GameHubMark({ size = 30 }) {
  return (
    <span style={{ width: size, height: size, borderRadius: 999, border: `2px solid ${theme.accent}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: theme.accent, fontSize: size * 0.5, fontWeight: 900, boxShadow: '0 0 18px rgba(47,212,126,0.35)', flexShrink: 0 }}>
      ◎
    </span>
  );
}

function Spinner() {
  return <span className="gh-skeleton" style={{ width: 16, height: 16, borderRadius: 999, border: '2px solid rgba(0,0,0,0.25)', borderTopColor: '#000', display: 'inline-block' }} />;
}

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;
    setError('');
    if (username.trim().length < 3) {
      setError('Enter your username (min 3 characters).');
      return;
    }
    if (password.length < 6) {
      setError('Enter your password (min 6 characters).');
      return;
    }
    setBusy(true);
    try {
      const { body, status } = await login(username.trim(), password);
      if (!body || !body.success) {
        setError((body && body.error && body.error.message) || `Login failed (${status}).`);
        return;
      }
      const user = body.data && body.data.user;
      onLogin(user);
      navigate(user && user.role === 'ADMIN' ? '/admin/cashiers' : '/login');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={s.page}>
      <style>{css}</style>
      <div style={s.topLink} onClick={() => navigate('/')} role="link" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/')}>
        ← Back to hall
      </div>
      <div style={s.loginWrap} className="gh-login-wrap">
        <div style={{ flex: '1 1 400px', maxWidth: 520 }}>
          <div style={s.brandRow}>
            <GameHubMark />
            <span style={s.brandName}>GameHub</span>
          </div>
          <div style={s.eyebrow}>STAFF ACCESS</div>
          <h1 style={s.hero} className="gh-hero">Welcome<br />back.</h1>
          <p style={s.sub}>Cashier and Admin only. Guests don’t need an account — reserve directly at the hall.</p>
          <div style={s.pillRow}>
            <span style={s.pill}><span style={s.dotLive} /> Staff access · Admin & Cashier</span>
            <span style={s.pill}><span style={s.dotDim} /> Secure server sessions</span>
          </div>
        </div>
        <div style={s.card} className="gh-card">
          <h2 style={s.cardTitle}>Sign in</h2>
          <p style={s.cardSub}>Use your staff account. Contact admin if you need access.</p>
          <form onSubmit={handleSubmit}>
            <label style={s.label} htmlFor="gh-username">USERNAME</label>
            <input id="gh-username" style={s.input} placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required minLength={3} />
            <label style={s.label} htmlFor="gh-password">PASSWORD</label>
            <div style={s.inputWrap}>
              <input id="gh-password" style={{ ...s.input, paddingRight: 70 }} type={showPw ? 'text' : 'password'} placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required minLength={6} />
              <button type="button" style={s.eyeBtn} onClick={() => setShowPw((v) => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
            <button style={s.primaryBtn} className="gh-btn" type="submit" disabled={busy}>
              {busy ? (<><Spinner /> Signing in…</>) : 'Sign in →'}
            </button>
            {error && <div style={s.error} role="alert">{error}</div>}
          </form>
        </div>
      </div>
      <div style={s.footer}>
        <span>© 2026 GameHub · Bukidnon</span>
        <span style={s.footerLink} onClick={() => navigate('/')} role="link" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/')}>Public site</span>
      </div>
    </div>
  );
}

function CreateCashierForm({ onCreated, notify }) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState({ kind: '', text: '' });
  const [busy, setBusy] = useState(false);
  const valid = username.trim().length >= 3 && displayName.trim().length > 0 && password.length >= 6;

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy || !valid) return;
    setBusy(true);
    setMsg({ kind: '', text: '' });
    try {
      const { body } = await createCashier({ username: username.trim(), password, displayName: displayName.trim() });
      if (!body || !body.success) {
        setMsg({ kind: 'error', text: (body && body.error && body.error.message) || 'Could not create cashier.' });
        return;
      }
      setUsername('');
      setDisplayName('');
      setPassword('');
      notify(`Cashier "${body.data.user.username}" created.`);
      onCreated();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={s.formCard}>
      <p style={s.formTitle}>NEW CASHIER</p>
      <form onSubmit={handleSubmit}>
        <div style={s.formGrid} className="gh-form-grid">
          <input style={s.smallInput} placeholder="username (e.g. cashier3)" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="off" aria-label="Username" />
          <input style={s.smallInput} placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} autoComplete="off" aria-label="Display name" />
          <input style={s.smallInput} type="password" placeholder="password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" aria-label="Password" />
        </div>
        <button style={s.createBtn} className="gh-btn gh-create-btn" type="submit" disabled={!valid || busy}>
          {busy ? 'Creating…' : '＋ Create cashier'}
        </button>
        {!valid && (username || displayName || password) ? (
          <div style={{ color: theme.faint, fontSize: 12, marginTop: 8 }}>Username ≥ 3 chars, display name required, password ≥ 6 chars.</div>
        ) : null}
        {msg.text && <div style={msg.kind === 'success' ? s.toast : s.error} className="gh-toast">{msg.text}</div>}
      </form>
    </div>
  );
}

function AdminCashiersPage({ user, onLogout }) {
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [pendingId, setPendingId] = useState(null);

  async function refresh() {
    setLoading(true);
    try {
      const { body } = await fetchCashiers();
      if (!body || !body.success) {
        setError((body && body.error && body.error.message) || 'Could not load cashier accounts.');
        return;
      }
      setError('');
      setCashiers((body.data && body.data.users) || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const counts = useMemo(() => ({
    total: cashiers.length,
    active: cashiers.filter((c) => c.status === 'ACTIVE').length,
    archived: cashiers.filter((c) => c.status !== 'ACTIVE').length,
  }), [cashiers]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cashiers.filter((c) => {
      if (filter !== 'ALL' && (filter === 'ACTIVE' ? c.status !== 'ACTIVE' : c.status === 'ACTIVE')) return false;
      if (!q) return true;
      return `${c.username} ${c.displayName}`.toLowerCase().includes(q);
    });
  }, [cashiers, query, filter]);

  async function toggleStatus(c) {
    const next = c.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
    if (next === 'ARCHIVED' && !window.confirm(`Archive ${c.username}? They will be signed out and blocked from login.`)) return;
    setPendingId(c.id);
    try {
      const { body } = await updateCashier(c.id, { status: next });
      if (!body || !body.success) {
        setError((body && body.error && body.error.message) || 'Could not update status.');
        return;
      }
      setToast(next === 'ARCHIVED' ? `${c.username} archived.` : `${c.username} restored to ACTIVE.`);
      refresh();
    } finally {
      setPendingId(null);
    }
  }

  async function resetPassword(c) {
    const next = window.prompt(`New password for ${c.username} (min 6 chars):`, '');
    if (next === null) return;
    if (next.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setPendingId(c.id);
    try {
      const { body } = await updateCashier(c.id, { password: next });
      if (!body || !body.success) {
        setError((body && body.error && body.error.message) || 'Could not reset password.');
        return;
      }
      setError('');
      setToast(`Password for ${c.username} updated.`);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div style={s.page}>
      <style>{css}</style>
      <div style={s.nav}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 850, fontSize: 18, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <GameHubMark size={28} /> GameHub
        </span>
        <span style={s.adminBadge}>ADMIN</span>
        <div style={s.navLinks} className="gh-nav-links">
          <span style={s.navLink}>DASHBOARD</span>
          <span style={s.navLink}>TABLES</span>
          <span style={s.navLink}>PRICING</span>
          <span style={s.navLinkActive}>CASHIERS</span>
          <span style={s.navLink}>PRODUCTS</span>
          <span style={s.navLink}>LOGS</span>
        </div>
        <span style={s.userPill} title={`${user.displayName || user.username} (ADMIN)`}>
          <span style={s.dotLive} /> {user.displayName || user.username} <span style={{ color: theme.faint, fontSize: 11 }}>ADMIN</span>
        </span>
        <button style={s.logoutBtn} className="gh-btn" onClick={onLogout}>LOG OUT</button>
      </div>
      <div style={s.content} className="gh-content">
        <div style={s.sectionEyebrow}>ADMINISTRATION</div>
        <h1 style={s.sectionTitle}>Cashiers</h1>
        <p style={s.sectionSub}>Create and list cashier accounts. Archived accounts cannot sign in, and their existing sessions are invalidated.</p>

        <div style={s.statsRow}>
          <div style={s.stat}><div style={s.statNum}>{counts.total}</div><div style={s.statLabel}>TOTAL</div></div>
          <div style={s.stat}><div style={{ ...s.statNum, color: theme.accent }}>{counts.active}</div><div style={s.statLabel}>ACTIVE</div></div>
          <div style={s.stat}><div style={{ ...s.statNum, color: theme.muted }}>{counts.archived}</div><div style={s.statLabel}>ARCHIVED</div></div>
        </div>

        <CreateCashierForm onCreated={refresh} notify={setToast} />

        <div style={s.toolbar} className="gh-toolbar">
          <input style={s.search} className="gh-search" placeholder="Search username or display name…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search cashiers" />
          <div style={{ display: 'flex', gap: 8 }}>
            {['ALL', 'ACTIVE', 'ARCHIVED'].map((f) => (
              <button key={f} style={s.filterBtn(filter === f)} className="gh-btn" onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>

        <div style={s.tableCard}>
          {error && <div style={{ ...s.error, margin: 12 }} role="alert">{error}</div>}
          {toast && <div style={{ ...s.toast, margin: 12 }} className="gh-toast">{toast}</div>}
          <div style={s.tableScroll}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr>
                  <th style={s.th}>USERNAME</th>
                  <th style={s.th}>DISPLAY</th>
                  <th style={s.th}>STATUS</th>
                  <th style={s.th}>CREATED</th>
                  <th style={s.th}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [0, 1, 2].map((i) => (
                    <tr key={i}>
                      <td style={s.td} colSpan={5}><div className="gh-skeleton" style={{ height: 14, borderRadius: 8, background: '#1b2227' }} /></td>
                    </tr>
                  ))
                ) : visible.map((c) => (
                  <tr key={c.id} className="gh-row">
                    <td style={{ ...s.td, fontWeight: 800 }}>{c.username}</td>
                    <td style={{ ...s.td, whiteSpace: 'normal', minWidth: 140 }}>{c.displayName}</td>
                    <td style={s.td}>
                      <span style={c.status === 'ACTIVE' ? s.statusActive : s.statusArchived}>
                        {c.status === 'ACTIVE' ? '● ACTIVE' : '○ ARCHIVED'}
                      </span>
                    </td>
                    <td style={{ ...s.td, color: theme.faint, fontSize: 12 }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</td>
                    <td style={s.td}>
                      <button style={s.actionBtn} className="gh-btn gh-action" onClick={() => toggleStatus(c)} disabled={pendingId === c.id}>
                        {pendingId === c.id ? '…' : c.status === 'ACTIVE' ? 'Archive' : 'Restore'}
                      </button>
                      <button style={s.actionBtn} className="gh-btn gh-action" onClick={() => resetPassword(c)} disabled={pendingId === c.id}>
                        Reset password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && visible.length === 0 && (
            <div style={s.empty}>
              <div style={{ fontSize: 34, marginBottom: 8 }}>○</div>
              <div style={{ fontWeight: 800, color: theme.text }}>{cashiers.length === 0 ? 'No cashier accounts yet.' : 'No matches.'}</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>{cashiers.length === 0 ? 'Create the first cashier above to get started.' : 'Try a different search or filter.'}</div>
            </div>
          )}
          {!loading && visible.length > 0 && (
            <div style={{ padding: '10px 12px', color: theme.faint, fontSize: 12 }}>Showing {visible.length} of {cashiers.length}</div>
          )}
        </div>
        <div style={{ marginTop: 14, color: theme.faint, fontSize: 11 }}>API: <code>{getApiBase()}</code></div>
      </div>
    </div>
  );
}

function HallPage() {
  return (
    <div style={{ ...s.page, padding: 0 }}>
      <style>{css}</style>
      <div style={{ maxWidth: 980, margin: '70px auto', padding: '0 24px', width: '100%' }}>
        <div style={s.brandRow}>
          <GameHubMark size={34} />
          <span style={{ ...s.brandName, fontSize: 22 }}>GameHub</span>
        </div>
        <h1 style={{ fontSize: 52, fontWeight: 850, margin: '10px 0', letterSpacing: -1.5 }}>Billiards hall,<br />made simple.</h1>
        <p style={{ color: theme.muted, fontSize: 16, lineHeight: 1.6, maxWidth: 520 }}>Reserve a table as a guest — no account needed. Staff manage tables, sessions, and billing from the admin console.</p>
        <div style={{ display: 'flex', gap: 12, marginTop: 26, flexWrap: 'wrap' }}>
          <button style={{ ...s.primaryBtn, width: 'auto', marginTop: 0, padding: '14px 26px' }} className="gh-btn" onClick={() => navigate('/login')}>Staff login →</button>
          <button style={{ ...s.logoutBtn, padding: '14px 22px' }} className="gh-btn" onClick={() => navigate('/admin/cashiers')}>Admin cashiers</button>
        </div>
        <div style={{ ...s.pillRow, marginTop: 30 }}>
          <span style={s.pill}><span style={s.dotLive} /> Open for walk-ins</span>
          <span style={s.pill}><span style={s.dotDim} /> Guest reservations, no account</span>
        </div>
      </div>
      <div style={s.footer}>
        <span>© 2026 GameHub · Bukidnon</span>
        <span style={s.footerLink} onClick={() => navigate('/login')}>Staff access</span>
      </div>
    </div>
  );
}

export default function App() {
  const path = usePath();
  const [phase, setPhase] = useState('loading');
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchMe()
      .then(({ body }) => {
        if (cancelled) return;
        if (body && body.success && body.data && body.data.user) setUser(body.data.user);
        setPhase('ready');
      })
      .catch(() => { if (!cancelled) setPhase('ready'); });
    return () => { cancelled = true; };
  }, []);

  async function handleLogin(nextUser) { setUser(nextUser); setPhase('ready'); }
  async function handleLogout() { await logout(); setUser(null); navigate('/login'); }

  if (phase === 'loading') {
    return (
      <div style={s.page}>
        <style>{css}</style>
        <div style={{ margin: 'auto', textAlign: 'center', color: theme.muted }}>
          <GameHubMark />
          <p className="gh-skeleton">Checking session…</p>
        </div>
      </div>
    );
  }

  if (path === '/login') {
    if (user && user.role === 'ADMIN') navigate('/admin/cashiers');
    else if (user) navigate('/');
    return <LoginPage onLogin={handleLogin} />;
  }

  if (path === '/admin/cashiers' || path === '/admin') {
    if (!user) { navigate('/login'); return <LoginPage onLogin={handleLogin} />; }
    if (user.role !== 'ADMIN') {
      return (
        <div style={s.page}>
          <style>{css}</style>
          <div style={{ padding: 48, maxWidth: 560 }}>
            <h1 style={{ fontSize: 28 }}>Limited access</h1>
            <p style={{ color: theme.muted }}>Signed in as <strong>{user.username}</strong> ({user.role}). This view is limited to administrators.</p>
            <button style={s.logoutBtn} className="gh-btn" onClick={handleLogout}>Log out</button>
          </div>
        </div>
      );
    }
    return <AdminCashiersPage user={user} onLogout={handleLogout} />;
  }

  return <HallPage />;
}
