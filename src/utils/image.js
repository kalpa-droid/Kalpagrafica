// =============================================================================
// KALPAGRÁFICA — Utilidades de Imagen (Canvas nativo, sin dependencias)
// Equivalente a: favicon-genny, image-converter, palette-genny, watermarker,
// matte-generator, social-cropper, colorblind-sim (sobre imagen)
// =============================================================================

import { simulateColorblind, rgbToHex } from './color';

export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

export function downloadCanvas(canvas, filename, type = 'image/png', quality) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }, type, quality);
}

// Dibuja una imagen tipo "cover" (recorte centrado) dentro de un canvas de w x h,
// con offsets porcentuales opcionales (-50 a 50) para reposicionar el foco del recorte.
export function drawCover(ctx, img, w, h, offsetXPct = 0, offsetYPct = 0, bgColor = null) {
  ctx.clearRect(0, 0, w, h);
  if (bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
  }
  const canvasRatio = w / h;
  const imgRatio = img.width / img.height;
  let sx, sy, sw, sh;
  if (imgRatio > canvasRatio) {
    sh = img.height;
    sw = sh * canvasRatio;
    sy = 0;
    sx = (img.width - sw) / 2 + (offsetXPct / 100) * (img.width - sw);
  } else {
    sw = img.width;
    sh = sw / canvasRatio;
    sx = 0;
    sy = (img.height - sh) / 2 + (offsetYPct / 100) * (img.height - sh);
  }
  sx = Math.max(0, Math.min(img.width - sw, sx));
  sy = Math.max(0, Math.min(img.height - sh, sy));
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
}

// Dibuja la imagen completa "contenida" (sin recortar) sobre un fondo/matte opcional
export function drawContain(ctx, img, w, h, bgColor = null) {
  ctx.clearRect(0, 0, w, h);
  if (bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
  }
  const scale = Math.min(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = (w - dw) / 2;
  const dy = (h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

// Extrae una paleta de N colores dominantes por cuantización en buckets (k-means ligero)
export function extractPalette(img, count = 6) {
  const sampleSize = 96;
  const canvas = document.createElement('canvas');
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  const ctx = canvas.getContext('2d');
  drawCover(ctx, img, sampleSize, sampleSize);
  const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize);

  const buckets = new Map();
  const step = 24; // tamaño del cuanto por canal
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 40) continue; // ignora píxeles casi transparentes
    const r = Math.round(data[i] / step) * step;
    const g = Math.round(data[i + 1] / step) * step;
    const b = Math.round(data[i + 2] / step) * step;
    const key = `${r},${g},${b}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.count += 1;
      existing.r += data[i];
      existing.g += data[i + 1];
      existing.b += data[i + 2];
    } else {
      buckets.set(key, { count: 1, r: data[i], g: data[i + 1], b: data[i + 2] });
    }
  }

  const sorted = [...buckets.values()].sort((a, b) => b.count - a.count).slice(0, count);
  const total = sorted.reduce((sum, b) => sum + b.count, 0) || 1;
  return sorted.map((b) => ({
    hex: rgbToHex(b.r / b.count, b.g / b.count, b.b / b.count),
    pct: Math.round((b.count / total) * 100)
  }));
}

// Aplica una simulación de daltonismo a una imagen completa, devuelve un canvas nuevo
export function applyColorblindToImage(img, type, maxDim = 640) {
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  if (type === 'none') return canvas;
  const imageData = ctx.getImageData(0, 0, w, h);
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    const { r, g, b } = simulateColorblind(data[i], data[i + 1], data[i + 2], type);
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

export const FAVICON_SIZES = [16, 32, 48, 180, 192, 512];

export function drawWatermark(ctx, w, h, opts) {
  const {
    text = 'KALPAGRÁFICA',
    color = '#BAFDC1',
    opacity = 0.6,
    fontSize = 32,
    position = 'bottom-right',
    tiled = false
  } = opts;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.font = `700 ${fontSize}px "Space Grotesk", sans-serif`;
  ctx.textBaseline = 'middle';

  if (tiled) {
    const textW = ctx.measureText(text).width;
    const stepX = textW + fontSize * 2;
    const stepY = fontSize * 4;
    ctx.rotate(-Math.PI / 8);
    const diag = Math.sqrt(w * w + h * h);
    for (let y = -diag; y < diag; y += stepY) {
      for (let x = -diag; x < diag; x += stepX) {
        ctx.fillText(text, x, y);
      }
    }
  } else {
    const textW = ctx.measureText(text).width;
    const margin = fontSize * 0.8;
    const positions = {
      'top-left': [margin, margin + fontSize / 2],
      'top-right': [w - textW - margin, margin + fontSize / 2],
      'bottom-left': [margin, h - margin - fontSize / 2],
      'bottom-right': [w - textW - margin, h - margin - fontSize / 2],
      center: [(w - textW) / 2, h / 2]
    };
    const [x, y] = positions[position] || positions['bottom-right'];
    ctx.fillText(text, x, y);
  }
  ctx.restore();
}
