import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import MusicButton from '../../features/music/MusicButton.jsx';
import { useT } from '../../i18n/index.jsx';
import { LanguageToggle, ModeToggle, ThemeToggle } from './Controls.jsx';
import OverlayMenu from './OverlayMenu.jsx';

function Logo() {
  return (
    <svg viewBox="0 0 64 64" width="36" height="36" aria-hidden="true">
      <rect x="10" y="12" width="44" height="30" rx="6" fill="none" stroke="var(--accent)" strokeWidth="4" />
      <path
        d="M27 21l-6 6 6 6M37 21l6 6-6 6"
        fill="none"
        stroke="var(--accent-ink)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M32 42v8M21 52h22" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export default function TopBar() {
  const t = useT();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the menu whenever the route changes.
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300 ${
          scrolled && !open ? 'border-b border-line bg-bg/80 backdrop-blur-md' : 'border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label={t('nav.back_home')} className="flex items-center gap-2 rounded-lg">
            <Logo />
            <span className="hidden font-display text-lg font-semibold tracking-tight sm:inline">
              leo<span className="text-accent-ink">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <MusicButton />
            <div className="hidden items-center gap-1 sm:flex">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            {isHome && <ModeToggle />}
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? t('nav.close') : t('nav.menu')}
              className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-raised active:scale-95"
            >
              {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>
      <OverlayMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
