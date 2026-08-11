import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Wrench, Palette, Check, Copy, Download,
  Terminal, Layers, Type, Maximize2, Code, Upload, Crop, Droplet,
  FileImage, Printer, Ruler, ScanEye, Stamp, RefreshCw
} from 'lucide-react';
import {
  hexToRgb, rgbToHsl, approxOklch, contrastRatio,
  generateTailwindShades, generateHarmonies, COLORBLIND_TYPES, simulateColorblind
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
  // TAB 1 — COLOR, PALETAS TAILWIND, ARMONÍAS Y DALTONISMO (por color base)
  // ---------------------------------------------------------------------
  const [hexColor, setHexColor] = useState('#BAFDC1');
  const colorData = useMemo(() => {
    const { r, g, b } = hexToRgb(hexColor);
    const { h, s, l } = rgbToHsl(r, g, b);
    return {
      hex: `#${(('000000' + ((r << 16) | (g << 8) | b).toString(16)).slice(-6)).toUpperCase()}`,
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${h}, ${s}%, ${l}%)`,
      oklch: approxOklch(r, g, b),
      r, g, b, h, s, l
    };
  }, [hexColor]);

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
          colorimetría OKLCH, paletas, daltonismo, recorte social, favicons, conversión de formato, marca de agua,
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

      {/* TAB 1: COLOR, PALETAS TAILWIND, ARMONÍAS Y DALTONISMO ------------ */}
      {activeTab === 'colour' && (
        <div style={gridStyle}>
          <ToolCard icon={Palette} title="Conversor de Color Multi-Espacio">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.8rem' }}>
              <input
                type="color"
                value={colorData.hex}
                onChange={(e) => setHexColor(e.target.value)}
                style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)', border: '2px solid var(--accent)', cursor: 'pointer', backgroundColor: 'transparent' }}
              />
              <div style={{ flex: 1 }}>
                <FieldLabel>HEX Color</FieldLabel>
                <input
                  type="text"
                  value={hexColor}
                  onChange={(e) => setHexColor(e.target.value)}
                  className="input font-mono"
                  style={{ width: '100%', fontSize: '1.1rem', fontWeight: 700 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {[
                { label: 'HEX', val: colorData.hex },
                { label: 'RGB', val: colorData.rgb },
                { label: 'HSL', val: colorData.hsl },
                { label: 'OKLCH', val: colorData.oklch }
              ].map((fmt) => (
                <div key={fmt.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  backgroundColor: 'var(--bg-surface-2)', padding: '0.7rem 1rem',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)'
                }}>
                  <div>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', display: 'block' }}>{fmt.label}</span>
                    <strong className="font-mono" style={{ fontSize: '0.92rem', color: 'var(--accent)' }}>{fmt.val}</strong>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard(fmt.val, fmt.label)} title="Copiar formato">
                    {copiedCode === fmt.label ? <Check size={16} color="var(--accent)" /> : <Copy size={16} />}
                  </button>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '1.8rem', padding: '1rem', borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Ratio de Contraste vs Fondo Oscuro</span>
                <strong className="font-mono" style={{ fontSize: '1.2rem', color: Number(contrastVsDark) >= 4.5 ? 'var(--accent)' : '#F87171' }}>
                  {contrastVsDark}:1 {Number(contrastVsDark) >= 4.5 ? '✓ (AA/AAA Pass)' : '⚠ (Bajo Contraste)'}
                </strong>
              </div>
            </div>
          </ToolCard>

          <ToolCard icon={Layers} title="Escala de Sombras Tailwind (50 — 950)" description="Genera una paleta de 11 niveles de brillo calculados matemáticamente para tu sistema de diseño.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {tailwindShades.map((shade) => (
                <div
                  key={shade.weight}
                  onClick={() => copyToClipboard(shade.hex, `shade-${shade.weight}`)}
                  className="shade-item"
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

          <ToolCard icon={Droplet} title="Generador de Armonías Cromáticas" description="Esquemas calculados a partir del color base en la rueda cromática HSL.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {harmonies.map((scheme) => (
                <div key={scheme.id}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>{scheme.label}</span>
                  <div style={{ display: 'flex', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                    {scheme.colors.map((c, i) => (
                      <div
                        key={i}
                        onClick={() => copyToClipboard(c, `${scheme.id}-${i}`)}
                        title={c}
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

          <ToolCard icon={ScanEye} title="Vista Rápida de Daltonismo" description="Simulación aproximada del color base bajo distintos tipos de daltonismo.">
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
                    <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', backgroundColor: cb.hex, border: '1px solid var(--border-subtle)' }} />
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
          <ToolCard icon={Palette} title="Extractor de Paleta desde Imagen" description="Subí una imagen y obtené los colores dominantes por cuantización de píxeles, con su porcentaje de presencia.">
            <UploadZone onFile={handleAnalysisUpload} fileName={analysisFileName} hint="PNG, JPG o WEBP — se procesa en tu navegador" />
            {palette.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
                {palette.map((c, i) => (
                  <div
                    key={i}
                    onClick={() => copyToClipboard(c.hex, `pal-${i}`)}
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
            <div style={gridStyle}>
              <ToolCard icon={Stamp} title="Generador de Marca de Agua" description="Aplicá una marca de agua de texto sobre tu imagen, con control de opacidad, tamaño, posición y mosaico.">
                <UploadZone onFile={handleWmUpload} fileName={wmFileName} />
                <div style={{ marginTop: '1.2rem' }}>
                  <FieldLabel>Texto</FieldLabel>
                  <input type="text" value={wmText} onChange={(e) => setWmText(e.target.value)} className="input font-mono" style={{ marginBottom: '1rem' }} />

                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <FieldLabel>Color</FieldLabel>
                      <input type="color" value={wmColor} onChange={(e) => setWmColor(e.target.value)} style={{ width: '100%', height: '42px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <FieldLabel>Posición</FieldLabel>
                      <select value={wmPosition} onChange={(e) => setWmPosition(e.target.value)} className="input font-mono" disabled={wmTiled}>
                        <option value="bottom-right">Abajo Derecha</option>
                        <option value="bottom-left">Abajo Izquierda</option>
                        <option value="top-right">Arriba Derecha</option>
                        <option value="top-left">Arriba Izquierda</option>
                        <option value="center">Centro</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <FieldLabel>Opacidad ({Math.round(wmOpacity * 100)}%)</FieldLabel>
                      <input type="range" min={0.1} max={1} step={0.05} value={wmOpacity} onChange={(e) => setWmOpacity(Number(e.target.value))} style={{ width: '100%' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <FieldLabel>Tamaño de fuente ({wmFontSize}px)</FieldLabel>
                      <input type="range" min={12} max={96} value={wmFontSize} onChange={(e) => setWmFontSize(Number(e.target.value))} style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
                    <input type="checkbox" checked={wmTiled} onChange={(e) => setWmTiled(e.target.checked)} id="wm-tiled" />
                    <label htmlFor="wm-tiled" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Repetir en mosaico diagonal (protección anti-copia)</label>
                  </div>

                  <button className="btn btn-primary" onClick={downloadWatermarked} disabled={!wmImg} style={{ width: '100%', justifyContent: 'center' }}>
                    <Download size={16} /><span>Descargar Imagen con Marca de Agua</span>
                  </button>
                </div>
              </ToolCard>

              <ToolCard icon={Maximize2} title="Vista Previa">
                {wmImg ? (
                  <canvas ref={wmCanvasRef} style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }} />
                ) : (
                  <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '0.85rem', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                    Subí una imagen para ver la vista previa
                  </div>
                )}
              </ToolCard>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: TIPOGRAFÍA, MEDIDAS Y PAPEL -------------------------------- */}
      {activeTab === 'type' && (
        <div style={gridStyle}>
          <ToolCard icon={Type} title="Escala Tipográfica Modular">
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.2rem' }}>
              <div style={{ flex: 1 }}>
                <FieldLabel>Base (px)</FieldLabel>
                <input type="number" value={baseFontSize} onChange={(e) => setBaseFontSize(Number(e.target.value))} className="input font-mono" />
              </div>
              <div style={{ flex: 1 }}>
                <FieldLabel>Proporción</FieldLabel>
                <select value={scaleRatio} onChange={(e) => setScaleRatio(Number(e.target.value))} className="input font-mono">
                  <option value={1.125}>1.125 — Major Second</option>
                  <option value={1.200}>1.200 — Minor Third</option>
                  <option value={1.250}>1.250 — Major Third</option>
                  <option value={1.414}>1.414 — Aug Fourth</option>
                  <option value={1.618}>1.618 — Golden Ratio</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {fontScaleList.map((item) => (
                <div key={item.step} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.8rem', backgroundColor: 'var(--bg-surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Nivel {item.step > 0 ? `+${item.step}` : item.step}</span>
                  <strong className="font-mono" style={{ fontSize: '0.9rem', color: 'var(--accent)' }}>{item.px} px</strong>
                  <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-disabled)' }}>{item.rem} rem</span>
                </div>
              ))}
            </div>
          </ToolCard>

          <ToolCard icon={Ruler} title="Conversor PX ⇄ REM y Line-Height">
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.6rem' }}>
                <div style={{ flex: 1 }}>
                  <FieldLabel>Tamaño raíz (px)</FieldLabel>
                  <input type="number" value={rootFontSize} onChange={(e) => setRootFontSize(Number(e.target.value) || 16)} className="input font-mono" />
                </div>
                <div style={{ flex: 1 }}>
                  <FieldLabel>Valor en PX</FieldLabel>
                  <input type="number" value={pxInput} onChange={(e) => setPxInput(Number(e.target.value))} className="input font-mono" />
                </div>
              </div>
              <div className="input font-mono" style={{ backgroundColor: 'var(--bg-surface-2)', fontWeight: 700, color: 'var(--accent)', textAlign: 'center' }}>
                {pxInput}px = {remOutput}rem
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.6rem' }}>
                <div style={{ flex: 1 }}>
                  <FieldLabel>Font-size (px)</FieldLabel>
                  <input type="number" value={lhFontSize} onChange={(e) => setLhFontSize(Number(e.target.value))} className="input font-mono" />
                </div>
                <div style={{ flex: 1 }}>
                  <FieldLabel>Ratio (unitless)</FieldLabel>
                  <input type="number" step={0.05} value={lhRatio} onChange={(e) => setLhRatio(Number(e.target.value))} className="input font-mono" />
                </div>
              </div>
              <div className="input font-mono" style={{ backgroundColor: 'var(--bg-surface-2)', fontWeight: 700, color: 'var(--accent)', textAlign: 'center' }}>
                line-height: {lhRatio} ({lhPx}px) {lhRatio >= 1.2 && lhRatio <= 1.6 ? '✓ rango recomendado' : '⚠ fuera de 1.2–1.6'}
              </div>
            </div>
          </ToolCard>

          <ToolCard icon={Type} title="Contador de Palabras y Caracteres">
            <textarea
              value={wcText}
              onChange={(e) => setWcText(e.target.value)}
              className="input font-mono"
              rows={8}
              placeholder="Pegá tu copy, bajada o texto de producto acá..."
              style={{ width: '100%', marginBottom: '1rem' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
              {[
                { label: 'Palabras', val: wcStats.words },
                { label: 'Caracteres', val: wcStats.chars },
                { label: 'Sin espacios', val: wcStats.charsNoSpaces },
                { label: 'Lectura (min)', val: wcStats.readingMinutes }
              ].map((s) => (
                <div key={s.label} style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                  <div className="font-mono" style={{ fontSize: '1.1rem', color: 'var(--accent)', fontWeight: 700 }}>{s.val}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </ToolCard>

          <ToolCard icon={Printer} title="Tamaños de Papel de Referencia" description="Medidas físicas y su equivalente en píxeles a 300 DPI (resolución de impresión estándar).">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {PAPER_SIZES.map((p) => (
                <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-surface-2)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{p.name}</strong>
                  <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{p.mm}</span>
                  <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--accent)' }}>{p.px300}</span>
                </div>
              ))}
            </div>
          </ToolCard>
        </div>
      )}

      {/* TAB 7: CLI TERMINAL REFERENCE ------------------------------------- */}
      {activeTab === 'cli' && (
        <ToolCard icon={Terminal} title="delphitools-cli — Guía de Comandos para Terminal" description="Ejecutá las mismas herramientas en tu terminal Linux/Mac/Windows de forma 100% offline y sin telemetría.">
          <div style={{ backgroundColor: '#08080A', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-disabled)' }}>Instalación vía Cargo / Rust</span>
              <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard('cargo install delphitools-cli', 'cargo-ins')}>
                {copiedCode === 'cargo-ins' ? <Check size={15} color="var(--accent)" /> : <Copy size={15} />}
              </button>
            </div>
            <code className="font-mono" style={{ color: 'var(--accent)', fontSize: '0.95rem', display: 'block' }}>cargo install delphitools-cli</code>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
            {[
              { cmd: 'dt colour #BAFDC1 -j', desc: 'Convierte color a HEX, RGB, HSL, OKLCH en JSON' },
              { cmd: 'dt tailwind-shades #BAFDC1', desc: 'Genera escala de sombras 50-950 en la consola' },
              { cmd: 'dt harmony #BAFDC1 --scheme triadic', desc: 'Genera esquemas de armonía cromática' },
              { cmd: 'dt colorblind-sim logo.png --type deuteranopia', desc: 'Simula percepción con daltonismo sobre una imagen' },
              { cmd: 'dt palette-genny photo.jpg -n 6', desc: 'Extrae la paleta dominante de una imagen' },
              { cmd: 'dt contrast #BAFDC1 #111114', desc: 'Calcula ratio de contraste WCAG AA/AAA' },
              { cmd: 'dt svgo logo.svg -o clean.svg', desc: 'Optimiza y remueve metadata de un archivo SVG' },
              { cmd: 'dt social-cropper photo.jpg --preset ig-post', desc: 'Recorta imagen a proporciones de redes sociales' },
              { cmd: 'dt matte-generator logo.png --bg "#111114"', desc: 'Aplica un fondo sólido detrás de un PNG transparente' },
              { cmd: 'dt watermarker photo.jpg --text "KALPA"', desc: 'Agrega marca de agua de texto a una imagen' },
              { cmd: 'dt favicon-genny logo.svg', desc: 'Genera favicons para la web (16, 32, 180, 512px)' },
              { cmd: 'dt image-converter photo.png --to webp', desc: 'Convierte una imagen entre PNG, JPEG y WEBP' },
              { cmd: 'dt px2rem 24 --base 16', desc: 'Convierte píxeles a rem según tamaño raíz' },
              { cmd: 'dt line-height-calc 16 --ratio 1.5', desc: 'Calcula altura de línea recomendada' },
              { cmd: 'dt word-counter texto.txt', desc: 'Cuenta palabras, caracteres y tiempo de lectura' },
              { cmd: 'dt paper-sizes A4 --dpi 300', desc: 'Devuelve medidas de papel en mm y píxeles' }
            ].map((c) => (
              <div key={c.cmd} style={{ backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <code className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--accent)' }}>{c.cmd}</code>
                  <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard(c.cmd, c.cmd)} style={{ padding: '0.2rem' }}>
                    {copiedCode === c.cmd ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
                  </button>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>{c.desc}</span>
              </div>
            ))}
          </div>
        </ToolCard>
      )}

      <style>{`
        .shade-item:hover { transform: scale(1.02); }
      `}</style>
    </section>
  );
}
