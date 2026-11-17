import { useEffect, useRef } from 'react';
import { COVER_TRANSITION, createProgram } from '../../components/motion/shaders.js';
import { gsap, prefersReducedMotion } from '../../lib/gsap.js';

const WIDTH = 960;
const HEIGHT = 600;

// Picture used when a project has no screenshot yet: its name on the page colours with an accent bar.
function drawPlaceholder(item) {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext('2d');
  const style = getComputedStyle(document.documentElement);
  context.fillStyle = style.getPropertyValue('--raised').trim() || '#18201b';
  context.fillRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = item.accent;
  context.fillRect(64, 64, 96, 10);
  context.fillStyle = style.getPropertyValue('--text').trim() || '#eef2ec';
  context.font = "500 84px 'Space Grotesk Variable', sans-serif";
  context.textBaseline = 'bottom';
  const words = item.name.split(' ');
  words.forEach((word, index) => context.fillText(word, 60, HEIGHT - 60 - (words.length - 1 - index) * 88));
  return canvas;
}

// Floating picture that follows the pointer over the project list. When the hovered project changes,
// the old cover dissolves into the new one through a noise-edged shader wipe.
export default function CoverPreview({ items, active }) {
  const boxRef = useRef(null);
  const canvasRef = useRef(null);
  const api = useRef(null);

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) return undefined;

    let program;
    let buffer;
    try {
      ({ program, buffer } = createProgram(gl, COVER_TRANSITION));
    } catch {
      return undefined;
    }
    const still = prefersReducedMotion();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round(canvas.clientHeight * ratio);
    gl.viewport(0, 0, canvas.width, canvas.height);
    const frameAspect = canvas.width / canvas.height;

    const locate = (name) => gl.getUniformLocation(program, name);
    const uniforms = {
      from: locate('u_from'),
      to: locate('u_to'),
      fromScale: locate('u_fromScale'),
      toScale: locate('u_toScale'),
      progress: locate('u_progress'),
      seed: locate('u_seed'),
    };
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const state = { from: 0, to: 0, progress: 1, shown: false, seed: 0 };
    let disposed = false;

    const render = () => {
      if (disposed) return;
      const bind = (unit, index, sampler, scale) => {
        const texture = textures[index];
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, texture.handle);
        gl.uniform1i(sampler, unit);
        // Same result as CSS object-fit: cover.
        if (texture.aspect > frameAspect) gl.uniform2f(scale, frameAspect / texture.aspect, 1);
        else gl.uniform2f(scale, 1, texture.aspect / frameAspect);
      };
      bind(0, state.from, uniforms.from, uniforms.fromScale);
      bind(1, state.to, uniforms.to, uniforms.toScale);
      gl.uniform1f(uniforms.progress, state.progress);
      gl.uniform1f(uniforms.seed, state.seed);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const upload = (texture, source) => {
      if (disposed) return;
      gl.bindTexture(gl.TEXTURE_2D, texture.handle);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      texture.aspect = source.width / source.height;
      render();
    };

    const textures = items.map((item) => {
      const handle = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, handle);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      const texture = { handle, aspect: WIDTH / HEIGHT };
      const usePlaceholder = () => document.fonts.ready.then(() => upload(texture, drawPlaceholder(item)));
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([24, 32, 27, 255]));
      if (item.src) {
        const image = new Image();
        image.onload = () => upload(texture, image);
        image.onerror = usePlaceholder;
        image.src = item.src;
      } else {
        usePlaceholder();
      }
      return texture;
    });

    // Position: a little to the right of the pointer, kept inside the window.
    gsap.set(box, { x: window.innerWidth * 0.55, y: window.innerHeight * 0.3, autoAlpha: 0, scale: 0.8 });
    const follow = { duration: still ? 0 : 0.7, ease: 'power3.out' };
    const moveX = gsap.quickTo(box, 'x', follow);
    const moveY = gsap.quickTo(box, 'y', follow);
    const onMove = (event) => {
      const width = box.offsetWidth;
      const height = box.offsetHeight;
      moveX(Math.min(Math.max(event.clientX + 36, window.innerWidth * 0.4), window.innerWidth - width - 16));
      moveY(Math.min(Math.max(event.clientY - height / 2, 80), window.innerHeight - height - 16));
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    let tween;
    api.current = (index) => {
      if (index < 0) {
        state.shown = false;
        gsap.to(box, { autoAlpha: 0, scale: 0.8, duration: 0.35, ease: 'power2.in', overwrite: 'auto' });
        return;
      }
      tween?.kill();
      if (!state.shown || still) {
        state.from = index;
        state.to = index;
        state.progress = 1;
        render();
      } else if (index !== state.to) {
        state.from = state.to;
        state.to = index;
        state.progress = 0;
        state.seed = Math.random() * 10;
        tween = gsap.to(state, { progress: 1, duration: 0.9, ease: 'power2.out', onUpdate: render });
      }
      state.shown = true;
      gsap.to(box, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'expo.out', overwrite: 'auto' });
    };

    return () => {
      disposed = true;
      api.current = null;
      tween?.kill();
      gsap.killTweensOf(box);
      window.removeEventListener('pointermove', onMove);
      textures.forEach((texture) => gl.deleteTexture(texture.handle));
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [items]);

  useEffect(() => {
    api.current?.(active);
  }, [active]);

  return (
    <div
      ref={boxRef}
      aria-hidden="true"
      className="pointer-events-none invisible fixed left-0 top-0 z-30 aspect-[16/10] w-[27rem] overflow-hidden rounded-2xl shadow-[0_30px_80px_-20px_rgb(0_0_0/0.55)]"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
