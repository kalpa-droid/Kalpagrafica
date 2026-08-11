// =============================================================================
// KALPAGRÁFICA — Utilidades de Color (equivalente nativo a `dt colour`,
// `dt harmony`, `dt colorblind`, `dt contrast`, `dt tailwind-shades`)
// Sin dependencias externas — todo en JS puro.
// =============================================================================

export function normalizeHex(hex) {
  let clean = (hex || '').replace('#', '').trim();
  if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) clean = 'BAFDC1';
  return clean.toUpperCase();
}

export function hexToRgb(hex) {
  const clean = normalizeHex(hex);
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16)
  };
}

export function rgbToHex(r, g, b) {
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b)).toString(16).slice(1).toUpperCase()}`;
}

export function rgbToHsl(r, g, b) {
  const rN = r / 255, gN = g / 255, bN = b / 255;
  const max = Math.max(rN, gN, bN), min = Math.min(rN, gN, bN);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rN: h = (gN - bN) / d + (gN < bN ? 6 : 0); break;
      case gN: h = (bN - rN) / d + 2; break;
      case bN: h = (rN - gN) / d + 4; break;
      default: break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb(h, s, l) {
  const hN = ((h % 360) + 360) % 360 / 360;
  const sN = Math.max(0, Math.min(100, s)) / 100;
  const lN = Math.max(0, Math.min(100, l)) / 100;

  if (sN === 0) {
    const v = Math.round(lN * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p, q, t) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = lN < 0.5 ? lN * (1 + sN) : lN + sN - lN * sN;
  const p = 2 * lN - q;
  return {
    r: Math.round(hue2rgb(p, q, hN + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hN) * 255),
    b: Math.round(hue2rgb(p, q, hN - 1 / 3) * 255)
  };
}

export function hslToHex(h, s, l) {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

// Aproximación de OKLCH (suficiente para uso de diseño, no colorimetría de laboratorio)
export function approxOklch(r, g, b) {
  const rN = r / 255, gN = g / 255, bN = b / 255;
  const l = (0.2126 * rN + 0.7152 * gN + 0.0722 * bN).toFixed(3);
  const c = (Math.sqrt((rN - gN) ** 2 + (gN - bN) ** 2) * 0.15).toFixed(3);
  const { h } = rgbToHsl(r, g, b);
  return `oklch(${l} ${c} ${h})`;
}

export function relativeLuminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    const vN = v / 255;
    return vN <= 0.03928 ? vN / 12.92 : ((vN + 0.055) / 1.055) ** 2.4;
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function contrastRatio(rgbA, rgbB) {
  const lumA = relativeLuminance(rgbA.r, rgbA.g, rgbA.b);
  const lumB = relativeLuminance(rgbB.r, rgbB.g, rgbB.b);
  return (Math.max(lumA, lumB) + 0.05) / (Math.min(lumA, lumB) + 0.05);
}

// Escala de sombras estilo Tailwind (50 → 950) a partir de un color base
export function generateTailwindShades(r, g, b) {
  const weights = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  return weights.map((weight) => {
    const factor = (500 - weight) / 500;
    let rr = r, gg = g, bb = b;
    if (factor > 0) {
      rr = rr + (255 - rr) * factor * 0.85;
      gg = gg + (255 - gg) * factor * 0.85;
      bb = bb + (255 - bb) * factor * 0.85;
    } else {
      const dark = Math.abs(factor);
      rr *= (1 - dark * 0.85);
      gg *= (1 - dark * 0.85);
      bb *= (1 - dark * 0.85);
    }
    return { weight, hex: rgbToHex(rr, gg, bb) };
  });
}

// Generador de armonías cromáticas (equivalente a `dt harmony`)
export function generateHarmonies(hex) {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const at = (deg) => hslToHex(h + deg, s, l);
  return [
    { id: 'complementary', label: 'Complementaria', colors: [hex.startsWith('#') ? hex : `#${hex}`, at(180)] },
    { id: 'analogous', label: 'Análoga', colors: [at(-30), at(0), at(30)] },
    { id: 'triadic', label: 'Triádica', colors: [at(0), at(120), at(240)] },
    { id: 'split-complementary', label: 'Complementaria Dividida', colors: [at(0), at(150), at(210)] },
    { id: 'tetradic', label: 'Tetrádica (Cuadrado)', colors: [at(0), at(90), at(180), at(270)] },
    {
      id: 'monochromatic',
      label: 'Monocromática',
      colors: [20, 35, 50, 65, 80].map((lVal) => hslToHex(h, s, lVal))
    }
  ];
}

// Matrices simplificadas de simulación de daltonismo (uso estándar en herramientas de diseño)
export const COLORBLIND_TYPES = [
  { id: 'protanopia', label: 'Protanopía (rojo-verde)' },
  { id: 'deuteranopia', label: 'Deuteranopía (rojo-verde)' },
  { id: 'tritanopia', label: 'Tritanopía (azul-amarillo)' },
  { id: 'achromatopsia', label: 'Acromatopsia (monocromía)' }
];

export function simulateColorblind(r, g, b, type) {
  switch (type) {
    case 'protanopia':
      return {
        r: 0.567 * r + 0.433 * g,
        g: 0.558 * r + 0.442 * g,
        b: 0.242 * g + 0.758 * b
      };
    case 'deuteranopia':
      return {
        r: 0.625 * r + 0.375 * g,
        g: 0.7 * r + 0.3 * g,
        b: 0.3 * g + 0.7 * b
      };
    case 'tritanopia':
      return {
        r: 0.95 * r + 0.05 * g,
        g: 0.433 * g + 0.567 * b,
        b: 0.475 * g + 0.525 * b
      };
    case 'achromatopsia': {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      return { r: gray, g: gray, b: gray };
    }
    default:
      return { r, g, b };
  }
}
