import { ArrowLeft, ArrowUpRight, BookOpen, KeyRound } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import PageShell, { NextBand } from '../components/layout/PageShell.jsx';
import Magnetic from '../components/motion/Magnetic.jsx';
import { GitHubIcon } from '../components/ui/BrandIcons.jsx';
import SmartImage from '../components/ui/SmartImage.jsx';
import { ButtonLink } from '../components/ui/primitives.jsx';
import { PROJECTS, getProject } from '../data/projects.js';
import { useT } from '../i18n/index.jsx';
import { MOTION_OK, ScrollTrigger, gsap, useGSAP } from '../lib/gsap.js';
import NotFound from './NotFound.jsx';

const SECTIONS = ['overview', 'problem', 'role', 'architecture', 'features', 'decisions'];

function Section({ id, title, children }) {
  return (
    <section id={id} data-section={id} className="scroll-mt-24 border-t border-line py-10 sm:py-14">
      <h2 data-reveal className="serif mb-6 text-4xl sm:text-5xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

function NumberedList({ items }) {
  return (
    <ol>
      {items.map((item, index) => (
        <li key={item.slice(0, 32)} data-reveal className="grid grid-cols-[2.75rem_1fr] gap-2 border-t border-line py-5 first:border-t-0 sm:grid-cols-[4rem_1fr]">
          <span className="pt-1 font-mono text-sm text-accent-ink" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-lg leading-relaxed">{item}</span>
        </li>
      ))}
    </ol>
  );
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const t = useT();
  const body = useRef(null);
  const [current, setCurrent] = useState(SECTIONS[0]);
  const project = getProject(slug);

  useGSAP(
    () => {
      if (!body.current) return;
      // Highlight the section being read in the side index.
      gsap.utils.toArray('[data-section]').forEach((section) => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top 45%',
          end: 'bottom 45%',
          onToggle: (self) => self.isActive && setCurrent(section.dataset.section),
        });
      });

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // The cover starts as a framed picture and opens to the full width of the window.
        const scrollTrigger = { trigger: '.cover-frame', start: 'top 92%', end: 'top 12%', scrub: true };
        gsap.fromTo(
          '.cover-clip',
          { clipPath: 'inset(7% 10% 7% 10% round 28px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger },
        );
        gsap.fromTo('.cover-clip > *', { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger });
      });
    },
    { scope: body, dependencies: [slug], revertOnUpdate: true },
  );

  if (!project) return <NotFound />;

  const copy = t(`projects.items.${project.slug}`);
  const next = PROJECTS[(PROJECTS.indexOf(project) + 1) % PROJECTS.length];
  const nextCopy = t(`projects.items.${next.slug}`);

  return (
    <PageShell
      title={copy.name}
      subtitle={copy.tagline}
      eyebrow={copy.status}
      closing={
        <>
          <div className="shell pb-10">
            <Link to="/projects" className="inline-flex items-center gap-2 text-muted transition-colors hover:text-ink">
              <ArrowLeft size={18} aria-hidden="true" />
              {t('projects.back')}
            </Link>
          </div>
          <NextBand to={`/projects/${next.slug}`} label={t('projects.next')} name={nextCopy.name} />
        </>
      }
    >
      <div ref={body}>
        <div className="shell hero-fade flex flex-wrap items-center gap-3 pb-12 sm:pb-16">
          {project.links.demo && (
            <Magnetic>
              <ButtonLink href={project.links.demo} external className="h-12 px-6">
                {t('projects.live')}
                <ArrowUpRight size={16} aria-hidden="true" />
              </ButtonLink>
            </Magnetic>
          )}
          {project.links.repos?.map((repo) => (
            <ButtonLink key={repo.url} href={repo.url} external variant="secondary" className="h-12 px-6">
              <GitHubIcon size={16} />
              {project.links.repos.length > 1 ? repo.label : t('projects.repo')}
            </ButtonLink>
          ))}
          {project.links.docs && (
            <ButtonLink href={project.links.docs} external variant="secondary" className="h-12 px-6">
              <BookOpen size={16} aria-hidden="true" />
              {t('projects.docs')}
            </ButtonLink>
          )}
        </div>

        <div className="cover-frame">
          <div className="cover-clip h-[min(86vh,58vw)] min-h-[15rem] overflow-hidden bg-raised">
            <SmartImage
              src={project.cover}
              name={copy.name}
              accent={project.accent}
              alt={t('projects.cover_alt', { name: copy.name })}
              placeholderLabel={t('projects.placeholder_alt', { name: copy.name })}
              className="block h-full w-full"
            />
          </div>
        </div>

        <div className="shell mt-16 grid gap-x-12 gap-y-14 pb-20 sm:mt-24 lg:grid-cols-12">
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="space-y-10 lg:sticky lg:top-24">
              <nav aria-label={copy.name} className="hidden lg:block">
                <ul className="space-y-1">
                  {SECTIONS.map((id) => (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        aria-current={current === id ? 'true' : undefined}
                        className={`group flex items-center gap-3 py-1 font-mono text-sm transition-colors ${
                          current === id ? 'text-ink' : 'text-muted hover:text-ink'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`h-px bg-current transition-[width] duration-500 ${current === id ? 'w-10' : 'w-4 group-hover:w-6'}`}
                        />
                        {t(`projects.${id}`)}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div data-reveal>
                <h2 className="label mb-4">{t('projects.stack')}</h2>
                <ul className="font-mono text-sm leading-7">
                  {project.tech.map((tech) => (
                    <li key={tech} className="border-t border-line first:border-t-0">
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>

              {project.demoAccess && (
                <div data-reveal className="rounded-2xl border border-line bg-surface p-5">
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
                </div>
              )}

              {project.coAuthors && (
                <div data-reveal>
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
                </div>
              )}
            </div>
          </aside>

          <div className="lg:col-span-8 xl:col-start-5">
            <Section id="overview" title={t('projects.overview')}>
              <p data-reveal className="text-[clamp(1.5rem,2.5vw,2.25rem)] leading-[1.2] tracking-tight">
                {copy.overview}
              </p>
            </Section>
            <Section id="problem" title={t('projects.problem')}>
              <p data-reveal className="max-w-3xl text-xl leading-relaxed text-muted">
                {copy.problem}
              </p>
            </Section>
            <Section id="role" title={t('projects.role')}>
              <p data-reveal className="max-w-3xl text-xl leading-relaxed text-muted">
                {copy.role}
              </p>
            </Section>
            <Section id="architecture" title={t('projects.architecture')}>
              <NumberedList items={copy.architecture} />
            </Section>
            <Section id="features" title={t('projects.features')}>
              <NumberedList items={copy.features} />
            </Section>
            <Section id="decisions" title={t('projects.decisions')}>
              <NumberedList items={copy.decisions} />
            </Section>

            {project.gallery.length > 0 ? (
              <section className="border-t border-line py-10 sm:py-14">
                <h2 className="serif mb-6 text-4xl sm:text-5xl">{t('projects.gallery')}</h2>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {project.gallery.map((image, index) => (
                    <li key={image} data-reveal className="aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-raised">
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
              </section>
            ) : (
              project.links.demo && <p className="border-t border-line pt-8 text-sm text-muted">{t('projects.gallery_empty')}</p>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
