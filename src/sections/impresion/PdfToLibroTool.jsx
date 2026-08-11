import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Download, AlertCircle, CheckCircle, FileCheck, Info, Upload, Palette, Image as ImageIcon, Layers } from 'lucide-react';
import { pdfToLibro, crearCanvasTapaCustom } from './pdfToLibro';
import PdfPreviewStrip from './PdfPreviewStrip';

function PageSlot({ label, sub, side, highlight }) {
  const isRight = side === 'derecha';
  return (
    <div style={{ width: '130px', height: '85px', backgroundColor: 'rgba(186, 253, 193, 0.05)', border: `1.5px solid ${highlight ? 'var(--accent)' : 'var(--border-subtle)'}`, borderRadius: '3px', display: 'flex', position: 'relative' }}>
      <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, borderLeft: '1px dashed var(--border-strong)' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', ...(isRight ? {} : { backgroundColor: highlight ? 'rgba(186,253,193,0.2)' : 'transparent' }) }}>
        {!isRight && (
          <>
            <span className="font-mono" style={{ fontSize: '0.7rem', color: highlight ? 'var(--accent)' : 'var(--text-disabled)', fontWeight: highlight ? 800 : 400 }}>{label}</span>
            {sub && <span style={{ fontSize: '0.55rem', color: highlight ? 'var(--accent)' : 'var(--text-disabled)' }}>{sub}</span>}
          </>
        )}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', ...(isRight ? { backgroundColor: highlight ? 'rgba(186,253,193,0.2)' : 'transparent' } : {}) }}>
        {isRight && (
          <>
            <span className="font-mono" style={{ fontSize: '0.7rem', color: highlight ? 'var(--accent)' : 'var(--text-disabled)', fontWeight: highlight ? 800 : 400 }}>{label}</span>
            {sub && <span style={{ fontSize: '0.55rem', color: highlight ? 'var(--accent)' : 'var(--text-disabled)' }}>{sub}</span>}
          </>
        )}
      </div>
    </div>
  );
}

