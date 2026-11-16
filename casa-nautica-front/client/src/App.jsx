import { useEffect, useState } from 'react';
const API = import.meta.env.VITE_API || '';
const call = async (path, opts = {}, pin) => {
  const r = await fetch(API + path, { ...opts, headers: { 'Content-Type': 'application/json', ...(pin && { 'x-admin-pin': pin }) } });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'Error');
  return d;
};
const PHOTOS = ['casa1.jpg', 'casa2.jpg', 'casa3.jpg', 'casa4.jpg'];
const MUSIC = ['Reggaetón', 'Salsa', 'Cumbia', 'Rock', 'Pop', 'Electrónica', 'Variado'];
const FOOD = ['Parrilla', 'Pollo a la brasa', 'Hamburguesas', 'Anticuchos'];
const wa = (phone, text) => `https://wa.me/${phone.length === 9 ? '51' + phone : phone}?text=${encodeURIComponent(text)}`;
const SITE = location.origin;

function Count() {
  const T = new Date('2026-12-13T14:00:00-05:00'), [n, setN] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setN(Date.now()), 1000); return () => clearInterval(i); }, []);
  let s = Math.max(0, Math.floor((T - n) / 1000));
  return <div className="count">{[['días', 86400], ['horas', 3600], ['min', 60], ['seg', 1]].map(([l, d]) => { const v = Math.floor(s / d); s -= v * d; return <div key={l}><b>{v}</b>{l}</div>; })}</div>;
}
const Votes = ({ title, data }) => { const max = Math.max(1, ...Object.values(data)); return (<div><h4>{title}</h4>
  {Object.entries(data).sort((a, b) => b[1] - a[1]).map(([k, v]) => <div className="vote" key={k}><span>{k}</span><div className="bar"><i style={{ width: `${(v / max) * 100}%` }} /></div><b>{v}</b></div>)}
  {!Object.keys(data).length && <small>Aún sin votos</small>}</div>); };

