import { ArrowUpRight } from 'lucide-react';
import { Suspense, lazy, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import PageShell from '../components/layout/PageShell.jsx';
import SmartImage from '../components/ui/SmartImage.jsx';
import { PROJECTS } from '../data/projects.js';
import CoverPreview from '../features/projects/CoverPreview.jsx';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import { useT } from '../i18n/index.jsx';
import { MOTION_OK, gsap, useGSAP } from '../lib/gsap.js';
import { asset } from '../lib/paths.js';

const ActivitySection = lazy(() => import('../features/github-activity/ActivitySection.jsx'));

// Project index: one wide typographic row per project.
// With a mouse on a large screen a cover follows the pointer; everywhere else each row shows its own cover.
export default function Projects() {
  const t = useT();
  const list = useRef(null);
  const [active, setActive] = useState(-1);
  const floating = useMediaQuery('(hover: hover) and (pointer: fine) and (min-width: 1024px)');

  const covers = useMemo(
    () =>
      PROJECTS.map((project) => ({
        src: project.cover ? asset(project.cover) : null,
        name: t(`projects.items.${project.slug}`).name,
        accent: project.accent,
      })),
    [t],
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.utils.toArray('.row-cover').forEach((cover) => {
          gsap.fromTo(
            cover.firstElementChild,
            { yPercent: -12 },
            { yPercent: 0, ease: 'none', scrollTrigger: { trigger: cover, start: 'top bottom', end: 'bottom top', scrub: true } },
          );
        });
      });
    },
    { scope: list, dependencies: [floating], revertOnUpdate: true },
  );

  return (
    <PageShell title={t('projects.title')} subtitle={t('projects.subtitle')} page="projects">
      <section className="shell">
        <ul ref={list} className="project-index border-b border-line" onPointerLeave={() => setActive(-1)}>
          {PROJECTS.map((project, index) => {
            const copy = t(`projects.items.${project.slug}`);
            return (
              <li key={project.slug} data-reveal className="border-t border-line">
                <Link
                  to={`/projects/${project.slug}`}
                  onPointerEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  onBlur={() => setActive(-1)}
                  className="project-row group grid gap-x-8 gap-y-5 py-8 lg:grid-cols-12 lg:items-end lg:py-12"
                >
                  {!floating && (
                    <span className="row-cover block aspect-[16/10] overflow-hidden rounded-2xl bg-raised lg:col-span-12">
                      <SmartImage
                        src={project.cover}
                        name={copy.name}
                        accent={project.accent}
                        alt=""
                        placeholderLabel={t('projects.placeholder_alt', { name: copy.name })}
                        className="block h-[114%] w-full"
                      />
                    </span>
                  )}
                  <h2 className="display text-[clamp(2.5rem,7.2vw,7rem)] transition-transform duration-500 ease-out group-hover:translate-x-3 lg:col-span-7">
                    {copy.name}
                  </h2>
                  <span className="block lg:col-span-4 lg:pb-2">
                    <span className="label mb-2 block text-accent-ink">{copy.status}</span>
                    <span className="block text-lg leading-snug text-muted">{copy.tagline}</span>
                    <span className="mt-3 block font-mono text-xs leading-relaxed text-muted">
                      {project.tech.slice(0, 5).join(' / ')}
                      {project.tech.length > 5 && ` / +${project.tech.length - 5}`}
                    </span>
                  </span>
                  <span className="hidden justify-self-end pb-2 lg:col-span-1 lg:block">
                    <span className="sr-only">{t('projects.view')}</span>
                    <ArrowUpRight
                      aria-hidden="true"
                      strokeWidth={1.25}
                      className="h-12 w-12 text-muted transition-[transform,color] duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent-ink"
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {floating && <CoverPreview items={covers} active={active} />}

      <Suspense fallback={<div id="activity" className="mt-28 min-h-[520px]" />}>
        <ActivitySection />
      </Suspense>
    </PageShell>
  );
}
