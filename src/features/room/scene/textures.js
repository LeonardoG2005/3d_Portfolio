import { CanvasTexture, SRGBColorSpace } from 'three/webgpu';
import { seeded } from './builder.js';

function finish(canvas) {
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function canvas2d(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return [canvas, canvas.getContext('2d')];
}

// Fake code editor for the monitors.
export function codeScreenTexture(seed = 1) {
  const [canvas, ctx] = canvas2d(512, 300);
  const rand = seeded(seed);
  ctx.fillStyle = '#0c120e';
  ctx.fillRect(0, 0, 512, 300);
  ctx.fillStyle = '#141d17';
  ctx.fillRect(0, 0, 512, 26);
  ['#e0605a', '#e0b24a', '#2fce5b'].forEach((hex, i) => {
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.arc(16 + i * 16, 13, 4.5, 0, Math.PI * 2);
    ctx.fill();
  });
  const colors = ['#2fce5b', '#8fd9a8', '#e6dfcc', '#d9a441', '#6fb7e0', '#5c6b62'];
  let indent = 0;
  for (let line = 0; line < 15; line += 1) {
    const y = 44 + line * 17;
    ctx.fillStyle = '#34423a';
    ctx.fillRect(12, y, 12, 6);
    if (rand() > 0.72) indent = Math.min(3, indent + 1);
    else if (rand() > 0.7) indent = Math.max(0, indent - 1);
    let x = 40 + indent * 22;
    const words = 1 + Math.floor(rand() * 5);
    for (let word = 0; word < words && x < 470; word += 1) {
      const width = 18 + rand() * 70;
      ctx.fillStyle = colors[Math.floor(rand() * colors.length)];
      ctx.fillRect(x, y, width, 6);
      x += width + 9;
    }
  }
  return finish(canvas);
}

// LED panel with the contribution calendar. `levels` is an array of 0..4 values, oldest first;
// when it is missing an empty grid is drawn (no invented activity).
export function heatmapTexture(levels) {
  const [canvas, ctx] = canvas2d(512, 320);
  const columns = 18;
  const rows = 7;
  const cell = 22;
  const gap = 5;
  const palette = ['#16201a', '#0c4a1c', '#007322', '#009929', '#36d463'];
  ctx.fillStyle = '#0a0f0c';
  ctx.fillRect(0, 0, 512, 320);
  const originX = (512 - (columns * (cell + gap) - gap)) / 2;
  const originY = 74;
  // Octocat-free header: a small bar chart glyph and a title strip.
  ctx.fillStyle = '#36d463';
  [10, 18, 13, 24].forEach((height, i) => ctx.fillRect(originX + i * 9, 48 - height, 6, height));
  ctx.fillStyle = '#2a3a30';
  ctx.fillRect(originX + 48, 30, 150, 9);
  ctx.fillRect(originX + 48, 44, 90, 5);

  const data = Array.isArray(levels) ? levels.slice(-(columns * rows)) : [];
  const offset = columns * rows - data.length;
  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < rows; row += 1) {
      const index = column * rows + row - offset;
      const level = index >= 0 ? data[index] : 0;
      ctx.fillStyle = palette[level] || palette[0];
      ctx.beginPath();
      ctx.roundRect(originX + column * (cell + gap), originY + row * (cell + gap), cell, cell, 4);
      ctx.fill();
    }
  }
  return finish(canvas);
}

// Night sky with a moon, or a day sky with a sun and clouds.
export function skyTexture(theme) {
  const [canvas, ctx] = canvas2d(384, 340);
  const rand = seeded(77);
  const night = theme === 'dark';
  const gradient = ctx.createLinearGradient(0, 0, 0, 340);
  if (night) {
    gradient.addColorStop(0, '#0d1230');
    gradient.addColorStop(1, '#1d2a52');
  } else {
    gradient.addColorStop(0, '#6db6e6');
    gradient.addColorStop(1, '#c9e8f7');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 384, 340);
  if (night) {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 46; i += 1) {
      ctx.globalAlpha = 0.35 + rand() * 0.65;
      const size = 1 + rand() * 2.2;
      ctx.fillRect(rand() * 384, rand() * 300, size, size);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#f4f1dc';
    ctx.beginPath();
    ctx.arc(285, 86, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e2ddc2';
    [
      [272, 78, 7],
      [297, 96, 5],
      [290, 70, 4],
    ].forEach(([x, y, r]) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
  } else {
    ctx.fillStyle = '#fff3b8';
    ctx.beginPath();
    ctx.arc(290, 80, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    [
      [80, 120],
      [190, 210],
      [300, 180],
    ].forEach(([x, y]) => {
      [0, 26, 52].forEach((dx, i) => {
        ctx.beginPath();
        ctx.arc(x + dx, y - (i === 1 ? 10 : 0), 20 + (i === 1 ? 6 : 0), 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }
  // Skyline strip at the bottom so the window does not look empty.
  ctx.fillStyle = night ? '#0a0e22' : '#7fae8c';
  let x = 0;
  while (x < 384) {
    const width = 22 + rand() * 40;
    const height = 20 + rand() * 60;
    ctx.fillRect(x, 340 - height, width, height);
    if (night) {
      ctx.fillStyle = '#f2d75c';
      for (let wy = 340 - height + 6; wy < 334; wy += 12) {
        for (let wx = x + 5; wx < x + width - 6; wx += 10) if (rand() > 0.6) ctx.fillRect(wx, wy, 4, 5);
      }
      ctx.fillStyle = '#0a0e22';
    }
    x += width + 2;
  }
  return finish(canvas);
}
