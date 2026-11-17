import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Wallet, Trash2, Plus, Save, MessageCircle, LogOut, Eye, Home, UserCheck, UserX, Banknote, Utensils, CircleCheck, Clock, Send, Image as ImageIcon } from 'lucide-react';
import { call, wa, API } from './lib';

const Cell = ({ v, onSave }) => <input defaultValue={v} onBlur={e => e.target.value !== String(v) && onSave(e.target.value)} />;
const Stat = ({ icon: I, t, v, s }) => <div className="card stat"><I size={26} className="ic" /><small>{t}</small><h2>{v}</h2>{s && <small>{s}</small>}</div>;
const Names = ({ list, empty }) => <div className="chips">{list.map(g => <span key={g.id} className="who"><i>{g.name[0].toUpperCase()}</i>{g.name}</span>)}{!list.length && <small>{empty}</small>}</div>;
const Pay = ({ title, fee, yes, k, onToggle }) => {
  const col = done => { const list = yes.filter(g => !!g[k] === done);
    return (<div className="card"><b>{done ? 'Pagaron' : 'Faltan'} ({list.length})</b>{+fee > 0 && <small>S/ {list.length * fee} {done ? 'cobrados' : 'pendientes'}</small>}
      <div className="chips">{list.map(g => <span key={g.id} className="who pick" title={done ? 'Marcar como no pagó' : 'Marcar como pagó'} onClick={() => onToggle(g, !done)}><i>{g.name[0].toUpperCase()}</i>{g.name}</span>)}{!list.length && <small>{done ? 'Nadie ha pagado todavía' : yes.length ? '¡Todos pagaron!' : 'Aún no hay confirmados'}</small>}</div></div>); };
  return (<><h2>{title}</h2><div className="pay-cols">{col(true)}{col(false)}</div></>);
};

