import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { prefersReducedMotion } from '../../lib/gsap.js';

const GLYPHS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ01<>/{}=$#';
const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

// Retro terminal button: digital rain behind the label, and the label decodes from random glyphs on hover or focus.
export default function TerminalLink({ to, children, className = '' }) {
  const label = String(children);
  const textRef = useRef(null);
  const canvasRef = useRef(null);
  const run = useRef({ frame: 0, active: false });

  useEffect(() => {
    const state = run.current;
    return () => cancelAnimationFrame(state.frame);
  }, []);

  const start = () => {
    if (prefersReducedMotion()) return;
    const state = run.current;
    cancelAnimationFrame(state.frame);
    state.active = true;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const size = 12;
    const drops = Array.from({ length: Math.ceil(width / size) }, () => Math.random() * -height);
    const color = getComputedStyle(canvas).color;

    const began = performance.now();
    const decodeTime = 520;
    let last = 0;
    const tick = (now) => {
      const progress = Math.min(1, (now - began) / decodeTime);
      const settled = Math.floor(progress * label.length);
      textRef.current.textContent =
        label.slice(0, settled) +
        Array.from(label.slice(settled), (char) => (char === ' ' ? ' ' : randomGlyph())).join('');

      if (now - last > 45) {
        last = now;
        context.fillStyle = 'rgba(0, 0, 0, 0.16)';
        context.globalCompositeOperation = 'destination-out';
        context.fillRect(0, 0, width, height);
        context.globalCompositeOperation = 'source-over';
        context.fillStyle = color;
        context.font = `${size}px 'JetBrains Mono Variable', monospace`;
        drops.forEach((y, index) => {
          context.fillText(randomGlyph(), index * size, y);
          drops[index] = y > height + Math.random() * 40 ? 0 : y + size;
        });
      }
      if (state.active || progress < 1) state.frame = requestAnimationFrame(tick);
      else context.clearRect(0, 0, width, height);
    };
    state.frame = requestAnimationFrame(tick);
  };

  const stop = () => {
    run.current.active = false;
  };

  return (
    <Link
      to={to}
      aria-label={label}
      onPointerEnter={start}
      onPointerLeave={stop}
      onFocus={start}
      onBlur={stop}
      className={`terminal-link group relative inline-flex items-center gap-3 overflow-hidden rounded-md px-5 py-3 font-mono text-sm uppercase tracking-[0.14em] ${className}`}
    >
      <canvas ref={canvasRef} aria-hidden="true" className="terminal-rain pointer-events-none absolute inset-0 h-full w-full" />
      <span aria-hidden="true" className="terminal-prompt relative">&gt;</span>
      <span key={label} ref={textRef} aria-hidden="true" className="relative whitespace-pre">
        {label}
      </span>
      <span aria-hidden="true" className="terminal-caret relative" />
    </Link>
  );
}
