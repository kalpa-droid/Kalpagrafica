import React, { useState, useEffect } from 'react';
import { BookOpen, Download, AlertCircle, CheckCircle, FileCheck, Info, Upload, Palette, Layers, Edit3, ArrowRight, Check } from 'lucide-react';
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

  // Controlador de Etapas Guiadas (1..5)
  const [activeStep, setActiveStep] = useState(1);

  // Opciones de Tapa y Foliado
  const [hasCover, setHasCover] = useState(true);
  const [coverSide, setCoverSide] = useState('derecha'); // 'derecha' | 'izquierda'
  const [hasRefPage, setHasRefPage] = useState(true);
  const [refPdfPage, setRefPdfPage] = useState('');
  const [refBookPage, setRefBookPage] = useState('');
  const [refPageSide, setRefPageSide] = useState('derecha'); // 'derecha' | 'izquierda'
  const [pageRotations, setPageRotations] = useState({});
  const [pageSplitOffsets, setPageSplitOffsets] = useState({});

  // Opciones de Tapa Personalizada
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
    // Avanzar a Etapa 2 (Fotocopia) o Etapa 3 (PDF Normal)
    setActiveStep(mode === 'fotocopia' ? 2 : 3);
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
        Asistente guiado por etapas para maquetar folletos A4 listos para imprimir a doble cara y coser/abrochar al centro en tamaño A5.
      </p>

      {/* INDICADOR DE PASOS / ETAPAS DESPLEGABLES */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { num: 1, label: '1. Archivo' },
          ...(mode === 'fotocopia' ? [{ num: 2, label: '2. Giro y Corte' }] : []),
          { num: 3, label: `${mode === 'fotocopia' ? '3' : '2'}. Foliado` },
          { num: 4, label: `${mode === 'fotocopia' ? '4' : '3'}. Carátula` },
          { num: 5, label: `${mode === 'fotocopia' ? '5' : '4'}. Generar` }
        ].map((s) => (
          <div
            key={s.num}
            style={{
              flex: 1, minWidth: '90px', padding: '0.5rem 0.6rem', textAlign: 'center',
              borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', fontWeight: 700,
              backgroundColor: activeStep === s.num ? 'var(--accent)' : activeStep > s.num ? 'rgba(186,253,193,0.15)' : 'var(--bg-surface-2)',
              color: activeStep === s.num ? '#000' : activeStep > s.num ? 'var(--accent)' : 'var(--text-disabled)',
              border: `1px solid ${activeStep === s.num ? 'var(--accent)' : activeStep > s.num ? 'var(--accent)' : 'var(--border-subtle)'}`
            }}
          >
            {activeStep > s.num ? `✓ ${s.label}` : s.label}
          </div>
        ))}
      </div>

      {/* ETAPA 1: CARGA DE ARCHIVO Y SELECTOR DE FORMATO */}
      <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-surface-2)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: `1px solid ${activeStep === 1 ? 'var(--accent)' : 'var(--border-subtle)'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
          <label style={{ fontSize: '0.88rem', color: 'var(--accent)', fontWeight: 700 }}>
            1. Subir archivo PDF y elegir formato de origen:
          </label>
          {activeStep > 1 && (
            <button onClick={() => setActiveStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Edit3 size={12} /> Editar
            </button>
          )}
        </div>

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

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <input type="radio" name="mode" value="normal" checked={mode === 'normal'} onChange={() => { setMode('normal'); if (file) setActiveStep(3); }} style={{ accentColor: 'var(--accent)' }} />
            <span>PDF Normal (Páginas individuales A4 / A5)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <input type="radio" name="mode" value="fotocopia" checked={mode === 'fotocopia'} onChange={() => { setMode('fotocopia'); if (file) setActiveStep(2); }} style={{ accentColor: 'var(--accent)' }} />
            <span>Fotocopia de Libro Abierto (Doble página por hoja A4)</span>
          </label>
        </div>
      </div>

      {!file && (
        <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-subtle)', textAlign: 'center', marginBottom: '1.5rem' }}>
          <Info size={24} color="var(--accent)" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            Subí tu archivo PDF arriba para desbloquear el visor y los pasos guiados
          </div>
        </div>
      )}

      {/* ETAPA 2: (SOLO FOTOCOPIA) GIRO Y CORTE DE HOJAS ESCANEADAS */}
      {file && mode === 'fotocopia' && activeStep >= 2 && (
        <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-surface-2)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: `1.5px solid ${activeStep === 2 ? 'var(--accent)' : 'var(--border-subtle)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <div style={{ fontSize: '0.88rem', color: 'var(--accent)', fontWeight: 700 }}>
              2. Preparación de Hojas Escaneadas (Giro 🔄 y Recorte ✂)
            </div>
            {activeStep > 2 && (
              <button onClick={() => setActiveStep(2)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Edit3 size={12} /> Editar
              </button>
            )}
          </div>

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

          {activeStep === 2 && (
            <button
              className="btn btn-primary"
              onClick={() => setActiveStep(3)}
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.8rem' }}
            >
              <Check size={16} />
              <span>✓ Confirmar Preparación de Hojas y Pasar a Foliado</span>
            </button>
          )}
        </div>
      )}

      {/* ETAPA 3: VISOR UNIFICADO DE FOLIADO Y SELECCIÓN DE PÁGINA */}
      {file && activeStep >= 3 && (
        <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-surface-2)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: `1.5px solid ${activeStep === 3 ? 'var(--accent)' : 'var(--border-subtle)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <div style={{ fontSize: '0.88rem', color: 'var(--accent)', fontWeight: 700 }}>
              {mode === 'fotocopia' ? '3' : '2'}. Visor de Foliado (Página con Número)
            </div>
            {activeStep > 3 && (
              <button onClick={() => setActiveStep(3)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Edit3 size={12} /> Editar
              </button>
            )}
          </div>

          {/* Mostrar visor solo en modo PDF Normal o cuando estamos en etapa 3 */}
          {mode === 'normal' && (
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
          )}

          {/* INSIGNIA DE ESTADO DE FOLIADO */}
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '0.9rem 1.1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.88rem', color: 'var(--accent)', fontWeight: 700 }}>
              {refPdfPage && refBookPage ? (
                <div>
                  ✓ En la página N° {refPdfPage} indicaste que ves el número impreso <span className="font-mono" style={{ fontSize: '1rem', color: '#0a0a0c', backgroundColor: 'var(--accent)', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>{refBookPage}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', fontWeight: 400, marginTop: '0.3rem' }}>
                    💡 Si escribiste mal o deseás corregir, hacé clic en cualquier página del visor arriba para cambiarlo.
                  </div>
                </div>
              ) : (
                <span>💡 Hacé clic en cualquier página del visor de arriba para indicar qué número impreso ves.</span>
              )}
            </div>

            {mode === 'fotocopia' && (
              <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px dashed var(--border-subtle)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, display: 'block', marginBottom: '0.6rem', textAlign: 'center' }}>
                  👉 Tocá del lado donde viste el número {refBookPage || 'impreso'}:
                </span>
                
                {/* Single divided page graphic */}
                <div style={{
                  maxWidth: '380px',
                  margin: '0 auto',
                  height: '85px',
                  border: '2px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  overflow: 'hidden',
                  backgroundColor: '#141418',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                  cursor: 'pointer'
                }}>
                  {/* MITAD IZQUIERDA */}
                  <div
                    onClick={() => setRefPageSide('izquierda')}
                    style={{
                      flex: 1,
                      borderRight: '2px dashed var(--border-subtle)',
                      backgroundColor: refPageSide === 'izquierda' ? 'var(--accent)' : 'transparent',
                      color: refPageSide === 'izquierda' ? '#0a0a0c' : 'var(--text-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      transition: 'all 0.2s ease',
                      userSelect: 'none'
                    }}
                  >
                    <span>◄ IZQUIERDA</span>
                    {refPageSide === 'izquierda' && (
                      <span style={{ fontSize: '0.75rem', marginTop: '3px', fontWeight: 900, backgroundColor: '#0a0a0c', color: 'var(--accent)', padding: '2px 8px', borderRadius: '4px' }}>
                        ✓ Pág {refBookPage || 'X'}
                      </span>
                    )}
                  </div>

                  {/* MITAD DERECHA */}
                  <div
                    onClick={() => setRefPageSide('derecha')}
                    style={{
                      flex: 1,
                      backgroundColor: refPageSide === 'derecha' ? 'var(--accent)' : 'transparent',
                      color: refPageSide === 'derecha' ? '#0a0a0c' : 'var(--text-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      transition: 'all 0.2s ease',
                      userSelect: 'none'
                    }}
                  >
                    <span>DERECHA ►</span>
                    {refPageSide === 'derecha' && (
                      <span style={{ fontSize: '0.75rem', marginTop: '3px', fontWeight: 900, backgroundColor: '#0a0a0c', color: 'var(--accent)', padding: '2px 8px', borderRadius: '4px' }}>
                        ✓ Pág {refBookPage || 'X'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {activeStep === 3 && (
            <button
              className="btn btn-primary"
              onClick={() => setActiveStep(4)}
              disabled={!refPdfPage || !refBookPage}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Check size={16} />
              <span>✓ Confirmar Foliación y Pasar a Carátula</span>
            </button>
          )}
        </div>
      )}

      {/* ETAPA 4: GESTIÓN DE TAPA / PORTADA EXTERIOR */}
      {file && activeStep >= 4 && (
        <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-surface-2)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: `1.5px solid ${activeStep === 4 ? 'var(--accent)' : 'var(--border-subtle)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <div style={{ fontSize: '0.88rem', color: 'var(--accent)', fontWeight: 700 }}>
              {mode === 'fotocopia' ? '4' : '3'}. Gestión de Tapa / Portada Exterior del Libro
            </div>
            {activeStep > 4 && (
              <button onClick={() => setActiveStep(4)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Edit3 size={12} /> Editar
              </button>
            )}
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>
                ¿Tu documento incluye la Tapa / Portada Exterior?
              </span>

              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                {/* OPCIÓN 1: YA INCLUYE TAPA */}
                <button
                  type="button"
                  onClick={() => setHasCover(true)}
                  style={{
                    flex: '1 1 200px',
                    padding: '0.7rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: hasCover ? 'rgba(186,253,193,0.15)' : 'var(--bg-surface-2)',
                    border: `1.5px solid ${hasCover ? 'var(--accent)' : 'var(--border-subtle)'}`,
                    color: hasCover ? 'var(--accent)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ✓ El documento YA incluye Tapa / Carátula
                </button>

                {/* OPCIÓN 2: NO TIENE TAPA (CREAR / SUBIR) */}
                <button
                  type="button"
                  onClick={() => setHasCover(false)}
                  style={{
                    flex: '1 1 200px',
                    padding: '0.7rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: !hasCover ? 'rgba(186,253,193,0.15)' : 'var(--bg-surface-2)',
                    border: `1.5px solid ${!hasCover ? 'var(--accent)' : 'var(--border-subtle)'}`,
                    color: !hasCover ? 'var(--accent)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  🎨 No tiene Tapa — Subir Imagen o Crear Tapa nueva
                </button>
              </div>
            </div>

            {hasCover ? (
              mode === 'normal' ? (
                <div style={{ padding: '0.6rem 0.8rem', backgroundColor: 'var(--bg-surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  💡 Se utilizará la <strong>Página 1</strong> del PDF subido como la Tapa Exterior del libro.
                </div>
              ) : (
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, display: 'block', marginBottom: '0.6rem', textAlign: 'center' }}>
                    👉 Tocá del lado donde está la Tapa / Portada en la 1ª hoja escaneada:
                  </span>
                  
                  {/* Single divided page graphic for Cover */}
                  <div style={{
                    maxWidth: '380px',
                    margin: '0 auto',
                    height: '80px',
                    border: '2px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    overflow: 'hidden',
                    backgroundColor: '#141418',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    cursor: 'pointer'
                  }}>
                    {/* MITAD IZQUIERDA */}
                    <div
                      onClick={() => setCoverSide('izquierda')}
                      style={{
                        flex: 1,
                        borderRight: '2px dashed var(--border-subtle)',
                        backgroundColor: coverSide === 'izquierda' ? 'var(--accent)' : 'transparent',
                        color: coverSide === 'izquierda' ? '#0a0a0c' : 'var(--text-secondary)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        transition: 'all 0.2s ease',
                        userSelect: 'none'
                      }}
                    >
                      <span>◄ IZQUIERDA</span>
                      {coverSide === 'izquierda' && (
                        <span style={{ fontSize: '0.75rem', marginTop: '3px', fontWeight: 900, backgroundColor: '#0a0a0c', color: 'var(--accent)', padding: '2px 8px', borderRadius: '4px' }}>
                          ✓ TAPA
                        </span>
                      )}
                    </div>

                    {/* MITAD DERECHA */}
                    <div
                      onClick={() => setCoverSide('derecha')}
                      style={{
                        flex: 1,
                        backgroundColor: coverSide === 'derecha' ? 'var(--accent)' : 'transparent',
                        color: coverSide === 'derecha' ? '#0a0a0c' : 'var(--text-secondary)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        transition: 'all 0.2s ease',
                        userSelect: 'none'
                      }}
                    >
                      <span>DERECHA ►</span>
                      {coverSide === 'derecha' && (
                        <span style={{ fontSize: '0.75rem', marginTop: '3px', fontWeight: 900, backgroundColor: '#0a0a0c', color: 'var(--accent)', padding: '2px 8px', borderRadius: '4px' }}>
                          ✓ TAPA
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            ) : null}

            {/* SUITE DE CREACIÓN DE TAPA SI NO VIENE INCORPORADA */}
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

          {activeStep === 4 && (
            <button
              className="btn btn-primary"
              onClick={() => setActiveStep(5)}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Check size={16} />
              <span>✓ Confirmar Carátula y Ver Maquetación</span>
            </button>
          )}
        </div>
      )}

      {/* ETAPA 5: DIAGRAMA TÉCNICO Y BOTÓN GENERAR */}
      {file && activeStep >= 5 && (
        <>
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
            style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '1rem' }}
          >
            <Download size={20} />
            <span>{loading ? 'Procesando Libro...' : 'Generar PDF Libro'}</span>
          </button>
        </>
      )}
    </div>
  );
}
