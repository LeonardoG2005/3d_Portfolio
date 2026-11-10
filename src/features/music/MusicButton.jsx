import { useEffect, useRef } from 'react';
import { useT } from '../../i18n/index.jsx';
import { useMusic } from './MusicProvider.jsx';

// Frequency bins (out of 32) sampled for each of the four bars.
const BANDS = [
  [1, 3],
  [3, 6],
  [6, 11],
  [11, 18],
];

// Green pill with four dots that turn into four moving equalizer bars while music plays.
export default function MusicButton() {
  const t = useT();
  const { status, toggle, analyserRef } = useMusic();
  const barsRef = useRef(null);
  const playing = status === 'playing';
  const unavailable = status === 'unavailable';
  const hasAnalyser = playing && !!analyserRef.current;

  useEffect(() => {
    const container = barsRef.current;
    if (!container) return undefined;
    const bars = Array.from(container.children);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasAnalyser || reduced) {
      bars.forEach((bar) => bar.style.removeProperty('--level'));
      return undefined;
    }

    const analyser = analyserRef.current;
    const data = new Uint8Array(analyser.frequencyBinCount);
    let frame = 0;
    const tick = () => {
      analyser.getByteFrequencyData(data);
      BANDS.forEach(([from, to], index) => {
        let sum = 0;
        for (let i = from; i < to; i += 1) sum += data[i];
        const level = Math.min(1, (sum / (to - from) / 255) * 1.35);
        // Keep a small floor so a quiet passage still reads as "on".
        bars[index].style.setProperty('--level', (0.18 + level * 0.82).toFixed(3));
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [hasAnalyser, analyserRef]);

  const label = unavailable ? t('controls.music_unavailable') : playing ? t('controls.music_pause') : t('controls.music_play');

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={label}
      title={label}
      aria-disabled={unavailable}
      className={`grid h-11 w-11 place-items-center rounded-full transition-transform active:scale-95 ${
        unavailable ? 'cursor-not-allowed opacity-45' : 'hover:scale-105'
      }`}
    >
      <span
        ref={barsRef}
        className={`flex h-7 w-11 items-center justify-center gap-[3px] rounded-[9px] bg-accent shadow-[0_0_0_1px_rgb(0_0_0/0.12)] ${
          playing ? `eq-on items-end pb-[5px] ${hasAnalyser ? '' : 'eq-css'}` : ''
        }`}
      >
        <span className="eq-bar" />
        <span className="eq-bar" />
        <span className="eq-bar" />
        <span className="eq-bar" />
      </span>
    </button>
  );
}
