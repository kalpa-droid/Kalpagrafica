import React, { useState, useRef, useEffect } from 'react';
import { 
  Palette, Type, Square, Circle as CircleIcon, Image as ImageIcon, Download, 
  Printer, FileText, Trash2, ArrowUp, ArrowDown, Sparkles, Wand2, Undo2, Redo2, 
  Sun, Contrast as ContrastIcon, Droplet, Focus, Brush, Smile, Sliders, Layers, 
  RotateCw, Copy, AlignCenter, Maximize2, X
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

// Plantillas predefinidas de lienzo por categorías
const PRESETS = [
  // --- REDES SOCIALES & DIGITAL ---
  { id: 'ig-portrait', category: 'Redes Sociales', name: 'Instagram Retrato 4:5', width: 500, height: 625, unit: '1080x1350 px' },
  { id: 'ig-square', category: 'Redes Sociales', name: 'Instagram Cuadrado 1:1', width: 500, height: 500, unit: '1080x1080 px' },
  { id: 'ig-story', category: 'Redes Sociales', name: 'Story / Reels / TikTok 9:16', width: 405, height: 720, unit: '1080x1920 px' },
  { id: 'fb-banner', category: 'Redes Sociales', name: 'Banner de Facebook', width: 600, height: 228, unit: '820x312 px' },
  { id: 'li-banner', category: 'Redes Sociales', name: 'Banner de LinkedIn', width: 600, height: 150, unit: '1584x396 px' },
  { id: 'yt-banner', category: 'Redes Sociales', name: 'Banner de YouTube', width: 640, height: 360, unit: '2560x1440 px' },
  { id: 'tw-banner', category: 'Redes Sociales', name: 'Banner Twitter / X', width: 600, height: 200, unit: '1500x500 px' },
  { id: 'pin-23', category: 'Redes Sociales', name: 'Pin de Pinterest 2:3', width: 440, height: 660, unit: '1000x1500 px' },
  { id: 'totem-slim', category: 'Redes Sociales', name: 'Pantalla Tótems 80x1920', width: 180, height: 720, unit: '80x1920 px' },

  // --- TARJETAS & PAPELERÍA ---
  { id: 'business', category: 'Tarjetas & Papelería', name: 'Tarjeta de Presentación', width: 540, height: 300, unit: '90x50 mm' },
  { id: 'business-eu', category: 'Tarjetas & Papelería', name: 'Tarjeta Europea', width: 510, height: 330, unit: '85x55 mm' },
  { id: 'invitation', category: 'Tarjetas & Papelería', name: 'Invitación de Evento', width: 400, height: 600, unit: '100x150 mm' },
  { id: 'tag-sq', category: 'Tarjetas & Papelería', name: 'Etiqueta Cuadrada 60x60', width: 400, height: 400, unit: '60x60 mm' },
  { id: 'tag-sm', category: 'Tarjetas & Papelería', name: 'Etiqueta Pequeña 50x50', width: 330, height: 330, unit: '50x50 mm' },
  { id: 'bookmark', category: 'Tarjetas & Papelería', name: 'Separador / Marcapáginas', width: 300, height: 1080, unit: '50x180 mm' },

  // --- IMPRESIÓN ESTÁNDAR ---
  { id: 'a3', category: 'Impresión Estándar', name: 'Hoja A3', width: 840, height: 1188, unit: '297x420 mm' },
  { id: 'a4', category: 'Impresión Estándar', name: 'Hoja A4', width: 595, height: 842, unit: '210x297 mm' },
  { id: 'a5', category: 'Impresión Estándar', name: 'Hoja A5', width: 420, height: 595, unit: '148x210 mm' },
  { id: 'b5', category: 'Impresión Estándar', name: 'Hoja B5', width: 500, height: 708, unit: '176x250 mm' },
  { id: 'letter', category: 'Impresión Estándar', name: 'Tamaño Carta (Letter)', width: 612, height: 792, unit: '216x279 mm' },
  { id: 'legal', category: 'Impresión Estándar', name: 'Tamaño Oficio (Legal)', width: 612, height: 1008, unit: '216x356 mm' }
];

// Definición de las 6 herramientas de creación (barra de pestañas desktop / barra de íconos mobile)
const TAB_DEFS = [
  { id: 'canvas', label: 'Lienzo', icon: Sliders },
  { id: 'text', label: 'Texto', icon: Type },
  { id: 'emojis', label: 'Emojis', icon: Smile },
  { id: 'draw', label: 'Pincel', icon: Brush },
  { id: 'shapes', label: 'Formas', icon: Square },
  { id: 'image', label: 'Imagen', icon: ImageIcon }
];

// 12 Formas geométricas y decorativas para recorte de imágenes
export const SHAPE_CROP_TYPES = [
  { id: 'none', label: 'Original', icon: '🖼️' },
  { id: 'rect', label: 'Cuadrado', icon: '⬜' },
  { id: 'rounded', label: 'Redondeado', icon: '🔲' },
  { id: 'circle', label: 'Círculo / Óvalo', icon: '⚪' },
  { id: 'star', label: 'Estrella', icon: '⭐' },
  { id: 'heart', label: 'Corazón', icon: '❤️' },
  { id: 'hexagon', label: 'Hexágono', icon: '🛑' },
  { id: 'octagon', label: 'Octágono', icon: '☸️' },
  { id: 'diamond', label: 'Diamante', icon: '🔷' },
  { id: 'shield', label: 'Escudo', icon: '🛡️' },
  { id: 'badge', label: 'Insignia', icon: '🏷️' },
  { id: 'triangle', label: 'Triángulo', icon: '🔺' }
];

// Presets de Degradados para Lienzo
export const GRADIENT_PRESETS = [
  { name: 'Cyberpunk', colors: ['#0f0c29', '#302b63', '#24243e'], angle: 135 },
  { name: 'Sunset Gold', colors: ['#ff7e5f', '#feb47b'], angle: 45 },
  { name: 'Neon Emerald', colors: ['#00b09b', '#96c93d'], angle: 90 },
  { name: 'Pastel Dream', colors: ['#a1c4fd', '#c2e9fb'], angle: 120 },
  { name: 'Royal Velvet', colors: ['#141e30', '#243b55'], angle: 180 },
  { name: 'Kalpa Slate', colors: ['#111114', '#1f2421', '#0b1612'], angle: 135 }
];

// Función de trazado para recortes con forma, rotación y deformación
function drawCustomClipShape(ctx, width, height, clipShape, clipRotation = 0, clipScaleX = 1, clipScaleY = 1) {
  if (!clipShape || clipShape === 'none') {
    ctx.rect(0, 0, width, height);
    return;
  }

  const cx = width / 2;
  const cy = height / 2;

  ctx.translate(cx, cy);
  ctx.rotate((clipRotation * Math.PI) / 180);
  ctx.scale(clipScaleX, clipScaleY);
  ctx.translate(-cx, -cy);

  ctx.beginPath();

  const rx = width / 2;
  const ry = height / 2;

  switch (clipShape) {
    case 'rect': {
      ctx.rect(0, 0, width, height);
      break;
    }
    case 'rounded': {
      const r = Math.min(width, height) * 0.18;
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(0, 0, width, height, r);
      } else {
        ctx.rect(0, 0, width, height);
      }
      break;
    }
    case 'circle': {
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      break;
    }
    case 'star': {
      const spikes = 5;
      const outerR = Math.min(rx, ry);
      const innerR = outerR * 0.45;
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.moveTo(cx, cy - outerR);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerR;
        y = cy + Math.sin(rot) * outerR;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerR;
        y = cy + Math.sin(rot) * innerR;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerR);
      ctx.closePath();
      break;
    }
    case 'heart': {
      ctx.moveTo(cx, height * 0.85);
      ctx.bezierCurveTo(cx - width * 0.55, height * 0.45, cx - width * 0.45, 0, cx, height * 0.3);
      ctx.bezierCurveTo(cx + width * 0.45, 0, cx + width * 0.55, height * 0.45, cx, height * 0.85);
      ctx.closePath();
      break;
    }
    case 'hexagon': {
      const r = Math.min(rx, ry);
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
    }
    case 'octagon': {
      const r = Math.min(rx, ry);
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4 + Math.PI / 8;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
    }
    case 'diamond': {
      ctx.moveTo(cx, 0);
      ctx.lineTo(width, cy);
      ctx.lineTo(cx, height);
      ctx.lineTo(0, cy);
      ctx.closePath();
      break;
    }
    case 'shield': {
      ctx.moveTo(cx, 0);
      ctx.lineTo(width, 0);
      ctx.quadraticCurveTo(width, height * 0.65, cx, height);
      ctx.quadraticCurveTo(0, height * 0.65, 0, 0);
      ctx.closePath();
      break;
    }
    case 'badge': {
      ctx.moveTo(cx, 0);
      ctx.quadraticCurveTo(width, 0, width, cy);
      ctx.quadraticCurveTo(width, height, cx, height);
      ctx.quadraticCurveTo(0, height, 0, cy);
      ctx.quadraticCurveTo(0, 0, cx, 0);
      ctx.closePath();
      break;
    }
    case 'triangle': {
      ctx.moveTo(cx, 0);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      break;
    }
    default: {
      ctx.rect(0, 0, width, height);
      break;
    }
  }
}

