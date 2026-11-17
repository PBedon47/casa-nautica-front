import { useEffect, useState } from 'react';
import { Home, Waves, MapPin, ClipboardCheck, User, Users, Vote, CalendarDays, Wallet, Utensils, BedDouble, ShowerHead, Sofa, Flame, Volume2, Car, PawPrint, Wifi, Tv, Share2, LogOut, Images, Navigation, ArrowLeft, X } from 'lucide-react';
import { call } from './lib';
import Asistencia from './Asistencia';
import Deco from './Deco';

const DRIVE = 'https://drive.google.com/drive/folders/1gJngPnZsAe_HTmjJ8CIgV47sD1bHpYh_?usp=sharing';
const MAPS = 'https://maps.app.goo.gl/8hsJjqTqzrU5uURi8';
const MAP_EMBED = ''; // opcional: en Google Maps > Compartir > Insertar un mapa, pega aquí solo el link del src
const PAGES = [['inicio', 'Inicio', Home], ['casa', 'La casa', Waves], ['ubicacion', 'Ubicación', MapPin], ['asistencia', 'Confirmar', ClipboardCheck], ['participantes', 'Participantes', Users], ['votos', 'Votaciones', Vote]];
const FEATURES = [[Waves, 'Piscina'], [Flame, 'Terraza con parrilla'], [Sofa, 'Sala'], [Tv, 'Smart TV'], [Wifi, 'WiFi'], [Volume2, 'Equipo de sonido'], [BedDouble, '4 habitaciones'], [ShowerHead, '2 baños y 1 ducha'], [Utensils, 'Cocina y refrigerador'], [Car, 'Estacionamiento externo'], [PawPrint, 'Pet friendly']];
const GALLERY = [['piscina', 'Piscina'], ['noche', 'La casa de noche'], ['piscina-led', 'Piscina con luces'], ['sala', 'Sala con Smart TV'], ['comedor', 'Comedor'], ['balcon', 'Balcón con vista'], ['atardecer', 'Atardecer'], ['terraza', 'Terraza']];

function Count() {
  const T = new Date('2026-12-13T14:00:00-05:00'), [n, setN] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setN(Date.now()), 1000); return () => clearInterval(i); }, []);
  let s = Math.max(0, Math.floor((T - n) / 1000));
  return <div className="count">{[['días', 86400], ['horas', 3600], ['min', 60], ['seg', 1]].map(([l, d]) => { const v = Math.floor(s / d); s -= v * d; return <div key={l}><b>{v}</b>{l}</div>; })}</div>;
}
const Bar = ({ p }) => <div className="bar"><i style={{ width: `${Math.min(100, p)}%` }} /></div>;
const Info = ({ icon: I, t, v }) => <div className="card info"><I size={26} className="ic" /><b>{t}</b><span>{v}</span></div>;

function Gallery() {
  const [big, setBig] = useState(null);
  return (<><div className="gallery">{GALLERY.map(([n, t]) => (
    <figure key={n} onClick={() => setBig([n, t])}><img src={`/${n}.jpg`} alt={t} onError={e => (e.target.parentElement.style.display = 'none')} /><figcaption>{t}</figcaption></figure>))}</div>
    {big && <div className="lb" onClick={() => setBig(null)}><img src={`/${big[0]}.jpg`} alt={big[1]} /><X size={32} /></div>}</>);
}
const Votes = ({ title, data }) => { const max = Math.max(1, ...Object.values(data)); return (<div className="card"><h3>{title}</h3>
  {Object.entries(data).sort((a, b) => b[1] - a[1]).map(([k, v]) => <div className="vote" key={k}><span>{k}</span><Bar p={(v / max) * 100} /><b>{v}</b></div>)}
  {!Object.keys(data).length && <small>Aún sin votos</small>}</div>); };

