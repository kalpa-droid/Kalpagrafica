import React, { useState, useEffect } from 'react';
import { Menu, X, Wrench } from 'lucide-react';
import { KalpaLogoHorizontal, KalpaLogoIcon } from './KalpaLogos';

export default function Navbar({ activeSection, onNavigate, onOpenToolDrawer }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'logobook', label: 'Libro de Logos' },
    { id: 'herramientas', label: 'Herramientas' },
    { id: 'impresion', label: 'Tools Impresión' },
    { id: 'editor-tarjetas', label: 'Editor Tarjetas' },
    { id: 'educacion', label: 'Educación' },
    { id: 'comunidad', label: 'Comunidad' },
  ];

  const handleNavClick = (id) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: '72px',
      backgroundColor: scrolled ? 'rgba(17, 17, 20, 0.85)' : 'var(--bg-surface)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      transition: 'all 0.3s ease',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div style={{
        maxWidth: 'var(--max-width)',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Left Side: Logo (Verde claro var(--accent)) + Navigation */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Brand Logo con color verde claro var(--accent) y espacio holgado a la derecha */}
          <div 
            onClick={() => handleNavClick('logobook')} 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginRight: '3.5rem' }}
          >
            <div className="logo-desktop" style={{ display: 'flex', alignItems: 'center' }}>
              <KalpaLogoHorizontal 
                style={{ height: '28px', width: '135px', color: 'var(--accent)' }} 
              />
            </div>
            <div className="logo-mobile" style={{ display: 'none', alignItems: 'center' }}>
              <KalpaLogoHorizontal 
                style={{ height: '22px', width: '115px', color: 'var(--accent)' }} 
              />
            </div>
          </div>

          {/* Desktop Navigation links con espaciado amplio */}
          <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.4rem' }}>
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="font-caps"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '0.4rem 0.6rem',
                    position: 'relative',
                    transition: 'color 0.2s'
                  }}
                >
                  {item.label}
                  {isActive && (
                    <span style={{
                      position: 'absolute',
                      bottom: -2,
                      left: '10%',
                      width: '80%',
                      height: '2px',
                      backgroundColor: 'var(--accent)',
                      borderRadius: '2px'
                    }} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Side Actions: Panel Lateral de Herramientas + Mobile Menu Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={onOpenToolDrawer}
            title="Abrir Panel de Acceso Rápido a Herramientas"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: 'var(--accent-muted)',
              border: '1px solid rgba(186, 253, 193, 0.35)',
              color: 'var(--accent)',
              borderRadius: 'var(--radius-md)',
              padding: '0.45rem 0.8rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            className="tools-drawer-btn"
          >
            <Wrench size={16} />
            <span className="tools-btn-text">Herramientas</span>
          </button>

          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              cursor: 'pointer',
              padding: '0.4rem'
            }}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'var(--bg-overlay)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-strong)',
          boxShadow: 'var(--shadow-card)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="font-caps"
              style={{
                textAlign: 'left',
                background: 'none',
                border: 'none',
                fontSize: '0.85rem',
                color: activeSection === item.id ? 'var(--accent)' : 'var(--text-primary)',
                padding: '0.5rem 0'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        .tools-drawer-btn:hover {
          background-color: var(--accent) !important;
          color: #08080A !important;
          border-color: var(--accent) !important;
        }
        @media (max-width: 1024px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
          .logo-desktop { display: none !important; }
          .logo-mobile { display: flex !important; }
          header { height: 56px !important; }
        }
        @media (max-width: 480px) {
          .tools-btn-text { display: none; }
          .tools-drawer-btn { padding: 0.45rem 0.55rem !important; }
        }
      `}</style>
    </header>
  );
}
