const Sun = () => (
  <svg viewBox="0 0 200 200" width="100%" height="100%">
    <defs>
      <radialGradient id="sg" cx="50%" cy="45%" r="55%">
        <stop offset="0" stopColor="#fff6b0" />
        <stop offset=".6" stopColor="#ffd23f" />
        <stop offset="1" stopColor="#ff9f1c" />
      </radialGradient>
    </defs>
    <g stroke="#ffd23f" strokeWidth="9" strokeLinecap="round">
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1="100" y1="10" x2="100" y2="28" transform={`rotate(${i * 30} 100 100)`} />)}
    </g>
    <circle cx="100" cy="100" r="54" fill="url(#sg)" />
  </svg>
);

// [emoji, clase de posición]
const ITEMS = [['🍹', 'a2'], ['🍾', 'a5'], ['🥂', 'a6'], ['🍸', 'a7'], ['🍋', 'a8'], ['🍊', 'a9'], ['🎶', 'a10'], ['🧊', 'a11'], ['🍉', 'a12'], ['🍓', 'a1'], ['🍒', 'a3'], ['🍌', 'a4']];

export default function Deco() {
  return (
    <>
      <img className="palm pl" src="/palma.png" alt="" />
      <img className="palm pr" src="/palma.png" alt="" />
      <div className="deco" aria-hidden="true">
        {ITEMS.map(([e, c], i) => <span key={c} className={c} style={{ animationDelay: `${i * 0.4}s` }}>{e}</span>)}
      </div>
      <div className="sun" aria-hidden="true"><Sun /></div>
    </>
  );
}