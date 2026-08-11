import React, { useState, useRef, useEffect } from 'react';
import { Palette, Type, Square, Image as ImageIcon, Download, Printer, FileText, Trash2, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import { Stage, Layer, Text, Rect, Circle, Image as KonvaImage, Transformer } from 'react-konva';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Helper de imagen Konva
function URLImage({ image, ...props }) {
  const [imgObj, setImgObj] = useState(null);

  useEffect(() => {
    if (!image.src) return;
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.src = image.src;
    img.onload = () => setImgObj(img);
  }, [image.src]);

  if (!imgObj) return null;
  return <KonvaImage image={imgObj} {...props} />;
}

// Plantillas predefinidas
const PRESETS = [
  { id: 'business', name: 'Tarjeta de Presentación', width: 540, height: 300, unit: '90x50 mm' },
  { id: 'invitation', name: 'Invitación de Evento', width: 400, height: 600, unit: '100x150 mm' },
  { id: 'tag', name: 'Etiqueta de Producto', width: 400, height: 400, unit: '60x60 mm' },
  { id: 'social', name: 'Post de Redes Social', width: 500, height: 500, unit: '1080x1080 px' }
];

export default function DesignEditorSection() {
  const [preset, setPreset] = useState(PRESETS[0]);
  const [bgColor, setBgColor] = useState('#111114');
  const [elements, setElements] = useState([
    { id: 'el-1', type: 'text', text: 'KALPAGRÁFICA', x: 40, y: 50, fontSize: 26, fill: '#BAFDC1', fontFamily: 'sans-serif', fontWeight: 'bold' },
    { id: 'el-2', type: 'text', text: 'Estudio de Diseño & Preimpresión', x: 40, y: 90, fontSize: 14, fill: '#E5E5E7', fontFamily: 'sans-serif' },
    { id: 'el-3', type: 'rect', x: 40, y: 130, width: 460, height: 2, fill: '#BAFDC1' },
    { id: 'el-4', type: 'text', text: 'hola@kalpagrafica.com | +54 9 11 0000-0000', x: 40, y: 150, fontSize: 12, fill: '#9EA0A6', fontFamily: 'sans-serif' }
  ]);
  const [selectedId, setSelectedId] = useState(null);

  const stageRef = useRef(null);
  const trRef = useRef(null);

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
  }, [selectedId]);

  const addText = () => {
    const newEl = {
      id: 'text-' + Date.now(),
      type: 'text',
      text: 'Nuevo Texto',
      x: preset.width / 2 - 50,
      y: preset.height / 2 - 10,
      fontSize: 20,
      fill: '#FFFFFF',
      fontFamily: 'sans-serif'
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  const addRect = () => {
    const newEl = {
      id: 'rect-' + Date.now(),
      type: 'rect',
      x: preset.width / 2 - 50,
      y: preset.height / 2 - 30,
      width: 100,
      height: 60,
      fill: '#BAFDC1',
      cornerRadius: 4
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const newEl = {
      id: 'img-' + Date.now(),
      type: 'image',
      src: url,
      x: preset.width / 2 - 60,
      y: preset.height / 2 - 60,
      width: 120,
      height: 120
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  const updateSelected = (key, value) => {
    if (!selectedId) return;
    setElements((prev) => prev.map((el) => (el.id === selectedId ? { ...el, [key]: value } : el)));
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setElements((prev) => prev.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  };

  const moveLayer = (direction) => {
    if (!selectedId) return;
    const index = elements.findIndex((el) => el.id === selectedId);
    if (index === -1) return;
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

  // Exportar a Imagen PNG HD (300 DPI)
  const exportPNG = () => {
    if (!stageRef.current) return;
    // Deseleccionar temporalmente para no incluir la caja de transformación
    setSelectedId(null);
    setTimeout(() => {
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 3 });
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = `Diseno_${preset.id}_HD.png`;
      a.click();
    }, 100);
  };

  // Exportar a PDF Imprimible (300 DPI) con jsPDF
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

  // Impresión Directa del Navegador (@media print)
  const printDirect = () => {
    window.print();
  };

  const selectedElement = elements.find((el) => el.id === selectedId);

  return (
    <section className="section-container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto 2.5rem' }}>
        <div className="font-caps" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)',
          backgroundColor: 'var(--accent-muted)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)',
          marginBottom: '1rem', border: '1px solid rgba(186,253,193,0.3)'
        }}>
          <Palette size={15} />
          <span>Editor de Tarjetas & Diseños</span>
        </div>

        <h2 className="font-headline" style={{
          fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 700, letterSpacing: '-0.02em',
          color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '1.2rem'
        }}>
          Editor de Tarjetas e Invitaciones
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Maquetador gráfico interactivo 2D estilo Canva en el navegador (Konva Canvas engine). Diseñá tarjetas de presentación, invitaciones y piezas publicitarias listos para imprimir a 300 DPI.
        </p>
      </div>

      {/* Selector de Plantilla */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => { setPreset(p); setSelectedId(null); }}
            className="btn btn-sm"
            style={{
              backgroundColor: preset.id === p.id ? 'var(--accent)' : 'var(--bg-surface)',
              color: preset.id === p.id ? '#08080A' : 'var(--text-secondary)',
              border: preset.id === p.id ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
              fontWeight: preset.id === p.id ? 700 : 500
            }}
          >
            <span>{p.name}</span>
            <span style={{ opacity: 0.7, fontSize: '0.75rem', marginLeft: '0.4rem' }}>({p.unit})</span>
          </button>
        ))}
      </div>

      {/* Editor Principal (Sidebar Herramientas + Canvas + Panel Propiedades) */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 280px', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto', alignItems: 'start' }}>

        {/* Sidebar Izquierda: Herramientas de Creación */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.4rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Añadir Elementos
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={addText} style={{ justifyContent: 'flex-start', gap: '0.6rem' }}>
              <Type size={16} />
              <span>Añadir Texto</span>
            </button>
            <button className="btn btn-secondary btn-sm" onClick={addRect} style={{ justifyContent: 'flex-start', gap: '0.6rem' }}>
              <Square size={16} />
              <span>Añadir Forma / Rectángulo</span>
            </button>
            <label className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start', gap: '0.6rem', cursor: 'pointer' }}>
              <ImageIcon size={16} />
              <span>Añadir Imagen / Logo</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
          </div>

          <h4 style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 700, marginTop: '1.8rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Fondo del Lienzo
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              style={{ width: '40px', height: '36px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
            />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }} className="font-mono">{bgColor}</span>
          </div>

          {/* Exportación */}
          <h4 style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 700, marginTop: '1.8rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Exportar e Imprimir
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <button className="btn btn-primary btn-sm" onClick={exportPNG} style={{ justifyContent: 'center', gap: '0.5rem' }}>
              <Download size={15} />
              <span>Exportar PNG (300 DPI)</span>
            </button>
            <button className="btn btn-secondary btn-sm" onClick={exportPDF} style={{ justifyContent: 'center', gap: '0.5rem' }}>
              <FileText size={15} />
              <span>Exportar PDF Imprimible</span>
            </button>
            <button className="btn btn-ghost btn-sm" onClick={printDirect} style={{ justifyContent: 'center', gap: '0.5rem' }}>
              <Printer size={15} />
              <span>Imprimir Directo</span>
            </button>
          </div>
        </div>

        {/* Centro: Stage Konva Interactive Canvas */}
        <div style={{
          backgroundColor: 'var(--bg-surface-2)', padding: '2rem', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          overflow: 'auto', minHeight: '450px'
        }}>
          <div style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid var(--border-strong)', borderRadius: '4px' }}>
            <Stage
              width={preset.width}
              height={preset.height}
              ref={stageRef}
              onMouseDown={(e) => {
                // Deseleccionar al hacer clic en el fondo del Stage
                if (e.target === e.target.getStage()) {
                  setSelectedId(null);
                }
              }}
            >
              <Layer>
                {/* Rectángulo de Fondo */}
                <Rect width={preset.width} height={preset.height} fill={bgColor} />

                {/* Elementos dibujados */}
                {elements.map((el) => {
                  if (el.type === 'text') {
                    return (
                      <Text
                        key={el.id}
                        id={el.id}
                        {...el}
                        draggable
                        onClick={() => setSelectedId(el.id)}
                        onTap={() => setSelectedId(el.id)}
                        onDragEnd={(e) => {
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
                        draggable
                        onClick={() => setSelectedId(el.id)}
                        onTap={() => setSelectedId(el.id)}
                        onDragEnd={(e) => {
                          updateSelected('x', e.target.x());
                          updateSelected('y', e.target.y());
                        }}
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
                        draggable
                        onClick={() => setSelectedId(el.id)}
                        onTap={() => setSelectedId(el.id)}
                        onDragEnd={(e) => {
                          updateSelected('x', e.target.x());
                          updateSelected('y', e.target.y());
                        }}
                      />
                    );
                  }
                  return null;
                })}

                {/* Transformer para escalar y rotar */}
                <Transformer ref={trRef} />
              </Layer>
            </Stage>
          </div>
        </div>

        {/* Sidebar Derecha: Editor de Propiedades del Elemento Seleccionado */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.4rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Propiedades
          </h4>

          {!selectedElement ? (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-disabled)', textAlign: 'center', padding: '2rem 0' }}>
              Hacé clic en cualquier texto, forma o imagen para editar sus propiedades.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

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
                      Tamaño de Fuente ({selectedElement.fontSize}px)
                    </label>
                    <input
                      type="range"
                      min={8}
                      max={72}
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

              {/* Si es Rectángulo */}
              {selectedElement.type === 'rect' && (
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

              {/* Controles de Capas y Eliminación */}
              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-sm" onClick={() => moveLayer('up')} style={{ flex: 1, gap: '0.3rem', fontSize: '0.78rem' }}>
                    <ArrowUp size={14} /> Subir Capa
                  </button>
                  <button className="btn btn-sm" onClick={() => moveLayer('down')} style={{ flex: 1, gap: '0.3rem', fontSize: '0.78rem' }}>
                    <ArrowDown size={14} /> Bajar Capa
                  </button>
                </div>

                <button className="btn btn-sm" onClick={deleteSelected} style={{ backgroundColor: 'rgba(248,113,113,0.15)', color: '#F87171', border: '1px solid #F87171', justifyContent: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
                  <Trash2 size={15} /> Eliminar Elemento
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </section>
  );
}
