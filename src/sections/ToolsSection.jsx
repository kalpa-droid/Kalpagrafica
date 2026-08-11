import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Wrench, Palette, Check, Copy, Download,
  Terminal, Layers, Type, Maximize2, Code, Upload, Crop, Droplet,
  FileImage, Printer, Ruler, ScanEye, Stamp, RefreshCw
} from 'lucide-react';
import {
  hexToRgb, rgbToHex, rgbToHsl, rgbToCmyk, cmykToRgb, approxOklch, contrastRatio,
  generateTailwindShades, generateHarmonies, COLORBLIND_TYPES, simulateColorblind,
  parseAnyColorInput, findClosestPantone
} from '../utils/color';
import {
  loadImageFromFile, downloadCanvas, drawCover, drawContain,
  extractPalette, applyColorblindToImage, FAVICON_SIZES, drawWatermark
} from '../utils/image';

const BG_DARK_RGB = { r: 17, g: 17, b: 20 };

function ToolCard({ icon: Icon, title, description, children, style }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-subtle)',
      padding: '2rem',
      boxShadow: 'var(--shadow-card)',
      ...style
    }}>
      <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: description ? '0.5rem' : '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Icon size={18} color="var(--accent)" />
        <span>{title}</span>
      </h3>
      {description && (
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.55 }}>
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