// Generador de texturas/patrones en canvas con soporte para inclinación, escala, espaciado e imagen propia
function createTexturePatternUrl({
  patternType = 'grid',
  bgColor = '#111114',
  patternColor = '#BAFDC1',
  patternAngle = 0,
  patternScale = 1,
  patternSpacing = 35,
  customImgSrc = null
}, callback) {
  const tileSize = Math.max(16, Math.round(patternSpacing * patternScale));
  const c = document.createElement('canvas');
  c.width = tileSize;
  c.height = tileSize;
  const ctx = c.getContext('2d');

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, tileSize, tileSize);

  const cx = tileSize / 2;
  const cy = tileSize / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((patternAngle * Math.PI) / 180);
  ctx.translate(-cx, -cy);

  if (customImgSrc) {
    const img = new window.Image();
    if (!customImgSrc.startsWith('data:') && !customImgSrc.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      ctx.drawImage(img, cx - (tileSize * 0.35), cy - (tileSize * 0.35), tileSize * 0.7, tileSize * 0.7);
      ctx.restore();
      if (callback) callback(c.toDataURL('image/png'));
    };
    img.onerror = () => {
      ctx.restore();
      if (callback) callback(c.toDataURL('image/png'));
    };
    img.src = customImgSrc;
    return;
  }

  ctx.fillStyle = patternColor;
  ctx.strokeStyle = patternColor;
  ctx.lineWidth = Math.max(1, 1.5 * patternScale);

  if (patternType === 'grid') {
    ctx.globalAlpha = 0.3;
    ctx.strokeRect(0, 0, tileSize, tileSize);
  } else if (patternType === 'dots') {
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(1.5, 3 * patternScale), 0, Math.PI * 2);
    ctx.fill();
  } else if (patternType === 'stripes') {
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(0, tileSize);
    ctx.lineTo(tileSize, 0);
    ctx.stroke();
  } else if (patternType === 'noise') {
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 80; i++) {
      const rx = Math.random() * tileSize;
      const ry = Math.random() * tileSize;
      ctx.fillRect(rx, ry, 1.5 * patternScale, 1.5 * patternScale);
    }
  } else if (patternType === 'paper') {
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < tileSize; i += Math.max(4, Math.round(8 * patternScale))) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(tileSize, i); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, tileSize); ctx.stroke();
    }
  }
  ctx.restore();
  if (callback) callback(c.toDataURL('image/png'));
}

// Helper de Forma Konva con soporte para relleno sólido, degradados y texturas
function ShapeElement({ el, isDrawingMode, setSelectedId, handleDragMove, handleDragEnd, updateSelected }) {
  const [fillPatternImg, setFillPatternImg] = useState(null);

  useEffect(() => {
    if (el.fillType === 'gradient') {
      const canvas = document.createElement('canvas');
      const w = Math.max(20, Math.round(el.width || (el.radius ? el.radius * 2 : 100)));
      const h = Math.max(20, Math.round(el.height || (el.radius ? el.radius * 2 : 100)));
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      const c1 = el.gradColor1 || '#111114';
      const c2 = el.gradColor2 || '#BAFDC1';
      const angle = el.gradAngle || 45;
      const style = el.gradStyle || 'smooth';
      const stop = el.gradStop || 50;

      let grad;
      if (style === 'radial') {
        grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h)/2);
        grad.addColorStop(0, c1);
        grad.addColorStop(1, c2);
      } else if (style === 'sharp') {
        const rad = (angle * Math.PI) / 180;
        const x2 = w/2 + Math.cos(rad) * w/2;
        const y2 = h/2 + Math.sin(rad) * h/2;
        grad = ctx.createLinearGradient(0, 0, x2, y2);
        grad.addColorStop(0, c1);
        grad.addColorStop(stop / 100, c1);
        grad.addColorStop(stop / 100, c2);
        grad.addColorStop(1, c2);
      } else {
        const rad = (angle * Math.PI) / 180;
        const x2 = w/2 + Math.cos(rad) * w/2;
        const y2 = h/2 + Math.sin(rad) * h/2;
        grad = ctx.createLinearGradient(0, 0, x2, y2);
        grad.addColorStop(0, c1);
        grad.addColorStop(1, c2);
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      setFillPatternImg(canvas);
    } else if (el.fillType === 'texture') {
      createTexturePatternUrl({
        patternType: el.patternType || 'grid',
        bgColor: el.fill || '#111114',
        patternColor: el.patternColor || '#BAFDC1',
        patternAngle: el.patternAngle || 0,
        patternScale: el.patternScale || 1,
        patternSpacing: el.patternSpacing || 35,
        customImgSrc: el.customImgSrc || null
      }, (dataUrl) => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => setFillPatternImg(img);
        img.src = dataUrl;
      });
    } else {
      setFillPatternImg(null);
    }
  }, [
    el.fillType, el.fill, el.gradColor1, el.gradColor2, el.gradAngle, el.gradStyle, el.gradStop,
    el.patternType, el.patternColor, el.patternAngle, el.patternScale, el.patternSpacing, el.customImgSrc,
    el.width, el.height, el.radius
  ]);

  const { fillType, gradColor1, gradColor2, gradAngle, gradStyle, gradStop, patternType, patternColor, patternAngle, patternScale, patternSpacing, customImgSrc, ...cleanProps } = el;

  const commonProps = {
    key: el.id,
    id: el.id,
    ...cleanProps,
    fill: fillType && fillType !== 'color' ? undefined : el.fill,
    fillPriority: fillPatternImg ? 'pattern' : 'color',
    fillPatternImage: fillPatternImg || undefined,
    draggable: !isDrawingMode,
    onClick: () => !isDrawingMode && setSelectedId(el.id),
    onTap: () => !isDrawingMode && setSelectedId(el.id),
    onDragMove: (e) => handleDragMove(e, el.id),
    onDragEnd: (e) => { handleDragEnd(); updateSelected('x', e.target.x()); updateSelected('y', e.target.y()); }
  };

  if (el.type === 'rect') return <Rect {...commonProps} />;
  if (el.type === 'circle') return <Circle {...commonProps} />;
  if (el.type === 'star') return <Star {...commonProps} />;
  return null;
}

