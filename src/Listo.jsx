import { useMemo } from 'react';
import { createPortal } from 'react-dom';

const COLORS = ['#ffd23f', '#ff5f6d', '#3ddc97', '#4cc9f0', '#ff9f43', '#c77dff', '#ffffff'];

export default function Listo({ onHome }) {
  const bits = useMemo(() => Array.from({ length: 90 }, (_, k) => {
    const a = Math.random() * Math.PI * 2, r = 80 + Math.random() * 300;
    return { k, x: Math.cos(a) * r, y: Math.sin(a) * r - 120, f: 200 + Math.random() * 260, r: Math.random() * 900 - 450,
      c: COLORS[k % COLORS.length], w: 6 + Math.random() * 8, h: 10 + Math.random() * 12,
      d: Math.random() * 3, t: 2.6 + Math.random() * 1.4 };
  }), []);
  return createPortal(
    <div className="listo">
      <div className="listo-stage">
        <img src="/listo.png" alt="¡Listo! Tu asistencia ha sido registrada correctamente" />
        <div className="confetti" aria-hidden="true">
          {bits.map(b => <i key={b.k} style={{ '--x': b.x + 'px', '--y': b.y + 'px', '--f': b.f + 'px', '--r': b.r + 'deg', background: b.c, width: b.w, height: b.h, animationDelay: b.d + 's', animationDuration: b.t + 's' }} />)}
        </div>
        <button className="listo-hit" onClick={onHome} aria-label="Volver al inicio" />
      </div>
    </div>,
    document.body
  );
}