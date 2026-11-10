import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import PageShell from '../components/layout/PageShell.jsx';
import SmartImage from '../components/ui/SmartImage.jsx';
import { Card, Chip } from '../components/ui/primitives.jsx';
import { PROJECTS } from '../data/projects.js';
import { useT } from '../i18n/index.jsx';

export default function Projects() {
  const t = useT();
  return (
    <PageShell title={t('projects.title')} subtitle={t('projects.subtitle')} wide>
      <ul className="grid gap-6 md:grid-cols-2">
        {PROJECTS.map((project) => {
          const copy = t(`projects.items.${project.slug}`);
          return (
            <li key={project.slug}>
              <Card as="article" glow className="group flex h-full flex-col overflow-hidden">
                <div className="aspect-[16/9] overflow-hidden border-b border-line bg-raised">
                  <SmartImage
                    src={project.cover}
                    name={copy.name}
                    accent={project.accent}
                    alt={t('projects.cover_alt', { name: copy.name })}
                    placeholderLabel={t('projects.placeholder_alt', { name: copy.name })}
                    className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="label mb-2 text-accent-ink">{copy.status}</p>
                  <h2 className="text-2xl font-semibold">
                    <Link to={`/projects/${project.slug}`} className="after:absolute after:inset-0 after:rounded-[inherit]">
                      {copy.name}
                    </Link>
                  </h2>
                  <p className="mt-2 text-muted">{copy.tagline}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {project.tech.slice(0, 5).map((tech) => (
                      <li key={tech}>
                        <Chip>{tech}</Chip>
                      </li>
                    ))}
                    {project.tech.length > 5 && (
                      <li>
                        <Chip className="text-muted">+{project.tech.length - 5}</Chip>
                      </li>
                    )}
                  </ul>
                  <p className="mt-auto flex items-center gap-1 pt-6 text-sm font-semibold text-accent-ink">
                    {t('projects.view')}
                    <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
                  </p>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </PageShell>
  );
}
