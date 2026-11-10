// localStorage can throw (private mode, blocked storage). Never let that break the UI.
const PREFIX = 'lg.';

export function readStored(key, fallback = null) {
  try {
    const value = window.localStorage.getItem(PREFIX + key);
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

export function writeStored(key, value) {
  try {
    if (value === null || value === undefined) window.localStorage.removeItem(PREFIX + key);
    else window.localStorage.setItem(PREFIX + key, String(value));
  } catch {
    /* ignore */
  }
}
