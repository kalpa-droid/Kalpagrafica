import React from 'react';
import { KalpaLogoHorizontal } from './KalpaLogos';
import { InstagramIcon, LinkedinIcon, YoutubeIcon } from './SocialIcons';

export default function Footer({ onNavigate }) {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-base)',
      color: 'var(--text-primary)',
      padding: '4rem 1.5rem 2rem',
      borderTop: '1px solid var(--border-subtle)',
      marginTop: '4rem',
      position: 'relative'
    }}>
      <div style={{
        maxWidth: 'var(--max-width)',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '3rem',
        marginBottom: '3rem'
      }}>
        {/* Column 1: Brand Info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.2rem' }}>
            <KalpaLogoHorizontal style={{ width: '130px', height: 'auto', color: 'var(--accent)' }} />
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Transformamos el caos en orden estratégico. Creamos identidades visuales atemporales y herramientas didácticas de alta precisión cognitiva diseñadas para perdurar en el tiempo.
          </p>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
              <InstagramIcon size={18} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
              <LinkedinIcon size={18} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
              <YoutubeIcon size={18} />
            </a>
          </div>
        </div>

        {/* Column 2: Navegación Rápida */}
        <div>
          <h4 className="font-caps" style={{ color: 'var(--luxury)', marginBottom: '1.2rem' }}>
            Navegación
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {['logobook', 'herramientas', 'tienda', 'educacion', 'comunidad', 'estudio'].map((sec) => (
              <li key={sec}>
                <button
                  onClick={() => onNavigate(sec)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--accent)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                >
                  {sec === 'logobook' ? 'Libro de Logos' : sec === 'herramientas' ? 'Herramientas (Delphi Tools)' : sec === 'tienda' ? 'Tienda (Colección Mindy)' : sec}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Soluciones Principales */}
        <div>
          <h4 className="font-caps" style={{ color: 'var(--luxury)', marginBottom: '1.2rem' }}>
            Soluciones Clave
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <li>• Catálogo Libro de Logos (6,200+ marcas)</li>
            <li>• Pack Premium Colección Mindy (5 Pilares)</li>
            <li>• Llavero Manos Silábicas (Fold-Over)</li>
            <li>• Murales Mosaico A4 (Doble Corte)</li>
            <li>• Baraja de Asociación (Patrón Infinito)</li>
            <li>• Plantillas de Marca & Brand Guidelines</li>
          </ul>
        </div>

        {/* Column 4: Transparencia & Newsletter */}
        <div>
          <h4 className="font-caps" style={{ color: 'var(--luxury)', marginBottom: '1.2rem' }}>
            Boletín Técnico & Legales
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Recibe guías de manufactura, artículos de neuroeducación y análisis estratégicos de branding en tu casilla.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="email"
              placeholder="tu.email@ejemplo.com"
              className="input"
              style={{ flex: 1, padding: '0.6rem 0.8rem', fontSize: '0.85rem' }}
            />
            <button className="btn btn-primary btn-sm">
              Unirse
            </button>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', lineHeight: 1.4 }}>
            * Kalpagráfica respeta tu privacidad. Sin spam. Cumplimiento de normativas de protección de datos de usuarios.
          </div>
        </div>
      </div>

      {/* Bottom Bar & Copyright */}
      <div style={{
        maxWidth: 'var(--max-width)',
        margin: '0 auto',
        paddingTop: '2rem',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        fontSize: '0.8rem',
        color: 'var(--text-disabled)'
      }}>
        <div>
          © 2026 <strong>Kalpagráfica</strong> | Fundador: José Ramiro Burgos. Herramientas basadas en <a href="https://delphi.tools/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>delphi.tools</a> (@1612elphi).
        </div>
        <div style={{ fontStyle: 'italic', color: 'var(--luxury)' }}>
          "Kalpa": El inmenso ciclo de creación y evolución atemporal.
        </div>
      </div>

      <div style={{
        marginTop: '1.2rem',
        paddingTop: '0.8rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center',
        fontSize: '0.74rem',
        color: 'var(--text-disabled)',
        lineHeight: 1.4
      }}>
        Pantone® es una marca registrada de Pantone LLC. Esta herramienta web ofrece aproximaciones informáticas con fines educativos y de diseño, y no está afiliada, respaldada ni patrocinada por Pantone LLC.
      </div>
    </footer>
  );
}
