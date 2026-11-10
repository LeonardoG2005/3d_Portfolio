import { Download, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useExperience } from '../../../app/providers/ExperienceProvider.jsx';
import { PROFILE } from '../../../data/profile.js';
import { useCvFiles } from '../../../hooks/useAvailableFiles.js';
import { useT } from '../../../i18n/index.jsx';
import { isCoarsePointer } from '../../../lib/capabilities.js';
import { readStored, writeStored } from '../../../lib/storage.js';
import { INTERACTABLES } from '../config.js';
import { live, requestInteract, useRoom } from '../store.js';

function CvDialog() {
  const t = useT();
  const cv = useCvFiles();
  const panel = useRef(null);
  const close = () => useRoom.setState({ cvOpen: false });

  useEffect(() => {
    const previous = document.activeElement;
    panel.current?.querySelector('a, button')?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') close();
      if (event.key !== 'Tab') return;
      const items = Array.from(panel.current.querySelectorAll('a, button'));
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, []);

  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-bg/60 p-4 backdrop-blur-sm" onClick={close}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cv-dialog-title"
        className="card w-full max-w-sm p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-2 flex items-start justify-between gap-4">
          <h2 id="cv-dialog-title" className="text-2xl font-semibold">
            {t('room.cv_dialog.title')}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label={t('room.cv_dialog.close')}
            className="-mr-2 -mt-2 grid h-10 w-10 place-items-center rounded-full hover:bg-raised"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {cv.ready && cv.items.length === 0 ? (
          <p className="text-muted">
            {t('contact.cv_missing')}{' '}
            <Link to="/contact" className="link">
              {t('nav.contact')}
            </Link>
          </p>
        ) : (
          <>
            <p className="mb-5 text-muted">{t('room.cv_dialog.text')}</p>
            <div className="grid gap-2">
              {cv.items.map((file) => (
                <a
                  key={file.lang}
                  href={file.href}
                  download
                  className="flex h-12 items-center justify-between rounded-xl border border-line bg-raised px-4 font-medium hover:border-accent-ink"
                >
                  {t(`room.cv_dialog.${file.lang}`)}
                  <Download size={18} aria-hidden="true" />
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Everything drawn over the canvas: intro, object label, controls hint, keyboard-accessible destinations.
export default function RoomHud({ ready, struggling }) {
  const t = useT();
  const { setChoice } = useExperience();
  const nearId = useRoom((state) => state.nearId);
  const hoverId = useRoom((state) => state.hoverId);
  const focusId = useRoom((state) => state.focusId);
  const activeId = useRoom((state) => state.activeId);
  const cvOpen = useRoom((state) => state.cvOpen);
  const backend = useRoom((state) => state.backend);
  const [hintSeen, setHintSeen] = useState(() => readStored('roomHint') === '1');
  const label = useRef(null);
  const coarse = isCoarsePointer();

  useEffect(() => {
    live.labelElement = label.current;
    return () => {
      live.labelElement = null;
    };
  }, []);

  const dismissHint = () => {
    writeStored('roomHint', '1');
    setHintSeen(true);
  };

  const labelId = activeId || hoverId || focusId || nearId;
  const showAction = labelId && labelId === nearId && !activeId;

  return (
    <>
      {/* Intro: the name and the two most wanted links are always one tap away */}
      <div
        className={`pointer-events-none absolute left-4 top-20 z-10 max-w-[17rem] transition-opacity duration-500 sm:left-6 ${
          ready && !activeId ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className="label mb-1 text-accent-ink">{t('home.role')}</p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{PROFILE.shortName}</h1>
        <div className="pointer-events-auto mt-3 flex gap-2">
          <Link
            to="/projects"
            className="inline-flex h-10 items-center rounded-full bg-accent px-4 text-sm font-semibold text-on-accent hover:brightness-110"
          >
            {t('home.cta_projects')}
          </Link>
          <Link
            to="/contact"
            className="inline-flex h-10 items-center rounded-full border border-line bg-surface/80 px-4 text-sm font-semibold backdrop-blur hover:border-accent-ink"
          >
            {t('home.cta_contact')}
          </Link>
        </div>
      </div>

      {/* Floating label, positioned every frame by LabelProjector */}
      <div
        ref={label}
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 z-10 transition-opacity duration-200 ${labelId ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="mb-2 flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-surface/95 py-1.5 pl-4 pr-2 text-sm font-semibold shadow-card">
          {labelId ? t(`room.labels.${labelId}`) : ''}
          <span
            className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-medium ${
              showAction ? 'bg-accent text-on-accent' : 'bg-raised text-muted'
            }`}
          >
            {coarse ? t('room.tap') : showAction ? t('room.press') : t('room.click')}
          </span>
        </div>
      </div>

      {/* Keyboard and screen reader route into the same destinations */}
      <nav aria-label={t('room.destinations')} className="absolute bottom-8 left-4 z-20">
        <ul className="flex flex-wrap gap-2">
          {INTERACTABLES.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="sr-only-focusable h-10 rounded-full border border-line bg-surface px-4 text-sm font-medium"
                onFocus={() => useRoom.setState({ focusId: item.id })}
                onBlur={() => useRoom.setState({ focusId: null })}
                onClick={() => requestInteract(item.id)}
              >
                {t(`room.labels.${item.id}`)}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Controls hint */}
      {ready && !hintSeen && !activeId && (
        <div className="absolute inset-x-0 bottom-5 z-10 flex justify-center pl-4 pr-24 sm:px-24">
          <div className="flex max-w-xl items-center gap-3 rounded-2xl border border-line bg-surface/95 py-2 pl-4 pr-2 text-sm shadow-card backdrop-blur">
            <p>{coarse ? t('room.hint_touch') : t('room.hint_desktop')}</p>
            <button
              type="button"
              onClick={dismissHint}
              className="h-9 shrink-0 rounded-full bg-raised px-3 text-sm font-semibold hover:bg-line"
            >
              {t('room.hint_dismiss')}
            </button>
          </div>
        </div>
      )}

      {struggling && (
        <div className="absolute inset-x-0 bottom-24 z-10 flex justify-center px-4">
          <button
            type="button"
            onClick={() => setChoice('lite')}
            className="rounded-full border border-line bg-surface/95 px-4 py-2 text-sm font-semibold shadow-card"
          >
            {t('controls.mode_lite')}
          </button>
        </div>
      )}

      {backend && (
        <p className="pointer-events-none absolute bottom-2 left-4 z-10 font-mono text-[10px] uppercase tracking-widest text-muted/70">
          {t('room.renderer', { backend })}
        </p>
      )}

      {cvOpen && <CvDialog />}
    </>
  );
}
