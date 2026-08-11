import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Wrench, Palette, Check, Copy, Download,
  Terminal, Layers, Type, Code, Upload, Crop, Droplet,
  FileImage, Printer, Ruler, ScanEye, Stamp, RefreshCw, Eye, Sparkles, Layout, Maximize2
} from 'lucide-react';
import {
  hexToRgb, rgbToHex, rgbToHsl, rgbToCmyk, cmykToRgb, approxOklch, contrastRatio,
  generateTailwindShades, generateHarmonies, COLORBLIND_TYPES, simulateColorblind,
  parseAnyColorInput, findClosestPantone
} from '../utils/color';
import {
  loadImageFromFile, loadSvgTextFromFile, svgToImage, recolorSvgText, downloadCanvas, downloadTextFile, optimizeSvgCode, drawCover, drawContain,
  extractPalette, applyColorblindToImage, FAVICON_SIZES, drawWatermark
} from '../utils/image';

const BG_DARK_RGB = { r: 17, g: 17, b: 20 };

function ToolCard({ icon: Icon, title, description, children, style }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-subtle)',
      padding: '1.8rem',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      ...style
    }}>
      <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: description ? '0.5rem' : '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Icon size={18} color="var(--accent)" />
        <span>{title}</span>
      </h3>
      {description && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.3rem', lineHeight: 1.5 }}>
          {description}
        </p>
      )}
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}

