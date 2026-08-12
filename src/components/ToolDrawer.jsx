import React, { useState } from 'react';
import { X, Search, Wrench, ChevronRight, Sparkles } from 'lucide-react';
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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        backgroundColor: 'rgba(8, 8, 10, 0.8)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        justifyContent: 'flex-end',
        transition: 'opacity 0.3s ease'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '380px',
          height: '100vh',
          backgroundColor: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-strong)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.2rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-surface-2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-muted)',
                border: '1px solid var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)'
              }}
            >
              <Wrench size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Panel de Herramientas
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-disabled)' }}>
                {TOOLS_REGISTRY.length} utilidades disponibles
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '1rem 1.5rem 0.6rem' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '0.8rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar herramienta..."
              className="input"
              style={{
                paddingLeft: '2.2rem',
                fontSize: '0.82rem',
                height: '38px',
                backgroundColor: 'var(--bg-base)'
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
        </div>

        {/* Tools List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0.6rem 1.5rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          {filteredTools.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-disabled)', fontSize: '0.85rem' }}>
              No se encontraron herramientas con "{searchQuery}".
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
                  className="tool-drawer-item"
                  style={{
                    backgroundColor: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.8rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', flex: 1 }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--accent-muted)',
                        border: '1px solid rgba(186,253,193,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent)',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    >
                      <Icon size={18} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: 'var(--luxury)',
                            backgroundColor: 'rgba(201,169,77,0.12)',
                            padding: '0.1rem 0.4rem',
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          {tool.category}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                        {tool.title}
                      </h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.35, marginTop: '0.25rem' }}>
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <ChevronRight size={16} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer Info */}
        <div
          style={{
            padding: '0.8rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-base)',
            fontSize: '0.74rem',
            color: 'var(--text-disabled)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Sparkles size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
          <span>Acceso rápido nativo a la suite utilitaria Kalpagráfica.</span>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .tool-drawer-item:hover {
          border-color: var(--accent) !important;
          transform: translateX(-2px);
          background-color: rgba(186, 253, 193, 0.04) !important;
        }
      `}</style>
    </div>
  );
}
