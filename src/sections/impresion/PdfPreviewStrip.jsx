import React, { useEffect, useState, useRef } from 'react';
import { Eye, ChevronLeft, ChevronRight, CheckCircle2, RefreshCw, ZoomIn, X, Check } from 'lucide-react';
import { inyectarPDFjs } from './pdfToLibro';

function LightboxModal({ pdfDoc, pageNum, mode, rotation = 0, onSelect, onClose, initialBookPage = '' }) {
  const [highResUrl, setHighResUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookNumberInput, setBookNumberInput] = useState(initialBookPage);

  useEffect(() => {
    let isCancelled = false;
    const renderHighRes = async () => {
      if (!pdfDoc) return;
      try {
        setLoading(true);
        const page = await pdfDoc.getPage(pageNum);
        if (isCancelled) return;

        const rawViewport = page.getViewport({ scale: 1.2 });
        const isFotocopia = mode === 'fotocopia';
        const isVertical = rawViewport.height > rawViewport.width;

        let autoAngle = (isFotocopia && isVertical) ? 90 : 0;
        const totalAngle = (autoAngle + rotation) % 360;

        const viewport = page.getViewport({ scale: 1.2, rotation: totalAngle });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;

        if (!isCancelled) {
          setHighResUrl(canvas.toDataURL('image/jpeg', 0.9));
          setLoading(false);
        }
        canvas.width = 0; canvas.height = 0;
        page.cleanup();
      } catch (err) {
        console.error('Error al cargar pantalla completa:', err);
      }
    };
    renderHighRes();
    return () => { isCancelled = true; };
  }, [pdfDoc, pageNum, mode, rotation]);

  const handleConfirm = () => {
    onSelect(pageNum, bookNumberInput);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      backdropFilter: 'blur(5px)'
    }}>
      {/* Botón cerrar */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: '20px', right: '20px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '50%', width: '36px', height: '36px',
          color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <X size={20} />
      </button>

      {/* Imagen en Alta Resolución */}
      <div style={{
        maxHeight: '65vh',
        maxWidth: '90vw',
        overflow: 'auto',
        marginBottom: '1.5rem',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px'
      }}>
        {loading ? (
          <div style={{ color: '#000', padding: '2rem', fontSize: '0.9rem' }}>Cargando página en alta resolución...</div>
        ) : (
          <img src={highResUrl} alt={`Página física ${pageNum}`} style={{ maxHeight: '60vh', maxWidth: '100%', objectFit: 'contain' }} />
        )}
      </div>

      {/* Barra de Confirmación e Inserción de Número Impreso */}
      <div style={{
        backgroundColor: 'var(--bg-surface-2)',
        border: '1.5px solid var(--accent)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.5rem',
        maxWidth: '520px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem'
      }}>
        <div style={{ fontSize: '0.88rem', color: 'var(--accent)', fontWeight: 700, textAlign: 'center' }}>
          ✓ Seleccionaste la Página física N° {pageNum} del documento
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 700 }}>
            Veo el número:
          </span>
          <input
            type="number"
            min={1}
            placeholder="ej. 1 o 8"
            value={bookNumberInput}
            onChange={(e) => setBookNumberInput(e.target.value)}
            className="input font-mono"
            style={{ width: '110px', fontSize: '1rem', textAlign: 'center', fontWeight: 800, color: 'var(--accent)' }}
            autoFocus
          />
        </div>

        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button
            onClick={handleConfirm}
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Check size={16} />
            <span>Confirmar Número</span>
          </button>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

