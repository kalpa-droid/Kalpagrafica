import React from 'react';
import { X, ShieldCheck, Check, ShoppingCart } from 'lucide-react';
import { KalpaLogoHorizontal, KalpaLogoIcon } from './KalpaLogos';

export default function ProductModal({ product, isOpen, onClose }) {
  if (!isOpen || !product) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      backgroundColor: 'var(--bg-overlay)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="card-blueprint card-blueprint-active" style={{
        maxWidth: '750px',
        width: '100%',
        padding: '2rem',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.2rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-primary)'
          }}
        >
          <X size={24} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {/* Image Column */}
          <div>
            <div style={{
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-base)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '220px',
              padding: '1.5rem'
            }}>
              {product.isSvgLogo ? (
                <KalpaLogoHorizontal style={{ width: '28%', height: 'auto', color: 'var(--accent)' }} />
              ) : product.isSvgIcon ? (
                <KalpaLogoIcon style={{ height: '40px', width: 'auto', color: 'var(--accent)' }} />
              ) : (
                <img
                  src={product.image}
                  alt={product.title}
                  style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                />
              )}
            </div>
            <div style={{
              backgroundColor: 'rgba(201, 169, 77, 0.12)',
              border: '1px solid var(--border-luxury)',
              padding: '0.8rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              color: 'var(--luxury)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <ShieldCheck size={18} />
              <span>Formato PDF de Alta Resolución + Guías de Manufactura Paso a Paso</span>
            </div>
          </div>

          {/* Details Column */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span className="badge badge-mint" style={{ marginBottom: '0.6rem' }}>
                {product.category || 'Colección Mindy'}
              </span>
              <h3 style={{ fontSize: '1.7rem', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.2 }}>
                {product.title}
              </h3>

              {/* Precios con JetBrains Mono (font-mono) */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem', marginBottom: '1rem' }}>
                <span className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 500, color: 'var(--accent)' }}>
                  {product.price}
                </span>
                {product.oldPrice && (
                  <span className="font-mono" style={{ fontSize: '1.1rem', color: 'var(--text-disabled)', textDecoration: 'line-through' }}>
                    {product.oldPrice}
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '1.2rem', lineHeight: 1.5 }}>
                {product.description}
              </p>

              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.6rem' }}>
                Especificaciones de Manufactura e Ingeniería:
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {product.specs?.map((spec, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--accent-muted)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={12} style={{ color: 'var(--accent)' }} />
                    </div>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <a
                href="https://link.mercadopago.com.ar/kalpagrafica"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ width: '100%', textDecoration: 'none' }}
              >
                <ShoppingCart size={18} />
                <span>Comprar Planos Digitales Ahora</span>
              </a>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', textAlign: 'center' }}>
                Descarga instantánea tras la confirmación de pago. Formato PDF multilenguaje.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
