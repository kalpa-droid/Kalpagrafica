import React, { useState, useMemo } from 'react';
import { Type, Ruler, Layout, Printer } from 'lucide-react';
import { ToolCard, FieldLabel } from './CommonComponents';

const TYPE_PRESETS = [
  // Categoría 1: Escalas Modulares Matemáticas
  { id: 'mod-balanced', category: 'Escalas Modulares Matemáticas', name: 'Balanceada (Minor Third 1.200) ★ Default', ratio: 1.2, base: 16, lhRatio: 1.5, type: 'modular' },
  { id: 'mod-compact', category: 'Escalas Modulares Matemáticas', name: 'Compacta (Major Second 1.125)', ratio: 1.125, base: 16, lhRatio: 1.45, type: 'modular' },
  { id: 'mod-modern', category: 'Escalas Modulares Matemáticas', name: 'Moderna (Major Third 1.250)', ratio: 1.25, base: 16, lhRatio: 1.5, type: 'modular' },
  { id: 'mod-editorial', category: 'Escalas Modulares Matemáticas', name: 'Editorial (Perfect Fourth 1.333)', ratio: 1.333, base: 16, lhRatio: 1.5, type: 'modular' },
  { id: 'mod-dramatic', category: 'Escalas Modulares Matemáticas', name: 'Dramática (Augmented Fourth 1.414)', ratio: 1.414, base: 16, lhRatio: 1.5, type: 'modular' },
  { id: 'mod-golden', category: 'Escalas Modulares Matemáticas', name: 'Ratio Áurea (Golden Ratio 1.618)', ratio: 1.618, base: 16, lhRatio: 1.5, type: 'modular' },

  // Categoría 2: Sistemas de Diseño Web
  { id: 'ds-material3', category: 'Sistemas de Diseño Web', name: 'Google Material Design 3', h1: 32, h2: 28, h3: 24, h4: 22, body: 16, small: 12, lhRatio: 1.5, type: 'fixed' },
  { id: 'ds-apple-hig', category: 'Sistemas de Diseño Web', name: 'Apple HIG (San Francisco)', h1: 28, h2: 22, h3: 20, h4: 17, body: 17, small: 13, lhRatio: 1.29, type: 'fixed' },
  { id: 'ds-tailwind', category: 'Sistemas de Diseño Web', name: 'Tailwind CSS Default', h1: 36, h2: 30, h3: 24, h4: 20, body: 16, small: 12, lhRatio: 1.5, type: 'fixed' },
  { id: 'ds-carbon', category: 'Sistemas de Diseño Web', name: 'IBM Carbon (Productive)', h1: 42, h2: 32, h3: 28, h4: 20, body: 16, small: 12, lhRatio: 1.5, type: 'fixed' },
  { id: 'ds-bootstrap', category: 'Sistemas de Diseño Web', name: 'Bootstrap 5', h1: 40, h2: 32, h3: 28, h4: 24, body: 16, small: 14, lhRatio: 1.5, type: 'fixed' },
  { id: 'ds-antdesign', category: 'Sistemas de Diseño Web', name: 'Ant Design Enterprise', h1: 38, h2: 30, h3: 24, h4: 20, body: 14, small: 12, lhRatio: 1.57, type: 'fixed' },

  // Categoría 3: Editorial & Impresión Clásica
  { id: 'ed-bringhurst', category: 'Editorial & Impresión Clásica', name: 'Bringhurst Libro Clásico', h1: 48, h2: 32, h3: 24, h4: 19, body: 14, small: 11, lhRatio: 1.33, type: 'fixed' },
  { id: 'ed-magazine', category: 'Editorial & Impresión Clásica', name: 'Revista Alta Moda (Vogue Style)', h1: 48, h2: 32, h3: 24, h4: 18, body: 16, small: 12, lhRatio: 1.6, type: 'fixed' },
  { id: 'ed-poster', category: 'Editorial & Impresión Clásica', name: 'Póster Swiss / Internacional', h1: 64, h2: 40, h3: 26, h4: 20, body: 16, small: 12, lhRatio: 1.5, type: 'fixed' }
];

