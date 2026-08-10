import React from 'react';
import { ArrowRight, Sparkles, CheckCircle, Zap } from 'lucide-react';

export default function HeroSection({ onNavigate, onOpenBrief }) {
  return (
    <section className="blueprint-bg" style={{
      padding: '5rem 1.5rem 6rem',
      maxWidth: 'var(--max-width)',
      margin: '0 auto',
      position: 'relative'
    }}>
      {/* Top Value Badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <div className="badge badge-gold" style={{ padding: '0.5rem 1.2rem' }}>
          <Sparkles size={14} />
          <span>Laboratorio de Soluciones Visuales • Neofuturismo Táctil v7.0</span>
        </div>
      </div>

      {/* Main Headline H1 */}
      <div style={{ textAlign: 'center', maxWidth: '920px', margin: '0 auto 2rem' }}>
        <h1 style={{ color: 'var(--text-primary)', marginBottom: '1.2rem', fontWeight: 700 }}>
          Ingeniería Visual para Forjar <span style={{ color: 'var(--accent)', textDecoration: 'underline decoration-2' }}>Marcas Atemporales</span> y Recursos Didácticos
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '60ch', margin: '0 auto' }}>
          En <strong>Kalpagráfica</strong> la precisión de la ingeniería se encuentra con la mística del legado gráfico. Interfaces y piezas que se sienten construidas con <em>Ingeniería Cero Errores</em>.
        </p>
      </div>

      {/* Hero Action CTAs (Un único CTA primario + un btn-ghost secundario) */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}>
        <button className="btn btn-primary btn-lg" onClick={onOpenBrief}>
          <span>Iniciar Consultoría de Branding</span>
          <ArrowRight size={18} />
        </button>
        <button className="btn btn-ghost btn-lg" onClick={() => onNavigate('portfolio')}>
          <span>Ver Portfolio</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Card Blueprint Demostración Biomecánica */}
      <div className="card-blueprint" style={{
        padding: '2.5rem 2rem',
        marginBottom: '4rem'
      }}>
        <div style={{ textTransform: 'center', marginBottom: '2rem', textAlign: 'center' }}>
          <span className="badge badge-mint" style={{ marginBottom: '0.5rem' }}>
            <Zap size={12} /> Demostración de Calidad & Resistencia
          </span>
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.8rem' }}>
            La Física del Contenedor: ¿Por Qué Exigimos Estándar de Herencia?
          </h3>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '60ch', margin: '0.5rem auto 0' }}>
            Compara empíricamente el comportamiento de los imprimibles convencionales frente a nuestra matriz de construcción en opalina pesada con Borde Sellado.
          </p>
        </div>

        {/* Split Comparison Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          {/* Card 1: Imprimibles Convencionales */}
          <div style={{
            backgroundColor: 'rgba(255, 107, 107, 0.08)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 107, 107, 0.3)',
            padding: '1.8rem',
            position: 'relative'
          }}>
            <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--danger)', color: '#08080A', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
              Problema Frecuente
            </span>
            <h4 style={{ color: '#FF6B6B', fontSize: '1.2rem', marginBottom: '0.8rem' }}>
              Imprimibles Estándar (Papel 75g / Corte al Ras)
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>✕</span>
                <span><strong>Error de Arrastre:</strong> El frente y dorso quedan desalineados por la impresora casera.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>✕</span>
                <span><strong>Efecto Cockling:</strong> El pegamento acuoso arruga el papel de forma irreversible.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>✕</span>
                <span><strong>Ruido Visual:</strong> Dibujos recargados y colores estridentes que agotan la atención.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Colección Mindy (Kalpagráfica) */}
          <div className="card-blueprint card-blueprint-active" style={{
            padding: '1.8rem',
            position: 'relative'
          }}>
            <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--accent)', color: '#08080A', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
              Solución Kalpagráfica
            </span>
            <h4 style={{ color: 'var(--accent)', fontSize: '1.2rem', marginBottom: '0.8rem' }}>
              Colección Mindy (Patrón Infinito + Borde Sellado)
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <CheckCircle size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <span><strong>Absorción Mecánica:</strong> Tecnología de Patrón Infinito en reversos y plegado Fold-Over.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <CheckCircle size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <span><strong>Rigidez de Herencia:</strong> Sustratos pesados (Opalina 200g+) para resistencia biomecánica.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <CheckCircle size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <span><strong>Imágenes 100% Reales:</strong> Fotografía sobre fondo blanco puro y Código Montessori.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Social Proof Strip con JetBrains Mono para números */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '2rem',
        padding: '1.8rem 2rem',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-luxury)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <span className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 500, color: 'var(--accent)' }}>+100</span>
          <p className="font-caps" style={{ color: 'var(--text-secondary)' }}>Marcas & Fundadores</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 500, color: 'var(--luxury)' }}>5 PILARES</span>
          <p className="font-caps" style={{ color: 'var(--text-secondary)' }}>Infraestructura Mindy</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 500, color: 'var(--accent)' }}>100%</span>
          <p className="font-caps" style={{ color: 'var(--text-secondary)' }}>Alineación Cero Errores</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 500, color: 'var(--luxury)' }}>MONTESSORI</span>
          <p className="font-caps" style={{ color: 'var(--text-secondary)' }}>Código de Color Real</p>
        </div>
      </div>
    </section>
  );
}
