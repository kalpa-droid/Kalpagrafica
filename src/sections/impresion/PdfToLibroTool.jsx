import React, { useState } from 'react';
import { BookOpen, Download, AlertCircle, CheckCircle, HelpCircle, Layers, FileCheck } from 'lucide-react';
import { pdfToLibro } from './pdfToLibro';

function BookletDiagram({ mode, fotocopiaStart, excludeStr, hasCover, coverSide, hasRefPage, refPdfPage, refBookPage, refPageSide }) {
  const isBookPageOdd = refBookPage > 0 ? refBookPage % 2 !== 0 : true;
  const expectedSide = isBookPageOdd ? 'derecha' : 'izquierda';
  const needAdjustment = hasRefPage && refPdfPage > 0 && refBookPage > 0 && refPageSide !== expectedSide;

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface-2)',
      borderRadius: 'var(--radius-md)',
      border: '1.5px solid var(--accent)',
      padding: '1.4rem',
      marginBottom: '1.5rem',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
    }}>
      <div style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.2rem', textAlign: 'center' }}>
        Diagrama Comparativo de Preimpresión: Original vs Resultado Final A5 Cosido
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>

        {/* LADO IZQUIERDO: ESTADO DEL PDF ORIGINAL */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
            <BookOpen size={14} /> 1. Tu PDF / Escaneo Original
          </span>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div>
              <span style={{ color: 'var(--text-disabled)' }}>Estructura de Tapa: </span>
              <strong>{hasCover ? `Tapa aislada (lado ${coverSide})` : 'Sin tapa aislada'}</strong>
            </div>

            {hasRefPage && refPdfPage > 0 && refBookPage > 0 && (
              <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', marginTop: '0.2rem' }}>
                <span style={{ display: 'block', color: 'var(--accent)', fontWeight: 700 }}>
                  Pág PDF {refPdfPage} ➔ N° {refBookPage} del Libro ({refPageSide})
                </span>
                {needAdjustment ? (
                  <span style={{ color: '#FBBF24', fontSize: '0.7rem', display: 'block', marginTop: '0.2rem' }}>
                    ⚠ Desfase detectado: N° {refBookPage} ({isBookPageOdd ? 'Impar' : 'Par'}) requiere estar a la {expectedSide}.
                  </span>
                ) : (
                  <span style={{ color: 'var(--accent)', fontSize: '0.7rem', display: 'block', marginTop: '0.2rem' }}>
                    ✓ Alineación correcta: N° {refBookPage} ({isBookPageOdd ? 'Impar' : 'Par'}) queda a la {expectedSide}.
                  </span>
                )}
              </div>
            )}

            {needAdjustment && (
              <div style={{ backgroundColor: 'rgba(251,191,36,0.15)', color: '#FBBF24', padding: '0.5rem', borderRadius: '4px', border: '1px solid #FBBF24', fontSize: '0.72rem', fontWeight: 600 }}>
                + 1 Hoja en Blanco insertada limpia JUSTO DETRÁS DE LA TAPA para alinear sin romper el texto.
              </div>
            )}

            {excludeStr && (
              <div style={{ fontSize: '0.72rem', color: '#F87171' }}>
                Páginas a excluir: <strong>{excludeStr}</strong>
              </div>
            )}
          </div>
        </div>

        {/* LADO DERECHO: RESULTADO FINAL A4 IMPRESO A DOBLE CARA */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
            <FileCheck size={14} /> 2. Imposición Final (A4 Doble Cara ➔ A5 Cosido)
          </span>

          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Pliego 1 Frente */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>
                FRENTE (Exterior)
              </span>
              <div style={{ width: '130px', height: '85px', backgroundColor: 'rgba(186, 253, 193, 0.05)', border: '1.5px solid var(--accent)', borderRadius: '3px', display: 'flex', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, borderLeft: '1px dashed var(--accent)' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-disabled)' }}>Pág N</span>
                </div>
                <div style={{ flex: 1, backgroundColor: 'rgba(186,253,193,0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 800 }}>Pág 1 ★</span>
                  <span style={{ fontSize: '0.55rem', color: 'var(--accent)' }}>Tapa (Der)</span>
                </div>
              </div>
            </div>

            {/* Pliego 1 Dorso */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>
                DORSO (Reverso)
              </span>
              <div style={{ width: '130px', height: '85px', backgroundColor: 'rgba(186, 253, 193, 0.05)', border: '1.5px solid var(--border-subtle)', borderRadius: '3px', display: 'flex', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, borderLeft: '1px dashed var(--border-strong)' }} />
                <div style={{ flex: 1, backgroundColor: 'rgba(186,253,193,0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 800 }}>Pág 2 ★</span>
                  <span style={{ fontSize: '0.55rem', color: 'var(--accent)' }}>Interior (Izq)</span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-disabled)' }}>Pág N-1</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Regla Editorial */}
      <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px dashed var(--border-subtle)', textAlign: 'center', fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
        📖 <strong style={{ color: 'var(--accent)' }}>Regla Editorial Universal:</strong> Páginas <strong>IMPARES (1, 3, 5...) siempre a la DERECHA</strong> | Páginas <strong>PARES (2, 4, 6...) siempre a la IZQUIERDA</strong>.
      </div>
    </div>
  );
}

export default function PdfToLibroTool() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('normal'); // 'normal' | 'fotocopia'

  // Opciones de Tapa y Foliado
  const [hasCover, setHasCover] = useState(true);
  const [coverSide, setCoverSide] = useState('derecha'); // 'derecha' | 'izquierda'
  const [hasRefPage, setHasRefPage] = useState(false);
  const [refPdfPage, setRefPdfPage] = useState('');
  const [refBookPage, setRefBookPage] = useState('');
  const [refPageSide, setRefPageSide] = useState('derecha'); // 'derecha' | 'izquierda'

  const [excludeStr, setExcludeStr] = useState('');
  const [fotocopiaStart, setFotocopiaStart] = useState('derecha');

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

      const options = {
        excludeStr,
        fotocopiaStart,
        hasCover,
        coverSide,
        refPdfPage: Number(refPdfPage) || 0,
        refBookPage: Number(refBookPage) || 0,
        refPageSide
      };

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
        Asistente inteligente de preimpresión para maquetar folletos A4 listos para imprimir a doble cara y coser/abrochar al centro en tamaño A5. Sincroniza automáticamente los números de página del libro con la regla editorial Par (Izquierda) / Impar (Derecha).
      </p>

      {/* 1. Selector de formato de origen */}
      <div style={{ marginBottom: '1.2rem', backgroundColor: 'var(--bg-surface-2)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <label style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>
          1. Formato de origen del PDF:
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

      {/* 2. Pregunta de Tapa aislada */}
      <div style={{ marginBottom: '1.2rem', backgroundColor: 'var(--bg-surface-2)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', marginBottom: hasCover ? '0.6rem' : 0 }}>
          <input type="checkbox" checked={hasCover} onChange={(e) => setHasCover(e.target.checked)} style={{ accentColor: 'var(--accent)', width: '16px', height: '16px' }} />
          <span>¿El PDF incluye Tapa / Carátula aislada?</span>
        </label>

        {hasCover && (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem', paddingLeft: '1.6rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <input type="radio" name="coverSide" value="derecha" checked={coverSide === 'derecha'} onChange={() => setCoverSide('derecha')} style={{ accentColor: 'var(--accent)' }} />
              <span>Tapa en el lado DERECHO (Portada exterior recomendada)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <input type="radio" name="coverSide" value="izquierda" checked={coverSide === 'izquierda'} onChange={() => setCoverSide('izquierda')} style={{ accentColor: 'var(--accent)' }} />
              <span>Tapa en el lado IZQUIERDO</span>
            </label>
          </div>
        )}
      </div>

      {/* 3. Pregunta de Sincronización del Foliado (Libro vs PDF) */}
      <div style={{ marginBottom: '1.2rem', backgroundColor: 'var(--bg-surface-2)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', marginBottom: hasRefPage ? '0.8rem' : 0 }}>
          <input type="checkbox" checked={hasRefPage} onChange={(e) => setHasRefPage(e.target.checked)} style={{ accentColor: 'var(--accent)', width: '16px', height: '16px' }} />
          <span>Sincronizar número de página impreso en el libro con la página del PDF</span>
        </label>

        {hasRefPage && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingLeft: '1.6rem', marginTop: '0.4rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  En la página del PDF N°:
                </span>
                <input
                  type="number"
                  min={1}
                  placeholder="ej. 6"
                  value={refPdfPage}
                  onChange={(e) => setRefPdfPage(e.target.value)}
                  className="input font-mono"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ flex: 1, minWidth: '180px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Aparece el número del Libro N°:
                </span>
                <input
                  type="number"
                  min={1}
                  placeholder="ej. 8"
                  value={refBookPage}
                  onChange={(e) => setRefBookPage(e.target.value)}
                  className="input font-mono"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                ¿De qué lado se encuentra dicho número en esa hoja del PDF/fotocopia?
              </span>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  <input type="radio" name="refPageSide" value="derecha" checked={refPageSide === 'derecha'} onChange={() => setRefPageSide('derecha')} style={{ accentColor: 'var(--accent)' }} />
                  <span>Del lado DERECHO</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  <input type="radio" name="refPageSide" value="izquierda" checked={refPageSide === 'izquierda'} onChange={() => setRefPageSide('izquierda')} style={{ accentColor: 'var(--accent)' }} />
                  <span>Del lado IZQUIERDO</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Rango de páginas a eliminar */}
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
      </div>

      {/* DIAGRAMA TÉCNICO INTERACTIVO COMPARATIVO ANTES / DESPUÉS */}
      <BookletDiagram
        mode={mode}
        fotocopiaStart={fotocopiaStart}
        excludeStr={excludeStr}
        hasCover={hasCover}
        coverSide={coverSide}
        hasRefPage={hasRefPage}
        refPdfPage={Number(refPdfPage) || 0}
        refBookPage={Number(refBookPage) || 0}
        refPageSide={refPageSide}
      />

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
