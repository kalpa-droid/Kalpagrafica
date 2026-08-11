// =============================================================================
// KALPAGRÁFICA — Utilidades de Color (equivalente nativo a `dt colour`,
// `dt harmony`, `dt colorblind`, `dt contrast`, `dt tailwind-shades`, `dt pantone`)
// Sin dependencias externas — todo en JS puro con soporte Pantone PMS Coated (C) & Uncoated (U).
// =============================================================================

import { PANTONE_COATED_DB, PANTONE_UNCOATED_DB } from './pantoneData';

function parsePantoneDb(db, typeSuffix) {
  return db.map((entry) => {
    const [code, hex] = entry.split(':');
    const cleanHex = hex.toUpperCase();
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return {
      code: `Pantone ${code.replace('-', ' ')}`,
      rawCode: code.toLowerCase(),
      hex: `#${cleanHex}`,
      r, g, b,
      typeSuffix
    };
  });
}

const PANTONE_COATED_LIST = parsePantoneDb(PANTONE_COATED_DB, 'C');
const PANTONE_UNCOATED_LIST = parsePantoneDb(PANTONE_UNCOATED_DB, 'U');
const PANTONE_ALL_LIST = [...PANTONE_COATED_LIST, ...PANTONE_UNCOATED_LIST];

export function normalizeHex(hex) {
  let clean = (hex || '').replace('#', '').trim();
  if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('');
  if (clean.length === 4) clean = clean.substring(0, 3).split('').map((c) => c + c).join('');
  if (clean.length >= 8) clean = clean.substring(0, 6);
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

export function rgbToCmyk(r, g, b) {
  const rN = r / 255, gN = g / 255, bN = b / 255;
  const k = 1 - Math.max(rN, gN, bN);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = Math.round(((1 - rN - k) / (1 - k)) * 100);
  const m = Math.round(((1 - gN - k) / (1 - k)) * 100);
  const y = Math.round(((1 - bN - k) / (1 - k)) * 100);
  return { c: Math.max(0, c), m: Math.max(0, m), y: Math.max(0, y), k: Math.round(k * 100) };
}

export function cmykToRgb(c, m, y, k) {
  const cN = c / 100, mN = m / 100, yN = y / 100, kN = k / 100;
  const r = Math.round(255 * (1 - cN) * (1 - kN));
  const g = Math.round(255 * (1 - mN) * (1 - kN));
  const b = Math.round(255 * (1 - yN) * (1 - kN));
  return { r: Math.max(0, Math.min(255, r)), g: Math.max(0, Math.min(255, g)), b: Math.max(0, Math.min(255, b)) };
}

export function approxOklch(r, g, b) {
  const rN = r / 255, gN = g / 255, bN = b / 255;
  const l = (0.2126 * rN + 0.7152 * gN + 0.0722 * bN).toFixed(3);
  const c = (Math.sqrt((rN - gN) ** 2 + (gN - bN) ** 2) * 0.15).toFixed(3);
  const { h } = rgbToHsl(r, g, b);
  return `oklch(${l} ${c} ${h})`;
}

// Búsqueda en lista de Pantone con distancia de color perceptualmente ponderada
function findClosestInList(list, r, g, b) {
  let bestMatch = list[0];
  let minDistance = Infinity;

  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    const rMean = (r + p.r) / 2;
    const dR = r - p.r;
    const dG = g - p.g;
    const dB = b - p.b;
    const dist = Math.sqrt((2 + rMean / 256) * dR * dR + 4 * dG * dG + (2 + (255 - rMean) / 256) * dB * dB);

    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = p;
    }
  }

  const similarity = Math.max(0, Math.round(100 - (minDistance / 7.65)));
  return {
    code: bestMatch.code,
    hex: bestMatch.hex,
    deltaE: minDistance.toFixed(1),
    similarity: `${similarity}%`
  };
}

// Búsqueda dual para Coated (Papel Brillante) y Uncoated (Papel Mate/Obra)
export function findClosestPantone(r, g, b) {
  const coated = findClosestInList(PANTONE_COATED_LIST, r, g, b);
  const uncoated = findClosestInList(PANTONE_UNCOATED_LIST, r, g, b);

  return {
    coated: {
      ...coated,
      paperType: 'Papel Estucado / Brillante (Coated)',
      badge: 'Pantone C'
    },
    uncoated: {
      ...uncoated,
      paperType: 'Papel Obra / Mate (Uncoated)',
      badge: 'Pantone U'
    }
  };
}

