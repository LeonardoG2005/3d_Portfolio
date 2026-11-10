// Static isometric drawing of the room, used as hero art in the lightweight home.
// Pure SVG that follows the theme tokens: no WebGL and almost no bytes.
const ISO_X = 0.866;
const ISO_Y = 0.5;
const UNIT = 26;

// Projects room coordinates (x right-back, z left-back, y up) to the SVG plane.
function iso(x, y, z) {
  return [(x - z) * ISO_X * UNIT, (x + z) * ISO_Y * UNIT - y * UNIT];
}

function points(list) {
  return list.map(([x, y, z]) => iso(x, y, z).map((n) => n.toFixed(1)).join(',')).join(' ');
}

// A box drawn as its three visible faces.
function Block({ at, size, top, left, right }) {
  const [x, y, z] = at;
  const [w, h, d] = size;
  return (
    <g>
      <polygon points={points([[x, y + h, z], [x + w, y + h, z], [x + w, y + h, z + d], [x, y + h, z + d]])} fill={top} />
      <polygon points={points([[x, y, z + d], [x + w, y, z + d], [x + w, y + h, z + d], [x, y + h, z + d]])} fill={left} />
      <polygon points={points([[x + w, y, z], [x + w, y, z + d], [x + w, y + h, z + d], [x + w, y + h, z]])} fill={right} />
    </g>
  );
}

