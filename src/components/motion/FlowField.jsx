import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../lib/gsap.js';

// Particles that follow a slowly changing angle field and leave faint trails.
// 2D canvas on purpose: a few hundred short strokes per frame cost very little.
// The canvas is transparent, so the background scene stays visible behind the trails.
export default function FlowField({ className = '', count = 260 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const still = prefersReducedMotion();
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let colors = { ink: '#36d463' };
    const particles = [];

    const readColors = () => {
      const style = getComputedStyle(document.documentElement);
      colors = { ink: style.getPropertyValue('--accent-ink').trim() };
    };
    const spawn = (particle = {}) => {
      particle.x = Math.random() * width;
      particle.y = Math.random() * height;
      particle.life = 60 + Math.random() * 180;
      return particle;
    };
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      particles.length = 0;
      const total = Math.round(count * Math.min(1, Math.max(0.35, width / 1100)));
      for (let index = 0; index < total; index += 1) particles.push(spawn());
    };
    const angleAt = (x, y, time) =>
      (Math.sin(x * 0.0032 + time * 0.00012) + Math.cos(y * 0.0041 - time * 0.0001) + Math.sin((x + y) * 0.0017)) * Math.PI;

    const step = (time) => {
      // Erase a little of what is already drawn, so trails fade to transparent instead of to a colour.
      context.globalCompositeOperation = 'destination-out';
      context.globalAlpha = 0.07;
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = 'source-over';
      context.globalAlpha = 0.5;
      context.strokeStyle = colors.ink;
      context.lineWidth = 1;
      context.beginPath();
      for (const particle of particles) {
        const angle = angleAt(particle.x, particle.y, time);
        const nx = particle.x + Math.cos(angle) * 1.3;
        const ny = particle.y + Math.sin(angle) * 1.3;
        context.moveTo(particle.x, particle.y);
        context.lineTo(nx, ny);
        particle.x = nx;
        particle.y = ny;
        particle.life -= 1;
        if (particle.life < 0 || nx < 0 || nx > width || ny < 0 || ny > height) spawn(particle);
      }
      context.stroke();
    };
    const loop = (time) => {
      step(time);
      frame = requestAnimationFrame(loop);
    };
    const update = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (!still && visible && !document.hidden) frame = requestAnimationFrame(loop);
    };
    const restart = () => {
      readColors();
      resize();
      // A still picture for reduced motion: run the field for a moment, then stop.
      if (still) for (let index = 0; index < 160; index += 1) step(index * 16);
      update();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(canvas);
    const themeObserver = new MutationObserver(restart);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.addEventListener('resize', restart);
    document.addEventListener('visibilitychange', update);
    restart();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      themeObserver.disconnect();
      window.removeEventListener('resize', restart);
      document.removeEventListener('visibilitychange', update);
    };
  }, [count]);

  return <canvas ref={ref} aria-hidden="true" className={`block h-full w-full ${className}`} />;
}
