import React, { useEffect, useState, useRef } from 'react';
import { Eye, ChevronLeft, ChevronRight, CheckCircle2, RefreshCw, ZoomIn, X, Check } from 'lucide-react';
import { inyectarPDFjs } from './pdfToLibro';

function LightboxModal({ pdfDoc, pageNum, numPages, mode, rotation = 0, onRotate, splitOffset = 50, onAdjustSplit, onSelect, onClose, onPrevPage, onNextPage, initialBookPage = '' }) {
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
      padding: '1rem',
      backdropFilter: 'blur(6px)'
    }}>
      {/* Botón cerrar */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: '16px', right: '20px',
          backgroundColor: 'rgba(255,255,255,0.15)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '50%', width: '36px', height: '36px',
          color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <X size={20} />
      </button>

      {/* Título instructivo */}
      <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.8rem', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span>Si no ves un número pasa a la siguiente</span>
        <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '10px', color: 'var(--accent)' }}>
          Pág {pageNum} de {numPages}
        </span>
      </div>

      {/* Contenedor con Imagen y Flechas de Navegación laterales */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', maxWidth: '95vw', marginBottom: '0.8rem' }}>
        <button
          onClick={onPrevPage}
          disabled={pageNum <= 1}
          style={{
            backgroundColor: pageNum <= 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.2)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            color: pageNum <= 1 ? 'rgba(255,255,255,0.2)' : '#fff',
            padding: '0.6rem 0.8rem',
            cursor: pageNum <= 1 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 600
          }}
        >
          <ChevronLeft size={18} /> Anterior
        </button>

        <div style={{
          maxHeight: '58vh',
          maxWidth: '75vw',
          overflow: 'auto',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
          position: 'relative'
        }}>
          {loading ? (
            <div style={{ color: '#000', padding: '2rem', fontSize: '0.9rem' }}>Cargando página...</div>
          ) : (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src={highResUrl} alt={`Página ${pageNum}`} style={{ maxHeight: '53vh', maxWidth: '100%', objectFit: 'contain' }} />

              {/* Línea de corte central en zoom si es Fotocopia */}
              {mode === 'fotocopia' && (
                <div style={{
                  position: 'absolute',
                  left: `${splitOffset}%`, top: 0, bottom: 0, width: 0,
                  borderLeft: '2px dashed #F87171', pointerEvents: 'none', zIndex: 10
                }}>
                  <span style={{ position: 'absolute', top: '10px', left: '-12px', fontSize: '0.8rem', color: '#fff', backgroundColor: '#F87171', padding: '2px 6px', borderRadius: '3px', fontWeight: 800 }}>✂ {splitOffset}%</span>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onNextPage}
          disabled={pageNum >= numPages}
          style={{
            backgroundColor: pageNum >= numPages ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.2)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            color: pageNum >= numPages ? 'rgba(255,255,255,0.2)' : '#fff',
            padding: '0.6rem 0.8rem',
            cursor: pageNum >= numPages ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 600
          }}
        >
          Siguiente <ChevronRight size={18} />
        </button>
      </div>

      {/* Barra de Ajustes de Fotocopia (Giro y Corte) si es modo Fotocopia */}
      {mode === 'fotocopia' && (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.8rem', backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-sm)' }}>
          <button
            onClick={() => onRotate && onRotate(pageNum, 180)}
            style={{
              backgroundColor: 'var(--accent)', color: '#000', border: 'none', borderRadius: '4px',
              padding: '0.4rem 0.8rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem'
            }}
          >
            <RefreshCw size={12} /> Corregir Giro (180°)
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff', fontSize: '0.78rem' }}>
            <span>Línea de corte:</span>
            <button onClick={() => onAdjustSplit && onAdjustSplit(pageNum, Math.max(35, splitOffset - 2))} style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '2px 6px', borderRadius: '3px', cursor: 'pointer', fontWeight: 800 }}>◄</button>
            <span className="font-mono" style={{ color: '#F87171', fontWeight: 700 }}>{splitOffset}%</span>
            <button onClick={() => onAdjustSplit && onAdjustSplit(pageNum, Math.min(65, splitOffset + 2))} style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '2px 6px', borderRadius: '3px', cursor: 'pointer', fontWeight: 800 }}>►</button>
          </div>
        </div>
      )}

      {/* Barra de Confirmación "¡Número encontrado!" */}
      <div style={{
        backgroundColor: 'var(--bg-surface-2)',
        border: '1.5px solid var(--accent)',
        borderRadius: 'var(--radius-md)',
        padding: '0.8rem 1.2rem',
        maxWidth: '480px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
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
            style={{ width: '90px', fontSize: '1rem', textAlign: 'center', fontWeight: 800, color: 'var(--accent)' }}
            autoFocus
          />
        </div>

        <button
          onClick={handleConfirm}
          className="btn btn-primary"
          style={{ padding: '0.55rem 1.2rem', fontSize: '0.88rem', fontWeight: 700 }}
        >
          <Check size={16} />
          <span>¡Número encontrado!</span>
        </button>
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
          numPages={numPages}
          mode={mode}
          rotation={pageRotations[lightboxPageNum] || 0}
          onRotate={onRotatePage}
          splitOffset={pageSplitOffsets[lightboxPageNum] !== undefined ? pageSplitOffsets[lightboxPageNum] : 50}
          onAdjustSplit={onAdjustSplitPage}
          initialBookPage={selectedPdfPage === lightboxPageNum ? refBookPage : ''}
          onClose={() => setLightboxPageNum(null)}
          onPrevPage={() => setLightboxPageNum(prev => Math.max(1, prev - 1))}
          onNextPage={() => setLightboxPageNum(prev => Math.min(numPages, prev + 1))}
          onSelect={(pNum, bNum) => onSelectPage(pNum, bNum)}
        />
      )}
    </div>
  );
}
