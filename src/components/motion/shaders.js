// GLSL for the project cover preview. WebGL 1 syntax so it runs everywhere.
// The background scene has its own shaders in src/features/cosmos.
const NOISE = `
precision mediump float;
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

// Noise-edged wipe between two images with a little displacement, used by the project cover preview.
export const COVER_TRANSITION = `${NOISE}
varying vec2 v_uv;
uniform sampler2D u_from;
uniform sampler2D u_to;
uniform vec2 u_fromScale;
uniform vec2 u_toScale;
uniform float u_progress;
uniform float u_seed;
vec2 cover(vec2 uv, vec2 s) { return (uv - 0.5) * s + 0.5; }
void main() {
  float n = fbm(v_uv * 3.0 + u_seed);
  float p = u_progress;
  vec2 d = vec2(n - 0.5, fbm(v_uv * 3.0 - u_seed) - 0.5) * 0.28;
  vec4 a = texture2D(u_from, cover(v_uv + d * p, u_fromScale));
  vec4 b = texture2D(u_to, cover(v_uv - d * (1.0 - p), u_toScale));
  float edge = n * 0.6 + v_uv.x * 0.4;
  float k = smoothstep(edge - 0.15, edge + 0.15, p * 1.3 - 0.15);
  gl_FragColor = mix(a, b, k);
}
`;

export const VERTEX = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

export function createProgram(gl, fragment) {
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(message);
    }
    return shader;
  };
  const program = gl.createProgram();
  const vs = compile(gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl.FRAGMENT_SHADER, fragment);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));

  // One triangle that covers the whole clip space.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const location = gl.getAttribLocation(program, 'a_pos');
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
  gl.useProgram(program);
  return { program, buffer };
}
