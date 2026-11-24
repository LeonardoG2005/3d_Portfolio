import { useRef } from 'react';
import PageShell from '../components/layout/PageShell.jsx';
import Icon from '../components/ui/Icon.jsx';
import PythonMark from '../components/ui/PythonMark.jsx';
import TerminalLink from '../components/ui/TerminalLink.jsx';
import { JOURNEY } from '../data/journey.js';
import { useT } from '../i18n/index.jsx';
import { MOTION_OK, ScrollTrigger, gsap, useGSAP } from '../lib/gsap.js';

// The route line in a 100 x (stations * 100) box: it swings between 30 and 70 across the page
// and passes through one node per station, at the vertical centre of its row.
function routePath(count) {
  const x = (index) => (index % 2 === 0 ? 30 : 70);
  let path = `M50 0 C50 25 ${x(0)} 25 ${x(0)} 50`;
  for (let index = 1; index < count; index += 1) {
    const y = index * 100 + 50;
    path += ` C${x(index - 1)} ${y - 50} ${x(index)} ${y - 50} ${x(index)} ${y}`;
  }
  const end = count * 100;
  return `${path} C${x(count - 1)} ${end - 25} 50 ${end - 25} 50 ${end}`;
}

export default function Journey() {
  const t = useT();
  const track = useRef(null);

  useGSAP(
    () => {
      // Nodes and text switch on when the line reaches them. Without motion they are simply on.
      const stations = gsap.utils.toArray('.station');
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          '.route-line',
          { clipPath: 'inset(0% 0% 100% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            ease: 'none',
            scrollTrigger: { trigger: track.current, start: 'top 62%', end: 'bottom 62%', scrub: 0.4 },
          },
        );
        stations.forEach((station) => {
          station.classList.remove('is-on');
          ScrollTrigger.create({
            trigger: station.querySelector('.station-node'),
            start: 'center 62%',
            onEnter: () => station.classList.add('is-on'),
            onLeaveBack: () => station.classList.remove('is-on'),
          });
          gsap.from(station.querySelectorAll('.station-text > *'), {
            opacity: 0,
            y: 40,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.08,
            scrollTrigger: { trigger: station, start: 'top 70%', once: true },
          });
        });
        return () => stations.forEach((station) => station.classList.add('is-on'));
      });
    },
    { scope: track },
  );

  return (
    <PageShell title={t('journey.title')} subtitle={t('journey.subtitle')} page="journey">
      <section className="shell pb-24 lg:pb-36">
        <div ref={track} className="relative">
          {/* Desktop: a line that weaves from side to side. */}
          <div aria-hidden="true" className="route-line pointer-events-none absolute inset-0 hidden lg:block">
            <svg viewBox={`0 0 100 ${JOURNEY.length * 100}`} preserveAspectRatio="none" className="h-full w-full overflow-visible">
              <path d={routePath(JOURNEY.length)} fill="none" stroke="var(--accent-ink)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
            <svg viewBox={`0 0 100 ${JOURNEY.length * 100}`} preserveAspectRatio="none" className="h-full w-full overflow-visible">
              <path d={routePath(JOURNEY.length)} fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="2 7" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          {/* Phones: a straight line down the left edge. */}
          <div aria-hidden="true" className="absolute bottom-0 left-[1.35rem] top-0 w-px bg-line lg:hidden" />
          <div aria-hidden="true" className="route-line absolute bottom-0 left-[1.35rem] top-0 w-px bg-accent-ink lg:hidden" />
          <ol>

          {JOURNEY.map((entry, index) => {
            const copy = t(`journey.items.${entry.id}`);
            const kind = t(`journey.kinds.${entry.kind}`);
            const left = index % 2 === 0;
            return (
              <li key={entry.id} className="station is-on relative flex items-center py-10 pl-16 lg:min-h-[78vh] lg:py-0 lg:pl-0">
                <span
                  className={`station-node absolute left-0 top-10 z-10 grid h-11 w-11 place-items-center rounded-full border lg:top-1/2 lg:h-16 lg:w-16 lg:-translate-x-1/2 lg:-translate-y-1/2 ${
                    left ? 'lg:left-[30%]' : 'lg:left-[70%]'
                  }`}
                >
                  <Icon name={entry.icon} className="h-5 w-5 lg:h-7 lg:w-7" strokeWidth={1.5} />
                </span>

                {/* Oversized mark on the far side of the line. */}
                <p
                  aria-hidden="true"
                  className={`station-ghost display pointer-events-none absolute top-1/2 hidden -translate-y-1/2 text-[clamp(5rem,11vw,11rem)] lg:block ${
                    left ? 'left-0' : 'right-0'
                  }`}
                >
                  {entry.logo === 'python' ? <PythonMark className="h-[0.82em] w-[0.82em]" /> : entry.mark}
                </p>

                <div className={`station-text w-full lg:w-[52%] ${left ? 'lg:ml-[40%]' : 'lg:mr-[40%] lg:ml-[4%]'}`}>
                  <p className="label mb-4 flex flex-wrap gap-x-3">
                    <span className="text-accent-ink">{kind}</span>
                    {copy.period !== kind && <span>{copy.period}</span>}
                  </p>
                  <h2 className="text-[clamp(2rem,4.6vw,4.25rem)] font-medium leading-[0.98] tracking-[-0.04em]">{copy.title}</h2>
                  <p className="serif mt-3 text-2xl text-muted sm:text-3xl">{copy.place}</p>
                  <p className="mt-6 max-w-xl text-lg leading-relaxed">{copy.text}</p>
                  {entry.link && (
                    <TerminalLink to={entry.link} className="mt-8">
                      {t('journey.see_projects')}
                    </TerminalLink>
                  )}
                </div>
              </li>
            );
          })}
          </ol>
        </div>
      </section>
    </PageShell>
  );
}