export default function Guest({ sess, onLogout, onBack }) {
  const [me, setMe] = useState(false);
  const [page, setPage] = useState('inicio'), [d, setD] = useState(null), [err, setErr] = useState('');
  const load = () => call('/api/event').then(setD).catch(e => setErr(e.message));
  useEffect(() => { load(); }, []);
  const go = p => { setPage(p); scrollTo(0, 0); };
  const showMe = () => { setMe(true); setTimeout(() => setMe(false), 2500); };
  let body = <p className="center">{err || 'Cargando...'}</p>;
  if (d) {
    const { event: e, cap, going, votes } = d;
    body = page === 'inicio' ? (<>
      <header className="hero"><div className="hero-text"><p className="tag">¡Bienvenido{sess.name ? `, ${sess.name.split(' ')[0]}` : ''}!</p><h1>Casa Náutica</h1><h2>13 y 14 de Diciembre</h2>
        <p>Sol, piscina y buena vibra en Santa Rosa. Confirma tu asistencia y sé parte del planazo.</p><Count />
        <button className="btn" onClick={() => go('asistencia')}>Quiero asistir</button>
        <a className="btn alt" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent('Casa Náutica, 13 y 14 de diciembre. Entra aquí: ' + location.origin)}`}><Share2 size={18} /> Compartir</a></div>
        <div className="pol"><img className="polaroid" src="/noche.jpg" alt="Casa Náutica de noche" onError={x => (x.target.style.display = 'none')} /></div>
        <span className="hd hd1">🕶️</span><span className="hd hd2">🍍</span><span className="hd hd3">🕶️</span><span className="hd hd4">🥥</span><span className="hd hd5">🎉</span></header>
      <section className="grid">
        <Info icon={CalendarDays} t="Fechas" v="13 y 14 Dic · Ingreso 2 pm" /><Info icon={MapPin} t="Lugar" v="Santa Rosa, Ancón" />
        <Info icon={Wallet} t="Cuota de la casa" v={`S/ ${e.houseFee} por persona`} /><Info icon={Utensils} t="Comida y tragos" v={e.extraFee ? `S/ ${e.extraFee} por persona` : 'Monto por definir'} /></section>
      <section className="card"><h3>Cupos: {going.length} / {cap} confirmados</h3><Bar p={(going.length / cap) * 100} /></section></>)
    : page === 'casa' ? (<>
      <section className="card"><h2>Conoce la casa</h2><p>Capacidad para {cap} personas. Ingreso 2 pm y salida 11 am.</p>
        <div className="feat">{FEATURES.map(([I, t]) => <div key={t}><I size={22} className="ic" />{t}</div>)}</div>
        <small>Hab 1: cama de 2 plz · Hab 2: 2 camarotes · Hab 3: camarote y cama de 1.5 plz · Hab 4: cama de 2 plz</small></section>
      <Gallery /><a className="btn" target="_blank" rel="noreferrer" href={DRIVE}><Images size={18} /> Ver más fotos y videos</a></>)
    : page === 'ubicacion' ? (<section className="card"><h2>Ubicación</h2><p>Casa Náutica, Santa Rosa (Ancón).</p>
        {MAP_EMBED ? <iframe className="map" src={MAP_EMBED} loading="lazy" title="Mapa" /> : <div className="map pin"><MapPin size={56} /><b>Santa Rosa, Ancón</b></div>}
        <a className="btn" target="_blank" rel="noreferrer" href={MAPS}><Navigation size={18} /> Abrir en Google Maps</a></section>)
    : page === 'asistencia' ? <Asistencia data={d} reload={load} name={sess.name} onHome={() => go('inicio')} />
    : page === 'participantes' ? (<section className="card"><h2>Participantes ({going.length}/{cap})</h2><Bar p={(going.length / cap) * 100} />
        <div className="chips">{going.map(n => <span key={n} className="who"><i>{n[0].toUpperCase()}</i>{n}</span>)}</div>{!going.length && <small>Todavía no hay confirmados</small>}</section>)
    : <div className="grid2"><Votes title="Música" data={votes.music} /><Votes title="Comida" data={votes.food} /></div>;
  }
  return (<div className="site">
    <Deco />
    <nav className="top">
      <div className="logo"><Home size={24} />Casa Náutica</div>
      <div className="links">{PAGES.map(([k, t, I]) => <button key={k} className={page === k ? 'on' : ''} onClick={() => go(k)}><I size={18} /><span>{t}</span></button>)}</div>
      <div className="me-wrap">
        <button className={'me' + (me ? ' open' : '')} onClick={showMe}>
          <User size={18} /><span>{sess.name || 'Admin'}</span>
        </button>
      </div>
      {onBack
        ? <button className="out" onClick={onBack}><ArrowLeft size={18} /><span>Panel</span></button>
        : <button className="out" onClick={onLogout}><LogOut size={18} /><span>Salir</span></button>}
    </nav>
    <main className={'p-' + page}>{body}</main>
  </div>);
}