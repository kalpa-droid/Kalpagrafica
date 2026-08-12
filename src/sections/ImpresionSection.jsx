import React, { useState } from 'react';
import { Printer, BookOpen, LayoutGrid, FileImage } from 'lucide-react';
import PdfToLibroTool from './impresion/PdfToLibroTool';
import MosaicoTool from './impresion/MosaicoTool';
import PdfToPngTool from './impresion/PdfToPngTool';

export default function ImpresionSection({ activeTab: externalTab, onTabChange }) {
  const [internalTab, setInternalTab] = useState('libro');

  const activeTab = externalTab || internalTab;

  const setActiveTab = (tabId) => {
    setInternalTab(tabId);
    if (onTabChange) onTabChange(tabId);
  };

  const TABS = [
    { id: 'libro', label: 'PDF a Libro (Folleto)', icon: BookOpen },
    { id: 'mosaico', label: 'Imágenes a Mosaico', icon: LayoutGrid },
    { id: 'png', label: 'PDF a Imagen (PNG)', icon: FileImage }
  ];

  return (
    <section className="section-container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto 3rem' }}>
        <div className="font-caps" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)',
          backgroundColor: 'var(--accent-muted)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)',
          marginBottom: '1rem', border: '1px solid rgba(186,253,193,0.3)'
        }}>
          <Printer size={15} />
          <span>Tools Impresión</span>
        </div>

        <h2 className="font-headline" style={{
          fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 700, letterSpacing: '-0.02em',
          color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '1.2rem'
        }}>
          Tools Impresión
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Suite utilitaria de preimpresión y encuadernación gráfica: imposición de PDFs para libros y cuadernillos, armado de grillas en mosaico y extracción de páginas PDF en alta resolución (DPI).
        </p>
      </div>

      {/* Sub-Tabs de Navegación de Impresión */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="font-caps"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.4rem',
                borderRadius: 'var(--radius-md)',
                border: isActive ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                backgroundColor: isActive ? 'var(--accent)' : 'var(--bg-surface)',
                color: isActive ? '#08080A' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500, fontSize: '0.88rem', cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: isActive ? '0 4px 15px rgba(186, 253, 193, 0.2)' : 'none'
              }}
            >
              <Icon size={17} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Render del tool activo */}
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {activeTab === 'libro' && <PdfToLibroTool />}
        {activeTab === 'mosaico' && <MosaicoTool />}
        {activeTab === 'png' && <PdfToPngTool />}
      </div>
    </section>
  );
}
