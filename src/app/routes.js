// Single source of truth for the site map. Plain JS on purpose:
// scripts/postbuild-routes.mjs imports it to emit one HTML file per route.
export const ROUTES = [
  { id: 'home', path: '/' },
  { id: 'about', path: '/about' },
  { id: 'skills', path: '/skills' },
  { id: 'projects', path: '/projects' },
  { id: 'journey', path: '/journey' },
  { id: 'activity', path: '/activity' },
  { id: 'contact', path: '/contact' },
];

export const routePath = (id) => ROUTES.find((route) => route.id === id)?.path ?? '/';
