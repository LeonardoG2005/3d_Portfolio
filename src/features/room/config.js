// Room layout data shared by rendering, movement and interaction. Plain numbers only (no three.js imports)
// so collision and pathfinding can be unit-tested in Node.
//
// Axes: x and z are the floor plane, y is up. The room spans -4..4 on both floor axes.
// The two walls stand at x = -4 (seen on the left) and z = -4 (seen on the right).

export const ROOM = { half: 4, wallHeight: 3.4 };
export const PLAYER = { radius: 0.28, speed: 2.7, start: { x: 0.9, z: 0.9 } };

// Furniture footprints as axis-aligned rectangles on the floor.
export const COLLIDERS = [
  { id: 'bookshelf', minX: -4, maxX: -3.45, minZ: -3.3, maxZ: -1.1 },
  { id: 'desk', minX: -2.72, maxX: 0.12, minZ: -4, maxZ: -3.02 },
  { id: 'chair', minX: -1.62, maxX: -0.98, minZ: -2.84, maxZ: -2.2 },
  { id: 'bin', minX: 0.28, maxX: 0.62, minZ: -3.8, maxZ: -3.42 },
  { id: 'floorLamp', minX: -3.85, maxX: -3.45, minZ: -0.95, maxZ: -0.55 },
  { id: 'cabinet', minX: -4, maxX: -3.42, minZ: 0.78, maxZ: 1.92 },
  { id: 'backpack', minX: -3.9, maxX: -3.5, minZ: 2.02, maxZ: 2.4 },
  { id: 'tallPlant', minX: 3.1, maxX: 3.8, minZ: -3.8, maxZ: -3.1 },
  { id: 'sideTable', minX: 2.9, maxX: 3.6, minZ: -1.85, maxZ: -1.15 },
  { id: 'guitar', minX: 3.1, maxX: 3.7, minZ: 0.05, maxZ: 0.55 },
];

// Objects the visitor can open.
//   route:    page to navigate to (null means the object opens a dialog instead)
//   approach: floor point where the character stands to use it
//   focus:    point the character faces and the camera eases toward
//   label:    where the floating label is anchored
//   hit:      invisible click volume { center, size }
export const INTERACTABLES = [
  {
    id: 'projects',
    route: '/projects',
    approach: { x: -0.45, z: -2.62 },
    focus: [-1.25, 1.25, -3.7],
    label: [-1.25, 1.95, -3.7],
    hit: { center: [-1.25, 1.15, -3.62], size: [2.3, 0.95, 0.5] },
  },
  {
    id: 'skills',
    route: '/skills',
    approach: { x: -2.95, z: -2.2 },
    focus: [-3.75, 1.3, -2.2],
    label: [-3.7, 2.75, -2.2],
    hit: { center: [-3.72, 1.25, -2.2], size: [0.6, 2.5, 2.15] },
  },
  {
    id: 'about',
    route: '/about',
    approach: { x: -3.05, z: 0.1 },
    focus: [-3.95, 1.9, 0.1],
    label: [-3.9, 2.6, 0.1],
    hit: { center: [-3.92, 1.9, 0.1], size: [0.2, 1.1, 0.85] },
  },
  {
    id: 'cv',
    route: null,
    approach: { x: -2.95, z: 1.35 },
    focus: [-3.72, 0.95, 1.35],
    label: [-3.7, 1.45, 1.35],
    hit: { center: [-3.72, 0.7, 1.35], size: [0.62, 1.3, 1.15] },
  },
  {
    id: 'journey',
    route: '/journey',
    approach: { x: -3.2, z: 3.0 },
    focus: [-3.95, 1.1, 3.0],
    label: [-3.9, 2.45, 3.0],
    hit: { center: [-3.9, 1.1, 3.0], size: [0.25, 2.2, 1.1] },
  },
  {
    id: 'activity',
    route: '/activity',
    approach: { x: 1.0, z: -3.2 },
    focus: [1.0, 1.75, -3.95],
    label: [1.0, 2.3, -3.9],
    hit: { center: [1.0, 1.75, -3.9], size: [1.15, 0.8, 0.25] },
  },
  {
    id: 'contact',
    route: '/contact',
    approach: { x: 2.5, z: -1.5 },
    focus: [3.25, 0.6, -1.5],
    label: [3.25, 1.1, -1.5],
    hit: { center: [3.25, 0.45, -1.5], size: [0.75, 0.95, 0.75] },
  },
];

export const getInteractable = (id) => INTERACTABLES.find((item) => item.id === id);
