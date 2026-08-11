import React, { useState } from 'react';
import { BookOpen, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { pdfToLibro } from './pdfToLibro';

export default function PdfToLibroTool() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('normal');
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [progressPct, setProgressPct] = useState(0);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (selected.type !== 'application/pdf') {
      setErrorMsg('El archivo debe ser un PDF válido.');
      return;
    }
    setErrorMsg('');
    setSuccess(false);
    setFile(selected);
  };

  const handleGenerate = async () => {
    if (!file) return;
    try {
      setLoading(true);
      setErrorMsg('');
      setSuccess(false);
      setProgressPct(5);
      setProgressMsg('Preparando motor PDF...');

      const result = await pdfToLibro(file, mode, (msg, pct) => {
        setProgressMsg(msg);
        setProgressPct(pct);
      });

      setProgressMsg('Generando archivo descargable...');
      setProgressPct(98);

      const blob = new Blob([result], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '') + '_Libro.pdf';
      a.click();
      URL.revokeObjectURL(url);

      setLoading(false);
      setSuccess(true);
      setProgressPct(100);
      setProgressMsg('¡Libro Creado Exitosamente!');
    } catch (err) {
      console.error(err);
      setLoading(false);
      setErrorMsg('Error al procesar el libro PDF. Intenta con un archivo válido.');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', padding: '1.8rem', boxShadow: 'var(--shadow-card)' }}>
      <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <BookOpen size={20} color="var(--accent)" />
        <span>PDF a Libro (Imposición de Folleto)</span>
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
        Convierte cualquier PDF en un folleto listo para imprimir a doble cara y abrochar al centro. Reordena las páginas automáticamente (imposición de cuadernillo) y soporta PDFs de fotocopia de libro abierto.
      </p>

      {/* Selector de modo */}
      <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-surface-2)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <label style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>
          Formato de origen del PDF:
        </label>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <input type="radio" name="mode" value="normal" checked={mode === 'normal'} onChange={() => setMode('normal')} style={{ accentColor: 'var(--accent)' }} />
            <span>PDF Normal (Páginas individuales A4 / A5)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <input type="radio" name="mode" value="fotocopia" checked={mode === 'fotocopia'} onChange={() => setMode('fotocopia')} style={{ accentColor: 'var(--accent)' }} />
            <span>Fotocopia de Libro Abierto (Doble página por hoja)</span>
          </label>
        </div>
      </div>

      {/* Carga de archivo */}
      <div
        onClick={() => document.getElementById('pdf-libro-input')?.click()}
        style={{
          border: '1.5px dashed var(--border-strong)',
          borderRadius: 'var(--radius-md)',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: 'var(--bg-surface-2)',
          marginBottom: '1.5rem'
        }}
      >
        <input id="pdf-libro-input" type="file" accept="application/pdf" onChange={handleFileChange} style={{ display: 'none' }} />
        <BookOpen size={28} color="var(--accent)" style={{ marginBottom: '0.5rem' }} />
        <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
          {file ? file.name : 'Arrastrá tu PDF o hacé clic para seleccionar'}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', marginTop: '0.3rem' }}>
          {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Soporta PDFs de cualquier número de páginas'}
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
          <span>¡El PDF Libro fue generado y descargado con éxito!</span>
        </div>
      )}

      <button
        className="btn btn-primary"
        onClick={handleGenerate}
        disabled={!file || loading}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        <Download size={18} />
        <span>{loading ? 'Procesando Libro...' : 'Generar PDF Libro'}</span>
      </button>
    </div>
  );
}
