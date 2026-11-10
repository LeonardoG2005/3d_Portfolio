import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { detectRenderer, prefersLightweight } from '../../lib/capabilities.js';
import { readStored, writeStored } from '../../lib/storage.js';

// Decides whether the home page shows the 3D room or the lightweight 2D home.
//   renderer: 'pending' | 'webgpu' | 'webgl' | 'none'   (what the device can do)
//   mode:     'pending' | 'room' | 'lite'                (what is shown)
const ExperienceContext = createContext(null);

export function ExperienceProvider({ children }) {
  const [renderer, setRenderer] = useState('pending');
  const [choice, setChoiceState] = useState(() => {
    const saved = readStored('mode');
    return saved === 'room' || saved === 'lite' ? saved : null;
  });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    detectRenderer().then((result) => alive && setRenderer(result));
    return () => {
      alive = false;
    };
  }, []);

  const setChoice = useCallback((next) => {
    writeStored('mode', next);
    setChoiceState(next);
    if (next === 'room') setFailed(false);
  }, []);

  // Called by the room when the GPU context is lost or the scene crashes.
  const reportFailure = useCallback(() => setFailed(true), []);

  const value = useMemo(() => {
    const canUseRoom = renderer === 'webgpu' || renderer === 'webgl';
    let mode = 'pending';
    if (renderer !== 'pending') {
      if (!canUseRoom || failed) mode = 'lite';
      else if (choice) mode = choice;
      else mode = prefersLightweight() ? 'lite' : 'room';
    }
    return { renderer, mode, canUseRoom, failed, setChoice, reportFailure };
  }, [renderer, choice, failed, setChoice, reportFailure]);

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export const useExperience = () => useContext(ExperienceContext);
