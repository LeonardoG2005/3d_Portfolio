import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import PageShell from '../components/layout/PageShell.jsx';
import Icon from '../components/ui/Icon.jsx';
import { Card, Chip } from '../components/ui/primitives.jsx';
import { SKILL_GROUPS } from '../data/skills.js';
import { useT } from '../i18n/index.jsx';

export default function Skills() {
  const t = useT();
  return (
    <PageShell title={t('skills.title')} subtitle={t('skills.subtitle')} wide>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SKILL_GROUPS.map((group) => (
          <Card key={group.id} as="section" glow className="p-6" aria-labelledby={`skills-${group.id}`}>
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-raised text-accent-ink">
                <Icon name={group.icon} size={20} />
              </span>
              <h2 id={`skills-${group.id}`} className="text-lg font-semibold">
                {t(`skills.groups.${group.id}`)}
              </h2>
            </div>
            <ul className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li key={item}>
                  <Chip>{item}</Chip>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <p className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-muted">
        {t('skills.note')}
        <Link to="/projects" className="link inline-flex items-center gap-1">
          {t('skills.see_projects')}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </p>
    </PageShell>
  );
}
