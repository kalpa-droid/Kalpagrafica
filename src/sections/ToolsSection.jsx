import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Wrench, Palette, Check, Copy, Download,
  Terminal, Layers, Type, Maximize2, Code, Upload, Crop, Droplet,
  FileImage, Printer, Ruler, ScanEye, Stamp, RefreshCw, Eye, Sparkles
} from 'lucide-react';
import {
  hexToRgb, rgbToHex, rgbToHsl, rgbToCmyk, cmykToRgb, approxOklch, contrastRatio,
  generateTailwindShades, generateHarmonies, COLORBLIND_TYPES, simulateColorblind,
  parseAnyColorInput, findClosestPantone
} from '../utils/color';
import {
  loadImageFromFile, loadSvgTextFromFile, svgToImage, recolorSvgText, downloadCanvas, drawCover, drawContain,
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
  // TAB 3 — SVG OPTIMIZER CON CARGA DE ARCHIVOS .SVG Y VISTA PREVIA VISUAL EN TIEMPO REAL
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
    let clean = rawSvg;
    clean = clean.replace(/<!--[\s\S]*?-->/g, '');
    clean = clean.replace(/<title>[\s\S]*?<\/title>/gi, '');
    clean = clean.replace(/<desc>[\s\S]*?<\/desc>/gi, '');
    clean = clean.replace(/\s+(id|data-name)="[^"]*"/gi, '');
    clean = clean.replace(/\s+/g, ' ').replace(/> </g, '><').trim();
    return clean;
  }, [rawSvg]);

  // ---------------------------------------------------------------------
  // TAB 4 — SOCIAL CROPPER MULTI-PRESETS Y WEBP / CALIDAD DE COMPRESIÓN
  // ---------------------------------------------------------------------
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
  // TAB 6 — TIPOGRAFÍA & PAPEL EN 4 COLUMNAS (2x2) CON MUESTRARIOS VISUALES
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
    const steps = [-1, 0, 1, 2, 3, 4];
    const tags = ['Small Body', 'Body Regular (Base)', 'H4 Subtitle', 'H3 Section Title', 'H2 Main Title', 'H1 Hero Title'];
    return steps.map((step, idx) => {
      const px = Math.round(baseFontSize * Math.pow(scaleRatio, step));
      return { step, px, rem: (px / 16).toFixed(3), label: tags[idx] };
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

    return {
      words, chars, charsNoSpaces, readingMinutes,
      limits: [
        { platform: 'Instagram Caption', limit: 2200, current: chars, pct: Math.min(100, Math.round((chars / 2200) * 100)) },
        { platform: 'Twitter / X', limit: 280, current: chars, pct: Math.min(100, Math.round((chars / 280) * 100)) },
        { platform: 'TikTok Caption', limit: 4000, current: chars, pct: Math.min(100, Math.round((chars / 4000) * 100)) },
        { platform: 'LinkedIn Post', limit: 3000, current: chars, pct: Math.min(100, Math.round((chars / 3000) * 100)) },
        { platform: 'YouTube Description', limit: 5000, current: chars, pct: Math.min(100, Math.round((chars / 5000) * 100)) }
      ]
    };
  }, [wcText]);

  const PAPER_SIZES = [
    { name: 'A4', mm: '210 × 297 mm', px300: '2480 × 3508 px', scalePct: 70 },
    { name: 'A5', mm: '148 × 210 mm', px300: '1748 × 2480 px', scalePct: 50 },
    { name: 'A3', mm: '297 × 420 mm', px300: '3508 × 4961 px', scalePct: 90 },
    { name: 'A2', mm: '420 × 594 mm', px300: '4961 × 7016 px', scalePct: 100 },
    { name: 'US Letter', mm: '216 × 279 mm', px300: '2550 × 3300 px', scalePct: 72 },
    { name: 'US Legal', mm: '216 × 356 mm', px300: '2550 × 4200 px', scalePct: 85 }
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
  const gridStyle4Col = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' };

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
          escala tipográfica visual y los comandos equivalentes para la terminal <strong style={{ color: 'var(--accent)' }}>delphitools-cli</strong>.
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

      {/* TAB 3: SVG OPTIMIZER CON CARGA DE ARCHIVOS .SVG Y VISTA PREVIA VISUAL EN TIEMPO REAL ---------------- */}
      {activeTab === 'svg' && (
        <ToolCard icon={Code} title="Optimizador & Limpiador SVG (SVGO)" description={<>Limpia metadata y comprime el código vectorial de cualquier archivo .svg con vista previa gráfica en vivo.</>}>
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

              <button className="btn btn-primary btn-sm" onClick={() => copyToClipboard(optimizedSvg, 'svg-opt')} style={{ width: '100%', justifyContent: 'center' }}>
                {copiedCode === 'svg-opt' ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedCode === 'svg-opt' ? '¡Código SVG Copiado!' : 'Copiar SVG Optimizado'}</span>
              </button>
            </div>
          </div>
        </ToolCard>
      )}

      {/* TAB 4: SOCIAL CROPPER MULTI-PRESETS Y WEBP / COMPRESIÓN -------------------- */}
      {activeTab === 'social' && (
        <div style={gridStyle3Col}>
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
              <span>Descargar {preset.w}×{preset.h}px ({cropFormat.split('/')[1].toUpperCase()})</span>
            </button>
          </ToolCard>

          <ToolCard icon={Maximize2} title="Vista Previa del Recorte" description="Visualizá exactamente cómo se encuadra tu imagen.">
            {socialImg ? (
              <canvas ref={socialCanvasRef} style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-2)' }} />
            ) : (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '0.85rem', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                Subí una imagen para ver la vista previa
              </div>
            )}

            <div style={{ marginTop: '1.5rem' }}>
              <FieldLabel>Calculadora de Aspect Ratio Personalizada</FieldLabel>
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

      {/* TAB 5: FAVICON VECTORIAL SVG, FORMATO Y MARCA DE AGUA VECTORIAL ------------- */}
      {activeTab === 'assets' && (
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {[
              { id: 'favicon', label: 'Favicons (Soporta SVG / PNG)', icon: FileImage },
              { id: 'convert', label: 'Conversor de Formato', icon: RefreshCw },
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

      {/* TAB 6: TIPOGRAFÍA & PAPEL EN 4 COLUMNAS (2x2) CON MUESTRARIOS VISUALES ------------- */}
      {activeTab === 'type' && (
        <div style={gridStyle4Col}>
          <ToolCard icon={Type} title="Escala Tipográfica Modular" description="Jerarquía modular escalada dinámicamente con muestras en vivo.">
            <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <FieldLabel>Base (px)</FieldLabel>
                <input type="number" value={baseFontSize} onChange={(e) => setBaseFontSize(Number(e.target.value))} className="input font-mono" />
              </div>
              <div style={{ flex: 1 }}>
                <FieldLabel>Escala Ratio</FieldLabel>
                <select value={scaleRatio} onChange={(e) => setScaleRatio(Number(e.target.value))} className="input font-mono">
                  <option value={1.125}>1.125 — Major Second</option>
                  <option value={1.2}>1.200 — Minor Third</option>
                  <option value={1.25}>1.250 — Major Third</option>
                  <option value={1.333}>1.333 — Perfect Fourth</option>
                  <option value={1.5}>1.500 — Perfect Fifth</option>
                  <option value={1.618}>1.618 — Golden Ratio</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', backgroundColor: 'var(--bg-surface-2)', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              {fontScaleList.map((item) => (
                <div key={item.step} style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-disabled)' }}>{item.label}</span>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>{item.px}px ({item.rem}rem)</span>
                  </div>
                  <div style={{ fontSize: `${Math.min(32, item.px)}px`, fontWeight: item.step > 1 ? 700 : 400, color: 'var(--text-primary)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Kalpagráfica Visual Specimen
                  </div>
                </div>
              ))}
            </div>
          </ToolCard>

          <ToolCard icon={Ruler} title="Calculadoras PX → REM & Interlineado" description="Conversor y estimador de interlineado (Line-Height) óptimo con diagrama visual.">
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
              <FieldLabel>Line-Height (Interlineado Óptimo)</FieldLabel>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input type="number" value={lhFontSize} onChange={(e) => setLhFontSize(Number(e.target.value))} className="input font-mono" placeholder="Font px" />
                <input type="number" step={0.05} value={lhRatio} onChange={(e) => setLhRatio(Number(e.target.value))} className="input font-mono" placeholder="Ratio 1.5" />
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Line-Height en PX</span>
                <strong className="font-mono" style={{ color: 'var(--accent)' }}>{lhPx}px</strong>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-disabled)', display: 'block', marginBottom: '0.4rem' }}>Diagrama de Interlineado ({lhRatio}x):</span>
              <div style={{ fontSize: `${lhFontSize}px`, lineHeight: `${lhPx}px`, color: 'var(--text-primary)', borderLeft: '3px solid var(--accent)', paddingLeft: '0.6rem' }}>
                Primera línea de texto impreso.<br />
                Segunda línea con espacio equilibrado.
              </div>
            </div>
          </ToolCard>

          <ToolCard icon={Printer} title="Formatos de Papel (ISO 216 & US)" description="Dimensiones físicas en mm, resolución a 300 DPI y escala visual comparativa.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
              {PAPER_SIZES.map((paper) => (
                <div key={paper.name} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  backgroundColor: 'var(--bg-surface-2)', padding: '0.5rem 0.8rem',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)'
                }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', width: '70px' }}>{paper.name}</strong>
                  <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{paper.mm}</span>
                  <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--accent)' }}>{paper.px300}</span>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-disabled)', display: 'block', marginBottom: '0.4rem' }}>Escala Visual de Tamaños de Papel:</span>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '0.4rem', height: '60px' }}>
                {PAPER_SIZES.slice(0, 4).map((p) => (
                  <div key={p.name} style={{ width: '32px', height: `${p.scalePct * 0.55}px`, backgroundColor: 'var(--accent-muted)', border: '1px solid var(--accent)', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 700 }}>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </ToolCard>

          <ToolCard icon={Type} title="Contador & Límites Redes Sociales" description="Analizador con medidores de longitud en tiempo real para publicaciones de redes.">
            <textarea
              value={wcText}
              onChange={(e) => setWcText(e.target.value)}
              className="input font-mono"
              rows={4}
              style={{ width: '100%', fontSize: '0.82rem', marginBottom: '0.8rem' }}
              placeholder="Escribí o pegá tu copy para redes sociales..."
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-disabled)', display: 'block' }}>Palabras</span>
                <strong className="font-mono" style={{ fontSize: '1rem', color: 'var(--accent)' }}>{wcStats.words}</strong>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-disabled)', display: 'block' }}>Caracteres</span>
                <strong className="font-mono" style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{wcStats.chars}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {wcStats.limits.map((l) => (
                <div key={l.platform} style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{l.platform}</span>
                    <span className="font-mono" style={{ color: l.current > l.limit ? '#F87171' : 'var(--accent)', fontWeight: 600 }}>
                      {l.current}/{l.limit} {l.current > l.limit && '⚠ Excedido'}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${l.pct}%`, height: '100%', backgroundColor: l.current > l.limit ? '#F87171' : 'var(--accent)', transition: 'width 0.2s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </ToolCard>
        </div>
      )}

      {/* TAB 7: COMANDOS CLI CON REPOSICIONAMIENTO DIRECTO GITHUB ------------ */}
      {activeTab === 'cli' && (
        <ToolCard icon={Terminal} title="Terminal delphitools-cli — Equivalencias" description="Accedé a la suite de comandos ejecutable instalando directamente el repositorio desde tu cuenta de GitHub.">
          <div style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <FieldLabel accent>Comando de Instalación Directa desde Repositorio GitHub</FieldLabel>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-surface-2)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)' }}>
              <code className="font-mono" style={{ fontSize: '0.9rem', color: 'var(--accent)' }}>npm install -g git+https://github.com/kalpa-droid/Kalpagrafica.git</code>
              <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard('npm install -g git+https://github.com/kalpa-droid/Kalpagrafica.git', 'cli-inst')}>
                {copiedCode === 'cli-inst' ? <Check size={16} color="var(--accent)" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {[
              { cmd: 'dt colour ffd42aff', desc: 'Convierte ffd42aff a RGB, HSL, CMYK, OKLCH y Coincidencias Pantone Coated/Uncoated' },
              { cmd: 'dt pantone 115-c', desc: 'Muestra la ficha técnica Pantone PMS Coated (brillante) vs Uncoated (mate)' },
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
