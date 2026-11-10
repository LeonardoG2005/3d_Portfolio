import { Link } from 'react-router';
import { ROUTES } from '../app/routes.js';
import PageShell from '../components/layout/PageShell.jsx';
import { useT } from '../i18n/index.jsx';

export default function NotFound() {
  const t = useT();
  return (
    <PageShell title={t('notfound.title')} subtitle={t('notfound.text')} eyebrow="404">
      <ul className="flex flex-wrap gap-3">
        {ROUTES.map((route) => (
          <li key={route.id}>
            <Link
              to={route.path}
              className="inline-flex h-11 items-center rounded-full border border-line bg-surface px-5 font-medium hover:border-accent-ink"
            >
              {t(`nav.${route.id}`)}
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
