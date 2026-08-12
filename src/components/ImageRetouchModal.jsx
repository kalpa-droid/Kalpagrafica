import React, { useState, useRef, useEffect } from 'react';
import { X, Wand2, Eraser, Loader2, RotateCcw, Check } from 'lucide-react';
import { contentAwareFill } from '../utils/inpaint';
import { removeImageBackground } from '../utils/bgRemoval';

const MAX_WORK_DIM = 900;

/**
 * Modal de retoque que opera sobre una imagen (src / dataURL / File) y devuelve
 * el resultado como dataURL vía onApply. Pensado para incrustarse en cualquier
 * flujo de edición (Editor de Diseño, Assets, etc.) sin duplicar lógica.
 */
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
  const workCanvasRef = useRef(null);

  useEffect(() => {
    if (!src) return;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scale = Math.min(1, MAX_WORK_DIM / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
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
    const ctx = maskCanvasRef.current.getContext('2d');
    ctx.fillStyle = 'rgba(248, 82, 82, 0.55)';
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
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
    maskCanvasRef.current?.getContext('2d').clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
    setHasMask(false);
  };

  const applyMagicEraser = async () => {
    if (!hasMask) return;
    setIsProcessing(true);
    setProgress(0);
    const w = workCanvasRef.current.width;
    const h = workCanvasRef.current.height;
    const workCtx = workCanvasRef.current.getContext('2d');
    const imageData = workCtx.getImageData(0, 0, w, h);

    const maskCtx = maskCanvasRef.current.getContext('2d');
    const maskPixels = maskCtx.getImageData(0, 0, w, h).data;
    const mask = new Uint8Array(w * h);
    for (let i = 0; i < mask.length; i++) mask[i] = maskPixels[i * 4 + 3] > 20 ? 1 : 0;

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
    setBgProgressLabel('Cargando modelo de segmentación…');
    try {
      const blob = await removeImageBackground(src, {
        onProgress: ({ key, current, total }) => setBgProgressLabel(`${key} (${current}/${total})`)
      });
      setBgResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      setBgError('No se pudo procesar la imagen. Probá con un archivo más liviano o revisá tu conexión (el modelo IA se descarga la primera vez).');
    } finally {
      setBgProcessing(false);
      setBgProgressLabel('');
    }
  };

  const confirmBackgroundRemoval = async () => {
    if (!bgResultUrl) return;
    // Convertimos el blob URL a dataURL para que quede embebido en el elemento del diseño
    const blob = await fetch(bgResultUrl).then((r) => r.blob());
    const reader = new FileReader();
    reader.onload = () => onApply(reader.result);
    reader.readAsDataURL(blob);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(8,8,10,0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)',
        maxWidth: '780px', width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '1.6rem', boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wand2 size={18} color="var(--accent)" /> Retocar Imagen
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '0.4rem' }}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
          <button
            onClick={() => setMode('magic-eraser')}
            className="font-caps btn-sm"
            style={{
              padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
              border: mode === 'magic-eraser' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
              backgroundColor: mode === 'magic-eraser' ? 'var(--accent-muted)' : 'var(--bg-surface-2)',
              color: mode === 'magic-eraser' ? 'var(--accent)' : 'var(--text-secondary)'
            }}
          >
            <Wand2 size={14} style={{ marginRight: '0.4rem' }} />Borrador Mágico
          </button>
          <button
            onClick={() => setMode('bg-eraser')}
            className="font-caps btn-sm"
            style={{
              padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
              border: mode === 'bg-eraser' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
              backgroundColor: mode === 'bg-eraser' ? 'var(--accent-muted)' : 'var(--bg-surface-2)',
              color: mode === 'bg-eraser' ? 'var(--accent)' : 'var(--text-secondary)'
            }}
          >
            <Eraser size={14} style={{ marginRight: '0.4rem' }} />Quitar Fondo
          </button>
        </div>

        {mode === 'magic-eraser' && (
          <>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ flex: '1 1 180px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Pincel ({brushSize}px)</label>
                <input type="range" min={8} max={80} value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
              <button className="btn btn-ghost btn-sm" onClick={clearMask} disabled={!hasMask || isProcessing}><RotateCcw size={14} /> Limpiar</button>
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

        {mode === 'bg-eraser' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Original</label>
                <img src={src} alt="Original" style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }} />
              </div>
              <div style={{
                textAlign: 'center', backgroundImage: 'linear-gradient(45deg, #1c1c22 25%, transparent 25%), linear-gradient(-45deg, #1c1c22 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1c1c22 75%), linear-gradient(-45deg, transparent 75%, #1c1c22 75%)',
                backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px', backgroundColor: '#111114', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', padding: '0.5rem'
              }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--accent)' }}>Sin fondo</label>
                {bgResultUrl ? (
                  <img src={bgResultUrl} alt="Sin fondo" style={{ maxWidth: '100%', maxHeight: '260px', borderRadius: 'var(--radius-sm)' }} />
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-disabled)', padding: '2rem 0' }}>
                    {bgProcessing ? (bgProgressLabel || 'Procesando…') : 'Presioná "Quitar Fondo" para procesar'}
                  </div>
                )}
              </div>
            </div>

            {bgError && <div style={{ fontSize: '0.8rem', color: '#F87171', marginBottom: '1rem' }}>{bgError}</div>}

            <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={runBackgroundRemoval} disabled={bgProcessing} style={{ gap: '0.5rem' }}>
                {bgProcessing ? <Loader2 size={16} className="spin" /> : <Eraser size={16} />}
                <span>{bgProcessing ? 'Procesando…' : 'Quitar Fondo'}</span>
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
