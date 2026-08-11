import React, { useState, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BriefForm from './components/BriefForm';
import ProductModal from './components/ProductModal';

// Code-Splitting: Carga diferida por secciones para un primer render ultra rápido
const LogoBookSection = lazy(() => import('./sections/LogoBookSection'));
const ToolsSection = lazy(() => import('./sections/ToolsSection'));
const ImpresionSection = lazy(() => import('./sections/ImpresionSection'));
const DesignEditorSection = lazy(() => import('./sections/DesignEditorSection'));
const AlbumSection = lazy(() => import('./sections/AlbumSection'));
const EducationSection = lazy(() => import('./sections/EducationSection'));
const CommunitySection = lazy(() => import('./sections/CommunitySection'));
const AboutSection = lazy(() => import('./sections/AboutSection'));

function SectionLoader() {
  return (
    <div style={{
      padding: '5rem 2rem',
      textAlign: 'center',
      color: 'var(--text-disabled)',
      fontSize: '0.88rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.6rem'
    }}>
      <div style={{
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        border: '2px solid var(--border-subtle)',
        borderTopColor: 'var(--accent)',
        animation: 'spin 0.8s linear infinite'
      }} />
      <span>Cargando módulo de precisión...</span>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState('logobook');
  const [isBriefOpen, setIsBriefOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleNavigate = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -95;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="blueprint-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Header Navbar */}
      <Navbar activeSection={activeSection} onNavigate={handleNavigate} />

      {/* Main Content Area con Suspense Fallback */}
      <main style={{ flex: 1 }}>
        <Suspense fallback={<SectionLoader />}>
          <div id="logobook">
            <LogoBookSection />
          </div>

          <div id="herramientas">
            <ToolsSection />
          </div>

          <div id="impresion">
            <ImpresionSection />
          </div>

          <div id="editor-tarjetas">
            <DesignEditorSection />
          </div>

          <div id="albumes">
            <AlbumSection />
          </div>

          <div id="educacion">
            <EducationSection />
          </div>

          <div id="comunidad">
            <CommunitySection />
          </div>

          <div id="estudio">
            <AboutSection />
          </div>
        </Suspense>
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Interactive Modals */}
      <BriefForm isOpen={isBriefOpen} onClose={() => setIsBriefOpen(false)} />
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
