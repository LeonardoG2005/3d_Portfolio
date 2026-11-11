import { createBuilder, seeded } from './builder.js';
import { BRAND } from './palette.js';

// Everything in the room that never moves, baked into one geometry (see builder.js).
// Positions must stay in sync with COLLIDERS and INTERACTABLES in ../config.js.
// Left wall: x = -4 (objects there face +x). Right wall: z = -4 (objects there face +z).

function booksRow(b, p, rand, y, zFrom, zTo, lean = false) {
  let z = zFrom;
  while (z < zTo - 0.05) {
    const thickness = 0.045 + rand() * 0.05;
    const height = 0.27 + rand() * 0.14;
    const hex = p.books[Math.floor(rand() * p.books.length)];
    b.box(-3.69, y + height / 2, z + thickness / 2, 0.28 + rand() * 0.04, height, thickness, hex);
    z += thickness + 0.004;
  }
  if (lean) b.box(-3.69, y + 0.17, zTo + 0.07, 0.3, 0.36, 0.055, p.books[4], [-0.32, 0, 0]);
}

function plant(b, p, x, z, { pot = 0.2, height = 0.9, leaves = 7, potColor } = {}) {
  const rand = seeded(Math.round((x + 10) * 97 + (z + 10) * 31));
  b.cyl(x, pot * 0.75, z, pot * 0.8, pot * 1.5, potColor || p.terracotta, { top: pot });
  b.cyl(x, pot * 1.5, z, pot * 0.92, 0.04, '#3a2a1c', { top: pot * 0.92 });
  for (let i = 0; i < leaves; i += 1) {
    const angle = (i / leaves) * Math.PI * 2 + rand();
    const reach = 0.06 + rand() * pot * 0.9;
    const y = pot * 1.5 + height * (0.25 + rand() * 0.75);
    const size = pot * (0.55 + rand() * 0.45);
    b.sphere(x + Math.cos(angle) * reach, y, z + Math.sin(angle) * reach, size, [p.leafA, p.leafB, p.leafC][i % 3], {
      squash: [0.75, 1.5, 0.75],
      detail: 1,
    });
  }
}

