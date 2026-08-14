import React, { useState, useRef, useEffect } from 'react';
import { 
  Palette, Type, Square, Circle as CircleIcon, Image as ImageIcon, Download, 
  Printer, FileText, Trash2, ArrowUp, ArrowDown, Sparkles, Wand2, Undo2, Redo2, 
  Sun, Contrast as ContrastIcon, Droplet, Focus, Brush, Smile, Sliders, Layers, 
  RotateCw, Copy, AlignCenter, Maximize2, X
} from 'lucide-react';
import { Stage, Layer, Text, Rect, Circle, Line, Star, Shape, Image as KonvaImage, Transformer, Group } from 'react-konva';
import Konva from 'konva';
import jsPDF from 'jspdf';

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

// Catálogo de Formas Vectoriales Estilo Office & Affinity Studio
export const VECTOR_SHAPES_CATALOG = [
  { id: 'rect', name: 'Rectángulo', icon: '⬜' },
  { id: 'circle', name: 'Círculo', icon: '⚪' },
  { id: 'star', name: 'Estrella 5 Puntas', icon: '⭐' },
  { id: 'star6', name: 'Estrella 6 Puntas', icon: '✡️' },
  { id: 'star8', name: 'Estrella 8 Puntas', icon: '✳️' },
  { id: 'heart', name: 'Corazón', icon: '❤️' },
  { id: 'hexagon', name: 'Hexágono', icon: '🛑' },
  { id: 'octagon', name: 'Octágono', icon: '☸️' },
  { id: 'triangle', name: 'Triángulo', icon: '🔺' },
  { id: 'diamond', name: 'Diamante', icon: '🔷' },
  { id: 'shield', name: 'Escudo', icon: '🛡️' },
  { id: 'badge', name: 'Insignia', icon: '🏷️' }
];

