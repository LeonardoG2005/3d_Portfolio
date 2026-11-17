// Geometry for the background scene, generated once at start-up.

const normalize = ([x, y, z]) => {
  const length = Math.hypot(x, y, z);
  return [x / length, y / length, z / length];
};

const PHI = (1 + Math.sqrt(5)) / 2;
const ICOSAHEDRON = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
];
const ICOSAHEDRON_FACES = [
  [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
  [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
  [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
  [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
];

// Unit sphere made of evenly sized triangles. detail 4 = 2,562 vertices, detail 5 = 10,242.
export function icosphere(detail) {
  const vertices = ICOSAHEDRON.map(normalize);
  let faces = ICOSAHEDRON_FACES;
  for (let level = 0; level < detail; level += 1) {
    const cache = new Map();
    const midpoint = (a, b) => {
      const key = a < b ? a * 65536 + b : b * 65536 + a;
      if (!cache.has(key)) {
        const [ax, ay, az] = vertices[a];
        const [bx, by, bz] = vertices[b];
        cache.set(key, vertices.push(normalize([ax + bx, ay + by, az + bz])) - 1);
      }
      return cache.get(key);
    };
    const next = [];
    for (const [a, b, c] of faces) {
      const ab = midpoint(a, b);
      const bc = midpoint(b, c);
      const ca = midpoint(c, a);
      next.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    faces = next;
  }
  return { positions: new Float32Array(vertices.flat()), indices: new Uint16Array(faces.flat()) };
}

// Edge lists (pairs of points) for the wireframe solids: every pair of corners at the shortest distance is an edge.
function edges(corners) {
  const points = corners.map(normalize);
  let shortest = Infinity;
  const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  for (let a = 0; a < points.length; a += 1) {
    for (let b = a + 1; b < points.length; b += 1) shortest = Math.min(shortest, distance(points[a], points[b]));
  }
  const lines = [];
  for (let a = 0; a < points.length; a += 1) {
    for (let b = a + 1; b < points.length; b += 1) {
      if (distance(points[a], points[b]) < shortest * 1.01) lines.push(...points[a], ...points[b]);
    }
  }
  return new Float32Array(lines);
}

const CUBE = [];
for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) CUBE.push([x, y, z]);

export const WIRE_SHAPES = [
  edges(ICOSAHEDRON),
  edges([[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]), // octahedron
  edges([[1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]]), // tetrahedron
  edges(CUBE),
];
