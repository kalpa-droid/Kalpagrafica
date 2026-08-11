import React, { useState } from 'react';
import { LayoutGrid, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { generarMosaico } from './mosaico';

export default function MosaicoTool() {
  const [files, setFiles] = useState([]);
  const [config, setConfig] = useState({
    orientation: 'vertical',
    imagesPerSheet: 4,
    copies: 1,
    margin: 5,
    ajuste: 'encajar',
    sequence: 'agrupadas'
  });
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [progressPct, setProgressPct] = useState(0);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFilesChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    setFiles(selected);
    setSuccess(false);
    setErrorMsg('');
  };

  const updateConfig = (key, val) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  };

  const handleGenerate = async () => {
    if (files.length === 0) return;
    try {
      setLoading(true);
      setErrorMsg('');
      setSuccess(false);
      setProgressPct(5);
      setProgressMsg('Preparando imágenes...');

      const pdfBytes = await generarMosaico(files, config, (msg, pct) => {
        setProgressMsg(msg);
        setProgressPct(pct);
      });

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Mosaico_${config.imagesPerSheet}porHoja_${config.orientation}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      setLoading(false);
      setSuccess(true);
      setProgressPct(100);
      setProgressMsg('¡Mosaico generado con éxito!');
    } catch (err) {
      console.error(err);
      setLoading(false);
      setErrorMsg('Error al generar el mosaico PDF. Verifica las imágenes seleccionadas.');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', padding: '1.8rem', boxShadow: 'var(--shadow-card)' }}>
      <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <LayoutGrid size={20} color="var(--accent)" />
        <span>Imágenes a Mosaico (Grilla de Impresión)</span>
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
        A acomodá múltiples imágenes por hoja PDF (2, 4 u 8 por página) optimizadas para ahorrar papel en imprenta o fotocopiadora. Configura márgenes, copias por imagen y tipo de ajuste.
      </p>

      {/* Carga de archivos */}
      <div
        onClick={() => document.getElementById('mosaic-files-input')?.click()}
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
        <input id="mosaic-files-input" type="file" accept="image/*" multiple onChange={handleFilesChange} style={{ display: 'none' }} />
        <LayoutGrid size={28} color="var(--accent)" style={{ marginBottom: '0.5rem' }} />
        <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
          {files.length > 0 ? `${files.length} imagen(es) seleccionada(s)` : 'Arrastrá múltiples imágenes o hacé clic para seleccionar'}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', marginTop: '0.3rem' }}>
          JPG, PNG o WEBP — Se ordenan y escalan automáticamente
        </div>
      </div>

      {/* Panel de Configuración de Grilla */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Imágenes por hoja */}
        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
            Imágenes por Hoja
          </label>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[2, 4, 8].map(num => (
              <button
                key={num}
                onClick={() => updateConfig('imagesPerSheet', num)}
                className="btn btn-sm"
                style={{
                  flex: 1,
                  backgroundColor: config.imagesPerSheet === num ? 'var(--accent)' : 'var(--bg-surface-2)',
                  color: config.imagesPerSheet === num ? '#08080A' : 'var(--text-secondary)',
                  border: config.imagesPerSheet === num ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                  fontWeight: 700
                }}
              >
                {num} por hoja
              </button>
            ))}
          </div>
        </div>

        {/* Orientación */}
        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
            Orientación de Hoja
          </label>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {['vertical', 'horizontal'].map(ori => (
              <button
                key={ori}
                onClick={() => updateConfig('orientation', ori)}
                className="btn btn-sm"
                style={{
                  flex: 1,
                  backgroundColor: config.orientation === ori ? 'var(--accent)' : 'var(--bg-surface-2)',
                  color: config.orientation === ori ? '#08080A' : 'var(--text-secondary)',
                  border: config.orientation === ori ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                  fontWeight: 700,
                  textTransform: 'capitalize'
                }}
              >
                {ori}
              </button>
            ))}
          </div>
        </div>

        {/* Copias por imagen */}
        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
            Copias por Imagen
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={config.copies}
            onChange={(e) => updateConfig('copies', Math.min(100, Math.max(1, Number(e.target.value))))}
            className="input font-mono"
            style={{ width: '100%', fontSize: '0.85rem' }}
          />
        </div>

        {/* Margen */}
        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
            Margen de Separación
          </label>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[0, 5, 10].map(m => (
              <button
                key={m}
                onClick={() => updateConfig('margin', m)}
                className="btn btn-sm"
                style={{
                  flex: 1,
                  backgroundColor: config.margin === m ? 'var(--accent)' : 'var(--bg-surface-2)',
                  color: config.margin === m ? '#08080A' : 'var(--text-secondary)',
                  border: config.margin === m ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                  fontWeight: 700
                }}
              >
                {m} mm
              </button>
            ))}
          </div>
        </div>

        {/* Tipo de Ajuste */}
        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
            Ajuste de Imagen
          </label>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => updateConfig('ajuste', 'encajar')}
              className="btn btn-sm"
              style={{
                flex: 1,
                backgroundColor: config.ajuste === 'encajar' ? 'var(--accent)' : 'var(--bg-surface-2)',
                color: config.ajuste === 'encajar' ? '#08080A' : 'var(--text-secondary)',
                border: config.ajuste === 'encajar' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                fontWeight: 700
              }}
            >
              Encajar Proporcional
            </button>
            <button
              onClick={() => updateConfig('ajuste', 'estirar')}
              className="btn btn-sm"
              style={{
                flex: 1,
                backgroundColor: config.ajuste === 'estirar' ? 'var(--accent)' : 'var(--bg-surface-2)',
                color: config.ajuste === 'estirar' ? '#08080A' : 'var(--text-secondary)',
                border: config.ajuste === 'estirar' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                fontWeight: 700
              }}
            >
              Estirar
            </button>
          </div>
        </div>

        {/* Secuencia */}
        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
            Secuencia de Impresión
          </label>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => updateConfig('sequence', 'agrupadas')}
              className="btn btn-sm"
              style={{
                flex: 1,
                backgroundColor: config.sequence === 'agrupadas' ? 'var(--accent)' : 'var(--bg-surface-2)',
                color: config.sequence === 'agrupadas' ? '#08080A' : 'var(--text-secondary)',
                border: config.sequence === 'agrupadas' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                fontWeight: 700
              }}
            >
              Agrupadas
            </button>
            <button
              onClick={() => updateConfig('sequence', 'intercaladas')}
              className="btn btn-sm"
              style={{
                flex: 1,
                backgroundColor: config.sequence === 'intercaladas' ? 'var(--accent)' : 'var(--bg-surface-2)',
                color: config.sequence === 'intercaladas' ? '#08080A' : 'var(--text-secondary)',
                border: config.sequence === 'intercaladas' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                fontWeight: 700
              }}
            >
              Intercaladas
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
            <span>{progressMsg}</span>
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
          <span>¡PDF Mosaico generado y descargado correctamente!</span>
        </div>
      )}

      <button
        className="btn btn-primary"
        onClick={handleGenerate}
        disabled={files.length === 0 || loading}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        <Download size={18} />
        <span>{loading ? 'Generando Mosaico...' : 'Generar PDF Mosaico'}</span>
      </button>
    </div>
  );
}
