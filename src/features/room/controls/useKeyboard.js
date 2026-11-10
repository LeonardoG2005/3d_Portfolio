import { useEffect } from 'react';
import { live, requestInteract, useRoom } from '../store.js';

const MOVE_KEYS = {
  KeyW: [0, 1],
  ArrowUp: [0, 1],
  KeyS: [0, -1],
  ArrowDown: [0, -1],
  KeyA: [-1, 0],
  ArrowLeft: [-1, 0],
  KeyD: [1, 0],
  ArrowRight: [1, 0],
};

function typingOrDialog(event) {
  const element = event.target;
  if (element instanceof HTMLElement) {
    if (element.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName)) return true;
  }
  // Menus, the chat and the CV chooser are modal: the room must not react while one is open.
  return !!document.querySelector('[aria-modal="true"]');
}

// WASD / arrows to move, E to open the nearby object.
export function useKeyboard() {
  useEffect(() => {
    const pressed = new Set();

    const refresh = () => {
      let x = 0;
      let y = 0;
      pressed.forEach((code) => {
        x += MOVE_KEYS[code][0];
        y += MOVE_KEYS[code][1];
      });
      live.keys.x = Math.max(-1, Math.min(1, x));
      live.keys.y = Math.max(-1, Math.min(1, y));
    };

    const onKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (typingOrDialog(event)) return;
      if (MOVE_KEYS[event.code]) {
        // Arrow keys would scroll the page or move focus between buttons otherwise.
        if (event.code.startsWith('Arrow') && !(event.target instanceof HTMLButtonElement || event.target instanceof HTMLAnchorElement)) {
          event.preventDefault();
        }
        pressed.add(event.code);
        refresh();
        live.wake();
        return;
      }
      if (event.code === 'KeyE' && !event.repeat) {
        const { nearId } = useRoom.getState();
        if (nearId) requestInteract(nearId);
        live.wake();
      }
    };

    const onKeyUp = (event) => {
      if (pressed.delete(event.code)) refresh();
    };

    const clear = () => {
      pressed.clear();
      refresh();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clear);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clear);
      clear();
    };
  }, []);
}
