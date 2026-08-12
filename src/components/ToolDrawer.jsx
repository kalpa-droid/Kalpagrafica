import React, { useState } from 'react';
import { X, Search, ChevronRight, Sparkles, SlidersHorizontal } from 'lucide-react';
import { TOOLS_REGISTRY } from '../data/toolsRegistry';

export default function ToolDrawer({ isOpen, onClose, onSelectTool }) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredTools = TOOLS_REGISTRY.filter((tool) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      tool.title.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q)
    );
  });

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
        className="tool-drawer-container"
        style={{
          width: '100%',
          maxWidth: '500px',
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
          backgroundSize: '24px 24px',
          boxSizing: 'border-box'
        }}
      >
        {/* Header Institucional Kalpagráfica */}
        <div
          style={{
            padding: '1.2rem 1.25rem',
            borderBottom: '1px solid rgba(186, 253, 193, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #17381e 0%, #102615 100%)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(186, 253, 193, 0.18)',
                border: '1px solid #BAFDC1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#BAFDC1',
                boxShadow: '0 0 12px rgba(186, 253, 193, 0.3)',
                flexShrink: 0
              }}
            >
              <SlidersHorizontal size={20} />
            </div>
            <div>
              <div
                className="font-caps"
                style={{ fontSize: '0.68rem', color: '#E6C465', letterSpacing: '0.12em', fontWeight: 700 }}
              >
                Suite Kalpagráfica
              </div>
              <h3
                className="font-headline"
                style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.15, margin: 0 }}
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

        {/* Buscador de Herramientas */}
        <div style={{ padding: '0.9rem 1.25rem 0.4rem', boxSizing: 'border-box' }}>
          <div style={{ position: 'relative', width: '100%' }}>
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
              placeholder="Buscar herramienta..."
              className="input"
              style={{
                width: '100%',
                paddingLeft: '2.5rem',
                fontSize: '0.85rem',
                height: '40px',
                backgroundColor: 'rgba(8, 18, 10, 0.9)',
                borderColor: 'rgba(186, 253, 193, 0.35)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                boxSizing: 'border-box'
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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.72rem', color: 'rgba(229, 229, 231, 0.7)' }}>
            <span>Grilla de utilidades activas</span>
            <span className="font-mono" style={{ color: '#18f668', backgroundColor: 'rgba(24,246,104,0.15)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
              {filteredTools.length} tools
            </span>
          </div>
        </div>

        {/* Grilla Dinámica de 2 Columnas (Tanto en Celular como en Web) */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0.5rem 1.25rem 1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.65rem',
            alignContent: 'start',
            boxSizing: 'border-box'
          }}
        >
          {filteredTools.length === 0 ? (
            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '2.5rem 1rem',
                backgroundColor: 'rgba(14, 30, 17, 0.7)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(186, 253, 193, 0.2)',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.85rem'
              }}
            >
              No se encontraron utilidades para "<strong style={{ color: '#BAFDC1' }}>{searchQuery}</strong>".
            </div>
          ) : (
            filteredTools.map((tool) => {
              const Icon = tool.icon;

              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    onSelectTool(tool.id, tool.sectionId);
                    onClose();
                  }}
                  className="tool-drawer-card"
                  style={{
                    background: 'linear-gradient(135deg, rgba(20, 46, 26, 0.95) 0%, rgba(11, 24, 14, 0.98) 100%)',
                    border: '1px solid rgba(186, 253, 193, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.7rem 0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    minHeight: '54px',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* Símbolo de la Herramienta */}
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(186, 253, 193, 0.18)',
                      border: '1px solid #BAFDC1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#BAFDC1',
                      flexShrink: 0,
                      boxShadow: '0 0 8px rgba(186, 253, 193, 0.2)',
                      transition: 'transform 0.2s ease'
                    }}
                    className="tool-card-icon"
                  >
                    <Icon size={17} />
                  </div>

                  {/* Nombre Directo de la Herramienta (Max 2 líneas) */}
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#FFFFFF',
                      flex: 1,
                      lineHeight: 1.25,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      wordBreak: 'break-word'
                    }}
                  >
                    {tool.title}
                  </span>

                  <ChevronRight
                    size={14}
                    style={{ color: 'rgba(186, 253, 193, 0.4)', flexShrink: 0, transition: 'transform 0.2s ease' }}
                    className="tool-card-arrow"
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer del Drawer */}
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderTop: '1px solid rgba(186, 253, 193, 0.25)',
            background: 'linear-gradient(180deg, #0b1a0e 0%, #071009 100%)',
            fontSize: '0.76rem',
            color: 'rgba(229, 229, 231, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={14} color="#18f668" style={{ flexShrink: 0 }} />
            <span>Infraestructura utilitaria Kalpagráfica</span>
          </div>
          <span className="font-mono" style={{ color: '#BAFDC1', fontSize: '0.72rem', fontWeight: 600 }}>
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
          transform: translateY(-2px);
          background: linear-gradient(135deg, rgba(28, 64, 36, 0.98) 0%, rgba(16, 36, 20, 0.98) 100%) !important;
          box-shadow: 0 4px 14px rgba(186, 253, 193, 0.2) !important;
        }
        .tool-drawer-card:hover .tool-card-icon {
          transform: scale(1.08);
          background-color: rgba(186, 253, 193, 0.25) !important;
        }
        .tool-drawer-card:hover .tool-card-arrow {
          color: #BAFDC1 !important;
          transform: translateX(2px);
        }
        @media (max-width: 640px) {
          .tool-drawer-container {
            width: 100vw !important;
            max-width: 100vw !important;
          }
        }
      `}</style>
    </div>
  );
}