function FieldLabel({ children, accent }) {
  return (
    <label style={{ fontSize: '0.8rem', color: accent ? 'var(--accent)' : 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
      {children}
    </label>
  );
}

function UploadZone({ onFile, hint, fileName, accept = "image/*" }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files) => {
    const file = files && files[0];
    if (file) onFile(file);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      style={{
        border: `1.5px dashed ${dragOver ? 'var(--accent)' : 'var(--border-strong)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '1.6rem',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: dragOver ? 'var(--accent-muted)' : 'var(--bg-surface-2)',
        transition: 'all 0.2s ease'
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />
      <Upload size={22} color="var(--accent)" style={{ marginBottom: '0.5rem' }} />
      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
        {fileName || 'Arrastrá un archivo o hacé clic para subir'}
      </div>
      {hint && <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', marginTop: '0.3rem' }}>{hint}</div>}
    </div>
  );
}

// -----------------------------------------------------------------------------
// PRESETS DE SOCIAL CROPPER (SAFE TOP LEVEL CONSTANT)
// -----------------------------------------------------------------------------
const SOCIAL_PRESETS = [
  { id: 'square', label: 'Instagram Post / Avatar', ratio: '1:1', w: 1080, h: 1080 },
  { id: 'portrait', label: 'Instagram Portrait', ratio: '4:5', w: 1080, h: 1350 },
  { id: 'landscape', label: 'YouTube / Banner', ratio: '16:9', w: 1920, h: 1080 },
  { id: 'story', label: 'TikTok / Reels / Stories', ratio: '9:16', w: 1080, h: 1920 },
  { id: 'linkedin_banner', label: 'Portada LinkedIn', ratio: '4:1', w: 1584, h: 396 },
  { id: 'twitter_header', label: 'Encabezado Twitter / X', ratio: '3:1', w: 1500, h: 500 },
  { id: 'threads_card', label: 'Tarjeta Threads / Bluesky', ratio: '1.91:1', w: 1200, h: 630 },
  { id: 'pinterest_pin', label: 'Pinterest Pin', ratio: '2:3', w: 1000, h: 1500 },
  { id: 'etsy_banner', label: 'Banner Tienda Etsy', ratio: '8:1', w: 3360, h: 840 }
];

// -----------------------------------------------------------------------------
// DATASET TIPOGRÁFICO DE PRESETS (15 PRESETS INVESTIGADOS EN 3 CATEGORÍAS)
// -----------------------------------------------------------------------------
const TYPE_PRESETS = [
  // Categoría 1: Escalas Modulares Matemáticas
  { id: 'mod-balanced', category: 'Escalas Modulares Matemáticas', name: 'Balanceada (Minor Third 1.200) ★ Default', ratio: 1.2, base: 16, lhRatio: 1.5, type: 'modular' },
  { id: 'mod-compact', category: 'Escalas Modulares Matemáticas', name: 'Compacta (Major Second 1.125)', ratio: 1.125, base: 16, lhRatio: 1.45, type: 'modular' },
  { id: 'mod-modern', category: 'Escalas Modulares Matemáticas', name: 'Moderna (Major Third 1.250)', ratio: 1.25, base: 16, lhRatio: 1.5, type: 'modular' },
  { id: 'mod-editorial', category: 'Escalas Modulares Matemáticas', name: 'Editorial (Perfect Fourth 1.333)', ratio: 1.333, base: 16, lhRatio: 1.5, type: 'modular' },
  { id: 'mod-dramatic', category: 'Escalas Modulares Matemáticas', name: 'Dramática (Augmented Fourth 1.414)', ratio: 1.414, base: 16, lhRatio: 1.5, type: 'modular' },
  { id: 'mod-golden', category: 'Escalas Modulares Matemáticas', name: 'Ratio Áurea (Golden Ratio 1.618)', ratio: 1.618, base: 16, lhRatio: 1.5, type: 'modular' },

  // Categoría 2: Sistemas de Diseño Web
  { id: 'ds-material3', category: 'Sistemas de Diseño Web', name: 'Google Material Design 3', h1: 32, h2: 28, h3: 24, h4: 22, body: 16, small: 12, lhRatio: 1.5, type: 'fixed' },
  { id: 'ds-apple-hig', category: 'Sistemas de Diseño Web', name: 'Apple HIG (San Francisco)', h1: 28, h2: 22, h3: 20, h4: 17, body: 17, small: 13, lhRatio: 1.29, type: 'fixed' },
  { id: 'ds-tailwind', category: 'Sistemas de Diseño Web', name: 'Tailwind CSS Default', h1: 36, h2: 30, h3: 24, h4: 20, body: 16, small: 12, lhRatio: 1.5, type: 'fixed' },
  { id: 'ds-carbon', category: 'Sistemas de Diseño Web', name: 'IBM Carbon (Productive)', h1: 42, h2: 32, h3: 28, h4: 20, body: 16, small: 12, lhRatio: 1.5, type: 'fixed' },
  { id: 'ds-bootstrap', category: 'Sistemas de Diseño Web', name: 'Bootstrap 5', h1: 40, h2: 32, h3: 28, h4: 24, body: 16, small: 14, lhRatio: 1.5, type: 'fixed' },
  { id: 'ds-antdesign', category: 'Sistemas de Diseño Web', name: 'Ant Design Enterprise', h1: 38, h2: 30, h3: 24, h4: 20, body: 14, small: 12, lhRatio: 1.57, type: 'fixed' },

  // Categoría 3: Editorial & Impresión Clásica
  { id: 'ed-bringhurst', category: 'Editorial & Impresión Clásica', name: 'Bringhurst Libro Clásico', h1: 48, h2: 32, h3: 24, h4: 19, body: 14, small: 11, lhRatio: 1.33, type: 'fixed' },
  { id: 'ed-magazine', category: 'Editorial & Impresión Clásica', name: 'Revista Alta Moda (Vogue Style)', h1: 48, h2: 32, h3: 24, h4: 18, body: 16, small: 12, lhRatio: 1.6, type: 'fixed' },
  { id: 'ed-poster', category: 'Editorial & Impresión Clásica', name: 'Póster Swiss / Internacional', h1: 64, h2: 40, h3: 26, h4: 20, body: 16, small: 12, lhRatio: 1.5, type: 'fixed' }
];

// -----------------------------------------------------------------------------
// DATASET DE LÍMITES EN REDES SOCIALES (17 PLATAFORMAS CON DETALLES DE META SUITE & REELS)
// -----------------------------------------------------------------------------
const SOCIAL_LIMITS_DB = [
  {
    id: 'facebook',
    name: 'Facebook (incl. Meta Business Suite & Reels)',
    fields: [
      { label: 'Publicación de Texto / Post', limit: 63206, truncate: 140 },
      { label: 'Texto / Descripción de Reel', limit: 63206, truncate: 140 },
      { label: 'Título del Reel (Meta Business Suite)', limit: 255 },
      { label: 'Prueba A/B Títulos de Reel (Opciones)', limit: 255 },
      { label: 'Título de Video Convencional', limit: 255 },
      { label: 'Descripción de Video Convencional', limit: 63206, truncate: 140 },
      { label: 'Comentario', limit: 8000 },
      { label: 'Nombre de Página', limit: 50 },
      { label: 'Nombre de Grupo', limit: 75 },
      { label: 'Descripción de Evento', limit: 63206 },
      { label: 'Título de Anuncio (Headline)', limit: 40 },
      { label: 'Texto Principal Anuncio (Primary)', limit: 125, truncate: 125 }
    ]
  },
  {
    id: 'instagram',
    name: 'Instagram (incl. Reels)',
    fields: [
      { label: 'Pie de Foto / Caption (Feed & Reels)', limit: 2200, truncate: 125 },
      { label: 'Biografía (Bio)', limit: 150 },
      { label: 'Comentario', limit: 2200 },
      { label: 'Descripción de Reels', limit: 2200, truncate: 125 },
      { label: 'Nombre de Usuario (@handle)', limit: 30 },
      { label: 'Límite Máximo de Hashtags', limit: 30, isCount: true }
    ]
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    fields: [
      { label: 'Tweet Estándar (Gratis)', limit: 280 },
      { label: 'Post X Premium', limit: 25000, truncate: 280 },
      { label: 'Mensaje Directo (DM)', limit: 10000 },
      { label: 'Biografía', limit: 160 },
      { label: 'Nombre Visible (Display Name)', limit: 50 },
      { label: 'Handle (@username)', limit: 15 }
    ]
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    fields: [
      { label: 'Descripción de Video / Caption', limit: 4000, truncate: 100 },
      { label: 'Comentario', limit: 150 },
      { label: 'Biografía', limit: 80 },
      { label: 'Nombre de Usuario', limit: 24 }
    ]
  },
  {
    id: 'youtube',
    name: 'YouTube',
    fields: [
      { label: 'Título de Video', limit: 100, truncate: 70 },
      { label: 'Descripción de Video', limit: 5000, truncate: 150 },
      { label: 'Comentario', limit: 10000 },
      { label: 'Nombre del Canal', limit: 50 },
      { label: 'Título de Playlist', limit: 150 },
      { label: 'Título de Shorts', limit: 100 }
    ]
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    fields: [
      { label: 'Publicación de Perfil / Post', limit: 3000, truncate: 140 },
      { label: 'Título de Artículo', limit: 100 },
      { label: 'Comentario', limit: 1250 },
      { label: 'Titular de Perfil (Headline)', limit: 220 },
      { label: 'Acerca de / Extracto', limit: 2600, truncate: 300 },
      { label: 'Descripción de Empresa', limit: 2000 },
      { label: 'Titular Anuncio (Ad Headline)', limit: 70 }
    ]
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    fields: [
      { label: 'Título del Pin', limit: 100, truncate: 50 },
      { label: 'Descripción del Pin', limit: 500, truncate: 60 },
      { label: 'Nombre del Tablero', limit: 50 },
      { label: 'Descripción del Tablero', limit: 500 }
    ]
  },
  {
    id: 'threads',
    name: 'Threads',
    fields: [
      { label: 'Publicación de Texto (Post)', limit: 500 },
      { label: 'Biografía (Bio)', limit: 150 }
    ]
  },
  {
    id: 'bluesky',
    name: 'Bluesky',
    fields: [
      { label: 'Publicación de Texto (Post)', limit: 300 },
      { label: 'Biografía', limit: 256 },
      { label: 'Nombre Visible', limit: 64 }
    ]
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    fields: [
      { label: 'Estado de Texto', limit: 700 },
      { label: 'Nombre de Grupo', limit: 100 },
      { label: 'Mensaje de Chat', limit: 65536 },
      { label: 'Info de Perfil (About)', limit: 50 }
    ]
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    fields: [
      { label: 'Texto de Snap Estándar', limit: 80 },
      { label: 'Caption de Historia Expandida', limit: 250 },
      { label: 'Caption de Spotlight', limit: 160 }
    ]
  },
  {
    id: 'etsy',
    name: 'Etsy',
    fields: [
      { label: 'Título de Tienda', limit: 55 },
      { label: 'Título del Producto / Listing', limit: 140, truncate: 60 },
      { label: 'Descripción del Producto', limit: 10000, truncate: 160 },
      { label: 'Etiqueta por Tag', limit: 20 }
    ]
  },
  {
    id: 'google_business',
    name: 'Google Business Profile',
    fields: [
      { label: 'Publicación de Novedades', limit: 1500, truncate: 100 },
      { label: 'Descripción de Empresa', limit: 750, truncate: 250 }
    ]
  },
  {
    id: 'discord',
    name: 'Discord',
    fields: [
      { label: 'Mensaje Gratis', limit: 2000 },
      { label: 'Mensaje Nitro', limit: 4000 },
      { label: 'Nombre de Servidor', limit: 100 },
      { label: 'Nombre de Canal', limit: 100 }
    ]
  },
  {
    id: 'twitch',
    name: 'Twitch',
    fields: [
      { label: 'Título de Stream / Transmisión', limit: 140, truncate: 36 },
      { label: 'Biografía / Acerca de', limit: 300 }
    ]
  },
  {
    id: 'mastodon',
    name: 'Mastodon',
    fields: [
      { label: 'Toot / Publicación Estándar', limit: 500 },
      { label: 'Biografía', limit: 500 }
    ]
  },
  {
    id: 'reddit',
    name: 'Reddit',
    fields: [
      { label: 'Título de Publicación', limit: 300 },
      { label: 'Comentario', limit: 10000 },
      { label: 'Cuerpo de Publicación (Text Post)', limit: 40000 }
    ]
  }
];

export default function ToolsSection() {
  const [activeTab, setActiveTab] = useState('colour');
  const [copiedCode, setCopiedCode] = useState(null);
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // ---------------------------------------------------------------------
  // TAB 1 — COLOR MULTIFORMATO, PANTONE COATED/UNCOATED, PALETAS TAILWIND, ARMONÍAS Y DALTONISMO
  // ---------------------------------------------------------------------
  const [colorInput, setColorInput] = useState('#BAFDC1');

  const colorData = useMemo(() => {
    const parsed = parseAnyColorInput(colorInput) || { r: 186, g: 253, b: 193, a: 1 };
    const { r, g, b, a } = parsed;
    const { h, s, l } = rgbToHsl(r, g, b);
    const { c, m, y, k } = rgbToCmyk(r, g, b);
    const pantoneMatch = findClosestPantone(r, g, b);
    const hex = rgbToHex(r, g, b);
    const alphaHex = Math.round((a !== undefined ? a : 1) * 255).toString(16).padStart(2, '0').toUpperCase();
    const hex8 = `${hex}${alphaHex}`;

    return {
      hex,
      hex8,
      rgb: `rgb(${r}, ${g}, ${b})`,
      rgba: `rgba(${r}, ${g}, ${b}, ${a !== undefined ? a : 1})`,
      hsl: `hsl(${h}, ${s}%, ${l}%)`,
      cmyk: `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`,
      oklch: approxOklch(r, g, b),
      pantone: pantoneMatch,
      r, g, b, a: a !== undefined ? a : 1, h, s, l, c, m, y, k
    };
  }, [colorInput]);

  const tailwindShades = useMemo(() => generateTailwindShades(colorData.r, colorData.g, colorData.b), [colorData]);
  const harmonies = useMemo(() => generateHarmonies(colorData.hex), [colorData]);
  const contrastVsDark = useMemo(
    () => contrastRatio({ r: colorData.r, g: colorData.g, b: colorData.b }, BG_DARK_RGB).toFixed(2),
    [colorData]
  );
  const colorblindSwatches = useMemo(
    () => COLORBLIND_TYPES.map((t) => ({
      ...t,
      hex: (() => {
        const { r, g, b } = simulateColorblind(colorData.r, colorData.g, colorData.b, t.id);
        return `#${(('000000' + ((Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16)).slice(-6)).toUpperCase()}`;
      })()
    })),
    [colorData]
  );

  const bulkFormatsStr = useMemo(() => {
    return `HEX: ${colorData.hex} | HEX8: ${colorData.hex8} | RGB: ${colorData.rgb} | HSL: ${colorData.hsl} | CMYK: ${colorData.cmyk} | OKLCH: ${colorData.oklch}`;
  }, [colorData]);

  const bulkPantoneStr = useMemo(() => {
    return `Coated: ${colorData.pantone.coated.code} (${colorData.pantone.coated.hex}) | Uncoated: ${colorData.pantone.uncoated.code} (${colorData.pantone.uncoated.hex})`;
  }, [colorData]);

  const bulkTailwindStr = useMemo(() => {
    return tailwindShades.map(s => `${s.weight}: ${s.hex}`).join(', ');
  }, [tailwindShades]);

  const bulkHarmoniesStr = useMemo(() => {
    return harmonies.map(h => `${h.label}: ${h.colors.join(', ')}`).join('\n');
  }, [harmonies]);

  const bulkColorblindStr = useMemo(() => {
    return colorblindSwatches.map(cb => `${cb.label}: ${cb.hex}`).join(', ');
  }, [colorblindSwatches]);

  // ---------------------------------------------------------------------
  // TAB 2 — ANÁLISIS DE IMAGEN: PALETA CON COPIA EN BLOQUE & DALTONISMO DESCARGABLE
  // ---------------------------------------------------------------------
  const [analysisImg, setAnalysisImg] = useState(null);
  const [analysisFileName, setAnalysisFileName] = useState('');
  const [palette, setPalette] = useState([]);
  const [cbType, setCbType] = useState('protanopia');
  const cbCanvasRef = useRef(null);

  const handleAnalysisUpload = async (file) => {
    const { img } = await loadImageFromFile(file);
    setAnalysisImg(img);
    setAnalysisFileName(file.name);
    setPalette(extractPalette(img, 6));
  };

  useEffect(() => {
    if (!analysisImg || !cbCanvasRef.current) return;
    const canvas = applyColorblindToImage(analysisImg, cbType, 420);
    const target = cbCanvasRef.current;
    target.width = canvas.width;
    target.height = canvas.height;
    target.getContext('2d').drawImage(canvas, 0, 0);
  }, [analysisImg, cbType]);

  const downloadColorblindFilteredImage = () => {
    if (!cbCanvasRef.current) return;
    downloadCanvas(cbCanvasRef.current, `kalpa-daltonismo-${cbType}.png`);
  };

  const bulkHex = useMemo(() => palette.map(p => p.hex).join(', '), [palette]);
  const bulkRgb = useMemo(() => palette.map(p => p.rgb).join(' | '), [palette]);
  const bulkHsl = useMemo(() => palette.map(p => p.hsl).join(' | '), [palette]);
  const bulkCmyk = useMemo(() => palette.map(p => p.cmyk).join(' | '), [palette]);
  const bulkPantoneC = useMemo(() => palette.map(p => p.pantoneC).join(', '), [palette]);
  const bulkPantoneU = useMemo(() => palette.map(p => p.pantoneU).join(', '), [palette]);
  const bulkJson = useMemo(() => JSON.stringify(palette, null, 2), [palette]);

  // ---------------------------------------------------------------------
  // TAB 3 — SVG OPTIMIZER SEGURO CON CARGA Y DESCARGA .SVG DEDICADA
  // ---------------------------------------------------------------------
  const [svgFileName, setSvgFileName] = useState('');
  const [rawSvg, setRawSvg] = useState(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="120" height="120">
  <!-- Generated by Kalpagrafica SVGO -->
  <g id="Layer_1" data-name="Layer 1">
    <polygon points="50,10 90,90 10,90" fill="#BAFDC1" />
    <circle cx="50" cy="60" r="15" fill="#111114" />
  </g>
</svg>`);

  const handleSvgUpload = async (file) => {
    setSvgFileName(file.name);
    const text = await loadSvgTextFromFile(file);
    setRawSvg(text);
  };

  const optimizedSvg = useMemo(() => {
    return optimizeSvgCode(rawSvg);
  }, [rawSvg]);

  const downloadOptimizedSvg = () => {
    const filename = svgFileName ? svgFileName.replace(/\.svg$/i, '-optimizado.svg') : 'kalpa-vector-optimizado.svg';
    downloadTextFile(optimizedSvg, filename, 'image/svg+xml;charset=utf-8');
  };

  // ---------------------------------------------------------------------
  // TAB 4 — SOCIAL CROPPER MULTI-PRESETS Y WEBP / CALIDAD DE COMPRESIÓN
  // ---------------------------------------------------------------------
  const [socialImg, setSocialImg] = useState(null);
  const [socialFileName, setSocialFileName] = useState('');
  const [socialPreset, setSocialPreset] = useState('square');
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [matteColor, setMatteColor] = useState('#111114');
  const [useMatte, setUseMatte] = useState(false);
  const [cropFormat, setCropFormat] = useState('image/webp');
  const [cropQuality, setCropQuality] = useState(0.9);
  const socialCanvasRef = useRef(null);

  const preset = useMemo(() => {
    return SOCIAL_PRESETS.find((p) => p.id === socialPreset) || SOCIAL_PRESETS[0];
  }, [socialPreset]);

  const handleSocialUpload = async (file) => {
    const { img } = await loadImageFromFile(file);
    setSocialImg(img);
    setSocialFileName(file.name);
  };

  useEffect(() => {
    if (!socialImg || !socialCanvasRef.current || !preset) return;
    const canvas = socialCanvasRef.current;
    const previewScale = Math.min(1, 480 / Math.max(preset.w, preset.h));
    canvas.width = Math.round(preset.w * previewScale);
    canvas.height = Math.round(preset.h * previewScale);
    const ctx = canvas.getContext('2d');
    drawCover(ctx, socialImg, canvas.width, canvas.height, offsetX, offsetY, useMatte ? matteColor : null);
  }, [socialImg, preset, offsetX, offsetY, matteColor, useMatte]);

  const downloadSocialCrop = () => {
    if (!socialImg || !preset) return;
    const canvas = document.createElement('canvas');
    canvas.width = preset.w;
    canvas.height = preset.h;
    const ctx = canvas.getContext('2d');
    drawCover(ctx, socialImg, preset.w, preset.h, offsetX, offsetY, useMatte ? matteColor : null);
    const ext = cropFormat === 'image/webp' ? 'webp' : (cropFormat === 'image/jpeg' ? 'jpg' : 'png');
    downloadCanvas(canvas, `kalpa-${preset.id}-${preset.w}x${preset.h}.${ext}`, cropFormat, cropQuality);
  };

  // ---------------------------------------------------------------------
  // TAB 5 — ASSETS: FAVICON VECTORIAL SVG, FORMATO Y MARCA DE AGUA VECTORIAL
  // ---------------------------------------------------------------------
  const [assetSubTab, setAssetSubTab] = useState('favicon');

  const [faviconImg, setFaviconImg] = useState(null);
  const [faviconFileName, setFaviconFileName] = useState('');
  const [faviconBgColor, setFaviconBgColor] = useState('#111114');
  const [faviconUseBg, setFaviconUseBg] = useState(false);
  const [faviconFgColor, setFaviconFgColor] = useState('#BAFDC1');
  const [faviconUseFg, setFaviconUseFg] = useState(false);
  const [faviconIsMultiColorWarning, setFaviconIsMultiColorWarning] = useState(false);
  const [rawFaviconSvg, setRawFaviconSvg] = useState(null);

  const handleFaviconUpload = async (file) => {
    setFaviconFileName(file.name);
    if (file.name.endsWith('.svg') || file.type.includes('svg')) {
      const svgText = await loadSvgTextFromFile(file);
      setRawFaviconSvg(svgText);
      const { img } = await svgToImage(svgText);
      setFaviconImg(img);
    } else {
      setRawFaviconSvg(null);
      setFaviconIsMultiColorWarning(false);
      const { img } = await loadImageFromFile(file);
      setFaviconImg(img);
    }
  };

  useEffect(() => {
    if (!rawFaviconSvg) return;
    if (faviconUseFg) {
      const { svgText, isMultiColor } = recolorSvgText(rawFaviconSvg, faviconFgColor);
      setFaviconIsMultiColorWarning(isMultiColor);
      svgToImage(svgText).then(({ img }) => setFaviconImg(img));
    } else {
      setFaviconIsMultiColorWarning(false);
      svgToImage(rawFaviconSvg).then(({ img }) => setFaviconImg(img));
    }
  }, [rawFaviconSvg, faviconUseFg, faviconFgColor]);

  const downloadFaviconSize = (size) => {
    if (!faviconImg) return;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    drawContain(ctx, faviconImg, size, size, faviconUseBg ? faviconBgColor : null);
    downloadCanvas(canvas, `favicon-${size}x${size}.png`);
  };

  // Conversor de Formato con Vista Previa Visible
  const [converterImg, setConverterImg] = useState(null);
  const [converterFileName, setConverterFileName] = useState('');
  const [converterFormat, setConverterFormat] = useState('image/webp');
  const [converterQuality, setConverterQuality] = useState(0.85);
  const [convertedSizeKb, setConvertedSizeKb] = useState(null);
  const [originalSizeKb, setOriginalSizeKb] = useState(null);
  const converterCanvasRef = useRef(null);

  const handleConverterUpload = async (file) => {
    setOriginalSizeKb((file.size / 1024).toFixed(1));
    const { img } = await loadImageFromFile(file);
    setConverterImg(img);
    setConverterFileName(file.name);
  };

  useEffect(() => {
    if (!converterImg || !converterCanvasRef.current) return;
    const canvas = converterCanvasRef.current;
    canvas.width = converterImg.width;
    canvas.height = converterImg.height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (converterFormat === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(converterImg, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) setConvertedSizeKb((blob.size / 1024).toFixed(1));
    }, converterFormat, converterQuality);
  }, [converterImg, converterFormat, converterQuality]);

  const downloadConverted = () => {
    if (!converterCanvasRef.current) return;
    const ext = converterFormat.split('/')[1];
    downloadCanvas(converterCanvasRef.current, `kalpa-convertido.${ext}`, converterFormat, converterQuality);
  };

  const [wmImg, setWmImg] = useState(null);
  const [wmFileName, setWmFileName] = useState('');
  const [wmGraphicImg, setWmGraphicImg] = useState(null);
  const [wmGraphicFileName, setWmGraphicFileName] = useState('');
  const [wmText, setWmText] = useState('KALPAGRÁFICA');
  const [wmColor, setWmColor] = useState('#BAFDC1');
  const [wmOpacity, setWmOpacity] = useState(0.6);
  const [wmFontSize, setWmFontSize] = useState(32);
  const [wmPosition, setWmPosition] = useState('bottom-right');
  const [wmTiled, setWmTiled] = useState(false);
  const wmCanvasRef = useRef(null);

  const handleWmUpload = async (file) => {
    const { img } = await loadImageFromFile(file);
    setWmImg(img);
    setWmFileName(file.name);
  };

  const handleWmGraphicUpload = async (file) => {
    setWmGraphicFileName(file.name);
    if (file.name.endsWith('.svg') || file.type.includes('svg')) {
      const svgText = await loadSvgTextFromFile(file);
      const { img } = await svgToImage(svgText);
      setWmGraphicImg(img);
    } else {
      const { img } = await loadImageFromFile(file);
      setWmGraphicImg(img);
    }
  };

  useEffect(() => {
    if (!wmImg || !wmCanvasRef.current) return;
    const canvas = wmCanvasRef.current;
    const scale = Math.min(1, 520 / Math.max(wmImg.width, wmImg.height));
    canvas.width = Math.round(wmImg.width * scale);
    canvas.height = Math.round(wmImg.height * scale);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(wmImg, 0, 0, canvas.width, canvas.height);
    drawWatermark(ctx, canvas.width, canvas.height, {
      text: wmText, color: wmColor, opacity: wmOpacity,
      fontSize: wmFontSize * scale, position: wmPosition, tiled: wmTiled,
      watermarkImg: wmGraphicImg
    });
  }, [wmImg, wmText, wmColor, wmOpacity, wmFontSize, wmPosition, wmTiled, wmGraphicImg]);

  const downloadWatermarked = () => {
    if (!wmImg) return;
    const canvas = document.createElement('canvas');
    canvas.width = wmImg.width;
    canvas.height = wmImg.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(wmImg, 0, 0);
    drawWatermark(ctx, canvas.width, canvas.height, {
      text: wmText, color: wmColor, opacity: wmOpacity, fontSize: wmFontSize, position: wmPosition, tiled: wmTiled,
      watermarkImg: wmGraphicImg
    });
    downloadCanvas(canvas, 'kalpa-marca-de-agua.png');
  };

  // ---------------------------------------------------------------------
  // TAB 6 — TIPOGRAFÍA & PAPEL CON PRESETS REALES Y MOCKUP VISUAL
  // ---------------------------------------------------------------------
  const [selectedPresetId, setSelectedPresetId] = useState('mod-balanced');
  const [baseFontSize, setBaseFontSize] = useState(16);
  const [scaleRatio, setScaleRatio] = useState(1.2);
  const [lhRatio, setLhRatio] = useState(1.5);

  const activeTypePreset = useMemo(() => {
    return TYPE_PRESETS.find(p => p.id === selectedPresetId) || TYPE_PRESETS[0];
  }, [selectedPresetId]);

  const handleTypePresetChange = (presetId) => {
    setSelectedPresetId(presetId);
    const p = TYPE_PRESETS.find(item => item.id === presetId);
    if (!p) return;
    if (p.base) setBaseFontSize(p.base);
    if (p.ratio) setScaleRatio(p.ratio);
    if (p.lhRatio) setLhRatio(p.lhRatio);
  };

  const fontSizesResolved = useMemo(() => {
    if (activeTypePreset.type === 'fixed') {
      return {
        h1: activeTypePreset.h1,
        h2: activeTypePreset.h2,
        h3: activeTypePreset.h3,
        h4: activeTypePreset.h4,
        body: activeTypePreset.body,
        small: activeTypePreset.small
      };
    } else {
      return {
        h1: Math.round(baseFontSize * Math.pow(scaleRatio, 4)),
        h2: Math.round(baseFontSize * Math.pow(scaleRatio, 3)),
        h3: Math.round(baseFontSize * Math.pow(scaleRatio, 2)),
        h4: Math.round(baseFontSize * Math.pow(scaleRatio, 1)),
        body: baseFontSize,
        small: Math.round(baseFontSize * Math.pow(scaleRatio, -1))
      };
    }
  }, [activeTypePreset, baseFontSize, scaleRatio]);

  const fontScaleList = useMemo(() => {
    const items = [
      { tag: 'H1 Hero Title', px: fontSizesResolved.h1, rem: (fontSizesResolved.h1 / 16).toFixed(3) },
      { tag: 'H2 Main Title', px: fontSizesResolved.h2, rem: (fontSizesResolved.h2 / 16).toFixed(3) },
      { tag: 'H3 Section Title', px: fontSizesResolved.h3, rem: (fontSizesResolved.h3 / 16).toFixed(3) },
      { tag: 'H4 Subtitle', px: fontSizesResolved.h4, rem: (fontSizesResolved.h4 / 16).toFixed(3) },
      { tag: 'Body Regular (Base)', px: fontSizesResolved.body, rem: (fontSizesResolved.body / 16).toFixed(3) },
      { tag: 'Small Body / Caption', px: fontSizesResolved.small, rem: (fontSizesResolved.small / 16).toFixed(3) }
    ];
    return items;
  }, [fontSizesResolved]);

  const [rootFontSize, setRootFontSize] = useState(16);
  const [pxInput, setPxInput] = useState(24);
  const remOutput = (pxInput / rootFontSize).toFixed(3);

  const lhPx = Math.round(fontSizesResolved.body * lhRatio);

  const [wcText, setWcText] = useState('');
  const [socialPlatformFilter, setSocialPlatformFilter] = useState('all');

  const wcStats = useMemo(() => {
    const trimmed = wcText.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = wcText.length;
    const charsNoSpaces = wcText.replace(/\s/g, '').length;
    const readingMinutes = words ? Math.max(1, Math.round(words / 200)) : 0;

    return { words, chars, charsNoSpaces, readingMinutes };
  }, [wcText]);

  const filteredSocialPlatforms = useMemo(() => {
    if (socialPlatformFilter === 'all') return SOCIAL_LIMITS_DB;
    return SOCIAL_LIMITS_DB.filter(p => p.id === socialPlatformFilter);
  }, [socialPlatformFilter]);

  // Formatos de Papel en Proporciones Milimétricas Reales (Escala A2 max height 120px)
  const PAPER_SIZES_MM = [
    { name: 'A5', mm: '148 × 210 mm', px300: '1748 × 2480 px', w: 30, h: 42 },
    { name: 'A4', mm: '210 × 297 mm', px300: '2480 × 3508 px', w: 42, h: 60 },
    { name: 'US Letter', mm: '216 × 279 mm', px300: '2550 × 3300 px', w: 44, h: 56 },
    { name: 'US Legal', mm: '216 × 356 mm', px300: '2550 × 4200 px', w: 44, h: 72 },
    { name: 'A3', mm: '297 × 420 mm', px300: '3508 × 4961 px', w: 60, h: 85 },
    { name: 'A2', mm: '420 × 594 mm', px300: '4961 × 7016 px', w: 85, h: 120 }
  ];

  // ---------------------------------------------------------------------
  const TABS = [
    { id: 'colour', label: 'Color & Armonías', icon: Palette },
    { id: 'analysis', label: 'Paleta & Daltonismo', icon: ScanEye },
    { id: 'svg', label: 'Optimizador SVG', icon: Code },
    { id: 'social', label: 'Social Cropper', icon: Crop },
    { id: 'assets', label: 'Favicon, Formato & Marca', icon: FileImage },
    { id: 'type', label: 'Tipografía & Papel', icon: Ruler },
    { id: 'cli', label: 'Comandos CLI', icon: Terminal }
  ];

  const gridStyle3Col = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' };
  const gridStyle2Col = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' };

  return (
    <section className="section-container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto 3rem' }}>
        <div className="font-caps" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)',
          backgroundColor: 'var(--accent-muted)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)',
          marginBottom: '1rem', border: '1px solid rgba(186,253,193,0.3)'
        }}>
          <Wrench size={15} />
          <span>KalpaTools & Delphi CLI Suite</span>
        </div>

        <h2 className="font-headline" style={{
          fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 700, letterSpacing: '-0.02em',
          color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '1.2rem'
        }}>
          Herramientas de Diseño
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Suite utilitaria 100% nativa para diseñadores y desarrolladores:
          colorimetría OKLCH, coincidencia Pantone PMS Coated (brillante) y Uncoated (mate), paletas, daltonismo descargable, recorte social WebP, favicons vectoriales, marca de agua SVG,
          escala tipográfica visual interactiva con 15 presets reales y el paquete ejecutable <strong style={{ color: 'var(--accent)' }}>@kalpa-droid/delphitools</strong> en la terminal.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="font-caps"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem',
                borderRadius: 'var(--radius-md)',
                border: isActive ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                backgroundColor: isActive ? 'var(--accent)' : 'var(--bg-surface)',
                color: isActive ? '#08080A' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500, fontSize: '0.85rem', cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: isActive ? '0 4px 15px rgba(186, 253, 193, 0.2)' : 'none'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: COLOR MULTIFORMATO, PANTONE COATED/UNCOATED, PALETAS TAILWIND, ARMONÍAS Y DALTONISMO ------------ */}
      {activeTab === 'colour' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Row 1 — 3-Column Grid */}
          <div style={gridStyle3Col}>
            {/* COLUMN 1: Entrada Principal & Cuentagotas (Destacado) */}
            <ToolCard icon={Palette} title="Entrada de Color & Cuentagotas">
              <div style={{
                height: '110px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: colorData.hex,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.2rem',
                border: '2px solid var(--accent)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                position: 'relative'
              }}>
                <input
                  type="color"
                  value={colorData.hex}
                  onChange={(e) => setColorInput(e.target.value)}
                  style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                  title="Hacé clic en el cuadro para abrir el selector de color nativo / cuentagotas"
                />
                <span className="font-mono" style={{
                  backgroundColor: 'rgba(8,8,10,0.85)', color: 'var(--accent)',
                  padding: '0.35rem 0.8rem', borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem', fontWeight: 700, border: '1px solid rgba(186,253,193,0.3)', pointerEvents: 'none'
                }}>
                  {colorData.hex} (Clic para Cuentagotas)
                </span>
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                  ¡PEGÁ O ESCRIBÍ TU CÓDIGO DE COLOR AQUÍ!
                </label>
                <input
                  type="text"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  placeholder="ej: ffd42aff, #ffd42a, rgb(255,212,42), cmyk(0,17,84,0), Pantone 115 C..."
                  className="input font-mono"
                  style={{ width: '100%', fontSize: '1.05rem', fontWeight: 700, padding: '0.75rem 1rem', backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--accent)' }}
                />
              </div>

              <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '1rem', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.3rem' }}>Formatos aceptados al pegar:</strong>
                <div className="font-mono" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.3rem', fontSize: '0.75rem' }}>
                  <div>• <strong>HEX 6d</strong>: <code>#ffd42a</code> o <code>ffd42a</code></div>
                  <div>• <strong>HEX 8d</strong>: <code>ffd42aff</code></div>
                  <div>• <strong>RGB</strong>: <code>255, 212, 42</code></div>
                  <div>• <strong>CMYK</strong>: <code>0, 17, 84, 0</code></div>
                  <div>• <strong>HSL</strong>: <code>47, 100%, 58%</code></div>
                  <div>• <strong>Pantone</strong>: <code>115 C</code> o <code>115 U</code></div>
                </div>
              </div>

              <div style={{ padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block' }}>Ratio de Contraste vs Fondo Oscuro (#111114)</span>
                <strong className="font-mono" style={{ fontSize: '1.1rem', color: Number(contrastVsDark) >= 4.5 ? 'var(--accent)' : '#F87171', display: 'block', margin: '0.2rem 0' }}>
                  {contrastVsDark}:1 {Number(contrastVsDark) >= 4.5 ? '✓ (AA/AAA Pass)' : '⚠ (Bajo Contraste)'}
                </strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-disabled)', display: 'block', lineHeight: 1.35 }}>
                  Indica la legibilidad según la norma internacional WCAG 2.1 sobre el fondo oscuro de la web.
                </span>
              </div>
            </ToolCard>

            {/* COLUMN 2: Conversión Multi-Espacio */}
            <ToolCard icon={Palette} title="Conversión Multi-Espacio">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {[
                  { label: 'HEX (6 dígitos)', val: colorData.hex },
                  { label: 'HEX (8 dígitos con Alfa)', val: colorData.hex8 },
                  { label: 'RGB', val: colorData.rgb },
                  { label: 'HSL', val: colorData.hsl },
                  { label: 'CMYK', val: colorData.cmyk },
                  { label: 'OKLCH', val: colorData.oklch }
                ].map((fmt) => (
                  <div key={fmt.label} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    backgroundColor: 'var(--bg-surface-2)', padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)'
                  }}>
                    <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                      <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-disabled)', display: 'block' }}>{fmt.label}</span>
                      <strong className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--accent)', wordBreak: 'break-all' }}>{fmt.val}</strong>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard(fmt.val, fmt.label)} title="Copiar este formato individual">
                      {copiedCode === fmt.label ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
                    </button>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => copyToClipboard(bulkFormatsStr, 'bulk-formats')}
                style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', border: '1px dashed var(--border-strong)' }}
              >
                {copiedCode === 'bulk-formats' ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
                <span>{copiedCode === 'bulk-formats' ? '¡Todos los Formatos Copiados!' : 'Copiar Todos los Formatos'}</span>
              </button>
            </ToolCard>

            {/* COLUMN 3: Guías Pantone® PMS Coated (C) & Uncoated (U) */}
            <ToolCard icon={Printer} title="Guías Pantone® PMS" description="Comparativa del color activo según el soporte: Coated (brillante) vs Uncoated (mate).">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {/* Coated C */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface-2)', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)', padding: '0.8rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.8rem'
                  }}
                >
                  <div
                    onClick={() => setColorInput(colorData.pantone.coated.hex)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', flex: 1 }}
                    title="Hacé clic para cargar este color Coated en la app"
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', backgroundColor: colorData.pantone.coated.hex, border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
                    <div style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      <strong className="font-headline" style={{ fontSize: '0.95rem', color: 'var(--accent)', display: 'block' }}>{colorData.pantone.coated.code}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.1rem' }}>Papel Estucado / Brillante</span>
                      <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-disabled)' }}>HEX {colorData.pantone.coated.hex} | {colorData.pantone.coated.similarity}</span>
                    </div>
                  </div>

                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => copyToClipboard(`${colorData.pantone.coated.code} (${colorData.pantone.coated.hex})`, 'p-c-single')}
                    title="Copiar Pantone Coated"
                  >
                    {copiedCode === 'p-c-single' ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
                  </button>
                </div>

                {/* Uncoated U */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface-2)', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)', padding: '0.8rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.8rem'
                  }}
                >
                  <div
                    onClick={() => setColorInput(colorData.pantone.uncoated.hex)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', flex: 1 }}
                    title="Hacé clic para cargar este color Uncoated en la app"
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', backgroundColor: colorData.pantone.uncoated.hex, border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
                    <div style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      <strong className="font-headline" style={{ fontSize: '0.95rem', color: 'var(--accent)', display: 'block' }}>{colorData.pantone.uncoated.code}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.1rem' }}>Papel Obra / Mate</span>
                      <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-disabled)' }}>HEX {colorData.pantone.uncoated.hex} | {colorData.pantone.uncoated.similarity}</span>
                    </div>
                  </div>

                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => copyToClipboard(`${colorData.pantone.uncoated.code} (${colorData.pantone.uncoated.hex})`, 'p-u-single')}
                    title="Copiar Pantone Uncoated"
                  >
                    {copiedCode === 'p-u-single' ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => copyToClipboard(bulkPantoneStr, 'bulk-pantones')}
                style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', border: '1px dashed var(--border-strong)' }}
              >
                {copiedCode === 'bulk-pantones' ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
                <span>{copiedCode === 'bulk-pantones' ? '¡Ambos Pantones Copiados!' : 'Copiar Ambos Pantones (C & U)'}</span>
              </button>
            </ToolCard>
          </div>

          {/* Row 2 — 3-Column Grid */}
          <div style={gridStyle3Col}>
            {/* Tailwind Shades */}
            <ToolCard icon={Layers} title="Escala de Sombras Tailwind (50 — 950)" description="Se actualiza automáticamente al escribir o seleccionar cualquier color base. Hacé clic en cualquier sombra para aplicarla a todo el sistema.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {tailwindShades.map((shade) => (
                  <div
                    key={shade.weight}
                    onClick={() => { setColorInput(shade.hex); copyToClipboard(shade.hex, `shade-${shade.weight}`); }}
                    className="shade-item"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      backgroundColor: shade.hex, color: shade.weight < 500 ? '#08080A' : '#FFFFFF',
                      padding: '0.55rem 0.8rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      fontWeight: 600, fontSize: '0.82rem', transition: 'transform 0.15s ease'
                    }}
                  >
                    <span className="font-mono">{shade.weight}</span>
                    <span className="font-mono">{shade.hex}</span>
                    {copiedCode === `shade-${shade.weight}` ? <Check size={14} /> : <Copy size={14} style={{ opacity: 0.7 }} />}
                  </div>
                ))}
              </div>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => copyToClipboard(bulkTailwindStr, 'bulk-tailwind')}
                style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', border: '1px dashed var(--border-strong)' }}
              >
                {copiedCode === 'bulk-tailwind' ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
                <span>{copiedCode === 'bulk-tailwind' ? '¡Todas las Sombras Copiadas!' : 'Copiar Todas las Sombras Tailwind'}</span>
              </button>
            </ToolCard>

            {/* Harmonies */}
            <ToolCard icon={Droplet} title="Generador de Armonías Cromáticas" description="Esquemas calculados automáticamente en la rueda cromática HSL. Hacé clic en cualquier color para seleccionarlo o usá los botones de copia.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {harmonies.map((scheme) => (
                  <div key={scheme.id}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{scheme.label}</span>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => copyToClipboard(scheme.colors.join(', '), `scheme-${scheme.id}`)}
                        style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}
                        title="Copiar todos los colores de este esquema"
                      >
                        {copiedCode === `scheme-${scheme.id}` ? <Check size={12} color="var(--accent)" /> : <Copy size={12} />}
                        <span>{copiedCode === `scheme-${scheme.id}` ? 'Copiado' : 'Copiar Esquema'}</span>
                      </button>
                    </div>

                    <div style={{ display: 'flex', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                      {scheme.colors.map((c, i) => (
                        <div
                          key={i}
                          onClick={() => { setColorInput(c); copyToClipboard(c, `${scheme.id}-${i}`); }}
                          title={`Hacé clic para seleccionar ${c} o copiarlo`}
                          style={{ flex: 1, height: '36px', backgroundColor: c, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          {copiedCode === `${scheme.id}-${i}` && <Check size={13} color="#08080A" />}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => copyToClipboard(bulkHarmoniesStr, 'bulk-harmonies')}
                style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', border: '1px dashed var(--border-strong)' }}
              >
                {copiedCode === 'bulk-harmonies' ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
                <span>{copiedCode === 'bulk-harmonies' ? '¡Todas las Armonías Copiadas!' : 'Copiar Todas las Armonías'}</span>
              </button>
            </ToolCard>

            {/* Colorblind Quick Preview */}
            <ToolCard icon={ScanEye} title="Vista Rápida de Daltonismo" description="Simulación automática en tiempo real del color activo bajo distintos tipos de daltonismo con botones de copia.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {colorblindSwatches.map((cb) => (
                  <div key={cb.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    backgroundColor: 'var(--bg-surface-2)', padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)'
                  }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{cb.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600 }}>{cb.hex}</span>
                      <div
                        onClick={() => setColorInput(cb.hex)}
                        title="Hacé clic para cargar este color simulado"
                        style={{ width: '24px', height: '24px', borderRadius: 'var(--radius-sm)', backgroundColor: cb.hex, border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                      />
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => copyToClipboard(cb.hex, `cb-${cb.id}`)}
                        title="Copiar HEX simulado"
                      >
                        {copiedCode === `cb-${cb.id}` ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => copyToClipboard(bulkColorblindStr, 'bulk-cb')}
                style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', border: '1px dashed var(--border-strong)' }}
              >
                {copiedCode === 'bulk-cb' ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
                <span>{copiedCode === 'bulk-cb' ? '¡Todas las Simulaciones Copiadas!' : 'Copiar Todas las Simulaciones de Daltonismo'}</span>
              </button>
            </ToolCard>
          </div>
        </div>
      )}

      {/* TAB 2: ANÁLISIS DE IMAGEN — PALETA CON COPIA EN BLOQUE & DALTONISMO DESCARGABLE -------------- */}
      {activeTab === 'analysis' && (
        <div style={gridStyle3Col}>
          <ToolCard icon={Palette} title="Extractor de Paleta desde Imagen" description="Subí una imagen y obtené los colores dominantes con opción de copiar todos los códigos en bloque.">
            <UploadZone onFile={handleAnalysisUpload} fileName={analysisFileName} hint="PNG, JPG o WEBP — se procesa en tu navegador" />
            {palette.length > 0 && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.2rem', marginBottom: '1.5rem' }}>
                  {palette.map((c, i) => (
                    <div
                      key={i}
                      onClick={() => { setColorInput(c.hex); copyToClipboard(c.hex, `pal-${i}`); setActiveTab('colour'); }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        backgroundColor: c.hex, padding: '0.55rem 0.9rem', borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer', fontWeight: 600
                      }}
                    >
                      <span className="font-mono" style={{ fontSize: '0.82rem', color: '#08080A', textShadow: '0 0 8px rgba(255,255,255,0.4)' }}>{c.hex}</span>
                      <span className="font-mono" style={{ fontSize: '0.75rem', color: '#08080A' }}>{c.pct}%</span>
                    </div>
                  ))}
                </div>

                <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <FieldLabel accent>Copiar Todos los Colores Extraídos en Bloque</FieldLabel>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', marginTop: '0.6rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard(bulkHex, 'bulk-hex')}>
                      {copiedCode === 'bulk-hex' ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
                      <span>Todos en HEX</span>
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard(bulkRgb, 'bulk-rgb')}>
                      {copiedCode === 'bulk-rgb' ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
                      <span>Todos en RGB</span>
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard(bulkCmyk, 'bulk-cmyk')}>
                      {copiedCode === 'bulk-cmyk' ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
                      <span>Todos en CMYK</span>
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard(bulkPantoneC, 'bulk-p-c')}>
                      {copiedCode === 'bulk-p-c' ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
                      <span>Pantone Coated</span>
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard(bulkPantoneU, 'bulk-p-u')}>
                      {copiedCode === 'bulk-p-u' ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
                      <span>Pantone Uncoated</span>
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard(bulkJson, 'bulk-json')}>
                      {copiedCode === 'bulk-json' ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
                      <span>Paleta JSON</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </ToolCard>

          <ToolCard icon={ScanEye} title="Simulador de Daltonismo sobre Imagen" description="Visualizá y descargá la imagen procesada con el filtro de daltonismo aplicado.">
            <UploadZone onFile={async (f) => { const { img } = await loadImageFromFile(f); setAnalysisImg(img); setAnalysisFileName(f.name); if (palette.length === 0) setPalette(extractPalette(img, 6)); }} fileName={analysisFileName} hint="Se procesa localmente" />

            {analysisImg && (
              <>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', margin: '1rem 0' }}>
                  {COLORBLIND_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setCbType(t.id)}
                      className="font-caps"
                      style={{
                        padding: '0.35rem 0.7rem', borderRadius: 'var(--radius-sm)', fontSize: '0.7rem',
                        border: cbType === t.id ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                        backgroundColor: cbType === t.id ? 'var(--accent-muted)' : 'transparent',
                        color: cbType === t.id ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer'
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <canvas ref={cbCanvasRef} style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }} />
                </div>
                <button className="btn btn-primary" onClick={downloadColorblindFilteredImage} style={{ width: '100%', justifyContent: 'center' }}>
                  <Download size={16} />
                  <span>Descargar Imagen con Filtro {cbType}</span>
                </button>
              </>
            )}
          </ToolCard>
        </div>
      )}

      {/* TAB 3: SVG OPTIMIZER CON CARGA Y DESCARGA .SVG DEDICADA ---------------- */}
      {activeTab === 'svg' && (
        <ToolCard icon={Code} title="Optimizador & Limpiador SVG (SVGO)" description={<>Limpia metadata y comprime el código vectorial de cualquier archivo .svg preservando las referencias id internas para no deformar el diseño.</>}>
          <div style={{ marginBottom: '1.5rem' }}>
            <FieldLabel accent>Subí un archivo SVG (Logo, Marca o Ilustración Vectorial)</FieldLabel>
            <UploadZone
              onFile={handleSvgUpload}
              fileName={svgFileName}
              accept=".svg,image/svg+xml"
              hint="Arrastrá tu archivo .svg para leer y limpiar su código automáticamente"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div>
              <FieldLabel>SVG Original ({rawSvg.length} bytes)</FieldLabel>
              <textarea
                value={rawSvg}
                onChange={(e) => setRawSvg(e.target.value)}
                className="input font-mono"
                rows={10}
                style={{ width: '100%', fontSize: '0.82rem', lineHeight: 1.4 }}
                placeholder="Pega aquí el código <svg> o sube un archivo..."
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 600 }}>SVG Optimizado ({optimizedSvg.length} bytes)</label>
                <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--accent)' }}>
                  Ahorro: {Math.max(0, Math.round((1 - optimizedSvg.length / (rawSvg.length || 1)) * 100))}%
                </span>
              </div>
              <textarea readOnly value={optimizedSvg} className="input font-mono" rows={10} style={{ width: '100%', fontSize: '0.82rem', lineHeight: 1.4, backgroundColor: 'var(--bg-surface-2)', marginBottom: '1rem' }} />
              
              <FieldLabel accent>Vista Previa Gráfica en Tiempo Real</FieldLabel>
              <div
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-surface-2)',
                  minHeight: '140px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}
                dangerouslySetInnerHTML={{ __html: optimizedSvg }}
              />

              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button className="btn btn-primary btn-sm" onClick={() => copyToClipboard(optimizedSvg, 'svg-opt')} style={{ flex: 1, justifyContent: 'center' }}>
                  {copiedCode === 'svg-opt' ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedCode === 'svg-opt' ? '¡Código Copiado!' : 'Copiar SVG'}</span>
                </button>
                <button className="btn btn-ghost btn-sm" onClick={downloadOptimizedSvg} style={{ flex: 1, justifyContent: 'center', border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                  <Download size={16} />
                  <span>Descargar .SVG</span>
                </button>
              </div>
            </div>
          </div>
        </ToolCard>
      )}

      {/* TAB 4: SOCIAL CROPPER MULTI-PRESETS Y WEBP / COMPRESIÓN -------------------- */}
      {activeTab === 'social' && (
        <div style={gridStyle2Col}>
          <ToolCard icon={Crop} title="Social Cropper" description="Recorte multiformato para todas las redes sociales con exportación en WEBP comprimido o PNG original.">
            <UploadZone onFile={handleSocialUpload} fileName={socialFileName} hint="El recorte se calcula sobre tu imagen original" />

            <div style={{ margin: '1.2rem 0' }}>
              <FieldLabel>Plataforma / Formato de Red Social</FieldLabel>
              <select value={socialPreset} onChange={(e) => setSocialPreset(e.target.value)} className="input font-mono">
                {SOCIAL_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label} — {p.ratio} ({p.w}×{p.h}px)</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <FieldLabel>Foco Horizontal</FieldLabel>
                <input type="range" min={-50} max={50} value={offsetX} onChange={(e) => setOffsetX(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div style={{ flex: 1 }}>
                <FieldLabel>Foco Vertical</FieldLabel>
                <input type="range" min={-50} max={50} value={offsetY} onChange={(e) => setOffsetY(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <FieldLabel>Formato de Exportación</FieldLabel>
                <select value={cropFormat} onChange={(e) => setCropFormat(e.target.value)} className="input font-mono">
                  <option value="image/webp">WEBP (Web Optimizado)</option>
                  <option value="image/png">PNG (Sin Pérdida)</option>
                  <option value="image/jpeg">JPEG (Estándar)</option>
                </select>
              </div>
              {cropFormat !== 'image/png' && (
                <div style={{ flex: 1 }}>
                  <FieldLabel>Calidad de Compresión ({Math.round(cropQuality * 100)}%)</FieldLabel>
                  <input type="range" min={0.3} max={1} step={0.05} value={cropQuality} onChange={(e) => setCropQuality(Number(e.target.value))} style={{ width: '100%', marginTop: '0.6rem' }} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
              <input type="checkbox" checked={useMatte} onChange={(e) => setUseMatte(e.target.checked)} id="matte-toggle" />
              <label htmlFor="matte-toggle" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rellenar fondo (matte) para PNG transparentes</label>
              {useMatte && (
                <input type="color" value={matteColor} onChange={(e) => setMatteColor(e.target.value)} style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }} />
              )}
            </div>

            <button className="btn btn-primary" onClick={downloadSocialCrop} disabled={!socialImg} style={{ width: '100%', justifyContent: 'center' }}>
              <Download size={16} />
              <span>Descargar {preset ? `${preset.w}×${preset.h}px` : ''} ({cropFormat.split('/')[1].toUpperCase()})</span>
            </button>
          </ToolCard>

          <ToolCard icon={Maximize2} title="Vista Previa del Recorte" description="Visualizá exactamente cómo se encuadra tu imagen.">
            {socialImg ? (
              <canvas ref={socialCanvasRef} style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-2)' }} />
            ) : (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '0.85rem', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                Subí una imagen en el panel izquierdo para ver el lienzo de recorte en tiempo real
              </div>
            )}
          </ToolCard>
        </div>
      )}

      {/* TAB 5: FAVICON VECTORIAL SVG, FORMATO CON VISTA PREVIA Y MARCA DE AGUA VECTORIAL ------------- */}
      {activeTab === 'assets' && (
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {[
              { id: 'favicon', label: 'Favicons (Soporta SVG / PNG)', icon: FileImage },
              { id: 'convert', label: 'Conversor de Formato (Con Vista Previa)', icon: RefreshCw },
              { id: 'watermark', label: 'Marca de Agua (Texto / Logo SVG)', icon: Stamp }
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setAssetSubTab(s.id)}
                className="btn"
                style={{
                  backgroundColor: assetSubTab === s.id ? 'var(--bg-surface-2)' : 'transparent',
                  border: assetSubTab === s.id ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                  color: assetSubTab === s.id ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: '0.85rem', padding: '0.5rem 1rem'
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {assetSubTab === 'favicon' && (
            <ToolCard icon={FileImage} title="Generador de Favicons Vectoriales y Rasta" description="Subí tu logo en formato SVG, PNG, WEBP o JPG. Si subís un archivo SVG, podés modificar los colores de frente y fondo dinámicamente.">
              <UploadZone onFile={handleFaviconUpload} fileName={faviconFileName} accept="image/*,.svg" hint="Soporta SVG vectorial, PNG, WEBP y JPG" />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', margin: '1.2rem 0' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <input type="checkbox" checked={faviconUseBg} onChange={(e) => setFaviconUseBg(e.target.checked)} id="fav-bg-toggle" />
                    <label htmlFor="fav-bg-toggle" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Color de Fondo Personalizado</label>
                  </div>
                  {faviconUseBg && (
                    <input type="color" value={faviconBgColor} onChange={(e) => setFaviconBgColor(e.target.value)} style={{ width: '100%', height: '36px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }} />
                  )}
                </div>

                {rawFaviconSvg && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <input type="checkbox" checked={faviconUseFg} onChange={(e) => setFaviconUseFg(e.target.checked)} id="fav-fg-toggle" />
                      <label htmlFor="fav-fg-toggle" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Forzar Color de Frente SVG</label>
                    </div>
                    {faviconUseFg && (
                      <input type="color" value={faviconFgColor} onChange={(e) => setFaviconFgColor(e.target.value)} style={{ width: '100%', height: '36px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }} />
                    )}
                  </div>
                )}
              </div>

              {faviconIsMultiColorWarning && (
                <div style={{ backgroundColor: 'rgba(248, 113, 113, 0.15)', border: '1px solid #F87171', borderRadius: 'var(--radius-sm)', padding: '0.7rem', color: '#F87171', fontSize: '0.78rem', marginBottom: '1rem' }}>
                  ⚠ Aviso: El archivo SVG contiene múltiples tonos. Al forzar un color único de frente, se unificarán todos los trazos.
                </div>
              )}

              {faviconImg && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                  {FAVICON_SIZES.map((size) => (
                    <div key={size} style={{ textAlign: 'center', backgroundColor: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', padding: '0.8rem', border: '1px solid var(--border-subtle)' }}>
                      <div style={{
                        width: Math.min(size, 64), height: Math.min(size, 64), margin: '0 auto 0.6rem',
                        backgroundImage: `url(${faviconImg.src})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
                        backgroundColor: faviconUseBg ? faviconBgColor : 'transparent', borderRadius: '4px'
                      }} />
                      <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{size}×{size}</div>
                      <button className="btn btn-ghost btn-sm" onClick={() => downloadFaviconSize(size)}><Download size={13} /></button>
                    </div>
                  ))}
                </div>
              )}
            </ToolCard>
          )}

          {assetSubTab === 'convert' && (
            <ToolCard icon={RefreshCw} title="Conversor de Formato de Imagen" description="Convertí entre PNG, JPEG y WEBP directamente en el navegador, con vista previa gráfica interactiva y comparación de peso en KB.">
              <UploadZone onFile={handleConverterUpload} fileName={converterFileName} />
              {converterImg && (
                <>
                  <div style={{ display: 'flex', gap: '1rem', margin: '1.2rem 0' }}>
                    <div style={{ flex: 1 }}>
                      <FieldLabel>Formato de salida</FieldLabel>
                      <select value={converterFormat} onChange={(e) => setConverterFormat(e.target.value)} className="input font-mono">
                        <option value="image/webp">WEBP (Comprimido Móvil / Web)</option>
                        <option value="image/jpeg">JPEG (Estándar Web)</option>
                        <option value="image/png">PNG (Sin Pérdida)</option>
                      </select>
                    </div>
                    {converterFormat !== 'image/png' && (
                      <div style={{ flex: 1 }}>
                        <FieldLabel>Calidad de Compresión ({Math.round(converterQuality * 100)}%)</FieldLabel>
                        <input type="range" min={0.3} max={1} step={0.05} value={converterQuality} onChange={(e) => setConverterQuality(Number(e.target.value))} style={{ width: '100%', marginTop: '0.8rem' }} />
                      </div>
                    )}
                  </div>

                  {/* VISTA PREVIA VISIBLE CON FONDO CUADRICULADO (TRANSPARENCIA) */}
                  <div style={{
                    marginBottom: '1.2rem',
                    textAlign: 'center',
                    backgroundColor: '#111114',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundImage: 'linear-gradient(45deg, #1c1c22 25%, transparent 25%), linear-gradient(-45deg, #1c1c22 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1c1c22 75%), linear-gradient(-45deg, transparent 75%, #1c1c22 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                  }}>
                    <FieldLabel accent>Vista Previa de Imagen Convertida en Tiempo Real</FieldLabel>
                    <canvas ref={converterCanvasRef} style={{ maxWidth: '100%', maxHeight: '340px', borderRadius: 'var(--radius-sm)', objectFit: 'contain', marginTop: '0.5rem' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.8rem', marginBottom: '1.2rem' }}>
                    <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>Dimensiones</span>
                      <strong className="font-mono" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{converterImg.width} × {converterImg.height} px</strong>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>Peso Original</span>
                      <strong className="font-mono" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{originalSizeKb ? `${originalSizeKb} KB` : '...'}</strong>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>Peso Convertido</span>
                      <strong className="font-mono" style={{ fontSize: '0.95rem', color: 'var(--accent)' }}>{convertedSizeKb ? `${convertedSizeKb} KB` : '...'}</strong>
                    </div>
                  </div>

                  <button className="btn btn-primary" onClick={downloadConverted} style={{ width: '100%', justifyContent: 'center' }}>
                    <Download size={16} /><span>Descargar Imagen Convertida ({converterFormat.split('/')[1].toUpperCase()})</span>
                  </button>
                </>
              )}
            </ToolCard>
          )}

          {assetSubTab === 'watermark' && (
            <ToolCard icon={Stamp} title="Aplicador de Marca de Agua (Texto / Logo SVG)" description="Protegé tus imágenes aplicando texto o un logo en formato SVG o PNG como marca de agua.">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.2rem' }}>
                <div>
                  <FieldLabel>1. Subí tu imagen base</FieldLabel>
                  <UploadZone onFile={handleWmUpload} fileName={wmFileName} />
                </div>
                <div>
                  <FieldLabel>2. Subí tu logo SVG/PNG para la marca (Opcional)</FieldLabel>
                  <UploadZone onFile={handleWmGraphicUpload} fileName={wmGraphicFileName} accept="image/*,.svg" hint="Si subís un SVG, se usará como sello gráfico" />
                </div>
              </div>

              {wmImg && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', margin: '1.2rem 0' }}>
                    {!wmGraphicImg && (
                      <div>
                        <FieldLabel>Texto de marca</FieldLabel>
                        <input type="text" value={wmText} onChange={(e) => setWmText(e.target.value)} className="input font-mono" />
                      </div>
                    )}
                    {!wmGraphicImg && (
                      <div>
                        <FieldLabel>Color del texto</FieldLabel>
                        <input type="color" value={wmColor} onChange={(e) => setWmColor(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }} />
                      </div>
                    )}
                    <div>
                      <FieldLabel>Opacidad ({Math.round(wmOpacity * 100)}%)</FieldLabel>
                      <input type="range" min={0.1} max={1} step={0.05} value={wmOpacity} onChange={(e) => setWmOpacity(Number(e.target.value))} style={{ width: '100%', marginTop: '0.6rem' }} />
                    </div>
                    <div>
                      <FieldLabel>Tamaño ({wmFontSize}px)</FieldLabel>
                      <input type="range" min={12} max={96} value={wmFontSize} onChange={(e) => setWmFontSize(Number(e.target.value))} style={{ width: '100%', marginTop: '0.6rem' }} />
                    </div>
                    <div>
                      <FieldLabel>Posición</FieldLabel>
                      <select value={wmPosition} onChange={(e) => setWmPosition(e.target.value)} className="input font-mono" disabled={wmTiled}>
                        <option value="center">Centro</option>
                        <option value="top-left">Arriba Izquierda</option>
                        <option value="top-right">Arriba Derecha</option>
                        <option value="bottom-left">Abajo Izquierda</option>
                        <option value="bottom-right">Abajo Derecha</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
                    <input type="checkbox" checked={wmTiled} onChange={(e) => setWmTiled(e.target.checked)} id="wm-tile-toggle" />
                    <label htmlFor="wm-tile-toggle" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Patrón repetido (mosaico diagonal)</label>
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <canvas ref={wmCanvasRef} style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }} />
                  </div>

                  <button className="btn btn-primary" onClick={downloadWatermarked} style={{ width: '100%', justifyContent: 'center' }}>
                    <Download size={16} /><span>Descargar Imagen con Marca de Agua</span>
                  </button>
                </>
              )}
            </ToolCard>
          )}
        </div>
      )}

      {/* TAB 6: TIPOGRAFÍA & PAPEL EN 2 FILAS CON PRESETS REALES, MOCKUP VISUAL Y REDES ------------- */}
      {activeTab === 'type' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Fila 1 — 3 Columnas: Escala Tipográfica (Presets), Calculadoras PX/REM, Mockup Visual Unificado */}
          <div style={gridStyle3Col}>
            {/* Col 1: Selector de Presets Tipográficos */}
            <ToolCard icon={Type} title="Escala Tipográfica & Presets Reales" description="Seleccioná entre 15 sistemas investigados (Material 3, Apple HIG, Tailwind, Bringhurst, Vogue, etc.) o configurá tu escala personalizada.">
              <div style={{ marginBottom: '1.2rem' }}>
                <FieldLabel accent>Seleccionar Preset Tipográfico Real</FieldLabel>
                <select
                  value={selectedPresetId}
                  onChange={(e) => handleTypePresetChange(e.target.value)}
                  className="input font-mono"
                  style={{ width: '100%', fontWeight: 700, backgroundColor: 'var(--bg-surface-2)', color: 'var(--accent)' }}
                >
                  <optgroup label="Escalas Modulares Matemáticas">
                    {TYPE_PRESETS.filter(p => p.category === 'Escalas Modulares Matemáticas').map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Sistemas de Diseño Web">
                    {TYPE_PRESETS.filter(p => p.category === 'Sistemas de Diseño Web').map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Editorial & Impresión Clásica">
                    {TYPE_PRESETS.filter(p => p.category === 'Editorial & Impresión Clásica').map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {activeTypePreset.type === 'modular' && (
                <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <FieldLabel>Base (px)</FieldLabel>
                    <input type="number" value={baseFontSize} onChange={(e) => setBaseFontSize(Number(e.target.value))} className="input font-mono" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <FieldLabel>Escala Ratio</FieldLabel>
                    <input type="number" step={0.025} value={scaleRatio} onChange={(e) => setScaleRatio(Number(e.target.value))} className="input font-mono" />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', backgroundColor: 'var(--bg-surface-2)', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                {fontScaleList.map((item) => (
                  <div key={item.tag} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.tag}</span>
                    <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700 }}>
                      {item.px}px <span style={{ fontSize: '0.7rem', color: 'var(--text-disabled)' }}>({item.rem}rem)</span>
                    </span>
                  </div>
                ))}
              </div>
            </ToolCard>

            {/* Col 2: Calculadoras PX → REM e Interlineado */}
            <ToolCard icon={Ruler} title="Calculadoras PX → REM & Interlineado" description="Conversor dinámico y estimador de interlineado (Line-Height) óptimo.">
              <div style={{ marginBottom: '1.2rem' }}>
                <FieldLabel>Conversor PX → REM</FieldLabel>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <input type="number" value={rootFontSize} onChange={(e) => setRootFontSize(Number(e.target.value))} className="input font-mono" placeholder="Root 16" style={{ width: '80px' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>px root</span>
                  <input type="number" value={pxInput} onChange={(e) => setPxInput(Number(e.target.value))} className="input font-mono" placeholder="PX" style={{ flex: 1 }} />
                </div>
                <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Resultado REM</span>
                  <strong className="font-mono" style={{ color: 'var(--accent)' }}>{remOutput}rem</strong>
                </div>
              </div>

              <div>
                <FieldLabel>Multiplicador Line-Height ({lhRatio}x)</FieldLabel>
                <input type="range" min={1.1} max={2.0} step={0.05} value={lhRatio} onChange={(e) => setLhRatio(Number(e.target.value))} style={{ width: '100%', marginBottom: '0.6rem' }} />
                
                <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Line-Height en Body ({fontSizesResolved.body}px)</span>
                  <strong className="font-mono" style={{ color: 'var(--accent)' }}>{lhPx}px</strong>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-disabled)', display: 'block', marginBottom: '0.4rem' }}>Muestra de Interlineado ({lhRatio}x):</span>
                <div style={{ fontSize: `${fontSizesResolved.body}px`, lineHeight: `${lhPx}px`, color: 'var(--text-primary)', borderLeft: '3px solid var(--accent)', paddingLeft: '0.6rem' }}>
                  Texto impreso de muestra con el interlineado dinámico.<br />
                  Segunda línea con espacio vertical equilibrado.
                </div>
              </div>
            </ToolCard>

            {/* Col 3: MOCKUP VISUAL INTERACTIVO UNIFICADO */}
            <ToolCard icon={Layout} title="Vista Previa de Jerarquía Tipográfica" description="Muestra en tiempo real cómo se aplican los tamaños de H1, H2, H3, H4, Body y Small en un diseño real.">
              <div style={{
                backgroundColor: 'var(--bg-surface-2)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                padding: '1.2rem',
                maxHeight: '440px',
                overflowY: 'auto'
              }}>
                <div style={{ fontSize: `${fontSizesResolved.h1}px`, fontWeight: 800, color: 'var(--accent)', lineHeight: 1.1, marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
                  Kalpagráfica Editorial
                </div>

                <div style={{ fontSize: `${fontSizesResolved.h3}px`, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: '0.8rem' }}>
                  Jerarquía y Armonía Aplicada en Tiempo Real
                </div>

                <div style={{ fontSize: `${fontSizesResolved.body}px`, lineHeight: `${lhPx}px`, color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
                  La tipografía es la voz de la comunicación visual. Esta maqueta interactiva simula el comportamiento de tus tamaños tipográficos en un sitio web o maquetación impresa real.
                </div>

                <div style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: '0.8rem', marginBottom: '0.8rem' }}>
                  <div style={{ fontSize: `${fontSizesResolved.h4}px`, fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    Subtítulo de Sección (H4)
                  </div>
                  <div style={{ fontSize: `${fontSizesResolved.small}px`, color: 'var(--text-disabled)', lineHeight: 1.4 }}>
                    Nota al pie de página · Créditos · Publicado bajo la escala {activeTypePreset.name}
                  </div>
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: `${fontSizesResolved.h2}px`, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '0.4rem' }}>
                    Titular Secundario (H2)
                  </div>
                  <button className="btn btn-primary btn-sm" style={{ fontSize: `${fontSizesResolved.body}px`, padding: '0.4rem 0.9rem' }}>
                    Boton CTA ({fontSizesResolved.body}px)
                  </button>
                </div>
              </div>
            </ToolCard>
          </div>

          {/* Fila 2 — 2 Columnas de Ancho Completo: Formatos de Papel Proporcionales, Contador Redes 17 Plataformas & Meta Suite */}
          <div style={gridStyle2Col}>
            {/* Col 1: Formatos de Papel (ISO 216 & US) con Proporciones mm Reales */}
            <ToolCard icon={Printer} title="Formatos de Papel (Escala mm Real)" description="Proporciones geométricas exactas basadas en dimensiones físicas en milímetros.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.2rem' }}>
                {PAPER_SIZES_MM.map((paper) => (
                  <div key={paper.name} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    backgroundColor: 'var(--bg-surface-2)', padding: '0.45rem 0.75rem',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)'
                  }}>
                    <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)', width: '75px' }}>{paper.name}</strong>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{paper.mm}</span>
                    <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--accent)' }}>{paper.px300}</span>
                  </div>
                ))}
              </div>

              {/* Hojas con proporciones exactas alineadas por la base */}
              <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <FieldLabel accent>Escala Proporcional Real de Hojas (Max A2 594mm)</FieldLabel>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '0.6rem', height: '130px', marginTop: '0.8rem', paddingBottom: '0.4rem', borderBottom: '2px solid var(--accent)' }}>
                  {PAPER_SIZES_MM.map((p) => (
                    <div
                      key={p.name}
                      title={`${p.name} — ${p.mm}`}
                      style={{
                        width: `${p.w}px`,
                        height: `${p.h}px`,
                        backgroundColor: 'rgba(186, 253, 193, 0.12)',
                        border: '1.5px solid var(--accent)',
                        borderRadius: '3px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span className="font-mono" style={{ fontSize: p.h < 50 ? '0.6rem' : '0.72rem', color: 'var(--accent)', fontWeight: 700 }}>
                        {p.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ToolCard>

            {/* Col 2: Contador & Límites Redes Sociales (17 Plataformas + Meta Business Suite & Reels A/B) */}
            <ToolCard icon={Type} title="Contador & Límites Redes Sociales (17 Redes & Meta Suite)" description="Medición en tiempo real con campos oficiales de Meta Business Suite, Reels A/B Testing, Instagram, TikTok, YouTube y más (2025-2026).">
              <div style={{ marginBottom: '0.8rem' }}>
                <FieldLabel accent>Filtrar por Plataforma de Red Social</FieldLabel>
                <select
                  value={socialPlatformFilter}
                  onChange={(e) => setSocialPlatformFilter(e.target.value)}
                  className="input font-mono"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  <option value="all">📱 Todas las Plataformas (17 Redes & Meta Suite)</option>
                  {SOCIAL_LIMITS_DB.map((plat) => (
                    <option key={plat.id} value={plat.id}>{plat.name}</option>
                  ))}
                </select>
              </div>

              <textarea
                value={wcText}
                onChange={(e) => setWcText(e.target.value)}
                className="input font-mono"
                rows={4}
                style={{ width: '100%', fontSize: '0.82rem', marginBottom: '0.8rem' }}
                placeholder="Escribí o pegá tu copy para analizar sus límites de longitud..."
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginBottom: '1rem' }}>
                <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.4rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-disabled)', display: 'block' }}>Palabras</span>
                  <strong className="font-mono" style={{ fontSize: '0.9rem', color: 'var(--accent)' }}>{wcStats.words}</strong>
                </div>
                <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.4rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-disabled)', display: 'block' }}>Chars</span>
                  <strong className="font-mono" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{wcStats.chars}</strong>
                </div>
                <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.4rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-disabled)', display: 'block' }}>Sin Espacio</span>
                  <strong className="font-mono" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{wcStats.charsNoSpaces}</strong>
                </div>
                <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.4rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-disabled)', display: 'block' }}>Lectura</span>
                  <strong className="font-mono" style={{ fontSize: '0.9rem', color: 'var(--accent)' }}>{wcStats.readingMinutes} min</strong>
                </div>
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingRight: '0.2rem' }}>
                {filteredSocialPlatforms.map((plat) => (
                  <div key={plat.id} style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <strong style={{ fontSize: '0.78rem', color: 'var(--accent)', display: 'block', marginBottom: '0.4rem' }}>{plat.name}</strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {plat.fields.map((f) => {
                        const current = wcStats.chars;
                        const pct = Math.min(100, Math.round((current / f.limit) * 100));
                        const isExceeded = current > f.limit;
                        const isTruncated = f.truncate && current > f.truncate && !isExceeded;

                        return (
                          <div key={f.label} style={{ fontSize: '0.72rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>{f.label}</span>
                              <span className="font-mono" style={{ color: isExceeded ? '#F87171' : (isTruncated ? '#FBBF24' : 'var(--accent)'), fontWeight: 600 }}>
                                {current}/{f.limit} {isExceeded ? '⚠ Excedido' : (isTruncated ? `(Trunca a ~${f.truncate})` : '')}
                              </span>
                            </div>
                            <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', backgroundColor: isExceeded ? '#F87171' : (isTruncated ? '#FBBF24' : 'var(--accent)'), transition: 'width 0.2s ease' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ToolCard>
          </div>
        </div>
      )}

      {/* TAB 7: COMANDOS CLI CON PAQUETE STANDALONE @kalpa-droid/delphitools ------------ */}
      {activeTab === 'cli' && (
        <ToolCard icon={Terminal} title="Terminal @kalpa-droid/delphitools — Paquete Standalone" description="Ejecutá la suite utilitaria directamente en tu terminal sin necesidad de descargar React ni la aplicación web completa.">
          <div style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <FieldLabel accent>Comando de Instalación Global Npm Scoped (Solo Herramientas &lt; 50 KB)</FieldLabel>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-surface-2)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
              <code className="font-mono" style={{ fontSize: '0.9rem', color: 'var(--accent)' }}>npm install -g @kalpa-droid/delphitools</code>
              <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard('npm install -g @kalpa-droid/delphitools', 'cli-inst')}>
                {copiedCode === 'cli-inst' ? <Check size={16} color="var(--accent)" /> : <Copy size={16} />}
              </button>
            </div>

            <FieldLabel>Ejecutar sin instalar mediante npx:</FieldLabel>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-surface-2)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)' }}>
              <code className="font-mono" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>npx @kalpa-droid/delphitools colour ffd42a</code>
              <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard('npx @kalpa-droid/delphitools colour ffd42a', 'cli-npx')}>
                {copiedCode === 'cli-npx' ? <Check size={16} color="var(--accent)" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {[
              { cmd: 'dt colour ffd42aff', desc: 'Convierte ffd42aff a RGB, HSL, CMYK, OKLCH y Coincidencias Pantone Coated/Uncoated' },
              { cmd: 'dt pantone 115-c', desc: 'Muestra la ficha técnica Pantone PMS Coated (brillante) vs Uncoated (mate)' },
              { cmd: 'dt tailwind-shades #BAFDC1', desc: 'Genera las 11 sombras de 50 a 950 para Tailwind CSS' },
              { cmd: 'dt harmony #BAFDC1', desc: 'Genera esquemas complementarios, análogos, triádicos y tetrádicos' },
              { cmd: 'dt contrast #BAFDC1 #111114', desc: 'Calcula el ratio de contraste WCAG entre dos colores' }
            ].map((c) => (
              <div key={c.cmd} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                backgroundColor: 'var(--bg-surface-2)', padding: '0.8rem 1rem',
                borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <code className="font-mono" style={{ fontSize: '0.88rem', color: 'var(--accent)', display: 'block', marginBottom: '0.2rem' }}>{c.cmd}</code>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{c.desc}</span>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard(c.cmd, c.cmd)} title="Copiar comando">
                  {copiedCode === c.cmd ? <Check size={15} color="var(--accent)" /> : <Copy size={15} />}
                </button>
              </div>
            ))}
          </div>
        </ToolCard>
      )}

      <style>{`
        .shade-item:hover {
          transform: translateX(4px);
        }
      `}</style>
    </section>
  );
}