// Universal Multiformat Color Parser
export function parseAnyColorInput(inputStr) {
  if (!inputStr || typeof inputStr !== 'string') return null;
  const clean = inputStr.trim().toLowerCase();

  // 1. Check if input is a Pantone query (e.g., '115 c', 'pantone 115', 'pms 115')
  const pMatch = clean.match(/(?:pantone|pms)?\s*([0-9]{3,4})\s*([ca-z])?/);
  if (pMatch && pMatch[1]) {
    const codeQuery = `${pMatch[1]}-${pMatch[2] || 'c'}`;
    const pFound = PANTONE_ALL_LIST.find((p) => p.rawCode === codeQuery || p.rawCode.startsWith(pMatch[1]));
    if (pFound) {
      return { r: pFound.r, g: pFound.g, b: pFound.b, a: 1, source: 'pantone' };
    }
  }

  // 2. HEX 3, 4, 6, 8 digits
  const hexMatch = clean.match(/^#?([0-9a-f]{3,8})$/);
  if (hexMatch) {
    let h = hexMatch[1];
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    if (h.length === 4) h = h.substring(0, 3).split('').map((c) => c + c).join('');
    if (h.length === 6 || h.length === 8) {
      const r = parseInt(h.substring(0, 2), 16);
      const g = parseInt(h.substring(2, 4), 16);
      const b = parseInt(h.substring(4, 6), 16);
      let a = 1;
      if (h.length === 8) {
        a = roundToTwo(parseInt(h.substring(6, 8), 16) / 255);
      }
      return { r, g, b, a, source: 'hex' };
    }
  }

  // 3. RGB / RGBA
  const rgbMatch = clean.match(/rgba?\s*\(?\s*(\d{1,3})\s*[\s,]+\s*(\d{1,3})\s*[\s,]+\s*(\d{1,3})/);
  if (rgbMatch) {
    return {
      r: Math.min(255, parseInt(rgbMatch[1], 10)),
      g: Math.min(255, parseInt(rgbMatch[2], 10)),
      b: Math.min(255, parseInt(rgbMatch[3], 10)),
      a: 1,
      source: 'rgb'
    };
  }

  // 4. HSL / HSLA
  const hslMatch = clean.match(/hsla?\s*\(?\s*(\d{1,3})\s*[\s,]+\s*(\d{1,3})%?\s*[\s,]+\s*(\d{1,3})%?/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1], 10);
    const s = parseInt(hslMatch[2], 10);
    const l = parseInt(hslMatch[3], 10);
    const rgb = hslToRgb(h, s, l);
    return { ...rgb, a: 1, source: 'hsl' };
  }

  // 5. CMYK
  const cmykMatch = clean.match(/cmyk\s*\(?\s*(\d{1,3})%?\s*[\s,]+\s*(\d{1,3})%?\s*[\s,]+\s*(\d{1,3})%?\s*[\s,]+\s*(\d{1,3})%?/);
  if (cmykMatch) {
    const c = parseInt(cmykMatch[1], 10);
    const m = parseInt(cmykMatch[2], 10);
    const y = parseInt(cmykMatch[3], 10);
    const k = parseInt(cmykMatch[4], 10);
    const rgb = cmykToRgb(c, m, y, k);
    return { ...rgb, a: 1, source: 'cmyk' };
  }

  // 6. OKLCH
  const oklchMatch = clean.match(/oklch\s*\(\s*([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)\s*\)/);
  if (oklchMatch) {
    const l = parseFloat(oklchMatch[1]);
    const c = parseFloat(oklchMatch[2]);
    const h = parseFloat(oklchMatch[3]);
    const rgb = hslToRgb(h, Math.min(100, c * 300), Math.min(100, l * 100));
    return { ...rgb, a: 1, source: 'oklch' };
  }

  return null;
}

function roundToTwo(num) {
  return Math.round(num * 100) / 100;
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
