import { Box, LayoutGrid, Moon, Sun } from 'lucide-react';
import { useExperience } from '../../app/providers/ExperienceProvider.jsx';
import { useTheme } from '../../app/providers/ThemeProvider.jsx';
import { useLanguage } from '../../i18n/index.jsx';

const iconButton =
  'grid h-11 w-11 place-items-center rounded-full text-ink transition-colors hover:bg-raised active:scale-95';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { t } = useLanguage();
  const label = theme === 'dark' ? t('controls.theme_to_light') : t('controls.theme_to_dark');
  return (
    <button type="button" onClick={toggle} aria-label={label} title={label} className={iconButton}>
      {theme === 'dark' ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
    </button>
  );
}

export function LanguageToggle() {
  const { lang, toggle, t } = useLanguage();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t('controls.language')}
      title={t('controls.language')}
      className="flex h-11 items-center gap-1 rounded-full px-3 font-mono text-xs tracking-wider transition-colors hover:bg-raised active:scale-95"
    >
      <span className={lang === 'en' ? 'text-ink' : 'text-muted'}>EN</span>
      <span className="text-muted" aria-hidden="true">
        /
      </span>
      <span className={lang === 'es' ? 'text-ink' : 'text-muted'}>ES</span>
    </button>
  );
}

// Switches the home page between the 3D room and the simple 2D view.
export function ModeToggle() {
  const { mode, canUseRoom, setChoice } = useExperience();
  const { t } = useLanguage();
  if (!canUseRoom || mode === 'pending') return null;
  const toLite = mode === 'room';
  const label = toLite ? t('controls.mode_lite') : t('controls.mode_room');
  return (
    <button
      type="button"
      onClick={() => setChoice(toLite ? 'lite' : 'room')}
      aria-label={label}
      title={label}
      className="flex h-11 items-center gap-2 rounded-full border border-line bg-surface/70 px-3 text-sm backdrop-blur transition-colors hover:bg-raised active:scale-95"
    >
      {toLite ? <LayoutGrid size={16} aria-hidden="true" /> : <Box size={16} aria-hidden="true" />}
      <span className="hidden sm:inline">{toLite ? t('controls.mode_lite_short') : t('controls.mode_room_short')}</span>
    </button>
  );
}
