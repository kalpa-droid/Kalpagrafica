import React, { useState } from 'react';
import { FileImage, Download, AlertCircle, CheckCircle } from 'lucide-react';
import JSZip from 'jszip';
import { pdfToPng } from './pdfToPng';

export default function PdfToPngTool() {
  const [file, setFile] = useState(null);
  const [config, setConfig] = useState({
    rangeMode: 'todas',
    range: '1-5',
    dpi: 300,
    downloadMode: 'individual'
  });
  const [loading, setLoading] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [renderedBlobs, setRenderedBlobs] = useState([]);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (selected.type !== 'application/pdf') {
      setErrorMsg('El archivo debe ser un PDF válido.');
      return;
    }
    setFile(selected);
    setRenderedBlobs([]);
    setSuccess(false);
    setErrorMsg('');
  };

  const updateConfig = (key, val) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  };

  const handleConvert = async () => {
    if (!file) return;
    try {
      setLoading(true);
      setErrorMsg('');
      setSuccess(false);
      setProgressPct(10);
      setRenderedBlobs([]);

      const blobs = await pdfToPng(file, config, (ratio) => {
        setProgressPct(10 + Math.round(ratio * 85));
      });

      setRenderedBlobs(blobs);

      if (config.downloadMode === 'zip') {
        const zip = new JSZip();
        blobs.forEach(({ pageNum, blob }) => zip.file(`pagina_${pageNum}.png`, blob));
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name.replace(/\.pdf$/i, '') + '_paginas.zip';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        for (let i = 0; i < blobs.length; i++) {
          const { pageNum, blob } = blobs[i];
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `pagina_${pageNum}.png`;
          a.click();
          URL.revokeObjectURL(url);
          await new Promise(r => setTimeout(r, 200));
        }
      }

      setLoading(false);
      setSuccess(true);
      setProgressPct(100);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setErrorMsg('Error durante la conversión de PDF a imágenes.');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', padding: '1.8rem', boxShadow: 'var(--shadow-card)' }}>
      <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FileImage size={20} color="var(--accent)" />
        <span>PDF a Imagen (PNG / Alta Resolución)</span>
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
        Extrae páginas individuales de cualquier archivo PDF y conviértelas en imágenes PNG de alta resolución (150 a 600 DPI) preparadas para imprenta o web.
      </p>

      {/* Carga de archivo */}
      <div
        onClick={() => document.getElementById('pdf-png-input')?.click()}
        style={{
          border: '1.5px dashed var(--border-strong)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: 'var(--bg-surface-2)',
          marginBottom: '1.5rem'
        }}
      >
        <input id="pdf-png-input" type="file" accept="application/pdf" onChange={handleFileChange} style={{ display: 'none' }} />
        <FileImage size={28} color="var(--accent)" style={{ marginBottom: '0.5rem' }} />
        <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
          {file ? file.name : 'Arrastrá tu PDF o hacé clic para seleccionar'}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', marginTop: '0.3rem' }}>
          {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Extrae todas las páginas o un rango específico'}
        </div>
      </div>

      {/* Configuración de Conversión */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Rango de páginas */}
        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
            Páginas a Renderizar
          </label>
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
            <button
              onClick={() => updateConfig('rangeMode', 'todas')}
              className="btn btn-sm"
              style={{
                flex: 1,
                backgroundColor: config.rangeMode === 'todas' ? 'var(--accent)' : 'var(--bg-surface-2)',
                color: config.rangeMode === 'todas' ? '#08080A' : 'var(--text-secondary)',
                border: config.rangeMode === 'todas' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                fontWeight: 700
              }}
            >
              Todas
            </button>
            <button
              onClick={() => updateConfig('rangeMode', 'rango')}
              className="btn btn-sm"
              style={{
                flex: 1,
                backgroundColor: config.rangeMode === 'rango' ? 'var(--accent)' : 'var(--bg-surface-2)',
                color: config.rangeMode === 'rango' ? '#08080A' : 'var(--text-secondary)',
                border: config.rangeMode === 'rango' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                fontWeight: 700
              }}
            >
              Rango
            </button>
          </div>
          {config.rangeMode === 'rango' && (
            <input
              type="text"
              placeholder="ej. 1-5 o 3"
              value={config.range}
              onChange={(e) => updateConfig('range', e.target.value)}
              className="input font-mono"
              style={{ width: '100%', fontSize: '0.82rem' }}
            />
          )}
        </div>

        {/* Resolución DPI */}
        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
            Resolución (DPI)
          </label>
          <select
            value={config.dpi}
            onChange={(e) => updateConfig('dpi', Number(e.target.value))}
            className="input font-mono"
            style={{ width: '100%', fontSize: '0.85rem' }}
          >
            <option value={150}>150 DPI (Rápido / Pantalla)</option>
            <option value={300}>300 DPI (Estándar Impresión)</option>
            <option value={400}>400 DPI (Alta Calidad)</option>
            <option value={600}>600 DPI (Profesional Imprenta)</option>
          </select>
        </div>

        {/* Modo de Descarga */}
        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
            Modo de Descarga
          </label>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => updateConfig('downloadMode', 'individual')}
              className="btn btn-sm"
              style={{
                flex: 1,
                backgroundColor: config.downloadMode === 'individual' ? 'var(--accent)' : 'var(--bg-surface-2)',
                color: config.downloadMode === 'individual' ? '#08080A' : 'var(--text-secondary)',
                border: config.downloadMode === 'individual' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                fontWeight: 700
              }}
            >
              Archivos Directos
            </button>
            <button
              onClick={() => updateConfig('downloadMode', 'zip')}
              className="btn btn-sm"
              style={{
                flex: 1,
                backgroundColor: config.downloadMode === 'zip' ? 'var(--accent)' : 'var(--bg-surface-2)',
                color: config.downloadMode === 'zip' ? '#08080A' : 'var(--text-secondary)',
                border: config.downloadMode === 'zip' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                fontWeight: 700
              }}
            >
              Comprimir ZIP
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div style={{ backgroundColor: 'rgba(248,113,113,0.15)', border: '1px solid #F87171', color: '#F87171', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
            <span>Renderizando páginas a {config.dpi} DPI...</span>
            <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{progressPct}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', backgroundColor: 'var(--accent)', transition: 'width 0.2s ease' }} />
          </div>
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: 'var(--accent-muted)', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} />
          <span>¡Imágenes renderizadas y descargadas con éxito!</span>
        </div>
      )}

      <button
        className="btn btn-primary"
        onClick={handleConvert}
        disabled={!file || loading}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        <Download size={18} />
        <span>{loading ? 'Renderizando PDF...' : 'Convertir PDF a Imagen (PNG)'}</span>
      </button>

      {/* Mini previsualizaciones renderizadas */}
      {renderedBlobs.length > 0 && (
        <div style={{ marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: '1px solid var(--border-subtle)' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, display: 'block', marginBottom: '0.8rem' }}>
            Páginas Renderizadas ({renderedBlobs.length}):
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.8rem' }}>
            {renderedBlobs.map(({ pageNum, blob, width, height }) => {
              const previewUrl = URL.createObjectURL(blob);
              return (
                <div key={pageNum} style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <img src={previewUrl} alt={`Página ${pageNum}`} style={{ maxWidth: '100%', maxHeight: '100px', objectFit: 'contain', borderRadius: '2px', marginBottom: '0.3rem' }} />
                  <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>Página {pageNum}</span>
                  <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-disabled)' }}>{width}×{height}px</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
