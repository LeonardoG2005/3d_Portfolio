import { useRef } from 'react';
import { MOTION_OK, gsap, useGSAP } from '../../lib/gsap.js';

// How long to wait after each character, in seconds: a quick, slightly uneven rhythm
// with a breath after commas and a longer one after full stops, like someone typing.
function pause(char) {
  const jitter = Math.random() * 0.03;
  if (char === ' ') return 0.045 + jitter;
  if (char === ',' || char === ';' || char === ':') return 0.24 + jitter;
  if (char === '.' || char === '!' || char === '?') return 0.34 + jitter;
  return 0.026 + jitter;
}

// A code-comment line typed out with a block cursor. Letters are only hidden, never added, so nothing
// shifts while typing. `whenVisible` waits until the line scrolls into view instead of using `delay`.
export default function TypedLine({ text, prefix = '//', className = '', delay = 1.05, whenVisible = false }) {
  const root = useRef(null);
  const sentence = String(text);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const line = root.current;
        const prefix = line.querySelector('.typed-prefix');
        const letters = gsap.utils.toArray('.typed-char', line);
        let cursor = prefix;
        const moveCursor = (element) => {
          cursor.classList.remove('typed-cursor');
          element.classList.add('typed-cursor');
          cursor = element;
        };

        line.classList.add('is-typing');
        prefix.classList.add('typed-cursor');

        const timeline = whenVisible
          ? gsap.timeline({ scrollTrigger: { trigger: line, start: 'top 88%', once: true } })
          : gsap.timeline({ delay });
        timeline.call(() => line.classList.add('is-writing'), null, 0);
        let time = 0.25;
        let index = 0;
        for (const char of sentence) {
          if (char !== ' ') {
            const letter = letters[index];
            index += 1;
            timeline.call(
              () => {
                letter.classList.add('is-on');
                moveCursor(letter);
              },
              null,
              time,
            );
          }
          time += pause(char);
        }
        // Finished: the cursor stays after the last letter and starts blinking again.
        timeline.call(() => line.classList.remove('is-writing'), null, time + 0.2);

        return () => {
          timeline.kill();
          line.classList.remove('is-typing', 'is-writing');
          cursor.classList.remove('typed-cursor');
          letters.forEach((letter) => letter.classList.remove('is-on'));
        };
      });
    },
    { scope: root, dependencies: [sentence, delay, whenVisible], revertOnUpdate: true },
  );

  return (
    <p ref={root} aria-label={sentence} className={`typed ${className}`}>
      <span aria-hidden="true">
        <span className="typed-prefix">{prefix}</span>{' '}
        {sentence.split(' ').map((word, wordIndex) => (
          <span key={`${wordIndex}-${word}`}>
            <span className="typed-word">
              {Array.from(word).map((char, charIndex) => (
                <span key={charIndex} className="typed-char">
                  {char}
                </span>
              ))}
            </span>{' '}
          </span>
        ))}
      </span>
    </p>
  );
}