const SOCIAL_LIMITS_DB = [
  {
    id: 'facebook',
    name: 'Facebook (incl. Meta Business Suite & Reels)',
    fields: [
      { label: 'Publicación de Texto / Post', limit: 63206, truncate: 140 },
      { label: 'Texto / Descripción de Reel', limit: 63206, truncate: 140 },
      { label: 'Título del Reel (Meta Business Suite)', limit: 255 },
      { label: 'Prueba A/B Títulos de Reel (Opciones)', limit: 255 },
      { label: 'Título de Video Convencional', limit: 255 },
      { label: 'Descripción de Video Convencional', limit: 63206, truncate: 140 },
      { label: 'Comentario', limit: 8000 },
      { label: 'Nombre de Página', limit: 50 },
      { label: 'Nombre de Grupo', limit: 75 },
      { label: 'Descripción de Evento', limit: 63206 },
      { label: 'Título de Anuncio (Headline)', limit: 40 },
      { label: 'Texto Principal Anuncio (Primary)', limit: 125, truncate: 125 }
    ]
  },
  {
    id: 'instagram',
    name: 'Instagram (incl. Reels)',
    fields: [
      { label: 'Pie de Foto / Caption (Feed & Reels)', limit: 2200, truncate: 125 },
      { label: 'Biografía (Bio)', limit: 150 },
      { label: 'Comentario', limit: 2200 },
      { label: 'Descripción de Reels', limit: 2200, truncate: 125 },
      { label: 'Nombre de Usuario (@handle)', limit: 30 },
      { label: 'Límite Máximo de Hashtags', limit: 30, isCount: true }
    ]
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    fields: [
      { label: 'Tweet Estándar (Gratis)', limit: 280 },
      { label: 'Post X Premium', limit: 25000, truncate: 280 },
      { label: 'Mensaje Directo (DM)', limit: 10000 },
      { label: 'Biografía', limit: 160 },
      { label: 'Nombre Visible (Display Name)', limit: 50 },
      { label: 'Handle (@username)', limit: 15 }
    ]
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    fields: [
      { label: 'Descripción de Video / Caption', limit: 4000, truncate: 100 },
      { label: 'Comentario', limit: 150 },
      { label: 'Biografía', limit: 80 },
      { label: 'Nombre de Usuario', limit: 24 }
    ]
  },
  {
    id: 'youtube',
    name: 'YouTube',
    fields: [
      { label: 'Título de Video', limit: 100, truncate: 70 },
      { label: 'Descripción de Video', limit: 5000, truncate: 150 },
      { label: 'Comentario', limit: 10000 },
      { label: 'Nombre del Canal', limit: 50 },
      { label: 'Título de Playlist', limit: 150 },
      { label: 'Título de Shorts', limit: 100 }
    ]
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    fields: [
      { label: 'Publicación de Perfil / Post', limit: 3000, truncate: 140 },
      { label: 'Título de Artículo', limit: 100 },
      { label: 'Comentario', limit: 1250 },
      { label: 'Titular de Perfil (Headline)', limit: 220 },
      { label: 'Acerca de / Extracto', limit: 2600, truncate: 300 },
      { label: 'Descripción de Empresa', limit: 2000 },
      { label: 'Titular Anuncio (Ad Headline)', limit: 70 }
    ]
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    fields: [
      { label: 'Título del Pin', limit: 100, truncate: 50 },
      { label: 'Descripción del Pin', limit: 500, truncate: 60 },
      { label: 'Nombre del Tablero', limit: 50 },
      { label: 'Descripción del Tablero', limit: 500 }
    ]
  },
  {
    id: 'threads',
    name: 'Threads',
    fields: [
      { label: 'Publicación de Texto (Post)', limit: 500 },
      { label: 'Biografía (Bio)', limit: 150 }
    ]
  },
  {
    id: 'bluesky',
    name: 'Bluesky',
    fields: [
      { label: 'Publicación de Texto (Post)', limit: 300 },
      { label: 'Biografía', limit: 256 },
      { label: 'Nombre Visible', limit: 64 }
    ]
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    fields: [
      { label: 'Estado de Texto', limit: 700 },
      { label: 'Nombre de Grupo', limit: 100 },
      { label: 'Mensaje de Chat', limit: 65536 },
      { label: 'Info de Perfil (About)', limit: 50 }
    ]
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    fields: [
      { label: 'Texto de Snap Estándar', limit: 80 },
      { label: 'Caption de Historia Expandida', limit: 250 },
      { label: 'Caption de Spotlight', limit: 160 }
    ]
  },
  {
    id: 'etsy',
    name: 'Etsy',
    fields: [
      { label: 'Título de Tienda', limit: 55 },
      { label: 'Título del Producto / Listing', limit: 140, truncate: 60 },
      { label: 'Descripción del Producto', limit: 10000, truncate: 160 },
      { label: 'Etiqueta por Tag', limit: 20 }
    ]
  },
  {
    id: 'google_business',
    name: 'Google Business Profile',
    fields: [
      { label: 'Publicación de Novedades', limit: 1500, truncate: 100 },
      { label: 'Descripción de Empresa', limit: 750, truncate: 250 }
    ]
  },
  {
    id: 'discord',
    name: 'Discord',
    fields: [
      { label: 'Mensaje Gratis', limit: 2000 },
      { label: 'Mensaje Nitro', limit: 4000 },
      { label: 'Nombre de Servidor', limit: 100 },
      { label: 'Nombre de Canal', limit: 100 }
    ]
  },
  {
    id: 'twitch',
    name: 'Twitch',
    fields: [
      { label: 'Título de Stream / Transmisión', limit: 140, truncate: 36 },
      { label: 'Biografía / Acerca de', limit: 300 }
    ]
  },
  {
    id: 'mastodon',
    name: 'Mastodon',
    fields: [
      { label: 'Toot / Publicación Estándar', limit: 500 },
      { label: 'Biografía', limit: 500 }
    ]
  },
  {
    id: 'reddit',
    name: 'Reddit',
    fields: [
      { label: 'Título de Publicación', limit: 300 },
      { label: 'Comentario', limit: 10000 },
      { label: 'Cuerpo de Publicación (Text Post)', limit: 40000 }
    ]
  }
];

