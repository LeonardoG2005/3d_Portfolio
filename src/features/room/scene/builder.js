import {
  BoxGeometry,
  BufferAttribute,
  Color,
  ConeGeometry,
  CylinderGeometry,
  Euler,
  IcosahedronGeometry,
  Matrix4,
  Quaternion,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from 'three/webgpu';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Small helper to describe low-poly furniture with primitives and bake everything into ONE geometry
// with vertex colours. The whole static room then renders in a single draw call.
//
//   const b = createBuilder();
//   b.box(x, y, z, width, height, depth, '#885533');
//   b.group(x, y, z, rotationY, () => { ...shapes relative to the group... });
//   const geometry = b.build();
export function createBuilder() {
  const parts = [];
  const stack = [new Matrix4()];
  const color = new Color();
  const position = new Vector3();
  const quaternion = new Quaternion();
  const euler = new Euler();
  const scale = new Vector3(1, 1, 1);
  const local = new Matrix4();

  function add(geometry, x, y, z, hex, rotation) {
    euler.set(rotation?.[0] || 0, rotation?.[1] || 0, rotation?.[2] || 0);
    quaternion.setFromEuler(euler);
    local.compose(position.set(x, y, z), quaternion, scale);
    // Non-indexed geometry with recomputed normals gives the faceted low-poly look.
    const flat = geometry.index ? geometry.toNonIndexed() : geometry;
    if (flat !== geometry) geometry.dispose();
    flat.applyMatrix4(local.premultiply(stack[stack.length - 1]));
    flat.computeVertexNormals();
    color.set(hex);
    const count = flat.attributes.position.count;
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    flat.setAttribute('color', new BufferAttribute(colors, 3));
    flat.deleteAttribute('uv');
    parts.push(flat);
  }

  const api = {
    box(x, y, z, w, h, d, hex, rotation) {
      add(new BoxGeometry(w, h, d), x, y, z, hex, rotation);
      return api;
    },
    // Cylinder along the y axis. radiusTop defaults to radius.
    cyl(x, y, z, radius, height, hex, { top = radius, segments = 12, rotation } = {}) {
      add(new CylinderGeometry(top, radius, height, segments), x, y, z, hex, rotation);
      return api;
    },
    cone(x, y, z, radius, height, hex, { segments = 10, rotation } = {}) {
      add(new ConeGeometry(radius, height, segments), x, y, z, hex, rotation);
      return api;
    },
    sphere(x, y, z, radius, hex, { squash = [1, 1, 1], detail = 1 } = {}) {
      const geometry = new IcosahedronGeometry(radius, detail);
      geometry.scale(squash[0], squash[1], squash[2]);
      add(geometry, x, y, z, hex);
      return api;
    },
    ball(x, y, z, radius, hex) {
      add(new SphereGeometry(radius, 14, 10), x, y, z, hex);
      return api;
    },
    torus(x, y, z, radius, tube, hex, { arc = Math.PI * 2, rotation } = {}) {
      add(new TorusGeometry(radius, tube, 6, 14, arc), x, y, z, hex, rotation);
      return api;
    },
    // Runs fn with a local origin and rotation around y.
    group(x, y, z, rotationY, fn) {
      const matrix = new Matrix4().compose(
        new Vector3(x, y, z),
        new Quaternion().setFromEuler(new Euler(0, rotationY, 0)),
        new Vector3(1, 1, 1),
      );
      stack.push(stack[stack.length - 1].clone().multiply(matrix));
      fn(api);
      stack.pop();
      return api;
    },
    build() {
      const merged = mergeGeometries(parts, false);
      parts.forEach((part) => part.dispose());
      parts.length = 0;
      return merged;
    },
  };
  return api;
}

// Deterministic pseudo-random numbers so the room looks the same on every visit.
export function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
