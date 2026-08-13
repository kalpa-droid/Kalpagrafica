import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Download, AlertCircle, CheckCircle, FileCheck, Info, Upload, Palette, Layers, Edit3, ArrowLeft, ArrowRight, Check, Crop, Maximize2 } from 'lucide-react';
import { pdfToLibro, crearCanvasTapaCustom, crearCanvasContratapaCustom, getCoverCanvasSize } from './pdfToLibro';
import PdfPreviewStrip from './PdfPreviewStrip';
import A5ImageCropperModal from './A5ImageCropperModal';
import ErrorBoundary from '../../components/ErrorBoundary';

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

function BookletDiagram({ mode, hasCover, coverSide, hasRefPage, refPdfPage, refBookPage, refPageSide, hasCustomCover, paperSize }) {
  const isFotocopia = mode === 'fotocopia';
  const bookPageLabel = paperSize === 'A3' ? 'A4' : 'A5';
  const paperLabel = paperSize === 'A3' ? 'A3' : 'A4';

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
        Diagrama Comparativo de Preimpresión: Original vs Resultado Final {bookPageLabel} Cosido
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
            <FileCheck size={14} /> 2. Imposición Final ({paperLabel} Doble Cara ➔ {bookPageLabel} Cosido)
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
            <div style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)', padding: '0.5rem 0.8rem', borderRadius: '4px', border: '1px solid var(--accent)', fontSize: '0.76rem', fontWeight: 700, textAlign: 'center' }}>
              ✓ Ya hemos tomado las medidas necesarias para que tu Libro / Folleto esté listo para imprimir.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function PdfToLibroTool() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('normal'); // 'normal' | 'fotocopia'
  const [paperSize, setPaperSize] = useState('A4'); // 'A4' (→ libro A5) | 'A3' (→ libro A4)
  const coverCanvasSize = useMemo(() => getCoverCanvasSize(paperSize), [paperSize]);

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
  const [deletedPages, setDeletedPages] = useState([]);
  const [pageOrder, setPageOrder] = useState([]);

  // Opciones de Contratapa (Portada Posterior)
  const [hasBackCover, setHasBackCover] = useState(true);
  const [backCoverSide, setBackCoverSide] = useState('izquierda'); // 'izquierda' | 'derecha'
  const [customBackCoverType, setCustomBackCoverType] = useState('upload'); // 'upload' | 'template'
  const [customBackCoverUploadUri, setCustomBackCoverUploadUri] = useState(null);
  const [backCoverSynopsis, setBackCoverSynopsis] = useState('');
  const [backCoverPublisher, setBackCoverPublisher] = useState('');
  const [backCoverIsbn, setBackCoverIsbn] = useState('');
  const [backCoverBgColor, setBackCoverBgColor] = useState('#1a1a2e');
  const [backCoverTextColor, setBackCoverTextColor] = useState('#bafdc1');
  const [backCoverBgImageUri, setBackCoverBgImageUri] = useState(null);
  const [backCoverPreviewUrl, setBackCoverPreviewUrl] = useState(null);

  // Recortador de Imagen A5 Interactivo (Pantalla Completa)
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState(null);
  const [cropperTarget, setCropperTarget] = useState(null); // 'cover_upload' | 'cover_bg' | 'backcover_upload' | 'backcover_bg'
  const [cropperTitle, setCropperTitle] = useState('Recortar Imagen A5');

  // Opciones de Tapa Personalizada
  const [customCoverType, setCustomCoverType] = useState('upload'); // 'upload' | 'template'
  const [customCoverUploadUri, setCustomCoverUploadUri] = useState(null);
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateAuthor, setTemplateAuthor] = useState('');
  const [templatePublisher, setTemplatePublisher] = useState('');
  const [templateBgColor, setTemplateBgColor] = useState('#1a1a2e');
  const [templateTextColor, setTemplateTextColor] = useState('#bafdc1');
  const [templateFontFamily, setTemplateFontFamily] = useState('Georgia, serif');
  const [templateFontSize, setTemplateFontSize] = useState(95);
  const [templateLineHeight, setTemplateLineHeight] = useState(1.25);
  const [templateBgImageUri, setTemplateBgImageUri] = useState(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(null);

  // Opciones de Retiro de Tapa / Contratapa en blanco
  const [blankBehindCover, setBlankBehindCover] = useState(true);
  const [blankInFrontBackCover, setBlankInFrontBackCover] = useState(true);

  const autoRefPageSide = Number(refPdfPage) % 2 !== 0 ? 'derecha' : 'izquierda';
  const effectiveRefPageSide = mode === 'fotocopia' ? refPageSide : autoRefPageSide;

  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [progressPct, setProgressPct] = useState(0);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const changeStep = (stepNum) => {
    setActiveStep(stepNum);
    setTimeout(() => {
      const stepElem = document.getElementById(`pdf-step-${stepNum}`) || document.getElementById('pdf-libro-tool-container');
      if (stepElem) {
        const navbarHeight = 90;
        const y = stepElem.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }, 60);
  };

  const handleToggleDeletePage = (targetId) => {
    setDeletedPages(prev =>
      prev.includes(targetId) ? prev.filter(p => p !== targetId) : [...prev, targetId]
    );
  };

  const handleMovePage = (itemId, direction, currentItems) => {
    setPageOrder(prev => {
      const itemsList = (currentItems && currentItems.length > 0) ? currentItems : [];
      const currentIds = itemsList.map(it => it.id);

      const list = (prev && prev.length === currentIds.length) ? [...prev] : currentIds;
      const targetId = String(itemId);
      const idx = list.indexOf(targetId);

      if (idx === -1) return prev;

      if (direction === 'left' && idx > 0) {
        const temp = list[idx];
        list[idx] = list[idx - 1];
        list[idx - 1] = temp;
      } else if (direction === 'right' && idx < list.length - 1) {
        const temp = list[idx];
        list[idx] = list[idx + 1];
        list[idx + 1] = temp;
      }
      return list;
    });
  };

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
            fontFamily: templateFontFamily,
            fontSize: templateFontSize,
            lineHeightMultiplier: templateLineHeight,
            bgImageUri: templateBgImageUri
          };
      const canvas = await crearCanvasTapaCustom(config, coverCanvasSize);
      if (canvas && !isCancelled) {
        setCoverPreviewUrl(canvas.toDataURL('image/jpeg', 0.8));
        canvas.width = 0; canvas.height = 0;
      }
    };
    generatePreview();
    return () => { isCancelled = true; };
  }, [hasCover, customCoverType, customCoverUploadUri, templateTitle, templateAuthor, templatePublisher, templateBgColor, templateTextColor, templateFontFamily, templateFontSize, templateLineHeight, templateBgImageUri, coverCanvasSize]);

  // Generar vista previa en tiempo real de la Contratapa Custom
  useEffect(() => {
    if (hasBackCover) {
      setBackCoverPreviewUrl(null);
      return;
    }
    let isCancelled = false;
    const generatePreview = async () => {
      const config = customBackCoverType === 'upload'
        ? { type: 'upload', imageUri: customBackCoverUploadUri }
        : {
            type: 'template',
            synopsis: backCoverSynopsis,
            publisher: backCoverPublisher,
            isbn: backCoverIsbn,
            bgColor: backCoverBgColor,
            textColor: backCoverTextColor,
            fontFamily: templateFontFamily,
            bgImageUri: backCoverBgImageUri
          };
      const canvas = await crearCanvasContratapaCustom(config, coverCanvasSize);
      if (canvas && !isCancelled) {
        setBackCoverPreviewUrl(canvas.toDataURL('image/jpeg', 0.8));
        canvas.width = 0; canvas.height = 0;
      }
    };
    generatePreview();
    return () => { isCancelled = true; };
  }, [hasBackCover, customBackCoverType, customBackCoverUploadUri, backCoverSynopsis, backCoverPublisher, backCoverIsbn, backCoverBgColor, backCoverTextColor, templateFontFamily, backCoverBgImageUri, coverCanvasSize]);

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
    setDeletedPages([]);
    setPageOrder([]);
    changeStep(2);
  };

  const handleImageSelectForCropping = (e, targetKey, titleText) => {
    const imgFile = e.target.files && e.target.files[0];
    if (!imgFile) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setCropperImageSrc(evt.target.result);
      setCropperTarget(targetKey);
      setCropperTitle(titleText || 'Recortar Imagen A5');
      setCropperOpen(true);
    };
    reader.readAsDataURL(imgFile);
    e.target.value = '';
  };

  const handleCroppedResult = (croppedUri) => {
    if (cropperTarget === 'cover_upload') {
      setCustomCoverUploadUri(croppedUri);
    } else if (cropperTarget === 'cover_bg') {
      setTemplateBgImageUri(croppedUri);
    } else if (cropperTarget === 'backcover_upload') {
      setCustomBackCoverUploadUri(croppedUri);
    } else if (cropperTarget === 'backcover_bg') {
      setBackCoverBgImageUri(croppedUri);
    }
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

      const customBackCoverConfig = !hasBackCover ? (
        customBackCoverType === 'upload'
          ? { type: 'upload', imageUri: customBackCoverUploadUri }
          : {
              type: 'template',
              synopsis: backCoverSynopsis,
              publisher: backCoverPublisher,
              isbn: backCoverIsbn,
              bgColor: backCoverBgColor,
              textColor: backCoverTextColor,
              bgImageUri: backCoverBgImageUri
            }
      ) : null;

      const options = {
        hasCover,
        coverSide,
        hasBackCover,
        backCoverSide,
        refPdfPage: Number(refPdfPage) || 0,
        refBookPage: Number(refBookPage) || 0,
        refPageSide: effectiveRefPageSide,
        pageRotations,
        pageSplitOffsets,
        customCover: customCoverConfig,
        customBackCover: customBackCoverConfig,
        paperSize,
        deletedPages,
        pageOrder,
        blankBehindCover,
        blankInFrontBackCover
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

  const handleSelectPageFromViewer = (pageNum, bookNum, side) => {
    setHasRefPage(true);
    setRefPdfPage(String(pageNum));
    if (bookNum !== undefined && bookNum !== null && bookNum !== '') {
      setRefBookPage(String(bookNum));
    }
    if (side) {
      setRefPageSide(side === 'L' ? 'izquierda' : side === 'R' ? 'derecha' : side);
    }
  };

  return (
    <div id="pdf-libro-tool-container" style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', padding: '1.8rem', boxShadow: 'var(--shadow-card)' }}>
      <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <BookOpen size={20} color="var(--accent)" />
        <span>PDF a Libro (Imposición de Folleto A4 / A3)</span>
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
        Asistente guiado por etapas para maquetar folletos listos para imprimir a doble cara y coser/abrochar al centro — en papel A4 (libro A5) o en papel A3 (libro A4).
      </p>

      {/* INDICADOR DE PASOS / ETAPAS DESPLEGABLES */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { num: 1, label: '1. Archivo' },
          { num: 2, label: '2. Preparar Páginas' },
          { num: 3, label: '3. Foliado' },
          { num: 4, label: '4. Carátula' },
          { num: 5, label: '5. Generar' }
        ].map((s) => (
          <div
            key={s.num}
            onClick={() => file && changeStep(s.num)}
            style={{
              flex: 1, minWidth: '90px', padding: '0.55rem 0.6rem', textAlign: 'center',
              borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', fontWeight: 700,
              backgroundColor: activeStep === s.num ? 'var(--accent)' : activeStep > s.num ? 'rgba(186,253,193,0.15)' : 'var(--bg-surface-2)',
              color: activeStep === s.num ? '#000' : activeStep > s.num ? 'var(--accent)' : 'var(--text-disabled)',
              border: `1px solid ${activeStep === s.num ? 'var(--accent)' : activeStep > s.num ? 'var(--accent)' : 'var(--border-subtle)'}`,
              cursor: file ? 'pointer' : 'default',
              transition: 'all 0.15s ease'
            }}
          >
            {activeStep > s.num ? `✓ ${s.label}` : s.label}
          </div>
        ))}
      </div>

      {/* ETAPA 1: CARGA DE ARCHIVO Y SELECTOR DE FORMATO */}
      {activeStep === 1 && (
        <div id="pdf-step-1" style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-surface-2)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <label style={{ fontSize: '0.88rem', color: 'var(--accent)', fontWeight: 700 }}>
              1. Subir archivo PDF y elegir formato de origen:
            </label>
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

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <input type="radio" name="mode" value="normal" checked={mode === 'normal'} onChange={() => { setMode('normal'); if (file) changeStep(2); }} style={{ accentColor: 'var(--accent)' }} />
              <span>PDF Normal (Páginas individuales)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <input type="radio" name="mode" value="fotocopia" checked={mode === 'fotocopia'} onChange={() => { setMode('fotocopia'); if (file) changeStep(2); }} style={{ accentColor: 'var(--accent)' }} />
              <span>Fotocopia de Libro Abierto (Doble página por hoja A4)</span>
            </label>
          </div>

          <div style={{ paddingTop: '0.8rem', borderTop: '1px dashed var(--border-subtle)', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
              ¿En qué tamaño de papel vas a imprimir? (define el tamaño final de tu libro y el de la tapa/contratapa)
            </span>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input type="radio" name="paperSize" value="A4" checked={paperSize === 'A4'} onChange={() => setPaperSize('A4')} style={{ accentColor: 'var(--accent)' }} />
                <span>Papel A4 <span style={{ color: 'var(--text-disabled)' }}>→ libro final tamaño A5</span></span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input type="radio" name="paperSize" value="A3" checked={paperSize === 'A3'} onChange={() => setPaperSize('A3')} style={{ accentColor: 'var(--accent)' }} />
                <span>Papel A3 <span style={{ color: 'var(--text-disabled)' }}>→ libro final tamaño A4</span></span>
              </label>
            </div>
          </div>

          {file && (
            <button
              className="btn btn-primary"
              onClick={() => changeStep(2)}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Check size={16} />
              <span>✓ Pasar a Preparar Páginas (Paso 2) ►</span>
            </button>
          )}
        </div>
      )}

      {/* RESUMEN COMPACTO DE ARCHIVO Y CONFIGURACIÓN (SIEMPRE VISIBLE EN PASOS 2 A 5) */}
      {file && activeStep > 1 && (
        <div style={{
          marginBottom: '1rem',
          backgroundColor: 'var(--bg-surface-2)',
          padding: '0.8rem 1.2rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.6rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>📄 Archivo:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{file.name}</span>
            <span style={{ color: 'var(--text-disabled)' }}>({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
            <span style={{ color: 'var(--border-subtle)' }}>|</span>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Modo:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{mode === 'fotocopia' ? 'Fotocopia Doble Página' : 'PDF Normal'}</span>
            <span style={{ color: 'var(--border-subtle)' }}>|</span>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Papel:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{paperSize} ({paperSize === 'A3' ? 'Libro A4' : 'Libro A5'})</span>
          </div>
          <button
            onClick={() => changeStep(1)}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              padding: '0.35rem 0.75rem',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Edit3 size={13} color="var(--accent)" /> Cambiar Archivo / Formato
          </button>
        </div>
      )}

      {!file && (
        <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-subtle)', textAlign: 'center', marginBottom: '1.5rem' }}>
          <Info size={24} color="var(--accent)" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            Subí tu archivo PDF arriba para desbloquear el visor y los pasos guiados
          </div>
        </div>
      )}

      {/* ETAPA 2: PREPARACIÓN DE PÁGINAS (ORGANIZAR ⬅️ ➡️, ELIMINAR 🗑️, GIRAR 🔄 Y CORTAR ✂️) */}
      {file && activeStep === 2 && (
        <div id="pdf-step-2" style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-surface-2)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <div style={{ fontSize: '0.88rem', color: 'var(--accent)', fontWeight: 700 }}>
              2. Organizar y Ajustar Páginas (Reordenar ⬅️ ➡️, Eliminar 🗑️, Girar 🔄 y Cortar ✂️)
            </div>
          </div>

          <ErrorBoundary title="No se pudo renderizar la vista previa de este PDF">
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
              deletedPages={deletedPages}
              onDeletePage={handleToggleDeletePage}
              pageOrder={pageOrder}
              onMovePage={handleMovePage}
              showFoliadoConfirm={false}
            />
          </ErrorBoundary>

          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={() => changeStep(1)}
              style={{ flex: 1, minWidth: '160px', justifyContent: 'center' }}
            >
              <ArrowLeft size={16} />
              <span>◄ Volver a Paso 1 (Archivo)</span>
            </button>
            <button
              className="btn btn-primary"
              onClick={() => changeStep(3)}
              style={{ flex: 2, minWidth: '220px', justifyContent: 'center' }}
            >
              <Check size={16} />
              <span>✓ Confirmar Organización y Pasar a Foliado (Paso 3) ►</span>
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 3: FOLIADO DE REFERENCIA (IDENTIFICAR 1 SOLA PÁGINA CORTADA) */}
      {file && activeStep === 3 && (
        <div id="pdf-step-3" style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-surface-2)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <div style={{ fontSize: '0.88rem', color: 'var(--accent)', fontWeight: 700 }}>
              3. Foliado de Referencia (Identificar 1 SOLA página con número impreso)
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '0.9rem 1.1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.84rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.4rem' }}>
              💡 SÓLO REQUIERES IDENTIFICAR 1 SOLA PÁGINA:
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Tocá cualquier página activa del visor donde veas un número impreso (ejemplo: la portada o la página 1). Con ese único dato la suite calculará automáticamente toda la secuencia del folleto.
            </div>
          </div>

          <ErrorBoundary title="No se pudo renderizar la vista previa de este PDF">
            <PdfPreviewStrip
              file={file}
              selectedPdfPage={Number(refPdfPage) || 0}
              selectedSide={refPageSide}
              onSelectPage={handleSelectPageFromViewer}
              mode={mode}
              pageRotations={pageRotations}
              onRotatePage={handleRotatePage}
              pageSplitOffsets={pageSplitOffsets}
              onAdjustSplitPage={handleAdjustSplitPage}
              refBookPage={refBookPage}
              deletedPages={deletedPages}
              onDeletePage={handleToggleDeletePage}
              pageOrder={pageOrder}
              onMovePage={handleMovePage}
              showFoliadoConfirm={true}
              isFoliadoStep={true}
            />
          </ErrorBoundary>

          {/* INSIGNIA DE ESTADO DE FOLIADO */}
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '0.9rem 1.1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.88rem', color: 'var(--accent)', fontWeight: 700 }}>
              {refPdfPage && refBookPage ? (
                <div>
                  ✓ En la Hoja N° {refPdfPage} {mode === 'fotocopia' ? `(${refPageSide === 'izquierda' ? 'Mitad Izquierda' : 'Mitad Derecha'})` : ''} indicaste que ves el número impreso <span className="font-mono" style={{ fontSize: '1rem', color: '#0a0a0c', backgroundColor: 'var(--accent)', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>{refBookPage}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', fontWeight: 400, marginTop: '0.3rem' }}>
                    💡 Si escribiste mal o deseás corregir, hacé clic en cualquier página del visor arriba para cambiarlo.
                  </div>
                </div>
              ) : (
                <span>💡 Tocá la página individualizada arriba e ingresá qué número impreso ves.</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={() => changeStep(2)}
              style={{ flex: 1, minWidth: '160px', justifyContent: 'center' }}
            >
              <ArrowLeft size={16} />
              <span>◄ Volver a Paso 2 (Organizar Páginas)</span>
            </button>
            <button
              className="btn btn-primary"
              onClick={() => changeStep(4)}
              disabled={!refPdfPage || !refBookPage}
              style={{ flex: 2, minWidth: '220px', justifyContent: 'center' }}
            >
              <Check size={16} />
              <span>✓ Confirmar Foliación y Pasar a Carátula (Paso 4) ►</span>
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 4: GESTIÓN DE TAPA Y CONTRATAPA EXTERIOR */}
      {file && activeStep === 4 && (
        <div id="pdf-step-4" style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-surface-2)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <div style={{ fontSize: '0.88rem', color: 'var(--accent)', fontWeight: 700 }}>
              4. Gestión de Tapa y Contratapa Exterior del Libro
            </div>
          </div>

          {/* SECCIÓN A: PORTADA EXTERIOR (TAPA) */}
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '1.2rem' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.6rem' }}>
              📘 1. Tapa / Portada Exterior (FRENTE)
            </div>
            <div style={{ marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                ¿Tu documento incluye la Tapa Exterior?
              </span>

              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setHasCover(true)}
                  style={{
                    flex: '1 1 180px',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: hasCover ? 'rgba(186,253,193,0.15)' : 'var(--bg-surface-2)',
                    border: `1.5px solid ${hasCover ? 'var(--accent)' : 'var(--border-subtle)'}`,
                    color: hasCover ? 'var(--accent)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textAlign: 'left'
                  }}
                >
                  ✓ El documento YA incluye Tapa
                </button>
                <button
                  type="button"
                  onClick={() => setHasCover(false)}
                  style={{
                    flex: '1 1 180px',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: !hasCover ? 'rgba(186,253,193,0.15)' : 'var(--bg-surface-2)',
                    border: `1.5px solid ${!hasCover ? 'var(--accent)' : 'var(--border-subtle)'}`,
                    color: !hasCover ? 'var(--accent)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textAlign: 'left'
                  }}
                >
                  🎨 Crear / Subir Tapa nueva
                </button>
              </div>
            </div>

            {hasCover ? (
              <div style={{ padding: '0.6rem 0.9rem', backgroundColor: 'var(--bg-surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                💡 Se utilizará la <strong>Página 1</strong> de tu secuencia ordenada como la Tapa Exterior (Portada).
              </div>
            ) : (
              <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px dashed var(--border-subtle)' }}>
                <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '0.8rem' }}>
                  <button onClick={() => setCustomCoverType('upload')} style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: customCoverType === 'upload' ? 'rgba(186,253,193,0.15)' : 'var(--bg-surface-2)', border: `1.5px solid ${customCoverType === 'upload' ? 'var(--accent)' : 'var(--border-subtle)'}`, color: customCoverType === 'upload' ? 'var(--accent)' : 'var(--text-primary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                    <Upload size={13} /> Subir Imagen
                  </button>
                  <button onClick={() => setCustomCoverType('template')} style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: customCoverType === 'template' ? 'rgba(186,253,193,0.15)' : 'var(--bg-surface-2)', border: `1.5px solid ${customCoverType === 'template' ? 'var(--accent)' : 'var(--border-subtle)'}`, color: customCoverType === 'template' ? 'var(--accent)' : 'var(--text-primary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                    <Palette size={13} /> Crear con Plantilla
                  </button>
                </div>

                {customCoverType === 'upload' ? (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Subir Imagen de Tapa:</span>
                    <input type="file" accept="image/*" onChange={(e) => handleImageSelectForCropping(e, 'cover_upload', 'Recortar Tapa A5 (Vertical)')} className="input" style={{ width: '100%', fontSize: '0.78rem' }} />
                    {customCoverUploadUri && (
                      <div style={{ marginTop: '0.6rem', textAlign: 'center' }}>
                        <img src={customCoverUploadUri} alt="Tapa Crop" style={{ width: '90px', height: '127px', borderRadius: '4px', border: '1.5px solid var(--accent)', objectFit: 'cover' }} />
                        <button
                          onClick={() => {
                            setCropperImageSrc(customCoverUploadUri);
                            setCropperTarget('cover_upload');
                            setCropperTitle('Recortar Tapa A5 (Vertical)');
                            setCropperOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ marginTop: '0.4rem', fontSize: '0.72rem', gap: '0.3rem' }}
                        >
                          <Crop size={12} /> Recortar / Ajustar Tapa A5 en Pantalla Completa
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {/* Botonera rápida de Emojis */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', alignItems: 'center', backgroundColor: 'var(--bg-surface-2)', padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--accent)', fontWeight: 700, marginRight: '0.2rem' }}>Insertar Emoji:</span>
                      {['✨', '📘', '🎨', '📖', '✍️', '🌟', '📜', '💎', '🚀', '🔥', '💡', '✒️', '🏆', '👑', '🌿', '🗿', '📚', '🔮'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setTemplateTitle(prev => prev + emoji)}
                          title={`Insertar ${emoji} en el Título`}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', padding: '2px 4px', borderRadius: '3px' }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    <input type="text" placeholder="Título del Libro (Multilínea con margen de 2 cm)" value={templateTitle} onChange={(e) => setTemplateTitle(e.target.value)} className="input" style={{ fontSize: '0.78rem' }} />
                    <input type="text" placeholder="Autor / Creador" value={templateAuthor} onChange={(e) => setTemplateAuthor(e.target.value)} className="input" style={{ fontSize: '0.78rem' }} />
                    <input type="text" placeholder="Editorial / Marca" value={templatePublisher} onChange={(e) => setTemplatePublisher(e.target.value)} className="input" style={{ fontSize: '0.78rem' }} />

                    {/* Selector de Estilos Tipográficos Google / Editorial */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.2rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Estilo de Tipografía:</span>
                      <select
                        value={templateFontFamily}
                        onChange={(e) => setTemplateFontFamily(e.target.value)}
                        className="input"
                        style={{ fontSize: '0.78rem', backgroundColor: 'var(--bg-surface-2)', cursor: 'pointer' }}
                      >
                        <option value="Georgia, serif">Georgia (Editorial Clásico)</option>
                        <option value="'Playfair Display', Georgia, serif">Playfair Display (Elegante)</option>
                        <option value="'Cinzel', Georgia, serif">Cinzel (Romano Monumental)</option>
                        <option value="'Outfit', sans-serif">Outfit (Geométrico Moderno)</option>
                        <option value="'Montserrat', sans-serif">Montserrat (Posters & Titulares)</option>
                        <option value="'Oswald', sans-serif">Oswald (Condensado Titular)</option>
                        <option value="'Pacifico', cursive">Pacifico (Manuscrita / Cursiva)</option>
                        <option value="'Roboto', sans-serif">Roboto (Sans-Serif Limpio)</option>
                      </select>
                    </div>

                    {/* Regulador de Tamaño de Título e Interlineado */}
                    <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                      <div style={{ flex: 1, minWidth: '130px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                          <span>Tamaño Título:</span>
                          <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{templateFontSize}px</span>
                        </div>
                        <input
                          type="range"
                          min="60"
                          max="140"
                          value={templateFontSize}
                          onChange={(e) => setTemplateFontSize(Number(e.target.value))}
                          style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: '130px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                          <span>Altura de Línea:</span>
                          <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{templateLineHeight}x</span>
                        </div>
                        <input
                          type="range"
                          min="1.0"
                          max="1.6"
                          step="0.05"
                          value={templateLineHeight}
                          onChange={(e) => setTemplateLineHeight(Number(e.target.value))}
                          style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.2rem' }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Fondo:</span>
                        <input type="color" value={templateBgColor} onChange={(e) => setTemplateBgColor(e.target.value)} style={{ width: '100%', height: '28px', cursor: 'pointer' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Texto:</span>
                        <input type="color" value={templateTextColor} onChange={(e) => setTemplateTextColor(e.target.value)} style={{ width: '100%', height: '28px', cursor: 'pointer' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Opciones de Retiro de Tapa */}
            <div style={{ marginTop: '0.8rem', paddingTop: '0.6rem', borderTop: '1px dashed var(--border-subtle)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={blankBehindCover}
                  onChange={(e) => setBlankBehindCover(e.target.checked)}
                  style={{ accentColor: 'var(--accent)', width: '15px', height: '15px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 600 }}>✓ Mantener el dorso / la vuelta de la Tapa en blanco (Retiro de Tapa)</span>
              </label>
              <div style={{ fontSize: '0.71rem', color: 'var(--text-disabled)', marginLeft: '1.4rem', marginTop: '0.2rem' }}>
                💡 Agrega automáticamente una hoja vacía tras la portada para que la vuelta quede limpia sin imprimir.
              </div>
            </div>
          </div>

          {/* SECCIÓN B: PORTADA POSTERIOR (CONTRATAPA) */}
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.6rem' }}>
              📙 2. Contratapa / Portada Posterior (DORSAL)
            </div>
            <div style={{ marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                ¿Tu documento incluye la Contratapa Exterior?
              </span>

              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setHasBackCover(true)}
                  style={{
                    flex: '1 1 180px',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: hasBackCover ? 'rgba(186,253,193,0.15)' : 'var(--bg-surface-2)',
                    border: `1.5px solid ${hasBackCover ? 'var(--accent)' : 'var(--border-subtle)'}`,
                    color: hasBackCover ? 'var(--accent)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textAlign: 'left'
                  }}
                >
                  ✓ El documento YA incluye Contratapa
                </button>
                <button
                  type="button"
                  onClick={() => setHasBackCover(false)}
                  style={{
                    flex: '1 1 180px',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: !hasBackCover ? 'rgba(186,253,193,0.15)' : 'var(--bg-surface-2)',
                    border: `1.5px solid ${!hasBackCover ? 'var(--accent)' : 'var(--border-subtle)'}`,
                    color: !hasBackCover ? 'var(--accent)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textAlign: 'left'
                  }}
                >
                  🎨 Crear / Subir Contratapa nueva
                </button>
              </div>
            </div>

            {hasBackCover ? (
              <div style={{ padding: '0.6rem 0.9rem', backgroundColor: 'var(--bg-surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                💡 Se utilizará la <strong>Última Página</strong> de tu secuencia ordenada como la Contratapa Exterior (Dorsal).
              </div>
            ) : (
              <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px dashed var(--border-subtle)' }}>
                <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '0.8rem' }}>
                  <button onClick={() => setCustomBackCoverType('upload')} style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: customBackCoverType === 'upload' ? 'rgba(186,253,193,0.15)' : 'var(--bg-surface-2)', border: `1.5px solid ${customBackCoverType === 'upload' ? 'var(--accent)' : 'var(--border-subtle)'}`, color: customBackCoverType === 'upload' ? 'var(--accent)' : 'var(--text-primary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                    <Upload size={13} /> Subir Imagen
                  </button>
                  <button onClick={() => setCustomBackCoverType('template')} style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: customBackCoverType === 'template' ? 'rgba(186,253,193,0.15)' : 'var(--bg-surface-2)', border: `1.5px solid ${customBackCoverType === 'template' ? 'var(--accent)' : 'var(--border-subtle)'}`, color: customBackCoverType === 'template' ? 'var(--accent)' : 'var(--text-primary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                    <Palette size={13} /> Crear con Plantilla
                  </button>
                </div>

                {customBackCoverType === 'upload' ? (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Subir Imagen de Contratapa:</span>
                    <input type="file" accept="image/*" onChange={(e) => handleImageSelectForCropping(e, 'backcover_upload', 'Recortar Contratapa A5 (Vertical)')} className="input" style={{ width: '100%', fontSize: '0.78rem' }} />
                    {customBackCoverUploadUri && (
                      <div style={{ marginTop: '0.6rem', textAlign: 'center' }}>
                        <img src={customBackCoverUploadUri} alt="Contratapa Crop" style={{ width: '90px', height: '127px', borderRadius: '4px', border: '1.5px solid var(--accent)', objectFit: 'cover' }} />
                        <button
                          onClick={() => {
                            setCropperImageSrc(customBackCoverUploadUri);
                            setCropperTarget('backcover_upload');
                            setCropperTitle('Recortar Contratapa A5 (Vertical)');
                            setCropperOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ marginTop: '0.4rem', fontSize: '0.72rem', gap: '0.3rem' }}
                        >
                          <Crop size={12} /> Recortar / Ajustar Contratapa A5 en Pantalla Completa
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {/* Botonera rápida de Emojis para Contratapa */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', alignItems: 'center', backgroundColor: 'var(--bg-surface-2)', padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--accent)', fontWeight: 700, marginRight: '0.2rem' }}>Insertar Emoji:</span>
                      {['✨', '📘', '🎨', '📖', '✍️', '🌟', '📜', '💎', '🚀', '🔥', '💡', '✒️', '🏆', '👑', '🌿', '🗿', '📚', '🔮'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setBackCoverSynopsis(prev => prev + emoji)}
                          title={`Insertar ${emoji} en la Sinopsis`}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', padding: '2px 4px', borderRadius: '3px' }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    <textarea placeholder="Resumen / Sinopsis del libro..." value={backCoverSynopsis} onChange={(e) => setBackCoverSynopsis(e.target.value)} className="input" style={{ fontSize: '0.78rem', height: '60px', resize: 'vertical' }} />
                    <input type="text" placeholder="ISBN / Código (opcional)" value={backCoverIsbn} onChange={(e) => setBackCoverIsbn(e.target.value)} className="input" style={{ fontSize: '0.78rem' }} />
                    <input type="text" placeholder="Editorial / Créditos" value={backCoverPublisher} onChange={(e) => setBackCoverPublisher(e.target.value)} className="input" style={{ fontSize: '0.78rem' }} />
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Fondo:</span>
                        <input type="color" value={backCoverBgColor} onChange={(e) => setBackCoverBgColor(e.target.value)} style={{ width: '100%', height: '28px', cursor: 'pointer' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Texto:</span>
                        <input type="color" value={backCoverTextColor} onChange={(e) => setBackCoverTextColor(e.target.value)} style={{ width: '100%', height: '28px', cursor: 'pointer' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Opciones de Retiro de Contratapa */}
            <div style={{ marginTop: '0.8rem', paddingTop: '0.6rem', borderTop: '1px dashed var(--border-subtle)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={blankInFrontBackCover}
                  onChange={(e) => setBlankInFrontBackCover(e.target.checked)}
                  style={{ accentColor: 'var(--accent)', width: '15px', height: '15px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 600 }}>✓ Mantener el frente / el interior de la Contratapa en blanco (Retiro de Contratapa)</span>
              </label>
              <div style={{ fontSize: '0.71rem', color: 'var(--text-disabled)', marginLeft: '1.4rem', marginTop: '0.2rem' }}>
                💡 Agrega automáticamente una hoja vacía previa a la contratapa posterior.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={() => changeStep(3)}
              style={{ flex: 1, minWidth: '160px', justifyContent: 'center' }}
            >
              <ArrowLeft size={16} />
              <span>◄ Volver a Paso 3 (Foliado)</span>
            </button>
            <button
              className="btn btn-primary"
              onClick={() => changeStep(5)}
              style={{ flex: 2, minWidth: '220px', justifyContent: 'center' }}
            >
              <Check size={16} />
              <span>✓ Confirmar Tapas y Pasar a Generar (Paso 5) ►</span>
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 5: DIAGRAMA TÉCNICO Y BOTÓN GENERAR */}
      {file && activeStep === 5 && (
        <div id="pdf-step-5" style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-surface-2)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.88rem', color: 'var(--accent)', fontWeight: 700 }}>
              5. Maquetación Final y Generación de PDF Imprimible
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => changeStep(4)}
              style={{ gap: '0.3rem', fontSize: '0.78rem' }}
            >
              <ArrowLeft size={14} /> ◄ Volver a Paso 4 (Carátula)
            </button>
          </div>

          <BookletDiagram
            mode={mode}
            hasCover={hasCover}
            coverSide={coverSide}
            hasRefPage={hasRefPage}
            refPdfPage={Number(refPdfPage) || 0}
            refBookPage={Number(refBookPage) || 0}
            refPageSide={effectiveRefPageSide}
            hasCustomCover={!hasCover && (customCoverUploadUri || templateTitle)}
            paperSize={paperSize}
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

          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={() => changeStep(4)}
              style={{ flex: 1, minWidth: '160px', justifyContent: 'center' }}
            >
              <ArrowLeft size={16} />
              <span>◄ Volver a Paso 4 (Carátula)</span>
            </button>
            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={!file || loading}
              style={{ flex: 2, minWidth: '220px', justifyContent: 'center', padding: '0.8rem', fontSize: '1rem' }}
            >
              <Download size={20} />
              <span>{loading ? 'Generando PDF Libro...' : 'DESCARGAR PDF LIBRO IMPRIMIBLE'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL RECORTADOR DE IMAGEN A5 EN PANTALLA COMPLETA */}
      <A5ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={cropperImageSrc}
        title={cropperTitle}
        targetSize={coverCanvasSize}
        sizeLabel={paperSize === 'A3' ? 'A4' : 'A5'}
        onCropComplete={handleCroppedResult}
        onClose={() => setCropperOpen(false)}
      />
    </div>
  );
}
