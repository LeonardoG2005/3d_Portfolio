import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { createCosmos } from './engine.js';
import { presetFor } from './presets.js';

// Background of the content pages. It stays mounted between them, so the scene rearranges instead of restarting.
export default function Cosmos() {
  const { pathname } = useLocation();
  const canvas = useRef(null);
  const engine = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    engine.current = createCosmos(canvas.current, { reduced });
    setVisible(Boolean(engine.current));
    return () => {
      engine.current?.destroy();
      engine.current = null;
    };
  }, []);

  useEffect(() => {
    engine.current?.setPreset(presetFor(pathname));
  }, [pathname]);

  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 -z-10 block h-lvh w-full transition-opacity duration-1000 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
}
