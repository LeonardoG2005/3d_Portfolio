import { WIRE_SHAPES, icosphere } from './geometry.js';
import { ORBS } from './presets.js';
import {
  BLIT_FRAG,
  NEBULA_FRAG,
  ORB_FRAG,
  ORB_VERT,
  QUAD_VERT,
  STAR_FRAG,
  STAR_VERT,
  WIRE_FRAG,
  WIRE_VERT,
} from './shaders.js';

// Camera: looks down -z from z = CAM_Z; the orbs live at z = 0.
const FOV = (50 * Math.PI) / 180;
const FOCAL = 1 / Math.tan(FOV / 2);
const CAM_Z = 6;
const HALF_H = Math.tan(FOV / 2) * CAM_Z; // half the visible height at z = 0, in world units
const PARALLAX = HALF_H * 2 * 0.3; // stars and wireframes move at 30% of the page's scroll speed
// One orb unit on screen: the large orb (radius 2) is as tall as the window.
const UNIT = HALF_H / 2;
const GROUP_FIELDS = ['x', 'y', 's'];

function compile(gl, vertex, fragment, attributes) {
  const shader = (type, source) => {
    const handle = gl.createShader(type);
    gl.shaderSource(handle, source);
    gl.compileShader(handle);
    if (!gl.getShaderParameter(handle, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(handle));
    return handle;
  };
  const program = gl.createProgram();
  const vs = shader(gl.VERTEX_SHADER, vertex);
  const fs = shader(gl.FRAGMENT_SHADER, fragment);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  attributes.forEach((name, index) => gl.bindAttribLocation(program, index, name));
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  const uniforms = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let index = 0; index < count; index += 1) {
    const { name } = gl.getActiveUniform(program, index);
    uniforms[name] = gl.getUniformLocation(program, name);
  }
  return { program, uniforms };
}

