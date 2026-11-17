import { useState } from 'react';
import { Home, Lock, ArrowLeft, User, KeyRound, PartyPopper } from 'lucide-react';
import { API, getSess, setSess } from './lib';
import Guest from './Guest';
import Admin from './Admin';

const post = async (path, body, headers = {}) => {
  const r = await fetch(API + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body || {}) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Error');
  return d;
};
const cap = s => s.trim().replace(/\b\p{L}/gu, c => c.toUpperCase());

export default function App() {
  const [sess, setS] = useState(getSess());
  const [view, setView] = useState('admin');
  const [screen, setScreen] = useState('guest'); // guest | admin
  const [f, setF] = useState({ name: '', code: '', user: '', pass: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const save = s => { setSess(s); setS(s); setErr(''); setView('admin'); };
  const logout = () => { setSess(null); setS(null); setScreen('guest'); };
  const go = fn => async () => { setBusy(true); setErr(''); try { await fn(); } catch (e) { setErr(e.message); } setBusy(false); };

  const enterGuest = go(async () => {
    if (!f.name.trim()) throw new Error('Escribe tu nombre');
    await post('/api/login', {}, { 'x-invite-code': f.code });
    save({ role: 'guest', code: f.code, name: cap(f.name) });
  });
  const enterAdmin = go(async () => {
    const d = await post('/api/admin/login', { user: f.user, pass: f.pass });
    save({ role: 'admin', token: d.token, name: 'Admin' });
  });

  if (sess?.role === 'guest') return <Guest sess={sess} onLogout={logout} />;
  if (sess?.role === 'admin') return view === 'admin'
    ? <Admin sess={sess} onLogout={logout} onGuest={() => setView('guest')} />
    : <Guest sess={sess} onBack={() => setView('admin')} />;

  const isAdm = screen === 'admin';
  const onEnter = fn => e => e.key === 'Enter' && fn();

  return (
    <div className={'lg' + (isAdm ? ' adm' : '')}>
      {isAdm
        ? <button className="lg-corner" onClick={() => { setScreen('guest'); setErr(''); }}><ArrowLeft size={18} /> Volver</button>
        : <button className="lg-corner" title="Administrador" onClick={() => { setScreen('admin'); setErr(''); }}><Lock size={18} /></button>}

      <div className="lg-card">
        <div className="lg-ico">{isAdm ? <Lock size={30} /> : <Home size={30} />}</div>
        {isAdm ? (<>
          <h1>Panel de administrador</h1>
          <p>Gestiona invitados, cuotas y la información del evento.</p>
          <label><User size={18} /><input placeholder="Usuario" value={f.user} onChange={set('user')} autoComplete="username" /></label>
          <label><KeyRound size={18} /><input type="password" placeholder="Contraseña" value={f.pass} onChange={set('pass')} onKeyDown={onEnter(enterAdmin)} autoComplete="current-password" /></label>
          {err && <small className="lg-err">{err}</small>}
          <button className="lg-btn" disabled={busy} onClick={enterAdmin}>{busy ? 'Entrando...' : 'Entrar como admin'}</button>
        </>) : (<>
          <span className="lg-pill"><PartyPopper size={16} /> 13 y 14 de Diciembre</span>
          <h1>Casa Náutica</h1>
          <p>Santa Rosa, Ancón. Escribe tu nombre y el código que te enviaron para entrar al planazo.</p>
          <label><User size={18} /><input placeholder="Tu nombre" value={f.name} onChange={set('name')} autoComplete="given-name" /></label>
          <label><KeyRound size={18} /><input placeholder="Código de invitación" value={f.code} onChange={set('code')} onKeyDown={onEnter(enterGuest)} autoCapitalize="characters" /></label>
          {err && <small className="lg-err">{err}</small>}
          <button className="lg-btn" disabled={busy} onClick={enterGuest}>{busy ? 'Entrando...' : 'Entrar'}</button>
        </>)}
      </div>
    </div>
  );
}