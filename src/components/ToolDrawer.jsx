import React, { useState } from 'react';
import { X, Search, Wrench, ChevronRight, Sparkles, SlidersHorizontal } from 'lucide-react';
import { TOOLS_REGISTRY } from '../data/toolsRegistry';

export default function ToolDrawer({ isOpen, onClose, onSelectTool }) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredTools = TOOLS_REGISTRY.filter((tool) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      tool.title.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q)
    );
  });

  // Helper para paleta de colores distintiva por categoría
  const getCategoryTheme = (category) => {
    if (category === 'Tools Impresión') {
      return {
        badgeBg: 'rgba(186, 253, 193, 0.16)',
        badgeColor: '#BAFDC1',
        badgeBorder: '1px solid rgba(186, 253, 193, 0.4)',
        iconBg: 'rgba(186, 253, 193, 0.2)',
        iconColor: '#BAFDC1'
      };
    }
    if (category === 'Tools de Edición') {
      return {
        badgeBg: 'rgba(201, 169, 77, 0.18)',
        badgeColor: '#E6C465',
        badgeBorder: '1px solid rgba(201, 169, 77, 0.45)',
        iconBg: 'rgba(201, 169, 77, 0.22)',
        iconColor: '#E6C465'
      };
    }
    // Tools Diseño (Verde Neón Esmeralda Brand)
    return {
      badgeBg: 'rgba(24, 246, 104, 0.16)',
      badgeColor: '#48FA8B',
      badgeBorder: '1px solid rgba(24, 246, 104, 0.4)',
      iconBg: 'rgba(24, 246, 104, 0.2)',
      iconColor: '#48FA8B'
    };
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        backgroundColor: 'rgba(5, 12, 7, 0.88)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        justifyContent: 'flex-end',
        transition: 'all 0.3s ease'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100vh',
          background: 'linear-gradient(175deg, #102615 0%, #0b1a0e 45%, #071009 100%)',
          borderLeft: '1px solid rgba(186, 253, 193, 0.4)',
          boxShadow: '-14px 0 45px rgba(0,0,0,0.9), -3px 0 20px rgba(24, 246, 104, 0.18)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          backgroundImage: 'radial-gradient(rgba(186, 253, 193, 0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      >
        {/* Header con gradiente verde institucional Kalpagráfica */}
        <div
          style={{
            padding: '1.4rem 1.5rem',
            borderBottom: '1px solid rgba(186, 253, 193, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #17381e 0%, #102615 100%)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(186, 253, 193, 0.18)',
                border: '1px solid #BAFDC1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#BAFDC1',
                boxShadow: '0 0 14px rgba(186, 253, 193, 0.3)',
                flexShrink: 0
              }}
            >
              <SlidersHorizontal size={20} />
            </div>
            <div>
              <div
                className="font-caps"
                style={{ fontSize: '0.7rem', color: '#E6C465', letterSpacing: '0.12em', fontWeight: 700 }}
              >
                Suite Kalpagráfica
              </div>
              <h3
                className="font-headline"
                style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.15 }}
              >
                Panel de Herramientas
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(186, 253, 193, 0.12)',
              border: '1px solid rgba(186, 253, 193, 0.3)',
              color: '#BAFDC1',
              cursor: 'pointer',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            title="Cerrar Panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Buscador de Herramientas sobre verde fondo */}
        <div style={{ padding: '1.1rem 1.5rem 0.6rem' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.9rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#85faaf'
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o categoría..."
              className="input"
              style={{
                paddingLeft: '2.5rem',
                fontSize: '0.85rem',
                height: '42px',
                backgroundColor: 'rgba(8, 18, 10, 0.9)',
                borderColor: 'rgba(186, 253, 193, 0.35)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-md)'
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
                ✕
              </button>
            )}
          </div>

          {/* Contador de utilidades en verde neón */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '0.7rem',
              fontSize: '0.75rem',
              color: 'rgba(229, 229, 231, 0.8)'
            }}
          >
            <span>Catálogo activo de herramientas</span>
            <span
              className="font-mono"
              style={{
                color: '#18f668',
                backgroundColor: 'rgba(24, 246, 104, 0.15)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(24, 246, 104, 0.4)',
                fontWeight: 700
              }}
            >
              {filteredTools.length} disponibles
            </span>
          </div>
        </div>

        {/* Lista de Tarjetas de Herramientas en Verde Institucional */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0.6rem 1.5rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}
        >
          {filteredTools.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                backgroundColor: 'rgba(14, 30, 17, 0.7)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(186, 253, 193, 0.2)',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.88rem'
              }}
            >
              No se encontraron utilidades para "<strong style={{ color: '#BAFDC1' }}>{searchQuery}</strong>".
            </div>
          ) : (
            filteredTools.map((tool) => {
              const Icon = tool.icon;
              const theme = getCategoryTheme(tool.category);

              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    onSelectTool(tool.id, tool.sectionId);
                    onClose();
                  }}
                  className="tool-drawer-card"
                  style={{
                    background: 'linear-gradient(135deg, rgba(20, 46, 26, 0.9) 0%, rgba(11, 24, 14, 0.95) 100%)',
                    border: '1px solid rgba(186, 253, 193, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.1rem',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    minHeight: '80px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem', flex: 1, minWidth: 0 }}>
                    {/* Icon Container amplio */}
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: theme.iconBg,
                        border: `1px solid ${theme.badgeColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.iconColor,
                        flexShrink: 0,
                        boxShadow: `0 0 10px ${theme.badgeBg}`,
                        marginTop: '2px',
                        transition: 'transform 0.25s ease'
                      }}
                      className="tool-card-icon"
                    >
                      <Icon size={20} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Badge por categoría (Menta, Dorado o Esmeralda) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                        <span
                          className="font-caps"
                          style={{
                            fontSize: '0.64rem',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            color: theme.badgeColor,
                            backgroundColor: theme.badgeBg,
                            border: theme.badgeBorder,
                            padding: '0.18rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {tool.category}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.3, marginBottom: '0.2rem' }}>
                        {tool.title}
                      </h4>
                      <p style={{ fontSize: '0.79rem', color: 'rgba(229, 229, 231, 0.78)', lineHeight: 1.4, margin: 0 }}>
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    size={18}
                    style={{ color: 'rgba(186, 253, 193, 0.4)', flexShrink: 0, transition: 'all 0.2s ease' }}
                    className="tool-card-arrow"
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer del Drawer en Verde Neón & Lujo */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(186, 253, 193, 0.25)',
            background: 'linear-gradient(180deg, #0b1a0e 0%, #071009 100%)',
            fontSize: '0.78rem',
            color: 'rgba(229, 229, 231, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={15} color="#18f668" style={{ flexShrink: 0 }} />
            <span>Infraestructura utilitaria Kalpagráfica</span>
          </div>
          <span className="font-mono" style={{ color: '#BAFDC1', fontSize: '0.75rem', fontWeight: 600 }}>
            v2.5
          </span>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .tool-drawer-card:hover {
          border-color: #BAFDC1 !important;
          transform: translateX(-4px);
          background: linear-gradient(135deg, rgba(28, 64, 36, 0.95) 0%, rgba(16, 36, 20, 0.98) 100%) !important;
          box-shadow: 0 6px 24px rgba(186, 253, 193, 0.2) !important;
        }
        .tool-drawer-card:hover .tool-card-icon {
          transform: scale(1.1);
        }
        .tool-drawer-card:hover .tool-card-arrow {
          color: #BAFDC1 !important;
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
}
