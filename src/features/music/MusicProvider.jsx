import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ASSETS } from '../../data/profile.js';
import { asset } from '../../lib/paths.js';

// Background music. Nothing is created or downloaded until the visitor presses the music button.
// status: 'idle' | 'playing' | 'paused' | 'unavailable'
const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const [status, setStatus] = useState('idle');
  const audioRef = useRef(null);
  const contextRef = useRef(null);
  const analyserRef = useRef(null);
  const resumeOnVisible = useRef(false);

  const setup = useCallback(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = 'none';
    audio.src = asset(ASSETS.music);
    audio.addEventListener('error', () => setStatus('unavailable'));
    audio.addEventListener('playing', () => setStatus('playing'));
    audio.addEventListener('pause', () => setStatus((current) => (current === 'unavailable' ? current : 'paused')));
    audioRef.current = audio;

    // Web Audio analyser so the button bars follow the real signal. Optional: plain playback still works without it.
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContextClass();
      const source = context.createMediaElementSource(audio);
      const analyser = context.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);
      analyser.connect(context.destination);
      contextRef.current = context;
      analyserRef.current = analyser;
    } catch {
      contextRef.current = null;
      analyserRef.current = null;
    }
  }, []);

  const toggle = useCallback(() => {
    if (status === 'unavailable') return;
    if (!audioRef.current) setup();
    const audio = audioRef.current;
    if (audio.paused) {
      contextRef.current?.resume?.().catch(() => {});
      audio.play().catch((error) => {
        // NotAllowedError means the browser wants another gesture. Anything else means the file cannot play.
        if (error?.name !== 'NotAllowedError' && error?.name !== 'AbortError') setStatus('unavailable');
      });
    } else {
      audio.pause();
    }
  }, [status, setup]);

  // Do not keep playing in a hidden tab. Resume only if it was playing before.
  useEffect(() => {
    const onVisibility = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.hidden) {
        resumeOnVisible.current = !audio.paused;
        audio.pause();
      } else if (resumeOnVisible.current) {
        resumeOnVisible.current = false;
        audio.play().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(
    () => () => {
      audioRef.current?.pause();
      contextRef.current?.close?.().catch(() => {});
    },
    [],
  );

  const value = useMemo(() => ({ status, toggle, analyserRef }), [status, toggle]);
  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export const useMusic = () => useContext(MusicContext);
