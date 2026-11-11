import { Briefcase, CodeXml, GraduationCap, House, Mail, User } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router';
import { ROUTES } from '../../app/routes.js';
import { useT } from '../../i18n/index.jsx';
import { LanguageToggle, ThemeToggle } from './Controls.jsx';

const ICONS = {
  home: House,
  about: User,
  skills: CodeXml,
  projects: Briefcase,
  journey: GraduationCap,
  contact: Mail,
};

// Timing and motion follow the reference navbar: blur fades in, items rise in with a staggered spring,
// and on hover an item grows slightly and slides right while its underline extends.
const scrim = {
  closed: { opacity: 0, transition: { duration: 0.3 } },
  open: { opacity: 1, transition: { duration: 0.4 } },
};
const list = {
  closed: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
  open: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
const item = {
  closed: { opacity: 0, y: 20, scale: 1, x: 0 },
  open: { opacity: 1, y: 0, scale: 1, x: 0, transition: { type: 'spring', stiffness: 100, duration: 0.5 } },
  hover: { scale: 1.05, x: 10, transition: { type: 'spring', stiffness: 300, damping: 20 } },
  tap: { scale: 0.95 },
};
const iconBox = {
  closed: { scale: 1 },
  open: { scale: 1 },
  hover: { scale: 1.1 },
};
const underline = (active) => ({
  closed: { width: active ? '30%' : '0%' },
  open: { width: active ? '30%' : '0%', transition: { duration: 0.3 } },
  hover: { width: '30%', transition: { duration: 0.3 } },
});

// Navigation overlay. The page stays visible (blurred and dimmed) and keeps scrolling underneath:
// nothing here is scrollable and the document is not locked, so wheel and touch scroll reach the page.
export default function OverlayMenu({ open, onClose }) {
  const t = useT();
  const panelRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const panel = panelRef.current;
    const focusables = () => Array.from(panel.querySelectorAll('a[href], button:not([disabled])'));
    focusables()[0]?.focus({ preventScroll: true });

    const onKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <m.div
            aria-hidden="true"
            variants={scrim}
            initial="closed"
            animate="open"
            exit="closed"
            className="menu-scrim fixed inset-0 z-40 backdrop-blur-xl"
          />
          <m.div
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.menu')}
            ref={panelRef}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 z-40 flex items-center overflow-hidden"
          >
            <m.nav
              variants={list}
              aria-label={t('nav.menu')}
              className="mx-auto w-full max-w-4xl px-6 pb-16 pt-24 sm:px-10"
            >
              <ul className="grid gap-2 sm:gap-4">
                {ROUTES.map((route) => {
                  const RouteIcon = ICONS[route.id];
                  const active = route.path === '/' ? location.pathname === '/' : location.pathname.startsWith(route.path);
                  return (
                    <m.li key={route.id} variants={item} whileHover="hover" whileTap="tap" className="group relative">
                      <NavLink
                        to={route.path}
                        end={route.path === '/'}
                        onClick={onClose}
                        aria-current={active ? 'page' : undefined}
                        className={`menu-link flex w-fit items-center gap-5 py-2 pl-1 pr-6 font-display text-4xl font-medium tracking-tight transition-colors duration-300 sm:gap-7 sm:py-3 sm:text-5xl ${
                          active ? 'text-ink' : 'text-ink/35 group-hover:text-ink focus-visible:text-ink'
                        }`}
                      >
                        <m.span
                          variants={iconBox}
                          className="menu-icon grid shrink-0 place-items-center rounded-lg p-2 transition-colors duration-300"
                        >
                          <RouteIcon aria-hidden="true" strokeWidth={1.4} className="h-8 w-8 sm:h-10 sm:w-10" />
                        </m.span>
                        <span>{t(`nav.${route.id}`)}</span>
                      </NavLink>
                      {/* Underline in the text colour, as in the reference: on for the current page, grows on hover */}
                      <m.span
                        aria-hidden="true"
                        variants={underline(active)}
                        style={{ width: active ? '30%' : '0%' }}
                        className="pointer-events-none absolute bottom-1 left-[4.5rem] block h-0.5 rounded-full bg-ink sm:left-[5.5rem]"
                      />
                    </m.li>
                  );
                })}
              </ul>
            </m.nav>

            <m.div variants={scrim} className="absolute inset-x-0 bottom-6 flex justify-center gap-1 sm:hidden">
              <LanguageToggle />
              <ThemeToggle />
            </m.div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
