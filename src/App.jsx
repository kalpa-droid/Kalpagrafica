import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BriefForm from './components/BriefForm';
import ProductModal from './components/ProductModal';

import LogoBookSection from './sections/LogoBookSection';
import ToolsSection from './sections/ToolsSection';
import StoreSection from './sections/StoreSection';
import EducationSection from './sections/EducationSection';
import CommunitySection from './sections/CommunitySection';
import AboutSection from './sections/AboutSection';

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

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        <div id="logobook">
          <LogoBookSection />
        </div>

        <div id="herramientas">
          <ToolsSection />
        </div>

        <div id="tienda">
          <StoreSection onSelectProduct={(prod) => setSelectedProduct(prod)} />
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
