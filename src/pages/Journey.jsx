import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import PageShell from '../components/layout/PageShell.jsx';
import Icon from '../components/ui/Icon.jsx';
import { Card } from '../components/ui/primitives.jsx';
import { JOURNEY } from '../data/journey.js';
import { useT } from '../i18n/index.jsx';

export default function Journey() {
  const t = useT();
  return (
    <PageShell title={t('journey.title')} subtitle={t('journey.subtitle')}>
      <ol className="relative space-y-6 border-l border-line pl-8 sm:pl-10">
        {JOURNEY.map((entry) => {
          const copy = t(`journey.items.${entry.id}`);
          return (
            <li key={entry.id} className="relative">
              <span className="absolute -left-[3.05rem] top-5 grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-accent-ink sm:-left-[3.8rem] sm:h-11 sm:w-11">
                <Icon name={entry.icon} size={18} />
              </span>
              <Card className="p-6">
                <p className="label mb-2 flex flex-wrap gap-x-3">
                  <span className="text-accent-ink">{t(`journey.kinds.${entry.kind}`)}</span>
                  <span>{copy.period}</span>
                </p>
                <h2 className="text-xl font-semibold">{copy.title}</h2>
                <p className="mt-1 text-muted">{copy.place}</p>
                <p className="mt-3">{copy.text}</p>
                {entry.link && (
                  <Link to={entry.link} className="link mt-4 inline-flex items-center gap-1">
                    {t('journey.see_projects')}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                )}
              </Card>
            </li>
          );
        })}
      </ol>
    </PageShell>
  );
}
