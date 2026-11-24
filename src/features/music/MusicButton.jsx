import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
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

// Compact player: previous, play/pause and next. While music plays the green button shows
// four equalizer bars that follow the real signal; hovering or focusing it shows the pause icon.
export default function MusicButton() {
  const t = useT();
  const { status, toggle, next, previous, track, total, analyserRef } = useMusic();
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
    // Each band is mapped onto its own recent range (a slowly adapting floor and ceiling), so the bars
    // swing through their full height on quiet and loud passages alike instead of sitting still.
    const floors = BANDS.map(() => 255);
    const ceilings = BANDS.map(() => 0);
    const levels = BANDS.map(() => 0);
    let frame = 0;
    const tick = () => {
      analyser.getByteFrequencyData(data);
      BANDS.forEach(([from, to], index) => {
        let sum = 0;
        for (let i = from; i < to; i += 1) sum += data[i];
        const raw = sum / (to - from);
        floors[index] = raw < floors[index] ? raw : floors[index] + (raw - floors[index]) * 0.02;
        ceilings[index] = raw > ceilings[index] ? raw : ceilings[index] - (ceilings[index] - raw) * 0.02;
        const span = Math.max(ceilings[index] - floors[index], 18);
        const target = Math.min(1, Math.max(0, (raw - floors[index]) / span));
        // Fast rise, slower fall: lively without flickering.
        levels[index] = target > levels[index] ? target : levels[index] * 0.8 + target * 0.2;
        bars[index].style.setProperty('--level', (0.06 + levels[index] * 0.94).toFixed(3));
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [hasAnalyser, analyserRef]);

  const label = unavailable ? t('controls.music_unavailable') : playing ? t('controls.music_pause') : t('controls.music_play');
  const trackLabel = status === 'idle' ? '' : ` · ${t('controls.music_track', { n: track + 1, total })}`;
  const key = 'music-key grid h-7 w-6 place-items-center rounded-full disabled:cursor-not-allowed';

  return (
    <div
      role="group"
      aria-label={label + trackLabel}
      className={`music-player flex h-10 w-[88px] items-center justify-between rounded-full px-1 ${unavailable ? 'opacity-45' : ''}`}
    >
      <button
        type="button"
        onClick={previous}
        disabled={unavailable}
        aria-label={t('controls.music_previous')}
        title={t('controls.music_previous')}
        className={key}
      >
        <SkipBack size={13} fill="currentColor" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={label}
        title={label + trackLabel}
        aria-disabled={unavailable}
        className={`music-play group relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-on-accent transition-transform active:scale-95 ${
          unavailable ? 'cursor-not-allowed' : 'hover:scale-105'
        } ${playing ? 'music-pill-on' : ''}`}
      >
        {playing ? (
          <>
            <span
              ref={barsRef}
              aria-hidden="true"
              className={`eq-on flex h-4 items-end justify-center gap-[2px] transition-opacity group-hover:opacity-0 group-focus-visible:opacity-0 ${
                hasAnalyser ? '' : 'eq-css'
              }`}
            >
              <span className="eq-bar" />
              <span className="eq-bar" />
              <span className="eq-bar" />
              <span className="eq-bar" />
            </span>
            <Pause
              size={14}
              fill="currentColor"
              aria-hidden="true"
              className="absolute opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            />
          </>
        ) : (
          <Play size={14} fill="currentColor" aria-hidden="true" className="translate-x-[1px]" />
        )}
      </button>

      <button
        type="button"
        onClick={next}
        disabled={unavailable}
        aria-label={t('controls.music_next')}
        title={t('controls.music_next')}
        className={key}
      >
        <SkipForward size={13} fill="currentColor" aria-hidden="true" />
      </button>
    </div>
  );
}