function BookletDiagram({ mode, hasCover, coverSide, hasRefPage, refPdfPage, refBookPage, refPageSide, hasCustomCover }) {
  const isFotocopia = mode === 'fotocopia';

  const isBookPageOdd = refBookPage > 0 ? refBookPage % 2 !== 0 : true;
  const expectedSide = isBookPageOdd ? 'derecha' : 'izquierda';
  const hasValidRef = hasRefPage && refPdfPage > 0 && refBookPage > 0;
  const needAdjustment = hasValidRef && refPageSide !== expectedSide;
  const showCoverSlot = hasCover || hasCustomCover;

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
          <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.8rem' }}>
            <BookOpen size={14} /> 1. Tu {isFotocopia ? 'Fotocopia' : 'PDF'} Original
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {showCoverSlot ? (
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>
                  {hasCustomCover ? 'Tapa Generada' : 'Primera hoja'}
                </span>
                <PageSlot label={hasCustomCover ? 'TAPA CREADA ★' : 'TAPA ★'} sub={`Lado ${coverSide}`} side={coverSide} highlight />
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>Sin tapa aislada — arranca directo en contenido.</div>
            )}

            {hasValidRef && (
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>
                  {isFotocopia ? 'Hoja escaneada' : 'Página del PDF'} N° {refPdfPage}
                </span>
                <PageSlot label={`N° ${refBookPage}`} sub={`Lado ${refPageSide}`} side={refPageSide} highlight />
              </div>
            )}
          </div>
        </div>

        {/* LADO DERECHO: RESULTADO FINAL A4 IMPRESO A DOBLE CARA */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.78rem', color: needAdjustment ? '#FBBF24' : 'var(--accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
            <FileCheck size={14} /> 2. Imposición Final (A4 Doble Cara ➔ A5 Cosido)
          </span>

          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginBottom: hasValidRef ? '0.8rem' : 0 }}>
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

          {hasValidRef && (
            needAdjustment ? (
              <div style={{ backgroundColor: 'rgba(251,191,36,0.15)', color: '#FBBF24', padding: '0.5rem', borderRadius: '4px', border: '1px solid #FBBF24', fontSize: '0.72rem', fontWeight: 600 }}>
                ⚠ Imposición requiere ajuste: el N° {refBookPage} ({isBookPageOdd ? 'impar' : 'par'}) debería quedar del lado {expectedSide}, pero en tu original está del lado {refPageSide}. Se insertará 1 hoja en blanco justo detrás de la tapa para corregirlo.
              </div>
            ) : (
              <div style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--accent)', fontSize: '0.72rem', fontWeight: 600 }}>
                ✓ Imposición correcta: el N° {refBookPage} ({isBookPageOdd ? 'impar' : 'par'}) ya queda del lado {expectedSide} tal cual está en tu original. No hace falta insertar hojas.
              </div>
            )
          )}
        </div>

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
  const [hasRefPage, setHasRefPage] = useState(true);
  const [refPdfPage, setRefPdfPage] = useState('');
  const [refBookPage, setRefBookPage] = useState('');
  const [refPageSide, setRefPageSide] = useState('derecha'); // 'derecha' | 'izquierda'
  const [pageRotations, setPageRotations] = useState({}); // { [pageNum]: degrees }
  const [pageSplitOffsets, setPageSplitOffsets] = useState({}); // { [pageNum]: percentage }

  // Opciones de Tapa Personalizada (si el PDF no incluye tapa)
  const [customCoverType, setCustomCoverType] = useState('upload'); // 'upload' | 'template'
  const [customCoverUploadUri, setCustomCoverUploadUri] = useState(null);
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateAuthor, setTemplateAuthor] = useState('');
  const [templatePublisher, setTemplatePublisher] = useState('');
  const [templateBgColor, setTemplateBgColor] = useState('#1a1a2e');
  const [templateTextColor, setTemplateTextColor] = useState('#bafdc1');
  const [templateBgImageUri, setTemplateBgImageUri] = useState(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(null);

  const autoRefPageSide = Number(refPdfPage) % 2 !== 0 ? 'derecha' : 'izquierda';
  const effectiveRefPageSide = mode === 'fotocopia' ? refPageSide : autoRefPageSide;

  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [progressPct, setProgressPct] = useState(0);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Generar vista previa en tiempo real de la Tapa Custom
  useEffect(() => {
    if (hasCover) {
      setCoverPreviewUrl(null);
      return;
    }
    let isCancelled = false;
    const generatePreview = async () => {
      const config = customCoverType === 'upload'
        ? { type: 'upload', imageUri: customCoverUploadUri }
        : {
            type: 'template',
            title: templateTitle,
            author: templateAuthor,
            publisher: templatePublisher,
            bgColor: templateBgColor,
            textColor: templateTextColor,
            bgImageUri: templateBgImageUri
          };
      const canvas = await crearCanvasTapaCustom(config);
      if (canvas && !isCancelled) {
        setCoverPreviewUrl(canvas.toDataURL('image/jpeg', 0.8));
        canvas.width = 0; canvas.height = 0;
      }
    };
    generatePreview();
    return () => { isCancelled = true; };
  }, [hasCover, customCoverType, customCoverUploadUri, templateTitle, templateAuthor, templatePublisher, templateBgColor, templateTextColor, templateBgImageUri]);

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
    setPageRotations({});
    setPageSplitOffsets({});
  };

  const handleCoverUpload = (e) => {
    const imgFile = e.target.files[0];
    if (!imgFile) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setCustomCoverUploadUri(evt.target.result);
    };
    reader.readAsDataURL(imgFile);
  };

  const handleBgImageUpload = (e) => {
    const imgFile = e.target.files[0];
    if (!imgFile) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setTemplateBgImageUri(evt.target.result);
    };
    reader.readAsDataURL(imgFile);
  };

  const handleRotatePage = (pageNum, angleDelta) => {
    setPageRotations(prev => ({
      ...prev,
      [pageNum]: ((prev[pageNum] || 0) + angleDelta) % 360
    }));
  };

  const handleAdjustSplitPage = (pageNum, newPct) => {
    setPageSplitOffsets(prev => ({
      ...prev,
      [pageNum]: newPct
    }));
  };

  const handleGenerate = async () => {
    if (!file) return;
    try {
      setLoading(true);
      setErrorMsg('');
      setSuccess(false);
      setProgressPct(5);
      setProgressMsg('Preparando motor PDF...');

      const customCoverConfig = !hasCover ? (
        customCoverType === 'upload'
          ? { type: 'upload', imageUri: customCoverUploadUri }
          : {
              type: 'template',
              title: templateTitle,
              author: templateAuthor,
              publisher: templatePublisher,
              bgColor: templateBgColor,
              textColor: templateTextColor,
              bgImageUri: templateBgImageUri
            }
      ) : null;

      const options = {
        hasCover,
        coverSide,
        refPdfPage: Number(refPdfPage) || 0,
        refBookPage: Number(refBookPage) || 0,
        refPageSide: effectiveRefPageSide,
        pageRotations,
        pageSplitOffsets,
        customCover: customCoverConfig
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

  const handleSelectPageFromViewer = (pageNum, bookNum) => {
    setHasRefPage(true);
    setRefPdfPage(String(pageNum));
    if (bookNum) {
      setRefBookPage(String(bookNum));
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

      {/* PASO 1: CARGA DE ARCHIVO Y SELECTOR DE FORMATO */}
      <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-surface-2)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <label style={{ fontSize: '0.88rem', color: 'var(--accent)', fontWeight: 700, display: 'block', marginBottom: '0.8rem' }}>
          1. Subir archivo PDF y elegir formato de origen:
        </label>

        {/* Zone de Carga */}
        <div
          onClick={() => document.getElementById('pdf-libro-input')?.click()}
          style={{
            border: '1.5px dashed var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: 'var(--bg-surface)',
            marginBottom: '1rem'
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

        {/* Radio botones de formato */}
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

      {!file && (
        <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-subtle)', textAlign: 'center', marginBottom: '1.5rem' }}>
          <Info size={24} color="var(--accent)" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            Subí tu archivo PDF arriba para habilitar la vista previa interactiva y el diagnóstico del libro
          </div>
        </div>
      )}

      {/* PASO 2: VISOR INTERACTIVO Y DIAGNÓSTICO UNIFICADO */}
      {file && (
        <>
          <PdfPreviewStrip
            file={file}
            selectedPdfPage={Number(refPdfPage) || 0}
            onSelectPage={handleSelectPageFromViewer}
            mode={mode}
            pageRotations={pageRotations}
            onRotatePage={handleRotatePage}
            pageSplitOffsets={pageSplitOffsets}
            onAdjustSplitPage={handleAdjustSplitPage}
            refBookPage={refBookPage}
          />

          <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-surface-2)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--accent)' }}>
            <div style={{ fontSize: '0.88rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle size={16} /> 2. Diagnóstico de Foliado y Tapa del Libro
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* OPCIONES DE TAPA (SI INCLUYE O SI HAY QUE GENERAR TAPA) */}
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                {mode === 'normal' ? (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>
                    <input type="checkbox" checked={hasCover} onChange={(e) => setHasCover(e.target.checked)} style={{ accentColor: 'var(--accent)', width: '16px', height: '16px' }} />
                    <span>¿El PDF subido YA incluye Tapa / Carátula en la Página 1?</span>
                  </label>
                ) : (
                  <div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                      En la 1ª hoja escaneada de tu fotocopia, ¿de qué lado está la Tapa / Portada?
                    </span>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                        <input type="radio" name="coverSide" value="derecha" checked={coverSide === 'derecha'} onChange={() => setCoverSide('derecha')} style={{ accentColor: 'var(--accent)' }} />
                        <span>En la mitad DERECHA (Portada exterior estándar)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                        <input type="radio" name="coverSide" value="izquierda" checked={coverSide === 'izquierda'} onChange={() => setCoverSide('izquierda')} style={{ accentColor: 'var(--accent)' }} />
                        <span>En la mitad IZQUIERDA</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* SI NO TIENE TAPA -> SUITE DE CREACIÓN / CARGA DE TAPA */}
                {!hasCover && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Layers size={15} /> 🎨 Tu PDF no tiene Tapa: Elegí cómo querés agregar la Portada Exterior
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <button
                        onClick={() => setCustomCoverType('upload')}
                        style={{
                          flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)',
                          backgroundColor: customCoverType === 'upload' ? 'rgba(186,253,193,0.15)' : 'var(--bg-surface-2)',
                          border: `1.5px solid ${customCoverType === 'upload' ? 'var(--accent)' : 'var(--border-subtle)'}`,
                          color: customCoverType === 'upload' ? 'var(--accent)' : 'var(--text-primary)',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600
                        }}
                      >
                        <Upload size={14} /> Subir Imagen de Tapa
                      </button>
                      <button
                        onClick={() => setCustomCoverType('template')}
                        style={{
                          flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)',
                          backgroundColor: customCoverType === 'template' ? 'rgba(186,253,193,0.15)' : 'var(--bg-surface-2)',
                          border: `1.5px solid ${customCoverType === 'template' ? 'var(--accent)' : 'var(--border-subtle)'}`,
                          color: customCoverType === 'template' ? 'var(--accent)' : 'var(--text-primary)',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600
                        }}
                      >
                        <Palette size={14} /> Crear Tapa con Plantilla
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'start' }}>
                      {/* Opciones del Formulario */}
                      <div>
                        {customCoverType === 'upload' ? (
                          <div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                              Subir archivo de imagen (.jpg / .png):
                            </span>
                            <input type="file" accept="image/*" onChange={handleCoverUpload} className="input" style={{ width: '100%', fontSize: '0.8rem' }} />
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Título del Libro:</span>
                              <input type="text" placeholder="Ej. MI LIBRO DE PRUEBA" value={templateTitle} onChange={(e) => setTemplateTitle(e.target.value)} className="input" style={{ width: '100%', fontSize: '0.82rem' }} />
                            </div>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Autor:</span>
                              <input type="text" placeholder="Ej. Juan Pérez" value={templateAuthor} onChange={(e) => setTemplateAuthor(e.target.value)} className="input" style={{ width: '100%', fontSize: '0.82rem' }} />
                            </div>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Editorial / Sello:</span>
                              <input type="text" placeholder="Ej. Editorial Kalpa" value={templatePublisher} onChange={(e) => setTemplatePublisher(e.target.value)} className="input" style={{ width: '100%', fontSize: '0.82rem' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                              <div style={{ flex: 1 }}>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Fondo:</span>
                                <input type="color" value={templateBgColor} onChange={(e) => setTemplateBgColor(e.target.value)} style={{ width: '100%', height: '32px', cursor: 'pointer' }} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Texto:</span>
                                <input type="color" value={templateTextColor} onChange={(e) => setTemplateTextColor(e.target.value)} style={{ width: '100%', height: '32px', cursor: 'pointer' }} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Vista Previa de la Tapa Creada */}
                      {coverPreviewUrl && (
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                            Vista previa de Tapa A5
                          </span>
                          <img src={coverPreviewUrl} alt="Preview Tapa A5" style={{ width: '110px', height: '150px', border: '1px solid var(--accent)', borderRadius: '3px', objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>

              {/* Sincronización de Foliado desde la Selección del Visor */}
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.88rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.4rem' }}>
                  {refPdfPage && refBookPage ? (
                    <span>
                      ✓ En la página física N° {refPdfPage} del visor indicaste que ves el número impreso <span className="font-mono" style={{ fontSize: '1rem', color: '#fff', backgroundColor: 'var(--accent)', padding: '2px 8px', borderRadius: '4px' }}>{refBookPage}</span>
                    </span>
                  ) : refPdfPage ? (
                    <span>
                      ✓ Seleccionaste la página física N° {refPdfPage} en el visor. (Ingresá el número visible en la vista ampliada).
                    </span>
                  ) : (
                    <span>💡 Hacé clic en cualquier página del visor de arriba para indicar qué número impreso ves.</span>
                  )}
                </div>

                {mode === 'fotocopia' && (
                  <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px dashed var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                      En esta hoja escaneada, ¿de qué lado ves ese número?
                    </span>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                        <input type="radio" name="refPageSide" value="derecha" checked={refPageSide === 'derecha'} onChange={() => setRefPageSide('derecha')} style={{ accentColor: 'var(--accent)' }} />
                        <span>En la mitad DERECHA</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                        <input type="radio" name="refPageSide" value="izquierda" checked={refPageSide === 'izquierda'} onChange={() => setRefPageSide('izquierda')} style={{ accentColor: 'var(--accent)' }} />
                        <span>En la mitad IZQUIERDA</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </>
      )}

      {/* DIAGRAMA TÉCNICO INTERACTIVO COMPARATIVO ANTES / DESPUÉS */}
      {file && (
        <BookletDiagram
          mode={mode}
          hasCover={hasCover}
          coverSide={coverSide}
          hasRefPage={hasRefPage}
          refPdfPage={Number(refPdfPage) || 0}
          refBookPage={Number(refBookPage) || 0}
          refPageSide={effectiveRefPageSide}
          hasCustomCover={!hasCover && (customCoverUploadUri || templateTitle)}
        />
      )}

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