function bookshelf(b, p) {
  const rand = seeded(2005);
  const x = -3.74;
  const z = -2.2;
  // Frame
  b.box(x, 1.2, -3.23, 0.5, 2.4, 0.045, p.woodDark);
  b.box(x, 1.2, -1.17, 0.5, 2.4, 0.045, p.woodDark);
  b.box(-3.975, 1.2, z, 0.03, 2.4, 2.1, p.woodDark);
  [0.03, 0.6, 1.1, 1.6, 2.1, 2.39].forEach((y) => b.box(x, y, z, 0.49, 0.045, 2.06, p.wood));
  b.box(x + 0.01, 1.2, z, 0.47, 2.36, 0.035, p.wood); // centre divider

  // Bottom: storage boxes
  b.box(-3.72, 0.3, -2.75, 0.4, 0.42, 0.78, p.cream);
  b.box(-3.515, 0.3, -2.75, 0.012, 0.08, 0.2, p.woodDark);
  b.box(-3.72, 0.27, -1.68, 0.4, 0.36, 0.7, p.fabric);
  b.box(-3.515, 0.27, -1.68, 0.012, 0.08, 0.2, p.cream);

  // Shelf 2: books and a globe
  booksRow(b, p, rand, 0.625, -3.18, -2.5, true);
  b.cyl(-3.7, 0.64, -1.95, 0.09, 0.03, p.metal);
  b.cyl(-3.7, 0.71, -1.95, 0.012, 0.12, p.brass);
  b.ball(-3.7, 0.84, -1.95, 0.13, '#3f7fa6');
  b.sphere(-3.62, 0.87, -1.9, 0.07, p.leafA, { squash: [0.6, 1, 1.2] });
  b.sphere(-3.63, 0.8, -2.02, 0.05, p.leafB, { squash: [0.6, 1.2, 1] });
  booksRow(b, p, rand, 0.625, -1.72, -1.24);

  // Shelf 3: retro console, controller, leaning books, speaker
  b.box(-3.7, 1.165, -2.85, 0.3, 0.085, 0.42, p.cream);
  b.box(-3.7, 1.215, -2.85, 0.2, 0.02, 0.26, p.plastic);
  b.box(-3.56, 1.15, -2.42, 0.1, 0.035, 0.2, p.plastic, [0, 0.4, 0]);
  b.box(-3.58, 1.172, -2.47, 0.025, 0.012, 0.025, BRAND);
  booksRow(b, p, rand, 1.125, -2.14, -1.7, true);
  b.box(-3.7, 1.27, -1.38, 0.22, 0.3, 0.2, p.metal);
  b.cyl(-3.585, 1.31, -1.38, 0.06, 0.012, p.plastic, { rotation: [0, 0, Math.PI / 2] });
  b.cyl(-3.585, 1.2, -1.38, 0.035, 0.012, p.plastic, { rotation: [0, 0, Math.PI / 2] });

  // Shelf 4: books, camera, framed photo, trophy
  booksRow(b, p, rand, 1.625, -3.18, -2.62);
  b.box(-3.68, 1.705, -2.4, 0.14, 0.13, 0.22, p.metal);
  b.cyl(-3.59, 1.705, -2.4, 0.055, 0.07, p.plastic, { rotation: [0, 0, Math.PI / 2] });
  b.box(-3.68, 1.785, -2.34, 0.06, 0.03, 0.06, p.plastic);
  b.box(-3.66, 1.77, -1.9, 0.03, 0.28, 0.22, p.woodDark, [0, 0, 0.12]);
  b.box(-3.642, 1.772, -1.9, 0.012, 0.22, 0.16, p.cream, [0, 0, 0.12]);
  b.cyl(-3.68, 1.64, -1.45, 0.06, 0.03, p.woodDark);
  b.cyl(-3.68, 1.7, -1.45, 0.015, 0.1, p.brass);
  b.cyl(-3.68, 1.8, -1.45, 0.035, 0.11, p.brass, { top: 0.075 });

  // Top shelf: stacked books, Rubik's cube, octocat-like figure
  b.box(-3.7, 2.14, -2.95, 0.3, 0.05, 0.4, p.books[0]);
  b.box(-3.7, 2.19, -2.93, 0.28, 0.045, 0.37, p.books[2]);
  b.box(-3.7, 2.235, -2.96, 0.26, 0.04, 0.34, p.books[5]);
  [BRAND, '#f2f0e8', '#d9a441'].forEach((hex, i) => b.box(-3.68, 2.165 + i * 0.047, -2.4, 0.14, 0.045, 0.14, hex, [0, 0.5, 0]));
  b.sphere(-3.68, 2.2, -1.85, 0.085, p.metal, { squash: [1, 1.1, 1] });
  b.ball(-3.68, 2.33, -1.85, 0.08, p.metal);
  b.cone(-3.68, 2.42, -1.9, 0.03, 0.06, p.metal);
  b.cone(-3.68, 2.42, -1.8, 0.03, 0.06, p.metal);
  booksRow(b, p, rand, 2.125, -1.66, -1.24);

  // On top of the unit: trailing plant, headphones on a stand, small speaker
  b.cyl(-3.72, 2.5, -3.0, 0.09, 0.17, p.pot, { top: 0.11 });
  [0, 1, 2, 3, 4, 5].forEach((i) => {
    b.sphere(-3.58 + (i % 2) * 0.05, 2.56 - i * 0.11, -3.0 + ((i * 7) % 5) * 0.035 - 0.07, 0.065, i % 2 ? p.leafA : p.leafB, {
      squash: [0.8, 1.1, 1],
    });
  });
  b.sphere(-3.74, 2.66, -3.02, 0.11, p.leafC);
  b.sphere(-3.68, 2.64, -2.93, 0.09, p.leafB);
  b.cyl(-3.72, 2.43, -2.2, 0.08, 0.02, p.woodDark);
  b.cyl(-3.72, 2.56, -2.2, 0.014, 0.26, p.woodDark);
  b.torus(-3.72, 2.66, -2.2, 0.1, 0.018, p.plastic, { arc: Math.PI, rotation: [0, Math.PI / 2, 0] });
  b.cyl(-3.72, 2.64, -2.31, 0.05, 0.04, BRAND, { rotation: [Math.PI / 2, 0, 0] });
  b.cyl(-3.72, 2.64, -2.09, 0.05, 0.04, BRAND, { rotation: [Math.PI / 2, 0, 0] });
  b.box(-3.72, 2.53, -1.5, 0.2, 0.24, 0.3, p.cream);
  b.box(-3.72, 2.53, -1.5, 0.21, 0.05, 0.31, p.woodDark);
}

