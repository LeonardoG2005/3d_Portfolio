import { ArrowUpRight, ChevronLeft, Heart } from 'lucide-react';
import { m, useReducedMotion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { PROFILE } from '../../data/profile.js';
import { useT } from '../../i18n/index.jsx';
import { MOTION_OK, ScrollTrigger, gsap, useGSAP } from '../../lib/gsap.js';
import SplitTitle from '../motion/SplitTitle.jsx';
import TypedLine from '../motion/TypedLine.jsx';

const CURTAIN_EASE = [0.76, 0, 0.24, 1];

// Each page ends by pointing at the next one, so a visit reads as a sequence.
const NEXT = { about: 'skills', skills: 'projects', projects: 'journey', journey: 'contact', contact: 'home' };
const PATHS = { home: '/', about: '/about', skills: '/skills', projects: '/projects', journey: '/journey', contact: '/contact' };

// Goes back inside the site when possible; a direct visit has no in-site history, so it goes home.
function BackButton() {
  const t = useT();
  const navigate = useNavigate();
  const goBack = () => {
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    else navigate('/');
  };
  return (
    <button
      type="button"
      onClick={goBack}
      aria-label={t('nav.back')}
      title={t('nav.back')}
      className="grid h-11 w-11 place-items-center rounded-full border border-line text-muted transition-colors hover:border-accent-ink hover:text-ink"
    >
      <ChevronLeft size={20} aria-hidden="true" />
    </button>
  );
}

// Coloured panels that cover the screen between two pages: one leaves when a page arrives,
// the other rises when the page is about to be replaced.
function Curtains({ label }) {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <>
      <m.div
        aria-hidden="true"
        initial={{ y: '0%' }}
        animate={{ y: '-101%' }}
        transition={{ duration: 0.75, ease: CURTAIN_EASE, delay: 0.05 }}
        className="pointer-events-none fixed inset-0 z-[55] grid place-items-center bg-accent text-on-accent"
      >
        <span className="font-display text-[clamp(2.5rem,9vw,7rem)] font-medium tracking-[-0.05em]">{label}</span>
      </m.div>
      <m.div
        aria-hidden="true"
        initial={{ y: '101%' }}
        animate={{ y: '101%' }}
        exit={{ y: '0%' }}
        transition={{ duration: 0.45, ease: CURTAIN_EASE }}
        className="pointer-events-none fixed inset-0 z-[55] bg-accent"
      />
    </>
  );
}

export function NextBand({ to, label, name }) {
  return (
    <Link to={to} className="next-band group relative block overflow-hidden border-t border-line">
      <span aria-hidden="true" className="next-band-fill absolute inset-0 bg-accent" />
      <span className="shell relative flex items-end justify-between gap-6 py-14 sm:py-20">
        <span className="block">
          <span className="label mb-4 block transition-colors duration-300 group-hover:text-on-accent group-focus-visible:text-on-accent">
            {label}
          </span>
          <span className="display block text-[clamp(2.75rem,11vw,9.5rem)] transition-colors duration-300 group-hover:text-on-accent group-focus-visible:text-on-accent">
            {name}
          </span>
        </span>
        <ArrowUpRight
          aria-hidden="true"
          strokeWidth={1.25}
          className="mb-2 h-12 w-12 shrink-0 text-muted transition-[color,transform] duration-500 group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:text-on-accent group-focus-visible:text-on-accent sm:h-24 sm:w-24"
        />
      </span>
    </Link>
  );
}

// Shared frame for every content page. `page` is the route id for the "next" link; `compact` renders the h1
// as a small label; `backdrop` sits behind the hero, `hero` adds content inside it, `closing` replaces the next band.
export default function PageShell({ title, subtitle, eyebrow, page, compact = false, backdrop, hero, closing, children }) {
  const t = useT();
  const root = useRef(null);
  const location = useLocation();

  useEffect(() => {
    document.title = title ? `${title} · ${PROFILE.shortName}` : t('meta.title');
  }, [title, t]);

  // A new page starts at the top unless the link points at a section.
  useLayoutEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from('.hero .split-char', { yPercent: 115, duration: 1.1, ease: 'expo.out', stagger: 0.028, delay: 0.42 });
        gsap.from('.hero-fade', { opacity: 0, y: 24, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.7 });

        const items = gsap.utils.toArray('[data-reveal]');
        if (items.length === 0) return;
        gsap.set(items, { opacity: 0, y: 36 });
        ScrollTrigger.batch(items, {
          start: 'top 90%',
          once: true,
          onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07, overwrite: true }),
        });
      });
      // Web fonts and lazy images change the layout after the first paint.
      const refresh = () => ScrollTrigger.refresh();
      const timer = window.setTimeout(refresh, 600);
      document.fonts?.ready.then(refresh);
      return () => window.clearTimeout(timer);
    },
    { scope: root, dependencies: [location.pathname] },
  );

  const nextId = NEXT[page];
  const long = String(title).length > 9;

  return (
    <div ref={root} className="flex min-h-dvh flex-col overflow-x-clip">
      <Curtains label={title} />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <header className="hero relative isolate">
          {backdrop && <div className="hero-backdrop absolute inset-0 -z-10">{backdrop}</div>}
          <div className="shell pb-12 pt-24 sm:pb-20 sm:pt-28">
            <div className="hero-fade mb-10 flex items-center justify-between sm:mb-16">
              <BackButton />
              <p className="label" aria-hidden="true">
                leo<span className="text-accent-ink">.</span>
                {location.pathname}
              </p>
            </div>
            {compact ? (
              <h1 className="hero-fade label text-accent-ink">{title}</h1>
            ) : (
              <>
                {eyebrow && <p className="hero-fade label mb-5 text-accent-ink">{eyebrow}</p>}
                <SplitTitle
                  text={title}
                  className={`display ${long ? 'text-[clamp(2.75rem,9.5vw,8.5rem)]' : 'text-[clamp(4rem,17vw,15rem)]'}`}
                />
                {subtitle && (
                  <div className="hero-fade mt-8 max-w-3xl sm:mt-12 lg:ml-auto lg:w-1/2">
                    <TypedLine text={subtitle} />
                  </div>
                )}
              </>
            )}
            {hero}
          </div>
        </header>
        {children}
      </main>

      {closing ?? (nextId && <NextBand to={PATHS[nextId]} label={t('nav.next')} name={t(`nav.${nextId}`)} />)}
      <footer className="border-t border-line">
        <p className="shell flex items-center justify-center gap-1.5 py-6 text-sm text-muted">
          {t('footer.made_with')}
          <Heart role="img" aria-label={t('footer.love')} size={15} className="heart-beat fill-accent text-accent" />
          {t('footer.made_by')}
        </p>
      </footer>
    </div>
  );
}
