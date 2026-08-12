import React, { useState, useRef, useEffect } from 'react';
import { 
  Palette, Type, Square, Circle as CircleIcon, Image as ImageIcon, Download, 
  Printer, FileText, Trash2, ArrowUp, ArrowDown, Sparkles, Wand2, Undo2, Redo2, 
  Sun, Contrast as ContrastIcon, Droplet, Focus, Brush, Smile, Sliders, Layers, 
  RotateCw, Copy, AlignCenter
} from 'lucide-react';
import { Stage, Layer, Text, Rect, Circle, Line, Star, Image as KonvaImage, Transformer } from 'react-konva';
import Konva from 'konva';
import jsPDF from 'jspdf';
import ImageRetouchModal from '../components/ImageRetouchModal';

// 30 Tipografías Web Gratuitas de Google Fonts (Estilos Únicos & Diversos)
export const WEB_FONTS = [
  { name: 'Space Grotesk', category: 'Tech Grotesk' },
  { name: 'Inter', category: 'Swiss Sans' },
  { name: 'JetBrains Mono', category: 'Code Monospace' },
  { name: 'Playfair Display', category: 'Luxury Serif' },
  { name: 'Cinzel', category: 'Classic Imperial' },
  { name: 'Cinzel Decorative', category: 'Royal Ornate' },
  { name: 'Bebas Neue', category: 'Bold Impact' },
  { name: 'Pacifico', category: 'Retro Surf Script' },
  { name: 'Dancing Script', category: 'Cursive Calligraphy' },
  { name: 'Press Start 2P', category: '8-Bit Arcade Pixel' },
  { name: 'Permanent Marker', category: 'Sharpie Marker' },
  { name: 'Abril Fatface', category: 'Poster Serif' },
  { name: 'Caveat', category: 'Handwriting' },
  { name: 'Montserrat', category: 'Geometric Sans' },
  { name: 'Oswald', category: 'Industrial Gothic' },
  { name: 'Righteous', category: '80s Cyber Retro' },
  { name: 'Sacramento', category: 'Signature Monoline' },
  { name: 'Creepster', category: 'Gothic Horror' },
  { name: 'Special Elite', category: 'Typewriter' },
  { name: 'Monoton', category: 'Neon Multiline' },
  { name: 'Alfa Slab One', category: 'Ultra Slab Serif' },
  { name: 'Satisfy', category: 'Brush Script' },
  { name: 'Orbitron', category: 'Sci-Fi Cyber' },
  { name: 'UnifrakturMaguntia', category: 'Medieval Blackletter' },
  { name: 'Lobster', category: 'Vintage Script' },
  { name: 'Rubik Glitch', category: 'Digital Glitch' },
  { name: 'Courier Prime', category: 'Screenplay Mono' },
  { name: 'Fredoka', category: 'Soft Rounded' },
  { name: 'VT323', category: 'CRT Terminal' },
  { name: 'Great Vibes', category: 'Formal Script' }
];

