// Pure helpers for the contribution calendar. Days are { date: 'YYYY-MM-DD', count, level }.

export function computeStats(days) {
  let total = 0;
  let activeDays = 0;
  let best = null;
  let longest = 0;
  let run = 0;
  for (const day of days) {
    total += day.count;
    if (day.count > 0) {
      activeDays += 1;
      run += 1;
      if (run > longest) longest = run;
      if (!best || day.count > best.count) best = day;
    } else {
      run = 0;
    }
  }
  return { total, activeDays, best, longestStreak: longest };
}

// Groups days into calendar weeks (Sunday first). Missing leading/trailing days are null.
export function toWeeks(days) {
  if (days.length === 0) return [];
  const weeks = [];
  let week = new Array(7).fill(null);
  for (const day of days) {
    const weekday = new Date(`${day.date}T00:00:00Z`).getUTCDay();
    week[weekday] = day;
    if (weekday === 6) {
      weeks.push(week);
      week = new Array(7).fill(null);
    }
  }
  if (week.some(Boolean)) weeks.push(week);
  return weeks;
}

// Column index at which each month label should be drawn.
export function monthMarkers(weeks) {
  const markers = [];
  let lastMonth = -1;
  weeks.forEach((week, index) => {
    const first = week.find(Boolean);
    if (!first) return;
    const month = Number(first.date.slice(5, 7)) - 1;
    if (month !== lastMonth) {
      // Skip a label that would collide with the previous one.
      if (markers.length === 0 || index - markers[markers.length - 1].index >= 3) markers.push({ index, month });
      lastMonth = month;
    }
  });
  return markers;
}

// The snapshot file stores days compactly as [date, count, level].
export const unpackDays = (packed) => packed.map(([date, count, level]) => ({ date, count, level }));
export const packDays = (days) => days.map((day) => [day.date, day.count, day.level]);
