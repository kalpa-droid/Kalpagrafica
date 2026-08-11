import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Crop, Download, Maximize2 } from 'lucide-react';
import { ToolCard, FieldLabel, UploadZone } from './CommonComponents';
import { loadImageFromFile, drawCover, downloadCanvas } from '../../utils/image';

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

export default function SocialTab() {
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

  const gridStyle2Col = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' };

  return (
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
  );
}