function desk(b, p) {
  // Table
  b.box(-1.3, 0.78, -3.52, 2.8, 0.07, 0.96, p.wood);
  [
    [-2.62, -3.93],
    [-2.62, -3.1],
    [0.02, -3.93],
    [0.02, -3.1],
  ].forEach(([x, z]) => b.box(x, 0.37, z, 0.07, 0.75, 0.07, p.metal));
  // Drawer unit and PC tower underneath
  b.box(-0.33, 0.4, -3.52, 0.6, 0.68, 0.86, p.woodDark);
  [0.58, 0.36, 0.14].forEach((y) => {
    b.box(-0.33, y, -3.085, 0.52, 0.18, 0.02, p.wood);
    b.box(-0.33, y, -3.07, 0.14, 0.02, 0.02, p.metal);
  });
  b.box(-2.3, 0.27, -3.6, 0.24, 0.52, 0.52, p.metal);
  b.box(-2.3, 0.27, -3.335, 0.2, 0.44, 0.012, p.plastic);
  // Cable tray under the table top
  b.box(-1.4, 0.68, -3.9, 1.3, 0.05, 0.12, p.metal);

  // Two monitors
  [
    [-1.78, 0.2],
    [-0.72, -0.2],
  ].forEach(([x, turn]) => {
    b.group(x, 0, -3.7, turn, (g) => {
      g.box(0, 0.83, 0, 0.32, 0.025, 0.2, p.metal);
      g.box(0, 0.96, -0.03, 0.05, 0.26, 0.05, p.metal);
      g.box(0, 1.3, 0, 0.98, 0.58, 0.05, p.plastic);
    });
  });

  // Keyboard, mouse, mug, notebook, pen cup
  b.box(-1.25, 0.828, -3.3, 0.62, 0.025, 0.2, p.cream);
  b.box(-1.25, 0.842, -3.3, 0.56, 0.008, 0.15, p.plastic);
  b.box(-0.72, 0.83, -3.28, 0.07, 0.03, 0.11, p.cream);
  b.box(-0.72, 0.817, -3.28, 0.26, 0.004, 0.22, p.plastic);
  b.cyl(-0.18, 0.87, -3.32, 0.05, 0.11, BRAND);
  b.torus(-0.12, 0.87, -3.32, 0.03, 0.01, BRAND, { rotation: [0, 0, 0] });
  b.box(-2.12, 0.826, -3.28, 0.28, 0.02, 0.36, p.cream, [0, 0.22, 0]);
  b.box(-2.12, 0.838, -3.28, 0.012, 0.012, 0.3, BRAND, [0, 0.5, 0]);
  b.cyl(-0.2, 0.86, -3.78, 0.045, 0.1, p.metal);
  b.box(-0.21, 0.94, -3.78, 0.012, 0.12, 0.012, p.brass, [0, 0, 0.2]);
  b.box(-0.19, 0.95, -3.77, 0.012, 0.14, 0.012, BRAND, [0.15, 0, -0.1]);

  // Desk lamp (the bulb glow is a separate emissive mesh)
  b.cyl(-2.45, 0.83, -3.72, 0.1, 0.025, p.metal);
  b.box(-2.45, 1.02, -3.72, 0.025, 0.4, 0.025, p.metal, [0, 0, -0.25]);
  b.box(-2.3, 1.27, -3.72, 0.3, 0.025, 0.025, p.metal, [0, 0, -0.35]);
  b.cone(-2.15, 1.27, -3.72, 0.11, 0.14, p.fabric, { rotation: [0, 0, 0.5] });

  // Waste bin beside the desk
  b.cyl(0.45, 0.17, -3.6, 0.12, 0.34, p.plastic, { top: 0.15 });
}