export default function Admin({ onLogout, onGuest, onPreview }) {
  const [list, setList] = useState([]), [info, setInfo] = useState(null), [fin, setFin] = useState(null), [tab, setTab] = useState('resumen'), [nn, setNn] = useState(''), [pic, setPic] = useState(null);
  const load = async () => { setList(await call('/api/admin/guests')); const i = await call('/api/event'); setInfo(i); setFin(f => f || i.event); };
  useEffect(() => { load(); }, []);
  const edit = async (id, d) => { await call('/api/admin/guests/' + id, { method: 'PATCH', body: JSON.stringify(d) }); load(); };
  const del = async g => { if (confirm('¿Eliminar a ' + g.name + '?')) { await call('/api/admin/guests/' + g.id, { method: 'DELETE' }); load(); } };
  const add = async () => { await call('/api/admin/guests', { method: 'POST', body: JSON.stringify({ name: nn }) }); setNn(''); load(); };
  const saveFin = async () => { try { const e = await call('/api/admin/event', { method: 'PUT', body: JSON.stringify(fin) }); setFin(e); await load(); alert('Cambios guardados'); } catch (x) { alert(x.message); } };
  const resend = async g => { try { await call('/api/admin/guests/' + g.id + '/whatsapp', { method: 'POST' }); alert('Invitación enviada a ' + g.name); } catch (e) { alert(e.message); } };

  async function verImagen(g) {
    try {
        const r = await fetch(`${API}/api/invitacion.png?n=${encodeURIComponent(g.name)}`);
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error || 'Error ' + r.status); }
      const blob = await r.blob();
        setPic({ name: g.name, blob, url: URL.createObjectURL(blob),
        texto: `Hola ${g.name}, estás dentro. El 13 y 14 de diciembre en Casa Náutica, Santa Rosa (Ancón). Ingreso 2 pm, salida 11 am. Cuota de la casa: S/ ${ev.houseFee}.` });
    } catch (e) { alert('No se pudo generar la imagen: ' + e.message); }
  }
  const cerrarPic = () => { URL.revokeObjectURL(pic.url); setPic(null); };
  const copiarPic = async () => {
    try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': pic.blob })]); alert('Imagen copiada. Pégala en el chat con Ctrl+V.'); }
    catch (e) { alert('No se pudo copiar: ' + e.message); }
  };
    const copiarTexto = async () => {
    try { await navigator.clipboard.writeText(pic.texto); alert('Texto copiado. Pégalo en el chat con Ctrl+V.'); }
    catch (e) { alert('No se pudo copiar: ' + e.message); }
  };
  const descargarPic = () => {
    const a = document.createElement('a'); a.href = pic.url;
    a.download = 'invitacion-' + (pic.name.replace(/[^\w-]/g, '') || 'invitado') + '.png'; a.click();
  };

  if (!info) return <p className="center">Cargando...</p>;
  const ev = info.event, yes = list.filter(g => g.going), cap = info.cap;
  const paid = yes.filter(g => g.paidHouse), unpaid = yes.filter(g => !g.paidHouse);
  const houseIn = paid.length * ev.houseFee, extraIn = yes.filter(g => g.paidExtra).length * ev.extraFee;
  const top = o => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} (${v})`).join(' · ') || 'Sin votos';
  const TABS = [['resumen', 'Resumen', LayoutDashboard], ['invitados', 'Invitados', Users], ['finanzas', 'Finanzas', Wallet]];
  const preview = onGuest || onPreview;
  return (<div className="erp">
    <aside><div className="logo"><Home size={24} />Casa Náutica</div>
      {TABS.map(([k, t, I]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}><I size={20} /><span>{t}</span></button>)}
      <button onClick={preview}><Eye size={20} /><span>Ver sitio</span></button>
      <button className="push" onClick={onLogout}><LogOut size={20} /><span>Salir</span></button></aside>
    <section className="erp-main">
      {tab === 'resumen' && (<><h1>Resumen</h1><div className="grid">
        <Stat icon={UserCheck} t="Confirmados" v={`${yes.length} / ${cap}`} /><Stat icon={UserX} t="No asisten" v={list.length - yes.length} />
        <Stat icon={CircleCheck} t="Ya pagaron" v={`${paid.length} / ${yes.length}`} s="cuota de la casa" /><Stat icon={Clock} t="Faltan pagar" v={unpaid.length} s={`S/ ${unpaid.length * ev.houseFee} pendientes`} />
        <Stat icon={Banknote} t="Casa cobrada" v={`S/ ${houseIn}`} s={`de S/ ${ev.total}`} /><Stat icon={Utensils} t="Extra cobrado" v={`S/ ${extraIn}`} s={`de S/ ${yes.length * ev.extraFee}`} /></div>
        <div className="card"><b>Pagaron ({paid.length})</b><Names list={paid} empty="Nadie ha pagado todavía" /></div>
        <div className="card"><b>Aún no pagan ({unpaid.length})</b><Names list={unpaid} empty="¡Todos pagaron!" /></div>
        <div className="card"><b>Música más votada</b><p>{top(info.votes.music)}</p><b>Comida más votada</b><p>{top(info.votes.food)}</p></div></>)}
      {tab === 'invitados' && (<><h1>Invitados</h1><div className="card"><div className="row"><input placeholder="Agregar invitado a mano" value={nn} onChange={x => setNn(x.target.value)} />
        <button className="yes" disabled={nn.trim().length < 2} onClick={add}><Plus size={18} /> Agregar</button></div>
        <div style={{ overflowX: 'auto' }}><table><thead><tr><th>Nombre</th><th>WhatsApp</th><th>Va</th><th>Pagó casa</th><th>Pagó extra</th><th /></tr></thead><tbody>
          {list.map(g => (<tr key={g.id}>
            <td><Cell v={g.name} onSave={v => edit(g.id, { name: v })} /></td>
            <td><div className="acts"><Cell v={g.phone} onSave={v => edit(g.id, { phone: v.replace(/\D/g, '') })} />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginLeft: 18 }}>
                {g.phone && <a target="_blank" rel="noreferrer" title="Escribir por WhatsApp" href={wa(g.phone, `Hola ${g.name.replace(/[^\p{L}\p{N}\s.'-]/gu, '').trim() || g.name}, estás dentro. El 13 y 14 de diciembre en Casa Náutica, Santa Rosa (Ancón). Ingreso 2 pm, salida 11 am. Cuota de la casa: S/ ${ev.houseFee}.`)}><MessageCircle size={20} /></a>}
                {g.phone && g.going && <button className="link" title="Enviar invitación con imagen" onClick={() => resend(g)}><Send size={20} /></button>}
                {g.phone && g.going && <button className="link" title="Ver invitación con imagen" onClick={() => verImagen(g)}><ImageIcon size={20} /></button>}
              </span></div></td>
            <td><input type="checkbox" checked={g.going} onChange={() => edit(g.id, { going: !g.going })} /></td>
            <td><input type="checkbox" checked={g.paidHouse} onChange={() => edit(g.id, { paidHouse: !g.paidHouse })} /></td>
            <td><input type="checkbox" checked={g.paidExtra} onChange={() => edit(g.id, { paidExtra: !g.paidExtra })} /></td>
            <td><button className="link" onClick={() => del(g)}><Trash2 size={18} /></button></td></tr>))}
        </tbody></table></div></div></>)}
      {tab === 'finanzas' && fin && (<><h1>Finanzas</h1><div className="fin-grid"><div className="card form">
        <label>Precio total de la casa (S/)<input type="number" value={fin.total} onChange={x => setFin({ ...fin, total: x.target.value })} /></label>
        <label>Cuota de la casa por persona (S/)<input type="number" value={fin.houseFee} onChange={x => setFin({ ...fin, houseFee: x.target.value })} /></label>
        <label>Extra comida y tragos por persona (S/)<input type="number" value={fin.extraFee} onChange={x => setFin({ ...fin, extraFee: x.target.value })} /></label>
        <p>Con {cap} personas la cuota mínima es S/ {Math.ceil(fin.total / cap)}. Con los {yes.length} confirmados sería S/ {yes.length ? Math.ceil(fin.total / yes.length) : '-'}.</p>
        <button className="yes" onClick={saveFin}><Save size={18} /> Guardar</button></div>
        <div className="fin-pay">
          <Pay title="Cuota de la casa" fee={ev.houseFee} yes={yes} k="paidHouse" onToggle={(g, v) => edit(g.id, { paidHouse: v })} />
          <Pay title="Extra comida y tragos" fee={ev.extraFee} yes={yes} k="paidExtra" onToggle={(g, v) => edit(g.id, { paidExtra: v })} /></div></div></>)}
    </section>
    {pic && (<div onClick={cerrarPic} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} className="card" style={{ maxWidth: 420, width: '100%', maxHeight: '92vh', overflow: 'auto', textAlign: 'center' }}>
        <img src={pic.url} alt="Invitación" style={{ width: '100%', borderRadius: 12 }} />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
          <button className="yes" onClick={copiarPic}>Copiar imagen</button>
          <button className="yes" onClick={copiarTexto}>Copiar texto</button>
          <button className="yes" onClick={descargarPic}>Descargar</button>
          <button className="link" onClick={cerrarPic}>Cerrar</button>
        </div>
      </div>
    </div>)}
  </div>);
}