import { useRef } from 'react';
import { MOTION_OK, gsap, useGSAP } from '../../lib/gsap.js';

// Counts from zero to a real value the first time it scrolls into view.
export default function CountUp({ value, format = (n) => String(n) }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const state = { n: 0 };
        gsap.to(state, {
          n: value,
          duration: 1.6,
          ease: 'power3.out',
          scrollTrigger: { trigger: ref.current, start: 'top 92%', once: true },
          onUpdate: () => {
            if (ref.current) ref.current.textContent = format(Math.round(state.n));
          },
        });
      });
    },
    { dependencies: [value], revertOnUpdate: true },
  );

  return <span ref={ref}>{format(value)}</span>;
}