function chair(b, p) {
  b.group(-1.3, 0, -2.52, 0.3, (g) => {
    g.box(0, 0.07, 0, 0.62, 0.04, 0.07, p.metal);
    g.box(0, 0.07, 0, 0.07, 0.04, 0.62, p.metal);
    g.cyl(0, 0.26, 0, 0.035, 0.36, p.metal);
    g.box(0, 0.48, 0, 0.52, 0.09, 0.5, p.fabric);
    g.box(0, 0.86, 0.24, 0.5, 0.58, 0.08, p.fabricDark, [-0.1, 0, 0]);
    g.box(-0.29, 0.66, 0.02, 0.05, 0.04, 0.3, p.metal);
    g.box(0.29, 0.66, 0.02, 0.05, 0.04, 0.3, p.metal);
    g.box(-0.29, 0.58, 0.14, 0.04, 0.16, 0.04, p.metal);
    g.box(0.29, 0.58, 0.14, 0.04, 0.16, 0.04, p.metal);
  });
}

function leftWallDecor(b, p) {
  // Framed portrait (About)
  b.box(-3.97, 1.9, 0.1, 0.04, 1.02, 0.78, p.metal);
  b.box(-3.953, 1.9, 0.1, 0.03, 0.9, 0.66, p.cream);
  b.box(-3.935, 1.72, 0.1, 0.012, 0.3, 0.46, p.white);
  b.box(-3.935, 2.0, 0.1, 0.012, 0.24, 0.22, '#e8b99a');
  b.box(-3.93, 2.11, 0.1, 0.014, 0.1, 0.27, '#3a2618');
  b.box(-3.935, 1.5, 0.1, 0.012, 0.03, 0.4, BRAND);

  // Floor lamp
  b.cyl(-3.65, 0.015, -0.75, 0.17, 0.03, p.metal);
  b.cyl(-3.65, 0.82, -0.75, 0.018, 1.6, p.metal, { segments: 8 });
  b.cyl(-3.65, 1.72, -0.75, 0.21, 0.28, p.cream, { top: 0.13 });

  // Cabinet with the CV folder
  b.box(-3.71, 0.44, 1.35, 0.56, 0.84, 1.12, p.wood);
  b.box(-3.71, 0.875, 1.35, 0.6, 0.035, 1.16, p.woodDark);
  b.box(-3.425, 0.44, 1.07, 0.012, 0.74, 0.52, p.woodDark);
  b.box(-3.425, 0.44, 1.63, 0.012, 0.74, 0.52, p.woodDark);
  b.box(-3.41, 0.5, 1.3, 0.02, 0.1, 0.02, p.brass);
  b.box(-3.41, 0.5, 1.4, 0.02, 0.1, 0.02, p.brass);
  b.box(-3.68, 0.91, 1.42, 0.34, 0.03, 0.46, BRAND, [0, 0.12, 0]);
  b.box(-3.68, 0.93, 1.42, 0.28, 0.012, 0.4, p.white, [0, 0.2, 0]);
  b.box(-3.68, 0.94, 1.36, 0.16, 0.008, 0.012, p.plastic, [0, 0.2, 0]);
  b.box(-3.68, 0.94, 1.42, 0.2, 0.008, 0.012, p.plastic, [0, 0.2, 0]);
  // Upright file holder with folders
  b.box(-3.76, 1.0, 0.98, 0.26, 0.22, 0.2, p.metal);
  b.box(-3.76, 1.08, 0.93, 0.24, 0.3, 0.03, BRAND, [0.08, 0, 0]);
  b.box(-3.76, 1.07, 0.98, 0.24, 0.28, 0.03, p.cream, [0.04, 0, 0]);
  b.box(-3.76, 1.06, 1.03, 0.24, 0.26, 0.03, p.books[4]);
  plant(b, p, -3.72, 1.76, { pot: 0.08, height: 0.22, leaves: 5, potColor: p.pot });

  // Pinboard with sticky notes
  b.box(-3.975, 1.78, 1.35, 0.03, 0.66, 0.96, p.woodDark);
  b.box(-3.96, 1.78, 1.35, 0.02, 0.58, 0.88, p.cork);
  [
    [1.92, 1.05, 0],
    [1.9, 1.3, 1],
    [1.68, 1.12, 2],
    [1.64, 1.42, 3],
    [1.9, 1.6, 1],
    [1.66, 1.66, 0],
  ].forEach(([y, z, c], i) => b.box(-3.945, y, z, 0.008, 0.13, 0.13, p.notes[c], [(i % 3) * 0.08 - 0.08, 0, 0]));
  b.box(-3.945, 1.79, 1.52, 0.008, 0.16, 0.22, p.white, [0.05, 0, 0]);

  // Door (Journey)
  b.box(-3.975, 1.12, 3.0, 0.05, 2.26, 1.18, p.trim);
  b.box(-3.95, 1.08, 3.0, 0.05, 2.12, 1.02, p.door);
  b.box(-3.92, 1.6, 3.0, 0.012, 0.8, 0.74, p.woodDark);
  b.box(-3.92, 0.55, 3.0, 0.012, 0.74, 0.74, p.woodDark);
  b.ball(-3.89, 1.05, 2.6, 0.045, p.brass);

  // Backpack and sneakers by the door
  b.group(-3.7, 0, 2.2, 0.15, (g) => {
    g.box(0, 0.23, 0, 0.26, 0.46, 0.34, p.plastic);
    g.box(0.14, 0.16, 0, 0.05, 0.2, 0.24, BRAND);
    g.box(0, 0.47, 0, 0.2, 0.05, 0.28, p.metal);
    g.torus(0, 0.5, 0, 0.05, 0.012, p.metal, { arc: Math.PI, rotation: [0, Math.PI / 2, 0] });
  });
  [3.72, 3.86].forEach((z) => {
    b.box(-3.72, 0.045, z, 0.26, 0.09, 0.1, p.white);
    b.box(-3.78, 0.1, z, 0.13, 0.06, 0.1, p.white);
    b.box(-3.7, 0.05, z, 0.1, 0.03, 0.104, BRAND);
  });
}

