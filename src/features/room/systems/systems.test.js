import { describe, expect, it } from 'vitest';
import { COLLIDERS, INTERACTABLES, PLAYER } from '../config.js';
import { isWalkable, moveWithCollisions } from './collision.js';
import { findPath, hasLineOfSight } from './pathfinding.js';

describe('collision', () => {
  it('keeps the player inside the room', () => {
    expect(isWalkable(0, 0)).toBe(true);
    expect(isWalkable(3.9, 0)).toBe(false);
    expect(moveWithCollisions(3.6, 0, 5, 0).x).toBeLessThanOrEqual(4 - PLAYER.radius);
  });

  it('blocks furniture and slides along it', () => {
    const desk = COLLIDERS.find((box) => box.id === 'desk');
    expect(isWalkable((desk.minX + desk.maxX) / 2, (desk.minZ + desk.maxZ) / 2)).toBe(false);
    // Walking diagonally into the desk front keeps moving sideways.
    const start = { x: -2.4, z: desk.maxZ + PLAYER.radius + 0.01 };
    const moved = moveWithCollisions(start.x, start.z, 0.1, -0.1);
    expect(moved.z).toBe(start.z);
    expect(moved.x).toBeCloseTo(start.x + 0.1);
  });

  it('starts the player on free floor', () => {
    expect(isWalkable(PLAYER.start.x, PLAYER.start.z)).toBe(true);
  });
});

describe('pathfinding', () => {
  it('reaches every interactive object from the start and from each other', () => {
    const points = [PLAYER.start, ...INTERACTABLES.map((item) => item.approach)];
    for (const from of points) {
      for (const item of INTERACTABLES) {
        expect(isWalkable(item.approach.x, item.approach.z), item.id).toBe(true);
        const path = findPath(from, item.approach);
        expect(path.length, `${JSON.stringify(from)} -> ${item.id}`).toBeGreaterThan(0);
        const last = path[path.length - 1];
        expect(Math.hypot(last.x - item.approach.x, last.z - item.approach.z)).toBeLessThan(0.01);
        let previous = from;
        for (const point of path) {
          expect(hasLineOfSight(previous.x, previous.z, point.x, point.z), `${item.id} segment`).toBe(true);
          previous = point;
        }
      }
    }
  });

  it('ends next to the target when the click is inside furniture', () => {
    const path = findPath(PLAYER.start, { x: -1.3, z: -3.5 });
    expect(path.length).toBeGreaterThan(0);
    const last = path[path.length - 1];
    expect(isWalkable(last.x, last.z)).toBe(true);
  });
});