const PAPER_SIZES_MM = [
  { name: 'A5', mm: '148 × 210 mm', px300: '1748 × 2480 px', w: 30, h: 42 },
  { name: 'A4', mm: '210 × 297 mm', px300: '2480 × 3508 px', w: 42, h: 60 },
  { name: 'US Letter', mm: '216 × 279 mm', px300: '2550 × 3300 px', w: 44, h: 56 },
  { name: 'US Legal', mm: '216 × 356 mm', px300: '2550 × 4200 px', w: 44, h: 72 },
  { name: 'A3', mm: '297 × 420 mm', px300: '3508 × 4961 px', w: 60, h: 85 },
  { name: 'A2', mm: '420 × 594 mm', px300: '4961 × 7016 px', w: 85, h: 120 }
];

export default function TypeTab() {
  const [selectedPresetId, setSelectedPresetId] = useState('mod-balanced');
  const [baseFontSize, setBaseFontSize] = useState(16);
  const [scaleRatio, setScaleRatio] = useState(1.2);
  const [lhRatio, setLhRatio] = useState(1.5);

  const activeTypePreset = useMemo(() => {
    return TYPE_PRESETS.find(p => p.id === selectedPresetId) || TYPE_PRESETS[0];
  }, [selectedPresetId]);

  const handleTypePresetChange = (presetId) => {
    setSelectedPresetId(presetId);
    const p = TYPE_PRESETS.find(item => item.id === presetId);
    if (!p) return;
    if (p.base) setBaseFontSize(p.base);
    if (p.ratio) setScaleRatio(p.ratio);
    if (p.lhRatio) setLhRatio(p.lhRatio);
  };

  const fontSizesResolved = useMemo(() => {
    if (activeTypePreset.type === 'fixed') {
      return {
        h1: activeTypePreset.h1,
        h2: activeTypePreset.h2,
        h3: activeTypePreset.h3,
        h4: activeTypePreset.h4,
        body: activeTypePreset.body,
        small: activeTypePreset.small
      };
    } else {
      return {
        h1: Math.round(baseFontSize * Math.pow(scaleRatio, 4)),
        h2: Math.round(baseFontSize * Math.pow(scaleRatio, 3)),
        h3: Math.round(baseFontSize * Math.pow(scaleRatio, 2)),
        h4: Math.round(baseFontSize * Math.pow(scaleRatio, 1)),
        body: baseFontSize,
        small: Math.round(baseFontSize * Math.pow(scaleRatio, -1))
      };
    }
  }, [activeTypePreset, baseFontSize, scaleRatio]);

  const fontScaleList = useMemo(() => {
    return [
      { tag: 'H1 Hero Title', px: fontSizesResolved.h1, rem: (fontSizesResolved.h1 / 16).toFixed(3) },
      { tag: 'H2 Main Title', px: fontSizesResolved.h2, rem: (fontSizesResolved.h2 / 16).toFixed(3) },
      { tag: 'H3 Section Title', px: fontSizesResolved.h3, rem: (fontSizesResolved.h3 / 16).toFixed(3) },
      { tag: 'H4 Subtitle', px: fontSizesResolved.h4, rem: (fontSizesResolved.h4 / 16).toFixed(3) },
      { tag: 'Body Regular (Base)', px: fontSizesResolved.body, rem: (fontSizesResolved.body / 16).toFixed(3) },
      { tag: 'Small Body / Caption', px: fontSizesResolved.small, rem: (fontSizesResolved.small / 16).toFixed(3) }
    ];
  }, [fontSizesResolved]);

  const [rootFontSize, setRootFontSize] = useState(16);
  const [pxInput, setPxInput] = useState(24);
  const remOutput = (pxInput / rootFontSize).toFixed(3);
  const lhPx = Math.round(fontSizesResolved.body * lhRatio);

  const [wcText, setWcText] = useState('');
  const [socialPlatformFilter, setSocialPlatformFilter] = useState('all');

  const wcStats = useMemo(() => {
    const trimmed = wcText.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = wcText.length;
    const charsNoSpaces = wcText.replace(/\s/g, '').length;
    const readingMinutes = words ? Math.max(1, Math.round(words / 200)) : 0;
    return { words, chars, charsNoSpaces, readingMinutes };
  }, [wcText]);

  const filteredSocialPlatforms = useMemo(() => {
    if (socialPlatformFilter === 'all') return SOCIAL_LIMITS_DB;
    return SOCIAL_LIMITS_DB.filter(p => p.id === socialPlatformFilter);
  }, [socialPlatformFilter]);

  const gridStyle3Col = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' };
  const gridStyle2Col = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Fila 1 — 3 Columnas: Escala Tipográfica (Presets), Calculadoras PX/REM, Mockup Visual Unificado */}
      <div style={gridStyle3Col}>
        {/* Col 1: Selector de Presets Tipográficos */}
        <ToolCard icon={Type} title="Escala Tipográfica & Presets Reales" description="Seleccioná entre 15 sistemas investigados (Material 3, Apple HIG, Tailwind, Bringhurst, Vogue, etc.) o configurá tu escala personalizada.">
          <div style={{ marginBottom: '1.2rem' }}>
            <FieldLabel accent>Seleccionar Preset Tipográfico Real</FieldLabel>
            <select
              value={selectedPresetId}
              onChange={(e) => handleTypePresetChange(e.target.value)}
              className="input font-mono"
              style={{ width: '100%', fontWeight: 700, backgroundColor: 'var(--bg-surface-2)', color: 'var(--accent)' }}
            >
              <optgroup label="Escalas Modulares Matemáticas">
                {TYPE_PRESETS.filter(p => p.category === 'Escalas Modulares Matemáticas').map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </optgroup>
              <optgroup label="Sistemas de Diseño Web">
                {TYPE_PRESETS.filter(p => p.category === 'Sistemas de Diseño Web').map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </optgroup>
              <optgroup label="Editorial & Impresión Clásica">
                {TYPE_PRESETS.filter(p => p.category === 'Editorial & Impresión Clásica').map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {activeTypePreset.type === 'modular' && (
            <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <FieldLabel>Base (px)</FieldLabel>
                <input type="number" value={baseFontSize} onChange={(e) => setBaseFontSize(Number(e.target.value))} className="input font-mono" />
              </div>
              <div style={{ flex: 1 }}>
                <FieldLabel>Escala Ratio</FieldLabel>
                <input type="number" step={0.025} value={scaleRatio} onChange={(e) => setScaleRatio(Number(e.target.value))} className="input font-mono" />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', backgroundColor: 'var(--bg-surface-2)', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            {fontScaleList.map((item) => (
              <div key={item.tag} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.tag}</span>
                <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700 }}>
                  {item.px}px <span style={{ fontSize: '0.7rem', color: 'var(--text-disabled)' }}>({item.rem}rem)</span>
                </span>
              </div>
            ))}
          </div>
        </ToolCard>

        {/* Col 2: Calculadoras PX → REM e Interlineado */}
        <ToolCard icon={Ruler} title="Calculadoras PX → REM & Interlineado" description="Conversor dinámico y estimador de interlineado (Line-Height) óptimo.">
          <div style={{ marginBottom: '1.2rem' }}>
            <FieldLabel>Conversor PX → REM</FieldLabel>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <input type="number" value={rootFontSize} onChange={(e) => setRootFontSize(Number(e.target.value))} className="input font-mono" placeholder="Root 16" style={{ width: '80px' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>px root</span>
              <input type="number" value={pxInput} onChange={(e) => setPxInput(Number(e.target.value))} className="input font-mono" placeholder="PX" style={{ flex: 1 }} />
            </div>
            <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Resultado REM</span>
              <strong className="font-mono" style={{ color: 'var(--accent)' }}>{remOutput}rem</strong>
            </div>
          </div>

          <div>
            <FieldLabel>Multiplicador Line-Height ({lhRatio}x)</FieldLabel>
            <input type="range" min={1.1} max={2.0} step={0.05} value={lhRatio} onChange={(e) => setLhRatio(Number(e.target.value))} style={{ width: '100%', marginBottom: '0.6rem' }} />
            
            <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Line-Height en Body ({fontSizesResolved.body}px)</span>
              <strong className="font-mono" style={{ color: 'var(--accent)' }}>{lhPx}px</strong>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-disabled)', display: 'block', marginBottom: '0.4rem' }}>Muestra de Interlineado ({lhRatio}x):</span>
            <div style={{ fontSize: `${fontSizesResolved.body}px`, lineHeight: `${lhPx}px`, color: 'var(--text-primary)', borderLeft: '3px solid var(--accent)', paddingLeft: '0.6rem' }}>
              Texto impreso de muestra con el interlineado dinámico.<br />
              Segunda línea con espacio vertical equilibrado.
            </div>
          </div>
        </ToolCard>

        {/* Col 3: MOCKUP VISUAL INTERACTIVO UNIFICADO */}
        <ToolCard icon={Layout} title="Vista Previa de Jerarquía Tipográfica" description="Muestra en tiempo real cómo se aplican los tamaños de H1, H2, H3, H4, Body y Small en un diseño real.">
          <div style={{
            backgroundColor: 'var(--bg-surface-2)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            padding: '1.2rem',
            maxHeight: '440px',
            overflowY: 'auto'
          }}>
            <div style={{ fontSize: `${fontSizesResolved.h1}px`, fontWeight: 800, color: 'var(--accent)', lineHeight: 1.1, marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
              Kalpagráfica Editorial
            </div>

            <div style={{ fontSize: `${fontSizesResolved.h3}px`, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: '0.8rem' }}>
              Jerarquía y Armonía Aplicada en Tiempo Real
            </div>

            <div style={{ fontSize: `${fontSizesResolved.body}px`, lineHeight: `${lhPx}px`, color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
              La tipografía es la voz de la comunicación visual. Esta maqueta interactiva simula el comportamiento de tus tamaños tipográficos en un sitio web o maquetación impresa real.
            </div>

            <div style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: '0.8rem', marginBottom: '0.8rem' }}>
              <div style={{ fontSize: `${fontSizesResolved.h4}px`, fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Subtítulo de Sección (H4)
              </div>
              <div style={{ fontSize: `${fontSizesResolved.small}px`, color: 'var(--text-disabled)', lineHeight: 1.4 }}>
                Nota al pie de página · Créditos · Publicado bajo la escala {activeTypePreset.name}
              </div>
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: `${fontSizesResolved.h2}px`, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '0.4rem' }}>
                Titular Secundario (H2)
              </div>
              <button className="btn btn-primary btn-sm" style={{ fontSize: `${fontSizesResolved.body}px`, padding: '0.4rem 0.9rem' }}>
                Boton CTA ({fontSizesResolved.body}px)
              </button>
            </div>
          </div>
        </ToolCard>
      </div>

      {/* Fila 2 — 2 Columnas de Ancho Completo: Formatos de Papel Proporcionales, Contador Redes 17 Plataformas & Meta Suite */}
      <div style={gridStyle2Col}>
        {/* Col 1: Formatos de Papel (ISO 216 & US) con Proporciones mm Reales */}
        <ToolCard icon={Printer} title="Formatos de Papel (Escala mm Real)" description="Proporciones geométricas exactas basadas en dimensiones físicas en milímetros.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.2rem' }}>
            {PAPER_SIZES_MM.map((paper) => (
              <div key={paper.name} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                backgroundColor: 'var(--bg-surface-2)', padding: '0.45rem 0.75rem',
                borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)'
              }}>
                <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)', width: '75px' }}>{paper.name}</strong>
                <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{paper.mm}</span>
                <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--accent)' }}>{paper.px300}</span>
              </div>
            ))}
          </div>

          {/* Hojas con proporciones exactas alineadas por la base */}
          <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <FieldLabel accent>Escala Proporcional Real de Hojas (Max A2 594mm)</FieldLabel>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '0.6rem', height: '130px', marginTop: '0.8rem', paddingBottom: '0.4rem', borderBottom: '2px solid var(--accent)' }}>
              {PAPER_SIZES_MM.map((p) => (
                <div
                  key={p.name}
                  title={`${p.name} — ${p.mm}`}
                  style={{
                    width: `${p.w}px`,
                    height: `${p.h}px`,
                    backgroundColor: 'rgba(186, 253, 193, 0.12)',
                    border: '1.5px solid var(--accent)',
                    borderRadius: '3px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span className="font-mono" style={{ fontSize: p.h < 50 ? '0.6rem' : '0.72rem', color: 'var(--accent)', fontWeight: 700 }}>
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ToolCard>

        {/* Col 2: Contador & Límites Redes Sociales (17 Plataformas + Meta Business Suite & Reels A/B) */}
        <ToolCard icon={Type} title="Contador & Límites Redes Sociales (17 Redes & Meta Suite)" description="Medición en tiempo real con campos oficiales de Meta Business Suite, Reels A/B Testing, Instagram, TikTok, YouTube y más (2025-2026).">
          <div style={{ marginBottom: '0.8rem' }}>
            <FieldLabel accent>Filtrar por Plataforma de Red Social</FieldLabel>
            <select
              value={socialPlatformFilter}
              onChange={(e) => setSocialPlatformFilter(e.target.value)}
              className="input font-mono"
              style={{ width: '100%', fontSize: '0.85rem' }}
            >
              <option value="all">📱 Todas las Plataformas (17 Redes & Meta Suite)</option>
              {SOCIAL_LIMITS_DB.map((plat) => (
                <option key={plat.id} value={plat.id}>{plat.name}</option>
              ))}
            </select>
          </div>

          <textarea
            value={wcText}
            onChange={(e) => setWcText(e.target.value)}
            className="input font-mono"
            rows={4}
            style={{ width: '100%', fontSize: '0.82rem', marginBottom: '0.8rem' }}
            placeholder="Escribí o pegá tu copy para analizar sus límites de longitud..."
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginBottom: '1rem' }}>
            <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.4rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-disabled)', display: 'block' }}>Palabras</span>
              <strong className="font-mono" style={{ fontSize: '0.9rem', color: 'var(--accent)' }}>{wcStats.words}</strong>
            </div>
            <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.4rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-disabled)', display: 'block' }}>Chars</span>
              <strong className="font-mono" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{wcStats.chars}</strong>
            </div>
            <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.4rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-disabled)', display: 'block' }}>Sin Espacio</span>
              <strong className="font-mono" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{wcStats.charsNoSpaces}</strong>
            </div>
            <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.4rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-disabled)', display: 'block' }}>Lectura</span>
              <strong className="font-mono" style={{ fontSize: '0.9rem', color: 'var(--accent)' }}>{wcStats.readingMinutes} min</strong>
            </div>
          </div>

          <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingRight: '0.2rem' }}>
            {filteredSocialPlatforms.map((plat) => (
              <div key={plat.id} style={{ backgroundColor: 'var(--bg-surface-2)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ fontSize: '0.78rem', color: 'var(--accent)', display: 'block', marginBottom: '0.4rem' }}>{plat.name}</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {plat.fields.map((f) => {
                    const current = wcStats.chars;
                    const pct = Math.min(100, Math.round((current / f.limit) * 100));
                    const isExceeded = current > f.limit;
                    const isTruncated = f.truncate && current > f.truncate && !isExceeded;

                    return (
                      <div key={f.label} style={{ fontSize: '0.72rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{f.label}</span>
                          <span className="font-mono" style={{ color: isExceeded ? '#F87171' : (isTruncated ? '#FBBF24' : 'var(--accent)'), fontWeight: 600 }}>
                            {current}/{f.limit} {isExceeded ? '⚠ Excedido' : (isTruncated ? `(Trunca a ~${f.truncate})` : '')}
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: isExceeded ? '#F87171' : (isTruncated ? '#FBBF24' : 'var(--accent)'), transition: 'width 0.2s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ToolCard>
      </div>
    </div>
  );
}