export default function RoomIllustration({ className = '' }) {
  const wood = ['#c9925a', '#a37445', '#8c5f38'];
  const dark = ['#3a4144', '#2a3033', '#22282a'];
  const green = ['#2fce5b', '#009929', '#007322'];
  return (
    <svg viewBox="-215 -205 430 420" className={className} aria-hidden="true">
      {/* Floor and the two walls */}
      <polygon points={points([[0, 0, 0], [8, 0, 0], [8, 0, 8], [0, 0, 8]])} fill="var(--raised)" stroke="var(--border)" />
      <polygon points={points([[0, 0, 0], [8, 0, 0], [8, 4.2, 0], [0, 4.2, 0]])} fill="var(--surface)" stroke="var(--border)" />
      <polygon points={points([[0, 0, 0], [0, 0, 8], [0, 4.2, 8], [0, 4.2, 0]])} fill="var(--surface)" stroke="var(--border)" />
      <g transform="translate(0 0)">
        {/* Window on the right wall */}
        <polygon points={points([[5.2, 1.7, 0], [7.2, 1.7, 0], [7.2, 3.4, 0], [5.2, 3.4, 0]])} fill="#1d2a52" stroke="var(--border)" strokeWidth="2" />
        <circle cx={iso(6.7, 2.95, 0)[0]} cy={iso(6.7, 2.95, 0)[1]} r="7" fill="#f4f1dc" />
        {/* Neon monitor sign */}
        <polygon points={points([[2.1, 2.9, 0], [3.5, 2.9, 0], [3.5, 3.8, 0], [2.1, 3.8, 0]])} fill="none" stroke={green[0]} strokeWidth="2.5" strokeLinejoin="round" />
        <polyline points={points([[2.55, 3.5, 0], [2.4, 3.35, 0], [2.55, 3.2, 0]])} fill="none" stroke={green[0]} strokeWidth="2" />
        <polyline points={points([[3.05, 3.5, 0], [3.2, 3.35, 0], [3.05, 3.2, 0]])} fill="none" stroke={green[0]} strokeWidth="2" />
        {/* Bookshelf on the left wall */}
        <Block at={[0, 0, 0.9]} size={[0.6, 3, 2.3]} top={wood[0]} left={wood[1]} right={wood[2]} />
        {[0.5, 1.2, 1.9, 2.5].map((y, row) =>
          [0, 1, 2, 3, 4, 5].map((i) => (
            <polygon
              key={`${row}-${i}`}
              points={points([[0.6, y, 1.05 + i * 0.34], [0.6, y, 1.3 + i * 0.34], [0.6, y + 0.42 - (i % 3) * 0.06, 1.3 + i * 0.34], [0.6, y + 0.42 - (i % 3) * 0.06, 1.05 + i * 0.34]])}
              fill={[green[1], 'var(--text)', '#d9a441', green[0], 'var(--muted)', green[2]][(i + row) % 6]}
            />
          )),
        )}
        {/* Desk with monitors */}
        <Block at={[1.4, 0.95, 0.1]} size={[3, 0.1, 1]} top={wood[0]} left={wood[1]} right={wood[2]} />
        <Block at={[1.5, 0, 0.2]} size={[0.1, 0.95, 0.1]} top={dark[0]} left={dark[1]} right={dark[2]} />
        <Block at={[4.2, 0, 0.9]} size={[0.1, 0.95, 0.1]} top={dark[0]} left={dark[1]} right={dark[2]} />
        <polygon points={points([[1.8, 1.25, 0.35], [2.9, 1.25, 0.35], [2.9, 1.95, 0.35], [1.8, 1.95, 0.35]])} fill="#0c120e" stroke={dark[0]} strokeWidth="2" />
        <polygon points={points([[3.05, 1.25, 0.35], [4.15, 1.25, 0.35], [4.15, 1.95, 0.35], [3.05, 1.95, 0.35]])} fill="#0c120e" stroke={dark[0]} strokeWidth="2" />
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1={iso(1.95, 1.82 - i * 0.14, 0.35)[0]}
            y1={iso(1.95, 1.82 - i * 0.14, 0.35)[1]}
            x2={iso(2.3 + (i % 2) * 0.35, 1.82 - i * 0.14, 0.35)[0]}
            y2={iso(2.3 + (i % 2) * 0.35, 1.82 - i * 0.14, 0.35)[1]}
            stroke={green[0]}
            strokeWidth="1.6"
          />
        ))}
        {/* Chair */}
        <Block at={[2.6, 0.55, 1.5]} size={[0.6, 0.12, 0.6]} top={green[1]} left={green[2]} right="#00561a" />
        <Block at={[2.6, 0.67, 2.0]} size={[0.6, 0.7, 0.1]} top={green[1]} left={green[2]} right="#00561a" />
        {/* Cabinet and door on the left wall */}
        <Block at={[0, 0, 4.7]} size={[0.6, 1, 1.2]} top={wood[0]} left={wood[1]} right={wood[2]} />
        <polygon points={points([[0, 0, 6.4], [0, 0, 7.5], [0, 2.6, 7.5], [0, 2.6, 6.4]])} fill={wood[2]} stroke="var(--border)" />
        {/* Plant and side table */}
        <Block at={[7.1, 0, 0.3]} size={[0.5, 0.5, 0.5]} top="#d8d2c0" left="#c2bca9" right="#aea894" />
        <ellipse cx={iso(7.35, 1.3, 0.55)[0]} cy={iso(7.35, 1.3, 0.55)[1]} rx="16" ry="24" fill={green[1]} />
        <ellipse cx={iso(7.1, 1.1, 0.75)[0]} cy={iso(7.1, 1.1, 0.75)[1]} rx="10" ry="17" fill={green[0]} />
        <Block at={[6.9, 0, 2.3]} size={[0.7, 0.6, 0.7]} top={wood[0]} left={wood[1]} right={wood[2]} />
        {/* Character */}
        <g transform={`translate(${iso(4.6, 0, 4.6).join(' ')})`}>
          <ellipse cx="0" cy="1" rx="13" ry="6" fill="#000" opacity="0.18" />
          <rect x="-7" y="-15" width="6" height="15" rx="2" fill="#1c4a2a" />
          <rect x="1" y="-15" width="6" height="15" rx="2" fill="#1c4a2a" />
          <rect x="-9" y="-31" width="18" height="18" rx="5" fill="#f5f3ec" stroke="var(--border)" />
          <circle cx="0" cy="-40" r="9" fill="#edc3a4" />
          <path d="M-10 -41c0-9 5-12 10-12s11 3 10 12c-3-5-6-6-10-6s-7 1-10 6z" fill="#3b2619" />
        </g>
      </g>
    </svg>
  );
}
