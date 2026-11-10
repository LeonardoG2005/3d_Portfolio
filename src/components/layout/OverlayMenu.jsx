import { Download } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router';
import { ROUTES } from '../../app/routes.js';
import { useCvFiles } from '../../hooks/useAvailableFiles.js';
import { useT } from '../../i18n/index.jsx';
import { LanguageToggle, ThemeToggle } from './Controls.jsx';

const list = {
  open: { transition: { staggerChildren: 0.045, delayChildren: 0.08 } },
  closed: {},
};
const item = {
  open: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  closed: { opacity: 0, y: 14 },
};

// Full-screen navigation. Behaves as a modal dialog: focus is trapped and Escape closes it.
export default function OverlayMenu({ open, onClose }) {
  const t = useT();
  const panelRef = useRef(null);
  const cv = useCvFiles();

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const panel = panelRef.current;
    const focusables = () => Array.from(panel.querySelectorAll('a[href], button:not([disabled])'));
    focusables()[0]?.focus();
    document.body.style.overflow = 'hidden';

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
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <m.div
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label={t('nav.menu')}
          ref={panelRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 overflow-y-auto bg-bg/92 backdrop-blur-xl"
        >
          <div className="mx-auto flex min-h-full max-w-6xl flex-col justify-between px-6 pb-8 pt-24">
            <m.nav variants={list} initial="closed" animate="open" aria-label={t('nav.menu')}>
              <ul className="grid gap-1">
                {ROUTES.map((route, index) => (
                  <m.li key={route.id} variants={item}>
                    <NavLink
                      to={route.path}
                      end={route.path === '/'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group flex items-baseline gap-4 rounded-xl py-2 font-display text-4xl font-semibold tracking-tight transition-colors sm:text-5xl ${
                          isActive ? 'text-ink' : 'text-muted hover:text-ink'
                        }`
                      }
                    >
                      <span className="w-8 font-mono text-xs font-normal tracking-widest text-accent-ink">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="transition-transform duration-200 group-hover:translate-x-2">
                        {t(`nav.${route.id}`)}
                      </span>
                    </NavLink>
                  </m.li>
                ))}
              </ul>
            </m.nav>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
              <div className="flex flex-wrap gap-2">
                {cv.items.map((file) => (
                  <a
                    key={file.lang}
                    href={file.href}
                    download
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium transition-colors hover:border-accent-ink"
                  >
                    <Download size={16} aria-hidden="true" />
                    {t(`contact.cv_${file.lang}`)}
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-1 sm:hidden">
                <LanguageToggle />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