function Invite() {
  const [data, setData] = useState(null), [f, setF] = useState({ name: '', email: '', phone: '', music: [], food: '' });
  const [step, setStep] = useState(0), [done, setDone] = useState(null), [err, setErr] = useState('');
  const load = () => call('/api/event').then(setData).catch(() => setErr('No se pudo conectar'));
  useEffect(() => { load(); }, []);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const toggle = m => set('music', f.music.includes(m) ? f.music.filter(x => x !== m) : [...f.music, m]);
  const send = async going => {
    setErr('');
    try { const r = await call('/api/rsvp', { method: 'POST', body: JSON.stringify({ ...f, going }) }); setDone({ going, emailed: r.emailed }); load(); }
    catch (e) { setErr(e.message); }
  };
  if (!data) return <p className="center">Cargando olas… 🌊 {err}</p>;
  const { event: e, cap, going, votes } = data;
  const msg = `🌴 ¡Estoy dentro! El 13 y 14 de diciembre va a ser un día GOOD 😎 Casa Náutica, Santa Rosa. Ingreso 2pm. Cuota casa S/ ${e.houseFee}.`;
  return (<>
    <header className="hero">
      <p className="tag">🌴 ¡Estás invitado, pana!</p><h1>Casa Náutica</h1><h2>13 y 14 de Diciembre</h2>
      <p>Santa Rosa · Piscina · Parrilla · Cero estrés</p><Count />
      <a href="#rsvp" className="btn">¡Quiero ir! 🏖️</a>
      <a className="btn alt" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent('🌴 Casa Náutica, 13 y 14 de diciembre. Confirma aquí: ' + SITE)}`}>Compartir por WhatsApp 📲</a>
    </header>
    <section className="grid">
      <div className="card"><b>📅 Fechas</b><span>13 y 14 Dic · Ingreso 2pm / Salida 11am</span></div>
      <div className="card"><b>👥 Cupos</b><span>{going.length} / {cap} confirmados</span></div>
      <div className="card"><b>🏠 Cuota casa</b><span>S/ {e.houseFee} c/u (total S/ {e.total})</span></div>
      <div className="card"><b>🍹 Comida y tragos</b><span>{e.extraFee ? `S/ ${e.extraFee} c/u` : 'Monto por definir'}</span></div>
    </section>
    <section className="gallery">{PHOTOS.map(p => <img key={p} src={'/' + p} alt="Casa Náutica" onError={x => (x.target.style.display = 'none')} />)}</section>
    <section id="rsvp" className="card big">
      {done ? (done.going ? (
        <div className="ticket"><h3>🎟️ ¡Estás dentro, {f.name}!</h3>
          <h2>El 13 y 14 va a ser un día GOOD 😎</h2>
          <p>Casa Náutica · Santa Rosa, Ancón<br />Ingreso 2pm · Piscina, parrilla y buena vibra<br />Cuota casa: S/ {e.houseFee}</p>
          {done.emailed && <p>📧 Te enviamos la invitación a tu correo.</p>}
          {f.phone && <a className="btn" target="_blank" rel="noreferrer" href={wa(f.phone.replace(/\D/g, ''), msg)}>Recibir invitación en WhatsApp 💬</a>}
          <button className="link" onClick={() => { setDone(null); setStep(0); }}>Cambiar respuesta</button></div>
      ) : <div className="center"><h3>Te vamos a extrañar 🥲</h3><button className="link" onClick={() => { setDone(null); setStep(0); }}>Cambiar respuesta</button></div>)
      : step === 0 ? (<><h3>¿Vas a ir?</h3>
        <input placeholder="Tu nombre y apellido" value={f.name} onChange={x => set('name', x.target.value)} maxLength={40} />
        <div className="row"><button className="yes" disabled={f.name.trim().length < 2} onClick={() => setStep(1)}>✅ Sí</button>
          <button className="no" disabled={f.name.trim().length < 2} onClick={() => send(false)}>❌ No</button></div></>)
      : (<><h3>¡Genial! Últimos detalles 🎶</h3>
        <b>¿Qué música te gusta?</b><div className="chips">{MUSIC.map(m => <button key={m} className={'chip' + (f.music.includes(m) ? ' on' : '')} onClick={() => toggle(m)}>{m}</button>)}</div>
        <b>¿Qué comemos?</b><div className="chips">{FOOD.map(m => <button key={m} className={'chip' + (f.food === m ? ' on' : '')} onClick={() => set('food', m)}>{m}</button>)}</div>
        <input type="email" placeholder="Correo (para enviarte la invitación)" value={f.email} onChange={x => set('email', x.target.value)} />
        <input type="tel" placeholder="WhatsApp (9 dígitos)" value={f.phone} onChange={x => set('phone', x.target.value)} />
        <div className="row"><button className="link" onClick={() => setStep(0)}>← Atrás</button><button className="yes" onClick={() => send(true)}>Confirmar 🎉</button></div></>)}
      {err && <p className="err">{err}</p>}
    </section>
    <section className="card big"><h3>Confirmados ({going.length}/{cap})</h3>
      <div className="bar"><i style={{ width: `${(going.length / cap) * 100}%` }} /></div>
      <div className="chips">{going.map(n => <span key={n}>🏄 {n}</span>)}</div></section>
    <section className="card big"><h3>🎶 Votaciones</h3><Votes title="Música" data={votes.music} /><Votes title="Comida" data={votes.food} /></section>
  </>);
}

function Admin() {
  const [pin, setPin] = useState(''), [ok, setOk] = useState(false), [list, setList] = useState([]), [ev, setEv] = useState(null), [err, setErr] = useState('');
  const load = async p => { try { setList(await call('/api/admin/guests', {}, p)); setEv((await call('/api/event')).event); setOk(true); setErr(''); } catch (e) { setErr(e.message); } };
  const patch = async (g, k) => { await call('/api/admin/guests/' + g.id, { method: 'PATCH', body: JSON.stringify({ paidHouse: g.paidHouse, paidExtra: g.paidExtra, [k]: !g[k] }) }, pin); load(pin); };
  const del = async g => { if (confirm('¿Eliminar a ' + g.name + '?')) { await call('/api/admin/guests/' + g.id, { method: 'DELETE' }, pin); load(pin); } };
  const saveFee = async () => { await call('/api/admin/event', { method: 'PUT', body: JSON.stringify(ev) }, pin); load(pin); };
  if (!ok) return (<div className="card big"><h3>Panel admin 🔐</h3><input type="password" placeholder="PIN" value={pin} onChange={x => setPin(x.target.value)} />
    <button className="yes" onClick={() => load(pin)}>Entrar</button>{err && <p className="err">{err}</p>}</div>);
  const yes = list.filter(g => g.going);
  return (<div className="card big"><h3>Panel admin 🔐</h3>
    <div className="row"><label>Cuota casa S/<input type="number" value={ev.houseFee} onChange={x => setEv({ ...ev, houseFee: x.target.value })} /></label>
      <label>Extra comida/tragos S/<input type="number" value={ev.extraFee} onChange={x => setEv({ ...ev, extraFee: x.target.value })} /></label>
      <button className="yes" onClick={saveFee}>Guardar</button></div>
    <p>Confirmados: <b>{yes.length}</b> · Casa: <b>S/ {yes.filter(g => g.paidHouse).length * ev.houseFee}</b> de S/ {ev.total} · Extra: <b>S/ {yes.filter(g => g.paidExtra).length * ev.extraFee}</b></p>
    <div style={{ overflowX: 'auto' }}><table><thead><tr><th>Nombre</th><th>Va</th><th>Música</th><th>Comida</th><th>Casa</th><th>Extra</th><th>WhatsApp</th><th /></tr></thead><tbody>
      {list.map(g => (<tr key={g.id}><td>{g.name}<br /><small>{g.email}</small></td><td>{g.going ? '✅' : '❌'}</td><td>{g.music}</td><td>{g.food}</td>
        <td><input type="checkbox" checked={g.paidHouse} onChange={() => patch(g, 'paidHouse')} /></td>
        <td><input type="checkbox" checked={g.paidExtra} onChange={() => patch(g, 'paidExtra')} /></td>
        <td>{g.going && g.phone && <a target="_blank" rel="noreferrer" href={wa(g.phone, `🌴 ¡${g.name}, estás dentro! El 13 y 14 de diciembre va a ser un día GOOD 😎 Casa Náutica, Santa Rosa. Ingreso 2pm. Cuota casa S/ ${ev.houseFee}.`)}>💬 Enviar</a>}</td>
        <td><button className="link" onClick={() => del(g)}>🗑️</button></td></tr>))}
    </tbody></table></div></div>);
}

export default function App() {
  const [admin, setAdmin] = useState(location.hash === '#admin');
  useEffect(() => { const f = () => setAdmin(location.hash === '#admin'); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  return <main>{admin ? <Admin /> : <Invite />}<footer>Casa Náutica 🌊</footer></main>;
}
