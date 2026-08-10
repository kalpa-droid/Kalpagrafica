import React, { useState, useEffect, useMemo } from 'react';
import { Search, Download, Check, BookOpen, ExternalLink, RefreshCw, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';

const LETTERS = ['TODOS', 'Num', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const ITEMS_PER_PAGE = 36;

export default function LogoBookSection() {
  const [data, setData] = useState({ total: 0, dupsPruned: 0, letters: [], logos: [] });
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Theme for logo containers: 'dark' (Modo Noche: Fondo oscuro + Logo Verde) vs 'light' (Modo Claro: Fondo Verde Clarito + Logo Negro)
  const [cardTheme, setCardTheme] = useState('dark');

  useEffect(() => {
    fetch('/data/logobook.json')
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al cargar logobook.json:', err);
        setLoading(false);
      });
  }, []);

  // Filter logos by Letter and Search Query
  const filteredLogos = useMemo(() => {
    if (!data.logos) return [];
    
    return data.logos.filter(item => {
      // Letter filter
      const matchesLetter = selectedLetter === 'TODOS' || item.letter === selectedLetter;
      
      // Search filter
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || 
        item.company.toLowerCase().includes(query) || 
        item.author.toLowerCase().includes(query);

      return matchesLetter && matchesSearch;
    });
  }, [data.logos, selectedLetter, searchQuery]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLetter, searchQuery]);

  // Calculate Paginated Slice
  const totalPages = Math.ceil(filteredLogos.length / ITEMS_PER_PAGE) || 1;
  const currentLogos = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLogos.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLogos, currentPage]);

  // Counts per letter
  const letterCounts = useMemo(() => {
    const counts = { TODOS: data.logos ? data.logos.length : 0 };
    if (data.logos) {
      data.logos.forEach(logo => {
        counts[logo.letter] = (counts[logo.letter] || 0) + 1;
      });
    }
    return counts;
  }, [data.logos]);

  const handleCopySvg = (logo) => {
    navigator.clipboard.writeText(logo.file);
    setCopiedId(logo.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isFiltering = selectedLetter !== 'TODOS' || searchQuery.trim() !== '';

  // Generate page dots window centered on currentPage
  const pageDots = useMemo(() => {
    if (totalPages <= 1) return [];
    const maxVisible = 9;
    const pages = [];

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 4);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end === totalPages) {
        start = Math.max(1, totalPages - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <section className="section-container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      {/* Section Header */}
      <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto 3rem' }}>
        <div className="font-caps" style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          color: 'var(--accent)', 
          backgroundColor: 'var(--accent-muted)',
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-full)',
          marginBottom: '1rem',
          border: '1px solid rgba(186,253,193,0.3)'
        }}>
          <BookOpen size={15} />
          <span>Catálogo Visual • {data.total || 4252} Marcas</span>
        </div>

        <h2 className="font-headline" style={{ 
          fontSize: 'clamp(2rem, 4vw, 3.2rem)', 
          fontWeight: 700, 
          letterSpacing: '-0.02em', 
          color: 'var(--text-primary)',
          lineHeight: 1.15,
          marginBottom: '1.2rem'
        }}>
          Libro de Logos
        </h2>

        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '1.05rem', 
          lineHeight: 1.6 
        }}>
          Colección de marcas e identidades visuales ordenadas alfabéticamente de la <strong style={{ color: 'var(--accent)' }}>Num</strong> a la <strong style={{ color: 'var(--accent)' }}>Z</strong>. Explora la ingeniería gráfica, empresas y creadores que dieron forma al diseño atemporal.
        </p>
      </div>

      {/* Control Bar: Search Input, Theme Toggle & Multi-Row Letter Selector */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        padding: '1.2rem 1.5rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        {/* Top Controls: Search Box + Theme Switcher + Total Counter */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          gap: '1rem',
          marginBottom: '1.2rem' 
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '450px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por empresa o creador (ej: Kalpagráfica, Saul Bass)..."
              className="input"
              style={{
                width: '100%',
                paddingLeft: '2.8rem',
                fontSize: '0.9rem',
                backgroundColor: 'var(--bg-surface-2)'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.8rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-disabled)',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Controls: Mode Toggle & Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Contrast Mode Toggle Button */}
            <button
              onClick={() => setCardTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              className="btn btn-secondary btn-sm"
              title="Cambiar contraste de visualización de los cuadros de logos"
              style={{
                backgroundColor: cardTheme === 'light' ? 'var(--accent)' : 'var(--bg-surface-2)',
                color: cardTheme === 'light' ? '#08080A' : 'var(--text-primary)',
                borderColor: cardTheme === 'light' ? 'var(--accent)' : 'var(--border-subtle)',
                fontWeight: 600,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              {cardTheme === 'dark' ? (
                <>
                  <Sun size={15} style={{ color: 'var(--accent)' }} />
                  <span>Modo Claro (Fondo Verde)</span>
                </>
              ) : (
                <>
                  <Moon size={15} />
                  <span>Modo Noche (Logo Verde)</span>
                </>
              )}
            </button>

            {/* Total Badge */}
            <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {isFiltering ? (
                <>
                  Mostrando <strong style={{ color: 'var(--accent)' }}>{filteredLogos.length}</strong> marcas
                </>
              ) : (
                <>
                  Catálogo Total: <strong style={{ color: 'var(--accent)' }}>{data.total || 4350}</strong> marcas
                </>
              )}
            </div>
          </div>
        </div>

        {/* Multi-Row Letter Grid (Optimized for Mobile & Desktop, NO Scrollbar) */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
          justifyContent: 'flex-start',
          alignItems: 'center'
        }}>
          {LETTERS.map((letra) => {
            const isActive = selectedLetter === letra;
            const count = letterCounts[letra] || 0;
            return (
              <button
                key={letra}
                onClick={() => setSelectedLetter(letra)}
                className="font-caps"
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: isActive ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                  backgroundColor: isActive ? 'var(--accent)' : 'var(--bg-surface-2)',
                  color: isActive ? '#08080A' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <span>{letra}</span>
                <span style={{ 
                  fontSize: '0.68rem', 
                  opacity: isActive ? 0.9 : 0.6,
                  fontFamily: 'JetBrains Mono, monospace' 
                }}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Pagination Bar with Bullets & Arrow Buttons (← •••••••• →) */}
      {!loading && totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.8rem 1.2rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }} className="font-mono">
            Navegación de Páginas:
          </div>

          {/* Dots Indicator with Left and Right Arrows */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-surface-2)',
            padding: '0.4rem 0.8rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)'
          }}>
            {/* Left Arrow Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                background: 'none',
                border: 'none',
                color: currentPage === 1 ? 'var(--text-disabled)' : 'var(--accent)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.2rem 0.4rem',
                borderRadius: 'var(--radius-sm)',
                transition: 'all 0.2s'
              }}
              title="Página Anterior"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Dots / Bullets Track */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {pageDots[0] > 1 && (
                <>
                  <button
                    onClick={() => setCurrentPage(1)}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--text-disabled)',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0
                    }}
                    title="Página 1"
                  />
                  <span style={{ color: 'var(--text-disabled)', fontSize: '0.75rem', lineHeight: 1 }}>…</span>
                </>
              )}

              {pageDots.map(pageNum => {
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      width: isActive ? '26px' : '10px',
                      height: '10px',
                      borderRadius: '10px',
                      backgroundColor: isActive ? 'var(--accent)' : 'var(--border-strong)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      padding: 0
                    }}
                    title={`Página ${pageNum}`}
                  />
                );
              })}

              {pageDots[pageDots.length - 1] < totalPages && (
                <>
                  <span style={{ color: 'var(--text-disabled)', fontSize: '0.75rem', lineHeight: 1 }}>…</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--text-disabled)',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0
                    }}
                    title={`Página ${totalPages}`}
                  />
                </>
              )}
            </div>

            {/* Right Arrow Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                background: 'none',
                border: 'none',
                color: currentPage === totalPages ? 'var(--text-disabled)' : 'var(--accent)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.2rem 0.4rem',
                borderRadius: 'var(--radius-sm)',
                transition: 'all 0.2s'
              }}
              title="Página Siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Page Counter Badge */}
          <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Página <strong style={{ color: 'var(--accent)' }}>{currentPage}</strong> de <strong style={{ color: 'var(--text-primary)' }}>{totalPages}</strong>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-secondary)' }}>
          <RefreshCw size={32} className="spin" style={{ marginBottom: '1rem', color: 'var(--accent)' }} />
          <p>Cargando el Libro de Logos...</p>
        </div>
      ) : (
        <>
          {/* Empty Search Results State */}
          {filteredLogos.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)'
            }}>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                No se encontraron marcas que coincidan con "<strong style={{ color: 'var(--accent)' }}>{searchQuery}</strong>" en la categoría <strong style={{ color: 'var(--luxury)' }}>{selectedLetter}</strong>.
              </p>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { setSelectedLetter('TODOS'); setSearchQuery(''); }}
              >
                Ver todos los logos (4,350)
              </button>
            </div>
          )}

          {/* Logos Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            {currentLogos.map((logo) => {
              const isLightMode = cardTheme === 'light';
              
              return (
                <div
                  key={logo.id}
                  className="card-blueprint"
                  onClick={() => setSelectedLogo(logo)}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    padding: '1.5rem',
                    height: '240px',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: isLightMode ? '#BAFDC1' : 'var(--bg-surface-2)',
                    borderColor: isLightMode ? 'rgba(186, 253, 193, 0.8)' : 'var(--border-subtle)',
                    boxShadow: isLightMode ? '0 4px 20px rgba(186, 253, 193, 0.15)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {/* SVG Visual Canvas Area with direct <img> and color filter fallback */}
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    minHeight: '110px'
                  }}>
                    <img
                      src={logo.file}
                      alt={logo.company}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '85px',
                        objectFit: 'contain',
                        filter: isLightMode 
                          ? 'none' 
                          : 'invert(88%) sepia(21%) saturate(935%) hue-rotate(74deg) brightness(106%) contrast(98%)',
                        transition: 'transform 0.3s ease, filter 0.3s ease'
                      }}
                      className="logo-svg-img"
                    />
                  </div>

                  {/* Card Caption with Empresa (bold) - Author */}
                  <div style={{
                    borderTop: isLightMode ? '1px solid rgba(8, 8, 10, 0.15)' : '1px solid var(--border-subtle)',
                    paddingTop: '0.8rem',
                    marginTop: '0.5rem'
                  }}>
                    <div style={{ 
                      fontSize: '0.92rem', 
                      lineHeight: 1.35, 
                      color: isLightMode ? '#08080A' : 'var(--text-primary)' 
                    }}>
                      <strong style={{ fontWeight: 700, color: isLightMode ? '#08080A' : 'var(--text-primary)' }}>
                        {logo.company}
                      </strong>
                      <span style={{ 
                        color: isLightMode ? '#1E293B' : 'var(--text-secondary)', 
                        fontWeight: 400 
                      }}>
                        {' — '}{logo.author}
                      </span>
                    </div>
                    <div className="font-mono" style={{ 
                      fontSize: '0.72rem', 
                      color: isLightMode ? '#334155' : 'var(--text-disabled)', 
                      marginTop: '0.3rem' 
                    }}>
                      Categoría: {logo.letter}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal Detail View for Selected Logo */}
      {selectedLogo && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(8, 8, 10, 0.9)',
          backdropFilter: 'blur(16px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }} onClick={() => setSelectedLogo(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '650px',
              width: '100%',
              padding: '2.5rem',
              position: 'relative',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            {/* Close Modal Button */}
            <button
              onClick={() => setSelectedLogo(null)}
              style={{
                position: 'absolute',
                top: '1.2rem',
                right: '1.2rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="font-caps" style={{ color: 'var(--luxury)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
              Ficha de Marca • Sección {selectedLogo.letter}
            </div>

            <h3 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              <strong style={{ fontWeight: 700, color: 'var(--accent)' }}>{selectedLogo.company}</strong>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2rem' }}>
              Creado por: <strong>{selectedLogo.author}</strong>
            </p>

            {/* Large Vector Canvas respecting active theme */}
            <div style={{
              height: '240px',
              backgroundColor: cardTheme === 'light' ? '#BAFDC1' : 'var(--bg-base)',
              borderRadius: 'var(--radius-md)',
              border: cardTheme === 'light' ? '1px solid #BAFDC1' : '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <img
                src={selectedLogo.file}
                alt={selectedLogo.company}
                style={{
                  maxWidth: '100%',
                  maxHeight: '180px',
                  objectFit: 'contain',
                  filter: cardTheme === 'light'
                    ? 'none'
                    : 'invert(88%) sepia(21%) saturate(935%) hue-rotate(74deg) brightness(106%) contrast(98%)'
                }}
              />
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a
                href={selectedLogo.file}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <Download size={18} />
                <span>Ver / Descargar SVG</span>
              </a>

              <button
                className="btn btn-secondary"
                onClick={() => handleCopySvg(selectedLogo)}
              >
                {copiedId === selectedLogo.id ? <Check size={18} color="var(--accent)" /> : <ExternalLink size={18} />}
                <span>{copiedId === selectedLogo.id ? '¡Ruta Copiada!' : 'Copiar Ruta SVG'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .card-blueprint:hover .logo-svg-img {
          transform: scale(1.08);
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1.5s linear infinite;
        }
      `}</style>
    </section>
  );
}
