import React, { useState, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BriefForm from './components/BriefForm';
import ProductModal from './components/ProductModal';
import ToolDrawer from './components/ToolDrawer';

// Helper de Carga Diferida con Auto-Reintento ante Despliegues de Vercel
// Usa un guard en sessionStorage para evitar bucles infinitos de recarga
function lazyWithRetry(componentImport) {
  return lazy(async () => {
    const hasRefreshed = window.sessionStorage.getItem('chunk-retry-refresh');
    try {
      const component = await componentImport();
      // Si estamos aquí la carga fue exitosa — limpiar el flag de reintento
      window.sessionStorage.removeItem('chunk-retry-refresh');
      return component;
    } catch (error) {
      if (!hasRefreshed) {
        console.warn('[lazyWithRetry] Chunk load failed, forcing hard reload...', error);
        window.sessionStorage.setItem('chunk-retry-refresh', 'true');
        // Hard reload con cache-busting: añadir timestamp a la URL para forzar nueva descarga de index.html
        window.location.href = window.location.pathname + '?v=' + Date.now();
        return new Promise(() => {}); // Bloquear mientras recarga
      }
      // Si ya hicimos un reintento y sigue fallando, propagar el error al ErrorBoundary
      window.sessionStorage.removeItem('chunk-retry-refresh');
      throw error;
    }
  });
}

// Error Boundary para capturar fallos de renderizado y evitar pantalla en blanco
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || 'Error desconocido';
      return (
        <div style={{
          padding: '3rem 2rem', textAlign: 'center', backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)', margin: '2rem auto', maxWidth: '600px',
          border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)'
        }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--accent)', marginBottom: '0.8rem' }}>
            ⚠️ Error en este módulo
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', lineHeight: 1.5 }}>
            Se produjo un error al renderizar este componente. Podés intentar recargar la página.
          </p>
          <pre style={{ fontSize: '0.7rem', color: '#F87171', backgroundColor: 'var(--bg-surface-2)', padding: '0.6rem', borderRadius: '6px', textAlign: 'left', overflowX: 'auto', marginBottom: '1rem', maxHeight: '120px', overflow: 'auto' }}>
            {errorMsg}
          </pre>
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                window.sessionStorage.clear();
                window.location.href = window.location.pathname + '?v=' + Date.now();
              }}
            >
              🔄 Recargar Limpio
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              🔁 Reintentar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Code-Splitting con tolerancia a fallos de red y actualización
const LogoBookSection = lazyWithRetry(() => import('./sections/LogoBookSection'));
const ToolsSection = lazyWithRetry(() => import('./sections/ToolsSection'));
const ImpresionSection = lazyWithRetry(() => import('./sections/ImpresionSection'));
const DesignEditorSection = lazyWithRetry(() => import('./sections/DesignEditorSection'));
const EducationSection = lazyWithRetry(() => import('./sections/EducationSection'));
const CommunitySection = lazyWithRetry(() => import('./sections/CommunitySection'));

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

      {/* Main Content Area con Suspense Fallback y ErrorBoundary por Sección */}
      <main style={{ flex: 1 }}>
        <Suspense fallback={<SectionLoader />}>
          <ErrorBoundary>
            <div id="logobook">
              <LogoBookSection />
            </div>
          </ErrorBoundary>

          <ErrorBoundary>
            <div id="impresion">
              <ImpresionSection activeTab={selectedImpresionTab} onTabChange={setSelectedImpresionTab} />
            </div>
          </ErrorBoundary>

          <ErrorBoundary>
            <div id="editor-tarjetas">
              <DesignEditorSection />
            </div>
          </ErrorBoundary>

          <ErrorBoundary>
            <div id="herramientas">
              <ToolsSection activeTab={selectedToolTab} onTabChange={setSelectedToolTab} />
            </div>
          </ErrorBoundary>

          <ErrorBoundary>
            <div id="educacion">
              <EducationSection />
            </div>
          </ErrorBoundary>

          <ErrorBoundary>
            <div id="comunidad">
              <CommunitySection />
            </div>
          </ErrorBoundary>
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
