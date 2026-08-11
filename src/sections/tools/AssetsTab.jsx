import React, { useState, useEffect, useRef } from 'react';
import { FileImage, RefreshCw, Stamp, Download } from 'lucide-react';
import { ToolCard, FieldLabel, UploadZone } from './CommonComponents';
import {
  loadImageFromFile, loadSvgTextFromFile, svgToImage, recolorSvgText,
  downloadCanvas, FAVICON_SIZES, drawContain, drawWatermark
} from '../../utils/image';

export default function AssetsTab() {
  const [assetSubTab, setAssetSubTab] = useState('favicon');

  // FAVICON STATE
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

  // CONVERTER STATE
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

  // WATERMARK STATE
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

  return (
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
  );
}
