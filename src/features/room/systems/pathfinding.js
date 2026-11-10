import { PLAYER, ROOM } from '../config.js';
import { isWalkable } from './collision.js';

// Grid A* over the floor. The room is small (about a thousand cells), so a plain implementation is enough.
const CELL = 0.2;
const SIZE = Math.round((ROOM.half * 2) / CELL);
// A little extra clearance keeps paths from grazing furniture corners.
const CLEARANCE = PLAYER.radius + 0.04;

const toCell = (value) => Math.max(0, Math.min(SIZE - 1, Math.floor((value + ROOM.half) / CELL)));
const toWorld = (cell) => -ROOM.half + (cell + 0.5) * CELL;
const key = (cx, cz) => cz * SIZE + cx;

let grid = null;
function getGrid() {
  if (!grid) {
    grid = new Uint8Array(SIZE * SIZE);
    for (let cz = 0; cz < SIZE; cz += 1) {
      for (let cx = 0; cx < SIZE; cx += 1) {
        grid[key(cx, cz)] = isWalkable(toWorld(cx), toWorld(cz), CLEARANCE) ? 1 : 0;
      }
    }
  }
  return grid;
}

function nearestOpenCell(cx, cz) {
  const cells = getGrid();
  if (cells[key(cx, cz)]) return [cx, cz];
  for (let radius = 1; radius < SIZE; radius += 1) {
    let best = null;
    let bestDistance = Infinity;
    for (let dz = -radius; dz <= radius; dz += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        if (Math.max(Math.abs(dx), Math.abs(dz)) !== radius) continue;
        const x = cx + dx;
        const z = cz + dz;
        if (x < 0 || z < 0 || x >= SIZE || z >= SIZE || !cells[key(x, z)]) continue;
        const distance = dx * dx + dz * dz;
        if (distance < bestDistance) {
          bestDistance = distance;
          best = [x, z];
        }
      }
    }
    if (best) return best;
  }
  return null;
}

// Straight segment test, sampled finely.
export function hasLineOfSight(ax, az, bx, bz) {
  const distance = Math.hypot(bx - ax, bz - az);
  const steps = Math.max(1, Math.ceil(distance / 0.08));
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    if (!isWalkable(ax + (bx - ax) * t, az + (bz - az) * t)) return false;
  }
  return true;
}

const NEIGHBOURS = [
  [1, 0, 1],
  [-1, 0, 1],
  [0, 1, 1],
  [0, -1, 1],
  [1, 1, Math.SQRT2],
  [1, -1, Math.SQRT2],
  [-1, 1, Math.SQRT2],
  [-1, -1, Math.SQRT2],
];

/**
 * Returns a list of floor points leading from `from` to (or as close as possible to) `to`.
 * Points are { x, z }. The list is empty when no route exists.
 */
export function findPath(from, to) {
  // Trivial case first: nothing in the way.
  if (isWalkable(to.x, to.z) && hasLineOfSight(from.x, from.z, to.x, to.z)) return [{ x: to.x, z: to.z }];

  const cells = getGrid();
  const start = nearestOpenCell(toCell(from.x), toCell(from.z));
  const goal = nearestOpenCell(toCell(to.x), toCell(to.z));
  if (!start || !goal) return [];

  const startKey = key(start[0], start[1]);
  const goalKey = key(goal[0], goal[1]);
  const cost = new Float32Array(SIZE * SIZE).fill(Infinity);
  const cameFrom = new Int32Array(SIZE * SIZE).fill(-1);
  const closed = new Uint8Array(SIZE * SIZE);
  const open = [startKey];
  const score = new Float32Array(SIZE * SIZE).fill(Infinity);
  cost[startKey] = 0;
  score[startKey] = 0;

  while (open.length > 0) {
    let bestIndex = 0;
    for (let i = 1; i < open.length; i += 1) if (score[open[i]] < score[open[bestIndex]]) bestIndex = i;
    const current = open.splice(bestIndex, 1)[0];
    if (current === goalKey) break;
    if (closed[current]) continue;
    closed[current] = 1;
    const cx = current % SIZE;
    const cz = (current - cx) / SIZE;

    for (const [dx, dz, step] of NEIGHBOURS) {
      const nx = cx + dx;
      const nz = cz + dz;
      if (nx < 0 || nz < 0 || nx >= SIZE || nz >= SIZE) continue;
      const next = key(nx, nz);
      if (!cells[next] || closed[next]) continue;
      // Do not cut corners diagonally.
      if (dx !== 0 && dz !== 0 && (!cells[key(cx + dx, cz)] || !cells[key(cx, cz + dz)])) continue;
      const candidate = cost[current] + step;
      if (candidate < cost[next]) {
        cost[next] = candidate;
        cameFrom[next] = current;
        score[next] = candidate + Math.hypot(goal[0] - nx, goal[1] - nz);
        open.push(next);
      }
    }
  }

  if (cameFrom[goalKey] === -1 && goalKey !== startKey) return [];

  const points = [];
  for (let node = goalKey; node !== -1; node = cameFrom[node]) {
    const cx = node % SIZE;
    points.push({ x: toWorld(cx), z: toWorld((node - cx) / SIZE) });
  }
  points.reverse();
  // Finish exactly on the requested point when it is reachable from the last cell.
  if (isWalkable(to.x, to.z)) points.push({ x: to.x, z: to.z });

  // String pulling: drop intermediate points that can be skipped in a straight line.
  const smooth = [];
  let anchor = { x: from.x, z: from.z };
  let index = 0;
  while (index < points.length) {
    let furthest = index;
    for (let probe = points.length - 1; probe > index; probe -= 1) {
      if (hasLineOfSight(anchor.x, anchor.z, points[probe].x, points[probe].z)) {
        furthest = probe;
        break;
      }
    }
    smooth.push(points[furthest]);
    anchor = points[furthest];
    index = furthest + 1;
  }
  return smooth;
}