// Starts the background scene on a canvas. Returns null when WebGL is not available.
//   setPreset(preset)  move toward another page's arrangement
//   destroy()          stop and free everything
export function createCosmos(canvas, { reduced = false } = {}) {
  const small = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;
  const gl = canvas.getContext('webgl', { antialias: true, alpha: false, depth: true, stencil: false });
  if (!gl) return null;

  let programs;
  try {
    programs = {
      nebula: compile(gl, QUAD_VERT, NEBULA_FRAG, ['a_pos']),
      blit: compile(gl, QUAD_VERT, BLIT_FRAG, ['a_pos']),
      stars: compile(gl, STAR_VERT, STAR_FRAG, ['a_pos', 'a_look']),
      wires: compile(gl, WIRE_VERT, WIRE_FRAG, ['a_pos']),
      orbs: compile(gl, ORB_VERT, ORB_FRAG, ['a_pos']),
    };
  } catch (error) {
    if (import.meta.env.DEV) console.error('[cosmos] shader error', error);
    return null;
  }

  const buffer = (target, data) => {
    const handle = gl.createBuffer();
    gl.bindBuffer(target, handle);
    gl.bufferData(target, data, gl.STATIC_DRAW);
    return handle;
  };

  const quad = buffer(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]));

  const starCount = small ? 3200 : 7000;
  const starData = new Float32Array(starCount * 6);
  for (let index = 0; index < starCount; index += 1) {
    const offset = index * 6;
    starData[offset] = (Math.random() - 0.5) * 120;
    starData[offset + 1] = (Math.random() - 0.5) * 90;
    starData[offset + 2] = -3 - Math.random() * 68;
    starData[offset + 3] = Math.random() * Math.PI * 2;
    starData[offset + 4] = 0.8 + Math.random() ** 3 * 2.4;
    starData[offset + 5] = Math.random();
  }
  const stars = buffer(gl.ARRAY_BUFFER, starData);

  const sphere = icosphere(small ? 4 : 5);
  const spherePositions = buffer(gl.ARRAY_BUFFER, sphere.positions);
  const sphereIndices = buffer(gl.ELEMENT_ARRAY_BUFFER, sphere.indices);

  const wireBuffers = WIRE_SHAPES.map((lines) => ({ handle: buffer(gl.ARRAY_BUFFER, lines), count: lines.length / 3 }));
  const wires = Array.from({ length: small ? 8 : 15 }, (_, index) => ({
    shape: index % wireBuffers.length,
    x: (Math.random() - 0.5) * 2, // -1..1 across the width at its depth
    y: (Math.random() - 0.5) * 22,
    z: -1.5 - Math.random() * 10,
    scale: 0.22 + Math.random() * 0.5,
    speed: 0.12 + Math.random() * 0.3,
    phase: Math.random() * 20,
    violet: index % 3 === 0,
  }));

  // Low resolution target for the nebula.
  const nebula = { texture: gl.createTexture(), frame: gl.createFramebuffer(), width: 0, height: 0, ok: true };
  gl.bindTexture(gl.TEXTURE_2D, nebula.texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // Where the group of orbs sits and how large it is; it glides between pages.
  const group = { current: null, target: null };
  const state = {
    nebula: 0.3,
    nebulaTarget: 0.3,
    wires: 0.6,
    wiresTarget: 0.6,
    dark: document.documentElement.dataset.theme === 'dark' ? 1 : 0,
    scroll: reduced ? 0 : window.scrollY,
    scrollMax: 0,
    mouseX: 0.5,
    mouseY: 0.5,
    targetX: 0.5,
    targetY: 0.5,
    width: 0,
    height: 0,
    ratio: 1,
    started: false,
  };
  let frame = 0;
  let last = performance.now();
  let measuredAt = 0;
  let lost = false;
  let disposed = false;
  const clock = { time: 20 };

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.5);
    const width = Math.max(2, Math.round(canvas.clientWidth * ratio));
    const height = Math.max(2, Math.round(canvas.clientHeight * ratio));
    if (width === state.width && height === state.height) return;
    state.width = width;
    state.height = height;
    state.ratio = ratio;
    canvas.width = width;
    canvas.height = height;

    const divide = small ? 5 : 4;
    nebula.width = Math.max(2, Math.round(width / divide));
    nebula.height = Math.max(2, Math.round(height / divide));
    gl.bindTexture(gl.TEXTURE_2D, nebula.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, nebula.width, nebula.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, nebula.frame);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, nebula.texture, 0);
    nebula.ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };

  const camera = (uniforms, camY, aspect) => {
    gl.uniform3f(uniforms.u_cam, 0, camY, CAM_Z);
    gl.uniform2f(uniforms.u_view, (state.mouseX - 0.5) * 0.09, (state.mouseY - 0.5) * 0.06);
    gl.uniform2f(uniforms.u_proj, FOCAL, aspect);
  };
  const attribute = (handle, index, size, stride = 0, offset = 0) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, handle);
    gl.enableVertexAttribArray(index);
    gl.vertexAttribPointer(index, size, gl.FLOAT, false, stride, offset);
  };

  const draw = (dt) => {
    if (lost || disposed) return;
    resize();
    const ease = (rate) => (reduced ? 1 : 1 - Math.exp(-dt * rate));
    const viewport = window.innerHeight || 1;
    const aspect = state.width / state.height;
    const halfW = HALF_H * aspect;

    // Theme, pointer, scroll and page arrangement all glide toward their targets.
    const darkTarget = document.documentElement.dataset.theme === 'dark' ? 1 : 0;
    state.dark += (darkTarget - state.dark) * ease(9);
    state.mouseX += (state.targetX - state.mouseX) * ease(2.5);
    state.mouseY += (state.targetY - state.mouseY) * ease(2.5);
    const scrollTarget = reduced ? 0 : window.scrollY;
    state.scroll += (scrollTarget - state.scroll) * ease(7);
    state.nebula += (state.nebulaTarget - state.nebula) * ease(2.2);
    state.wires += (state.wiresTarget - state.wires) * ease(2.2);
    if (group.target) {
      for (const field of GROUP_FIELDS) group.current[field] += (group.target[field] - group.current[field]) * ease(2.4);
    }

    const time = clock.time;
    const camY = -(state.scroll / viewport) * PARALLAX;

    // 1. Nebula into its small target, then stretched over the screen. This also paints the page colour.
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.disable(gl.CULL_FACE);
    if (nebula.ok) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, nebula.frame);
      gl.viewport(0, 0, nebula.width, nebula.height);
      gl.useProgram(programs.nebula.program);
      const u = programs.nebula.uniforms;
      gl.uniform1f(u.u_time, time);
      gl.uniform1f(u.u_aspect, aspect);
      gl.uniform2f(u.u_mouse, state.mouseX, state.mouseY);
      gl.uniform1f(u.u_dark, state.dark);
      gl.uniform1f(u.u_amount, state.nebula);
      gl.uniform1f(u.u_shift, camY * 0.06);
      attribute(quad, 0, 2);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, state.width, state.height);
      gl.useProgram(programs.blit.program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, nebula.texture);
      gl.uniform1i(programs.blit.uniforms.u_tex, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      gl.viewport(0, 0, state.width, state.height);
      const mix = (day, night) => day + (night - day) * state.dark;
      gl.clearColor(mix(0.965, 0.043), mix(0.957, 0.059), mix(0.933, 0.047), 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    // 2. Stars: they add light at night and sit as ink specks by day.
    gl.enable(gl.BLEND);
    if (state.dark > 0.5) gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    {
      gl.useProgram(programs.stars.program);
      const u = programs.stars.uniforms;
      camera(u, camY, aspect);
      gl.uniform1f(u.u_time, time);
      gl.uniform1f(u.u_px, state.ratio);
      gl.uniform1f(u.u_dark, state.dark);
      attribute(stars, 0, 4, 24, 0);
      attribute(stars, 1, 2, 24, 16);
      gl.drawArrays(gl.POINTS, 0, starCount);
      gl.disableVertexAttribArray(1);
    }

    // 3. Wireframe solids.
    if (state.wires > 0.01) {
      gl.useProgram(programs.wires.program);
      const u = programs.wires.uniforms;
      camera(u, camY, aspect);
      for (const wire of wires) {
        const depth = CAM_Z - wire.z;
        const reach = (depth / CAM_Z) * halfW * 1.15;
        const drift = time * wire.speed;
        // Repeats vertically around the camera so there are always some in view.
        const y = ((((wire.y - camY + 11) % 22) + 22) % 22) - 11 + camY;
        gl.uniform3f(u.u_center, wire.x * reach + Math.cos(drift + wire.phase) * 0.3, y + Math.sin(drift * 0.8 + wire.phase) * 0.3, wire.z);
        gl.uniform1f(u.u_scale, wire.scale);
        gl.uniform2f(u.u_spin, drift * 0.9 + wire.phase, drift * 1.1);
        const strength = state.wires * (state.dark > 0.5 ? 0.42 : 0.3) * (small ? 0.65 : 1);
        if (wire.violet) gl.uniform4f(u.u_color, 0.55, 0.45, 1, strength);
        else if (state.dark > 0.5) gl.uniform4f(u.u_color, 0.3, 0.95, 0.5, strength);
        else gl.uniform4f(u.u_color, 0, 0.42, 0.13, strength);
        const shape = wireBuffers[wire.shape];
        attribute(shape.handle, 0, 3);
        gl.drawArrays(gl.LINES, 0, shape.count);
      }
    }

    // 4. Orbs, drawn over everything else.
    if (group.current) {
      gl.disable(gl.BLEND);
      // Depth testing keeps the near side of each orb on top of its far side.
      gl.enable(gl.DEPTH_TEST);
      gl.clear(gl.DEPTH_BUFFER_BIT);
      gl.useProgram(programs.orbs.program);
      const u = programs.orbs.uniforms;
      camera(u, camY, aspect);
      gl.uniform3f(u.u_eye, 0, camY, CAM_Z);
      gl.uniform1f(u.u_dark, state.dark);
      attribute(spherePositions, 0, 3);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndices);

      // On tall, narrow screens the group shrinks so the large orb is not wider than the window,
      // and the small orbs travel less far sideways.
      const unit = UNIT * group.current.s * Math.min(1, aspect * 1.15);
      const spread = Math.min(1, aspect / 1.6);
      // The group rises a little as the page is read, so it is never left behind.
      const progress = state.scrollMax > 0 ? Math.min(1, state.scroll / state.scrollMax) : 0.5;
      const originX = group.current.x * halfW;
      const originY = camY + group.current.y * HALF_H + (progress - 0.5) * 0.6 * HALF_H;

      for (const orb of ORBS) {
        const [px, py] = orb.position(time);
        const [rx, ry, rz] = orb.rotation(time);
        // Slow bob whose height is its intensity.
        const bob = (Math.sin((time / 4) * orb.float.speed) / 10) * orb.float.intensity;
        gl.uniform3f(u.u_center, originX + px * unit * spread, originY + (py + bob) * unit, 0);
        gl.uniform1f(u.u_size, orb.radius * orb.scale * unit);
        gl.uniform1f(u.u_radius, orb.radius);
        gl.uniform1f(u.u_amount, orb.distort * orb.distort);
        gl.uniform1f(u.u_time, (time * orb.speed) / 10);
        gl.uniform3f(u.u_spin, rx, ry, rz);
        gl.drawElements(gl.TRIANGLES, sphere.indices.length, gl.UNSIGNED_SHORT, 0);
      }
    }
  };

  const measure = () => {
    state.scrollMax = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  };

  const loop = (now) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    clock.time += dt;
    // The page height changes while lazy content arrives, so it is read again now and then.
    if (now - measuredAt > 400) {
      measuredAt = now;
      measure();
    }
    draw(dt);
    frame = requestAnimationFrame(loop);
  };
  const still = () => {
    measure();
    draw(1);
  };
  const update = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    if (lost || disposed) return;
    if (reduced) still();
    else if (!document.hidden) {
      last = performance.now();
      frame = requestAnimationFrame(loop);
    }
  };

  const onMove = (event) => {
    state.targetX = event.clientX / window.innerWidth;
    state.targetY = 1 - event.clientY / window.innerHeight;
  };
  const onLost = (event) => {
    event.preventDefault();
    lost = true;
    cancelAnimationFrame(frame);
    canvas.style.visibility = 'hidden'; // the plain page colour shows instead
  };
  const themeObserver = new MutationObserver(() => reduced && still());
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if (!reduced) window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('resize', update);
  document.addEventListener('visibilitychange', update);
  canvas.addEventListener('webglcontextlost', onLost);

  return {
    setPreset(preset) {
      if (!preset) return;
      state.nebulaTarget = preset.nebula;
      state.wiresTarget = preset.wires;
      group.target = { x: preset.x, y: preset.y, s: preset.s };
      // The first arrangement appears in place; later ones are glided to.
      if (!group.current) group.current = { ...group.target };
      if (!state.started) {
        state.started = true;
        state.nebula = preset.nebula;
        state.wires = preset.wires;
      }
      measuredAt = 0;
      update();
    },
    destroy() {
      disposed = true;
      cancelAnimationFrame(frame);
      themeObserver.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', update);
      document.removeEventListener('visibilitychange', update);
      canvas.removeEventListener('webglcontextlost', onLost);
      [quad, stars, spherePositions, sphereIndices, ...wireBuffers.map((item) => item.handle)].forEach((handle) => gl.deleteBuffer(handle));
      gl.deleteTexture(nebula.texture);
      gl.deleteFramebuffer(nebula.frame);
      Object.values(programs).forEach((item) => gl.deleteProgram(item.program));
    },
  };
}
