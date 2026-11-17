import { Download } from 'lucide-react';
import { useRef, useState } from 'react';
import PageShell from '../components/layout/PageShell.jsx';
import WordScrub from '../components/motion/WordScrub.jsx';
import { ButtonLink } from '../components/ui/primitives.jsx';
import { ASSETS } from '../data/profile.js';
import { useCvFiles } from '../hooks/useAvailableFiles.js';
import { useT } from '../i18n/index.jsx';
import { MOTION_OK, gsap, useGSAP } from '../lib/gsap.js';
import { asset } from '../lib/paths.js';

function Portrait({ alt }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <div className="display grid h-full w-full place-items-center bg-raised text-7xl text-accent-ink">LG</div>
    );
  }
  return (
    <img
      src={asset(ASSETS.photo)}
      alt={alt}
      width="640"
      height="800"
      onError={() => setBroken(true)}
      className="h-full w-full object-cover"
    />
  );
}

export default function About() {
  const t = useT();
  const cv = useCvFiles();
  const body = useRef(null);
  const [lead, ...paragraphs] = t('about.paragraphs');
  const focus = t('about.focus');

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // Portrait: the frame opens from the bottom while the photo settles into place.
        gsap.fromTo(
          '.portrait-frame',
          { clipPath: 'inset(100% 0% 0% 0% round 24px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.4, ease: 'expo.out', delay: 0.6 },
        );
        gsap.fromTo(
          '.portrait-frame > *',
          { scale: 1.25 },
          { scale: 1.05, ease: 'none', scrollTrigger: { trigger: '.portrait-frame', start: 'top bottom', end: 'bottom top', scrub: true } },
        );
        // Focus panels stack on top of each other; the covered one steps back a little.
        const panels = gsap.utils.toArray('.focus-panel');
        panels.slice(0, -1).forEach((panel, index) => {
          gsap.to(panel.firstElementChild, {
            scale: 0.93,
            ease: 'none',
            scrollTrigger: { trigger: panels[index + 1], start: 'top bottom', end: 'top 20%', scrub: true },
          });
        });
      });
    },
    { scope: body },
  );

  return (
    <PageShell title={t('about.title')} subtitle={t('about.subtitle')} page="about">
      <div ref={body}>
        <section className="shell grid gap-x-16 gap-y-12 pb-24 lg:grid-cols-12 lg:pb-36">
          <div className="lg:col-span-7">
            <WordScrub
              text={lead}
              className="text-[clamp(1.75rem,3.6vw,3.25rem)] font-medium leading-[1.12] tracking-[-0.03em]"
            />
            <div className="mt-14 space-y-10 lg:mt-24">
              {paragraphs.map((paragraph) => (
                <WordScrub
                  key={paragraph.slice(0, 24)}
                  text={paragraph}
                  className="max-w-2xl text-[clamp(1.25rem,1.9vw,1.75rem)] leading-[1.35] tracking-[-0.015em] lg:ml-auto"
                />
              ))}
            </div>
            <div data-reveal className="mt-12 flex flex-wrap gap-3 lg:ml-auto lg:max-w-2xl">
              {cv.items.map((file) => (
                <ButtonLink
                  key={file.lang}
                  href={file.href}
                  download
                  variant={file.lang === 'en' ? 'primary' : 'secondary'}
                  className="h-12 px-6"
                >
                  <Download size={16} aria-hidden="true" />
                  {t(`contact.cv_${file.lang}`)}
                </ButtonLink>
              ))}
            </div>
          </div>

          <aside className="order-first lg:order-none lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <div className="portrait-frame mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl bg-raised lg:ml-auto lg:mr-0">
                <Portrait alt={t('about.photo_alt')} />
              </div>
            </div>
          </aside>
        </section>

        <section className="shell pb-24 lg:pb-36" aria-labelledby="facts-heading">
          <h2 id="facts-heading" data-reveal className="serif mb-8 text-4xl sm:text-5xl">
            {t('about.facts_title')}
          </h2>
          <dl className="border-b border-line">
            {t('about.facts').map((fact) => (
              <div key={fact.label} data-reveal className="grid gap-x-8 gap-y-1 border-t border-line py-6 sm:grid-cols-12 sm:items-baseline">
                <dt className="label sm:col-span-4 lg:col-span-3">{fact.label}</dt>
                <dd className="text-[clamp(1.25rem,2.4vw,2rem)] leading-tight tracking-tight sm:col-span-8 lg:col-span-9">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="shell pb-28 lg:pb-40" aria-labelledby="focus-heading">
          <h2 id="focus-heading" data-reveal className="display mb-12 text-[clamp(2.5rem,7.2vw,7rem)]">
            {t('about.focus_title')}
          </h2>
          <div>
            {focus.map((area, index) => (
              <div key={area.title} className="focus-panel sticky pb-6" style={{ top: `${5.5 + index * 1.25}rem` }}>
                <article className="grid origin-top gap-8 rounded-3xl border border-line bg-surface p-7 shadow-card sm:p-12 lg:min-h-[22rem] lg:grid-cols-12 lg:items-end">
                  <h3 className="text-[clamp(1.9rem,4.4vw,4rem)] font-medium leading-none tracking-[-0.04em] lg:col-span-7">
                    {area.title}
                  </h3>
                  <p className="text-lg leading-relaxed text-muted lg:col-span-5">{area.text}</p>
                </article>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
