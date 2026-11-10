import { useEffect, useState } from 'react';
import { ASSETS } from '../data/profile.js';
import { asset, fileExists } from '../lib/paths.js';

// Returns the CV files that really exist under /public, so a missing PDF never becomes a broken link.
// Shape: { ready: boolean, items: [{ lang: 'en' | 'es', href }] }
export function useCvFiles() {
  const [state, setState] = useState({ ready: false, items: [] });

  useEffect(() => {
    let alive = true;
    Promise.all(
      Object.entries(ASSETS.cv).map(async ([lang, path]) => ((await fileExists(path)) ? { lang, href: asset(path) } : null)),
    ).then((found) => {
      if (alive) setState({ ready: true, items: found.filter(Boolean) });
    });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
