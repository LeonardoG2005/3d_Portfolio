import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { createCosmos } from './engine.js';
import { presetFor } from './presets.js';

// Living background for every content page: a nebula, a deep star field, tumbling wireframe solids
// and four flat, slowly deforming orbs, drawn on one fixed canvas behind the page. It stays mounted while moving
// between content pages, so the scene rearranges itself instead of restarting.
// Without WebGL nothing is drawn and the plain page colour remains.
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
