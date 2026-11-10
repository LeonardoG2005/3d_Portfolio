import { m } from 'motion/react';
import { useEffect } from 'react';
import { PROFILE } from '../../data/profile.js';
import { GitHubIcon } from '../ui/BrandIcons.jsx';
import { useT } from '../../i18n/index.jsx';

// Shared frame for every content page: document title, heading block, entrance animation and footer.
export default function PageShell({ title, subtitle, eyebrow, children, wide = false }) {
  const t = useT();

  useEffect(() => {
    document.title = title ? `${title} · ${PROFILE.shortName}` : t('meta.title');
  }, [title, t]);

  return (
    <div className="flex min-h-dvh flex-col">
      <m.main
        id="main"
        tabIndex={-1}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`mx-auto w-full flex-1 px-4 pb-20 pt-28 outline-none sm:px-6 ${wide ? 'max-w-6xl' : 'max-w-5xl'}`}
      >
        <header className="mb-10 max-w-3xl sm:mb-14">
          {eyebrow && <p className="label mb-3">{eyebrow}</p>}
          <h1 className="text-4xl font-semibold sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-4 text-lg text-muted">{subtitle}</p>}
        </header>
        {children}
      </m.main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted sm:px-6">
          <p>{t('footer.made')}</p>
          <a
            href={`${PROFILE.links.github}/3d_Portfolio`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 hover:text-ink"
          >
            <GitHubIcon size={16} />
            {t('footer.source')}
          </a>
        </div>
      </footer>
    </div>
  );
}