function rightWallDecor(b, p) {
  // Window frame and sill with succulents (the sky is a separate emissive mesh)
  const cx = 2.7;
  const cy = 2.05;
  b.box(cx, cy + 0.74, -3.95, 1.72, 0.09, 0.1, p.cream);
  b.box(cx, cy - 0.74, -3.95, 1.72, 0.09, 0.1, p.cream);
  b.box(cx - 0.82, cy, -3.95, 0.09, 1.5, 0.1, p.cream);
  b.box(cx + 0.82, cy, -3.95, 0.09, 1.5, 0.1, p.cream);
  b.box(cx, cy, -3.95, 0.06, 1.5, 0.08, p.cream);
  b.box(cx, cy - 0.82, -3.86, 1.9, 0.05, 0.28, p.cream);
  [
    [-0.6, p.leafA],
    [-0.15, p.leafB],
    [0.35, p.leafC],
    [0.7, p.leafA],
  ].forEach(([dx, leaf], i) => {
    b.cyl(cx + dx, cy - 0.74, -3.85, 0.05, 0.1, i % 2 ? p.terracotta : p.pot, { top: 0.065 });
    b.sphere(cx + dx, cy - 0.64, -3.85, 0.075, leaf, { squash: [1, 0.9 + (i % 2) * 0.6, 1] });
  });

  // Frame of the GitHub activity panel (its screen is a separate emissive mesh)
  b.box(1.0, 1.75, -3.96, 1.12, 0.74, 0.05, p.metal);
  b.box(1.0, 1.34, -3.95, 0.3, 0.05, 0.04, p.metal);

  // Wall clock
  b.cyl(1.0, 2.72, -3.96, 0.2, 0.04, p.metal, { segments: 20, rotation: [Math.PI / 2, 0, 0] });
  b.cyl(1.0, 2.72, -3.94, 0.17, 0.02, p.cream, { segments: 20, rotation: [Math.PI / 2, 0, 0] });
  b.box(1.0, 2.76, -3.925, 0.014, 0.1, 0.008, p.metal);
  b.box(1.04, 2.72, -3.925, 0.1, 0.012, 0.008, BRAND);

  // Small wall shelf above the desk with a plant and a cassette-sized box
  b.box(-2.25, 1.95, -3.86, 0.8, 0.04, 0.24, p.wood);
  b.box(-2.55, 1.9, -3.93, 0.03, 0.1, 0.1, p.metal);
  b.box(-1.95, 1.9, -3.93, 0.03, 0.1, 0.1, p.metal);
  b.cyl(-2.48, 2.03, -3.85, 0.055, 0.12, p.pot, { top: 0.07 });
  b.sphere(-2.48, 2.15, -3.85, 0.1, p.leafB, { squash: [1, 0.8, 1] });
  b.sphere(-2.42, 2.2, -3.83, 0.06, p.leafA);
  b.box(-2.12, 2.03, -3.85, 0.05, 0.13, 0.18, p.books[3]);
  b.box(-2.06, 2.045, -3.85, 0.05, 0.16, 0.18, p.books[0]);
  b.box(-2.0, 2.03, -3.85, 0.05, 0.13, 0.18, p.books[4]);

  // Tall plant in the far corner
  plant(b, p, 3.45, -3.45, { pot: 0.26, height: 1.25, leaves: 9 });
}