// Plantillas Predefinidas por Formato (Frente & Dorso)
export const DESIGN_TEMPLATES = {
  'business': [
    {
      id: 'biz-minimal-left',
      name: 'Minimalista Tech',
      preview: { bg: '#111114', accent: '#BAFDC1' },
      frontBg: '#111114',
      backBg: '#1A1A1E',
      frontElements: [
        { id: 'f1', type: 'rect', x: 0, y: 0, width: 6, height: 300, fill: '#BAFDC1' },
        { id: 'f2', type: 'text', text: 'NOMBRE APELLIDO', x: 32, y: 55, fontSize: 22, fill: '#FFFFFF', fontFamily: 'Space Grotesk', fontWeight: 'bold' },
        { id: 'f3', type: 'text', text: 'Director Creativo', x: 32, y: 88, fontSize: 12, fill: '#9EA0A6', fontFamily: 'Inter' },
        { id: 'f4', type: 'rect', x: 32, y: 115, width: 50, height: 1.5, fill: '#BAFDC1' },
        { id: 'f5', type: 'text', text: '+54 9 11 0000-0000', x: 32, y: 140, fontSize: 11, fill: '#E5E5E7', fontFamily: 'JetBrains Mono' },
        { id: 'f6', type: 'text', text: 'email@tudominio.com', x: 32, y: 162, fontSize: 11, fill: '#E5E5E7', fontFamily: 'JetBrains Mono' },
        { id: 'f7', type: 'text', text: 'www.tudominio.com', x: 32, y: 184, fontSize: 11, fill: '#BAFDC1', fontFamily: 'JetBrains Mono' },
        { id: 'f8', type: 'text', text: 'TU MARCA', x: 32, y: 240, fontSize: 16, fill: '#BAFDC1', fontFamily: 'Space Grotesk', fontWeight: 'bold' }
      ],
      backElements: [
        { id: 'b1', type: 'rect', x: 0, y: 0, width: 6, height: 300, fill: '#BAFDC1' },
        { id: 'b2', type: 'text', text: 'TU MARCA', x: 200, y: 130, fontSize: 28, fill: '#BAFDC1', fontFamily: 'Space Grotesk', fontWeight: 'bold' },
        { id: 'b3', type: 'text', text: 'SLOGAN DE TU EMPRESA', x: 185, y: 170, fontSize: 10, fill: '#9EA0A6', fontFamily: 'Inter' }
      ]
    },
    {
      id: 'biz-centered-elegant',
      name: 'Luxury Dark & Gold',
      preview: { bg: '#0A0A0C', accent: '#C9A94D' },
      frontBg: '#0A0A0C',
      backBg: '#141418',
      frontElements: [
        { id: 'f1', type: 'rect', x: 20, y: 20, width: 500, height: 260, fill: 'transparent', stroke: '#C9A94D', strokeWidth: 1 },
        { id: 'f2', type: 'text', text: 'TU MARCA', x: 190, y: 60, fontSize: 24, fill: '#C9A94D', fontFamily: 'Playfair Display', fontWeight: 'bold' },
        { id: 'f3', type: 'text', text: 'ESPECIALIDAD O RUBRO', x: 178, y: 98, fontSize: 10, fill: '#E5E5E7', fontFamily: 'Cinzel' },
        { id: 'f4', type: 'rect', x: 230, y: 125, width: 80, height: 1, fill: '#C9A94D' },
        { id: 'f5', type: 'text', text: 'Nombre Apellido', x: 200, y: 145, fontSize: 13, fill: '#FFFFFF', fontFamily: 'Inter', fontWeight: '600' },
        { id: 'f6', type: 'text', text: 'email@tudominio.com', x: 195, y: 172, fontSize: 10, fill: '#C9A94D', fontFamily: 'Inter' },
        { id: 'f7', type: 'text', text: '+54 9 11 0000-0000  |  Ciudad, País', x: 160, y: 195, fontSize: 10, fill: '#9EA0A6', fontFamily: 'Inter' }
      ],
      backElements: [
        { id: 'b1', type: 'rect', x: 20, y: 20, width: 500, height: 260, fill: 'transparent', stroke: '#C9A94D', strokeWidth: 1 },
        { id: 'b2', type: 'text', text: 'TU MARCA', x: 185, y: 120, fontSize: 28, fill: '#C9A94D', fontFamily: 'Playfair Display', fontWeight: 'bold' },
        { id: 'b3', type: 'text', text: 'CIUDAD', x: 245, y: 165, fontSize: 10, fill: '#9EA0A6', fontFamily: 'Cinzel' }
      ]
    }
  ],
  'business-eu': [
    {
      id: 'eu-swiss-grid',
      name: 'Swiss Grid',
      preview: { bg: '#FAFAFA', accent: '#111114' },
      frontBg: '#FAFAFA',
      backBg: '#111114',
      frontElements: [
        { id: 'f1', type: 'text', text: 'NOMBRE APELLIDO', x: 35, y: 50, fontSize: 20, fill: '#111114', fontFamily: 'Space Grotesk', fontWeight: 'bold' },
        { id: 'f2', type: 'text', text: 'Cargo Profesional', x: 35, y: 80, fontSize: 11, fill: '#666666', fontFamily: 'Inter' },
        { id: 'f3', type: 'rect', x: 35, y: 108, width: 440, height: 1, fill: '#111114' },
        { id: 'f4', type: 'text', text: '+54 9 11 0000-0000', x: 35, y: 130, fontSize: 10, fill: '#333333', fontFamily: 'JetBrains Mono' },
        { id: 'f5', type: 'text', text: 'email@tudominio.com', x: 35, y: 152, fontSize: 10, fill: '#333333', fontFamily: 'JetBrains Mono' },
        { id: 'f6', type: 'text', text: 'TU MARCA', x: 35, y: 270, fontSize: 16, fill: '#111114', fontFamily: 'Space Grotesk', fontWeight: 'bold' }
      ],
      backElements: [
        { id: 'b1', type: 'text', text: 'TU MARCA', x: 170, y: 140, fontSize: 28, fill: '#FAFAFA', fontFamily: 'Space Grotesk', fontWeight: 'bold' }
      ]
    }
  ],
  'invitation': [
    {
      id: 'inv-gala',
      name: 'Gala Formal',
      preview: { bg: '#0A0A0C', accent: '#C9A94D' },
      frontBg: '#0A0A0C',
      backBg: '#141418',
      frontElements: [
        { id: 'f1', type: 'rect', x: 25, y: 25, width: 350, height: 550, fill: 'transparent', stroke: '#C9A94D', strokeWidth: 1 },
        { id: 'f2', type: 'text', text: 'ESTÁS INVITADO/A', x: 90, y: 80, fontSize: 14, fill: '#C9A94D', fontFamily: 'Cinzel' },
        { id: 'f3', type: 'rect', x: 160, y: 110, width: 80, height: 1, fill: '#C9A94D' },
        { id: 'f4', type: 'text', text: 'NOMBRE', x: 100, y: 150, fontSize: 36, fill: '#FFFFFF', fontFamily: 'Playfair Display', fontWeight: 'bold' },
        { id: 'f5', type: 'text', text: 'DEL EVENTO', x: 118, y: 200, fontSize: 20, fill: '#C9A94D', fontFamily: 'Playfair Display' },
        { id: 'f6', type: 'text', text: 'Sábado 15 de Noviembre, 2026', x: 75, y: 280, fontSize: 12, fill: '#E5E5E7', fontFamily: 'Inter' },
        { id: 'f7', type: 'text', text: '20:00 hs', x: 170, y: 310, fontSize: 16, fill: '#C9A94D', fontFamily: 'JetBrains Mono', fontWeight: 'bold' },
        { id: 'f8', type: 'text', text: 'Salón Grand Palace', x: 130, y: 355, fontSize: 13, fill: '#E5E5E7', fontFamily: 'Inter' },
        { id: 'f9', type: 'text', text: 'Av. Corrientes 1234, CABA', x: 115, y: 380, fontSize: 10, fill: '#9EA0A6', fontFamily: 'Inter' }
      ],
      backElements: [
        { id: 'b1', type: 'text', text: 'Dresscode:', x: 145, y: 250, fontSize: 12, fill: '#9EA0A6', fontFamily: 'Inter' },
        { id: 'b2', type: 'text', text: 'FORMAL / COCKTAIL', x: 110, y: 280, fontSize: 16, fill: '#C9A94D', fontFamily: 'Cinzel', fontWeight: 'bold' }
      ]
    }
  ],
  'tag-sq': [
    {
      id: 'tag-product',
      name: 'Etiqueta Producto Artesanal',
      preview: { bg: '#FAFAFA', accent: '#111114' },
      frontBg: '#FAFAFA',
      backBg: '#111114',
      frontElements: [
        { id: 'f1', type: 'text', text: 'TU MARCA', x: 110, y: 40, fontSize: 22, fill: '#111114', fontFamily: 'Space Grotesk', fontWeight: 'bold' },
        { id: 'f2', type: 'rect', x: 160, y: 75, width: 80, height: 1.5, fill: '#111114' },
        { id: 'f3', type: 'text', text: 'NOMBRE DEL', x: 120, y: 140, fontSize: 22, fill: '#111114', fontFamily: 'Playfair Display', fontWeight: 'bold' },
        { id: 'f4', type: 'text', text: 'PRODUCTO', x: 130, y: 175, fontSize: 22, fill: '#111114', fontFamily: 'Playfair Display', fontWeight: 'bold' },
        { id: 'f5', type: 'text', text: '250 ml | Ingrediente Natural', x: 110, y: 230, fontSize: 10, fill: '#666666', fontFamily: 'Inter' },
        { id: 'f6', type: 'text', text: 'Hecho en Argentina', x: 140, y: 330, fontSize: 10, fill: '#9EA0A6', fontFamily: 'Inter' }
      ],
      backElements: [
        { id: 'b1', type: 'text', text: 'Ingredientes:', x: 40, y: 40, fontSize: 11, fill: '#FFFFFF', fontFamily: 'Inter', fontWeight: 'bold' },
        { id: 'b2', type: 'text', text: 'Agua, Aceite de coco, Extracto natural.', x: 40, y: 65, fontSize: 9, fill: '#9EA0A6', fontFamily: 'Inter' }
      ]
    }
  ],
  'ig-square': [
    {
      id: 'ig-sq-promo',
      name: 'Promo Impactante',
      preview: { bg: '#111114', accent: '#FF5555' },
      frontBg: '#111114',
      backBg: '#111114',
      frontElements: [
        { id: 'f1', type: 'text', text: 'OFERTA', x: 40, y: 60, fontSize: 52, fill: '#FF5555', fontFamily: 'Outfit', fontWeight: 'bold' },
        { id: 'f2', type: 'text', text: 'ESPECIAL', x: 40, y: 120, fontSize: 52, fill: '#FFFFFF', fontFamily: 'Outfit', fontWeight: 'bold' },
        { id: 'f3', type: 'rect', x: 40, y: 190, width: 60, height: 3, fill: '#FF5555' },
        { id: 'f4', type: 'text', text: 'Hasta 50% de descuento', x: 40, y: 220, fontSize: 18, fill: '#E5E5E7', fontFamily: 'Inter' },
        { id: 'f5', type: 'rect', x: 40, y: 380, width: 200, height: 48, fill: '#FF5555' },
        { id: 'f6', type: 'text', text: 'COMPRAR AHORA', x: 62, y: 393, fontSize: 16, fill: '#FFFFFF', fontFamily: 'Outfit', fontWeight: 'bold' }
      ],
      backElements: []
    }
  ],
  'diptico-a4': [
    {
      id: 'diptico-corp-tech',
      name: 'Díptico Corporativo Tech (2 Cuerpos)',
      preview: { bg: '#111114', accent: '#BAFDC1' },
      frontBg: '#111114',
      backBg: '#141418',
      frontElements: [
        { id: 'fd-guia', type: 'line', points: [421, 0, 421, 595], stroke: '#BAFDC1', strokeWidth: 1, dash: [6, 4], opacity: 0.35 },
        { id: 'fd-acc', type: 'rect', x: 450, y: 50, width: 8, height: 495, fill: '#BAFDC1' },
        { id: 'fd-t1', type: 'text', text: 'SOLUCIONES\nCORPORATIVAS', x: 480, y: 110, fontSize: 30, fill: '#FFFFFF', fontFamily: 'Space Grotesk', fontWeight: 'bold' },
        { id: 'fd-t2', type: 'text', text: 'Estudio de Innovación & Desarrollo', x: 480, y: 205, fontSize: 13, fill: '#BAFDC1', fontFamily: 'Inter' },
        { id: 'fd-r1', type: 'rect', x: 480, y: 240, width: 60, height: 2, fill: '#BAFDC1' },
        { id: 'fd-t3', type: 'text', text: 'Transformando la presencia gráfica\ne identidad visual de tu empresa.', x: 480, y: 265, fontSize: 12, fill: '#9EA0A6', fontFamily: 'Inter' },
        { id: 'fd-t4', type: 'text', text: 'TU MARCA © 2026', x: 480, y: 480, fontSize: 11, fill: '#E5E5E7', fontFamily: 'JetBrains Mono' },
        { id: 'fc-t1', type: 'text', text: 'CONTACTO & UBICACIÓN', x: 50, y: 110, fontSize: 18, fill: '#BAFDC1', fontFamily: 'Space Grotesk', fontWeight: 'bold' },
        { id: 'fc-r1', type: 'rect', x: 50, y: 145, width: 320, height: 1, fill: '#333339' },
        { id: 'fc-t2', type: 'text', text: '📍 Av. Corrientes 1234, CABA', x: 50, y: 175, fontSize: 12, fill: '#E5E5E7', fontFamily: 'Inter' },
        { id: 'fc-t3', type: 'text', text: '📞 +54 9 11 0000-0000', x: 50, y: 205, fontSize: 12, fill: '#E5E5E7', fontFamily: 'Inter' },
        { id: 'fc-t4', type: 'text', text: '✉️ contacto@tudominio.com', x: 50, y: 235, fontSize: 12, fill: '#E5E5E7', fontFamily: 'Inter' },
        { id: 'fc-t5', type: 'text', text: '🌐 www.tudominio.com', x: 50, y: 265, fontSize: 12, fill: '#BAFDC1', fontFamily: 'JetBrains Mono' },
        { id: 'fc-b1', type: 'rect', x: 50, y: 320, width: 320, height: 130, fill: '#1A1A1E' },
        { id: 'fc-bt', type: 'text', text: '💬 Atendemos de Lunes a Viernes de 9 a 18 hs.\nConsultá por presupuestos a medida.', x: 70, y: 355, fontSize: 11, fill: '#9EA0A6', fontFamily: 'Inter' }
      ],
      backElements: [
        { id: 'bd-guia', type: 'line', points: [421, 0, 421, 595], stroke: '#BAFDC1', strokeWidth: 1, dash: [6, 4], opacity: 0.35 },
        { id: 'bi-t1', type: 'text', text: 'NUESTROS SERVICIOS', x: 50, y: 70, fontSize: 22, fill: '#BAFDC1', fontFamily: 'Space Grotesk', fontWeight: 'bold' },
        { id: 'bi-r1', type: 'rect', x: 50, y: 105, width: 40, height: 3, fill: '#BAFDC1' },
        { id: 'bi-s1', type: 'text', text: '01. Diseño Editorial & Impresión', x: 50, y: 135, fontSize: 14, fill: '#FFFFFF', fontFamily: 'Inter', fontWeight: 'bold' },
        { id: 'bi-d1', type: 'text', text: 'Impresión offset y digital con sangrado impecable.', x: 50, y: 160, fontSize: 11, fill: '#9EA0A6', fontFamily: 'Inter' },
        { id: 'bi-s2', type: 'text', text: '02. Identidad Visual Corporativa', x: 50, y: 205, fontSize: 14, fill: '#FFFFFF', fontFamily: 'Inter', fontWeight: 'bold' },
        { id: 'bi-d2', type: 'text', text: 'Manuales de marca, logotipos y papelería.', x: 50, y: 230, fontSize: 11, fill: '#9EA0A6', fontFamily: 'Inter' },
        { id: 'bi-s3', type: 'text', text: '03. Packaging & Etiquetas', x: 50, y: 275, fontSize: 14, fill: '#FFFFFF', fontFamily: 'Inter', fontWeight: 'bold' },
        { id: 'bi-d3', type: 'text', text: 'Desarrollo de packaging para productos de alto nivel.', x: 50, y: 300, fontSize: 11, fill: '#9EA0A6', fontFamily: 'Inter' },
        { id: 'bi-t2', type: 'text', text: '¿POR QUÉ ELEGIRNOS?', x: 470, y: 70, fontSize: 22, fill: '#FFFFFF', fontFamily: 'Space Grotesk', fontWeight: 'bold' },
        { id: 'bi-r2', type: 'rect', x: 470, y: 105, width: 40, height: 3, fill: '#BAFDC1' },
        { id: 'bi-b1', type: 'text', text: '• Alta precisión de registro preimpresión.\n\n• Entregas ágiles y calidad garantizada.\n\n• Asesoramiento técnico personalizado.', x: 470, y: 140, fontSize: 12, fill: '#E5E5E7', fontFamily: 'Inter' },
        { id: 'bi-cta', type: 'rect', x: 470, y: 280, width: 320, height: 180, fill: '#BAFDC1' },
        { id: 'bi-ctat1', type: 'text', text: '¡Impulsá tu marca hoy!', x: 500, y: 315, fontSize: 20, fill: '#000000', fontFamily: 'Space Grotesk', fontWeight: 'bold' },
        { id: 'bi-ctat2', type: 'text', text: 'Contactanos para agendar una reunión\ny recibir muestras de materiales sin cargo.', x: 500, y: 360, fontSize: 11, fill: '#111114', fontFamily: 'Inter' }
      ]
    },
    {
      id: 'diptico-gastro-gold',
      name: 'Díptico Menú / Gastro Luxury',
      preview: { bg: '#0A0A0C', accent: '#C9A94D' },
      frontBg: '#0A0A0C',
      backBg: '#141418',
      frontElements: [
        { id: 'fg-guia', type: 'line', points: [421, 0, 421, 595], stroke: '#C9A94D', strokeWidth: 1, dash: [6, 4], opacity: 0.35 },
        { id: 'fg-frame', type: 'rect', x: 450, y: 40, width: 340, height: 515, fill: 'transparent', stroke: '#C9A94D', strokeWidth: 1 },
        { id: 'fg-t1', type: 'text', text: 'RESTAURANTE', x: 520, y: 120, fontSize: 14, fill: '#C9A94D', fontFamily: 'Cinzel' },
        { id: 'fg-t2', type: 'text', text: 'BISTRO', x: 535, y: 160, fontSize: 36, fill: '#FFFFFF', fontFamily: 'Playfair Display', fontWeight: 'bold' },
        { id: 'fg-r1', type: 'rect', x: 580, y: 220, width: 80, height: 1, fill: '#C9A94D' },
        { id: 'fg-t3', type: 'text', text: 'MENÚ & CARTA DE VINOS', x: 510, y: 250, fontSize: 12, fill: '#E5E5E7', fontFamily: 'Cinzel' },
        { id: 'fg-c1', type: 'text', text: 'RESERVAS & EVENTOS', x: 120, y: 140, fontSize: 16, fill: '#C9A94D', fontFamily: 'Cinzel', fontWeight: 'bold' },
        { id: 'fg-c2', type: 'text', text: 'Abierto de Martes a Domingo\n20:00 a 01:00 hs', x: 110, y: 180, fontSize: 12, fill: '#E5E5E7', fontFamily: 'Inter' },
        { id: 'fg-c3', type: 'text', text: '📍 Puerto Madero, CABA\n📞 +54 11 4444-5555', x: 120, y: 240, fontSize: 11, fill: '#9EA0A6', fontFamily: 'Inter' }
      ],
      backElements: [
        { id: 'bg-guia', type: 'line', points: [421, 0, 421, 595], stroke: '#C9A94D', strokeWidth: 1, dash: [6, 4], opacity: 0.35 },
        { id: 'bg-t1', type: 'text', text: 'ENTRADAS & PLATOS PRINCIPALES', x: 50, y: 60, fontSize: 18, fill: '#C9A94D', fontFamily: 'Cinzel', fontWeight: 'bold' },
        { id: 'bg-p1', type: 'text', text: 'Ojo de Bife Acompañado de Papas Rústicas .............. $18.500\n\nSalmón Rosado a las Hierbas Finas ........................ $22.000\n\nRisotto de Hongos Silvestres & Trufa ....................... $16.000', x: 50, y: 110, fontSize: 11, fill: '#E5E5E7', fontFamily: 'Inter' },
        { id: 'bg-t2', type: 'text', text: 'POSTRES & BEBIDAS', x: 470, y: 60, fontSize: 18, fill: '#C9A94D', fontFamily: 'Cinzel', fontWeight: 'bold' },
        { id: 'bg-p2', type: 'text', text: 'Volcán de Chocolate con Helado de Crema .............. $7.500\n\nVolcán de Dulce de Leche ..................................... $7.000\n\nVino Reserva Malbec 750ml .................................... $14.000', x: 470, y: 110, fontSize: 11, fill: '#E5E5E7', fontFamily: 'Inter' }
      ]
    }
  ],
  'triptico-a4': [
    {
      id: 'triptico-corp-modern',
      name: 'Tríptico Institucional (3 Cuerpos)',
      preview: { bg: '#111114', accent: '#BAFDC1' },
      frontBg: '#111114',
      backBg: '#16161a',
      frontElements: [
        { id: 'ft-g1', type: 'line', points: [280, 0, 280, 595], stroke: '#BAFDC1', strokeWidth: 1, dash: [6, 4], opacity: 0.35 },
        { id: 'ft-g2', type: 'line', points: [561, 0, 561, 595], stroke: '#BAFDC1', strokeWidth: 1, dash: [6, 4], opacity: 0.35 },
        { id: 'ft-p1t', type: 'text', text: 'BIENVENIDO', x: 30, y: 80, fontSize: 20, fill: '#BAFDC1', fontFamily: 'Space Grotesk', fontWeight: 'bold' },
        { id: 'ft-p1s', type: 'text', text: 'Descubrí lo que hacemos', x: 30, y: 115, fontSize: 11, fill: '#9EA0A6', fontFamily: 'Inter' },
        { id: 'ft-p1r', type: 'text', text: 'Comprometidos con la excelencia gráfica y el diseño estratégico de vanguardia.', x: 30, y: 150, fontSize: 11, fill: '#E5E5E7', fontFamily: 'Inter' },
        { id: 'ft-p2t', type: 'text', text: 'INFORMACIÓN & CONTACTO', x: 305, y: 80, fontSize: 16, fill: '#FFFFFF', fontFamily: 'Space Grotesk', fontWeight: 'bold' },
        { id: 'ft-p2r', type: 'rect', x: 305, y: 110, width: 230, height: 1, fill: '#333339' },
        { id: 'ft-p2b', type: 'text', text: '📍 Av. Corrientes 1234, CABA\n\n📞 +54 9 11 0000-0000\n\n✉️ info@tudominio.com\n\n🌐 www.tudominio.com', x: 305, y: 135, fontSize: 11, fill: '#9EA0A6', fontFamily: 'Inter' },
        { id: 'ft-p3acc', type: 'rect', x: 585, y: 50, width: 6, height: 495, fill: '#BAFDC1' },
        { id: 'ft-p3t1', type: 'text', text: 'TU MARCA', x: 610, y: 120, fontSize: 32, fill: '#BAFDC1', fontFamily: 'Space Grotesk', fontWeight: 'bold' },
        { id: 'ft-p3t2', type: 'text', text: 'ESTUDIO CREATIVO', x: 610, y: 165, fontSize: 12, fill: '#FFFFFF', fontFamily: 'Inter', fontWeight: 'bold' },
        { id: 'ft-p3t3', type: 'text', text: 'Soluciones Gráficas &\nPreimpresión de Precisión', x: 610, y: 220, fontSize: 11, fill: '#9EA0A6', fontFamily: 'Inter' }
      ],
      backElements: [
        { id: 'bt-g1', type: 'line', points: [280, 0, 280, 595], stroke: '#BAFDC1', strokeWidth: 1, dash: [6, 4], opacity: 0.35 },
        { id: 'bt-g2', type: 'line', points: [561, 0, 561, 595], stroke: '#BAFDC1', strokeWidth: 1, dash: [6, 4], opacity: 0.35 },
        { id: 'bt-p1t', type: 'text', text: '01. IDENTIDAD', x: 30, y: 60, fontSize: 18, fill: '#BAFDC1', fontFamily: 'Space Grotesk', fontWeight: 'bold' },
        { id: 'bt-p1b', type: 'text', text: 'Creamos marcas sólidas\ncon propósito visual.', x: 30, y: 95, fontSize: 11, fill: '#E5E5E7', fontFamily: 'Inter' },
        { id: 'bt-p2t', type: 'text', text: '02. IMPRESIÓN', x: 305, y: 60, fontSize: 18, fill: '#BAFDC1', fontFamily: 'Space Grotesk', fontWeight: 'bold' },
        { id: 'bt-p2b', type: 'text', text: 'Offset, digital, gran formato\ny acabados especiales.', x: 305, y: 95, fontSize: 11, fill: '#E5E5E7', fontFamily: 'Inter' },
        { id: 'bt-p3t', type: 'text', text: '03. DIGITAL', x: 585, y: 60, fontSize: 18, fill: '#BAFDC1', fontFamily: 'Space Grotesk', fontWeight: 'bold' },
        { id: 'bt-p3b', type: 'text', text: 'Sitios web, redes sociales\ny contenido interactivo.', x: 585, y: 95, fontSize: 11, fill: '#E5E5E7', fontFamily: 'Inter' }
      ]
    }
  ]
};
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

  // --- TARJETAS & PAPELERÍA ---
  { id: 'business', category: 'Tarjetas & Papelería', name: 'Tarjeta de Presentación', width: 540, height: 300, unit: '90x50 mm' },
  { id: 'business-eu', category: 'Tarjetas & Papelería', name: 'Tarjeta Europea', width: 510, height: 330, unit: '85x55 mm' },
  { id: 'invitation', category: 'Tarjetas & Papelería', name: 'Invitación de Evento', width: 400, height: 600, unit: '100x150 mm' },
  { id: 'tag-sq', category: 'Tarjetas & Papelería', name: 'Etiqueta Cuadrada 60x60', width: 400, height: 400, unit: '60x60 mm' },
  { id: 'tag-sm', category: 'Tarjetas & Papelería', name: 'Etiqueta Pequeña 50x50', width: 330, height: 330, unit: '50x50 mm' },
  { id: 'bookmark', category: 'Tarjetas & Papelería', name: 'Separador / Marcapáginas', width: 300, height: 1080, unit: '50x180 mm' },

  // --- FOLLETERÍA & EDITORIAL ---
  { id: 'diptico-a4', category: 'Folletería & Editorial', name: 'Díptico A4 (2 Cuerpos)', width: 842, height: 595, unit: '297x210 mm' },
  { id: 'triptico-a4', category: 'Folletería & Editorial', name: 'Tríptico A4 (3 Cuerpos)', width: 842, height: 595, unit: '297x210 mm' },

  // --- IMPRESIÓN ESTÁNDAR ---
  { id: 'a3', category: 'Impresión Estándar', name: 'Hoja A3', width: 840, height: 1188, unit: '297x420 mm' },
  { id: 'a4', category: 'Impresión Estándar', name: 'Hoja A4', width: 595, height: 842, unit: '210x297 mm' },
  { id: 'a5', category: 'Impresión Estándar', name: 'Hoja A5', width: 420, height: 595, unit: '148x210 mm' },
  { id: 'b5', category: 'Impresión Estándar', name: 'Hoja B5', width: 500, height: 708, unit: '176x250 mm' },
  { id: 'letter', category: 'Impresión Estándar', name: 'Tamaño Carta (Letter)', width: 612, height: 792, unit: '216x279 mm' },
  { id: 'legal', category: 'Impresión Estándar', name: 'Tamaño Oficio (Legal)', width: 612, height: 1008, unit: '216x356 mm' }
];

