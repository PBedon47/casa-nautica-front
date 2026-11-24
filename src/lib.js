export const API = import.meta.env.VITE_API || '';

export const getSess = () => { try { return JSON.parse(localStorage.getItem('sess')); } catch { return null; } };
export const setSess = s => (s ? localStorage.setItem('sess', JSON.stringify(s)) : localStorage.removeItem('sess'));

export const call = async (path, opts = {}) => {
  const s = getSess();
  const h = { 'Content-Type': 'application/json', ...(s?.role === 'admin' && { Authorization: 'Bearer ' + s.token }), ...(s?.role === 'guest' && { 'x-invite-code': s.code }) };
  const r = await fetch(API + path, { ...opts, headers: { ...h, ...opts.headers } });
  const d = await r.json();
  if (r.status === 401 && s) { setSess(null); location.reload(); }
  if (!r.ok) throw new Error(d.error || 'Error');
  return d;
};

export const MUSIC = ['Reggaetón', 'Salsa', 'Cumbia', 'Rock', 'Pop', 'Electrónica', 'Variado'];
export const FOOD = ['Parrilla', 'Pollo a la brasa', 'Hamburguesas', 'Anticuchos'];
export const wa = (phone, text) => `https://wa.me/${phone.length === 9 ? '51' + phone : phone}?text=${encodeURIComponent(text)}`;

// Usa public/invitacion.png y le agrega abajo el nombre del invitado
export async function makeCard(name, fee) {
  await document.fonts.load('700 30px Fredoka');
  const img = await new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = '/invitacion.png'; });
  const W = img?.naturalWidth || 750, H = img?.naturalHeight || 1000, B = 170;
  const c = document.createElement('canvas'); c.width = W; c.height = H + B;
  const x = c.getContext('2d');
  x.fillStyle = '#12063a'; x.fillRect(0, 0, W, H + B);
  x.textAlign = 'center';
  if (img) x.drawImage(img, 0, 0);
  else { x.fillStyle = '#fff'; x.font = '700 60px Fredoka, sans-serif'; x.fillText('¡Registro Exitoso!', W / 2, 300); x.fillText('12 y 13 de Diciembre', W / 2, 400); }
  x.strokeStyle = '#ffd23f'; x.lineWidth = 4; x.beginPath(); x.moveTo(40, H + 8); x.lineTo(W - 40, H + 8); x.stroke();
  x.fillStyle = '#ffd23f'; x.font = '700 42px Fredoka, sans-serif'; x.fillText(name, W / 2, H + 66);
  x.fillStyle = '#fff'; x.font = '400 26px Fredoka, sans-serif';
  x.fillText('Casa Náutica · Santa Rosa, Ancón · Ingreso 2 pm', W / 2, H + 108);
  x.fillText(`Cuota de la casa: S/ ${fee}`, W / 2, H + 144);
  return c.toDataURL('image/jpeg', 0.85);
}