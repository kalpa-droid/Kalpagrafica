import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Check, X, Crop, Move } from 'lucide-react';

export default function A5ImageCropperModal({ isOpen, imageSrc, onCropComplete, onClose, title = 'Recortar Imagen a Proporción A5', targetSize = { width: 1748, height: 2480 }, sizeLabel = 'A5' }) {
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, width: 200, height: 283 }); // 1:1.4142 ratio
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // When modal opens or imageSrc changes, initialize crop box centered
  useEffect(() => {
    if (!isOpen || !imageSrc) return;
    setImgLoaded(false);
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      setImgLoaded(true);

      // Default crop box dimensions (A5 ratio 1 : 1.4142)
      const a5Ratio = 1.4142;
      let w = img.naturalWidth * 0.8;
      let h = w * a5Ratio;
      if (h > img.naturalHeight * 0.9) {
        h = img.naturalHeight * 0.9;
        w = h / a5Ratio;
      }

      setCropBox({
        x: (img.naturalWidth - w) / 2,
        y: (img.naturalHeight - h) / 2,
        width: w,
        height: h
      });
      setScale(1);
    };
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc) return null;

  const a5Ratio = 1.4142;

  // Handle Dragging Crop Box
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    setDragStart({ x: clientX - cropBox.x, y: clientY - cropBox.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    let newX = clientX - dragStart.x;
    let newY = clientY - dragStart.y;

    // Clamp within image bounds
    newX = Math.max(0, Math.min(newX, naturalSize.width - cropBox.width));
    newY = Math.max(0, Math.min(newY, naturalSize.height - cropBox.height));

    setCropBox(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Adjust Crop Box Scale while preserving A5 Aspect Ratio
  const handleScaleChange = (newScale) => {
    const clampedScale = Math.max(0.2, Math.min(newScale, 1));
    setScale(clampedScale);

    let w = naturalSize.width * 0.85 * clampedScale;
    let h = w * a5Ratio;

    if (h > naturalSize.height * 0.95) {
      h = naturalSize.height * 0.95;
      w = h / a5Ratio;
    }

    // Keep centered relative to current center
    const centerX = cropBox.x + cropBox.width / 2;
    const centerY = cropBox.y + cropBox.height / 2;

    let newX = centerX - w / 2;
    let newY = centerY - h / 2;

    newX = Math.max(0, Math.min(newX, naturalSize.width - w));
    newY = Math.max(0, Math.min(newY, naturalSize.height - h));

    setCropBox({ x: newX, y: newY, width: w, height: h });
  };

  // Exporta el recorte en alta resolución al tamaño de página final del libro (A5 o A4 según el papel elegido)
  const handleConfirmCrop = () => {
    const canvas = document.createElement('canvas');
    const targetW = targetSize.width;
    const targetH = targetSize.height;
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');

    const img = imgRef.current;
    if (!img) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);

    ctx.drawImage(
      img,
      cropBox.x, cropBox.y, cropBox.width, cropBox.height,
      0, 0, targetW, targetH
    );

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    canvas.width = 0; canvas.height = 0;

    onCropComplete(croppedDataUrl);
    onClose();
  };

  // Compute display scaling inside the modal viewport
  const maxDisplayDim = isFullscreen ? Math.min(window.innerWidth - 80, window.innerHeight - 180) : 480;
  const displayScale = naturalSize.width > 0 ? Math.min(maxDisplayDim / naturalSize.width, maxDisplayDim / naturalSize.height) : 1;
  const displayW = naturalSize.width * displayScale;
  const displayH = naturalSize.height * displayScale;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(10, 10, 14, 0.92)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isFullscreen ? '1rem' : '1.5rem'
      }}
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
    >
      <div style={{
        width: isFullscreen ? '98vw' : '100%',
        maxWidth: isFullscreen ? '1200px' : '650px',
        maxHeight: isFullscreen ? '96vh' : '90vh',
        backgroundColor: 'var(--bg-surface-2)',
        border: '1.5px solid var(--border-strong)',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '0.9rem 1.2rem',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: 700, fontSize: '0.95rem' }}>
            <Crop size={18} />
            <span>{title} ({sizeLabel} Vertical)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="btn btn-sm"
              style={{ backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
              title={isFullscreen ? 'Restaurar tamaño' : 'Ver en Pantalla Completa'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              <span style={{ fontSize: '0.78rem' }}>{isFullscreen ? 'Pantalla Normal' : 'Pantalla Completa'}</span>
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.2rem' }}>
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Workspace Body */}
        <div style={{
          flex: 1,
          padding: '1.2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          backgroundColor: '#0d0d10'
        }}>
          <div
            ref={containerRef}
            style={{
              position: 'relative',
              width: `${displayW}px`,
              height: `${displayH}px`,
              userSelect: 'none',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Source"
              style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
            />

            {/* Dark Mask Overlay */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)', pointerEvents: 'none' }} />

            {/* Interactive Crop Box Overlay */}
            {imgLoaded && (
              <div
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                style={{
                  position: 'absolute',
                  left: `${cropBox.x * displayScale}px`,
                  top: `${cropBox.y * displayScale}px`,
                  width: `${cropBox.width * displayScale}px`,
                  height: `${cropBox.height * displayScale}px`,
                  border: '2px dashed var(--accent)',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65), 0 0 15px rgba(186,253,193,0.4)',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div style={{
                  padding: '4px 8px',
                  backgroundColor: '#0a0a0c',
                  color: 'var(--accent)',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  borderRadius: '4px',
                  border: '1px solid var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  pointerEvents: 'none',
                  opacity: 0.9
                }}>
                  <Move size={12} /> Arrastrar Recorte {sizeLabel}
                </div>
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div style={{ marginTop: '1rem', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <span>Tamaño del Recorte:</span>
              <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{Math.round(cropBox.width)} x {Math.round(cropBox.height)} px</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <ZoomOut size={16} style={{ color: 'var(--text-secondary)' }} />
              <input
                type="range"
                min="0.2"
                max="1"
                step="0.02"
                value={scale}
                onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
              <ZoomIn size={16} style={{ color: 'var(--text-secondary)' }} />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '0.9rem 1.2rem',
          backgroundColor: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.8rem'
        }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            <X size={16} /> Cancelar
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleConfirmCrop}
          >
            <Check size={16} /> Confirmar Recorte {sizeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