// Definición de las 7 herramientas de creación
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

// Función de trazado para recortes con forma, rotación y deformación.
// FIX: antes se aplicaba translate/rotate/scale al contexto sin guardarlo
// con ctx.save() ni restaurarlo con ctx.restore(). Como Konva reutiliza el
// MISMO contexto para dibujar el contenido de la imagen justo después de
// establecer el clip, esa transformación quedaba "pegada" y también
// rotaba/escalaba la imagen real (no solo la máscara de recorte),
// produciendo resultados inesperados o vacíos según la forma y el orden
// de dibujo. Ahora se aísla con save()/restore() para que el trazado del
// recorte nunca contamine lo que se dibuja después.
function drawCustomClipShape(ctx, width, height, clipShape, clipRotation = 0, clipScaleX = 1, clipScaleY = 1) {
  ctx.save();
  ctx.beginPath();
  if (!clipShape || clipShape === 'none') {
    ctx.rect(0, 0, width, height);
    ctx.restore();
    return;
  }

  const cx = width / 2;
  const cy = height / 2;

  ctx.translate(cx, cy);
  ctx.rotate((clipRotation * Math.PI) / 180);
  ctx.scale(clipScaleX, clipScaleY);
  ctx.translate(-cx, -cy);

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
  ctx.restore();
}

// Helper para calcular un color de trama contrastante si no se especificó uno distinto al fondo
function getContrastingPatternColor(bgColor, patternColor) {
  const bg = (bgColor || '#111114').trim().toLowerCase();
  const pat = (patternColor || '').trim().toLowerCase();

  // Si el usuario eligió explícitamente un color de trama distinto al del fondo, respetarlo 100%
  if (pat && pat !== bg) {
    return patternColor;
  }

  // Si no hay color o coincide con el fondo, calcular contraste por luminancia
  const hex = bg.replace('#', '');
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 140 ? '#111114' : '#BAFDC1';
  }
  return bg === '#bafdc1' ? '#111114' : '#BAFDC1';
}

// Generador sincrónico de canvas de textura/patrón nativo a escala 1:1 (sin difuminado ni borrosidad)
function createTexturePatternCanvas({
  patternType = 'grid',
  bgColor = '#111114',
  patternColor = '#BAFDC1',
  patternAngle = 0,
  patternScale = 1,
  patternSpacing = 30
}) {
  const tileSize = Math.max(10, Math.round((patternSpacing || 30) * (patternScale || 1)));
  const c = document.createElement('canvas');
  c.width = tileSize;
  c.height = tileSize;
  const ctx = c.getContext('2d');

  // Desactivar suavizado para máxima nitidez de píxeles vectoriales
  ctx.imageSmoothingEnabled = false;

  // 1. Color de Fondo Base de la Forma
  ctx.fillStyle = bgColor || '#111114';
  ctx.fillRect(0, 0, tileSize, tileSize);

  const cx = tileSize / 2;
  const cy = tileSize / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(((patternAngle || 0) * Math.PI) / 180);
  ctx.translate(-cx, -cy);

  // 2. Color Principal de la Trama (100% fiel al selector de color)
  const strokeColor = patternColor || '#BAFDC1';
  ctx.fillStyle = strokeColor;
  ctx.strokeStyle = strokeColor;
  const lineW = Math.max(1.5, Math.round(2 * (patternScale || 1)));
  ctx.lineWidth = lineW;

  if (patternType === 'grid') {
    ctx.strokeRect(0, 0, tileSize, tileSize);
  } else if (patternType === 'dots') {
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(1.5, Math.round(3.5 * (patternScale || 1))), 0, Math.PI * 2);
    ctx.fill();
  } else if (patternType === 'stripes') {
    ctx.lineWidth = Math.max(2, Math.round(3 * (patternScale || 1)));
    ctx.beginPath();
    ctx.moveTo(0, tileSize);
    ctx.lineTo(tileSize, 0);
    ctx.stroke();
  } else if (patternType === 'checkerboard') {
    ctx.fillRect(0, 0, cx, cy);
    ctx.fillRect(cx, cy, cx, cy);
  } else if (patternType === 'paper' || patternType === 'crosshatch') {
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(tileSize, tileSize); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tileSize, 0); ctx.lineTo(0, tileSize); ctx.stroke();
  } else if (patternType === 'waves') {
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.quadraticCurveTo(tileSize * 0.25, 0, cx, cy);
    ctx.quadraticCurveTo(tileSize * 0.75, tileSize, tileSize, cy);
    ctx.stroke();
  } else if (patternType === 'noise') {
    ctx.globalAlpha = 0.7;
    const dotSize = Math.max(2, Math.round(2 * (patternScale || 1)));
    for (let i = 0; i < 60; i++) {
      const rx = Math.random() * tileSize;
      const ry = Math.random() * tileSize;
      ctx.fillRect(rx, ry, dotSize, dotSize);
    }
  }
  ctx.restore();
  return c;
}

