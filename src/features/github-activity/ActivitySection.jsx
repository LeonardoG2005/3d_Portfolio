import { ArrowUpRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { GitHubIcon } from '../../components/ui/BrandIcons.jsx';
import CountUp from '../../components/motion/CountUp.jsx';
import TypedLine from '../../components/motion/TypedLine.jsx';
import { ButtonLink } from '../../components/ui/primitives.jsx';
import { PROFILE } from '../../data/profile.js';
import Heatmap, { formatDate } from './Heatmap.jsx';
import { computeStats } from './stats.js';
import { useContributions } from './useContributions.js';
import { useLanguage } from '../../i18n/index.jsx';

const FIRST_YEAR = 2023; // oldest year offered in the selector

function Stat({ label, value, detail }) {
  return (
    <div className="border-t border-line pt-4">
      <dt className="label mb-3">{label}</dt>
      <dd className="display text-[clamp(2.5rem,5.6vw,5.25rem)] tabular-nums">{value}</dd>
      {detail && <dd className="mt-2 text-sm text-muted">{detail}</dd>}
    </div>
  );
}

// GitHub contribution calendar with year selector, stats and fallbacks. Rendered inside the Projects page.
export default function ActivitySection() {
  const { t, lang } = useLanguage();
  const [year, setYear] = useState('last');
  const { status, days, snapshotDate } = useContributions(year);
  const stats = useMemo(() => computeStats(days), [days]);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const list = [];
    for (let value = current; value >= FIRST_YEAR; value -= 1) list.push(String(value));
    return list;
  }, []);

  const monthly = useMemo(() => {
    const totals = new Map();
    for (const day of days) {
      const key = day.date.slice(0, 7);
      totals.set(key, (totals.get(key) || 0) + day.count);
    }
    return Array.from(totals.entries());
  }, [days]);

  const hasData = status === 'live' || status === 'snapshot';

  return (
    <section id="activity" aria-labelledby="activity-heading" className="shell mt-28 scroll-mt-24 pb-24 sm:mt-40 sm:pb-32">
      <header className="mb-10 grid items-end gap-6 lg:grid-cols-12">
        <h2 id="activity-heading" className="display text-[clamp(2.5rem,7.2vw,7rem)] lg:col-span-8">
          {t('activity.title')}
        </h2>
        <div className="lg:col-span-4 lg:pb-3">
          <TypedLine text={t('activity.subtitle', { user: PROFILE.githubUser })} whenVisible />
        </div>
      </header>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <div role="group" aria-label={t('activity.year')} className="flex flex-wrap gap-1.5">
          {['last', ...years].map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={year === option}
              onClick={() => setYear(option)}
              className={`h-10 rounded-full border px-4 text-sm font-medium transition-colors ${
                year === option
                  ? 'border-accent bg-accent text-on-accent'
                  : 'border-line bg-surface text-muted hover:text-ink'
              }`}
            >
              {option === 'last' ? t('activity.last_year') : option}
            </button>
          ))}
        </div>
        <ButtonLink href={PROFILE.links.github} external variant="secondary">
          <GitHubIcon size={16} />
          {t('activity.view_profile')}
          <ArrowUpRight size={16} aria-hidden="true" />
        </ButtonLink>
      </div>

      {status === 'loading' && (
        <div aria-busy="true">
          <p className="sr-only" role="status">
            {t('activity.loading')}
          </p>
          <div className="h-[150px] animate-pulse rounded-xl bg-raised" />
        </div>
      )}

      {status === 'error' && (
        <div className="grid place-items-center rounded-3xl border border-dashed border-line px-6 py-16 text-center">
          <span className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-raised text-muted">
            <GitHubIcon size={28} />
          </span>
          <h3 className="text-xl font-medium">{t('activity.error_title')}</h3>
          <p className="mt-2 text-muted">{t('activity.error_text')}</p>
          <ButtonLink href={PROFILE.links.github} external variant="secondary" className="mt-6">
            <GitHubIcon size={16} />
            {t('activity.view_profile')}
          </ButtonLink>
        </div>
      )}

      {hasData && (
        <>
          <div>
            <Heatmap days={days} />
            {/* Text alternative for assistive technology: totals per month. */}
            <ul className="sr-only">
              {monthly.map(([month, total]) => (
                <li key={month}>
                  {month}: {total}
                </li>
              ))}
            </ul>
          </div>

          {status === 'snapshot' && (
            <p className="mt-3 text-sm text-muted" role="status">
              {t('activity.snapshot', {
                date: new Date(snapshotDate).toLocaleDateString(lang === 'es' ? 'es-CO' : 'en-US', { dateStyle: 'medium' }),
              })}
            </p>
          )}

          <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
            <Stat label={t('activity.total')} value={<CountUp value={stats.total} />} />
            <Stat label={t('activity.active_days')} value={<CountUp value={stats.activeDays} />} />
            <Stat
              label={t('activity.best_day')}
              value={<CountUp value={stats.best ? stats.best.count : 0} />}
              detail={stats.best ? formatDate(stats.best.date, lang) : null}
            />
            <Stat label={t('activity.streak')} value={<CountUp value={stats.longestStreak} format={(n) => t('activity.days', { n })} />} />
          </dl>
          <p className="mt-8 text-sm text-muted">{t('activity.source')}</p>
        </>
      )}
    </section>
  );
}