function rightSide(b, p) {
  // Side table with the phone (Contact)
  b.cyl(3.25, 0.5, -1.5, 0.34, 0.045, p.wood, { segments: 18 });
  b.cyl(3.25, 0.25, -1.5, 0.04, 0.48, p.metal);
  b.cyl(3.25, 0.015, -1.5, 0.2, 0.03, p.metal, { segments: 16 });
  // Only the phone sits on the table, centred so nothing hides it from the camera.
  b.box(3.25, 0.534, -1.5, 0.13, 0.016, 0.25, p.metal, [0, 0.35, 0]);

  // Three instruments on stands in the front-right corner, turned toward the camera.
  instrument(b, p, 3.42, 0.95, Math.PI / 4 + 0.22, 'acoustic');
  instrument(b, p, 3.5, 1.85, Math.PI / 4, 'electric');
  instrument(b, p, 3.38, 2.75, Math.PI / 4 - 0.22, 'bass');
}

// A guitar leaning back on a stand. Local +z is the front of the instrument.
function instrument(b, p, x, z, turn, kind) {
  const lean = 0.18;
  const slope = Math.tan(lean);
  // z of the instrument's centre plane at height y, plus an optional offset toward its front.
  const zAt = (y, front = 0) => -(y - 0.12) * slope + front;
  const spec = {
    acoustic: { body: '#d9a86a', neck: p.woodDark, board: '#2a1a10', thick: 0.11, neckFrom: 0.7, neckTo: 1.24, tuners: 3 },
    electric: { body: p.fabric, neck: '#e2c48e', board: '#3a2618', thick: 0.05, neckFrom: 0.6, neckTo: 1.26, tuners: 6 },
    bass: { body: '#6b3f22', neck: '#c9a070', board: '#2a1a10', thick: 0.056, neckFrom: 0.62, neckTo: 1.46, tuners: 2 },
  }[kind];
  const t = spec.thick;
  const front = t / 2;

  b.group(x, 0, z, turn, (g) => {
    const disc = (y, r, depth, color, dx = 0, offset = 0) =>
      g.cyl(dx, y, zAt(y, offset), r, depth, color, { segments: 20, rotation: [Math.PI / 2 - lean, 0, 0] });
    const plate = (y, w, h, color, dx = 0, offset = front + 0.006, depth = 0.012) =>
      g.box(dx, y, zAt(y, offset), w, h, depth, color, [-lean, 0, 0]);

    // Stand: base, front cradle and back support
    g.box(0, 0.02, 0.02, 0.36, 0.03, 0.28, p.metal);
    g.box(0, 0.12, 0.08, 0.32, 0.03, 0.06, p.metal);
    g.box(0, 0.5, zAt(0.5, -front - 0.04), 0.025, 0.9, 0.025, p.metal, [-lean, 0, 0]);

    if (kind === 'acoustic') {
      disc(0.33, 0.205, t, spec.body);
      disc(0.47, 0.135, t, spec.body);
      disc(0.59, 0.158, t, spec.body);
      disc(0.52, 0.05, 0.014, '#20140c', 0, front + 0.002); // sound hole
      g.torus(0, 0.52, zAt(0.52, front + 0.008), 0.064, 0.007, spec.board, { rotation: [-lean, 0, 0] });
      plate(0.32, 0.13, 0.025, spec.board); // bridge
    } else {
      const big = kind === 'bass' ? 1.08 : 1;
      disc(0.33, 0.17 * big, t, spec.body);
      disc(0.5, 0.115 * big, t, spec.body, -0.05);
      disc(0.56, 0.055 * big, t, spec.body, 0.085 * big); // horn, leaves a cutaway between the bouts
      if (kind === 'electric') {
        disc(0.4, 0.115, 0.008, p.cream, 0.025, front + 0.002); // pickguard
        plate(0.36, 0.11, 0.028, '#16191a', 0, front + 0.012);
        plate(0.45, 0.11, 0.028, '#16191a', 0, front + 0.012);
        plate(0.28, 0.1, 0.02, p.metal);
        g.cyl(0.11, 0.27, zAt(0.27, front + 0.01), 0.018, 0.02, p.cream, { rotation: [Math.PI / 2 - lean, 0, 0] });
      } else {
        disc(0.42, 0.11, 0.008, '#16191a', 0.02, front + 0.002); // dark pickguard
        plate(0.4, 0.13, 0.035, p.cream, 0, front + 0.012);
        plate(0.28, 0.12, 0.022, p.metal);
      }
    }

    // Neck, fretboard, headstock and tuners
    const neckMid = (spec.neckFrom + spec.neckTo) / 2;
    const neckLen = spec.neckTo - spec.neckFrom;
    g.box(0, neckMid, zAt(neckMid), kind === 'bass' ? 0.06 : 0.055, neckLen, 0.035, spec.neck, [-lean, 0, 0]);
    plate(neckMid, kind === 'bass' ? 0.052 : 0.046, neckLen, spec.board, 0, 0.02, 0.008);
    const headY = spec.neckTo + 0.08;
    g.box(0, headY, zAt(headY), kind === 'electric' ? 0.075 : 0.09, 0.16, 0.03, kind === 'acoustic' ? spec.neck : spec.board, [-lean, 0, 0]);
    for (let i = 0; i < spec.tuners; i += 1) {
      if (kind === 'electric') {
        const ty = spec.neckTo + 0.02 + i * 0.022;
        g.box(0.05, ty, zAt(ty), 0.03, 0.012, 0.012, p.metal);
      } else {
        const ty = spec.neckTo + 0.04 + i * (kind === 'bass' ? 0.07 : 0.045);
        const size = kind === 'bass' ? 0.04 : 0.03;
        const metal = kind === 'bass' ? p.metal : p.brass;
        g.box(-0.062, ty, zAt(ty), size, 0.016, 0.016, metal);
        g.box(0.062, ty, zAt(ty), size, 0.016, 0.016, metal);
      }
    }
  });
}

export function buildRoomGeometry(p) {
  const b = createBuilder();

  // Floor slab and planks
  b.box(-0.075, -0.145, -0.075, 8.15, 0.21, 8.15, p.floorBase);
  for (let i = 0; i < 16; i += 1) {
    b.box(-3.75 + i * 0.5, -0.02, 0, 0.49, 0.04, 8, i % 2 ? p.floorA : p.floorB);
  }
  // Walls and baseboards. The walls rest on top of the slab (bottom at y = -0.04): if they reached
  // down into it, their end faces would share a plane with the slab sides and flicker (z-fighting).
  b.box(-4.075, 1.705, -0.075, 0.15, 3.49, 8.15, p.wallLeft);
  b.box(0, 1.705, -4.075, 8, 3.49, 0.15, p.wallRight);
  b.box(-3.985, 0.07, 0, 0.03, 0.14, 8, p.trim);
  b.box(0, 0.07, -3.985, 8, 0.14, 0.03, p.trim);

  bookshelf(b, p);
  desk(b, p);
  chair(b, p);
  leftWallDecor(b, p);
  rightWallDecor(b, p);
  rightSide(b, p);

  return b.build();
}
