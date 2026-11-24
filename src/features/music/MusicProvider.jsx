import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ASSETS, PROFILE } from '../../data/profile.js';
import { asset } from '../../lib/paths.js';
import { readStored, writeStored } from '../../lib/storage.js';

// Background music. Nothing is created or downloaded until the visitor presses a music control.
// status: 'idle' | 'playing' | 'paused' | 'unavailable'
const MusicContext = createContext(null);
const TRACKS = ASSETS.music;
// Pressing "previous" this far into a track restarts it instead of going back.
const RESTART_AFTER = 3;

function storedTrack() {
  const index = Number(readStored('track'));
  return Number.isInteger(index) && index >= 0 && index < TRACKS.length ? index : 0;
}

export function MusicProvider({ children }) {
  const [status, setStatus] = useState('idle');
  const [track, setTrack] = useState(storedTrack);
  const audioRef = useRef(null);
  const contextRef = useRef(null);
  const analyserRef = useRef(null);
  const trackRef = useRef(track);
  const resumeOnVisible = useRef(false);
  const controls = useRef({});

  const load = useCallback((index) => {
    trackRef.current = index;
    setTrack(index);
    writeStored('track', index);
    audioRef.current.src = asset(TRACKS[index]);
  }, []);

  const play = useCallback(() => {
    const audio = audioRef.current;
    contextRef.current?.resume?.().catch(() => {});
    audio.play().catch((error) => {
      // NotAllowedError means the browser wants another gesture. Anything else means the file cannot play.
      if (error?.name !== 'NotAllowedError' && error?.name !== 'AbortError') setStatus('unavailable');
    });
  }, []);

  const setup = useCallback(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audio.addEventListener('error', () => setStatus('unavailable'));
    audio.addEventListener('playing', () => setStatus('playing'));
    audio.addEventListener('pause', () => setStatus((current) => (current === 'unavailable' ? current : 'paused')));
    audio.addEventListener('ended', () => controls.current.next?.());
    audioRef.current = audio;
    load(trackRef.current);

    // The analyser drives the equalizer bars. Playback still works without it.
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContextClass();
      const source = context.createMediaElementSource(audio);
      const analyser = context.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.55;
      source.connect(analyser);
      analyser.connect(context.destination);
      contextRef.current = context;
      analyserRef.current = analyser;
    } catch {
      contextRef.current = null;
      analyserRef.current = null;
    }
  }, [load]);

  const toggle = useCallback(() => {
    if (status === 'unavailable') return;
    if (!audioRef.current) setup();
    if (audioRef.current.paused) play();
    else audioRef.current.pause();
  }, [status, setup, play]);

  const skip = useCallback(
    (step) => {
      if (status === 'unavailable') return;
      if (!audioRef.current) setup();
      const audio = audioRef.current;
      if (step < 0 && audio.currentTime > RESTART_AFTER) {
        audio.currentTime = 0;
      } else {
        load((trackRef.current + step + TRACKS.length) % TRACKS.length);
      }
      play();
    },
    [status, setup, load, play],
  );

  const next = useCallback(() => skip(1), [skip]);
  const previous = useCallback(() => skip(-1), [skip]);
  controls.current = { toggle, next, previous };

  // Media keys, headset buttons and the lock screen control the same player.
  useEffect(() => {
    const session = navigator.mediaSession;
    if (!session || status === 'idle') return;
    if (typeof window.MediaMetadata === 'function') {
      session.metadata = new window.MediaMetadata({ title: `Track ${track + 1}`, artist: PROFILE.shortName, album: 'Portfolio' });
    }
    session.playbackState = status === 'playing' ? 'playing' : 'paused';
  }, [status, track]);

  useEffect(() => {
    const session = navigator.mediaSession;
    if (!session) return undefined;
    const handlers = {
      play: () => audioRef.current?.paused && controls.current.toggle(),
      pause: () => audioRef.current && !audioRef.current.paused && controls.current.toggle(),
      previoustrack: () => controls.current.previous(),
      nexttrack: () => controls.current.next(),
    };
    Object.entries(handlers).forEach(([action, handler]) => {
      try {
        session.setActionHandler(action, handler);
      } catch {
        /* action not supported by this browser */
      }
    });
    return () =>
      Object.keys(handlers).forEach((action) => {
        try {
          session.setActionHandler(action, null);
        } catch {
          /* ignore */
        }
      });
  }, []);

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

  const value = useMemo(
    () => ({ status, toggle, next, previous, track, total: TRACKS.length, analyserRef }),
    [status, toggle, next, previous, track],
  );
  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export const useMusic = () => useContext(MusicContext);
