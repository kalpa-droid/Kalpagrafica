import React, { useState, useRef, useEffect } from 'react';
import { Wand2, Eraser, Download, Undo2, RotateCcw, Loader2 } from 'lucide-react';
import { ToolCard, FieldLabel, UploadZone } from './CommonComponents';
import { loadImageFromFile, downloadCanvas, drawContain } from '../../utils/image';
import { contentAwareFill } from '../../utils/inpaint';
import { removeImageBackground } from '../../utils/bgRemoval';

const MAX_WORK_DIM = 900; // límite de trabajo para que el borrador mágico responda rápido en el navegador

export default function RetouchTab() {
  const [retouchSubTab, setRetouchSubTab] = useState('magic-eraser');

  // ---------- BORRADOR MÁGICO (content-aware fill) ----------
  const [img, setImg] = useState(null);
  const [fileName, setFileName] = useState('');
  const [brushSize, setBrushSize] = useState(28);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasMask, setHasMask] = useState(false);

  const baseCanvasRef = useRef(null); // imagen visible + resultado
  const maskCanvasRef = useRef(null); // overlay donde se pinta la máscara (rojo semitransparente)
  const workCanvasRef = useRef(null); // buffer oculto a resolución de trabajo, con la imagen fuente intacta
  const historyRef = useRef([]); // pila de ImageData para "Deshacer"

  const handleUpload = async (file) => {
    const { img: loadedImg } = await loadImageFromFile(file);
    setImg(loadedImg);
    setFileName(file.name);
    setHasMask(false);
    historyRef.current = [];
  };

  useEffect(() => {
    if (!img || !baseCanvasRef.current || !maskCanvasRef.current || !workCanvasRef.current) return;
    const scale = Math.min(1, MAX_WORK_DIM / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));

    for (const ref of [baseCanvasRef, maskCanvasRef, workCanvasRef]) {
      ref.current.width = w;
      ref.current.height = h;
    }
    const workCtx = workCanvasRef.current.getContext('2d');
    workCtx.drawImage(img, 0, 0, w, h);
    const baseCtx = baseCanvasRef.current.getContext('2d');
    baseCtx.drawImage(img, 0, 0, w, h);
    maskCanvasRef.current.getContext('2d').clearRect(0, 0, w, h);
  }, [img]);

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

  const onPointerDown = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCanvasPos(e);
    paintAt(x, y);
  };
  const onPointerMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCanvasPos(e);
    paintAt(x, y);
  };
  const onPointerUp = () => setIsDrawing(false);

  const clearMask = () => {
    if (!maskCanvasRef.current) return;
    maskCanvasRef.current.getContext('2d').clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
    setHasMask(false);
  };

  const applyMagicEraser = async () => {
    if (!hasMask || !workCanvasRef.current) return;
    setIsProcessing(true);
    setProgress(0);

    const w = workCanvasRef.current.width;
    const h = workCanvasRef.current.height;
    const workCtx = workCanvasRef.current.getContext('2d');
    const imageData = workCtx.getImageData(0, 0, w, h);

    // Guardar estado para "Deshacer"
    historyRef.current.push(new ImageData(new Uint8ClampedArray(imageData.data), w, h));

    // Construir la máscara binaria a partir del canvas de pintura
    const maskCtx = maskCanvasRef.current.getContext('2d');
    const maskPixels = maskCtx.getImageData(0, 0, w, h).data;
    const mask = new Uint8Array(w * h);
    for (let i = 0; i < mask.length; i++) {
      mask[i] = maskPixels[i * 4 + 3] > 20 ? 1 : 0; // alfa del trazo pintado
    }

    const result = await contentAwareFill(imageData, mask, {
      patchRadius: 4,
      iterations: 5,
      onProgress: (p) => setProgress(p)
    });

    workCtx.putImageData(result, 0, 0);
    const baseCtx = baseCanvasRef.current.getContext('2d');
    baseCtx.putImageData(result, 0, 0);
    clearMask();
    setIsProcessing(false);
    setProgress(0);
  };

  const undoLast = () => {
    const prev = historyRef.current.pop();
    if (!prev || !workCanvasRef.current) return;
    workCanvasRef.current.getContext('2d').putImageData(prev, 0, 0);
    baseCanvasRef.current.getContext('2d').putImageData(prev, 0, 0);
  };

  const downloadResult = () => {
    if (!workCanvasRef.current) return;
    downloadCanvas(workCanvasRef.current, `kalpa-retoque-${fileName || 'imagen'}.png`);
  };

  // ---------- BORRADOR DE FONDO (segmentación IA) ----------
  const [bgImgFile, setBgImgFile] = useState(null);
  const [bgFileName, setBgFileName] = useState('');
  const [bgOriginalUrl, setBgOriginalUrl] = useState(null);
  const [bgResultUrl, setBgResultUrl] = useState(null);
  const [bgProcessing, setBgProcessing] = useState(false);
  const [bgProgressLabel, setBgProgressLabel] = useState('');
  const [bgError, setBgError] = useState(null);

  const handleBgUpload = (file) => {
    setBgImgFile(file);
    setBgFileName(file.name);
    setBgOriginalUrl(URL.createObjectURL(file));
    setBgResultUrl(null);
    setBgError(null);
  };

  const runBackgroundRemoval = async () => {
    if (!bgImgFile) return;
    setBgProcessing(true);
    setBgError(null);
    setBgProgressLabel('Cargando modelo de segmentación…');
    try {
      const blob = await removeImageBackground(bgImgFile, {
        onProgress: ({ key, current, total }) => {
          setBgProgressLabel(`${key} (${current}/${total})`);
        }
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

  const downloadBgResult = () => {
    if (!bgResultUrl) return;
    const a = document.createElement('a');
    a.href = bgResultUrl;
    a.download = `kalpa-sin-fondo-${bgFileName || 'imagen'}.png`;
    a.click();
  };

  const SUB_TABS = [
    { id: 'magic-eraser', label: 'Borrador Mágico', icon: Wand2 },
    { id: 'bg-eraser', label: 'Borrador de Fondo', icon: Eraser }
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {SUB_TABS.map((t) => {
          const Icon = t.icon;
          const isActive = retouchSubTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setRetouchSubTab(t.id)}
              className="font-caps btn-sm"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: isActive ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                backgroundColor: isActive ? 'var(--accent-muted)' : 'var(--bg-surface-2)',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer'
              }}
            >
              <Icon size={14} /><span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {retouchSubTab === 'magic-eraser' && (
        <ToolCard
          icon={Wand2}
          title="Borrador Mágico (Content-Aware Fill)"
          description="Pintá sobre lo que querés eliminar (una persona de fondo, un cable, una imperfección) y la herramienta reconstruye esa zona analizando la textura del resto de la imagen — igual que 'Heal Selection / Resynthesizer' de GIMP o el 'Content-Aware Fill' de Photoshop. Todo se procesa en tu navegador, sin subir la imagen a ningún servidor."
        >
          <UploadZone onFile={handleUpload} fileName={fileName} />

          {img && (
            <>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', margin: '1.2rem 0' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <FieldLabel>Tamaño de pincel ({brushSize}px)</FieldLabel>
                  <input type="range" min={8} max={80} value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} style={{ width: '100%' }} />
                </div>
                <button className="btn btn-ghost btn-sm" onClick={clearMask} disabled={!hasMask || isProcessing}>
                  <RotateCcw size={14} /> Limpiar trazo
                </button>
                <button className="btn btn-ghost btn-sm" onClick={undoLast} disabled={isProcessing || historyRef.current.length === 0}>
                  <Undo2 size={14} /> Deshacer último borrado
                </button>
              </div>

              <div style={{
                position: 'relative', display: 'inline-block', maxWidth: '100%',
                backgroundColor: '#111114', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)',
                lineHeight: 0
              }}>
                <canvas ref={baseCanvasRef} style={{ maxWidth: '100%', display: 'block', borderRadius: 'var(--radius-md)' }} />
                <canvas
                  ref={maskCanvasRef}
                  onMouseDown={onPointerDown}
                  onMouseMove={onPointerMove}
                  onMouseUp={onPointerUp}
                  onMouseLeave={onPointerUp}
                  onTouchStart={onPointerDown}
                  onTouchMove={onPointerMove}
                  onTouchEnd={onPointerUp}
                  style={{
                    position: 'absolute', top: 0, left: 0, maxWidth: '100%',
                    cursor: isProcessing ? 'wait' : 'crosshair', touchAction: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.7rem', marginTop: '1.2rem', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={applyMagicEraser} disabled={!hasMask || isProcessing} style={{ gap: '0.5rem' }}>
                  {isProcessing ? <Loader2 size={16} className="spin" /> : <Wand2 size={16} />}
                  <span>{isProcessing ? `Reconstruyendo… ${Math.round(progress * 100)}%` : 'Aplicar Borrador Mágico'}</span>
                </button>
                <button className="btn btn-secondary" onClick={downloadResult} disabled={isProcessing} style={{ gap: '0.5rem' }}>
                  <Download size={16} /><span>Descargar Resultado</span>
                </button>
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', marginTop: '0.8rem' }}>
                Tip: funciona mejor con zonas de tamaño pequeño/medio y texturas repetitivas (cielo, pasto, pared, piel). Para imágenes muy grandes se trabaja a una resolución máxima de {MAX_WORK_DIM}px para mantener la fluidez del navegador.
              </p>
            </>
          )}
        </ToolCard>
      )}

      {retouchSubTab === 'bg-eraser' && (
        <ToolCard
          icon={Eraser}
          title="Borrador de Fondo (Segmentación IA)"
          description="Quitá el fondo de una foto en un clic usando un modelo de segmentación que corre íntegramente en tu navegador (no se sube la imagen a ningún servidor). Ideal para productos, retratos y logos sobre foto."
        >
          <UploadZone onFile={handleBgUpload} fileName={bgFileName} />

          {bgOriginalUrl && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', margin: '1.2rem 0' }}>
                <div style={{ textAlign: 'center' }}>
                  <FieldLabel>Original</FieldLabel>
                  <img src={bgOriginalUrl} alt="Original" style={{ maxWidth: '100%', maxHeight: '320px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }} />
                </div>
                <div style={{
                  textAlign: 'center', backgroundImage: 'linear-gradient(45deg, #1c1c22 25%, transparent 25%), linear-gradient(-45deg, #1c1c22 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1c1c22 75%), linear-gradient(-45deg, transparent 75%, #1c1c22 75%)',
                  backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px', backgroundColor: '#111114', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', padding: '0.5rem'
                }}>
                  <FieldLabel accent>Sin fondo</FieldLabel>
                  {bgResultUrl ? (
                    <img src={bgResultUrl} alt="Sin fondo" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: 'var(--radius-sm)' }} />
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-disabled)', padding: '2rem 0' }}>
                      {bgProcessing ? (bgProgressLabel || 'Procesando…') : 'Presioná "Quitar Fondo" para procesar'}
                    </div>
                  )}
                </div>
              </div>

              {bgError && (
                <div style={{ fontSize: '0.8rem', color: '#F87171', marginBottom: '1rem' }}>{bgError}</div>
              )}

              <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={runBackgroundRemoval} disabled={bgProcessing} style={{ gap: '0.5rem' }}>
                  {bgProcessing ? <Loader2 size={16} className="spin" /> : <Eraser size={16} />}
                  <span>{bgProcessing ? 'Procesando…' : 'Quitar Fondo'}</span>
                </button>
                <button className="btn btn-secondary" onClick={downloadBgResult} disabled={!bgResultUrl} style={{ gap: '0.5rem' }}>
                  <Download size={16} /><span>Descargar PNG Transparente</span>
                </button>
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', marginTop: '0.8rem' }}>
                La primera vez descarga un modelo IA (~unos MB) que el navegador cachea para usos futuros. Requiere conexión a internet solo la primera vez.
              </p>
            </>
          )}
        </ToolCard>
      )}

      <style>{`
        .spin { animation: kalpa-spin 1s linear infinite; }
        @keyframes kalpa-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