function FieldLabel({ children, accent }) {
  return (
    <label style={{ fontSize: '0.8rem', color: accent ? 'var(--accent)' : 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
      {children}
    </label>
  );
}

function UploadZone({ onFile, hint, fileName }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files) => {
    const file = files && files[0];
    if (file && file.type.startsWith('image/')) onFile(file);
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
        accept="image/*"
        onChange={(e) => handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />
      <Upload size={22} color="var(--accent)" style={{ marginBottom: '0.5rem' }} />
      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
        {fileName || 'Arrastrá una imagen o hacé clic para subir'}
      </div>
      {hint && <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', marginTop: '0.3rem' }}>{hint}</div>}
    </div>
  );
}

export default function ToolsSection() {
  const [activeTab, setActiveTab] = useState('colour');
  const [copiedCode, setCopiedCode] = useState(null);
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // ---------------------------------------------------------------------
  // TAB 1 — COLOR MULTIFORMATO, PANTONE, PALETAS TAILWIND, ARMONÍAS Y DALTONISMO
  // ---------------------------------------------------------------------
  const [colorInput, setColorInput] = useState('#BAFDC1');

  // Universal parser + instant auto-updating for all 4 downstream panels
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
      pantoneName: pantoneMatch.code,
      pantoneHex: pantoneMatch.hex,
      pantoneSimilarity: pantoneMatch.similarity,
      pantoneDeltaE: pantoneMatch.deltaE,
      r, g, b, a: a !== undefined ? a : 1, h, s, l, c, m, y, k
    };
  }, [colorInput]);

  const tailwindShades = useMemo(() => generateTailwindShades(colorData.r, colorData.g, colorData.b), [colorData]);
  const harmonies = useMemo(() => generateHarmonies(colorData.hex), [colorData.hex]);
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

  // ---------------------------------------------------------------------
  // TAB 2 — SVG OPTIMIZER
  // ---------------------------------------------------------------------
  const [rawSvg, setRawSvg] = useState(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <!-- Generated by Kalpagrafica SVGO -->
  <g id="Layer_1" data-name="Layer 1">
    <path fill="#BAFDC1" d="M50 10 L90 90 L10 90 Z" />
    <circle cx="50" cy="60" r="15" fill="#111114" />
  </g>
</svg>`);

  const optimizedSvg = useMemo(() => {
    let clean = rawSvg;
    clean = clean.replace(/<!--[\s\S]*?-->/g, '');
    clean = clean.replace(/<title>[\s\S]*?<\/title>/gi, '');
    clean = clean.replace(/<desc>[\s\S]*?<\/desc>/gi, '');
    clean = clean.replace(/\s+(id|data-name)="[^"]*"/gi, '');
    clean = clean.replace(/\s+/g, ' ').replace(/> </g, '><').trim();
    return clean;
  }, [rawSvg]);

  // ---------------------------------------------------------------------
  // TAB 3 — ANÁLISIS DE IMAGEN: PALETA + SIMULADOR DE DALTONISMO
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

  // ---------------------------------------------------------------------
  // TAB 4 — SOCIAL CROPPER & MATTE
  // ---------------------------------------------------------------------
  const SOCIAL_PRESETS = [
    { id: 'square', label: 'Instagram Post / Avatar', ratio: '1:1', w: 1080, h: 1080 },
    { id: 'portrait', label: 'Instagram Portrait', ratio: '4:5', w: 1080, h: 1350 },
    { id: 'landscape', label: 'YouTube / Banner', ratio: '16:9', w: 1920, h: 1080 },
    { id: 'story', label: 'TikTok / Reels / Stories', ratio: '9:16', w: 1080, h: 1920 },
    { id: 'cover', label: 'Portada Facebook', ratio: '205:78', w: 820, h: 312 }
  ];
  const [socialImg, setSocialImg] = useState(null);
  const [socialFileName, setSocialFileName] = useState('');
  const [socialPreset, setSocialPreset] = useState('square');
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [matteColor, setMatteColor] = useState('#111114');
  const [useMatte, setUseMatte] = useState(false);
  const socialCanvasRef = useRef(null);
  const preset = SOCIAL_PRESETS.find((p) => p.id === socialPreset);

  const handleSocialUpload = async (file) => {
    const { img } = await loadImageFromFile(file);
    setSocialImg(img);
    setSocialFileName(file.name);
  };

  useEffect(() => {
    if (!socialImg || !socialCanvasRef.current) return;
    const canvas = socialCanvasRef.current;
    const previewScale = Math.min(1, 480 / Math.max(preset.w, preset.h));
    canvas.width = Math.round(preset.w * previewScale);
    canvas.height = Math.round(preset.h * previewScale);
    const ctx = canvas.getContext('2d');
    drawCover(ctx, socialImg, canvas.width, canvas.height, offsetX, offsetY, useMatte ? matteColor : null);
  }, [socialImg, preset, offsetX, offsetY, matteColor, useMatte]);

  const downloadSocialCrop = () => {
    if (!socialImg) return;
    const canvas = document.createElement('canvas');
    canvas.width = preset.w;
    canvas.height = preset.h;
    const ctx = canvas.getContext('2d');
    drawCover(ctx, socialImg, preset.w, preset.h, offsetX, offsetY, useMatte ? matteColor : null);
    downloadCanvas(canvas, `kalpa-${preset.id}-${preset.w}x${preset.h}.png`);
  };

  // ---------------------------------------------------------------------
  // TAB 5 — ASSETS: FAVICON, CONVERSOR DE FORMATO, MARCA DE AGUA
  // ---------------------------------------------------------------------
  const [assetSubTab, setAssetSubTab] = useState('favicon');

  // Favicon
  const [faviconImg, setFaviconImg] = useState(null);
  const [faviconFileName, setFaviconFileName] = useState('');
  const handleFaviconUpload = async (file) => {
    const { img } = await loadImageFromFile(file);
    setFaviconImg(img);
    setFaviconFileName(file.name);
  };
  const downloadFaviconSize = (size) => {
    if (!faviconImg) return;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    drawContain(canvas.getContext('2d'), faviconImg, size, size);
    downloadCanvas(canvas, `favicon-${size}x${size}.png`);
  };

  // Conversor de formato
  const [converterImg, setConverterImg] = useState(null);
  const [converterFileName, setConverterFileName] = useState('');
  const [converterFormat, setConverterFormat] = useState('image/webp');
  const [converterQuality, setConverterQuality] = useState(0.85);
  const [convertedSizeKb, setConvertedSizeKb] = useState(null);
  const converterCanvasRef = useRef(null);

  const handleConverterUpload = async (file) => {
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

  // Marca de agua
  const [wmImg, setWmImg] = useState(null);
  const [wmFileName, setWmFileName] = useState('');
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
      fontSize: wmFontSize * scale, position: wmPosition, tiled: wmTiled
    });
  }, [wmImg, wmText, wmColor, wmOpacity, wmFontSize, wmPosition, wmTiled]);

  const downloadWatermarked = () => {
    if (!wmImg) return;
    const canvas = document.createElement('canvas');
    canvas.width = wmImg.width;
    canvas.height = wmImg.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(wmImg, 0, 0);
    drawWatermark(ctx, canvas.width, canvas.height, {
      text: wmText, color: wmColor, opacity: wmOpacity, fontSize: wmFontSize, position: wmPosition, tiled: wmTiled
    });
    downloadCanvas(canvas, 'kalpa-marca-de-agua.png');
  };

  // ---------------------------------------------------------------------
  // TAB 6 — TIPOGRAFÍA, MEDIDAS Y PAPEL
  // ---------------------------------------------------------------------
  const [baseWidth, setBaseWidth] = useState(1920);
  const [baseHeight, setBaseHeight] = useState(1080);
  const [newWidth, setNewWidth] = useState(1080);
  const calculatedHeight = useMemo(() => {
    if (!baseWidth || !baseHeight || !newWidth) return 0;
    return Math.round((newWidth * baseHeight) / baseWidth);
  }, [baseWidth, baseHeight, newWidth]);

  const [baseFontSize, setBaseFontSize] = useState(16);
  const [scaleRatio, setScaleRatio] = useState(1.25);
  const fontScaleList = useMemo(() => {
    const steps = [-2, -1, 0, 1, 2, 3, 4, 5];
    return steps.map((step) => {
      const px = Math.round(baseFontSize * Math.pow(scaleRatio, step));
      return { step, px, rem: (px / 16).toFixed(3) };
    });
  }, [baseFontSize, scaleRatio]);

  const [rootFontSize, setRootFontSize] = useState(16);
  const [pxInput, setPxInput] = useState(24);
  const remOutput = (pxInput / rootFontSize).toFixed(3);

  const [lhFontSize, setLhFontSize] = useState(16);
  const [lhRatio, setLhRatio] = useState(1.5);
  const lhPx = Math.round(lhFontSize * lhRatio);

  const [wcText, setWcText] = useState('');
  const wcStats = useMemo(() => {
    const trimmed = wcText.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = wcText.length;
    const charsNoSpaces = wcText.replace(/\s/g, '').length;
    const readingMinutes = words ? Math.max(1, Math.round(words / 200)) : 0;
    return { words, chars, charsNoSpaces, readingMinutes };
  }, [wcText]);

  const PAPER_SIZES = [
    { name: 'A4', mm: '210 × 297 mm', px300: '2480 × 3508 px' },
    { name: 'A5', mm: '148 × 210 mm', px300: '1748 × 2480 px' },
    { name: 'A3', mm: '297 × 420 mm', px300: '3508 × 4961 px' },
    { name: 'A2', mm: '420 × 594 mm', px300: '4961 × 7016 px' },
    { name: 'US Letter', mm: '216 × 279 mm', px300: '2550 × 3300 px' },
    { name: 'US Legal', mm: '216 × 356 mm', px300: '2550 × 4200 px' },
    { name: 'Tabloide', mm: '279 × 432 mm', px300: '3300 × 5100 px' }
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

  const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' };

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
          Suite utilitaria 100% nativa (sin subir tus archivos a ningún servidor) para diseñadores y desarrolladores:
          colorimetría OKLCH, coincidencia Pantone PMS, paletas, daltonismo, recorte social, favicons, conversión de formato, marca de agua,
          tipografía y los comandos equivalentes para la terminal <strong style={{ color: 'var(--accent)' }}>delphitools-cli</strong>.
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

      {/* TAB 1: COLOR MULTIFORMATO, PANTONE, PALETAS TAILWIND, ARMONÍAS Y DALTONISMO ------------ */}
      {activeTab === 'colour' && (
        <div style={gridStyle}>
          <ToolCard icon={Palette} title="Conversor de Color Multi-Espacio">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <input
                type="color"
                value={colorData.hex}
                onChange={(e) => setColorInput(e.target.value)}
                style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-md)', border: '2px solid var(--accent)', cursor: 'pointer', backgroundColor: 'transparent' }}
                title="Seleccionar color con el cuentagotas"
              />
              <div style={{ flex: 1 }}>
                <FieldLabel>Pegá o escribí tu color (HEX 6/8d, RGB, HSL, CMYK, OKLCH o Pantone)</FieldLabel>
                <input
                  type="text"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  placeholder="ej: ffd42aff, #ffd42a, rgb(255,212,42), cmyk(0,17,84,0), Pantone 115 C..."
                  className="input font-mono"
                  style={{ width: '100%', fontSize: '1rem', fontWeight: 700 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'HEX (6 dígitos)', val: colorData.hex },
                { label: 'HEX (8 dígitos con Alfa)', val: colorData.hex8 },
                { label: 'RGB', val: colorData.rgb },
                { label: 'HSL', val: colorData.hsl },
                { label: 'CMYK', val: colorData.cmyk },
                { label: 'OKLCH', val: colorData.oklch },
                { 
                  label: 'Coincidencia Pantone PMS Coated', 
                  val: `${colorData.pantoneName} (${colorData.pantoneHex}) — ${colorData.pantoneSimilarity} de coincidencia`,
                  customColor: colorData.pantoneHex
                }
              ].map((fmt) => (
                <div key={fmt.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  backgroundColor: 'var(--bg-surface-2)', padding: '0.65rem 0.9rem',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                    <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-disabled)', display: 'block' }}>{fmt.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {fmt.customColor && (
                        <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: fmt.customColor, border: '1px solid var(--border-subtle)' }} />
                      )}
                      <strong className="font-mono" style={{ fontSize: '0.88rem', color: 'var(--accent)', wordBreak: 'break-all' }}>{fmt.val}</strong>
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard(fmt.val, fmt.label)} title="Copiar valor">
                    {copiedCode === fmt.label ? <Check size={15} color="var(--accent)" /> : <Copy size={15} />}
                  </button>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '1.5rem', padding: '0.9rem', borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block' }}>Ratio de Contraste vs Fondo Oscuro</span>
                <strong className="font-mono" style={{ fontSize: '1.15rem', color: Number(contrastVsDark) >= 4.5 ? 'var(--accent)' : '#F87171' }}>
                  {contrastVsDark}:1 {Number(contrastVsDark) >= 4.5 ? '✓ (AA/AAA Pass)' : '⚠ (Bajo Contraste)'}
                </strong>
              </div>
            </div>
          </ToolCard>

          <ToolCard icon={Layers} title="Escala de Sombras Tailwind (50 — 950)" description="Se actualiza automáticamente al escribir o seleccionar cualquier color base. Hacé clic en cualquier sombra para aplicarla a todo el sistema.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {tailwindShades.map((shade) => (
                <div
                  key={shade.weight}
                  onClick={() => {
                    setColorInput(shade.hex);
                    copyToClipboard(shade.hex, `shade-${shade.weight}`);
                  }}
                  className="shade-item"
                  title="Hacé clic para seleccionar esta sombra como color activo y copiar su HEX"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    backgroundColor: shade.hex, color: shade.weight < 500 ? '#08080A' : '#FFFFFF',
                    padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    fontWeight: 600, fontSize: '0.85rem', transition: 'transform 0.15s ease'
                  }}
                >
                  <span className="font-mono">{shade.weight}</span>
                  <span className="font-mono">{shade.hex}</span>
                  {copiedCode === `shade-${shade.weight}` ? <Check size={15} /> : <Copy size={15} style={{ opacity: 0.7 }} />}
                </div>
              ))}
            </div>
          </ToolCard>

          <ToolCard icon={Droplet} title="Generador de Armonías Cromáticas" description="Esquemas calculados automáticamente en la rueda cromática HSL. Hacé clic en cualquier color para seleccionarlo como activo.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {harmonies.map((scheme) => (
                <div key={scheme.id}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>{scheme.label}</span>
                  <div style={{ display: 'flex', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                    {scheme.colors.map((c, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setColorInput(c);
                          copyToClipboard(c, `${scheme.id}-${i}`);
                        }}
                        title={`Hacé clic para seleccionar ${c} como activo y copiarlo`}
                        style={{ flex: 1, height: '40px', backgroundColor: c, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {copiedCode === `${scheme.id}-${i}` && <Check size={14} color="#08080A" />}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ToolCard>

          <ToolCard icon={ScanEye} title="Vista Rápida de Daltonismo" description="Simulación automática en tiempo real del color activo bajo distintos tipos de daltonismo.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {colorblindSwatches.map((cb) => (
                <div key={cb.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  backgroundColor: 'var(--bg-surface-2)', padding: '0.6rem 1rem',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)'
                }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{cb.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-disabled)' }}>{cb.hex}</span>
                    <div
                      onClick={() => setColorInput(cb.hex)}
                      title="Hacé clic para seleccionar este color simulado"
                      style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', backgroundColor: cb.hex, border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              ))}
              <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', marginTop: '0.4rem' }}>
                Para simular daltonismo sobre una imagen completa, usá la pestaña "Paleta & Daltonismo".
              </p>
            </div>
          </ToolCard>
        </div>
      )}

      {/* TAB 2: ANÁLISIS DE IMAGEN — PALETA + DALTONISMO ------------------ */}
      {activeTab === 'analysis' && (
        <div style={gridStyle}>
          <ToolCard icon={Palette} title="Extractor de Paleta desde Imagen" description="Subí una imagen y obtené los colores dominantes por cuantización de píxeles, con su porcentaje de presencia. Hacé clic en cualquier color extraído para cargarlo en el conversor.">
            <UploadZone onFile={handleAnalysisUpload} fileName={analysisFileName} hint="PNG, JPG o WEBP — se procesa en tu navegador" />
            {palette.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
                {palette.map((c, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setColorInput(c.hex);
                      copyToClipboard(c.hex, `pal-${i}`);
                      setActiveTab('colour');
                    }}
                    title="Hacé clic para seleccionar este color y abrir el conversor"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      backgroundColor: c.hex, padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer', fontWeight: 600
                    }}
                  >
                    <span className="font-mono" style={{ fontSize: '0.85rem', color: '#08080A', textShadow: '0 0 8px rgba(255,255,255,0.4)' }}>{c.hex}</span>
                    <span className="font-mono" style={{ fontSize: '0.78rem', color: '#08080A' }}>{c.pct}%</span>
                  </div>
                ))}
              </div>
            )}
          </ToolCard>

          <ToolCard icon={ScanEye} title="Simulador de Daltonismo sobre Imagen" description="Visualizá cómo se percibe tu diseño con distintos tipos de daltonismo (matrices simplificadas de uso estándar).">
            <UploadZone onFile={async (f) => { const { img } = await loadImageFromFile(f); setAnalysisImg(img); setAnalysisFileName(f.name); if (palette.length === 0) setPalette(extractPalette(img, 6)); }} fileName={analysisFileName} hint="Se procesa localmente, sin subir nada a un servidor" />

            {analysisImg && (
              <>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1.2rem 0' }}>
                  {COLORBLIND_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setCbType(t.id)}
                      className="font-caps"
                      style={{
                        padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.7rem',
                        border: cbType === t.id ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                        backgroundColor: cbType === t.id ? 'var(--accent-muted)' : 'transparent',
                        color: cbType === t.id ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer'
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <canvas ref={cbCanvasRef} style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }} />
              </>
            )}
          </ToolCard>
        </div>
      )}

      {/* TAB 3: SVG OPTIMIZER --------------------------------------------- */}
      {activeTab === 'svg' && (
        <ToolCard icon={Code} title="Optimizador & Limpiador SVG (SVGO)" description={<>Limpia etiquetas basura (<code>&lt;title&gt;</code>, <code>&lt;desc&gt;</code>, <code>id</code>, metadata de Illustrator/Inkscape) y comprime el código vectorial.</>}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div>
              <FieldLabel>SVG Original ({rawSvg.length} bytes)</FieldLabel>
              <textarea
                value={rawSvg}
                onChange={(e) => setRawSvg(e.target.value)}
                className="input font-mono"
                rows={12}
                style={{ width: '100%', fontSize: '0.82rem', lineHeight: 1.4 }}
                placeholder="Pega aquí el código <svg>..."
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--accent)' }}>SVG Optimizado ({optimizedSvg.length} bytes)</label>
                <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--accent)' }}>
                  Ahorro: {Math.max(0, Math.round((1 - optimizedSvg.length / (rawSvg.length || 1)) * 100))}%
                </span>
              </div>
              <textarea readOnly value={optimizedSvg} className="input font-mono" rows={12} style={{ width: '100%', fontSize: '0.82rem', lineHeight: 1.4, backgroundColor: 'var(--bg-surface-2)' }} />
              <button className="btn btn-primary btn-sm" onClick={() => copyToClipboard(optimizedSvg, 'svg-opt')} style={{ marginTop: '0.8rem', width: '100%', justifyContent: 'center' }}>
                {copiedCode === 'svg-opt' ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedCode === 'svg-opt' ? '¡Código SVG Copiado!' : 'Copiar SVG Optimizado'}</span>
              </button>
            </div>
          </div>
        </ToolCard>
      )}

      {/* TAB 4: SOCIAL CROPPER & MATTE ------------------------------------ */}
      {activeTab === 'social' && (
        <div style={gridStyle}>
          <ToolCard icon={Crop} title="Social Cropper" description="Subí una imagen, elegí el formato de destino y ajustá el foco del recorte. Todo se descarga en resolución completa.">
            <UploadZone onFile={handleSocialUpload} fileName={socialFileName} hint="El recorte se calcula sobre tu imagen original" />

            <div style={{ margin: '1.2rem 0' }}>
              <FieldLabel>Plataforma / Formato</FieldLabel>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
              <input type="checkbox" checked={useMatte} onChange={(e) => setUseMatte(e.target.checked)} id="matte-toggle" />
              <label htmlFor="matte-toggle" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rellenar fondo (matte) — útil para PNG transparentes</label>
              {useMatte && (
                <input type="color" value={matteColor} onChange={(e) => setMatteColor(e.target.value)} style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }} />
              )}
            </div>

            <button className="btn btn-primary" onClick={downloadSocialCrop} disabled={!socialImg} style={{ width: '100%', justifyContent: 'center' }}>
              <Download size={16} />
              <span>Descargar {preset.w}×{preset.h}px</span>
            </button>
          </ToolCard>

          <ToolCard icon={Maximize2} title="Vista Previa" description="Así se verá el recorte final.">
            {socialImg ? (
              <canvas ref={socialCanvasRef} style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-2)' }} />
            ) : (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '0.85rem', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                Subí una imagen para ver la vista previa
              </div>
            )}

            <div style={{ marginTop: '1.5rem' }}>
              <FieldLabel>Calculadora de Aspect Ratio</FieldLabel>
              <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.6rem' }}>
                <input type="number" value={baseWidth} onChange={(e) => setBaseWidth(Number(e.target.value))} className="input font-mono" placeholder="W1" />
                <input type="number" value={baseHeight} onChange={(e) => setBaseHeight(Number(e.target.value))} className="input font-mono" placeholder="H1" />
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <input type="number" value={newWidth} onChange={(e) => setNewWidth(Number(e.target.value))} className="input font-mono" placeholder="W2" />
                <div className="input font-mono" style={{ backgroundColor: 'var(--bg-surface-2)', fontWeight: 700, color: 'var(--accent)', textAlign: 'center' }}>
                  {calculatedHeight} px
                </div>
              </div>
            </div>
          </ToolCard>
        </div>
      )}

      {/* TAB 5: FAVICON, CONVERSOR DE FORMATO & MARCA DE AGUA ------------- */}
      {activeTab === 'assets' && (
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {[
              { id: 'favicon', label: 'Favicons', icon: FileImage },
              { id: 'convert', label: 'Conversor de Formato', icon: RefreshCw },
              { id: 'watermark', label: 'Marca de Agua', icon: Stamp }
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
            <ToolCard icon={FileImage} title="Generador de Favicons" description="Subí tu logo (idealmente cuadrado, con fondo transparente o sólido) y descargá cada tamaño necesario para web y dispositivos móviles.">
              <UploadZone onFile={handleFaviconUpload} fileName={faviconFileName} />
              {faviconImg && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                  {FAVICON_SIZES.map((size) => (
                    <div key={size} style={{ textAlign: 'center', backgroundColor: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', padding: '0.8rem', border: '1px solid var(--border-subtle)' }}>
                      <div style={{
                        width: Math.min(size, 64), height: Math.min(size, 64), margin: '0 auto 0.6rem',
                        backgroundImage: `url(${faviconImg.src})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center'
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
            <ToolCard icon={RefreshCw} title="Conversor de Formato de Imagen" description="Convertí entre PNG, JPEG y WEBP directamente en el navegador, con control de calidad de compresión.">
              <UploadZone onFile={handleConverterUpload} fileName={converterFileName} />
              {converterImg && (
                <>
                  <div style={{ display: 'flex', gap: '1rem', margin: '1.2rem 0' }}>
                    <div style={{ flex: 1 }}>
                      <FieldLabel>Formato de salida</FieldLabel>
                      <select value={converterFormat} onChange={(e) => setConverterFormat(e.target.value)} className="input font-mono">
                        <option value="image/webp">WEBP</option>
                        <option value="image/jpeg">JPEG</option>
                        <option value="image/png">PNG</option>
                      </select>
                    </div>
                    {converterFormat !== 'image/png' && (
                      <div style={{ flex: 1 }}>
                        <FieldLabel>Calidad ({Math.round(converterQuality * 100)}%)</FieldLabel>
                        <input type="range" min={0.3} max={1} step={0.05} value={converterQuality} onChange={(e) => setConverterQuality(Number(e.target.value))} style={{ width: '100%', marginTop: '0.8rem' }} />
                      </div>
                    )}
                  </div>
                  <canvas ref={converterCanvasRef} style={{ display: 'none' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-surface-2)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Tamaño estimado del archivo</span>
                    <strong className="font-mono" style={{ color: 'var(--accent)' }}>{convertedSizeKb ? `${convertedSizeKb} KB` : '...'}</strong>
                  </div>
                  <button className="btn btn-primary" onClick={downloadConverted} style={{ width: '100%', justifyContent: 'center' }}>
                    <Download size={16} /><span>Descargar Imagen Convertida</span>
                  </button>
                </>
              )}
            </ToolCard>
          )}

          {assetSubTab === 'watermark' && (
            <ToolCard icon={Stamp} title="Aplicador de Marca de Agua" description="Protegé tus diseños o muestras colocando un texto o logo de marca sobre tus imágenes.">
              <UploadZone onFile={handleWmUpload} fileName={wmFileName} />
              {wmImg && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', margin: '1.2rem 0' }}>
                    <div>
                      <FieldLabel>Texto de marca</FieldLabel>
                      <input type="text" value={wmText} onChange={(e) => setWmText(e.target.value)} className="input font-mono" />
                    </div>
                    <div>
                      <FieldLabel>Color del texto</FieldLabel>
                      <input type="color" value={wmColor} onChange={(e) => setWmColor(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }} />
                    </div>
                    <div>
                      <FieldLabel>Opacidad ({Math.round(wmOpacity * 100)}%)</FieldLabel>
                      <input type="range" min={0.1} max={1} step={0.05} value={wmOpacity} onChange={(e) => setWmOpacity(Number(e.target.value))} style={{ width: '100%', marginTop: '0.6rem' }} />
                    </div>
                    <div>
                      <FieldLabel>Tamaño de letra ({wmFontSize}px)</FieldLabel>
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

      {/* TAB 6: TIPOGRAFÍA & PAPEL ---------------------------------------- */}
      {activeTab === 'type' && (
        <div style={gridStyle}>
          <ToolCard icon={Type} title="Escala Tipográfica Modular" description="Genera jerarquías tipográficas proporcionales para h1, h2, h3, body, small a partir de un tamaño base y una razón de escala.">
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <FieldLabel>Tamaño Base (px)</FieldLabel>
                <input type="number" value={baseFontSize} onChange={(e) => setBaseFontSize(Number(e.target.value))} className="input font-mono" />
              </div>
              <div style={{ flex: 1 }}>
                <FieldLabel>Razón de Escala</FieldLabel>
                <select value={scaleRatio} onChange={(e) => setScaleRatio(Number(e.target.value))} className="input font-mono">
                  <option value={1.067}>1.067 — Minor Second</option>
                  <option value={1.125}>1.125 — Major Second</option>
                  <option value={1.2}>1.200 — Minor Third</option>
                  <option value={1.25}>1.250 — Major Third</option>
                  <option value={1.333}>1.333 — Perfect Fourth</option>
                  <option value={1.414}>1.414 — Augmented Fourth</option>
                  <option value={1.5}>1.500 — Perfect Fifth</option>
                  <option value={1.618}>1.618 — Golden Ratio</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {fontScaleList.map((item) => (
                <div key={item.step} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  backgroundColor: 'var(--bg-surface-2)', padding: '0.6rem 1rem',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)'
                }}>
                  <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-disabled)' }}>Paso {item.step > 0 ? `+${item.step}` : item.step}</span>
                  <strong className="font-mono" style={{ fontSize: '0.92rem', color: 'var(--accent)' }}>{item.px}px</strong>
                  <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.rem}rem</span>
                </div>
              ))}
            </div>
          </ToolCard>

          <ToolCard icon={Ruler} title="Calculadoras de PX a REM & Line Height" description="Conversiones inmediatas para hojas de estilo CSS.">
            <div style={{ marginBottom: '1.8rem' }}>
              <FieldLabel>Conversor PX → REM</FieldLabel>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.6rem' }}>
                <input type="number" value={rootFontSize} onChange={(e) => setRootFontSize(Number(e.target.value))} className="input font-mono" placeholder="Root (16)" style={{ width: '90px' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-disabled)' }}>px root</span>
                <input type="number" value={pxInput} onChange={(e) => setPxInput(Number(e.target.value))} className="input font-mono" placeholder="PX" style={{ flex: 1 }} />
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.7rem 1rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Resultado REM</span>
                <strong className="font-mono" style={{ color: 'var(--accent)' }}>{remOutput}rem</strong>
              </div>
            </div>

            <div>
              <FieldLabel>Line Height Óptimo</FieldLabel>
              <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.6rem' }}>
                <input type="number" value={lhFontSize} onChange={(e) => setLhFontSize(Number(e.target.value))} className="input font-mono" placeholder="Font px" />
                <input type="number" step={0.05} value={lhRatio} onChange={(e) => setLhRatio(Number(e.target.value))} className="input font-mono" placeholder="Ratio (1.5)" />
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.7rem 1rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Line-Height en PX</span>
                <strong className="font-mono" style={{ color: 'var(--accent)' }}>{lhPx}px</strong>
              </div>
            </div>
          </ToolCard>

          <ToolCard icon={Printer} title="Formatos de Papel Estándar (ISO 216 & US)" description="Medidas físicas en mm y resolución recomendada de impresión a 300 DPI.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {PAPER_SIZES.map((paper) => (
                <div key={paper.name} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  backgroundColor: 'var(--bg-surface-2)', padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)'
                }}>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', width: '80px' }}>{paper.name}</strong>
                  <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{paper.mm}</span>
                  <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--accent)' }}>{paper.px300} @300dpi</span>
                </div>
              ))}
            </div>
          </ToolCard>

          <ToolCard icon={Type} title="Contador de Palabras & Tiempo de Lectura" description="Analizador de longitud para textos editoriales y copys publicitarios.">
            <textarea
              value={wcText}
              onChange={(e) => setWcText(e.target.value)}
              className="input font-mono"
              rows={5}
              style={{ width: '100%', fontSize: '0.85rem', marginBottom: '1rem' }}
              placeholder="Escribí o pegá tu texto aquí..."
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
              <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-disabled)', display: 'block' }}>Palabras</span>
                <strong className="font-mono" style={{ fontSize: '1.1rem', color: 'var(--accent)' }}>{wcStats.words}</strong>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-disabled)', display: 'block' }}>Caracteres</span>
                <strong className="font-mono" style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{wcStats.chars}</strong>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-disabled)', display: 'block' }}>Sin espacios</span>
                <strong className="font-mono" style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{wcStats.charsNoSpaces}</strong>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-disabled)', display: 'block' }}>Tiempo lectura</span>
                <strong className="font-mono" style={{ fontSize: '1.1rem', color: 'var(--accent)' }}>~{wcStats.readingMinutes} min</strong>
              </div>
            </div>
          </ToolCard>
        </div>
      )}

      {/* TAB 7: COMANDOS CLI ---------------------------------------------- */}
      {activeTab === 'cli' && (
        <ToolCard icon={Terminal} title="Terminal delphitools-cli — Equivalencias" description="Si preferís trabajar desde la consola de comandos de Linux/macOS, instalá delphitools-cli para acceder a las mismas funciones en tu terminal.">
          <div style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <FieldLabel accent>Comando de Instalación Global</FieldLabel>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-surface-2)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)' }}>
              <code className="font-mono" style={{ fontSize: '0.92rem', color: 'var(--accent)' }}>npm install -g delphitools-cli</code>
              <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard('npm install -g delphitools-cli', 'cli-inst')}>
                {copiedCode === 'cli-inst' ? <Check size={16} color="var(--accent)" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {[
              { cmd: 'dt colour ffd42aff', desc: 'Convierte ffd42aff a RGB, HSL, CMYK, OKLCH y su Pantone más cercano' },
              { cmd: 'dt pantone 115-c', desc: 'Muestra la ficha técnica Pantone PMS con su equivalencia HEX y RGB' },
              { cmd: 'dt tailwind-shades #BAFDC1', desc: 'Genera las 11 sombras de 50 a 950 para Tailwind CSS' },
              { cmd: 'dt harmony #BAFDC1', desc: 'Genera esquemas complementarios, análogos, triádicos y tetrádicos' },
              { cmd: 'dt colorblind --type protanopia logo.png', desc: 'Simula el efecto de protanopía sobre una imagen' },
              { cmd: 'dt social-crop --preset square avatar.jpg', desc: 'Recorta y centra una imagen para redes sociales' },
              { cmd: 'dt svgo --clean logo.svg', desc: 'Optimiza y limpia código vectorial SVG' },
              { cmd: 'dt favicon logo.png', desc: 'Genera el paquete completo de favicons en todos los tamaños' }
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
