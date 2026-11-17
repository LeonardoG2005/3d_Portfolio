// GLSL for the background scene. WebGL 1 syntax so it runs everywhere.

// Shared camera: a position, a small yaw/pitch that follows the pointer, and a perspective projection.
const CAMERA = `
uniform vec3 u_cam;
uniform vec2 u_view; // yaw, pitch
uniform vec2 u_proj; // focal length, aspect ratio
vec3 toView(vec3 world) {
  vec3 p = world - u_cam;
  float cy = cos(u_view.x), sy = sin(u_view.x);
  p = vec3(cy * p.x + sy * p.z, p.y, -sy * p.x + cy * p.z);
  float cp = cos(u_view.y), sp = sin(u_view.y);
  return vec3(p.x, cp * p.y - sp * p.z, sp * p.y + cp * p.z);
}
vec4 toClip(vec3 v) {
  // near 0.1, far 200
  return vec4(v.x * u_proj.x / u_proj.y, v.y * u_proj.x, (v.z * 200.1 + 40.0) / -199.9, -v.z);
}
`;

// 3D simplex noise (Ian McEwan, Ashima Arts, MIT licence).
const SIMPLEX = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

const VALUE_NOISE = `
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.02 + vec2(17.0, 9.0); a *= 0.5; }
  return v;
}
`;

export const QUAD_VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

// Nebula: the slow green-to-violet aurora, drawn small and stretched over the screen.
// It slides with the scroll, leans toward the pointer, and each page sets how strong it is.
export const NEBULA_FRAG = `
precision mediump float;
${VALUE_NOISE}
varying vec2 v_uv;
uniform float u_time;
uniform float u_aspect;
uniform vec2 u_mouse;
uniform float u_dark;
uniform float u_amount;
uniform float u_shift;
void main() {
  vec2 p = v_uv;
  p.x *= u_aspect;
  p.y += u_shift;
  float t = u_time * 0.05;
  vec2 q = vec2(fbm(p * 1.3 + t), fbm(p * 1.3 + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p * 1.6 + q * 2.0 + vec2(1.7, 9.2) + t * 0.7), fbm(p * 1.6 + q * 2.0 + vec2(8.3, 2.8) - t * 0.5));
  float f = fbm(p * 1.2 + r * 2.2 + (u_mouse - 0.5) * 0.5);
  vec3 bg = mix(vec3(0.965, 0.957, 0.933), vec3(0.043, 0.059, 0.047), u_dark);
  vec3 green = mix(vec3(0.0, 0.66, 0.2), vec3(0.0, 0.6, 0.16), u_dark);
  vec3 violet = mix(vec3(0.5, 0.4, 0.92), vec3(0.42, 0.31, 0.85), u_dark);
  float g = smoothstep(0.3, 0.8, f) * smoothstep(0.1, 0.9, r.x);
  float v = smoothstep(0.4, 0.9, fbm(p * 1.1 - r * 1.8 + 3.0)) * smoothstep(0.2, 1.0, q.y);
  float strength = 0.62 * u_amount;
  vec3 col = bg;
  col = mix(col, green, g * strength);
  col = mix(col, violet, v * strength * 0.85);
  gl_FragColor = vec4(col, 1.0);
}
`;

