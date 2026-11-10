import { useEffect, useState } from 'react';
import { PROFILE } from '../../data/profile.js';
import { unpackDays } from './stats.js';

// Community API that exposes the public GitHub contribution calendar as JSON (no token needed).
const API = `https://github-contributions-api.jogruber.de/v4/${PROFILE.githubUser}`;
const TIMEOUT_MS = 6000;

async function fetchLive(year) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${API}?y=${year}`, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    if (!Array.isArray(json.contributions) || json.contributions.length === 0) throw new Error('empty');
    return json.contributions;
  } finally {
    window.clearTimeout(timer);
  }
}

// Saved copy generated at build time by scripts/snapshot-contributions.mjs.
async function fetchSnapshot(year) {
  const snapshot = (await import('../../data/contributions.snapshot.json')).default;
  if (!snapshot?.generatedAt) throw new Error('no snapshot');
  const all = unpackDays(snapshot.days || []);
  let days;
  if (year === 'last') {
    const lastDay = snapshot.generatedAt.slice(0, 10);
    days = all.filter((day) => day.date <= lastDay).slice(-371);
  } else {
    days = all.filter((day) => day.date.startsWith(`${year}-`));
  }
  if (days.length === 0) throw new Error('snapshot has no data for this range');
  return { days, generatedAt: snapshot.generatedAt };
}

function readCache(year) {
  try {
    const raw = sessionStorage.getItem(`lg.contrib.${year}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(year, days) {
  try {
    sessionStorage.setItem(`lg.contrib.${year}`, JSON.stringify(days));
  } catch {
    /* ignore */
  }
}

// state: { status: 'loading' | 'live' | 'snapshot' | 'error', days, snapshotDate }
export function useContributions(year) {
  const [state, setState] = useState({ status: 'loading', days: [], snapshotDate: null });

  useEffect(() => {
    let alive = true;
    const cached = readCache(year);
    if (cached) {
      setState({ status: 'live', days: cached, snapshotDate: null });
      return undefined;
    }
    setState({ status: 'loading', days: [], snapshotDate: null });

    fetchLive(year)
      .then((days) => {
        writeCache(year, days);
        if (alive) setState({ status: 'live', days, snapshotDate: null });
      })
      .catch(() =>
        fetchSnapshot(year)
          .then(({ days, generatedAt }) => {
            if (alive) setState({ status: 'snapshot', days, snapshotDate: generatedAt });
          })
          .catch(() => {
            if (alive) setState({ status: 'error', days: [], snapshotDate: null });
          }),
      );

    return () => {
      alive = false;
    };
  }, [year]);

  return state;
}
