import { useRef } from 'react';
import { MOTION_OK, gsap, useGSAP } from '../../lib/gsap.js';

// Pulls its child a little toward the pointer. Mouse only; no effect on touch or reduced motion.
export default function Magnetic({ children, strength = 0.35, className = '' }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${MOTION_OK} and (hover: hover) and (pointer: fine)`, () => {
        const element = ref.current;
        const moveX = gsap.quickTo(element, 'x', { duration: 0.5, ease: 'power3.out' });
        const moveY = gsap.quickTo(element, 'y', { duration: 0.5, ease: 'power3.out' });
        const onMove = (event) => {
          const box = element.getBoundingClientRect();
          moveX((event.clientX - box.left - box.width / 2) * strength);
          moveY((event.clientY - box.top - box.height / 2) * strength);
        };
        const onLeave = () => {
          moveX(0);
          moveY(0);
        };
        element.addEventListener('pointermove', onMove);
        element.addEventListener('pointerleave', onLeave);
        return () => {
          element.removeEventListener('pointermove', onMove);
          element.removeEventListener('pointerleave', onLeave);
        };
      });
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {children}
    </span>
  );
}
