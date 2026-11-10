import { describe, expect, it } from 'vitest';
import { computeStats, monthMarkers, packDays, toWeeks, unpackDays } from './stats.js';

const day = (date, count) => ({ date, count, level: Math.min(4, count) });

describe('contribution stats', () => {
  it('computes totals, best day and longest streak', () => {
    const days = [day('2026-01-01', 0), day('2026-01-02', 2), day('2026-01-03', 5), day('2026-01-04', 1), day('2026-01-05', 0), day('2026-01-06', 3)];
    const stats = computeStats(days);
    expect(stats.total).toBe(11);
    expect(stats.activeDays).toBe(4);
    expect(stats.best.date).toBe('2026-01-03');
    expect(stats.longestStreak).toBe(3);
  });

  it('handles an empty range', () => {
    expect(computeStats([])).toEqual({ total: 0, activeDays: 0, best: null, longestStreak: 0 });
  });

  it('groups days into Sunday-first weeks', () => {
    // 2026-01-01 is a Thursday.
    const days = Array.from({ length: 10 }, (_, i) => day(`2026-01-${String(i + 1).padStart(2, '0')}`, i));
    const weeks = toWeeks(days);
    expect(weeks).toHaveLength(2);
    expect(weeks[0][4].date).toBe('2026-01-01');
    expect(weeks[0][0]).toBeNull();
    expect(weeks[1][0].date).toBe('2026-01-04');
    expect(monthMarkers(weeks)[0]).toEqual({ index: 0, month: 0 });
  });

  it('round-trips the compact snapshot format', () => {
    const days = [day('2026-02-01', 2)];
    expect(unpackDays(packDays(days))).toEqual(days);
  });
});
