// Decides which presentation of the home page a device should get.
// Order of preference: WebGPU, then WebGL 2, then the 2D lightweight home.
// No user-agent sniffing: only feature tests and standard preference signals.

function queryOverride() {
  try {
    const value = new URLSearchParams(window.location.search).get('renderer');
    return ['webgpu', 'webgl', 'lite'].includes(value) ? value : null;
  } catch {
    return null;
  }
}

function hasWebGL2() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true });
    const ok = !!gl;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return ok;
  } catch {
    return false;
  }
}

async function hasWebGPU() {
  try {
    if (!('gpu' in navigator)) return false;
    const adapter = await navigator.gpu.requestAdapter();
    return !!adapter;
  } catch {
    return false;
  }
}

/** @returns {Promise<'webgpu' | 'webgl' | 'none'>} */
export async function detectRenderer() {
  const override = queryOverride();
  if (override === 'lite') return 'none';
  if (override === 'webgl') return hasWebGL2() ? 'webgl' : 'none';
  if (await hasWebGPU()) return 'webgpu';
  if (hasWebGL2()) return 'webgl';
  return 'none';
}

/** Signals that suggest the 2D version should be the default (the visitor can still opt in). */
export function prefersLightweight() {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    const connection = navigator.connection;
    if (connection?.saveData) return true;
    if (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 2) return true;
    if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 2) return true;
  } catch {
    /* ignore */
  }
  return false;
}

export function isCoarsePointer() {
  try {
    return window.matchMedia('(pointer: coarse)').matches;
  } catch {
    return false;
  }
}