// Wrapper asíncrono para canvas de fondo que soporta customImgSrc o devuelve dataUrl/canvas
function createTexturePatternUrl(options, callback) {
  const canvas = createTexturePatternCanvas(options);
  if (options.customImgSrc) {
    const img = new window.Image();
    if (!options.customImgSrc.startsWith('data:') && !options.customImgSrc.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      const tileSize = canvas.width;
      const cx = tileSize / 2;
      const cy = tileSize / 2;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, cx - (tileSize * 0.35), cy - (tileSize * 0.35), tileSize * 0.7, tileSize * 0.7);
      if (callback) callback(canvas.toDataURL('image/png'), canvas);
    };
    img.onerror = () => {
      if (callback) callback(canvas.toDataURL('image/png'), canvas);
    };
    img.src = options.customImgSrc;
  } else {
    if (callback) callback(canvas.toDataURL('image/png'), canvas);
  }
}

// Componente de Vista Previa de Imposición 2D en Pliego A4/A3
function ImpositionPreview2D({ sheetFormat, orientation, impositionMode, manualSpacing, preset }) {
  let sheetW = sheetFormat === 'a3' ? 297 : 210;
  let sheetH = sheetFormat === 'a3' ? 420 : 297;

  if (orientation === 'landscape') {
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

  const isBleed = impositionMode === 'duplex_bleed';
  const bleed = isBleed ? 3.5 : 0;
  const gap = isBleed ? 0 : (manualSpacing || 0);

  const cellW = cardW + bleed * 2;
  const cellH = cardH + bleed * 2;

  const cols = Math.max(1, Math.floor((sheetW - 10) / (cellW + gap)));
  const rows = Math.max(1, Math.floor((sheetH - 10) / (cellH + gap)));

  const totalGridW = cols * cellW + (cols - 1) * gap;
  const totalGridH = rows * cellH + (rows - 1) * gap;
  const offsetX = (sheetW - totalGridW) / 2;
  const offsetY = (sheetH - totalGridH) / 2;

  const prevScale = 0.45;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.6rem', padding: '0.6rem', backgroundColor: 'var(--bg-surface-2)', borderRadius: 'var(--radius-sm)' }}>
      <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
        <span>Vista Previa Pliego {sheetFormat.toUpperCase()} ({cols * rows} piezas)</span>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{isBleed ? 'Dúplex Sangrado 3.5mm' : `Espaciado ${gap}mm`}</span>
      </div>

      <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
        {/* Pliego Frente */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Página 1 (Frente)</span>
          <svg width={sheetW * prevScale} height={sheetH * prevScale} viewBox={`0 0 ${sheetW} ${sheetH}`} style={{ background: '#1e1e24', border: '1px solid var(--border-subtle)', borderRadius: '4px' }}>
            {Array.from({ length: rows }).map((_, r) =>
              Array.from({ length: cols }).map((_, c) => {
                const x = offsetX + c * (cellW + gap);
                const y = offsetY + r * (cellH + gap);
                return (
                  <g key={`f-${r}-${c}`}>
                    <rect x={x} y={y} width={cellW} height={cellH} fill="#BAFDC1" opacity="0.35" stroke="#BAFDC1" strokeWidth="0.5" />
                    {isBleed && <rect x={x + bleed} y={y + bleed} width={cardW} height={cardH} fill="none" stroke="#FF5555" strokeWidth="0.5" strokeDasharray="1,1" />}
                  </g>
                );
              })
            )}
          </svg>
        </div>

        {/* Pliego Dorso (si es Dúplex) */}
        {isBleed && (
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Página 2 (Dorso Espejado)</span>
            <svg width={sheetW * prevScale} height={sheetH * prevScale} viewBox={`0 0 ${sheetW} ${sheetH}`} style={{ background: '#1e1e24', border: '1px solid var(--border-subtle)', borderRadius: '4px' }}>
              {Array.from({ length: rows }).map((_, r) =>
                Array.from({ length: cols }).map((_, c) => {
                  const frontX = offsetX + c * cellW;
                  const backX = sheetW - frontX - cellW;
                  const backY = offsetY + r * cellH;
                  return (
                    <g key={`b-${r}-${c}`}>
                      <rect x={backX} y={backY} width={cellW} height={cellH} fill="#302b63" opacity="0.45" stroke="#BAFDC1" strokeWidth="0.5" />
                      <rect x={backX + bleed} y={backY + bleed} width={cardW} height={cardH} fill="none" stroke="#FF5555" strokeWidth="0.5" strokeDasharray="1,1" />
                    </g>
                  );
                })
              )}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper de Forma Konva con soporte para relleno sólido, degradados, texturas, trazos discontinuos y sombras
function ShapeElement({ el, isDrawingMode, setSelectedId, handleDragMove, handleDragEnd, updateSelected }) {
  const [fillPatternImg, setFillPatternImg] = useState(null);
  const patternResScale = 3;

  useEffect(() => {
    if (el.fillType === 'gradient') {
      const baseW = Math.max(20, Math.round(el.width || (el.radius ? el.radius * 2 : 100)));
      const baseH = Math.max(20, Math.round(el.height || (el.radius ? el.radius * 2 : 100)));
      const w = baseW * patternResScale;
      const h = baseH * patternResScale;
      const canvas = document.createElement('canvas');
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
      if (el.customImgSrc) {
        createTexturePatternUrl({
          patternType: el.patternType || 'grid',
          bgColor: el.fill || '#111114',
          patternColor: el.patternColor || '#BAFDC1',
          patternAngle: el.patternAngle || 0,
          patternScale: el.patternScale || 1,
          patternSpacing: el.patternSpacing || 30,
          customImgSrc: el.customImgSrc
        }, (dataUrl, canvasObj) => {
          setFillPatternImg(canvasObj);
        });
      } else {
        const canvasObj = createTexturePatternCanvas({
          patternType: el.patternType || 'grid',
          bgColor: el.fill || '#111114',
          patternColor: el.patternColor || '#BAFDC1',
          patternAngle: el.patternAngle || 0,
          patternScale: el.patternScale || 1,
          patternSpacing: el.patternSpacing || 30
        });
        setFillPatternImg(canvasObj);
      }
    } else if (el.fillType === 'image' && el.customImgSrc) {
      const baseW = Math.max(20, Math.round(el.width || (el.radius ? el.radius * 2 : 100)));
      const baseH = Math.max(20, Math.round(el.height || (el.radius ? el.radius * 2 : 100)));
      const w = baseW * patternResScale;
      const h = baseH * patternResScale;
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        const scale = Math.max(w / img.width, h / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
        setFillPatternImg(canvas);
      };
      img.src = el.customImgSrc;
    } else {
      setFillPatternImg(null);
    }
  }, [
    el.fillType, el.fill, el.gradColor1, el.gradColor2, el.gradAngle, el.gradStyle, el.gradStop,
    el.patternType, el.patternColor, el.patternAngle, el.patternScale, el.patternSpacing, el.customImgSrc,
    el.width, el.height, el.radius
  ]);

  const { fillType, gradColor1, gradColor2, gradAngle, gradStyle, gradStop, patternType, patternColor, patternAngle, patternScale, patternSpacing, customImgSrc, dashStyle, ...cleanProps } = el;

  let dash = undefined;
  if (dashStyle === 'dashed') dash = [10, 5];
  if (dashStyle === 'dotted') dash = [3, 3];

  const hasPatternScaling = (fillType === 'image' || fillType === 'gradient') && fillPatternImg;

  const commonProps = {
    key: el.id,
    id: el.id,
    ...cleanProps,
    dash,
    fill: fillType && fillType !== 'color' ? undefined : el.fill,
    fillPriority: fillPatternImg ? 'pattern' : 'color',
    fillPatternImage: fillPatternImg || undefined,
    fillPatternScale: hasPatternScaling ? { x: 1 / patternResScale, y: 1 / patternResScale } : undefined,
    draggable: !isDrawingMode,
    onClick: () => !isDrawingMode && setSelectedId(el.id),
    onTap: () => !isDrawingMode && setSelectedId(el.id),
    onDragMove: (e) => handleDragMove(e, el.id),
    onDragEnd: (e) => { handleDragEnd(); updateSelected('x', e.target.x()); updateSelected('y', e.target.y()); }
  };

  if (el.type === 'rect') return <Rect {...commonProps} />;
  if (el.type === 'circle') return <Circle {...commonProps} />;
  if (el.type === 'star') return <Star {...commonProps} numPoints={5} innerRadius={(cleanProps.radius || 40)*0.45} outerRadius={cleanProps.radius || 40} />;
  if (el.type === 'star6') return <Star {...commonProps} numPoints={6} innerRadius={(cleanProps.radius || 40)*0.5} outerRadius={cleanProps.radius || 40} />;
  if (el.type === 'star8') return <Star {...commonProps} numPoints={8} innerRadius={(cleanProps.radius || 40)*0.5} outerRadius={cleanProps.radius || 40} />;

  // Formas restantes del catálogo (hexágono, octágono, diamante, escudo,
  // insignia, corazón, triángulo): antes caían todas en el "return <Rect />"
  // de más abajo y se dibujaban como un simple rectángulo. Ahora reutilizan
  // el mismo trazado de path que ya usa el recorte de imágenes
  // (drawCustomClipShape) dentro de un Shape genérico de Konva, así que
  // heredan fill/stroke/dash/degradado/textura igual que cualquier otra forma.
  const PATH_SHAPES = ['hexagon', 'octagon', 'diamond', 'shield', 'badge', 'heart', 'triangle'];
  if (PATH_SHAPES.includes(el.type)) {
    const w = cleanProps.width || (cleanProps.radius ? cleanProps.radius * 2 : 80);
    const h = cleanProps.height || (cleanProps.radius ? cleanProps.radius * 2 : 80);
    return (
      <Shape
        {...commonProps}
        width={w}
        height={h}
        sceneFunc={(ctx, shape) => {
          drawCustomClipShape(ctx, w, h, el.type, 0, 1, 1);
          ctx.fillStrokeShape(shape);
        }}
      />
    );
  }

  return <Rect {...commonProps} />;
}

// Helper de Imagen Konva con filtros no-destructivos y recorte por forma
function URLImage({ image, ...props }) {
  const [imgObj, setImgObj] = useState(null);
  const shapeRef = useRef(null);
  const groupRef = useRef(null);

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
        shapeRef.current.cache({ pixelRatio: 3 });
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
    props.blurRadius
  ]);

  // El recorte por forma (clipFunc) necesita volver a dibujarse cada vez que cambia la
  // forma, rotación o deformación, incluso sin filtros — se hace en un efecto aparte
  // porque no depende del cacheo de filtros de arriba.
  useEffect(() => {
    groupRef.current?.getLayer()?.batchDraw();
  }, [props.clipShape, props.clipRotation, props.clipScaleX, props.clipScaleY, props.width, props.height]);

  if (!imgObj) return null;

  const {
    clipShape, clipRotation, clipScaleX, clipScaleY,
    id, x, y, width, height, rotation, draggable,
    onClick, onTap, onDragMove, onDragEnd,
    ...restImageProps
  } = props;
  const hasFilter = props.brightness || props.contrast || props.saturation || props.blurRadius;

  // IMPORTANTE: Konva solo aplica `clipFunc` en nodos que son CONTENEDORES (Group, Layer,
  // Stage) — `Konva.Image` extiende de `Shape`, no de `Container`, así que un `clipFunc`
  // puesto directamente en la Image es simplemente ignorado por Konva (no tira error, no
  // hace nada, ni siquiera silenciosamente rompe algo — el recorte nunca se llega a pintar).
  // Antes el recorte estaba en la Image y por eso ninguna de las 12 formas se veía aplicada
  // pese a que la función que dibuja cada forma es correcta. La solución es envolver la
  // Image en un Group y poner el clipFunc en ese Group, que sí es un Container.
  return (
    <Group
      ref={groupRef}
      id={id}
      x={x}
      y={y}
      width={width}
      height={height}
      rotation={rotation}
      draggable={draggable}
      onClick={onClick}
      onTap={onTap}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      clipFunc={
        clipShape && clipShape !== 'none'
          ? (ctx) => drawCustomClipShape(ctx, width, height, clipShape, clipRotation || 0, clipScaleX || 1, clipScaleY || 1)
          : undefined
      }
    >
      <KonvaImage
        ref={shapeRef}
        image={imgObj}
        x={0}
        y={0}
        width={width}
        height={height}
        filters={hasFilter ? [Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.HSL, Konva.Filters.Blur] : []}
        brightness={restImageProps.brightness}
        contrast={restImageProps.contrast}
        saturation={restImageProps.saturation}
        blurRadius={restImageProps.blurRadius}
      />
    </Group>
  );
}

export default function DesignEditorSection() {
  const [preset, setPreset] = useState(PRESETS[0]);

  // Dúplex Frente / Dorso
  const [currentSide, setCurrentSide] = useState('front'); // 'front' | 'back'

  // Fondo del lienzo — un color/imagen POR CADA LADO (antes era un único
  // estado `bgColor` compartido: el fondo del dorso de una plantilla
  // (`tmpl.backBg`) nunca se aplicaba y cambiar el color en un lado pisaba
  // el del otro). `bgColor`/`setBgColor` se mantienen como alias derivados
  // del lado activo para no tener que tocar el resto del componente.
  const [bgColorFront, setBgColorFront] = useState('#111114');
  const [bgColorBack, setBgColorBack] = useState('#111114');
  const bgColor = currentSide === 'front' ? bgColorFront : bgColorBack;
  const setBgColor = (value) => {
    const setter = currentSide === 'front' ? setBgColorFront : setBgColorBack;
    if (typeof value === 'function') setter((prev) => value(prev));
    else setter(value);
  };
  const [elementsFront, setElementsFront] = useState([
    { id: 'el-1', type: 'text', text: 'KALPAGRÁFICA', x: 40, y: 50, fontSize: 26, fill: '#BAFDC1', fontFamily: 'Space Grotesk', fontWeight: 'bold' },
    { id: 'el-2', type: 'text', text: 'Estudio de Diseño & Preimpresión', x: 40, y: 90, fontSize: 14, fill: '#E5E5E7', fontFamily: 'Inter' },
    { id: 'el-3', type: 'rect', x: 40, y: 130, width: 460, height: 2, fill: '#BAFDC1' },
    { id: 'el-4', type: 'text', text: 'hola@kalpagrafica.com | +54 9 11 0000-0000', x: 40, y: 150, fontSize: 12, fill: '#9EA0A6', fontFamily: 'JetBrains Mono' }
  ]);
  const [elementsBack, setElementsBack] = useState([
    { id: 'eb-1', type: 'circle', x: 270, y: 120, radius: 70, fill: '#BAFDC1', opacity: 0.15 },
    { id: 'eb-2', type: 'text', text: 'KALPAGRÁFICA', x: 160, y: 105, fontSize: 28, fill: '#BAFDC1', fontFamily: 'Space Grotesk', fontWeight: 'bold' },
    { id: 'eb-3', type: 'text', text: 'SOLUCIONES DE IMPRESIÓN DE ALTA PRECISIÓN', x: 110, y: 145, fontSize: 11, fill: '#9EA0A6', fontFamily: 'Inter' }
  ]);

  const elements = currentSide === 'front' ? elementsFront : elementsBack;
  const setElements = (updater) => {
    if (typeof updater === 'function') {
      if (currentSide === 'front') setElementsFront((prev) => updater(prev));
      else setElementsBack((prev) => updater(prev));
    } else {
      if (currentSide === 'front') setElementsFront(updater);
      else setElementsBack(updater);
    }
  };
  
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState('canvas');
  const [imagePropSubTab, setImagePropSubTab] = useState('filters');
  const [canvasBgMode, setCanvasBgMode] = useState('color');
  const [patternType, setPatternType] = useState('grid');
  const [patternColor, setPatternColor] = useState('#BAFDC1');
  const [patternAngle, setPatternAngle] = useState(0);
  const [patternScale, setPatternScale] = useState(1);
  const [patternSpacing, setPatternSpacing] = useState(35);
  const [customImgSrc, setCustomImgSrc] = useState(null);
  const [presetCategory, setPresetCategory] = useState('Redes Sociales');
  const [impSheetFormat, setImpSheetFormat] = useState('a4');
  const [impOrientation, setImpOrientation] = useState('portrait');

  // Imposición Flexible
  const [impositionMode, setImpositionMode] = useState('duplex_bleed');
  const [manualSpacing, setManualSpacing] = useState(2);

  // Fondo Imagen
  const [bgImgSrc, setBgImgSrc] = useState(null);
  const [bgImgMode, setBgImgMode] = useState('cover');

  // Pinceles Avanzados
  const [brushType, setBrushType] = useState('basic');
  const [brushOpacity, setBrushOpacity] = useState(1);

  const [gradColor1, setGradColor1] = useState('#111114');
  const [gradColor2, setGradColor2] = useState('#302b63');
  const [gradAngle, setGradAngle] = useState(135);
  const [gradStop, setGradStop] = useState(50);
  const [gradStyle, setGradStyle] = useState('smooth');
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

  // Escalado automático del lienzo en escritorio: la columna central del
  // editor mide ~1fr (hasta ~730px), pero formatos como Díptico/Tríptico A4
  // (842px de ancho) o A3 superan ese ancho. Sin este cálculo, el Stage se
  // renderizaba a tamaño completo dentro de un contenedor angosto con
  // overflow:auto, por lo que la plantilla se veía "recortada" al no notarse
  // el scroll horizontal. Se escala solo la vista (Konva scaleX/scaleY); la
  // exportación siempre resetea a preset.width/height a escala 1, así que la
  // resolución final (300 DPI) nunca se ve afectada.
  const desktopCanvasWrapRef = useRef(null);
  const [desktopStageScale, setDesktopStageScale] = useState(1);

  useEffect(() => {
    if (isMobile) return;
    const el = desktopCanvasWrapRef.current;
    if (!el) return;
    const compute = () => {
      const availW = Math.max(120, el.clientWidth - 48);
      const availH = Math.max(120, window.innerHeight * 0.68);
      const scale = Math.min(1, availW / preset.width, availH / preset.height);
      setDesktopStageScale(scale > 0 ? scale : 1);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener('resize', compute);
    return () => { ro.disconnect(); window.removeEventListener('resize', compute); };
  }, [isMobile, preset.width, preset.height]);

  const displayScale = isMobile
    ? (mobileFullscreen ? mobileStageScale : 1)
    : desktopStageScale;

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
    if (!trRef.current || !stageRef.current) return;
    try {
      if (selectedId) {
        const node = stageRef.current.findOne('#' + selectedId);
        if (node) {
          trRef.current.nodes([node]);
          trRef.current.getLayer()?.batchDraw();
        } else {
          trRef.current.nodes([]);
          trRef.current.getLayer()?.batchDraw();
        }
      } else {
        trRef.current.nodes([]);
        trRef.current.getLayer()?.batchDraw();
      }
    } catch (e) {
      console.warn('Konva transformer sync safely skipped:', e);
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
      lineHeight: 1.2,
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
    const file = e.target.files?.[0];
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
    if (!isDrawingMode || !e.target) return;
    const stage = e.target.getStage ? e.target.getStage() : null;
    if (!stage) return;
    setIsDrawing(true);
    saveStateToHistory();
    const pos = stage.getRelativePointerPosition();
    if (!pos) return;
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
    if (!isDrawingMode || !isDrawing || !e.target) return;
    const stage = e.target.getStage ? e.target.getStage() : null;
    if (!stage) return;
    const point = stage.getRelativePointerPosition();
    if (!point) return;
    setElements((prev) => {
      if (prev.length === 0) return prev;
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

  // Antes de exportar, recachea a resolución completa cualquier imagen que tenga
  // filtros (brillo/contraste/saturación/desenfoque). El cacheo en vivo usa un
  // pixelRatio bajo (pensado solo para que la edición vaya fluida); si no se
  // vuelve a cachear a la resolución final, la imagen sale borrosa en el PNG/PDF
  // exportado aunque en pantalla se viera bien. El recorte por forma NO necesita
  // este recacheo: va en el Group contenedor (ver URLImage) y se dibuja en vivo
  // en cada frame, siempre nítido a cualquier resolución de exportación.
  // Devuelve la lista de nodos tocados para poder revertirlos después de exportar.
  const recacheImagesForExport = (stage, exportPixelRatio) => {
    const touched = [];
    stage.find('Image').forEach((node) => {
      const hasFilters = node.filters() && node.filters().length > 0;
      if (hasFilters) {
        node.cache({ pixelRatio: exportPixelRatio * 1.4 });
        touched.push(node);
      }
    });
    stage.batchDraw();
    return touched;
  };

  const restoreImagesAfterExport = (touched) => {
    touched.forEach((node) => {
      node.clearCache();
      const hasFilters = node.filters() && node.filters().length > 0;
      if (hasFilters) node.cache({ pixelRatio: 3 }); // vuelve al cacheo liviano de edición
    });
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
      const touchedImages = recacheImagesForExport(stage, 3);
      const dataURL = stage.toDataURL({ pixelRatio: 3 });
      restoreImagesAfterExport(touchedImages);
      stage.width(prevW);
      stage.height(prevH);
      stage.scale(prevScale);
      stage.batchDraw();

      const a = document.createElement('a');
      a.href = dataURL;
      const sideLabel = currentSide === 'front' ? 'Frente' : 'Dorso';
      a.download = `Diseno_${preset.id}_${sideLabel}_HD.png`;
      a.click();
    }, 100);
  };

  // Exportar a PDF Imprimible (300 DPI)
  // Exportar a PDF Imprimible (300 DPI).
  // Fix 1: el tamaño físico de página ahora se toma de `preset.unit` (el
  // mismo criterio que ya usaba exportImpositionPDF) en vez de un divisor
  // fijo "/4" que no correspondía al mm real declarado por cada formato
  // (p. ej. para A4 daba 148x210mm en lugar de 210x297mm).
  // Fix 2: si la pieza tiene contenido en el dorso, se agrega como segunda
  // página del mismo PDF — antes "PDF Imprimible" exportaba solo el lado
  // que estuviera activo en pantalla y el dorso (frecuente en Dípticos y
  // Trípticos) se perdía por completo del archivo final.
  const exportPDF = async () => {
    if (!stageRef.current) return;
    try {
      setSelectedId(null);
      await new Promise((res) => setTimeout(res, 100));

      const stage = stageRef.current;
      const prevW = stage.width(), prevH = stage.height();
      const prevScale = stage.scale();
      stage.width(preset.width);
      stage.height(preset.height);
      stage.scale({ x: 1, y: 1 });
      stage.batchDraw();

      const savedSide = currentSide;
      setCurrentSide('front');
      await new Promise((r) => setTimeout(r, 60));
      let touchedImages = recacheImagesForExport(stage, 3);
      const frontDataURL = stage.toDataURL({ pixelRatio: 3 });
      restoreImagesAfterExport(touchedImages);

      const hasBack = elementsBack && elementsBack.length > 0;
      let backDataURL = null;
      if (hasBack) {
        setCurrentSide('back');
        await new Promise((r) => setTimeout(r, 60));
        touchedImages = recacheImagesForExport(stage, 3);
        backDataURL = stage.toDataURL({ pixelRatio: 3 });
        restoreImagesAfterExport(touchedImages);
      }

      setCurrentSide(savedSide);
      stage.width(prevW);
      stage.height(prevH);
      stage.scale(prevScale);
      stage.batchDraw();

      let pageW = preset.width / 4;
      let pageH = preset.height / 4;
      if (preset.unit && preset.unit.includes('mm')) {
        const parts = preset.unit.replace(' mm', '').split('x');
        if (parts.length === 2) {
          pageW = parseFloat(parts[0]);
          pageH = parseFloat(parts[1]);
        }
      }

      const isLandscape = pageW > pageH;
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pageW, pageH]
      });
      pdf.addImage(frontDataURL, 'PNG', 0, 0, pageW, pageH);
      if (backDataURL) {
        pdf.addPage([pageW, pageH], isLandscape ? 'landscape' : 'portrait');
        pdf.addImage(backDataURL, 'PNG', 0, 0, pageW, pageH);
      }
      pdf.save(`Diseno_${preset.id}_Impresion.pdf`);
    } catch (err) {
      console.error('Error al generar el PDF imprimible:', err);
      alert('Hubo un problema al generar el PDF. Intenta nuevamente.');
    }
  };

  // Generador de PDF Mosaico Flexible (Dúplex Sangrado 3.5mm o Frente Simple con Espaciado Manual)
  const exportImpositionPDF = async () => {
    try {
      if (!stageRef.current) return;
      setSelectedId(null);
      await new Promise((res) => setTimeout(res, 100));

      const isDuplex = impositionMode === 'duplex_bleed';
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

      const bleed = isDuplex ? 3.5 : 0;
      const gap = isDuplex ? 0 : (manualSpacing || 0);

      const cellW = cardW + bleed * 2;
      const cellH = cardH + bleed * 2;

      const cols = Math.max(1, Math.floor((sheetW - 10) / (cellW + gap)));
      const rows = Math.max(1, Math.floor((sheetH - 10) / (cellH + gap)));

      const totalGridW = cols * cellW + (cols - 1) * gap;
      const totalGridH = rows * cellH + (rows - 1) * gap;
      const offsetX = (sheetW - totalGridW) / 2;
      const offsetY = (sheetH - totalGridH) / 2;

      const stage = stageRef.current;
      const prevW = stage.width(), prevH = stage.height();
      const prevScale = stage.scale();
      stage.width(preset.width);
      stage.height(preset.height);
      stage.scale({ x: 1, y: 1 });
      stage.batchDraw();

      const savedSide = currentSide;
      setCurrentSide('front');
      await new Promise((r) => setTimeout(r, 60));
      const frontDataURL = stage.toDataURL({ pixelRatio: 3 });

      let backDataURL = null;
      if (isDuplex) {
        setCurrentSide('back');
        await new Promise((r) => setTimeout(r, 60));
        backDataURL = stage.toDataURL({ pixelRatio: 3 });
      }

      setCurrentSide(savedSide);
      stage.width(prevW);
      stage.height(prevH);
      stage.scale(prevScale);
      stage.batchDraw();

      const pdf = new jsPDF({
        orientation: sheetW > sheetH ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [sheetW, sheetH]
      });

      // PÁGINA 1: FRENTE + MARCAS DE CORTE
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * (cellW + gap);
          const y = offsetY + r * (cellH + gap);

          pdf.addImage(frontDataURL, 'PNG', x, y, cellW, cellH);

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

      // PÁGINA 2: REVERSO (DORSO ESPEJADO LONG-EDGE FLIP SI ES DÚPLEX)
      if (isDuplex && backDataURL) {
        pdf.addPage([sheetW, sheetH], sheetW > sheetH ? 'landscape' : 'portrait');

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const frontX = offsetX + c * cellW;
            const backX = sheetW - frontX - cellW;
            const backY = offsetY + r * cellH;

            pdf.addImage(backDataURL, 'PNG', backX, backY, cellW, cellH);
          }
        }
      }

      pdf.save(`Mosaico_${impSheetFormat.toUpperCase()}_${isDuplex ? 'Duplex_Sangrado' : 'Frente_Simple'}_${preset.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error al generar PDF de Imposición:', err);
      alert('Hubo un problema al generar el PDF impositado. Intenta nuevamente.');
    }
  };

  const selectedElement = elements.find((el) => el.id === selectedId);

  // ---------------------------------------------------------------------
  // Contenido de la pestaña de herramientas activa
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
              {['Redes Sociales', 'Tarjetas & Papelería', 'Folletería & Editorial', 'Impresión Estándar'].map(cat => (
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
                  {cat === 'Redes Sociales' ? '📱 Redes' : cat === 'Tarjetas & Papelería' ? '🏷️ Tarjetas' : cat === 'Folletería & Editorial' ? '📜 Folletos' : '📄 Hojas'}
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

          {/* Bloque 2: Plantillas Predefinidas por Formato */}
          {DESIGN_TEMPLATES[preset.id] && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', backgroundColor: 'var(--bg-surface-2)', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>
                🌟 Plantillas Predefinidas (Frente & Dorso)
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
                {DESIGN_TEMPLATES[preset.id].map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => {
                      if (window.confirm(`¿Cargar la plantilla "${tmpl.name}"? Reemplazará los elementos del frente y dorso.`)) {
                        saveStateToHistory();
                        setBgColorFront(tmpl.frontBg);
                        setBgColorBack(tmpl.backBg);
                        setElementsFront(JSON.parse(JSON.stringify(tmpl.frontElements)));
                        setElementsBack(JSON.parse(JSON.stringify(tmpl.backElements)));
                        setSelectedId(null);
                      }
                    }}
                    style={{
                      padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: 'pointer',
                      fontSize: '0.72rem', fontWeight: 700, textAlign: 'center'
                    }}
                  >
                    🎨 {tmpl.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bloque 3: Fondo del Lienzo (Color Sólido, Textura, Degradado, Imagen) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <h4 style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>
              🎨 Fondo del Lienzo
            </h4>

            {/* Selector Modo Fondo */}
            <div style={{ display: 'flex', gap: '0.3rem', backgroundColor: 'var(--bg-surface-2)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
              {['color', 'texture', 'gradient', 'image'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setCanvasBgMode(mode)}
                  style={{
                    flex: 1, padding: '0.35rem 0.1rem', fontSize: '0.66rem', fontWeight: 700, borderRadius: 'var(--radius-sm)',
                    backgroundColor: canvasBgMode === mode ? 'var(--accent)' : 'transparent',
                    color: canvasBgMode === mode ? '#000' : 'var(--text-secondary)', border: 'none', cursor: 'pointer'
                  }}
                >
                  {mode === 'color' ? '🎨 Sólido' : mode === 'texture' ? '📐 Trama' : mode === 'gradient' ? '🌈 Degradado' : '🖼️ Imagen'}
                </button>
              ))}
            </div>

            {/* Imagen de Fondo con Ajuste Cover / Contain / Stretch */}
            {canvasBgMode === 'image' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', backgroundColor: 'var(--bg-surface-2)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                <label className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                  <Upload size={14} />
                  <span>Subir Imagen para Fondo</span>
                  <input
                    type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const url = ev.target.result;
                        setBgImgSrc(url);
                        setBgColor(url);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>

                {bgImgSrc && (
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    {[
                      { id: 'cover', label: 'Rellenar' },
                      { id: 'contain', label: 'Encajar' },
                      { id: 'stretch', label: 'Deformar' }
                    ].map((fit) => (
                      <button
                        key={fit.id}
                        type="button"
                        onClick={() => setBgImgMode(fit.id)}
                        style={{
                          flex: 1, padding: '0.3rem 0.1rem', fontSize: '0.68rem', fontWeight: 600, borderRadius: 'var(--radius-sm)',
                          backgroundColor: bgImgMode === fit.id ? 'var(--accent)' : 'var(--bg-surface)',
                          color: bgImgMode === fit.id ? '#000' : 'var(--text-primary)', border: '1px solid var(--border-subtle)', cursor: 'pointer'
                        }}
                      >
                        {fit.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Color Sólido */}
            {canvasBgMode === 'color' && (
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <input
                  type="color"
                  value={typeof bgColor === 'string' && bgColor.startsWith('#') ? bgColor : '#111114'}
                  onChange={(e) => setBgColor(e.target.value)}
                  style={{ width: '45px', height: '36px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }} className="font-mono">
                  {typeof bgColor === 'string' && bgColor.startsWith('#') ? bgColor : 'Sólido Custom'}
                </span>
              </div>
            )}

            {/* Textura / Trama */}
            {canvasBgMode === 'texture' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
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
                          patternType: pat.id,
                          bgColor: typeof bgColor === 'string' && bgColor.startsWith('#') ? bgColor : '#111114',
                          patternColor, patternAngle, patternScale, patternSpacing
                        }, (texUrl) => setBgColor(texUrl));
                      }}
                      style={{
                        padding: '0.5rem 0.3rem', borderRadius: 'var(--radius-sm)',
                        border: `1.5px solid ${!customImgSrc && patternType === pat.id ? 'var(--accent)' : 'var(--border-subtle)'}`,
                        backgroundColor: !customImgSrc && patternType === pat.id ? 'var(--accent-muted)' : 'var(--bg-surface-2)',
                        color: !customImgSrc && patternType === pat.id ? 'var(--accent)' : 'var(--text-primary)',
                        cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem'
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>{pat.icon}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>{pat.label}</span>
                    </button>
                  ))}

                  {/* Textura a partir de un ícono/imagen propia (sin fondo, se repite en trama) */}
                  <label
                    style={{
                      padding: '0.5rem 0.3rem', borderRadius: 'var(--radius-sm)',
                      border: `1.5px solid ${customImgSrc ? 'var(--accent)' : 'var(--border-subtle)'}`,
                      backgroundColor: customImgSrc ? 'var(--accent-muted)' : 'var(--bg-surface-2)',
                      color: customImgSrc ? 'var(--accent)' : 'var(--text-primary)',
                      cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem'
                    }}
                  >
                    <Upload size={15} />
                    <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Mi Ícono</span>
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
                          }, (texUrl) => setBgColor(texUrl));
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Color de Trama:</label>
                  <input
                    type="color"
                    value={patternColor}
                    onChange={(e) => {
                      setPatternColor(e.target.value);
                      createTexturePatternUrl({
                        patternType, bgColor: typeof bgColor === 'string' && bgColor.startsWith('#') ? bgColor : '#111114',
                        patternColor: e.target.value, patternAngle, patternScale, patternSpacing, customImgSrc
                      }, (texUrl) => setBgColor(texUrl));
                    }}
                    style={{ width: '100%', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    <span>Inclinación:</span>
                    <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{patternAngle}°</span>
                  </div>
                  <input
                    type="range" min={0} max={359} step={1}
                    value={patternAngle}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setPatternAngle(v);
                      createTexturePatternUrl({
                        patternType, bgColor: typeof bgColor === 'string' && bgColor.startsWith('#') ? bgColor : '#111114',
                        patternColor, patternAngle: v, patternScale, patternSpacing, customImgSrc
                      }, (texUrl) => setBgColor(texUrl));
                    }}
                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    <span>Tamaño:</span>
                    <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{patternScale.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range" min={0.3} max={3} step={0.1}
                    value={patternScale}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setPatternScale(v);
                      createTexturePatternUrl({
                        patternType, bgColor: typeof bgColor === 'string' && bgColor.startsWith('#') ? bgColor : '#111114',
                        patternColor, patternAngle, patternScale: v, patternSpacing, customImgSrc
                      }, (texUrl) => setBgColor(texUrl));
                    }}
                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    <span>Separación:</span>
                    <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{patternSpacing}px</span>
                  </div>
                  <input
                    type="range" min={16} max={90} step={1}
                    value={patternSpacing}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setPatternSpacing(v);
                      createTexturePatternUrl({
                        patternType, bgColor: typeof bgColor === 'string' && bgColor.startsWith('#') ? bgColor : '#111114',
                        patternColor, patternAngle, patternScale, patternSpacing: v, customImgSrc
                      }, (texUrl) => setBgColor(texUrl));
                    }}
                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                  />
                </div>
              </div>
            )}

            {/* Degradado */}
            {canvasBgMode === 'gradient' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  {[
                    { id: 'smooth', label: 'Suave' },
                    { id: 'sharp', label: 'Mitad 50/50' },
                    { id: 'radial', label: 'Radial' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setGradStyle(st.id);
                        const css = st.id === 'radial'
                          ? `radial-gradient(circle at center, ${gradColor1} 0%, ${gradColor2} 100%)`
                          : st.id === 'sharp'
                            ? `linear-gradient(${gradAngle}deg, ${gradColor1} 0% ${gradStop}%, ${gradColor2} ${gradStop}% 100%)`
                            : `linear-gradient(${gradAngle}deg, ${gradColor1} 0%, ${gradColor2} 100%)`;
                        setBgColor(css);
                      }}
                      style={{
                        flex: 1, padding: '0.3rem 0.2rem', fontSize: '0.68rem', fontWeight: 600, borderRadius: 'var(--radius-sm)',
                        backgroundColor: gradStyle === st.id ? 'var(--accent)' : 'var(--bg-surface-2)',
                        color: gradStyle === st.id ? '#000' : 'var(--text-primary)', border: '1px solid var(--border-subtle)', cursor: 'pointer'
                      }}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Color 1:</label>
                    <input
                      type="color" value={gradColor1}
                      onChange={(e) => {
                        setGradColor1(e.target.value);
                        const css = gradStyle === 'radial'
                          ? `radial-gradient(circle at center, ${e.target.value} 0%, ${gradColor2} 100%)`
                          : gradStyle === 'sharp'
                            ? `linear-gradient(${gradAngle}deg, ${e.target.value} 0% ${gradStop}%, ${gradColor2} ${gradStop}% 100%)`
                            : `linear-gradient(${gradAngle}deg, ${e.target.value} 0%, ${gradColor2} 100%)`;
                        setBgColor(css);
                      }}
                      style={{ width: '100%', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Color 2:</label>
                    <input
                      type="color" value={gradColor2}
                      onChange={(e) => {
                        setGradColor2(e.target.value);
                        const css = gradStyle === 'radial'
                          ? `radial-gradient(circle at center, ${gradColor1} 0%, ${e.target.value} 100%)`
                          : gradStyle === 'sharp'
                            ? `linear-gradient(${gradAngle}deg, ${gradColor1} 0% ${gradStop}%, ${e.target.value} ${gradStop}% 100%)`
                            : `linear-gradient(${gradAngle}deg, ${gradColor1} 0%, ${e.target.value} 100%)`;
                        setBgColor(css);
                      }}
                      style={{ width: '100%', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                    />
                  </div>
                </div>

                {gradStyle !== 'radial' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      <span>Ángulo:</span>
                      <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{gradAngle}°</span>
                    </div>
                    <input
                      type="range" min={0} max={359} step={1} value={gradAngle}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setGradAngle(v);
                        const css = gradStyle === 'sharp'
                          ? `linear-gradient(${v}deg, ${gradColor1} 0% ${gradStop}%, ${gradColor2} ${gradStop}% 100%)`
                          : `linear-gradient(${v}deg, ${gradColor1} 0%, ${gradColor2} 100%)`;
                        setBgColor(css);
                      }}
                      style={{ width: '100%', accentColor: 'var(--accent)' }}
                    />
                  </div>
                )}

                {gradStyle === 'sharp' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      <span>Punto de Corte:</span>
                      <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{gradStop}%</span>
                    </div>
                    <input
                      type="range" min={5} max={95} step={1} value={gradStop}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setGradStop(v);
                        setBgColor(`linear-gradient(${gradAngle}deg, ${gradColor1} 0% ${v}%, ${gradColor2} ${v}% 100%)`);
                      }}
                      style={{ width: '100%', accentColor: 'var(--accent)' }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Presets:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.3rem' }}>
                    {GRADIENT_PRESETS.map((grad) => (
                      <button
                        key={grad.name}
                        type="button"
                        onClick={() => {
                          setGradColor1(grad.colors[0]);
                          setGradColor2(grad.colors[grad.colors.length - 1]);
                          setGradAngle(grad.angle);
                          setGradStyle('smooth');
                          setBgColor(`linear-gradient(${grad.angle}deg, ${grad.colors.join(', ')})`);
                        }}
                        title={grad.name}
                        style={{
                          height: '32px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', cursor: 'pointer',
                          background: `linear-gradient(${grad.angle}deg, ${grad.colors.join(', ')})`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bloque 4: Imposición Flexible (Dúplex Sangrado vs Frente Simple con Espaciado) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', backgroundColor: 'var(--bg-surface-2)', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--accent)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Printer size={16} color="var(--accent)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>
                🖨️ Imposición Flexible A4 / A3
              </span>
            </div>

            {/* Selector Modo Imposición */}
            <div style={{ display: 'flex', gap: '0.3rem', backgroundColor: 'var(--bg-surface)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
              <button
                type="button"
                onClick={() => setImpositionMode('duplex_bleed')}
                style={{
                  flex: 1, padding: '0.35rem 0.2rem', fontSize: '0.66rem', fontWeight: 700, borderRadius: 'var(--radius-sm)',
                  backgroundColor: impositionMode === 'duplex_bleed' ? 'var(--accent)' : 'transparent',
                  color: impositionMode === 'duplex_bleed' ? '#000' : 'var(--text-secondary)', border: 'none', cursor: 'pointer'
                }}
              >
                🖨️ Dúplex (Sangrado 3.5mm)
              </button>
              <button
                type="button"
                onClick={() => setImpositionMode('front_single')}
                style={{
                  flex: 1, padding: '0.35rem 0.2rem', fontSize: '0.66rem', fontWeight: 700, borderRadius: 'var(--radius-sm)',
                  backgroundColor: impositionMode === 'front_single' ? 'var(--accent)' : 'transparent',
                  color: impositionMode === 'front_single' ? '#000' : 'var(--text-secondary)', border: 'none', cursor: 'pointer'
                }}
              >
                ✂️ Frente (Espaciado Manual)
              </button>
            </div>

            {/* Slider de Espaciado Manual (si es Frente Simple) */}
            {impositionMode === 'front_single' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  <span>Espaciado entre Tarjetas:</span>
                  <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{manualSpacing} mm</span>
                </div>
                <input
                  type="range" min={0} max={10} step={0.5}
                  value={manualSpacing}
                  onChange={(e) => setManualSpacing(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent)' }}
                />
              </div>
            )}

            {/* Formato Hoja A4 / A3 */}
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

            {/* Vista Previa Visual 2D del Pliego A4/A3 */}
            <ImpositionPreview2D
              sheetFormat={impSheetFormat}
              orientation={impOrientation}
              impositionMode={impositionMode}
              manualSpacing={manualSpacing}
              preset={preset}
            />

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={exportImpositionPDF}
              style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', marginTop: '0.4rem' }}
            >
              <FileText size={15} />
              <span>Generar PDF Mosaico {impSheetFormat.toUpperCase()} ({impositionMode === 'duplex_bleed' ? 'Dúplex' : 'Frente'})</span>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {WEB_FONTS.map((font) => (
              <button
                key={font.name}
                onClick={() => addText(font.name, font.name, 22)}
                style={{
                  backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)', padding: '0.6rem 0.8rem', textAlign: 'left',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}
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
                      fontSize: '1.4rem', backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)', padding: '0.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
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
            Pincel de Dibujo Libre (Multitrazos)
          </h4>

          <div style={{ padding: '0.8rem', backgroundColor: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
            <button
              onClick={() => { setIsDrawingMode(!isDrawingMode); setSelectedId(null); }}
              className={`btn ${isDrawingMode ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}
            >
              <Brush size={16} />
              <span>{isDrawingMode ? 'Modo Pincel ACTIVO' : 'Activar Pincel'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                Tipo de Pincel:
              </label>
              <select
                value={brushType}
                onChange={(e) => setBrushType(e.target.value)}
                style={{ width: '100%', padding: '0.4rem', backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}
              >
                <option value="basic">🖌️ Pincel Estándar</option>
                <option value="marker">🖍️ Resaltador (Marcador Transparente)</option>
                <option value="calligraphy">✒️ Pluma Caligráfica</option>
                <option value="neon">⚡ Resplandor Neón</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                Color del Trazo
              </label>
              <input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                style={{ width: '100%', height: '34px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                <span>Grosor del Trazo:</span>
                <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{brushSize}px</span>
              </div>
              <input
                type="range" min={1} max={40}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                <span>Transparencia Pincel:</span>
                <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{Math.round(brushOpacity * 100)}%</span>
              </div>
              <input
                type="range" min={0.1} max={1} step={0.05}
                value={brushOpacity}
                onChange={(e) => setBrushOpacity(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent)' }}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'shapes' && (
        <div>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.8rem', textTransform: 'uppercase' }}>
            Añadir Formas Vectoriales (Office & Affinity Style)
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
            {VECTOR_SHAPES_CATALOG.map((shape) => (
              <button
                key={shape.id}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  if (shape.id === 'rect') addRect();
                  else if (shape.id === 'circle') addCircle();
                  else if (shape.id === 'star') addStar();
                  else {
                    saveStateToHistory();
                    const newEl = {
                      id: `${shape.id}-${Date.now()}`,
                      type: shape.id,
                      x: preset.width / 2 - 40,
                      y: preset.height / 2 - 40,
                      radius: 40,
                      width: 80,
                      height: 80,
                      fill: '#BAFDC1',
                      opacity: 1,
                      rotation: 0
                    };
                    setElements((prev) => [...prev, newEl]);
                    setSelectedId(newEl.id);
                  }
                }}
                style={{ justifyContent: 'flex-start', gap: '0.4rem', fontSize: '0.72rem' }}
              >
                <span>{shape.icon}</span>
                <span>{shape.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'image' && (
        <div>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.8rem', textTransform: 'uppercase' }}>
            Añadir Imagen & Logo
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {/* Info del formato actual */}
        <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.3rem' }}>📐 {preset.name}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{preset.unit} • {preset.width}×{preset.height} px</div>
        </div>

        {/* Galería de Plantillas */}
        {DESIGN_TEMPLATES[preset.id] && DESIGN_TEMPLATES[preset.id].length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>
              🎨 Plantillas para {preset.name}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {DESIGN_TEMPLATES[preset.id].map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => {
                    if (window.confirm(`¿Cargar la plantilla "${tmpl.name}"?\nReemplazará los elementos actuales del frente y dorso.`)) {
                      saveStateToHistory();
                      setBgColorFront(tmpl.frontBg);
                      setBgColorBack(tmpl.backBg);
                      setElementsFront(JSON.parse(JSON.stringify(tmpl.frontElements)));
                      setElementsBack(JSON.parse(JSON.stringify(tmpl.backElements)));
                      setSelectedId(null);
                    }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)', cursor: 'pointer', textAlign: 'left'
                  }}
                >
                  {/* Mini Preview SVG */}
                  <div style={{
                    width: '54px', height: '32px', borderRadius: '3px', flexShrink: 0,
                    background: tmpl.preview?.bg || '#111114',
                    border: `1.5px solid ${tmpl.preview?.accent || '#BAFDC1'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <div style={{ width: '20px', height: '1.5px', backgroundColor: tmpl.preview?.accent || '#BAFDC1' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)' }}>{tmpl.name}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Frente + Dorso</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-disabled)', textAlign: 'center', padding: '1.5rem 0' }}>
            Toca un elemento del lienzo para ver sus propiedades, o elegí un formato con plantillas disponibles.
          </div>
        )}
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        {selectedElement.type === 'text' && (
          <>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                Contenido de Texto <span style={{ color: 'var(--text-disabled)', fontWeight: 400 }}>(Enter = salto de línea / punto aparte)</span>
              </label>
              <textarea
                value={selectedElement.text}
                onChange={(e) => updateSelected('text', e.target.value)}
                className="input"
                rows={Math.max(3, (selectedElement.text.match(/\n/g)?.length || 0) + 2)}
                style={{ width: '100%', fontSize: '0.85rem', fontFamily: selectedElement.fontFamily, resize: 'vertical', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}
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
                Interlineado / Espaciado entre Líneas ({(selectedElement.lineHeight ?? 1.2).toFixed(1)})
              </label>
              <input
                type="range"
                min={0.8}
                max={2.5}
                step={0.1}
                value={selectedElement.lineHeight ?? 1.2}
                onChange={(e) => updateSelected('lineHeight', Number(e.target.value))}
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

        {['rect', 'circle', 'star', 'star6', 'star8', 'hexagon', 'octagon', 'diamond', 'shield', 'badge', 'heart', 'triangle'].includes(selectedElement.type) && (
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
                onClick={() => {
                  updateSelected('fillType', 'texture');
                  if (!selectedElement.patternColor) {
                    const defaultPatColor = (selectedElement.fill || '#BAFDC1') === '#BAFDC1' ? '#111114' : '#BAFDC1';
                    updateSelected('patternColor', defaultPatColor);
                  }
                }}
                style={{
                  flex: 1, padding: '0.3rem 0.2rem', fontSize: '0.68rem', fontWeight: 700, borderRadius: 'var(--radius-sm)',
                  backgroundColor: selectedElement.fillType === 'texture' ? 'var(--accent)' : 'transparent',
                  color: selectedElement.fillType === 'texture' ? '#000' : 'var(--text-secondary)',
                  border: 'none', cursor: 'pointer'
                }}
              >
                🏁 Textura
              </button>
              <button
                type="button"
                onClick={() => updateSelected('fillType', 'image')}
                style={{
                  flex: 1, padding: '0.3rem 0.2rem', fontSize: '0.68rem', fontWeight: 700, borderRadius: 'var(--radius-sm)',
                  backgroundColor: selectedElement.fillType === 'image' ? 'var(--accent)' : 'transparent',
                  color: selectedElement.fillType === 'image' ? '#000' : 'var(--text-secondary)',
                  border: 'none', cursor: 'pointer'
                }}
              >
                🖼️ Imagen
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

            {selectedElement.fillType === 'image' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <label className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <ImageIcon size={14} />
                  <span>{selectedElement.customImgSrc ? 'Cambiar Imagen de Fondo' : 'Subir Imagen de Fondo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => updateSelectedWithHistory('customImgSrc', ev.target.result);
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                {selectedElement.customImgSrc && (
                  <img
                    src={selectedElement.customImgSrc}
                    alt="Vista previa"
                    style={{ width: '100%', maxHeight: '90px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                  />
                )}
                <span style={{ fontSize: '0.66rem', color: 'var(--text-disabled)' }}>
                  La imagen se recorta para llenar toda la forma (modo "cubrir").
                </span>
              </div>
            )}

            {selectedElement.fillType === 'texture' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Estilo de Trama Vectorial:
                </label>

                {/* Selector de Tramas Vectoriales Nativas */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
                  {[
                    { id: 'grid', label: 'Cuadrícula', icon: '📐' },
                    { id: 'dots', label: 'Puntos', icon: '⚪' },
                    { id: 'stripes', label: 'Franjas', icon: '📊' },
                    { id: 'checkerboard', label: 'Ajedrez', icon: '🏁' },
                    { id: 'paper', label: 'Lino/Red', icon: '📜' },
                    { id: 'waves', label: 'Olas', icon: '🌊' }
                  ].map((pat) => (
                    <button
                      key={pat.id}
                      type="button"
                      onClick={() => updateSelected('patternType', pat.id)}
                      style={{
                        padding: '0.45rem 0.2rem', fontSize: '0.65rem', borderRadius: 'var(--radius-sm)',
                        border: `1.5px solid ${(selectedElement.patternType || 'grid') === pat.id ? 'var(--accent)' : 'var(--border-subtle)'}`,
                        backgroundColor: (selectedElement.patternType || 'grid') === pat.id ? 'var(--accent-muted)' : 'var(--bg-surface-2)',
                        color: (selectedElement.patternType || 'grid') === pat.id ? 'var(--accent)' : 'var(--text-primary)',
                        cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem'
                      }}
                    >
                      <span style={{ fontSize: '1rem' }}>{pat.icon}</span>
                      <span style={{ fontWeight: 600 }}>{pat.label}</span>
                    </button>
                  ))}
                </div>

                {/* CONTROLES DIRECTOS DE COLOR */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: 'var(--bg-surface-2)', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)' }}>
                    🎨 Paleta de Colores de la Trama:
                  </span>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem', fontWeight: 600 }}>
                        🎨 Color Base (Fondo):
                      </label>
                      <input
                        type="color"
                        value={selectedElement.fill || '#111114'}
                        onChange={(e) => updateSelected('fill', e.target.value)}
                        style={{ width: '100%', height: '34px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.68rem', color: 'var(--accent)', display: 'block', marginBottom: '0.2rem', fontWeight: 600 }}>
                        🏁 Color de Trama:
                      </label>
                      <input
                        type="color"
                        value={selectedElement.patternColor || '#BAFDC1'}
                        onChange={(e) => updateSelected('patternColor', e.target.value)}
                        style={{ width: '100%', height: '34px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                      />
                    </div>
                  </div>
                </div>

                {/* TAMAÑO / ESCALA */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                    <span>Tamaño de Trama:</span>
                    <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{(selectedElement.patternScale || 1).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range" min={0.4} max={3.5} step={0.1}
                    value={selectedElement.patternScale || 1}
                    onChange={(e) => updateSelected('patternScale', Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                  />
                </div>

                {/* ESPACIADO */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                    <span>Espaciado Trama:</span>
                    <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{selectedElement.patternSpacing || 30}px</span>
                  </div>
                  <input
                    type="range" min={12} max={100} step={2}
                    value={selectedElement.patternSpacing || 30}
                    onChange={(e) => updateSelected('patternSpacing', Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                  />
                </div>

                {/* INCLINACIÓN */}
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

            {/* Borde: color, grosor y tipo de línea — antes no existían
                controles para esto y solo se podía cambiar el relleno. */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.7rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Borde de la Forma:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Color de Borde:</label>
                  <input
                    type="color"
                    value={selectedElement.stroke || '#BAFDC1'}
                    onChange={(e) => updateSelected('stroke', e.target.value)}
                    style={{ width: '100%', height: '30px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                  />
                </div>
                <button
                  type="button"
                  title="Quitar borde"
                  onClick={() => { updateSelected('stroke', undefined); updateSelected('strokeWidth', 0); }}
                  className="btn btn-sm"
                  style={{ alignSelf: 'flex-end', height: '30px' }}
                >
                  Sin borde
                </button>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                  <span>Grosor de Borde:</span>
                  <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>{selectedElement.strokeWidth ?? 0}px</span>
                </div>
                <input
                  type="range" min={0} max={20} step={1}
                  value={selectedElement.strokeWidth ?? 0}
                  onChange={(e) => updateSelected('strokeWidth', Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Tipo de Línea:</label>
                <div style={{ display: 'flex', gap: '0.3rem', backgroundColor: 'var(--bg-surface-2)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
                  {[{ id: 'solid', label: 'Sólida' }, { id: 'dashed', label: 'Discontinua' }, { id: 'dotted', label: 'Punteada' }].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateSelected('dashStyle', opt.id)}
                      style={{
                        flex: 1, padding: '0.3rem 0.2rem', fontSize: '0.68rem', fontWeight: 700, borderRadius: 'var(--radius-sm)',
                        backgroundColor: (selectedElement.dashStyle || 'solid') === opt.id ? 'var(--accent)' : 'transparent',
                        color: (selectedElement.dashStyle || 'solid') === opt.id ? '#000' : 'var(--text-secondary)',
                        border: 'none', cursor: 'pointer'
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
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
                ✂️ Forma Recorte
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
          </>
        )}

        {/* Opacidad / Transparencia Universal para cualquier elemento */}
        <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            <span>Opacidad / Transparencia Global:</span>
            <span className="font-mono" style={{ color: 'var(--accent)', fontWeight: 700 }}>
              {Math.round((selectedElement.opacity ?? 1) * 100)}%
            </span>
          </div>
          <input
            type="range" min={0} max={1} step={0.05}
            value={selectedElement.opacity ?? 1}
            onChange={(e) => updateSelected('opacity', Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent)' }}
          />
        </div>

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
      {/* Conmutador Frente / Dorso */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.8rem', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={() => { setCurrentSide('front'); setSelectedId(null); }}
          style={{
            padding: '0.45rem 1.2rem', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.8rem',
            backgroundColor: currentSide === 'front' ? 'var(--accent)' : 'var(--bg-surface-2)',
            color: currentSide === 'front' ? '#000' : 'var(--text-secondary)',
            border: `1.5px solid ${currentSide === 'front' ? 'var(--accent)' : 'var(--border-subtle)'}`,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: 'var(--shadow-subtle)'
          }}
        >
          📄 Frente (Anverso) {elementsFront.length > 0 && `(${elementsFront.length})`}
        </button>

        <button
          type="button"
          onClick={() => { setCurrentSide('back'); setSelectedId(null); }}
          style={{
            padding: '0.45rem 1.2rem', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.8rem',
            backgroundColor: currentSide === 'back' ? 'var(--accent)' : 'var(--bg-surface-2)',
            color: currentSide === 'back' ? '#000' : 'var(--text-secondary)',
            border: `1.5px solid ${currentSide === 'back' ? 'var(--accent)' : 'var(--border-subtle)'}`,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: 'var(--shadow-subtle)'
          }}
        >
          📄 Dorso (Reverso) {elementsBack.length > 0 && `(${elementsBack.length})`}
        </button>
      </div>

      <div
        style={{
          width: preset.width * displayScale,
          height: preset.height * displayScale,
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          borderRadius: '4px',
          overflow: 'hidden',
          backgroundColor: '#111114',
          transition: 'width 0.2s, height 0.2s'
        }}
      >
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
              if (['rect', 'circle', 'star', 'star6', 'star8', 'hexagon', 'octagon', 'diamond', 'shield', 'badge', 'heart', 'triangle'].includes(el.type)) {
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
          <div ref={desktopCanvasWrapRef} style={{
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


      <style>{`
        .font-item-btn:hover { border-color: var(--accent) !important; background-color: var(--accent-muted) !important; }
        .emoji-btn:hover { transform: scale(1.2); border-color: var(--accent) !important; }
      `}</style>
    </section>
  );
}
