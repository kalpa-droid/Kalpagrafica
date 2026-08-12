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

  // Helper para paleta de colores por categoría
  const getCategoryTheme = (category) => {
    if (category === 'Tools Impresión') {
      return {
        badgeBg: 'rgba(186, 253, 193, 0.12)',
        badgeColor: 'var(--accent)',
        badgeBorder: '1px solid rgba(186, 253, 193, 0.3)',
        iconBg: 'rgba(186, 253, 193, 0.15)',
        iconColor: 'var(--accent)',
        hoverBorder: 'var(--accent)'
      };
    }
    if (category === 'Tools de Edición') {
      return {
        badgeBg: 'rgba(201, 169, 77, 0.12)',
        badgeColor: 'var(--luxury)',
        badgeBorder: '1px solid rgba(201, 169, 77, 0.35)',
        iconBg: 'rgba(201, 169, 77, 0.15)',
        iconColor: 'var(--luxury)',
        hoverBorder: 'var(--luxury)'
      };
    }
    // Tools Diseño (por defecto cian/neón)
    return {
      badgeBg: 'rgba(56, 189, 248, 0.12)',
      badgeColor: '#38BDF8',
      badgeBorder: '1px solid rgba(56, 189, 248, 0.3)',
      iconBg: 'rgba(56, 189, 248, 0.15)',
      iconColor: '#38BDF8',
      hoverBorder: '#38BDF8'
    };
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        backgroundColor: 'rgba(8, 8, 10, 0.85)',
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
          maxWidth: '400px',
          height: '100vh',
          backgroundColor: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-luxury)',
          boxShadow: '-12px 0 40px rgba(0,0,0,0.85), -2px 0 15px rgba(186, 253, 193, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          backgroundImage: 'radial-gradient(rgba(186, 253, 193, 0.04) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        {/* Drawer Header Estilo Kalpagráfica */}
        <div
          style={{
            padding: '1.4rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, var(--bg-surface-2) 0%, var(--bg-surface) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-muted)',
                border: '1px solid var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)',
                boxShadow: '0 0 12px rgba(186, 253, 193, 0.2)'
              }}
            >
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <div
                className="font-caps"
                style={{ fontSize: '0.68rem', color: 'var(--luxury)', letterSpacing: '0.12em', fontWeight: 600 }}
              >
                Suite Utilitaria
              </div>
              <h3
                className="font-headline"
                style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.15 }}
              >
                Panel de Herramientas
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            title="Cerrar Panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Buscador de Herramientas con acentos neón */}
        <div style={{ padding: '1rem 1.5rem 0.6rem' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o categoría..."
              className="input"
              style={{
                paddingLeft: '2.4rem',
                fontSize: '0.84rem',
                height: '40px',
                backgroundColor: 'var(--bg-base)',
                borderColor: 'var(--border-subtle)',
                borderRadius: 'var(--radius-md)'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.7rem',
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

          {/* Contador de utilidades en verde neón */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '0.6rem',
              fontSize: '0.72rem',
              color: 'var(--text-secondary)'
            }}
          >
            <span>Registro activo de utilidades</span>
            <span
              className="font-mono"
              style={{
                color: 'var(--accent)',
                backgroundColor: 'var(--accent-muted)',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(186,253,193,0.3)',
                fontWeight: 600
              }}
            >
              {filteredTools.length} disponibles
            </span>
          </div>
        </div>

        {/* Lista de Tarjetas de Herramientas con estilo Blueprint/Neón */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0.6rem 1.5rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem'
          }}
        >
          {filteredTools.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                backgroundColor: 'var(--bg-surface-2)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-disabled)',
                fontSize: '0.85rem'
              }}
            >
              No se encontraron utilidades para "<strong style={{ color: 'var(--accent)' }}>{searchQuery}</strong>".
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
                    backgroundColor: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.9rem 1.1rem',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.85rem',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: 1 }}>
                    {/* Icon Container con color por categoría */}
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: theme.iconBg,
                        border: `1px solid ${theme.badgeColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.iconColor,
                        flexShrink: 0,
                        marginTop: '2px',
                        transition: 'transform 0.25s ease'
                      }}
                      className="tool-card-icon"
                    >
                      <Icon size={18} />
                    </div>

                    <div style={{ flex: 1 }}>
                      {/* Badge por categoría (Menta, Dorado o Cian) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                        <span
                          className="font-caps"
                          style={{
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            color: theme.badgeColor,
                            backgroundColor: theme.badgeBg,
                            border: theme.badgeBorder,
                            padding: '0.15rem 0.45rem',
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          {tool.category}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                        {tool.title}
                      </h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.38, marginTop: '0.25rem' }}>
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    size={16}
                    style={{ color: 'var(--text-disabled)', flexShrink: 0, transition: 'all 0.2s ease' }}
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
            padding: '0.9rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-base)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Sparkles size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
            <span>Infraestructura utilitaria Kalpagráfica</span>
          </div>
          <span className="font-caps" style={{ color: 'var(--luxury)', fontSize: '0.68rem', fontWeight: 600 }}>
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
          border-color: var(--accent) !important;
          transform: translateX(-3px);
          background-color: rgba(186, 253, 193, 0.05) !important;
          box-shadow: 0 4px 18px rgba(186, 253, 193, 0.12) !important;
        }
        .tool-drawer-card:hover .tool-card-icon {
          transform: scale(1.08);
        }
        .tool-drawer-card:hover .tool-card-arrow {
          color: var(--accent) !important;
          transform: translateX(3px);
        }
      `}</style>
    </div>
  );
}
