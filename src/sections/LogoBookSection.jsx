import React, { useState, useEffect, useMemo } from 'react';
import { Search, BookOpen, RefreshCw, Sun, Moon, ChevronLeft, ChevronRight, Info, ArrowDownAZ, UserRound } from 'lucide-react';

const ITEMS_PER_PAGE = 36;
const NO_AUTHOR_LABEL = 'Autor no identificado';

export default function LogoBookSection() {
  const [data, setData] = useState({ total: 0, logos: [] });
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('company'); // 'company' | 'author'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLogo, setSelectedLogo] = useState(null);

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

  // Filtrar por búsqueda y ordenar (sin categorías fijas: el archivo se organiza por
  // orden alfabético de Empresa o de Diseñador, ya que son los únicos metadatos reales disponibles)
  const filteredLogos = useMemo(() => {
    if (!data.logos) return [];

    const query = searchQuery.trim().toLowerCase();
    const filtered = !query
      ? data.logos
      : data.logos.filter(item =>
          item.company.toLowerCase().includes(query) ||
          (item.author || '').toLowerCase().includes(query)
        );

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'author') {
        const authorA = a.author || NO_AUTHOR_LABEL;
        const authorB = b.author || NO_AUTHOR_LABEL;
        return authorA.localeCompare(authorB, 'es') || a.company.localeCompare(b.company, 'es');
      }
      return a.company.localeCompare(b.company, 'es');
    });

    return sorted;
  }, [data.logos, searchQuery, sortBy]);

  // Reset page when filter or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  // Calculate Paginated Slice
  const totalPages = Math.ceil(filteredLogos.length / ITEMS_PER_PAGE) || 1;
  const currentLogos = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLogos.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLogos, currentPage]);

  // Generate page dots window centered on currentPage
  const pageDots = useMemo(() => {
    if (totalPages <= 1) return [];
    const maxVisible = 7;
    const pages = [];

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 3);
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

  const handlePageChange = (newPage) => {
    const targetPage = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(targetPage);
    const element = document.getElementById('logobook');
    if (element) {
      const yOffset = -95;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  };

  // Compact Combined Toolbar (Search + Navigation Dots + Theme Icon Only)
  const renderControlToolbar = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.6rem',
      backgroundColor: 'var(--bg-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-subtle)',
      padding: '0.6rem 0.8rem',
      boxShadow: 'var(--shadow-subtle)',
      marginBottom: '1rem'
    }}>
      {/* 1. Search Box */}
      <div style={{ position: 'relative', flex: '1 1 180px', minWidth: '160px', maxWidth: '360px' }}>
        <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar empresa o creador..."
          className="input"
          style={{
            width: '100%',
            paddingLeft: '2.2rem',
            paddingRight: searchQuery ? '2rem' : '0.8rem',
            fontSize: '0.82rem',
            backgroundColor: 'var(--bg-surface-2)',
            height: '36px'
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: '0.6rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-disabled)',
              cursor: 'pointer',
              fontSize: '0.75rem'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* 2. Ordenar por Empresa o Diseñador */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.2rem',
        backgroundColor: 'var(--bg-surface-2)',
        padding: '0.2rem',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--border-subtle)',
        height: '36px'
      }}>
        <button
          onClick={() => setSortBy('company')}
          className="font-caps"
          title="Ordenar alfabéticamente por Empresa"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            padding: '0 0.7rem', height: '28px', borderRadius: 'var(--radius-full)',
            border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
            backgroundColor: sortBy === 'company' ? 'var(--accent)' : 'transparent',
            color: sortBy === 'company' ? '#08080A' : 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}
        >
          <ArrowDownAZ size={13} /> Empresa
        </button>
        <button
          onClick={() => setSortBy('author')}
          className="font-caps"
          title="Ordenar alfabéticamente por Diseñador"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            padding: '0 0.7rem', height: '28px', borderRadius: 'var(--radius-full)',
            border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
            backgroundColor: sortBy === 'author' ? 'var(--accent)' : 'transparent',
            color: sortBy === 'author' ? '#08080A' : 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}
        >
          <UserRound size={13} /> Diseñador
        </button>
      </div>

      {/* 3. Pagination Track (← •••••••• →) */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          backgroundColor: 'var(--bg-surface-2)',
          padding: '0.2rem 0.5rem',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)',
          height: '36px'
        }}>
          {/* Left Arrow Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              background: 'none',
              border: 'none',
              color: currentPage === 1 ? 'var(--text-disabled)' : 'var(--accent)',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.1rem',
              transition: 'all 0.2s'
            }}
            title="Anterior"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Dots / Bullets Track */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {pageDots[0] > 1 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--text-disabled)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0
                  }}
                  title="Página 1"
                />
                <span style={{ color: 'var(--text-disabled)', fontSize: '0.65rem', lineHeight: 1 }}>…</span>
              </>
            )}

            {pageDots.map(pageNum => {
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  style={{
                    width: isActive ? '18px' : '7px',
                    height: '7px',
                    borderRadius: '7px',
                    backgroundColor: isActive ? 'var(--accent)' : 'var(--border-strong)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    padding: 0
                  }}
                  title={`Página ${pageNum}`}
                />
              );
            })}

            {pageDots[pageDots.length - 1] < totalPages && (
              <>
                <span style={{ color: 'var(--text-disabled)', fontSize: '0.65rem', lineHeight: 1 }}>…</span>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  style={{
                    width: '6px',
                    height: '6px',
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
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              background: 'none',
              border: 'none',
              color: currentPage === totalPages ? 'var(--text-disabled)' : 'var(--accent)',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.1rem',
              transition: 'all 0.2s'
            }}
            title="Siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* 3. Theme Toggle Icon Only (NO Text!) */}
      <button
        onClick={() => setCardTheme(prev => prev === 'dark' ? 'light' : 'dark')}
        title={cardTheme === 'dark' ? 'Modo Claro' : 'Modo Noche'}
        style={{
          width: '36px',
          height: '36px',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: cardTheme === 'light' ? 'var(--accent)' : 'var(--bg-surface-2)',
          color: cardTheme === 'light' ? '#08080A' : 'var(--accent)',
          border: cardTheme === 'light' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        {cardTheme === 'dark' ? (
          <Sun size={18} />
        ) : (
          <Moon size={18} />
        )}
      </button>
    </div>
  );

  return (
    <section className="section-container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      {/* Section Header */}
      <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto 2.5rem' }}>
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
          <span>Catálogo Visual de Marcas</span>
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
          Colección de marcas e identidades visuales reales, ordenadas alfabéticamente por <strong style={{ color: 'var(--accent)' }}>Empresa</strong> o por <strong style={{ color: 'var(--accent)' }}>Diseñador</strong>. Explora la ingeniería gráfica, empresas y creadores que dieron forma al diseño atemporal.
        </p>

        <div style={{ marginTop: '1.2rem', padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.55rem' }}>
          <Info size={15} color="var(--accent)" style={{ flexShrink: 0 }} />
          <span><strong>Uso Didáctico & Referencia Técnica:</strong> Archivo de consulta para estudiantes y profesionales del diseño. Las marcas y logotipos expuestos pertenecen exclusivamente a sus respectivos titulares.</span>
        </div>
      </div>

      {/* TOP Toolbar (Search + Sort + Navigation Dots + Theme Icon) */}
      {renderControlToolbar()}

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
                No se encontraron marcas que coincidan con "<strong style={{ color: 'var(--accent)' }}>{searchQuery}</strong>".
              </p>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSearchQuery('')}
              >
                Ver todos los logos
              </button>
            </div>
          )}

          {/* Logos Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem'
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
                        {' — '}{logo.author || NO_AUTHOR_LABEL}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* BOTTOM Toolbar (Repeated Search + Navigation Dots + Theme Icon) */}
          {renderControlToolbar()}
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
              Ficha de Marca
            </div>

            <h3 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              <strong style={{ fontWeight: 700, color: 'var(--accent)' }}>{selectedLogo.company}</strong>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2rem' }}>
              Creado por:{' '}
              <strong
                onClick={() => { setSortBy('author'); setSearchQuery(selectedLogo.author || ''); setSelectedLogo(null); }}
                style={{ cursor: selectedLogo.author ? 'pointer' : 'default', textDecoration: selectedLogo.author ? 'underline' : 'none', textUnderlineOffset: '3px' }}
                title={selectedLogo.author ? 'Ver más obras de este diseñador' : undefined}
              >
                {selectedLogo.author || NO_AUTHOR_LABEL}
              </strong>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-disabled)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
                <Info size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
                <span>Muestra gráfica para análisis tipográfico y de retícula visual. Atribuido a <strong>{selectedLogo.author || NO_AUTHOR_LABEL}</strong>. Marcas propiedad de sus respectivos titulares.</span>
              </div>
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
