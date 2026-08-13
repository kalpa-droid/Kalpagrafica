import React, { useState, useRef, useEffect } from 'react';
import { X, Wand2, Eraser, Loader2, RotateCcw, Check, Info, AlertTriangle } from 'lucide-react';
import { contentAwareFill } from '../utils/inpaint';
import { removeImageBackground } from '../utils/bgRemoval';

const MAX_WORK_DIM = 1000;

export default function ImageRetouchModal({ src, onApply, onClose }) {
  const [mode, setMode] = useState('magic-eraser');

  // ---------- Borrador Mágico ----------
  const [brushSize, setBrushSize] = useState(24);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasMask, setHasMask] = useState(false);

  const baseCanvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const offscreenMaskRef = useRef(null);

  useEffect(() => {
    if (!src) return;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scale = Math.min(1, MAX_WORK_DIM / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));

      const offCanvas = document.createElement('canvas');
      offCanvas.width = w;
      offCanvas.height = h;
      offscreenMaskRef.current = offCanvas;

      for (const ref of [baseCanvasRef, maskCanvasRef, workCanvasRef]) {
        if (!ref.current) continue;
        ref.current.width = w;
        ref.current.height = h;
      }
      workCanvasRef.current.getContext('2d').drawImage(img, 0, 0, w, h);
      baseCanvasRef.current.getContext('2d').drawImage(img, 0, 0, w, h);
      maskCanvasRef.current.getContext('2d').clearRect(0, 0, w, h);
    };
    img.src = src;
  }, [src]);

  const paintAt = (x, y) => {
    if (!offscreenMaskRef.current || !maskCanvasRef.current) return;
    const offCtx = offscreenMaskRef.current.getContext('2d');
    offCtx.fillStyle = '#FF0000';
    offCtx.beginPath();
    offCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    offCtx.fill();

    const displayCtx = maskCanvasRef.current.getContext('2d');
    displayCtx.clearRect(0, 0, displayCtx.canvas.width, displayCtx.canvas.height);
    displayCtx.globalAlpha = 0.45;
    displayCtx.drawImage(offscreenMaskRef.current, 0, 0);
    displayCtx.globalAlpha = 1.0;
    setHasMask(true);
  };

  const getCanvasPos = (e) => {
    const rect = maskCanvasRef.current.getBoundingClientRect();
    const scaleX = maskCanvasRef.current.width / rect.width;
    const scaleY = maskCanvasRef.current.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const onPointerDown = (e) => { e.preventDefault(); setIsDrawing(true); const { x, y } = getCanvasPos(e); paintAt(x, y); };
  const onPointerMove = (e) => { if (!isDrawing) return; e.preventDefault(); const { x, y } = getCanvasPos(e); paintAt(x, y); };
  const onPointerUp = () => setIsDrawing(false);

  const clearMask = () => {
    if (offscreenMaskRef.current) {
      offscreenMaskRef.current.getContext('2d').clearRect(0, 0, offscreenMaskRef.current.width, offscreenMaskRef.current.height);
    }
    maskCanvasRef.current?.getContext('2d').clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
    setHasMask(false);
  };

  const applyMagicEraser = async () => {
    if (!hasMask || !offscreenMaskRef.current) return;
    setIsProcessing(true);
    setProgress(0);
    const w = workCanvasRef.current.width;
    const h = workCanvasRef.current.height;
    const workCtx = workCanvasRef.current.getContext('2d');
    const imageData = workCtx.getImageData(0, 0, w, h);

    const maskCtx = offscreenMaskRef.current.getContext('2d');
    const maskPixels = maskCtx.getImageData(0, 0, w, h).data;
    const mask = new Uint8Array(w * h);
    for (let i = 0; i < mask.length; i++) mask[i] = maskPixels[i * 4] > 50 ? 1 : 0;

    const result = await contentAwareFill(imageData, mask, {
      patchRadius: 4,
      iterations: 5,
      onProgress: (p) => setProgress(p)
    });

    workCtx.putImageData(result, 0, 0);
    baseCanvasRef.current.getContext('2d').putImageData(result, 0, 0);
    clearMask();
    setIsProcessing(false);
    setProgress(0);
  };

  const confirmMagicEraser = () => {
    if (!workCanvasRef.current) return;
    onApply(workCanvasRef.current.toDataURL('image/png'));
  };

  // ---------- Borrador de Fondo ----------
  const [bgResultUrl, setBgResultUrl] = useState(null);
  const [bgProcessing, setBgProcessing] = useState(false);
  const [bgProgressLabel, setBgProgressLabel] = useState('');
  const [bgError, setBgError] = useState(null);

  const runBackgroundRemoval = async () => {
    setBgProcessing(true);
    setBgError(null);
    setBgProgressLabel('Iniciando IA de segmentación…');
    try {
      const blob = await removeImageBackground(src, {
        maxDim: 1200,
        onProgress: ({ key, current, total }) => setBgProgressLabel(`${key} (${current}/${total})`)
      });
      setBgResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      setBgError('No se pudo procesar la imagen. Verifica que el archivo sea una imagen PNG/JPG válida.');
    } finally {
      setBgProcessing(false);
      setBgProgressLabel('');
    }
  };

  const confirmBackgroundRemoval = async () => {
    if (!bgResultUrl) return;
    const blob = await fetch(bgResultUrl).then((r) => r.blob());
    const reader = new FileReader();
    reader.onload = () => onApply(reader.result);
    reader.readAsDataURL(blob);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(5,12,7,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)',
        maxWidth: '820px', width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '1.6rem', boxShadow: 'var(--shadow-card)'
      }}>
        {/* Header Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Wand2 size={18} color="var(--accent)" /> Retoque de Imagen con IA
            </h3>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              Herramienta nativa de preimpresión: eliminación de elementos y fondo en formato PNG HD.
            </span>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '0.4rem' }} title="Cerrar"><X size={18} /></button>
        </div>

        {/* Pestañas de Modo (Borrador Mágico / Quitar Fondo) */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
          <button
            onClick={() => setMode('magic-eraser')}
            className="font-caps btn-sm"
            style={{
              padding: '0.55rem 1.1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              border: mode === 'magic-eraser' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
              backgroundColor: mode === 'magic-eraser' ? 'var(--accent-muted)' : 'var(--bg-surface-2)',
              color: mode === 'magic-eraser' ? 'var(--accent)' : 'var(--text-secondary)'
            }}
          >
            <Wand2 size={14} style={{ marginRight: '0.4rem' }} />1. Borrador Mágico
          </button>
          <button
            onClick={() => setMode('bg-eraser')}
            className="font-caps btn-sm"
            style={{
              padding: '0.55rem 1.1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              border: mode === 'bg-eraser' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
              backgroundColor: mode === 'bg-eraser' ? 'var(--accent-muted)' : 'var(--bg-surface-2)',
              color: mode === 'bg-eraser' ? 'var(--accent)' : 'var(--text-secondary)'
            }}
          >
            <Eraser size={14} style={{ marginRight: '0.4rem' }} />2. Quitar Fondo (IA)
          </button>
        </div>

        {/* MODO 1: Borrador Mágico */}
        {mode === 'magic-eraser' && (
          <>
            {/* Especificación de Uso */}
            <div style={{ backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.8rem', marginBottom: '1rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
              <Info size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                <strong>¿Cómo funciona el Borrador Mágico?</strong> Pinta con el pincel rojo sobre cualquier objeto, texto, cable o imperfección que desees borrar. El algoritmo reconstruirá el fondo circundante automáticamente.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ flex: '1 1 180px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Tamaño de Pincel ({brushSize}px)</label>
                <input type="range" min={8} max={80} value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent)' }} />
              </div>
              <button className="btn btn-ghost btn-sm" onClick={clearMask} disabled={!hasMask || isProcessing} style={{ gap: '0.3rem' }}>
                <RotateCcw size={14} /> Limpiar Selección
              </button>
            </div>

            <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', backgroundColor: '#111114', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', lineHeight: 0 }}>
              <canvas ref={baseCanvasRef} style={{ maxWidth: '100%', display: 'block', borderRadius: 'var(--radius-md)' }} />
              <canvas
                ref={maskCanvasRef}
                onMouseDown={onPointerDown} onMouseMove={onPointerMove} onMouseUp={onPointerUp} onMouseLeave={onPointerUp}
                onTouchStart={onPointerDown} onTouchMove={onPointerMove} onTouchEnd={onPointerUp}
                style={{ position: 'absolute', top: 0, left: 0, maxWidth: '100%', cursor: isProcessing ? 'wait' : 'crosshair', touchAction: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.7rem', marginTop: '1.2rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={applyMagicEraser} disabled={!hasMask || isProcessing} style={{ gap: '0.5rem' }}>
                {isProcessing ? <Loader2 size={16} className="spin" /> : <Wand2 size={16} />}
                <span>{isProcessing ? `Reconstruyendo… ${Math.round(progress * 100)}%` : 'Aplicar Borrador Mágico'}</span>
              </button>
              <button className="btn btn-primary" onClick={confirmMagicEraser} disabled={isProcessing} style={{ gap: '0.5rem' }}>
                <Check size={16} /><span>Usar esta imagen en el diseño</span>
              </button>
            </div>
          </>
        )}

        {/* MODO 2: Borrador de Fondo (IA) */}
        {mode === 'bg-eraser' && (
          <>
            {/* Especificación de Tipo de Imagen Recomendada */}
            <div style={{ backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.8.rem', marginBottom: '1rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
              <Info size={18} color="#C9A94D" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                <strong>Especificaciones de Imagen para Remoción de Fondo:</strong> Funciona mejor en fotos de producto, logos, objetos o personas con un <u>sujeto principal definido en primer plano</u>. Para fotos muy saturadas o con múltiples objetos complejos, se puede rematar el borde usando el Borrador Mágico.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Original</label>
                <img src={src} alt="Original" style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', objectFit: 'contain' }} />
              </div>

              <div style={{
                textAlign: 'center',
                backgroundImage: 'linear-gradient(45deg, #1c1c22 25%, transparent 25%), linear-gradient(-45deg, #1c1c22 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1c1c22 75%), linear-gradient(-45deg, transparent 75%, #1c1c22 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                backgroundColor: '#111114',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                padding: '0.5rem'
              }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--accent)', display: 'block', marginBottom: '0.4rem' }}>Resultado PNG (Sin Fondo)</label>
                {bgResultUrl ? (
                  <img src={bgResultUrl} alt="Sin fondo" style={{ maxWidth: '100%', maxHeight: '260px', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }} />
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-disabled)', padding: '3rem 0' }}>
                    {bgProcessing ? (bgProgressLabel || 'Procesando modelo IA…') : 'Presiona "Quitar Fondo" para procesar.'}
                  </div>
                )}
              </div>
            </div>

            {bgError && <div style={{ fontSize: '0.8rem', color: '#F87171', marginBottom: '1rem' }}>{bgError}</div>}

            <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={runBackgroundRemoval} disabled={bgProcessing} style={{ gap: '0.5rem' }}>
                {bgProcessing ? <Loader2 size={16} className="spin" /> : <Eraser size={16} />}
                <span>{bgProcessing ? 'Procesando...' : 'Quitar Fondo (IA)'}</span>
              </button>
              <button className="btn btn-primary" onClick={confirmBackgroundRemoval} disabled={!bgResultUrl} style={{ gap: '0.5rem' }}>
                <Check size={16} /><span>Usar esta imagen en el diseño</span>
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        .spin { animation: kalpa-spin 1s linear infinite; }
        @keyframes kalpa-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