function ThumbnailCard({ pdfDoc, pageNum, isSelected, onSelect, mode, rotation = 0, onRotate, splitOffset = 50, onAdjustSplit, onOpenLightbox }) {
  const [thumbUrl, setThumbUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef(null);

  useEffect(() => {
    let isCancelled = false;
    let observer = null;

    const renderThumbnail = async () => {
      if (!pdfDoc) return;
      try {
        setLoading(true);
        const page = await pdfDoc.getPage(pageNum);
        if (isCancelled) return;

        const rawViewport = page.getViewport({ scale: 0.25 });
        const isFotocopia = mode === 'fotocopia';
        const isVertical = rawViewport.height > rawViewport.width;

        let autoAngle = (isFotocopia && isVertical) ? 90 : 0;
        const totalAngle = (autoAngle + rotation) % 360;

        const viewport = page.getViewport({ scale: 0.25, rotation: totalAngle });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;

        if (!isCancelled) {
          setThumbUrl(canvas.toDataURL('image/jpeg', 0.82));
          setLoading(false);
        }
        canvas.width = 0; canvas.height = 0;
        page.cleanup();
      } catch (err) {
        console.error(`Error al renderizar thumbnail de pág ${pageNum}:`, err);
      }
    };

    if ('IntersectionObserver' in window && cardRef.current) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            renderThumbnail();
            if (observer && cardRef.current) observer.unobserve(cardRef.current);
          }
        });
      }, { rootMargin: '100px' });
      observer.observe(cardRef.current);
    } else {
      renderThumbnail();
    }

    return () => {
      isCancelled = true;
      if (observer && cardRef.current) observer.unobserve(cardRef.current);
    };
  }, [pdfDoc, pageNum, mode, rotation]);

  return (
    <div
      ref={cardRef}
      style={{
        flexShrink: 0,
        width: '125px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0.4rem',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: isSelected ? 'rgba(186, 253, 193, 0.12)' : 'var(--bg-surface-2)',
        border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border-subtle)'}`,
        transition: 'all 0.15s ease',
        boxShadow: isSelected ? '0 0 10px rgba(186, 253, 193, 0.3)' : 'none'
      }}
    >
      <div
        onClick={() => onOpenLightbox(pageNum)}
        style={{
          width: '112px',
          height: '138px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '3px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          cursor: 'pointer',
          border: '1px solid var(--border-subtle)'
        }}
      >
        {loading ? (
          <span style={{ fontSize: '0.65rem', color: 'var(--text-disabled)' }}>Cargando...</span>
        ) : (
          <img src={thumbUrl} alt={`Página ${pageNum}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        )}

        {/* Overlay Botón Lupa Ampliar */}
        <div style={{
          position: 'absolute',
          bottom: '4px', right: '4px',
          backgroundColor: 'rgba(0,0,0,0.65)',
          borderRadius: '3px', padding: '2px 4px',
          display: 'flex', alignItems: 'center', gap: '2px',
          color: '#fff', fontSize: '0.6rem'
        }}>
          <ZoomIn size={10} /> Ampliar
        </div>

        {/* Línea de corte central (solo en modo Fotocopia) */}
        {mode === 'fotocopia' && !loading && (
          <div style={{
            position: 'absolute',
            left: `${splitOffset}%`, top: 0, bottom: 0, width: 0,
            borderLeft: '1.5px dashed #F87171', pointerEvents: 'none', zIndex: 1
          }}>
            <span style={{ position: 'absolute', top: 0, left: '-6px', fontSize: '0.55rem', color: '#F87171', backgroundColor: 'rgba(0,0,0,0.8)', padding: '1px' }}>✂</span>
          </div>
        )}

        {isSelected && (
          <div style={{ position: 'absolute', top: '3px', right: '3px', backgroundColor: 'var(--accent)', borderRadius: '50%', padding: '2px', zIndex: 2 }}>
            <CheckCircle2 size={12} color="#000" />
          </div>
        )}
      </div>

      <div style={{ marginTop: '0.3rem', width: '100%', textAlign: 'center' }}>

        {/* Botón único Corregir Giro (180°) y Ajuste Fino de corte para Fotocopia */}
        {mode === 'fotocopia' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.2rem' }}>
            <button
              onClick={(e) => { e.stopPropagation(); onRotate(pageNum, 180); }}
              title="Corregir giro si la hoja quedó pata para arriba"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '3px',
                padding: '2px 4px',
                fontSize: '0.62rem',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                fontWeight: 600
              }}
            >
              <RefreshCw size={9} color="var(--accent)" /> Corregir Giro
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', backgroundColor: 'var(--bg-surface)', padding: '2px 4px', borderRadius: '3px', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={(e) => { e.stopPropagation(); onAdjustSplit(pageNum, Math.max(35, splitOffset - 2)); }}
                title="Mover línea de corte a la izquierda (-2%)"
                style={{ background: 'none', border: 'none', color: '#F87171', fontWeight: 800, cursor: 'pointer', fontSize: '0.7rem', padding: '0 2px' }}
              >
                ◄
              </button>
              <span className="font-mono" style={{ fontSize: '0.62rem', color: '#F87171', fontWeight: 700 }}>
                ✂ {splitOffset}%
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onAdjustSplit(pageNum, Math.min(65, splitOffset + 2)); }}
                title="Mover línea de corte a la derecha (+2%)"
                style={{ background: 'none', border: 'none', color: '#F87171', fontWeight: 800, cursor: 'pointer', fontSize: '0.7rem', padding: '0 2px' }}
              >
                ►
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PdfPreviewStrip({ file, selectedPdfPage, onSelectPage, mode, pageRotations = {}, onRotatePage, pageSplitOffsets = {}, onAdjustSplitPage, refBookPage = '' }) {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [error, setError] = useState('');
  const [lightboxPageNum, setLightboxPageNum] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!file) {
      setPdfDoc(null);
      setNumPages(0);
      return;
    }

    let isSubscribed = true;

    const loadPdf = async () => {
      try {
        setLoadingDoc(true);
        setError('');
        await inyectarPDFjs();

        const arrayBuffer = await file.arrayBuffer();
        const doc = await window.pdfjsLib.getDocument({
          data: arrayBuffer,
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
          cMapPacked: true,
        }).promise;

        if (isSubscribed) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setLoadingDoc(false);
        }
      } catch (err) {
        console.error('Error al cargar documento PDF para vista previa:', err);
        if (isSubscribed) {
          setError('No se pudo cargar la vista previa de las páginas del PDF.');
          setLoadingDoc(false);
        }
      }
    };

    loadPdf();

    return () => {
      isSubscribed = false;
    };
  }, [file]);

  const scrollLeft = () => {
    if (containerRef.current) containerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (containerRef.current) containerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  if (!file) return null;

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface-2)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-subtle)',
      padding: '1rem',
      marginBottom: '1.5rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Eye size={16} color="var(--accent)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Hacé clic en la página donde veas un número de página del documento ({numPages} páginas)
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-disabled)' }}>
          Hacé clic en cualquier página para ampliarla en pantalla completa e indicar el número impreso.
        </span>
      </div>

      {loadingDoc ? (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '1.5rem', textAlign: 'center' }}>
          Cargando visor interactivo de páginas...
        </div>
      ) : error ? (
        <div style={{ fontSize: '0.78rem', color: '#F87171', padding: '0.5rem' }}>{error}</div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Botón Scroll Izquierda */}
          <button
            onClick={scrollLeft}
            style={{
              position: 'absolute', left: 0, top: '50%',
              transform: 'translateY(-50%)', zIndex: 2,
              backgroundColor: 'rgba(0,0,0,0.7)', border: '1px solid var(--border-subtle)',
              borderRadius: '50%', width: '28px', height: '28px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-primary)', cursor: 'pointer'
            }}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Galería Horizontal Scrollable */}
          <div
            ref={containerRef}
            style={{
              display: 'flex', gap: '0.7rem', overflowX: 'auto',
              padding: '0.5rem 2rem', scrollBehavior: 'smooth', scrollbarWidth: 'thin'
            }}
          >
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
              <ThumbnailCard
                key={pageNum}
                pdfDoc={pdfDoc}
                pageNum={pageNum}
                isSelected={selectedPdfPage === pageNum}
                onSelect={onSelectPage}
                mode={mode}
                rotation={pageRotations[pageNum] || 0}
                onRotate={onRotatePage}
                splitOffset={pageSplitOffsets[pageNum] !== undefined ? pageSplitOffsets[pageNum] : 50}
                onAdjustSplit={onAdjustSplitPage}
                onOpenLightbox={(p) => setLightboxPageNum(p)}
              />
            ))}
          </div>

          {/* Botón Scroll Derecha */}
          <button
            onClick={scrollRight}
            style={{
              position: 'absolute', right: 0, top: '50%',
              transform: 'translateY(-50%)', zIndex: 2,
              backgroundColor: 'rgba(0,0,0,0.7)', border: '1px solid var(--border-subtle)',
              borderRadius: '50%', width: '28px', height: '28px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-primary)', cursor: 'pointer'
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* MODAL LIGHTBOX PANTALLA COMPLETA */}
      {lightboxPageNum && (
        <LightboxModal
          pdfDoc={pdfDoc}
          pageNum={lightboxPageNum}
          mode={mode}
          rotation={pageRotations[lightboxPageNum] || 0}
          initialBookPage={selectedPdfPage === lightboxPageNum ? refBookPage : ''}
          onClose={() => setLightboxPageNum(null)}
          onSelect={(pNum, bNum) => onSelectPage(pNum, bNum)}
        />
      )}
    </div>
  );
}
