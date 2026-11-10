import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../i18n/index.jsx';
import { monthMarkers, toWeeks } from './stats.js';

const CELL = 13; // px, cell size
const GAP = 3;

export function formatDate(date, lang) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(lang === 'es' ? 'es-CO' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function describeDay(day, t, lang) {
  const date = formatDate(day.date, lang);
  if (day.count === 0) return t('activity.cell_none', { date });
  if (day.count === 1) return t('activity.cell_one', { date });
  return t('activity.cell', { count: day.count, date });
}

// Contribution calendar: one column per week, one row per weekday.
export default function Heatmap({ days }) {
  const { t, lang } = useLanguage();
  const scrollRef = useRef(null);
  const [tip, setTip] = useState(null);
  const weeks = useMemo(() => toWeeks(days), [days]);
  const markers = useMemo(() => monthMarkers(weeks), [weeks]);
  const months = t('activity.months');
  const weekdays = t('activity.weekdays');

  // On narrow screens start scrolled to the most recent weeks.
  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollLeft = element.scrollWidth;
  }, [weeks]);

  const showTip = (event, day) => {
    const cell = event.currentTarget.getBoundingClientRect();
    const box = scrollRef.current.parentElement.getBoundingClientRect();
    setTip({
      text: describeDay(day, t, lang),
      x: Math.min(Math.max(cell.left + cell.width / 2 - box.left, 90), box.width - 90),
      y: cell.top - box.top,
    });
  };

  return (
    <div className="relative" onPointerLeave={() => setTip(null)}>
      <div ref={scrollRef} className="overflow-x-auto pb-2">
        <div className="inline-flex gap-2">
          <div
            className="grid shrink-0 pt-5 font-mono text-[10px] leading-none text-muted"
            style={{ gridTemplateRows: `repeat(7, ${CELL}px)`, rowGap: GAP }}
            aria-hidden="true"
          >
            {weekdays.map((name, index) => (
              <span key={name} className="flex items-center">
                {index % 2 === 1 ? name : ''}
              </span>
            ))}
          </div>

          <div>
            <div className="relative h-5 font-mono text-[10px] text-muted" aria-hidden="true">
              {markers.map((marker) => (
                <span key={`${marker.month}-${marker.index}`} className="absolute" style={{ left: marker.index * (CELL + GAP) }}>
                  {months[marker.month]}
                </span>
              ))}
            </div>
            <div
              role="img"
              aria-label={t('activity.title')}
              className="grid grid-flow-col"
              style={{ gridTemplateRows: `repeat(7, ${CELL}px)`, gridAutoColumns: CELL, gap: GAP }}
            >
              {weeks.flatMap((week, weekIndex) =>
                week.map((day, dayIndex) =>
                  day ? (
                    <span
                      key={day.date}
                      onPointerEnter={(event) => showTip(event, day)}
                      onPointerDown={(event) => showTip(event, day)}
                      className="rounded-[3px] outline-1 -outline-offset-1 outline-black/5 dark:outline-white/5"
                      style={{ background: `var(--heat-${day.level})` }}
                    />
                  ) : (
                    <span key={`empty-${weekIndex}-${dayIndex}`} />
                  ),
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {tip && (
        <div
          role="status"
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-line bg-surface px-3 py-1.5 text-xs shadow-card"
          style={{ left: tip.x, top: tip.y - 6 }}
        >
          {tip.text}
        </div>
      )}

      <div className="mt-3 flex items-center justify-end gap-1.5 font-mono text-[10px] text-muted" aria-hidden="true">
        {t('activity.less')}
        {[0, 1, 2, 3, 4].map((level) => (
          <span key={level} className="h-[11px] w-[11px] rounded-[3px]" style={{ background: `var(--heat-${level})` }} />
        ))}
        {t('activity.more')}
      </div>
    </div>
  );
}
