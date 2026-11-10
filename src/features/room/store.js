import { create } from 'zustand';
import { PLAYER, getInteractable } from './config.js';
import { findPath } from './systems/pathfinding.js';

// Reactive state: only things the DOM overlay needs to re-render for.
export const useRoom = create(() => ({
  nearId: null, // interactable the character is standing next to
  hoverId: null, // interactable under the pointer
  focusId: null, // interactable focused from the keyboard list
  activeId: null, // interactable being opened (camera eases in, then the page changes)
  cvOpen: false,
  backend: null, // 'WebGPU' | 'WebGL 2'
}));

// Per-frame state, read and written inside the render loop without causing React renders.
export const live = {
  x: PLAYER.start.x,
  z: PLAYER.start.z,
  heading: Math.PI / 4,
  speed: 0,
  keys: { x: 0, y: 0 },
  stick: { x: 0, y: 0 },
  path: [],
  pending: null, // interactable id to open when the current path ends
  lastInput: 0,
  wake: () => {},
  labelElement: null,
};

export function resetLive() {
  live.x = PLAYER.start.x;
  live.z = PLAYER.start.z;
  live.heading = Math.PI / 4;
  live.speed = 0;
  live.keys.x = 0;
  live.keys.y = 0;
  live.stick.x = 0;
  live.stick.y = 0;
  live.path = [];
  live.pending = null;
  useRoom.setState({ nearId: null, hoverId: null, focusId: null, activeId: null, cvOpen: false });
}

export function walkTo(x, z) {
  if (useRoom.getState().activeId) return;
  live.path = findPath({ x: live.x, z: live.z }, { x, z });
  live.pending = null;
  live.wake();
}

// Walk to an object and open it on arrival.
export function requestInteract(id) {
  const target = getInteractable(id);
  if (!target || useRoom.getState().activeId) return;
  live.path = findPath({ x: live.x, z: live.z }, target.approach);
  live.pending = id;
  live.wake();
}

export function activate(id) {
  const target = getInteractable(id);
  if (!target) return;
  if (target.route === null) useRoom.setState({ cvOpen: true });
  else useRoom.setState({ activeId: id });
}
