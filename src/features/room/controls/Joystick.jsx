import { useEffect, useRef, useState } from 'react';
import { live } from '../store.js';

const RADIUS = 46; // px the knob can travel
const DEAD_ZONE = 12; // px of drag before the joystick appears (below this a touch counts as a tap)

// Touch joystick that appears under the finger only when the visitor drags on the scene.
// A simple tap is left alone so it can become "walk here" or "open this object".
export default function Joystick({ surfaceRef }) {
  const [origin, setOrigin] = useState(null);
  const knob = useRef(null);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return undefined;
    let active = null; // { id, x, y, shown }

    const release = () => {
      active = null;
      live.stick.x = 0;
      live.stick.y = 0;
      setOrigin(null);
    };

    const onDown = (event) => {
      if (event.pointerType !== 'touch' || active) return;
      active = { id: event.pointerId, x: event.clientX, y: event.clientY, shown: false };
    };

    const onMove = (event) => {
      if (!active || event.pointerId !== active.id) return;
      const dx = event.clientX - active.x;
      const dy = event.clientY - active.y;
      const distance = Math.hypot(dx, dy);
      if (!active.shown) {
        if (distance < DEAD_ZONE) return;
        active.shown = true;
        const box = surface.getBoundingClientRect();
        setOrigin({ x: active.x - box.left, y: active.y - box.top });
      }
      const clamped = Math.min(distance, RADIUS);
      const nx = distance ? (dx / distance) * clamped : 0;
      const ny = distance ? (dy / distance) * clamped : 0;
      live.stick.x = nx / RADIUS;
      live.stick.y = -ny / RADIUS;
      live.wake();
      if (knob.current) knob.current.style.transform = `translate(${nx}px, ${ny}px)`;
    };

    const onUp = (event) => {
      if (active && event.pointerId === active.id) release();
    };

    surface.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      surface.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      release();
    };
  }, [surfaceRef]);

  if (!origin) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-10 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/25 backdrop-blur-sm"
      style={{ left: origin.x, top: origin.y }}
    >
      <div ref={knob} className="absolute left-1/2 top-1/2 -ml-6 -mt-6 h-12 w-12 rounded-full bg-accent/90 shadow-lg" />
    </div>
  );
}
