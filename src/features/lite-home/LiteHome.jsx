import { Activity, ArrowRight, Box, DoorOpen, FileText, Library, Monitor, Smartphone, User } from 'lucide-react';
import { m } from 'motion/react';
import { useEffect } from 'react';
import { Link } from 'react-router';
import { useExperience } from '../../app/providers/ExperienceProvider.jsx';
import { ButtonLink, trackGlow } from '../../components/ui/primitives.jsx';
import { PROFILE } from '../../data/profile.js';
import { useT } from '../../i18n/index.jsx';
import RoomIllustration from './RoomIllustration.jsx';

// Same destinations as the objects in the 3D room.
const TILES = [
  { id: 'projects', to: '/projects', icon: Monitor, wide: true },
  { id: 'skills', to: '/skills', icon: Library },
  { id: 'about', to: '/about', icon: User },
  { id: 'journey', to: '/journey', icon: DoorOpen },
  { id: 'activity', to: '/projects#activity', icon: Activity },
  { id: 'contact', to: '/contact', icon: Smartphone },
  { id: 'cv', to: '/contact', icon: FileText },
];

// The 2D home. It is a full presentation of the portfolio, not an error state.
export default function LiteHome() {
  const t = useT();
  const { canUseRoom, renderer, failed, setChoice } = useExperience();

  useEffect(() => {
    document.title = t('meta.title');
  }, [t]);

  const notice = failed ? t('home.room_failed') : renderer === 'none' ? t('home.room_unsupported') : null;

  return (
    <m.main
      id="main"
      tabIndex={-1}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-6xl px-4 pb-24 pt-24 outline-none sm:px-6 sm:pt-28"
    >
      <section className="grid items-center gap-6 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <p className="label mb-4 text-accent-ink">{t('home.role')}</p>
          <h1 className="text-[clamp(2.5rem,7vw,4.5rem)] font-semibold leading-[1.02]">{PROFILE.shortName}</h1>
          <p className="mt-5 max-w-xl text-lg text-muted">{t('home.intro')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to="/projects">
              {t('home.cta_projects')}
              <ArrowRight size={16} aria-hidden="true" />
            </ButtonLink>
            <ButtonLink to="/contact" variant="secondary">
              {t('home.cta_contact')}
            </ButtonLink>
            {canUseRoom && (
              <button
                type="button"
                onClick={() => setChoice('room')}
                className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-accent-ink hover:bg-raised"
              >
                <Box size={16} aria-hidden="true" />
                {t('home.try_room')}
              </button>
            )}
          </div>
          {notice && <p className="mt-5 max-w-xl text-sm text-muted">{notice}</p>}
        </div>
        <RoomIllustration className="mx-auto w-full max-w-md lg:max-w-none" />
      </section>

      <section className="mt-10" aria-labelledby="explore-heading">
        <h2 id="explore-heading" className="label mb-4">
          {t('home.explore')}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TILES.map((tile) => {
            const TileIcon = tile.icon;
            return (
              <li key={tile.id} className={tile.wide ? 'sm:col-span-2' : ''}>
                <Link
                  to={tile.to}
                  onPointerMove={trackGlow}
                  className="card card-glow group flex h-full min-h-36 flex-col justify-between p-5 transition-transform hover:-translate-y-0.5"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-raised text-accent-ink">
                    <TileIcon size={20} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="flex items-center gap-2 font-display text-xl font-semibold">
                      {t(`home.tiles.${tile.id}.title`)}
                      <ArrowRight size={16} aria-hidden="true" className="opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                    </span>
                    <span className="mt-1 block text-sm text-muted">{t(`home.tiles.${tile.id}.text`)}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </m.main>
  );
}