// Copies the small nebula picture to the screen with a little dither so dark gradients do not band.
export const BLIT_FRAG = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_tex;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec3 col = texture2D(u_tex, v_uv).rgb;
  col += (hash(gl_FragCoord.xy) - 0.5) / 110.0;
  gl_FragColor = vec4(col, 1.0);
}
`;

// Stars: points in a deep box in front of the camera. They drift sideways, twinkle,
// and repeat vertically so the field never runs out while the page scrolls.
export const STAR_VERT = `
${CAMERA}
attribute vec4 a_pos;  // position + twinkle phase
attribute vec2 a_look; // size, tint
uniform float u_time;
uniform float u_px;
varying float v_alpha;
varying float v_tint;
void main() {
  vec3 p = a_pos.xyz;
  p.x = mod(p.x + u_time * 0.12 + 60.0, 120.0) - 60.0;
  p.y = mod(p.y - u_cam.y + 45.0, 90.0) - 45.0 + u_cam.y;
  vec3 v = toView(p);
  gl_Position = toClip(v);
  float dist = max(-v.z, 0.1);
  float twinkle = 0.62 + 0.38 * sin(u_time * (0.5 + a_look.y * 1.9) + a_pos.w);
  gl_PointSize = clamp(a_look.x * u_px * 30.0 / dist, 1.0, 7.0 * u_px);
  v_alpha = twinkle * smoothstep(78.0, 40.0, dist) * smoothstep(5.0, 11.0, dist);
  v_tint = a_look.y;
}
`;

export const STAR_FRAG = `
precision mediump float;
uniform float u_dark;
varying float v_alpha;
varying float v_tint;
void main() {
  float a = smoothstep(0.5, 0.08, length(gl_PointCoord - 0.5));
  float green = step(0.78, v_tint) * (1.0 - step(0.9, v_tint));
  float violet = step(0.9, v_tint);
  vec3 night = mix(vec3(0.92, 0.96, 0.93), vec3(0.42, 1.0, 0.62), green);
  night = mix(night, vec3(0.74, 0.64, 1.0), violet);
  vec3 day = mix(vec3(0.1, 0.16, 0.12), vec3(0.0, 0.45, 0.14), green);
  day = mix(day, vec3(0.36, 0.26, 0.74), violet);
  gl_FragColor = vec4(mix(day, night, u_dark), a * v_alpha * mix(0.42, 0.9, u_dark));
}
`;

// Wireframe solids: hairline polyhedra that tumble slowly at different depths.
export const WIRE_VERT = `
${CAMERA}
attribute vec3 a_pos;
uniform vec3 u_center;
uniform float u_scale;
uniform vec2 u_spin;
varying float v_fade;
void main() {
  vec3 p = a_pos * u_scale;
  float cx = cos(u_spin.x), sx = sin(u_spin.x);
  p = vec3(p.x, cx * p.y - sx * p.z, sx * p.y + cx * p.z);
  float cy = cos(u_spin.y), sy = sin(u_spin.y);
  p = vec3(cy * p.x + sy * p.z, p.y, -sy * p.x + cy * p.z);
  vec3 v = toView(p + u_center);
  gl_Position = toClip(v);
  v_fade = smoothstep(26.0, 9.0, -v.z);
}
`;

export const WIRE_FRAG = `
precision mediump float;
uniform vec4 u_color;
varying float v_fade;
void main() {
  gl_FragColor = vec4(u_color.rgb, u_color.a * v_fade);
}
`;

// Orbs: a port of the reference scene's distorting spheres (drei's MeshDistortMaterial).
// The distortion is the same formula: the vertex is pushed along its own direction by
// simplex noise sampled at position / 2, scaled by distort squared.
// As in the reference, the normals are those of the plain sphere, not of the deformed surface,
// which is why the result reads as a flat moving silhouette rather than a lit 3D object.
export const ORB_VERT = `
${CAMERA}
${SIMPLEX}
attribute vec3 a_pos;    // point on a unit sphere
uniform vec3 u_center;
uniform float u_size;    // radius on screen, in scene units
uniform float u_radius;  // radius of the sphere in the reference scene
uniform float u_amount;  // distort * distort
uniform float u_time;
uniform vec3 u_spin;     // rotation around x, y, z
varying vec3 v_normal;
varying vec3 v_world;
vec3 spin(vec3 p) {
  float cz = cos(u_spin.z), sz = sin(u_spin.z);
  p = vec3(cz * p.x - sz * p.y, sz * p.x + cz * p.y, p.z);
  float cy = cos(u_spin.y), sy = sin(u_spin.y);
  p = vec3(cy * p.x + sy * p.z, p.y, -sy * p.x + cy * p.z);
  float cx = cos(u_spin.x), sx = sin(u_spin.x);
  return vec3(p.x, cx * p.y - sx * p.z, sx * p.y + cx * p.z);
}
void main() {
  float n = snoise(a_pos * u_radius / 2.0 + vec3(u_time));
  vec3 moved = a_pos * (n * u_amount + 1.0);
  v_normal = spin(a_pos);
  v_world = u_center + spin(moved) * u_size;
  gl_Position = toClip(toView(v_world));
}
`;

// The reference material is black metal under one distant light: in practice a pure black shape
// with the faintest grey sheen on the edge that faces the light. On the light theme the same flat
// shape is white, so the dark text of the page stays readable on top of it.
export const ORB_FRAG = `
precision mediump float;
uniform vec3 u_eye;
uniform float u_dark;
varying vec3 v_normal;
varying vec3 v_world;
void main() {
  vec3 n = normalize(v_normal);
  vec3 v = normalize(u_eye - v_world);
  float edge = pow(1.0 - clamp(abs(dot(n, v)), 0.0, 1.0), 4.0);
  float lit = max(dot(n, normalize(vec3(1.0, 1.0, 1.0))), 0.0); // the reference light sits at (10, 10, 10)
  vec3 night = vec3(0.085, 0.09, 0.085) * edge * lit;
  vec3 day = vec3(1.0) - vec3(0.03, 0.025, 0.035) * edge * (1.0 - lit);
  gl_FragColor = vec4(mix(day, night, u_dark), 1.0);
}
`;
