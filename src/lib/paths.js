// Every static file under /public must be referenced through asset(),
// so paths keep working under the GitHub Pages subpath.
const BASE = import.meta.env.BASE_URL;

export function asset(path) {
  return BASE + String(path).replace(/^\/+/, '');
}

// Checks that a same-origin static file exists without downloading it.
const cache = new Map();
export function fileExists(path) {
  const url = asset(path);
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url, { method: 'HEAD' })
        .then((res) => {
          const type = res.headers.get('content-type') || '';
          // Pages and dev servers may answer unknown paths with an HTML page.
          return res.ok && !type.includes('text/html');
        })
        .catch(() => false),
    );
  }
  return cache.get(url);
}
