import React, { useEffect, useState, useRef } from 'react';
import { Eye, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { inyectarPDFjs } from './pdfToLibro';

function ThumbnailCard({ pdfDoc, pageNum, isSelected, onSelect }) {
  const [thumbUrl, setThumbUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef(null);

  useEffect(() => {
    let isCancelled = false;
    let observer = null;

    const renderThumbnail = async () => {
      if (!pdfDoc) return;
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale: 0.25 }); // Escala baja para thumbnail ultra liviano
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;

        if (!isCancelled) {
          setThumbUrl(canvas.toDataURL('image/jpeg', 0.8));
          setLoading(false);
        }

        // Limpieza de memoria RAM y VRAM
        canvas.width = 0;
        canvas.height = 0;
        page.cleanup();
      } catch (err) {
        console.error(`Error al renderizar thumbnail de pág ${pageNum}:`, err);
      }
    };

    // Usar IntersectionObserver para lazy loading (no renderizar 300 páginas de golpe)
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
  }, [pdfDoc, pageNum]);

  return (
    <div
      ref={cardRef}
      onClick={() => onSelect(pageNum)}
      style={{
        flexShrink: 0,
        width: '110px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        padding: '0.4rem',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: isSelected ? 'rgba(186, 253, 193, 0.12)' : 'var(--bg-surface-2)',
        border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border-subtle)'}`,
        transition: 'all 0.15s ease',
        boxShadow: isSelected ? '0 0 10px rgba(186, 253, 193, 0.3)' : 'none'
      }}
    >
      <div style={{
        width: '98px',
        height: '130px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '3px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid var(--border-subtle)'
      }}>
        {loading ? (
          <span style={{ fontSize: '0.65rem', color: 'var(--text-disabled)' }}>Cargando...</span>
        ) : (
          <img src={thumbUrl} alt={`Página física ${pageNum}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        )}
        {isSelected && (
          <div style={{ position: 'absolute', top: '3px', right: '3px', backgroundColor: 'var(--accent)', borderRadius: '50%', padding: '2px' }}>
            <CheckCircle2 size={12} color="#000" />
          </div>
        )}
      </div>

      <div style={{ marginTop: '0.4rem', textAlign: 'center' }}>
        <span className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 800, color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>
          Pág {pageNum}
        </span>
      </div>
    </div>
  );
}

export default function PdfPreviewStrip({ file, selectedPdfPage, onSelectPage, mode }) {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [error, setError] = useState('');
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
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Visor de Páginas Físicas ({numPages} páginas)
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-disabled)' }}>
          Hacé clic en cualquier página para seleccionarla en el diagnóstico
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
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: 'rgba(0,0,0,0.7)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Galería Horizontal Scrollable */}
          <div
            ref={containerRef}
            style={{
              display: 'flex',
              gap: '0.7rem',
              overflowX: 'auto',
              padding: '0.5rem 2rem',
              scrollBehavior: 'smooth',
              scrollbarWidth: 'thin'
            }}
          >
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
              <ThumbnailCard
                key={pageNum}
                pdfDoc={pdfDoc}
                pageNum={pageNum}
                isSelected={selectedPdfPage === pageNum}
                onSelect={onSelectPage}
              />
            ))}
          </div>

          {/* Botón Scroll Derecha */}
          <button
            onClick={scrollRight}
            style={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: 'rgba(0,0,0,0.7)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
