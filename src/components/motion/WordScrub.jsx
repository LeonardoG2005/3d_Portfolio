import { useRef } from 'react';
import { MOTION_OK, gsap, useGSAP } from '../../lib/gsap.js';

// Paragraph whose words go from faint to full ink as it travels up the viewport.
export default function WordScrub({ text, className = '', start = 'top 85%', end = 'bottom 50%' }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          ref.current.querySelectorAll('.scrub-word'),
          { opacity: 0.16 },
          { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: ref.current, start, end, scrub: 0.6 } },
        );
      });
    },
    { scope: ref, dependencies: [text], revertOnUpdate: true },
  );

  return (
    <p ref={ref} className={className}>
      {String(text)
        .split(' ')
        .map((word, index) => (
          <span key={index} className="scrub-word">
            {word}{' '}
          </span>
        ))}
    </p>
  );
}
