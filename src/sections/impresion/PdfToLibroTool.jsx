import React, { useState } from 'react';
import { BookOpen, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { pdfToLibro } from './pdfToLibro';

function BookletDiagram({ mode, fotocopiaStart, excludeStr }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-surface-2)',
      borderRadius: 'var(--radius-md)',
      border: '1.5px solid var(--accent)',
      padding: '1.2rem',
      marginBottom: '1.5rem',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
    }}>
      <div style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.8rem', textAlign: 'center' }}>
        Diagrama Técnico de Imposición en Hoja A4 Doble Cara (A5 Cosido)
      </div>

      <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
        {/* HOJA 1: FRENTE (Tapa / Portada) */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>
            Pliego 1: FRENTE (Exterior)
          </span>
          <div style={{
            width: '210px', height: '135px', backgroundColor: 'rgba(186, 253, 193, 0.05)',
            border: '2px solid var(--accent)', borderRadius: '4px', position: 'relative', display: 'flex'
          }}>
            {/* Lomo Central */}
            <div style={{
              position: 'absolute', left: '50%', top: 0, bottom: 0, width: 0,
              borderLeft: '2px dashed var(--accent)', opacity: 0.7
            }} />
            <span style={{ position: 'absolute', left: '50%', top: '35%', transform: 'translateX(-50%) rotate(-90deg)', fontSize: '0.55rem', color: 'var(--accent)', fontWeight: 700, backgroundColor: 'var(--bg-surface-2)', padding: '0 2px' }}>
              LOMO / DOBLEZ
            </span>

            {/* Mitad Izquierda (Contraportada) */}
            <div style={{ flex: 1, padding: '0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRight: '1px dashed rgba(186,253,193,0.3)' }}>
              <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                Página N
              </span>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-disabled)' }}>Contraportada</span>
            </div>

            {/* Mitad Derecha (Portada - Página 1) */}
            <div style={{ flex: 1, padding: '0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(186, 253, 193, 0.18)' }}>
              <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 800 }}>
                Página 1 ★
              </span>
              <span style={{ fontSize: '0.62rem', color: 'var(--accent)', fontWeight: 600 }}>
                {mode === 'fotocopia' && fotocopiaStart === 'derecha' ? 'Portada Fotocopia' : 'Portada (Tapa)'}
              </span>
            </div>
          </div>
        </div>

        {/* HOJA 1: DORSO (Reverso - Página 2) */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>
            Pliego 1: DORSO (Reverso)
          </span>
          <div style={{
            width: '210px', height: '135px', backgroundColor: 'rgba(186, 253, 193, 0.05)',
            border: '2px solid var(--border-subtle)', borderRadius: '4px', position: 'relative', display: 'flex'
          }}>
            {/* Lomo Central */}
            <div style={{
              position: 'absolute', left: '50%', top: 0, bottom: 0, width: 0,
              borderLeft: '2px dashed var(--border-strong)', opacity: 0.7
            }} />

            {/* Mitad Izquierda (Página 2 Interior) */}
            <div style={{ flex: 1, padding: '0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(186, 253, 193, 0.18)', borderRight: '1px dashed rgba(186,253,193,0.3)' }}>
              <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 800 }}>
                Página 2 ★
              </span>
              <span style={{ fontSize: '0.62rem', color: 'var(--accent)', fontWeight: 600 }}>Interior Izq.</span>
            </div>

            {/* Mitad Derecha (Página N-1) */}
            <div style={{ flex: 1, padding: '0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                Página N-1
              </span>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-disabled)' }}>Interior Der.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de configuración activa */}
      <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px dashed var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem' }}>
        <div>
          <span style={{ color: 'var(--text-disabled)' }}>Modo Activo: </span>
          <strong style={{ color: 'var(--accent)' }}>
            {mode === 'fotocopia' ? `Fotocopia Libro Abierto (${fotocopiaStart === 'derecha' ? 'Pág 1 a la Derecha' : 'Pág 1 a la Izquierda'})` : 'PDF Normal A4/A5'}
          </strong>
        </div>

        {excludeStr && (
          <div>
            <span style={{ color: 'var(--text-disabled)' }}>Excluyendo: </span>
            <span className="font-mono" style={{ color: '#F87171', backgroundColor: 'rgba(248,113,113,0.15)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              {excludeStr}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PdfToLibroTool() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('normal'); // 'normal' | 'fotocopia'
  const [excludeStr, setExcludeStr] = useState('');
  const [fotocopiaStart, setFotocopiaStart] = useState('derecha'); // 'derecha' | 'izquierda'
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

      const options = { excludeStr, fotocopiaStart };
      const result = await pdfToLibro(file, mode, options, (msg, pct) => {
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
      setErrorMsg(err?.message || 'Error al procesar el libro PDF. Intenta con un archivo válido.');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', padding: '1.8rem', boxShadow: 'var(--shadow-card)' }}>
      <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <BookOpen size={20} color="var(--accent)" />
        <span>PDF a Libro (Imposición de Folleto A4 / A5)</span>
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
        Convierte cualquier PDF en un folleto listo para imprimir a doble cara y abrochar al centro. Reordena las páginas automáticamente (imposición de cuadernillo de 4 páginas) y soporta PDFs de fotocopia de libro abierto.
      </p>

      {/* Selector de modo */}
      <div style={{ marginBottom: '1.2rem', backgroundColor: 'var(--bg-surface-2)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
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
            <span>Fotocopia de Libro Abierto (Doble página por hoja A4)</span>
          </label>
        </div>
      </div>

      {/* Configuración de Fotocopia de Libro Abierto (Alineación Portada) */}
      {mode === 'fotocopia' && (
        <div style={{ marginBottom: '1.2rem', backgroundColor: 'var(--bg-surface-2)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>
            Alineación de la 1ª Hoja Escaneada:
          </label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <input type="radio" name="fotocopiaStart" value="derecha" checked={fotocopiaStart === 'derecha'} onChange={() => setFotocopiaStart('derecha')} style={{ accentColor: 'var(--accent)' }} />
              <span>Página 1 a la Derecha (Portada Tradicional del Libro)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <input type="radio" name="fotocopiaStart" value="izquierda" checked={fotocopiaStart === 'izquierda'} onChange={() => setFotocopiaStart('izquierda')} style={{ accentColor: 'var(--accent)' }} />
              <span>Página 1 a la Izquierda</span>
            </label>
          </div>
        </div>
      )}

      {/* Rango de páginas a eliminar */}
      <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-surface-2)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <label style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
          {mode === 'fotocopia' ? 'Hojas Escaneadas a Eliminar (Opcional):' : 'Páginas a Eliminar (Opcional):'}
        </label>
        <input
          type="text"
          placeholder={mode === 'fotocopia' ? 'ej. 1, 4-6, 12' : 'ej. 1, 3-5, 8'}
          value={excludeStr}
          onChange={(e) => setExcludeStr(e.target.value)}
          className="input font-mono"
          style={{ width: '100%', fontSize: '0.85rem' }}
        />
        <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', marginTop: '0.4rem' }}>
          Permite omitir portadas en blanco o páginas innecesarias antes de armar los pliegos de encuadernación.
        </div>
      </div>

      {/* DIAGRAMA TÉCNICO INTERACTIVO DE IMPOSICIÓN */}
      <BookletDiagram mode={mode} fotocopiaStart={fotocopiaStart} excludeStr={excludeStr} />

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
