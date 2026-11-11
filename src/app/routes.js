// Single source of truth for the site map. Plain JS on purpose:
// scripts/postbuild-routes.mjs imports it to emit one HTML file per route.
export const ROUTES = [
  { id: 'home', path: '/' },
  { id: 'about', path: '/about' },
  { id: 'skills', path: '/skills' },
  { id: 'projects', path: '/projects' },
  { id: 'journey', path: '/journey' },
  { id: 'contact', path: '/contact' },
];

// Old addresses that still get a real HTML file so existing links keep working.
export const LEGACY_PATHS = ['/activity'];

export const routePath = (id) => ROUTES.find((route) => route.id === id)?.path ?? '/';
