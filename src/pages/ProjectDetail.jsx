import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, KeyRound } from 'lucide-react';
import { Link, useParams } from 'react-router';
import PageShell from '../components/layout/PageShell.jsx';
import { GitHubIcon } from '../components/ui/BrandIcons.jsx';
import SmartImage from '../components/ui/SmartImage.jsx';
import { ButtonLink, Card, Chip } from '../components/ui/primitives.jsx';
import { PROJECTS, getProject } from '../data/projects.js';
import { useT } from '../i18n/index.jsx';
import NotFound from './NotFound.jsx';

function Section({ title, children }) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="mb-3 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.slice(0, 32)} className="flex gap-3">
          <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const t = useT();
  const project = getProject(slug);
  if (!project) return <NotFound />;

  const copy = t(`projects.items.${project.slug}`);
  const next = PROJECTS[(PROJECTS.indexOf(project) + 1) % PROJECTS.length];
  const nextCopy = t(`projects.items.${next.slug}`);

  return (
    <PageShell title={copy.name} subtitle={copy.tagline} eyebrow={copy.status} wide>
      <div className="-mt-4 mb-8 flex flex-wrap items-center gap-3">
        {project.links.demo && (
          <ButtonLink href={project.links.demo} external>
            {t('projects.live')}
            <ArrowUpRight size={16} aria-hidden="true" />
          </ButtonLink>
        )}
        {project.links.repos?.map((repo) => (
          <ButtonLink key={repo.url} href={repo.url} external variant="secondary">
            <GitHubIcon size={16} />
            {project.links.repos.length > 1 ? repo.label : t('projects.repo')}
          </ButtonLink>
        ))}
        {project.links.docs && (
          <ButtonLink href={project.links.docs} external variant="secondary">
            <BookOpen size={16} aria-hidden="true" />
            {t('projects.docs')}
          </ButtonLink>
        )}
      </div>

      <div className="mb-12 aspect-[16/9] overflow-hidden rounded-3xl border border-line bg-raised">
        <SmartImage
          src={project.cover}
          name={copy.name}
          accent={project.accent}
          alt={t('projects.cover_alt', { name: copy.name })}
          placeholderLabel={t('projects.placeholder_alt', { name: copy.name })}
          className="h-full w-full"
        />
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_19rem]">
        <div className="text-[1.0625rem] leading-relaxed">
          <Section title={t('projects.overview')}>
            <p>{copy.overview}</p>
          </Section>
          <Section title={t('projects.problem')}>
            <p>{copy.problem}</p>
          </Section>
          <Section title={t('projects.role')}>
            <p>{copy.role}</p>
          </Section>
          <Section title={t('projects.architecture')}>
            <BulletList items={copy.architecture} />
          </Section>
          <Section title={t('projects.features')}>
            <BulletList items={copy.features} />
          </Section>
          <Section title={t('projects.decisions')}>
            <BulletList items={copy.decisions} />
          </Section>

          {project.gallery.length > 0 ? (
            <Section title={t('projects.gallery')}>
              <ul className="grid gap-4 sm:grid-cols-2">
                {project.gallery.map((image, index) => (
                  <li key={image} className="aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-raised">
                    <SmartImage
                      src={image}
                      name={copy.name}
                      accent={project.accent}
                      alt={`${t('projects.cover_alt', { name: copy.name })} ${index + 1}`}
                      placeholderLabel={t('projects.placeholder_alt', { name: copy.name })}
                      className="h-full w-full"
                    />
                  </li>
                ))}
              </ul>
            </Section>
          ) : (
            project.links.demo && <p className="mt-10 text-sm text-muted">{t('projects.gallery_empty')}</p>
          )}
        </div>

        <aside className="space-y-5">
          <Card className="p-5">
            <h2 className="label mb-4">{t('projects.stack')}</h2>
            <ul className="flex flex-wrap gap-2">
              {project.tech.map((tech) => (
                <li key={tech}>
                  <Chip>{tech}</Chip>
                </li>
              ))}
            </ul>
          </Card>

          {project.demoAccess && (
            <Card className="p-5">
              <h2 className="label mb-3 flex items-center gap-2">
                <KeyRound size={14} aria-hidden="true" />
                {t('projects.demo_access')}
              </h2>
              <p className="mb-4 text-sm text-muted">{t('projects.demo_access_text')}</p>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-muted">{t('projects.demo_user')}</dt>
                  <dd className="select-all font-mono">{project.demoAccess.user}</dd>
                </div>
                <div>
                  <dt className="text-muted">{t('projects.demo_password')}</dt>
                  <dd className="select-all font-mono">{project.demoAccess.password}</dd>
                </div>
              </dl>
            </Card>
          )}

          {project.coAuthors && (
            <Card className="p-5">
              <h2 className="label mb-3">{t('projects.team')}</h2>
              <ul className="space-y-1">
                {project.coAuthors.map((person) => (
                  <li key={person.url}>
                    <a href={person.url} target="_blank" rel="noreferrer" className="link">
                      {person.name}
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </aside>
      </div>

      <nav className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
        <Link to="/projects" className="inline-flex items-center gap-2 text-muted hover:text-ink">
          <ArrowLeft size={18} aria-hidden="true" />
          {t('projects.back')}
        </Link>
        <Link to={`/projects/${next.slug}`} className="group inline-flex items-center gap-2 font-semibold">
          <span className="text-muted">{t('projects.next')}:</span> {nextCopy.name}
          <ArrowRight size={18} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
        </Link>
      </nav>
    </PageShell>
  );
}
