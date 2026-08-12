import React, { useState, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BriefForm from './components/BriefForm';
import ProductModal from './components/ProductModal';
import ToolDrawer from './components/ToolDrawer';

// Code-Splitting: Carga diferida por secciones para un primer render ultra rápido
const LogoBookSection = lazy(() => import('./sections/LogoBookSection'));
const ToolsSection = lazy(() => import('./sections/ToolsSection'));
const ImpresionSection = lazy(() => import('./sections/ImpresionSection'));
const DesignEditorSection = lazy(() => import('./sections/DesignEditorSection'));
const EducationSection = lazy(() => import('./sections/EducationSection'));
const CommunitySection = lazy(() => import('./sections/CommunitySection'));

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
  const [isToolDrawerOpen, setIsToolDrawerOpen] = useState(false);
  const [selectedToolTab, setSelectedToolTab] = useState('colour');
  const [selectedImpresionTab, setSelectedImpresionTab] = useState('libro');

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

  const handleSelectTool = (toolId, sectionId) => {
    if (sectionId === 'herramientas') {
      setSelectedToolTab(toolId);
    } else if (sectionId === 'impresion') {
      setSelectedImpresionTab(toolId);
    }
    handleNavigate(sectionId);
  };

  return (
    <div className="blueprint-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      {/* Header Navbar */}
      <Navbar 
        activeSection={activeSection} 
        onNavigate={handleNavigate} 
        onOpenToolDrawer={() => setIsToolDrawerOpen(true)}
      />

      {/* Main Content Area con Suspense Fallback */}
      <main style={{ flex: 1 }}>
        <Suspense fallback={<SectionLoader />}>
          <div id="logobook">
            <LogoBookSection />
          </div>

          <div id="impresion">
            <ImpresionSection activeTab={selectedImpresionTab} onTabChange={setSelectedImpresionTab} />
          </div>

          <div id="editor-tarjetas">
            <DesignEditorSection />
          </div>

          <div id="herramientas">
            <ToolsSection activeTab={selectedToolTab} onTabChange={setSelectedToolTab} />
          </div>

          <div id="educacion">
            <EducationSection />
          </div>

          <div id="comunidad">
            <CommunitySection />
          </div>
        </Suspense>
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Side Utility Tool Drawer */}
      <ToolDrawer
        isOpen={isToolDrawerOpen}
        onClose={() => setIsToolDrawerOpen(false)}
        onSelectTool={handleSelectTool}
      />

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