// Categorías de Emojis estilo WhatsApp
export const EMOJI_CATEGORIES = [
  {
    name: 'Caras & Emociones',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😋', '😛', '😜', '🤪', '🤩', '🥳', '😎', '🤓', '🧐', '🤯', '😱', '😈', '💀', '👽', '🤖']
  },
  {
    name: 'Manos & Gestos',
    emojis: ['👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '✌️', '🤟', '🤘', '🤙', '🖐️', '✋', '👌', '🤏', '🤞', '👊', '✊', '🤛', '🤜']
  },
  {
    name: 'Corazones & Fuego',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💖', '💗', '💓', '💞', '💕', '💔', '❣️', '🔥', '💥', '⚡', '✨', '🌟', '⭐', '🎉', '🎊', '💯', '🎯', '🚀', '💎', '👑']
  },
  {
    name: 'Objetos & Marca',
    emojis: ['🎨', '🎭', '🎬', '🏆', '🥇', '💡', '📢', '📌', '📍', '🏷️', '💼', '📱', '💻', '📷', '🔒', '🛡️', '☀️', '🌙', '☕', '🍕', '🚗', '🛍️', '💰', '💵', '📦', '🎁']
  }
];

// Plantillas predefinidas de lienzo
const PRESETS = [
  { id: 'business', name: 'Tarjeta de Presentación', width: 540, height: 300, unit: '90x50 mm' },
  { id: 'invitation', name: 'Invitación de Evento', width: 400, height: 600, unit: '100x150 mm' },
  { id: 'tag', name: 'Etiqueta de Producto', width: 400, height: 400, unit: '60x60 mm' },
  { id: 'social', name: 'Post de Redes Social', width: 500, height: 500, unit: '1080x1080 px' }
];

// Helper de Imagen Konva con filtros no-destructivos
function URLImage({ image, ...props }) {
  const [imgObj, setImgObj] = useState(null);
  const shapeRef = useRef(null);

  useEffect(() => {
    if (!image.src) return;
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.src = image.src;
    img.onload = () => setImgObj(img);
  }, [image.src]);

  useEffect(() => {
    if (!shapeRef.current) return;
    shapeRef.current.cache();
    shapeRef.current.getLayer()?.batchDraw();
  }, [imgObj, props.brightness, props.contrast, props.saturation, props.blurRadius]);

  if (!imgObj) return null;
  return (
    <KonvaImage
      ref={shapeRef}
      image={imgObj}
      filters={[Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.HSL, Konva.Filters.Blur]}
      {...props}
    />
  );
}

export default function DesignEditorSection() {
  const [preset, setPreset] = useState(PRESETS[0]);
  const [bgColor, setBgColor] = useState('#111114');
  const [elements, setElements] = useState([
    { id: 'el-1', type: 'text', text: 'KALPAGRÁFICA', x: 40, y: 50, fontSize: 26, fill: '#BAFDC1', fontFamily: 'Space Grotesk', fontWeight: 'bold' },
    { id: 'el-2', type: 'text', text: 'Estudio de Diseño & Preimpresión', x: 40, y: 90, fontSize: 14, fill: '#E5E5E7', fontFamily: 'Inter' },
    { id: 'el-3', type: 'rect', x: 40, y: 130, width: 460, height: 2, fill: '#BAFDC1' },
    { id: 'el-4', type: 'text', text: 'hola@kalpagrafica.com | +54 9 11 0000-0000', x: 40, y: 150, fontSize: 12, fill: '#9EA0A6', fontFamily: 'JetBrains Mono' }
  ]);
  
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'emojis' | 'draw' | 'shapes' | 'image' | 'canvas'
  const [retouchModalOpen, setRetouchModalOpen] = useState(false);

  // Modo Dibujo Libre Pincel
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [brushColor, setBrushColor] = useState('#BAFDC1');
  const [brushSize, setBrushSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);

  // Guías de Alineación / Snapping
  const [alignGuides, setAlignGuides] = useState({ showX: false, showY: false });

  // Refs de Konva e Historial Undo/Redo
  const stageRef = useRef(null);
  const trRef = useRef(null);
  const undoStack = useRef([]);
  const redoStack = useRef([]);

  // Guardar snapshot para Deshacer
  const saveStateToHistory = () => {
    undoStack.current.push(JSON.parse(JSON.stringify(elements)));
    if (undoStack.current.length > 35) undoStack.current.shift();
    redoStack.current = [];
  };

  const undo = () => {
    if (undoStack.current.length === 0) return;
    const current = JSON.parse(JSON.stringify(elements));
    redoStack.current.push(current);
    const previous = undoStack.current.pop();
    setElements(previous);
  };

  const redo = () => {
    if (redoStack.current.length === 0) return;
    const current = JSON.parse(JSON.stringify(elements));
    undoStack.current.push(current);
    const next = redoStack.current.pop();
    setElements(next);
  };

  // Vincular Transformer de Konva al elemento seleccionado
  useEffect(() => {
    if (!selectedId || !trRef.current || !stageRef.current) return;
    const node = stageRef.current.findOne('#' + selectedId);
    if (node) {
      trRef.current.nodes([node]);
      trRef.current.getLayer().batchDraw();
    } else {
      trRef.current.nodes([]);
    }
  }, [selectedId, elements]);

  // Añadir Texto con fuente configurable
  const addText = (textValue = 'Nuevo Texto', fontFamily = 'Space Grotesk', fontSize = 22) => {
    saveStateToHistory();
    const newEl = {
      id: 'text-' + Date.now(),
      type: 'text',
      text: textValue,
      x: preset.width / 2 - 60,
      y: preset.height / 2 - 15,
      fontSize,
      fill: '#FFFFFF',
      fontFamily,
      opacity: 1,
      rotation: 0
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  // Añadir Emoji como Sticker
  const addEmoji = (emojiChar) => {
    addText(emojiChar, 'sans-serif', 42);
  };

  // Añadir Rectángulo
  const addRect = () => {
    saveStateToHistory();
    const newEl = {
      id: 'rect-' + Date.now(),
      type: 'rect',
      x: preset.width / 2 - 50,
      y: preset.height / 2 - 30,
      width: 100,
      height: 60,
      fill: '#BAFDC1',
      cornerRadius: 4,
      opacity: 1,
      rotation: 0
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  // Añadir Círculo
  const addCircle = () => {
    saveStateToHistory();
    const newEl = {
      id: 'circle-' + Date.now(),
      type: 'circle',
      x: preset.width / 2,
      y: preset.height / 2,
      radius: 40,
      fill: '#C9A94D',
      opacity: 1,
      rotation: 0
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  // Añadir Estrella
  const addStar = () => {
    saveStateToHistory();
    const newEl = {
      id: 'star-' + Date.now(),
      type: 'star',
      x: preset.width / 2,
      y: preset.height / 2,
      numPoints: 5,
      innerRadius: 20,
      outerRadius: 40,
      fill: '#38BDF8',
      opacity: 1,
      rotation: 0
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  // Carga de Imagen
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    saveStateToHistory();
    const url = URL.createObjectURL(file);
    const newEl = {
      id: 'img-' + Date.now(),
      type: 'image',
      src: url,
      x: preset.width / 2 - 75,
      y: preset.height / 2 - 75,
      width: 150,
      height: 150,
      brightness: 0,
      contrast: 0,
      saturation: 0,
      blurRadius: 0,
      opacity: 1,
      rotation: 0
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  // Modificar Propiedades del Elemento Seleccionado
  const updateSelected = (key, value) => {
    if (!selectedId) return;
    setElements((prev) => prev.map((el) => (el.id === selectedId ? { ...el, [key]: value } : el)));
  };

  const updateSelectedWithHistory = (key, value) => {
    if (!selectedId) return;
    saveStateToHistory();
    setElements((prev) => prev.map((el) => (el.id === selectedId ? { ...el, [key]: value } : el)));
  };

  // Eliminar elemento
  const deleteSelected = () => {
    if (!selectedId) return;
    saveStateToHistory();
    setElements((prev) => prev.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  };

  // Duplicar elemento
  const duplicateSelected = () => {
    const el = elements.find((e) => e.id === selectedId);
    if (!el) return;
    saveStateToHistory();
    const copy = {
      ...JSON.parse(JSON.stringify(el)),
      id: el.type + '-' + Date.now(),
      x: el.x + 20,
      y: el.y + 20
    };
    setElements((prev) => [...prev, copy]);
    setSelectedId(copy.id);
  };

  // Mover Capa (Subir / Bajar)
  const moveLayer = (direction) => {
    if (!selectedId) return;
    const index = elements.findIndex((el) => el.id === selectedId);
    if (index === -1) return;
    saveStateToHistory();
    const newElements = [...elements];
    if (direction === 'up' && index < newElements.length - 1) {
      const temp = newElements[index];
      newElements[index] = newElements[index + 1];
      newElements[index + 1] = temp;
    } else if (direction === 'down' && index > 0) {
      const temp = newElements[index];
      newElements[index] = newElements[index - 1];
      newElements[index - 1] = temp;
    }
    setElements(newElements);
  };

  // Handlers para Dibujo Libre Pincel
  const handleMouseDownDraw = (e) => {
    if (!isDrawingMode) return;
    setIsDrawing(true);
    saveStateToHistory();
    const pos = e.target.getStage().getPointerPosition();
    const newLine = {
      id: 'line-' + Date.now(),
      type: 'line',
      points: [pos.x, pos.y, pos.x, pos.y],
      stroke: brushColor,
      strokeWidth: brushSize,
      lineCap: 'round',
      lineJoin: 'round'
    };
    setElements((prev) => [...prev, newLine]);
  };

  const handleMouseMoveDraw = (e) => {
    if (!isDrawingMode || !isDrawing) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    setElements((prev) => {
      const lastLine = { ...prev[prev.length - 1] };
      if (!lastLine || lastLine.type !== 'line') return prev;
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      return [...prev.slice(0, prev.length - 1), lastLine];
    });
  };

  const handleMouseUpDraw = () => {
    if (isDrawingMode) setIsDrawing(false);
  };

  // Guías de alineación al arrastrar
  const handleDragMove = (e, id) => {
    const node = e.target;
    const stageCenterX = preset.width / 2;
    const stageCenterY = preset.height / 2;
    const nodeCenterX = node.x();
    const nodeCenterY = node.y();

    const isNearX = Math.abs(nodeCenterX - stageCenterX) < 6;
    const isNearY = Math.abs(nodeCenterY - stageCenterY) < 6;

    if (isNearX) node.x(stageCenterX);
    if (isNearY) node.y(stageCenterY);

    setAlignGuides({ showX: isNearX, showY: isNearY });
    updateSelected('x', node.x());
    updateSelected('y', node.y());
  };

  const handleDragEnd = () => {
    setAlignGuides({ showX: false, showY: false });
  };

  // Exportar a Imagen PNG HD (300 DPI)
  const exportPNG = () => {
    if (!stageRef.current) return;
    setSelectedId(null);
    setTimeout(() => {
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 3 });
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = `Diseno_${preset.id}_HD.png`;
      a.click();
    }, 100);
  };

  // Exportar a PDF Imprimible (300 DPI)
  const exportPDF = () => {
    if (!stageRef.current) return;
    setSelectedId(null);
    setTimeout(() => {
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 3 });
      const isLandscape = preset.width > preset.height;
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [preset.width / 4, preset.height / 4]
      });
      pdf.addImage(dataURL, 'PNG', 0, 0, preset.width / 4, preset.height / 4);
      pdf.save(`Diseno_${preset.id}_Impresion.pdf`);
    }, 100);
  };

  const selectedElement = elements.find((el) => el.id === selectedId);

  return (
    <section className="section-container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Header Sección */}
      <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto 2rem' }}>
        <div className="font-caps" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)',
          backgroundColor: 'var(--accent-muted)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)',
          marginBottom: '0.8rem', border: '1px solid rgba(186,253,193,0.3)'
        }}>
          <Palette size={15} />
          <span>Tools de Edición</span>
        </div>

        <h2 className="font-headline" style={{
          fontSize: 'clamp(1.8rem, 3.8vw, 3rem)', fontWeight: 700, letterSpacing: '-0.02em',
          color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '0.8rem'
        }}>
          Tools de Edición (Tarjetas & Piezas Gráficas)
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.55 }}>
          Estudio gráfico interactivo 2D nativo (Konva Engine): 30 fuentes web tipográficas, stickers emojis estilo WhatsApp, pincel libre de dibujo, filtros no-destructivos e inteligencia artificial.
        </p>
      </div>

      {/* Top Toolbar de la Suite (Historial, Presets y Exportación) */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '0.8rem 1.2rem',
        maxWidth: '1280px',
        margin: '0 auto 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.8rem',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        {/* Presets de Plantillas */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-disabled)', fontWeight: 600, marginRight: '0.4rem' }}>
            Formato:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => { setPreset(p); setSelectedId(null); }}
              className="btn btn-sm"
              style={{
                backgroundColor: preset.id === p.id ? 'var(--accent)' : 'var(--bg-surface-2)',
                color: preset.id === p.id ? '#08080A' : 'var(--text-secondary)',
                border: preset.id === p.id ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                fontWeight: preset.id === p.id ? 700 : 500,
                fontSize: '0.78rem',
                padding: '0.35rem 0.75rem'
              }}
            >
              <span>{p.name}</span>
            </button>
          ))}
        </div>

        {/* Acciones de Historial (Undo / Redo / Clear) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={undo}
            disabled={undoStack.current.length === 0}
            className="btn btn-secondary btn-sm"
            title="Deshacer (Undo)"
            style={{ padding: '0.4rem 0.7rem', opacity: undoStack.current.length === 0 ? 0.5 : 1 }}
          >
            <Undo2 size={16} />
            <span style={{ fontSize: '0.78rem' }}>Deshacer</span>
          </button>
          <button
            onClick={redo}
            disabled={redoStack.current.length === 0}
            className="btn btn-secondary btn-sm"
            title="Rehacer (Redo)"
            style={{ padding: '0.4rem 0.7rem', opacity: redoStack.current.length === 0 ? 0.5 : 1 }}
          >
            <Redo2 size={16} />
            <span style={{ fontSize: '0.78rem' }}>Rehacer</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm('¿Deseas limpiar todos los elementos del lienzo?')) {
                saveStateToHistory();
                setElements([]);
                setSelectedId(null);
              }
            }}
            className="btn btn-ghost btn-sm"
            title="Limpiar Lienzo"
            style={{ color: '#F87171', padding: '0.4rem 0.7rem', fontSize: '0.78rem' }}
          >
            <Trash2 size={15} />
            <span>Limpiar</span>
          </button>
        </div>

        {/* Botones de Exportación HD */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button className="btn btn-primary btn-sm" onClick={exportPNG} style={{ gap: '0.4rem', fontSize: '0.78rem' }}>
            <Download size={15} />
            <span>Exportar PNG (300 DPI)</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={exportPDF} style={{ gap: '0.4rem', fontSize: '0.78rem' }}>
            <FileText size={15} />
            <span>PDF Imprimible</span>
          </button>
        </div>
      </div>

      {/* Editor Principal Layout 3 Columnas (Barra de Pestañas Izquierda + Canvas + Propiedades) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr 290px',
        gap: '1.2rem',
        maxWidth: '1380px',
        margin: '0 auto',
        alignItems: 'start'
      }}>
        {/* Columna Izquierda: Panel Tabulado de Herramientas de Creación */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-card)'
        }}>
          {/* Selector de Pestaña de Herramientas */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-2)',
            overflowX: 'auto'
          }}>
            {[
              { id: 'text', label: 'Texto', icon: Type },
              { id: 'emojis', label: 'Emojis', icon: Smile },
              { id: 'draw', label: 'Pincel', icon: Brush },
              { id: 'shapes', label: 'Formas', icon: Square },
              { id: 'image', label: 'Imagen', icon: ImageIcon },
              { id: 'canvas', label: 'Lienzo', icon: Sliders }
            ].map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    flex: 1,
                    minWidth: '50px',
                    padding: '0.6rem 0.4rem',
                    background: isActive ? 'var(--bg-surface)' : 'transparent',
                    border: 'none',
                    borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.2rem',
                    fontSize: '0.68rem',
                    fontWeight: isActive ? 700 : 500,
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon size={16} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Contenido de la Pestaña Activa */}
          <div style={{ padding: '1.2rem', maxHeight: '520px', overflowY: 'auto' }}>
            {/* Pestaña: Texto & 30 Tipografías Web */}
            {activeTab === 'text' && (
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.8rem', textTransform: 'uppercase' }}>
                  Añadir Texto & 30 Fuentes Web
                </h4>
                
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => addText('Nuevo Texto', 'Space Grotesk', 24)}
                  style={{ width: '100%', marginBottom: '1.2rem', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Type size={16} />
                  <span>Añadir Bloque de Texto</span>
                </button>

                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Catálogo de 30 Fuentes Gratuitas:
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {WEB_FONTS.map((font) => (
                    <button
                      key={font.name}
                      onClick={() => addText(font.name, font.name, 22)}
                      style={{
                        backgroundColor: 'var(--bg-surface-2)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.6rem 0.8rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s'
                      }}
                      className="font-item-btn"
                    >
                      <span style={{ fontFamily: font.name, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {font.name}
                      </span>
                      <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--luxury)', backgroundColor: 'rgba(201,169,77,0.12)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        {font.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pestaña: Emojis Estilo WhatsApp */}
            {activeTab === 'emojis' && (
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.8rem', textTransform: 'uppercase' }}>
                  Emojis & Stickers (WhatsApp Style)
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.35 }}>
                  Toca cualquier emoji para insertarlo en el lienzo como sticker escalable.
                </p>

                {EMOJI_CATEGORIES.map((cat) => (
                  <div key={cat.name} style={{ marginBottom: '1.2rem' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--luxury)', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                      {cat.name}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.35rem' }}>
                      {cat.emojis.map((emojiChar, idx) => (
                        <button
                          key={idx}
                          onClick={() => addEmoji(emojiChar)}
                          style={{
                            fontSize: '1.4rem',
                            backgroundColor: 'var(--bg-surface-2)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.3rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                          }}
                          title={`Insertar ${emojiChar}`}
                          className="emoji-btn"
                        >
                          {emojiChar}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pestaña: Pincel & Dibujo Libre */}
            {activeTab === 'draw' && (
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.8rem', textTransform: 'uppercase' }}>
                  Pincel de Dibujo Libre
                </h4>

                <div style={{
                  padding: '1rem',
                  backgroundColor: 'var(--bg-surface-2)',
                  borderRadius: 'var(--radius-md)',
                  border: isDrawingMode ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                  marginBottom: '1.2rem'
                }}>
                  <button
                    onClick={() => {
                      setIsDrawingMode(!isDrawingMode);
                      setSelectedId(null);
                    }}
                    className={`btn ${isDrawingMode ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}
                  >
                    <Brush size={16} />
                    <span>{isDrawingMode ? 'Modo Pincel ACTIVO' : 'Activar Pincel de Dibujo'}</span>
                  </button>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.35, textAlign: 'center' }}>
                    {isDrawingMode ? 'Arrastra sobre el lienzo para dibujar libremente.' : 'Haz clic para comenzar a trazar sobre el lienzo.'}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                      Color del Pincel
                    </label>
                    <input
                      type="color"
                      value={brushColor}
                      onChange={(e) => setBrushColor(e.target.value)}
                      style={{ width: '100%', height: '36px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                      Grosor del Trazo ({brushSize}px)
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={30}
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent)' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pestaña: Formas */}
            {activeTab === 'shapes' && (
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.8rem', textTransform: 'uppercase' }}>
                  Añadir Formas & Figuras
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={addRect} style={{ justifyContent: 'flex-start', gap: '0.6rem' }}>
                    <Square size={16} />
                    <span>Rectángulo / Tarjeta</span>
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={addCircle} style={{ justifyContent: 'flex-start', gap: '0.6rem' }}>
                    <CircleIcon size={16} />
                    <span>Círculo / Sello</span>
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={addStar} style={{ justifyContent: 'flex-start', gap: '0.6rem' }}>
                    <Sparkles size={16} />
                    <span>Estrella de 5 Puntas</span>
                  </button>
                </div>
              </div>
            )}

            {/* Pestaña: Imagen */}
            {activeTab === 'image' && (
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.8rem', textTransform: 'uppercase' }}>
                  Añadir Imagen & Filtros
                </h4>
                <label className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', gap: '0.6rem', cursor: 'pointer', marginBottom: '1.2rem' }}>
                  <ImageIcon size={16} />
                  <span>Subir Imagen o Logo</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </label>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Admite PNG transparente, JPG y SVG. Una vez subida, selecciónala para aplicar brillo, contraste, saturación o retocar con IA.
                </p>
              </div>
            )}

            {/* Pestaña: Lienzo */}
            {activeTab === 'canvas' && (
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.8rem', textTransform: 'uppercase' }}>
                  Fondo & Dimensiones del Lienzo
                </h4>

                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Color de Fondo:
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      style={{ width: '45px', height: '36px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }} className="font-mono">{bgColor}</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-surface-2)', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div><strong>Resolución:</strong> {preset.width} x {preset.height} px</div>
                  <div><strong>Equivalencia:</strong> {preset.unit} (300 DPI)</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Columna Central: Konva Interactive Canvas Stage */}
        <div style={{
          backgroundColor: 'var(--bg-surface-2)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          minHeight: '480px',
          position: 'relative'
        }}>
          {/* Tag Indicador de Dimensiones */}
          <div style={{
            position: 'absolute',
            top: '0.8rem',
            left: '1rem',
            fontSize: '0.72rem',
            color: 'var(--text-disabled)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <span className="font-mono" style={{ color: 'var(--accent)' }}>{preset.width}x{preset.height}px</span>
            <span>({preset.unit})</span>
          </div>

          <div style={{
            boxShadow: '0 12px 35px rgba(0,0,0,0.6), 0 0 15px rgba(186, 253, 193, 0.08)',
            border: '1px solid var(--border-strong)',
            borderRadius: '4px',
            position: 'relative'
          }}>
            <Stage
              width={preset.width}
              height={preset.height}
              ref={stageRef}
              onMouseDown={(e) => {
                handleMouseDownDraw(e);
                if (e.target === e.target.getStage()) {
                  setSelectedId(null);
                }
              }}
              onMouseMove={handleMouseMoveDraw}
              onMouseUp={handleMouseUpDraw}
              onTouchStart={(e) => {
                handleMouseDownDraw(e);
                if (e.target === e.target.getStage()) {
                  setSelectedId(null);
                }
              }}
              onTouchMove={handleMouseMoveDraw}
              onTouchEnd={handleMouseUpDraw}
            >
              <Layer>
                {/* Rectángulo de Fondo */}
                <Rect width={preset.width} height={preset.height} fill={bgColor} />

                {/* Renderizado Dinámico de Elementos */}
                {elements.map((el) => {
                  if (el.type === 'text') {
                    return (
                      <Text
                        key={el.id}
                        id={el.id}
                        {...el}
                        draggable={!isDrawingMode}
                        onClick={() => !isDrawingMode && setSelectedId(el.id)}
                        onTap={() => !isDrawingMode && setSelectedId(el.id)}
                        onDragMove={(e) => handleDragMove(e, el.id)}
                        onDragEnd={(e) => {
                          handleDragEnd();
                          updateSelected('x', e.target.x());
                          updateSelected('y', e.target.y());
                        }}
                      />
                    );
                  }
                  if (el.type === 'rect') {
                    return (
                      <Rect
                        key={el.id}
                        id={el.id}
                        {...el}
                        draggable={!isDrawingMode}
                        onClick={() => !isDrawingMode && setSelectedId(el.id)}
                        onTap={() => !isDrawingMode && setSelectedId(el.id)}
                        onDragMove={(e) => handleDragMove(e, el.id)}
                        onDragEnd={(e) => {
                          handleDragEnd();
                          updateSelected('x', e.target.x());
                          updateSelected('y', e.target.y());
                        }}
                      />
                    );
                  }
                  if (el.type === 'circle') {
                    return (
                      <Circle
                        key={el.id}
                        id={el.id}
                        {...el}
                        draggable={!isDrawingMode}
                        onClick={() => !isDrawingMode && setSelectedId(el.id)}
                        onTap={() => !isDrawingMode && setSelectedId(el.id)}
                        onDragMove={(e) => handleDragMove(e, el.id)}
                        onDragEnd={(e) => {
                          handleDragEnd();
                          updateSelected('x', e.target.x());
                          updateSelected('y', e.target.y());
                        }}
                      />
                    );
                  }
                  if (el.type === 'star') {
                    return (
                      <Star
                        key={el.id}
                        id={el.id}
                        {...el}
                        draggable={!isDrawingMode}
                        onClick={() => !isDrawingMode && setSelectedId(el.id)}
                        onTap={() => !isDrawingMode && setSelectedId(el.id)}
                        onDragMove={(e) => handleDragMove(e, el.id)}
                        onDragEnd={(e) => {
                          handleDragEnd();
                          updateSelected('x', e.target.x());
                          updateSelected('y', e.target.y());
                        }}
                      />
                    );
                  }
                  if (el.type === 'line') {
                    return (
                      <Line
                        key={el.id}
                        id={el.id}
                        {...el}
                        draggable={!isDrawingMode}
                        onClick={() => !isDrawingMode && setSelectedId(el.id)}
                        onTap={() => !isDrawingMode && setSelectedId(el.id)}
                      />
                    );
                  }
                  if (el.type === 'image') {
                    return (
                      <URLImage
                        key={el.id}
                        id={el.id}
                        image={{ src: el.src }}
                        {...el}
                        draggable={!isDrawingMode}
                        onClick={() => !isDrawingMode && setSelectedId(el.id)}
                        onTap={() => !isDrawingMode && setSelectedId(el.id)}
                        onDragMove={(e) => handleDragMove(e, el.id)}
                        onDragEnd={(e) => {
                          handleDragEnd();
                          updateSelected('x', e.target.x());
                          updateSelected('y', e.target.y());
                        }}
                      />
                    );
                  }
                  return null;
                })}

                {/* Guías de Alineación al Centro */}
                {alignGuides.showX && (
                  <Line
                    points={[preset.width / 2, 0, preset.width / 2, preset.height]}
                    stroke="#18f668"
                    strokeWidth={1}
                    dash={[4, 4]}
                  />
                )}
                {alignGuides.showY && (
                  <Line
                    points={[0, preset.height / 2, preset.width, preset.height / 2]}
                    stroke="#18f668"
                    strokeWidth={1}
                    dash={[4, 4]}
                  />
                )}

                {/* Transformer para Escalar / Rotar */}
                {!isDrawingMode && <Transformer ref={trRef} />}
              </Layer>
            </Stage>
          </div>
        </div>

        {/* Columna Derecha: Inspector de Propiedades del Elemento Seleccionado */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '1.2rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.8rem', textTransform: 'uppercase' }}>
            Propiedades
          </h4>

          {!selectedElement ? (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-disabled)', textAlign: 'center', padding: '2.5rem 0' }}>
              Toca cualquier elemento del lienzo para editar sus propiedades.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {/* Si es Texto */}
              {selectedElement.type === 'text' && (
                <>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                      Contenido de Texto
                    </label>
                    <input
                      type="text"
                      value={selectedElement.text}
                      onChange={(e) => updateSelected('text', e.target.value)}
                      className="input"
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                      Fuente Tipográfica
                    </label>
                    <select
                      value={selectedElement.fontFamily || 'Space Grotesk'}
                      onChange={(e) => updateSelectedWithHistory('fontFamily', e.target.value)}
                      style={{ width: '100%', fontSize: '0.85rem', fontFamily: selectedElement.fontFamily }}
                    >
                      {WEB_FONTS.map((f) => (
                        <option key={f.name} value={f.name} style={{ fontFamily: f.name }}>
                          {f.name} ({f.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                      Tamaño ({selectedElement.fontSize}px)
                    </label>
                    <input
                      type="range"
                      min={8}
                      max={120}
                      value={selectedElement.fontSize}
                      onChange={(e) => updateSelected('fontSize', Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent)' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                      Color de Texto
                    </label>
                    <input
                      type="color"
                      value={selectedElement.fill}
                      onChange={(e) => updateSelected('fill', e.target.value)}
                      style={{ width: '100%', height: '34px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                    />
                  </div>
                </>
              )}

              {/* Si es Formas (Rectángulo, Círculo, Estrella) */}
              {(selectedElement.type === 'rect' || selectedElement.type === 'circle' || selectedElement.type === 'star') && (
                <>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                      Color de Relleno
                    </label>
                    <input
                      type="color"
                      value={selectedElement.fill}
                      onChange={(e) => updateSelected('fill', e.target.value)}
                      style={{ width: '100%', height: '34px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                    />
                  </div>
                </>
              )}

              {/* Si es Imagen: Filtros no-destructivos + Retoque IA */}
              {selectedElement.type === 'image' && (
                <>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setRetouchModalOpen(true)}
                    style={{ justifyContent: 'center', gap: '0.5rem', width: '100%' }}
                  >
                    <Wand2 size={15} />
                    <span>Retocar Imagen con IA</span>
                  </button>

                  <div style={{ paddingTop: '0.6rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <label style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                      <Sun size={13} /> Brillo ({selectedElement.brightness ?? 0})
                    </label>
                    <input
                      type="range" min={-1} max={1} step={0.05}
                      value={selectedElement.brightness ?? 0}
                      onChange={(e) => updateSelected('brightness', Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent)' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                      <ContrastIcon size={13} /> Contraste ({selectedElement.contrast ?? 0})
                    </label>
                    <input
                      type="range" min={-100} max={100} step={1}
                      value={selectedElement.contrast ?? 0}
                      onChange={(e) => updateSelected('contrast', Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent)' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                      <Droplet size={13} /> Saturación ({selectedElement.saturation ?? 0})
                    </label>
                    <input
                      type="range" min={-2} max={5} step={0.1}
                      value={selectedElement.saturation ?? 0}
                      onChange={(e) => updateSelected('saturation', Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent)' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                      <Focus size={13} /> Desenfoque ({selectedElement.blurRadius ?? 0})
                    </label>
                    <input
                      type="range" min={0} max={20} step={1}
                      value={selectedElement.blurRadius ?? 0}
                      onChange={(e) => updateSelected('blurRadius', Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent)' }}
                    />
                  </div>
                </>
              )}

              {/* Acciones Generales (Duplicar, Capas, Eliminar) */}
              <div style={{ paddingTop: '0.8rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={duplicateSelected} style={{ gap: '0.4rem', justifyContent: 'center' }}>
                  <Copy size={14} /> Duplicar Elemento
                </button>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="btn btn-sm" onClick={() => moveLayer('up')} style={{ flex: 1, gap: '0.3rem', fontSize: '0.75rem' }}>
                    <ArrowUp size={13} /> Subir Capa
                  </button>
                  <button className="btn btn-sm" onClick={() => moveLayer('down')} style={{ flex: 1, gap: '0.3rem', fontSize: '0.75rem' }}>
                    <ArrowDown size={13} /> Bajar Capa
                  </button>
                </div>

                <button className="btn btn-sm" onClick={deleteSelected} style={{ backgroundColor: 'rgba(248,113,113,0.15)', color: '#F87171', border: '1px solid #F87171', justifyContent: 'center', gap: '0.4rem', marginTop: '0.3rem' }}>
                  <Trash2 size={14} /> Eliminar Elemento
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Retoque de Imagen IA */}
      {retouchModalOpen && selectedElement?.type === 'image' && (
        <ImageRetouchModal
          src={selectedElement.src}
          onApply={(newSrc) => {
            updateSelectedWithHistory('src', newSrc);
            setRetouchModalOpen(false);
          }}
          onClose={() => setRetouchModalOpen(false)}
        />
      )}

      <style>{`
        .font-item-btn:hover {
          border-color: var(--accent) !important;
          background-color: var(--accent-muted) !important;
        }
        .emoji-btn:hover {
          transform: scale(1.2);
          border-color: var(--accent) !important;
        }
      `}</style>
    </section>
  );
}
