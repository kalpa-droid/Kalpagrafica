import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Palette, ScanEye, Download, Check, Copy } from 'lucide-react';
import { ToolCard, FieldLabel, UploadZone } from './CommonComponents';
import { loadImageFromFile, extractPalette, applyColorblindToImage, downloadCanvas } from '../../utils/image';
import { COLORBLIND_TYPES } from '../../utils/color';

export default function AnalysisTab({ copiedCode, copyToClipboard }) {
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

  const gridStyle3Col = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' };

  return (
    <div style={gridStyle3Col}>
      <ToolCard icon={Palette} title="Extractor de Paleta desde Imagen" description="Subí una imagen y obtené los colores dominantes con opción de copiar todos los códigos en bloque.">
        <UploadZone onFile={handleAnalysisUpload} fileName={analysisFileName} hint="PNG, JPG o WEBP — se procesa en tu navegador" />
        {palette.length > 0 && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.2rem', marginBottom: '1.5rem' }}>
              {palette.map((c, i) => (
                <div
                  key={i}
                  onClick={() => copyToClipboard(c.hex, `pal-${i}`)}
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
  );
}
