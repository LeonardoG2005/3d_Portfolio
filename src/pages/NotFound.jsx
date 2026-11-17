import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';
import { ROUTES } from '../app/routes.js';
import PageShell from '../components/layout/PageShell.jsx';
import { useT } from '../i18n/index.jsx';

export default function NotFound() {
  const t = useT();
  return (
    <PageShell
      title={t('notfound.title')}
      subtitle={t('notfound.text')}
      eyebrow="404"
      backdrop={
        <p
          aria-hidden="true"
          className="display text-outline pointer-events-none absolute -right-4 top-16 select-none text-[clamp(9rem,34vw,30rem)] opacity-40"
        >
          404
        </p>
      }
    >
      <ul className="mb-24 border-b border-line">
        {ROUTES.map((route) => (
          <li key={route.id} data-reveal className="border-t border-line">
            <Link to={route.path} className="fill-row shell flex items-center justify-between gap-6 py-5 sm:py-7">
              <span className="display text-[clamp(2rem,6vw,5rem)]">{t(`nav.${route.id}`)}</span>
              <span className="fill-row-muted flex items-center gap-3 font-mono text-sm text-muted transition-colors">
                {route.path}
                <ArrowUpRight aria-hidden="true" strokeWidth={1.5} className="h-6 w-6" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
