import { COLLIDERS, PLAYER, ROOM } from '../config.js';

const LIMIT = ROOM.half - PLAYER.radius;

// True when a circle of the player's radius centred at (x, z) does not touch a wall or furniture.
export function isWalkable(x, z, radius = PLAYER.radius, colliders = COLLIDERS) {
  const limit = ROOM.half - radius;
  if (x < -limit || x > limit || z < -limit || z > limit) return false;
  for (const box of colliders) {
    const nearestX = Math.max(box.minX, Math.min(x, box.maxX));
    const nearestZ = Math.max(box.minZ, Math.min(z, box.maxZ));
    const dx = x - nearestX;
    const dz = z - nearestZ;
    if (dx * dx + dz * dz < radius * radius) return false;
  }
  return true;
}

// Moves from (x, z) by (dx, dz), testing each axis on its own so the character slides along obstacles.
export function moveWithCollisions(x, z, dx, dz) {
  let nextX = Math.max(-LIMIT, Math.min(LIMIT, x + dx));
  let nextZ = z;
  if (!isWalkable(nextX, nextZ)) nextX = x;
  nextZ = Math.max(-LIMIT, Math.min(LIMIT, z + dz));
  if (!isWalkable(nextX, nextZ)) nextZ = z;
  return { x: nextX, z: nextZ };
}
