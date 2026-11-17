import { Minus, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import PageShell from '../components/layout/PageShell.jsx';
import FlowField from '../components/motion/FlowField.jsx';
import Icon from '../components/ui/Icon.jsx';
import { Chip } from '../components/ui/primitives.jsx';
import { SKILL_GROUPS } from '../data/skills.js';
import { useT } from '../i18n/index.jsx';
import { MOTION_OK, ScrollTrigger, gsap, useGSAP } from '../lib/gsap.js';

// One band per group: the group name on the left and its technologies drifting past as large outlined type.
// The drift follows the scroll (alternating direction) and leans with its speed.
// Opening a band lays the same technologies out as a plain, readable list.
export default function Skills() {
  const t = useT();
  const list = useRef(null);
  const [open, setOpen] = useState(() => new Set());
  const allOpen = open.size === SKILL_GROUPS.length;

  const toggle = (id) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const shifts = gsap.utils.toArray('.band-shift');
        shifts.forEach((shift, index) => {
          const forward = index % 2 === 0;
          gsap.fromTo(
            shift,
            { xPercent: forward ? 0 : -22 },
            {
              xPercent: forward ? -22 : 0,
              ease: 'none',
              scrollTrigger: { trigger: shift.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
            },
          );
        });
        // Lean the type with the scroll speed, then let it settle.
        const lean = shifts.map((shift) => gsap.quickTo(shift, 'skewX', { duration: 0.5, ease: 'power3.out' }));
        ScrollTrigger.create({
          trigger: list.current,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            const amount = gsap.utils.clamp(-14, 14, self.getVelocity() / -160);
            lean.forEach((set) => set(amount));
          },
        });
        const settle = () => lean.forEach((set) => set(0));
        ScrollTrigger.addEventListener('scrollEnd', settle);
        return () => ScrollTrigger.removeEventListener('scrollEnd', settle);
      });
    },
    { scope: list },
  );

  return (
    <PageShell
      title={t('skills.title')}
      subtitle={t('skills.subtitle')}
      page="skills"
      backdrop={<FlowField className="opacity-70 [mask-image:linear-gradient(to_bottom,black_35%,transparent)]" />}
    >
      <section className="pb-24 lg:pb-36">
        <div className="shell mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setOpen(allOpen ? new Set() : new Set(SKILL_GROUPS.map((group) => group.id)))}
            className="label inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 transition-colors hover:border-accent-ink hover:text-ink"
          >
            {allOpen ? <Minus size={14} aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}
            {t(allOpen ? 'skills.collapse_all' : 'skills.expand_all')}
          </button>
        </div>

        <ul ref={list} className="border-b border-line">
          {SKILL_GROUPS.map((group) => {
            const isOpen = open.has(group.id);
            const name = t(`skills.groups.${group.id}`);
            return (
              <li key={group.id} className={`skill-band border-t border-line ${isOpen ? 'is-open' : ''}`}>
                <h2>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`skills-${group.id}`}
                    onClick={() => toggle(group.id)}
                    className="group grid w-full items-center gap-x-8 gap-y-3 py-6 text-left lg:grid-cols-12 lg:py-8"
                  >
                    <span className="shell flex items-center gap-4 lg:col-span-5 lg:pr-0 xl:col-span-4">
                      <span className="skill-icon grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line">
                        <Icon name={group.icon} size={20} strokeWidth={1.5} />
                      </span>
                      <span className="text-2xl font-medium leading-tight tracking-tight sm:text-3xl">{name}</span>
                      <span className="ml-auto font-mono text-sm text-muted lg:ml-2">{group.items.length}</span>
                      <span className="skill-toggle grid h-8 w-8 shrink-0 place-items-center text-muted lg:hidden" aria-hidden="true">
                        <Plus size={18} />
                      </span>
                    </span>
                    <span aria-hidden="true" className="band-window block overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)] lg:col-span-7 xl:col-span-8">
                      <span className="band-shift block w-max">
                        <span className="band-loop display flex w-max gap-[0.6em] pr-[0.6em] text-[clamp(2.5rem,5.4vw,5rem)]">
                          {[...group.items, ...group.items].map((item, index) => (
                            <span key={index} className="band-word whitespace-nowrap">
                              {item}
                            </span>
                          ))}
                        </span>
                      </span>
                    </span>
                  </button>
                </h2>
                <div id={`skills-${group.id}`} className="skill-panel grid" inert={!isOpen}>
                  <div className="overflow-hidden">
                    <ul className="shell flex flex-wrap gap-2 pb-8 lg:pl-[calc(3.5rem+4rem)]" aria-label={name}>
                      {group.items.map((item) => (
                        <li key={item}>
                          <Chip className="px-4 py-1.5 text-base">{item}</Chip>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

      </section>
    </PageShell>
  );
}
