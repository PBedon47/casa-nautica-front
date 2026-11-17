import { useState } from 'react';
import { Check, X, ArrowLeft } from 'lucide-react';
import { call, MUSIC, FOOD } from './lib';
import Listo from './Listo';

export default function Asistencia({ data, reload, name = '', onHome }) {
  const [f, setF] = useState({ name, phone: '', music: [], food: '' });
  const [step, setStep] = useState(0), [done, setDone] = useState(null), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const toggle = m => set('music', f.music.includes(m) ? f.music.filter(x => x !== m) : [...f.music, m]);
  const phoneOk = f.phone.replace(/\D/g, '').length >= 9;
  const send = async going => {
    setErr(''); setBusy(true);
    try {
      await call('/api/rsvp', { method: 'POST', body: JSON.stringify({ ...f, going }) });
      setDone({ going }); reload();
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };
  const again = () => { setDone(null); setStep(0); };

  if (done?.going) return <Listo onHome={onHome} />;
  if (done) return (<section className="card center"><h2>Te vamos a extrañar</h2><button className="link" onClick={again}>Cambiar respuesta</button></section>);

  return (<section className="card form">
    {step === 0 ? (<><h2>¿Asistirás a la Casa Náutica?</h2>
      <input placeholder="Tu nombre y apellido" value={f.name} onChange={x => set('name', x.target.value)} maxLength={40} />
      <div className="row"><button className="yes" disabled={f.name.trim().length < 2} onClick={() => setStep(1)}><Check size={20} /> Sí</button>
        <button className="no" disabled={f.name.trim().length < 2 || busy} onClick={() => send(false)}><X size={20} /> No</button></div></>)
    : (<><h2>Últimos detalles</h2>
      <b>¿Qué música te gusta?</b><div className="chips">{MUSIC.map(m => <button key={m} className={'chip' + (f.music.includes(m) ? ' on' : '')} onClick={() => toggle(m)}>{m}</button>)}</div>
      <b>¿Qué comemos?</b><div className="chips">{FOOD.map(m => <button key={m} className={'chip' + (f.food === m ? ' on' : '')} onClick={() => set('food', m)}>{m}</button>)}</div>
      <input type="tel" placeholder="Tu WhatsApp (9 dígitos)" value={f.phone} onChange={x => set('phone', x.target.value)} maxLength={15} />
      <div className="row"><button className="link" onClick={() => setStep(0)}><ArrowLeft size={16} /> Atrás</button>
        <button className="yes" disabled={busy || !phoneOk} onClick={() => send(true)}>{busy ? 'Enviando...' : 'Confirmar'}</button></div></>)}
    {err && <p className="err">{err}</p>}</section>);
}