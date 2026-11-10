import { m } from 'motion/react';
import { Suspense, lazy, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useExperience } from '../app/providers/ExperienceProvider.jsx';
import { useTheme } from '../app/providers/ThemeProvider.jsx';
import { PROFILE } from '../data/profile.js';
import LiteHome from '../features/lite-home/LiteHome.jsx';
import { useT } from '../i18n/index.jsx';

// three.js and the whole room live in this separate chunk. It is only requested when the room is shown.
const RoomExperience = lazy(() => import('../features/room/RoomExperience.jsx'));

function Placeholder({ label }) {
  return (
    <div className="absolute inset-0 grid place-items-center" role="status">
      <div className="text-center">
        <p className="label mb-2 text-accent-ink">{label}</p>
        <p className="font-display text-3xl font-semibold">{PROFILE.shortName}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const t = useT();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { mode, renderer, reportFailure } = useExperience();
  const onNavigate = useCallback((path) => navigate(path), [navigate]);

  useEffect(() => {
    document.title = t('meta.title');
  }, [t]);

  if (mode === 'lite') return <LiteHome />;

  return (
    <m.main
      id="main"
      tabIndex={-1}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 outline-none"
    >
      {mode === 'pending' ? (
        <Placeholder label={t('home.role')} />
      ) : (
        <Suspense fallback={<Placeholder label={t('room.loading')} />}>
          <RoomExperience theme={theme} rendererPref={renderer} onNavigate={onNavigate} onFail={reportFailure} />
        </Suspense>
      )}
    </m.main>
  );
}
