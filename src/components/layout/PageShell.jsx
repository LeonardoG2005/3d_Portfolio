import { ChevronLeft } from 'lucide-react';
import { m } from 'motion/react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { PROFILE } from '../../data/profile.js';
import { useT } from '../../i18n/index.jsx';

// Goes back inside the site when possible; a direct visit has no in-site history, so it goes home.
function BackButton() {
  const t = useT();
  const navigate = useNavigate();
  const goBack = () => {
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    else navigate('/');
  };
  return (
    <button
      type="button"
      onClick={goBack}
      aria-label={t('nav.back')}
      title={t('nav.back')}
      className="mb-6 grid h-10 w-10 place-items-center rounded-full border border-line text-muted transition-colors hover:border-accent-ink hover:text-ink"
    >
      <ChevronLeft size={20} aria-hidden="true" />
    </button>
  );
}

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
        className={`mx-auto w-full flex-1 px-4 pb-20 pt-24 outline-none sm:px-6 ${wide ? 'max-w-6xl' : 'max-w-5xl'}`}
      >
        <BackButton />
        <header className="mb-10 max-w-3xl sm:mb-14">
          {eyebrow && <p className="label mb-3">{eyebrow}</p>}
          <h1 className="text-4xl font-semibold sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-4 text-lg text-muted">{subtitle}</p>}
        </header>
        {children}
      </m.main>

      <footer className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-muted sm:px-6">{t('footer.made')}</p>
      </footer>
    </div>
  );
}
