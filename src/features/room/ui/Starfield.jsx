import { useEffect, useRef } from 'react';

// Twinkling stars drawn on a plain 2D canvas that sits behind the transparent 3D canvas.
// The room's floor and walls are solid, so the stars only show in the empty space around it.
// It redraws a few times per second (twinkling needs no more), stops in a hidden tab,
// and is a still picture under reduced motion.
export default function Starfield({ theme }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dark = theme === 'dark';
    let stars = [];
    let width = 0;
    let height = 0;
    let timer = 0;

    const build = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.round(Math.min(900, (width * height) / 1700));
      stars = Array.from({ length: count }, () => {
        const tint = Math.random();
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          size: 0.4 + Math.random() ** 3 * 1.5,
          phase: Math.random() * Math.PI * 2,
          pace: 0.5 + Math.random() * 1.8,
          // Mostly neutral, with a few green and violet ones like the inner pages.
          color: dark
            ? tint > 0.9 ? '190, 165, 255' : tint > 0.78 ? '110, 255, 160' : '236, 244, 238'
            : tint > 0.9 ? '92, 66, 190' : tint > 0.78 ? '0, 115, 36' : '26, 40, 30',
        };
      });
    };

    const draw = () => {
      const time = reduced ? 0 : performance.now() / 1000;
      context.clearRect(0, 0, width, height);
      for (const star of stars) {
        const twinkle = 0.6 + 0.4 * Math.sin(time * star.pace + star.phase);
        context.fillStyle = `rgba(${star.color}, ${(dark ? 0.85 : 0.4) * twinkle})`;
        context.beginPath();
        context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        context.fill();
      }
    };

    const update = () => {
      window.clearInterval(timer);
      draw();
      if (!reduced && !document.hidden) timer = window.setInterval(draw, 90);
    };
    const rebuild = () => {
      build();
      update();
    };

    window.addEventListener('resize', rebuild);
    document.addEventListener('visibilitychange', update);
    rebuild();
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('resize', rebuild);
      document.removeEventListener('visibilitychange', update);
    };
  }, [theme]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 block h-full w-full" />;
}