// Helper de Imagen Konva con filtros no-destructivos y recorte por forma
function URLImage({ image, ...props }) {
  const [imgObj, setImgObj] = useState(null);
  const shapeRef = useRef(null);

  useEffect(() => {
    if (!image.src) return;
    const img = new window.Image();
    if (!image.src.startsWith('data:') && !image.src.startsWith('blob:')) {
      img.crossOrigin = 'Anonymous';
    }
    img.src = image.src;
    img.onload = () => setImgObj(img);
  }, [image.src]);

  useEffect(() => {
    if (!shapeRef.current) return;
    try {
      shapeRef.current.clearCache();
      const hasFilter = props.brightness || props.contrast || props.saturation || props.blurRadius;
      if (hasFilter) {
        shapeRef.current.cache({ pixelRatio: 2.5 });
      }
      shapeRef.current.getLayer()?.batchDraw();
    } catch (e) {
      shapeRef.current.getLayer()?.batchDraw();
    }
  }, [
    imgObj,
    props.brightness,
    props.contrast,
    props.saturation,
    props.blurRadius,
    props.clipShape,
    props.clipRotation,
    props.clipScaleX,
    props.clipScaleY
  ]);

  if (!imgObj) return null;

  const { clipShape, clipRotation, clipScaleX, clipScaleY, ...restProps } = props;
  const hasFilter = props.brightness || props.contrast || props.saturation || props.blurRadius;

  return (
    <KonvaImage
      ref={shapeRef}
      image={imgObj}
      filters={hasFilter ? [Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.HSL, Konva.Filters.Blur] : []}
      clipFunc={
        clipShape && clipShape !== 'none'
          ? (ctx) => drawCustomClipShape(ctx, props.width, props.height, clipShape, clipRotation || 0, clipScaleX || 1, clipScaleY || 1)
          : undefined
      }
      {...restProps}
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
  const [activeTab, setActiveTab] = useState('canvas'); // Default tab: 'canvas' | 'text' | 'emojis' | 'draw' | 'shapes' | 'image'
  const [retouchModalOpen, setRetouchModalOpen] = useState(false);
  const [imagePropSubTab, setImagePropSubTab] = useState('filters'); // 'filters' | 'crop' | 'ai'
  const [canvasBgMode, setCanvasBgMode] = useState('color'); // 'color' | 'gradient' | 'texture'
  const [patternType, setPatternType] = useState('grid');
  const [patternColor, setPatternColor] = useState('#BAFDC1');
  const [patternAngle, setPatternAngle] = useState(0);
  const [patternScale, setPatternScale] = useState(1);
  const [patternSpacing, setPatternSpacing] = useState(35);
  const [customImgSrc, setCustomImgSrc] = useState(null);
  const [presetCategory, setPresetCategory] = useState('Redes Sociales');
  const [impSheetFormat, setImpSheetFormat] = useState('a4');
  const [impOrientation, setImpOrientation] = useState('portrait');
  const [gradColor1, setGradColor1] = useState('#111114');
  const [gradColor2, setGradColor2] = useState('#302b63');
  const [gradAngle, setGradAngle] = useState(135);
  const [gradStop, setGradStop] = useState(50);
  const [gradStyle, setGradStyle] = useState('smooth'); // 'smooth' | 'sharp' | 'radial'
  const [bgImageObj, setBgImageObj] = useState(null);

  // Renderizar fondo CSS (sólido, degradado a la mitad, radial o textura) a objeto canvas Konva
  useEffect(() => {
    let active = true;
    const canvas = document.createElement('canvas');
    canvas.width = preset.width;
    canvas.height = preset.height;
    const ctx = canvas.getContext('2d');

    if (!bgColor) {
      ctx.fillStyle = '#111114';
      ctx.fillRect(0, 0, preset.width, preset.height);
      setBgImageObj(canvas);
      return;
    }

    if (bgColor.startsWith('#') || bgColor.startsWith('rgb')) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, preset.width, preset.height);
      setBgImageObj(canvas);
    } else if (bgColor.startsWith('data:image')) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (!active) return;
        const pattern = ctx.createPattern(img, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, preset.width, preset.height);
        setBgImageObj(canvas);
      };
      img.src = bgColor;
    } else {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${preset.width}" height="${preset.height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;background:${bgColor.replace(/"/g, "'")};"></div></foreignObject></svg>`;
      const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (!active) return;
        ctx.drawImage(img, 0, 0);
        setBgImageObj(canvas);
      };
      img.onerror = () => {
        if (!active) return;
        ctx.fillStyle = '#111114';
        ctx.fillRect(0, 0, preset.width, preset.height);
        setBgImageObj(canvas);
      };
      img.src = svgUrl;
    }
    return () => { active = false; };
  }, [bgColor, preset.width, preset.height]);

  // Modo Dibujo Libre Pincel
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [brushColor, setBrushColor] = useState('#BAFDC1');
  const [brushSize, setBrushSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);

  // Guías de Alineación / Snapping
  const [alignGuides, setAlignGuides] = useState({ showX: false, showY: false });

  // --- Layout Responsive Mobile (pantalla completa + barra de íconos + bandeja inferior) ---
  const [isMobile, setIsMobile] = useState(false);
  const [mobileFullscreen, setMobileFullscreen] = useState(false);
  const [mobileToolOpen, setMobileToolOpen] = useState(false);
  const [mobilePropsOpen, setMobilePropsOpen] = useState(false);
  const [mobileStageScale, setMobileStageScale] = useState(1);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 860);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Calcula el factor de escala del lienzo en modo mobile pantalla completa,
  // para que el Stage de Konva (que mantiene sus coordenadas originales) entre
  // en la pantalla del celular sin distorsionar el resultado exportado.
  useEffect(() => {
    if (!isMobile || !mobileFullscreen) { setMobileStageScale(1); return; }
    const compute = () => {
      const availW = window.innerWidth - 24;
      const reservedH = 46 + 58 + (mobileToolOpen ? window.innerHeight * 0.42 : 0) + 24;
      const availH = Math.max(140, window.innerHeight - reservedH);
      const scale = Math.min(1, availW / preset.width, availH / preset.height);
      setMobileStageScale(scale > 0 ? scale : 0.3);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [isMobile, mobileFullscreen, mobileToolOpen, preset]);

  const displayScale = (isMobile && mobileFullscreen) ? mobileStageScale : 1;

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
    if (isMobile) { setMobileToolOpen(false); setMobilePropsOpen(true); }
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
    if (isMobile) { setMobileToolOpen(false); setMobilePropsOpen(true); }
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
    if (isMobile) { setMobileToolOpen(false); setMobilePropsOpen(true); }
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
    if (isMobile) { setMobileToolOpen(false); setMobilePropsOpen(true); }
  };

  // Carga de Imagen HD sin distorsión y auto-conversión a PNG
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    saveStateToHistory();

    const reader = new FileReader();
    reader.onload = (event) => {
      const tempImg = new window.Image();
      tempImg.crossOrigin = 'anonymous';
      tempImg.onload = () => {
        const convCanvas = document.createElement('canvas');
        const nw = tempImg.naturalWidth || tempImg.width || 400;
        const nh = tempImg.naturalHeight || tempImg.height || 400;
        convCanvas.width = nw;
        convCanvas.height = nh;
        const convCtx = convCanvas.getContext('2d');
        convCtx.drawImage(tempImg, 0, 0);
        const pngUrl = convCanvas.toDataURL('image/png', 1.0);

        const maxInitial = Math.min(preset.width * 0.65, preset.height * 0.65);
        const scale = Math.min(1, maxInitial / Math.max(nw, nh));
        const initW = Math.round(nw * scale);
        const initH = Math.round(nh * scale);

        const newEl = {
          id: 'img-' + Date.now(),
          type: 'image',
          src: pngUrl,
          x: Math.round(preset.width / 2 - initW / 2),
          y: Math.round(preset.height / 2 - initH / 2),
          width: initW,
          height: initH,
          brightness: 0,
          contrast: 0,
          saturation: 0,
          blurRadius: 0,
          opacity: 1,
          rotation: 0,
          clipShape: 'none',
          clipRotation: 0,
          clipScaleX: 1,
          clipScaleY: 1
        };
        setElements((prev) => [...prev, newEl]);
        setSelectedId(newEl.id);
        if (isMobile) { setMobileToolOpen(false); setMobilePropsOpen(true); }
      };
      tempImg.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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
    setMobilePropsOpen(false);
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
    const pos = e.target.getStage().getRelativePointerPosition();
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
    const point = stage.getRelativePointerPosition();
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

  // Exportar a Imagen PNG HD (300 DPI) — siempre a resolución completa,
  // independientemente de la escala visual usada en mobile.
  const exportPNG = () => {
    if (!stageRef.current) return;
    setSelectedId(null);
    setTimeout(() => {
      const stage = stageRef.current;
      const prevW = stage.width(), prevH = stage.height();
      const prevScale = stage.scale();
      stage.width(preset.width);
      stage.height(preset.height);
      stage.scale({ x: 1, y: 1 });
      stage.batchDraw();
      const dataURL = stage.toDataURL({ pixelRatio: 3 });
      stage.width(prevW);
      stage.height(prevH);
      stage.scale(prevScale);
      stage.batchDraw();

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
      const stage = stageRef.current;
      const prevW = stage.width(), prevH = stage.height();
      const prevScale = stage.scale();
      stage.width(preset.width);
      stage.height(preset.height);
      stage.scale({ x: 1, y: 1 });
      stage.batchDraw();
      const dataURL = stage.toDataURL({ pixelRatio: 3 });
      stage.width(prevW);
      stage.height(prevH);
      stage.scale(prevScale);
      stage.batchDraw();

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

  // Generador de PDF Mosaico Dúplex A4/A3 con Sangrado y marcas de corte
  const exportImpositionPDF = async () => {
    try {
      if (!stageRef.current) return;
      setSelectedId(null);

      await new Promise((res) => setTimeout(res, 100));

      const stage = stageRef.current;
      const prevW = stage.width(), prevH = stage.height();
      const prevScale = stage.scale();

      stage.width(preset.width);
      stage.height(preset.height);
      stage.scale({ x: 1, y: 1 });
      stage.batchDraw();

      const dataURL = stage.toDataURL({ pixelRatio: 3 });

      stage.width(prevW);
      stage.height(prevH);
      stage.scale(prevScale);
      stage.batchDraw();

      let sheetW = impSheetFormat === 'a3' ? 297 : 210;
      let sheetH = impSheetFormat === 'a3' ? 420 : 297;

      if (impOrientation === 'landscape') {
        const tmp = sheetW;
        sheetW = sheetH;
        sheetH = tmp;
      }

      let cardW = preset.width / 4;
      let cardH = preset.height / 4;
      if (preset.unit && preset.unit.includes('mm')) {
        const parts = preset.unit.replace(' mm', '').split('x');
        if (parts.length === 2) {
          cardW = parseFloat(parts[0]);
          cardH = parseFloat(parts[1]);
        }
      }

      const bleed = 3.5; // 3.5mm bleed
      const cellW = cardW + bleed * 2;
      const cellH = cardH + bleed * 2;

      const colsNormal = Math.max(1, Math.floor((sheetW - 10) / cellW));
      const rowsNormal = Math.max(1, Math.floor((sheetH - 10) / cellH));

      const colsRotated = Math.max(1, Math.floor((sheetW - 10) / cellH));
      const rowsRotated = Math.max(1, Math.floor((sheetH - 10) / cellW));

      const yieldNormal = colsNormal * rowsNormal;
      const yieldRotated = colsRotated * rowsRotated;

      const useRotated = yieldRotated > yieldNormal;
      const cols = useRotated ? colsRotated : colsNormal;
      const rows = useRotated ? rowsRotated : rowsNormal;

      const gridWidth = cols * cellW;
      const gridHeight = rows * cellH;
      const offsetX = (sheetW - gridWidth) / 2;
      const offsetY = (sheetH - gridHeight) / 2;

      const pdf = new jsPDF({
        orientation: sheetW > sheetH ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [sheetW, sheetH]
      });

      // PÁGINA 1: ANVERSO + MARCAS DE CORTE
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * cellW;
          const y = offsetY + r * cellH;

          pdf.addImage(dataURL, 'PNG', x, y, cellW, cellH);

          pdf.setDrawColor(0, 0, 0);
          pdf.setLineWidth(0.15);

          const trimX1 = x + bleed;
          const trimX2 = x + cellW - bleed;
          const trimY1 = y + bleed;
          const trimY2 = y + cellH - bleed;

          const k = 2;
          const l = 4;

          pdf.line(trimX1 - k - l, trimY1, trimX1 - k, trimY1);
          pdf.line(trimX1, trimY1 - k - l, trimX1, trimY1 - k);

          pdf.line(trimX2 + k, trimY1, trimX2 + k + l, trimY1);
          pdf.line(trimX2, trimY1 - k - l, trimX2, trimY1 - k);

          pdf.line(trimX1 - k - l, trimY2, trimX1 - k, trimY2);
          pdf.line(trimX1, trimY2 + k, trimX1, trimY2 + k + l);

          pdf.line(trimX2 + k, trimY2, trimX2 + k + l, trimY2);
          pdf.line(trimX2, trimY2 + k, trimX2, trimY2 + k + l);
        }
      }

      // PÁGINA 2: REVERSO (DORSO ESPEJADO LONG-EDGE FLIP)
      pdf.addPage([sheetW, sheetH], sheetW > sheetH ? 'landscape' : 'portrait');

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const frontX = offsetX + c * cellW;
          const backX = sheetW - frontX - cellW;
          const backY = offsetY + r * cellH;

          pdf.addImage(dataURL, 'PNG', backX, backY, cellW, cellH);
        }
      }

      pdf.save(`Mosaico_${impSheetFormat.toUpperCase()}_Duplex_${preset.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error al generar PDF de Imposición:', err);
      alert('Hubo un problema al generar el PDF impositado. Intenta nuevamente.');
    }
  };

  const selectedElement = elements.find((el) => el.id === selectedId);

  // ---------------------------------------------------------------------
  // Contenido de la pestaña de herramientas activa — se reutiliza tal cual
  // en el panel fijo de desktop y en el panel desplegable de mobile.
  // ---------------------------------------------------------------------
  const renderActiveTabContent = () => (
    <>
      {activeTab === 'canvas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Bloque 1: Dimensiones de Lienzo Categorizadas & Orientación */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', backgroundColor: 'var(--bg-surface-2)', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>
                📏 Formato & Orientación
              </span>

              {/* Botón Conmutador Vertical / Horizontal */}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setPreset(prev => ({
                    ...prev,
                    width: prev.height,
                    height: prev.width
                  }));
                }}
                style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem', gap: '0.3rem' }}
                title="Invertir Ancho y Alto"
              >
                <span>{preset.width > preset.height ? '↔️ Horizontal' : '↕️ Vertical'}</span>
              </button>
            </div>

            {/* Categorías de Presets */}
            <div style={{ display: 'flex', gap: '0.3rem', backgroundColor: 'var(--bg-surface)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
              {['Redes Sociales', 'Tarjetas & Papelería', 'Impresión Estándar'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setPresetCategory(cat)}
                  style={{
                    flex: 1, padding: '0.3rem 0.1rem', fontSize: '0.65rem', fontWeight: 600, borderRadius: 'var(--radius-sm)',
                    backgroundColor: presetCategory === cat ? 'var(--accent)' : 'transparent',
                    color: presetCategory === cat ? '#000' : 'var(--text-secondary)', border: 'none', cursor: 'pointer'
                  }}
                >
                  {cat === 'Redes Sociales' ? '📱 Redes' : cat === 'Tarjetas & Papelería' ? '🏷️ Tarjetas' : '📄 Hojas'}
                </button>
              ))}
            </div>

            {/* Lista Grid de Presets Filtrados por Categoría */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '2px' }}>
              {PRESETS.filter(p => p.category === presetCategory).map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { setPreset(p); setSelectedId(null); }}
                  style={{
                    padding: '0.45rem 0.4rem', borderRadius: 'var(--radius-sm)',
                    border: `1.5px solid ${preset.id === p.id ? 'var(--accent)' : 'var(--border-subtle)'}`,
                    backgroundColor: preset.id === p.id ? 'var(--accent-muted)' : 'var(--bg-surface)',
                    color: preset.id === p.id ? 'var(--accent)' : 'var(--text-primary)',
                    cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.1rem'
                  }}
                >
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, lineHeight: 1.1 }}>{p.name}</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>{p.unit}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bloque 2: Fondo del Lienzo (Color Sólido, Textura, Degradado) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <h4 style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>
              🎨 Fondo del Lienzo
            </h4>

            {/* Selector Modo Fondo */}
            <div style={{ display: 'flex', gap: '0.3rem', backgroundColor: 'var(--bg-surface-2)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
              <button
                type="button"
                onClick={() => setCanvasBgMode('color')}
                style={{
                  flex: 1, padding: '0.35rem 0.2rem', fontSize: '0.7rem', fontWeight: 700, borderRadius: 'var(--radius-sm)',
                  backgroundColor: canvasBgMode === 'color' ? 'var(--accent)' : 'transparent',
                  color: canvasBgMode === 'color' ? '#000' : 'var(--text-secondary)', border: 'none', cursor: 'pointer'
                }}
              >
                🎨 Sólido
              </button>
              <button
                type="button"
                onClick={() => setCanvasBgMode('texture')}
                style={{
                  flex: 1, padding: '0.35rem 0.2rem', fontSize: '0.7rem', fontWeight: 700, borderRadius: 'var(--radius-sm)',
                  backgroundColor: canvasBgMode === 'texture' ? 'var(--accent)' : 'transparent',
                  color: canvasBgMode === 'texture' ? '#000' : 'var(--text-secondary)', border: 'none', cursor: 'pointer'
                }}
              >
                🏁 Textura
              </button>
              <button
                type="button"
                onClick={() => setCanvasBgMode('gradient')}
                style={{
                  flex: 1, padding: '0.35rem 0.2rem', fontSize: '0.7rem', fontWeight: 700, borderRadius: 'var(--radius-sm)',
                  backgroundColor: canvasBgMode === 'gradient' ? 'var(--accent)' : 'transparent',
                  color: canvasBgMode === 'gradient' ? '#000' : 'var(--text-secondary)', border: 'none', cursor: 'pointer'
                }}
              >
                🌈 Degradado
              </button>
            </div>

            {/* Color Sólido */}
            {canvasBgMode === 'color' && (
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Color Sólido de Fondo:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <input
                    type="color"
                    value={typeof bgColor === 'string' && bgColor.startsWith('#') ? bgColor : '#111114'}
                    onChange={(e) => setBgColor(e.target.value)}
                    style={{ width: '45px', height: '36px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }} className="font-mono">{typeof bgColor === 'string' && bgColor.startsWith('#') ? bgColor : 'Textura/Degradado'}</span>
                </div>
              </div>
            )}

            {/* Textura con Inclinación, Escala, Espaciado e Imagen Propia */}
            {canvasBgMode === 'texture' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {/* Botón para subir PNG propio */}
                <label className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                  <Upload size={14} />
                  <span>Subir Ícono / Imagen propia para Trama</span>
                  <input
                    type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const url = ev.target.result;
                        setCustomImgSrc(url);
                        createTexturePatternUrl({
                          patternType, bgColor: typeof bgColor === 'string' && bgColor.startsWith('#') ? bgColor : '#111114',
                          patternColor, patternAngle, patternScale, patternSpacing, customImgSrc: url
                        }, (dataUrl) => setBgColor(dataUrl));
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                  {[
                    { id: 'grid', label: 'Cuadrícula', icon: '📐' },
                    { id: 'dots', label: 'Puntos', icon: '⚪' },
                    { id: 'stripes', label: 'Franjas', icon: '📊' },
                    { id: 'noise', label: 'Ruido HD', icon: '📺' },
                    { id: 'paper', label: 'Lino/Papel', icon: '📜' }
                  ].map((pat) => (
                    <button
                      key={pat.id}
                      type="button"
                      onClick={() => {
                        setPatternType(pat.id);
                        setCustomImgSrc(null);
                        createTexturePatternUrl({
                          patternType: pat.id, bgColor: typeof bgColor === 'string' && bgColor.startsWith('#') ? bgColor : '#111114',
                          patternColor, patternAngle, patternScale, patternSpacing, customImgSrc: null
                        }, (dataUrl) => setBgColor(dataUrl));
                      }}
                      style={{
                        padding: '0.5rem 0.3rem', borderRadius: 'var(--radius-sm)',
                        border: `1.5px solid ${patternType === pat.id && !customImgSrc ? 'var(--accent)' : 'var(--border-subtle)'}`,
                        backgroundColor: patternType === pat.id && !customImgSrc ? 'var(--accent-muted)' : 'var(--bg-surface-2)',
                        color: patternType === pat.id && !customImgSrc ? 'var(--accent)' : 'var(--text-primary)',
                        cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem'
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>{pat.icon}</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 600 }}>{pat.label}</span>
                    </button>
                  ))}
                </div>

                {/* Sliders de Inclinación, Escala y Espaciado */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', backgroundColor: 'var(--bg-surface-2)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      <span>Inclinación de Trama:</span>
                      <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{patternAngle}°</span>
                    </div>
                    <input
                      type="range" min={0} max={360} step={5}
                      value={patternAngle}
                      onChange={(e) => {
                        const ang = Number(e.target.value);
                        setPatternAngle(ang);
                        createTexturePatternUrl({
                          patternType, bgColor: typeof bgColor === 'string' && bgColor.startsWith('#') ? bgColor : '#111114',
                          patternColor, patternAngle: ang, patternScale, patternSpacing, customImgSrc
                        }, (dataUrl) => setBgColor(dataUrl));
                      }}
                      style={{ width: '100%', accentColor: 'var(--accent)' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      <span>Escala / Tamaño de Trama:</span>
                      <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{patternScale.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range" min={0.3} max={3.0} step={0.1}
                      value={patternScale}
                      onChange={(e) => {
                        const sc = Number(e.target.value);
                        setPatternScale(sc);
                        createTexturePatternUrl({
                          patternType, bgColor: typeof bgColor === 'string' && bgColor.startsWith('#') ? bgColor : '#111114',
                          patternColor, patternAngle, patternScale: sc, patternSpacing, customImgSrc
                        }, (dataUrl) => setBgColor(dataUrl));
                      }}
                      style={{ width: '100%', accentColor: 'var(--accent)' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      <span>Espaciado / Separación:</span>
                      <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{patternSpacing}px</span>
                    </div>
                    <input
                      type="range" min={15} max={120} step={5}
                      value={patternSpacing}
                      onChange={(e) => {
                        const sp = Number(e.target.value);
                        setPatternSpacing(sp);
                        createTexturePatternUrl({
                          patternType, bgColor: typeof bgColor === 'string' && bgColor.startsWith('#') ? bgColor : '#111114',
                          patternColor, patternAngle, patternScale, patternSpacing: sp, customImgSrc
                        }, (dataUrl) => setBgColor(dataUrl));
                      }}
                      style={{ width: '100%', accentColor: 'var(--accent)' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Color de Trama:</label>
                    <input
                      type="color"
                      value={patternColor}
                      onChange={(e) => {
                        setPatternColor(e.target.value);
                        createTexturePatternUrl({
                          patternType, bgColor: typeof bgColor === 'string' && bgColor.startsWith('#') ? bgColor : '#111114',
                          patternColor: e.target.value, patternAngle, patternScale, patternSpacing, customImgSrc
                        }, (dataUrl) => setBgColor(dataUrl));
                      }}
                      style={{ width: '100%', height: '30px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Degradados */}
            {canvasBgMode === 'gradient' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700 }}>
                  Generador Personalizado (Mitad / 2 Colores / Ángulo):
                </span>

                {/* Modo de Mezcla / Transición */}
                <div style={{ display: 'flex', gap: '0.3rem', backgroundColor: 'var(--bg-surface-2)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setGradStyle('smooth');
                      const css = `linear-gradient(${gradAngle}deg, ${gradColor1} 0%, ${gradColor2} 100%)`;
                      setBgColor(css);
                    }}
                    style={{
                      flex: 1, padding: '0.3rem 0.1rem', fontSize: '0.68rem', fontWeight: 600, borderRadius: 'var(--radius-sm)',
                      backgroundColor: gradStyle === 'smooth' ? 'var(--accent)' : 'transparent',
                      color: gradStyle === 'smooth' ? '#000' : 'var(--text-secondary)', border: 'none', cursor: 'pointer'
                    }}
                  >
                    🌊 Suave
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGradStyle('sharp');
                      const css = `linear-gradient(${gradAngle}deg, ${gradColor1} 0% ${gradStop}%, ${gradColor2} ${gradStop}% 100%)`;
                      setBgColor(css);
                    }}
                    style={{
                      flex: 1, padding: '0.3rem 0.1rem', fontSize: '0.68rem', fontWeight: 600, borderRadius: 'var(--radius-sm)',
                      backgroundColor: gradStyle === 'sharp' ? 'var(--accent)' : 'transparent',
                      color: gradStyle === 'sharp' ? '#000' : 'var(--text-secondary)', border: 'none', cursor: 'pointer'
                    }}
                  >
                    ✂️ Mitad 50/50
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGradStyle('radial');
                      const css = `radial-gradient(circle at center, ${gradColor1} 0%, ${gradColor2} 100%)`;
                      setBgColor(css);
                    }}
                    style={{
                      flex: 1, padding: '0.3rem 0.1rem', fontSize: '0.68rem', fontWeight: 600, borderRadius: 'var(--radius-sm)',
                      backgroundColor: gradStyle === 'radial' ? 'var(--accent)' : 'transparent',
                      color: gradStyle === 'radial' ? '#000' : 'var(--text-secondary)', border: 'none', cursor: 'pointer'
                    }}
                  >
                    🎯 Radial
                  </button>
                </div>

                {/* Selector de los 2 Colores */}
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Color 1 (Mitad 1):</label>
                    <input
                      type="color"
                      value={gradColor1}
                      onChange={(e) => {
                        setGradColor1(e.target.value);
                        const c1 = e.target.value;
                        const css = gradStyle === 'sharp'
                          ? `linear-gradient(${gradAngle}deg, ${c1} 0% ${gradStop}%, ${gradColor2} ${gradStop}% 100%)`
                          : gradStyle === 'radial'
                          ? `radial-gradient(circle at center, ${c1} 0%, ${gradColor2} 100%)`
                          : `linear-gradient(${gradAngle}deg, ${c1} 0%, ${gradColor2} 100%)`;
                        setBgColor(css);
                      }}
                      style={{ width: '100%', height: '34px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Color 2 (Mitad 2):</label>
                    <input
                      type="color"
                      value={gradColor2}
                      onChange={(e) => {
                        setGradColor2(e.target.value);
                        const c2 = e.target.value;
                        const css = gradStyle === 'sharp'
                          ? `linear-gradient(${gradAngle}deg, ${gradColor1} 0% ${gradStop}%, ${c2} ${gradStop}% 100%)`
                          : gradStyle === 'radial'
                          ? `radial-gradient(circle at center, ${gradColor1} 0%, ${c2} 100%)`
                          : `linear-gradient(${gradAngle}deg, ${gradColor1} 0%, ${c2} 100%)`;
                        setBgColor(css);
                      }}
                      style={{ width: '100%', height: '34px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                    />
                  </div>
                </div>

                {/* Slider de Ángulo */}
                {gradStyle !== 'radial' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      <span>Ángulo de Inclinación:</span>
                      <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{gradAngle}°</span>
                    </div>
                    <input
                      type="range" min={0} max={360} step={5}
                      value={gradAngle}
                      onChange={(e) => {
                        const a = Number(e.target.value);
                        setGradAngle(a);
                        const css = gradStyle === 'sharp'
                          ? `linear-gradient(${a}deg, ${gradColor1} 0% ${gradStop}%, ${gradColor2} ${gradStop}% 100%)`
                          : `linear-gradient(${a}deg, ${gradColor1} 0%, ${gradColor2} 100%)`;
                        setBgColor(css);
                      }}
                      style={{ width: '100%', accentColor: 'var(--accent)' }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bloque 3: Mosaico Imprimible A4 / A3 con Sangrado Frente y Dorso */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', backgroundColor: 'var(--bg-surface-2)', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--accent)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Printer size={16} color="var(--accent)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>
                🖨️ Mosaico A4 / A3 con Sangrado
              </span>
            </div>

            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.35, margin: 0 }}>
              Calcula y repite automáticamente la pieza en una hoja de impresión con canaletas de 7.0 mm, marcas de corte en el frente y <strong>sangrado envolvente de 3.5 mm espejado en el dorso</strong>.
            </p>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Formato Hoja:</label>
                <select
                  value={impSheetFormat}
                  onChange={(e) => setImpSheetFormat(e.target.value)}
                  style={{ width: '100%', padding: '0.35rem', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}
                >
                  <option value="a4">Hoja A4 (210x297 mm)</option>
                  <option value="a3">Hoja A3 (297x420 mm)</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Orientación Papel:</label>
                <select
                  value={impOrientation}
                  onChange={(e) => setImpOrientation(e.target.value)}
                  style={{ width: '100%', padding: '0.35rem', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}
                >
                  <option value="portrait">↕️ Vertical (Portrait)</option>
                  <option value="landscape">↔️ Horizontal (Landscape)</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={exportImpositionPDF}
              style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', marginTop: '0.2rem' }}
            >
              <FileText size={15} />
              <span>Generar PDF Mosaico A4/A3 Dúplex</span>
            </button>
          </div>
        </div>
      )}

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
                if (isMobile) setMobileToolOpen(false);
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
    </>
  );

  // ---------------------------------------------------------------------
  // Contenido del panel de Propiedades — se reutiliza en la columna fija
  // de desktop y en la bandeja inferior (bottom sheet) de mobile.
  // ---------------------------------------------------------------------
  const renderPropertiesContent = () => (
    !selectedElement ? (
      <div style={{ fontSize: '0.82rem', color: 'var(--text-disabled)', textAlign: 'center', padding: '2.5rem 0' }}>
        Toca cualquier elemento del lienzo para editar sus propiedades.
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
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

        {(selectedElement.type === 'rect' || selectedElement.type === 'circle' || selectedElement.type === 'star') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Tipo de Relleno de la Forma:
            </label>

            <div style={{ display: 'flex', gap: '0.3rem', backgroundColor: 'var(--bg-surface-2)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
              <button
                type="button"
                onClick={() => updateSelected('fillType', 'color')}
                style={{
                  flex: 1, padding: '0.3rem 0.2rem', fontSize: '0.68rem', fontWeight: 700, borderRadius: 'var(--radius-sm)',
                  backgroundColor: (!selectedElement.fillType || selectedElement.fillType === 'color') ? 'var(--accent)' : 'transparent',
                  color: (!selectedElement.fillType || selectedElement.fillType === 'color') ? '#000' : 'var(--text-secondary)',
                  border: 'none', cursor: 'pointer'
                }}
              >
                🎨 Sólido
              </button>
              <button
                type="button"
                onClick={() => updateSelected('fillType', 'gradient')}
                style={{
                  flex: 1, padding: '0.3rem 0.2rem', fontSize: '0.68rem', fontWeight: 700, borderRadius: 'var(--radius-sm)',
                  backgroundColor: selectedElement.fillType === 'gradient' ? 'var(--accent)' : 'transparent',
                  color: selectedElement.fillType === 'gradient' ? '#000' : 'var(--text-secondary)',
                  border: 'none', cursor: 'pointer'
                }}
              >
                🌈 Degradado
              </button>
              <button
                type="button"
                onClick={() => updateSelected('fillType', 'texture')}
                style={{
                  flex: 1, padding: '0.3rem 0.2rem', fontSize: '0.68rem', fontWeight: 700, borderRadius: 'var(--radius-sm)',
                  backgroundColor: selectedElement.fillType === 'texture' ? 'var(--accent)' : 'transparent',
                  color: selectedElement.fillType === 'texture' ? '#000' : 'var(--text-secondary)',
                  border: 'none', cursor: 'pointer'
                }}
              >
                🏁 Textura
              </button>
            </div>

            {(!selectedElement.fillType || selectedElement.fillType === 'color') && (
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Color Sólido:</label>
                <input
                  type="color"
                  value={selectedElement.fill || '#BAFDC1'}
                  onChange={(e) => updateSelected('fill', e.target.value)}
                  style={{ width: '100%', height: '34px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                />
              </div>
            )}

            {selectedElement.fillType === 'gradient' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Color 1:</label>
                    <input
                      type="color"
                      value={selectedElement.gradColor1 || '#111114'}
                      onChange={(e) => updateSelected('gradColor1', e.target.value)}
                      style={{ width: '100%', height: '30px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Color 2:</label>
                    <input
                      type="color"
                      value={selectedElement.gradColor2 || '#BAFDC1'}
                      onChange={(e) => updateSelected('gradColor2', e.target.value)}
                      style={{ width: '100%', height: '30px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                    <span>Ángulo:</span>
                    <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{selectedElement.gradAngle || 45}°</span>
                  </div>
                  <input
                    type="range" min={0} max={360} step={5}
                    value={selectedElement.gradAngle || 45}
                    onChange={(e) => updateSelected('gradAngle', Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                  />
                </div>
              </div>
            )}

            {selectedElement.fillType === 'texture' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.3rem' }}>
                  {['grid', 'dots', 'stripes', 'noise', 'paper'].map(pat => (
                    <button
                      key={pat}
                      type="button"
                      onClick={() => updateSelected('patternType', pat)}
                      style={{
                        padding: '0.3rem', fontSize: '0.65rem', borderRadius: 'var(--radius-sm)',
                        border: `1px solid ${(selectedElement.patternType || 'grid') === pat ? 'var(--accent)' : 'var(--border-subtle)'}`,
                        backgroundColor: (selectedElement.patternType || 'grid') === pat ? 'var(--accent-muted)' : 'var(--bg-surface-2)',
                        color: (selectedElement.patternType || 'grid') === pat ? 'var(--accent)' : 'var(--text-primary)',
                        cursor: 'pointer', textTransform: 'capitalize'
                      }}
                    >
                      {pat}
                    </button>
                  ))}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                    <span>Inclinación Trama:</span>
                    <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{selectedElement.patternAngle || 0}°</span>
                  </div>
                  <input
                    type="range" min={0} max={360} step={5}
                    value={selectedElement.patternAngle || 0}
                    onChange={(e) => updateSelected('patternAngle', Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {selectedElement.type === 'image' && (
          <>
            {/* Sub-pestañas de propiedades de imagen */}
            <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.8rem', backgroundColor: 'var(--bg-surface-2)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
              <button
                type="button"
                onClick={() => setImagePropSubTab('filters')}
                style={{
                  flex: 1, padding: '0.35rem 0.2rem', fontSize: '0.7rem', fontWeight: 700, borderRadius: 'var(--radius-sm)',
                  backgroundColor: imagePropSubTab === 'filters' ? 'var(--accent)' : 'transparent',
                  color: imagePropSubTab === 'filters' ? '#000' : 'var(--text-secondary)',
                  border: 'none', cursor: 'pointer'
                }}
              >
                ☀️ Filtros
              </button>
              <button
                type="button"
                onClick={() => setImagePropSubTab('crop')}
                style={{
                  flex: 1, padding: '0.35rem 0.2rem', fontSize: '0.7rem', fontWeight: 700, borderRadius: 'var(--radius-sm)',
                  backgroundColor: imagePropSubTab === 'crop' ? 'var(--accent)' : 'transparent',
                  color: imagePropSubTab === 'crop' ? '#000' : 'var(--text-secondary)',
                  border: 'none', cursor: 'pointer'
                }}
              >
                ✂️ Forma
              </button>
              <button
                type="button"
                onClick={() => setImagePropSubTab('ai')}
                style={{
                  flex: 1, padding: '0.35rem 0.2rem', fontSize: '0.7rem', fontWeight: 700, borderRadius: 'var(--radius-sm)',
                  backgroundColor: imagePropSubTab === 'ai' ? 'var(--accent)' : 'transparent',
                  color: imagePropSubTab === 'ai' ? '#000' : 'var(--text-secondary)',
                  border: 'none', cursor: 'pointer'
                }}
              >
                🪄 IA
              </button>
            </div>

            {imagePropSubTab === 'filters' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div>
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
              </div>
            )}

            {imagePropSubTab === 'crop' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <span style={{ fontSize: '0.76rem', color: 'var(--accent)', fontWeight: 700 }}>
                  Recorte con 12 Formas Geométricas & Decorativas:
                </span>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem' }}>
                  {SHAPE_CROP_TYPES.map((shape) => (
                    <button
                      key={shape.id}
                      type="button"
                      onClick={() => updateSelectedWithHistory('clipShape', shape.id)}
                      style={{
                        padding: '0.4rem 0.2rem',
                        borderRadius: 'var(--radius-sm)',
                        border: `1.5px solid ${(selectedElement.clipShape || 'none') === shape.id ? 'var(--accent)' : 'var(--border-subtle)'}`,
                        backgroundColor: (selectedElement.clipShape || 'none') === shape.id ? 'var(--accent-muted)' : 'var(--bg-surface-2)',
                        color: (selectedElement.clipShape || 'none') === shape.id ? 'var(--accent)' : 'var(--text-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.15rem'
                      }}
                      title={shape.label}
                    >
                      <span style={{ fontSize: '1rem' }}>{shape.icon}</span>
                      <span style={{ fontSize: '0.58rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.1 }}>{shape.label}</span>
                    </button>
                  ))}
                </div>

                {selectedElement.clipShape && selectedElement.clipShape !== 'none' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.4rem', paddingTop: '0.6rem', borderTop: '1px dashed var(--border-subtle)' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        <span>Rotación de la Forma:</span>
                        <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{selectedElement.clipRotation || 0}°</span>
                      </div>
                      <input
                        type="range" min={0} max={360} step={1}
                        value={selectedElement.clipRotation || 0}
                        onChange={(e) => updateSelected('clipRotation', Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--accent)' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        <span>Deformar Ancho (Escala X):</span>
                        <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{(selectedElement.clipScaleX || 1).toFixed(2)}x</span>
                      </div>
                      <input
                        type="range" min={0.2} max={2.5} step={0.05}
                        value={selectedElement.clipScaleX || 1}
                        onChange={(e) => updateSelected('clipScaleX', Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--accent)' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        <span>Deformar Alto (Escala Y):</span>
                        <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{(selectedElement.clipScaleY || 1).toFixed(2)}x</span>
                      </div>
                      <input
                        type="range" min={0.2} max={2.5} step={0.05}
                        value={selectedElement.clipScaleY || 1}
                        onChange={(e) => updateSelected('clipScaleY', Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--accent)' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {imagePropSubTab === 'ai' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setRetouchModalOpen(true)}
                  style={{ justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.7rem' }}
                >
                  <Wand2 size={16} color="var(--accent)" />
                  <span>Abrir Borrador Mágico & Quitar Fondo (IA)</span>
                </button>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-disabled)', textAlign: 'center' }}>
                  Elimina objetos no deseados o quita el fondo 100% nativo en el navegador.
                </span>
              </div>
            )}
          </>
        )}

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
    )
  );

  // ---------------------------------------------------------------------
  // Bloque del lienzo Konva — una única instancia de <Stage>, reutilizada
  // tanto en la columna central de desktop como en pantalla completa mobile.
  // Se escala visualmente vía scaleX/scaleY de Konva (no CSS transform),
  // así el puntero/drag y la exportación HD quedan siempre exactos.
  // ---------------------------------------------------------------------
  const stageInner = (
    <>
      <div style={{
        position: 'absolute', top: '0.8rem', left: '1rem', fontSize: '0.72rem',
        color: 'var(--text-disabled)', display: 'flex', alignItems: 'center', gap: '0.4rem', zIndex: 2
      }}>
        <span className="font-mono" style={{ color: 'var(--accent)' }}>{preset.width}x{preset.height}px</span>
        <span>({preset.unit})</span>
      </div>

      <div style={{
        boxShadow: '0 12px 35px rgba(0,0,0,0.6), 0 0 15px rgba(186, 253, 193, 0.08)',
        border: '1px solid var(--border-strong)',
        borderRadius: '4px',
        position: 'relative',
        background: bgColor,
        overflow: 'hidden'
      }}>
        <Stage
          width={preset.width * displayScale}
          height={preset.height * displayScale}
          scaleX={displayScale}
          scaleY={displayScale}
          ref={stageRef}
          onMouseDown={(e) => {
            handleMouseDownDraw(e);
            if (e.target === e.target.getStage()) setSelectedId(null);
          }}
          onMouseMove={handleMouseMoveDraw}
          onMouseUp={handleMouseUpDraw}
          onTouchStart={(e) => {
            handleMouseDownDraw(e);
            if (e.target === e.target.getStage()) setSelectedId(null);
          }}
          onTouchMove={handleMouseMoveDraw}
          onTouchEnd={handleMouseUpDraw}
        >
          <Layer>
            {bgImageObj ? (
              <KonvaImage image={bgImageObj} width={preset.width} height={preset.height} listening={false} />
            ) : (
              <Rect width={preset.width} height={preset.height} fill="#111114" />
            )}

            {elements.map((el) => {
              if (el.type === 'text') {
                return (
                  <Text
                    key={el.id} id={el.id} {...el}
                    draggable={!isDrawingMode}
                    onClick={() => !isDrawingMode && setSelectedId(el.id)}
                    onTap={() => !isDrawingMode && setSelectedId(el.id)}
                    onDragMove={(e) => handleDragMove(e, el.id)}
                    onDragEnd={(e) => { handleDragEnd(); updateSelected('x', e.target.x()); updateSelected('y', e.target.y()); }}
                  />
                );
              }
              if (el.type === 'rect' || el.type === 'circle' || el.type === 'star') {
                return (
                  <ShapeElement
                    key={el.id}
                    el={el}
                    isDrawingMode={isDrawingMode}
                    setSelectedId={setSelectedId}
                    handleDragMove={handleDragMove}
                    handleDragEnd={handleDragEnd}
                    updateSelected={updateSelected}
                  />
                );
              }
              if (el.type === 'line') {
                return <Line key={el.id} id={el.id} {...el} draggable={!isDrawingMode} onClick={() => !isDrawingMode && setSelectedId(el.id)} onTap={() => !isDrawingMode && setSelectedId(el.id)} />;
              }
              if (el.type === 'image') {
                return (
                  <URLImage
                    key={el.id} id={el.id} image={{ src: el.src }} {...el}
                    draggable={!isDrawingMode}
                    onClick={() => !isDrawingMode && setSelectedId(el.id)}
                    onTap={() => !isDrawingMode && setSelectedId(el.id)}
                    onDragMove={(e) => handleDragMove(e, el.id)}
                    onDragEnd={(e) => { handleDragEnd(); updateSelected('x', e.target.x()); updateSelected('y', e.target.y()); }}
                  />
                );
              }
              return null;
            })}

            {alignGuides.showX && <Line points={[preset.width / 2, 0, preset.width / 2, preset.height]} stroke="#18f668" strokeWidth={1} dash={[4, 4]} />}
            {alignGuides.showY && <Line points={[0, preset.height / 2, preset.width, preset.height / 2]} stroke="#18f668" strokeWidth={1} dash={[4, 4]} />}

            {!isDrawingMode && <Transformer ref={trRef} />}
          </Layer>
        </Stage>
      </div>
    </>
  );

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

      {/* Top Toolbar de la Suite (Historial y Exportación) */}
      <div style={{
        backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)',
        padding: '0.8rem 1.2rem', maxWidth: '1280px', margin: '0 auto 1.5rem', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem', boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button onClick={undo} disabled={undoStack.current.length === 0} className="btn btn-secondary btn-sm" title="Deshacer (Undo)" style={{ padding: '0.4rem 0.7rem', opacity: undoStack.current.length === 0 ? 0.5 : 1 }}>
            <Undo2 size={16} /><span style={{ fontSize: '0.78rem' }}>Deshacer</span>
          </button>
          <button onClick={redo} disabled={redoStack.current.length === 0} className="btn btn-secondary btn-sm" title="Rehacer (Redo)" style={{ padding: '0.4rem 0.7rem', opacity: redoStack.current.length === 0 ? 0.5 : 1 }}>
            <Redo2 size={16} /><span style={{ fontSize: '0.78rem' }}>Rehacer</span>
          </button>
          <button
            onClick={() => { if (window.confirm('¿Deseas limpiar todos los elementos del lienzo?')) { saveStateToHistory(); setElements([]); setSelectedId(null); } }}
            className="btn btn-ghost btn-sm" title="Limpiar Lienzo" style={{ color: '#F87171', padding: '0.4rem 0.7rem', fontSize: '0.78rem' }}
          >
            <Trash2 size={15} /><span>Limpiar</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button className="btn btn-primary btn-sm" onClick={exportPNG} style={{ gap: '0.4rem', fontSize: '0.78rem' }}>
            <Download size={15} /><span>Exportar PNG (300 DPI)</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={exportPDF} style={{ gap: '0.4rem', fontSize: '0.78rem' }}>
            <FileText size={15} /><span>PDF Imprimible</span>
          </button>
        </div>
      </div>

      {/* ---------------- LAYOUT DESKTOP (3 columnas) ---------------- */}
      {!isMobile && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 290px', gap: '1.2rem', maxWidth: '1380px', margin: '0 auto', alignItems: 'start' }}>
          {/* Columna Izquierda: Panel Tabulado de Herramientas de Creación */}
          <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-2)', overflowX: 'auto' }}>
              {TAB_DEFS.map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    style={{
                      flex: 1, minWidth: '50px', padding: '0.6rem 0.4rem',
                      background: isActive ? 'var(--bg-surface)' : 'transparent', border: 'none',
                      borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                      color: isActive ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
                      fontSize: '0.68rem', fontWeight: isActive ? 700 : 500, transition: 'all 0.2s'
                    }}
                  >
                    <Icon size={16} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ padding: '1.2rem', maxHeight: '520px', overflowY: 'auto' }}>
              {renderActiveTabContent()}
            </div>
          </div>

          {/* Columna Central: Konva Interactive Canvas Stage */}
          <div style={{
            backgroundColor: 'var(--bg-surface-2)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'auto', minHeight: '480px', position: 'relative'
          }}>
            {stageInner}
          </div>

          {/* Columna Derecha: Inspector de Propiedades del Elemento Seleccionado */}
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.8rem', textTransform: 'uppercase' }}>Propiedades</h4>
            {renderPropertiesContent()}
          </div>
        </div>
      )}

      {/* ---------------- LAYOUT MOBILE: tarjeta de entrada a pantalla completa ---------------- */}
      {isMobile && !mobileFullscreen && (
        <div style={{
          maxWidth: '480px', margin: '0 auto', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', padding: '2.5rem 1.5rem', textAlign: 'center', boxShadow: 'var(--shadow-card)'
        }}>
          <Maximize2 size={36} color="var(--accent)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.6rem' }}>Editá esta pieza a pantalla completa</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.4rem' }}>
            En celular, el editor completo (herramientas, lienzo y propiedades) funciona mejor ocupando toda la pantalla.
          </p>
          <button className="btn btn-primary" onClick={() => setMobileFullscreen(true)} style={{ gap: '0.5rem', margin: '0 auto' }}>
            <Maximize2 size={16} /><span>Editar a Pantalla Completa</span>
          </button>
        </div>
      )}

      {/* ---------------- LAYOUT MOBILE: editor a pantalla completa ---------------- */}
      {isMobile && mobileFullscreen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, backgroundColor: 'var(--bg-base, #0A0A0C)', display: 'flex', flexDirection: 'column' }}>
          {/* Barra superior: cerrar, deshacer/rehacer, exportar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.7rem', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', flexShrink: 0 }}>
            <button onClick={() => { setMobileFullscreen(false); setMobileToolOpen(false); setMobilePropsOpen(false); }} className="btn btn-ghost btn-sm" style={{ padding: '0.4rem' }} title="Cerrar pantalla completa">
              <X size={20} />
            </button>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <button onClick={undo} disabled={undoStack.current.length === 0} className="btn btn-ghost btn-sm" style={{ padding: '0.4rem' }}><Undo2 size={18} /></button>
              <button onClick={redo} disabled={redoStack.current.length === 0} className="btn btn-ghost btn-sm" style={{ padding: '0.4rem' }}><Redo2 size={18} /></button>
            </div>
            <button onClick={exportPNG} className="btn btn-primary btn-sm" style={{ padding: '0.4rem 0.7rem', gap: '0.3rem' }}>
              <Download size={15} /><span style={{ fontSize: '0.7rem' }}>PNG</span>
            </button>
          </div>

          {/* Barra de íconos de herramientas */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-2)', overflowX: 'auto', flexShrink: 0 }}>
            {TAB_DEFS.map((t) => {
              const Icon = t.icon;
              const isOpenActive = mobileToolOpen && activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    if (activeTab === t.id && mobileToolOpen) { setMobileToolOpen(false); }
                    else { setActiveTab(t.id); setMobileToolOpen(true); setMobilePropsOpen(false); }
                  }}
                  style={{
                    flex: 1, minWidth: '54px', padding: '0.55rem 0.3rem',
                    background: isOpenActive ? 'var(--bg-surface)' : 'transparent', border: 'none',
                    borderBottom: isOpenActive ? '2px solid var(--accent)' : '2px solid transparent',
                    color: isOpenActive ? 'var(--accent)' : 'var(--text-secondary)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem', fontSize: '0.6rem'
                  }}
                >
                  <Icon size={17} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Panel desplegable de la herramienta activa */}
          {mobileToolOpen && (
            <div style={{ maxHeight: '42vh', overflowY: 'auto', padding: '1rem', backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
              {renderActiveTabContent()}
            </div>
          )}

          {/* Área del lienzo */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', padding: '0.5rem' }}>
            {stageInner}
          </div>

          {/* Botón flotante "Propiedades" */}
          {selectedElement && !mobilePropsOpen && (
            <button
              onClick={() => { setMobilePropsOpen(true); setMobileToolOpen(false); }}
              className="btn btn-primary"
              style={{
                position: 'fixed', bottom: '1.1rem', left: '50%', transform: 'translateX(-50%)',
                borderRadius: 'var(--radius-full)', padding: '0.7rem 1.4rem', gap: '0.5rem',
                boxShadow: '0 8px 20px rgba(0,0,0,0.45)', zIndex: 2001
              }}
            >
              <Sliders size={16} /><span>Propiedades</span>
            </button>
          )}

          {/* Bandeja inferior (bottom sheet) de Propiedades */}
          {mobilePropsOpen && selectedElement && (
            <div style={{
              position: 'fixed', left: 0, right: 0, bottom: 0,
              maxHeight: selectedElement?.type === 'image' ? '40vh' : '58vh',
              backgroundColor: 'var(--bg-surface)',
              borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)',
              boxShadow: '0 -8px 30px rgba(0,0,0,0.5)', zIndex: 2002, display: 'flex', flexDirection: 'column'
            }}>
              <div onClick={() => setMobilePropsOpen(false)} style={{ display: 'flex', justifyContent: 'center', padding: '0.55rem', cursor: 'pointer' }}>
                <div style={{ width: '38px', height: '4px', borderRadius: '2px', backgroundColor: 'var(--border-subtle)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1.2rem 0.6rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>Propiedades</h4>
                <button onClick={() => setMobilePropsOpen(false)} className="btn btn-ghost btn-sm" style={{ padding: '0.3rem' }}><X size={16} /></button>
              </div>
              <div style={{ padding: '0 1.2rem 1.4rem', overflowY: 'auto' }}>
                {renderPropertiesContent()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Retoque de Imagen IA */}
      {retouchModalOpen && selectedElement?.type === 'image' && (
        <ImageRetouchModal
          src={selectedElement.src}
          onApply={(newSrc) => { updateSelectedWithHistory('src', newSrc); setRetouchModalOpen(false); }}
          onClose={() => setRetouchModalOpen(false)}
        />
      )}

      <style>{`
        .font-item-btn:hover { border-color: var(--accent) !important; background-color: var(--accent-muted) !important; }
        .emoji-btn:hover { transform: scale(1.2); border-color: var(--accent) !important; }
      `}</style>
    </section>
  );
}
