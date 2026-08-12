import React, { useState } from 'react';
import { Wrench, Palette, ScanEye, Code, Crop, FileImage, Ruler, Terminal } from 'lucide-react';
import ColourTab from './tools/ColourTab';
import AnalysisTab from './tools/AnalysisTab';
import SvgTab from './tools/SvgTab';
import SocialTab from './tools/SocialTab';
import AssetsTab from './tools/AssetsTab';
import TypeTab from './tools/TypeTab';
import CliTab from './tools/CliTab';

export default function ToolsSection({ activeTab: externalTab, onTabChange }) {
  const [internalTab, setInternalTab] = useState('colour');
  const [copiedCode, setCopiedCode] = useState(null);

  const activeTab = externalTab || internalTab;

  const setActiveTab = (tabId) => {
    setInternalTab(tabId);
    if (onTabChange) onTabChange(tabId);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const TABS = [
    { id: 'colour', label: 'Color & Armonías', icon: Palette },
    { id: 'type', label: 'Tipografía & Papel', icon: Ruler },
    { id: 'analysis', label: 'Paleta & Daltonismo', icon: ScanEye },
    { id: 'svg', label: 'Optimizador SVG', icon: Code },
    { id: 'social', label: 'Social Cropper', icon: Crop },
    { id: 'assets', label: 'Favicon, Formato & Marca', icon: FileImage },
    { id: 'cli', label: 'Comandos CLI', icon: Terminal }
  ];

  return (
    <section className="section-container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto 3rem' }}>
        <div className="font-caps" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)',
          backgroundColor: 'var(--accent-muted)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)',
          marginBottom: '1rem', border: '1px solid rgba(186,253,193,0.3)'
        }}>
          <Wrench size={15} />
          <span>KalpaTools & Delphi CLI Suite</span>
        </div>

        <h2 className="font-headline" style={{
          fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 700, letterSpacing: '-0.02em',
          color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '1.2rem'
        }}>
          Herramientas de Diseño
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Suite utilitaria 100% nativa para diseñadores y desarrolladores:
          colorimetría OKLCH, conversión Pantone® (brillante Coated y mate Uncoated), paletas, daltonismo descargable, recorte social WebP, favicons vectoriales, marca de agua SVG,
          escala tipográfica visual interactiva con 15 presets reales y el paquete ejecutable <strong style={{ color: 'var(--accent)' }}>@kalpa-droid/delphitools</strong> en la terminal.
        </p>

        <div style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--text-disabled)', backgroundColor: 'var(--bg-surface)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border-subtle)' }}>
          <span>Herramientas inspiradas en el software libre de</span>
          <a href="https://delphi.tools/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline', fontWeight: 600 }}>delphi.tools</a>
          <span>por</span>
          <a href="https://github.com/1612elphi/delphitools" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}>@1612elphi</a>
        </div>
        <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: 'var(--text-disabled)' }}>
          * Pantone® es una marca registrada de Pantone LLC. Esta herramienta web ofrece aproximaciones informáticas independientes y no oficiales con fines educativos y de diseño, y no está afiliada, respaldada ni patrocinada por Pantone LLC.
        </div>
      </div>

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
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem',
                borderRadius: 'var(--radius-md)',
                border: isActive ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                backgroundColor: isActive ? 'var(--accent)' : 'var(--bg-surface)',
                color: isActive ? '#08080A' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500, fontSize: '0.85rem', cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: isActive ? '0 4px 15px rgba(186, 253, 193, 0.2)' : 'none'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'colour' && <ColourTab copiedCode={copiedCode} copyToClipboard={copyToClipboard} />}
      {activeTab === 'analysis' && <AnalysisTab copiedCode={copiedCode} copyToClipboard={copyToClipboard} />}
      {activeTab === 'svg' && <SvgTab copiedCode={copiedCode} copyToClipboard={copyToClipboard} />}
      {activeTab === 'social' && <SocialTab />}
      {activeTab === 'assets' && <AssetsTab />}
      {activeTab === 'type' && <TypeTab />}
      {activeTab === 'cli' && <CliTab copiedCode={copiedCode} copyToClipboard={copyToClipboard} />}

      <style>{`
        .shade-item:hover {
          transform: translateX(4px);
        }
      `}</style>
    </section>
  );
}
