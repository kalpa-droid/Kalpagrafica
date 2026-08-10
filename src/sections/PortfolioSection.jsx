import React, { useState } from 'react';
import { ArrowUpRight, Award } from 'lucide-react';
import { KalpaLogoHorizontal, KalpaLogoIcon } from '../components/KalpaLogos';

export default function PortfolioSection({ onOpenBrief }) {
  const [filter, setFilter] = useState('all');

  const caseStudies = [
    {
      id: 1,
      title: "AgroHerencia — Identidad de Marca Atemporal",
      category: "branding",
      brief: "Transformar la imagen de una empresa familiar agropecuaria tradicional en una marca corporativa sólida sin perder el arraigo emocional y la visión de legado.",
      process: "Fase de Descubrimiento del Ritual Kalpa, definición del arquetipo del Gobernador/Sabio, tipografía estructurada y paleta verde bosque profunda.",
      result: "Logotipo vectorial modular, manual de normas de marca de 45 páginas e incremento del 30% en la percepción de valor de sus clientes B2B.",
      isSvgLogo: true,
      tag: "Branding Estratégico",
      client: "Roberto & Familia (AgroHerencia)"
    },
    {
      id: 2,
      title: "Colección Mindy — Infraestructura Pedagógica Montessori",
      category: "didactico",
      brief: "Diseñar un ecosistema de materiales manipulativos manipulables libres de sobreestimulación visual para el aprendizaje silábico y la lectoescritura autónoma.",
      process: "Aplicación estricta de la Cognición Corporizada, fotografía real sobre fondo blanco puro, tecnología de Patrón Infinito y guías de ensamblaje Fold-Over.",
      result: "Pack de 5 pilares estructurales adoptado por más de 150 educadoras y familias con estándar de Calidad de Herencia.",
      image: "/assets/mindy/baraja-asociacion.jpg",
      tag: "Ingeniería Didáctica",
      client: "Elena (Guía Montessori & Autora)"
    },
    {
      id: 3,
      title: "KaraokeSync WebApp — Software Cognitivo Audiovisual",
      category: "digital",
      brief: "Desarrollar una aplicación web interactiva para subtitulación de videos musicales, aislamiento de vocales con IA y edición de texto en tiempo real.",
      process: "Arquitectura React SPA con diseño oscuro de alta legibilidad, integración de Whisper AI para transcripción y motor de sincronización por teclas.",
      result: "Herramienta digital ligera con procesamiento en tiempo real y soporte multilingüe.",
      isSvgIcon: true,
      tag: "App & Interfaz Web",
      client: "Proyecto Propio Kalpagráfica"
    }
  ];

  const filteredCases = filter === 'all' ? caseStudies : caseStudies.filter(c => c.category === filter);

  return (
    <section id="portfolio" style={{
      padding: '5rem 1.5rem',
      maxWidth: 'var(--max-width)',
      margin: '0 auto'
    }}>
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span className="badge badge-gold" style={{ marginBottom: '0.6rem' }}>
          <Award size={12} /> Portfolio / Casos de Estudio
        </span>
        <h2 style={{ color: 'var(--color-surface-light)', fontSize: '2.4rem', marginBottom: '0.8rem' }}>
          Historias de Transformación & Rigor Visual
        </h2>
        <p style={{ color: 'rgba(236, 236, 236, 0.75)', maxWidth: '650px', margin: '0 auto' }}>
          Explora nuestros casos de estudio completos con metodologías explicadas y la galería de estilos para proyectos de marca.
        </p>
      </div>

      {/* Filter Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'Todos los Trabajos' },
          { id: 'branding', label: 'Branding Estratégico' },
          { id: 'didactico', label: 'Ingeniería Didáctica' },
          { id: 'digital', label: 'Interfaces & Software' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: 'var(--radius-md)',
              border: filter === f.id ? '1px solid var(--color-accent)' : 'var(--border-blueprint)',
              backgroundColor: filter === f.id ? 'var(--color-accent)' : 'var(--color-surface-card-solid)',
              color: filter === f.id ? 'var(--color-primary)' : 'var(--color-surface-light)',
              fontWeight: 700,
              fontSize: '0.88rem',
              fontFamily: 'var(--font-headline)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Case Studies Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem', marginBottom: '4rem' }}>
        {filteredCases.map((item) => (
          <div key={item.id} className="card-blueprint" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{
              height: '220px',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              position: 'relative',
              overflow: 'hidden',
              borderBottom: 'var(--border-blueprint)'
            }}>
              {item.isSvgLogo ? (
                <KalpaLogoHorizontal style={{ width: '28%', height: 'auto', color: 'var(--color-accent)' }} />
              ) : item.isSvgIcon ? (
                <KalpaLogoIcon style={{ height: '40px', width: 'auto', color: 'var(--color-accent)' }} />
              ) : (
                <img
                  src={item.image}
                  alt={item.title}
                  style={{ maxHeight: '140px', maxWidth: '80%', objectFit: 'contain' }}
                />
              )}
              <span className="badge badge-gold" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                {item.tag}
              </span>
            </div>

            <div style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--color-surface-light)', marginBottom: '0.8rem' }}>
                  {item.title}
                </h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <strong className="font-caps" style={{ color: '#e5cd6c', display: 'block', marginBottom: '0.2rem' }}>
                    El Brief:
                  </strong>
                  <p style={{ fontSize: '0.88rem', color: 'rgba(236, 236, 236, 0.75)' }}>
                    {item.brief}
                  </p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <strong className="font-caps" style={{ color: '#e5cd6c', display: 'block', marginBottom: '0.2rem' }}>
                    Estrategia Ritual Kalpa:
                  </strong>
                  <p style={{ fontSize: '0.88rem', color: 'rgba(236, 236, 236, 0.75)' }}>
                    {item.process}
                  </p>
                </div>
              </div>

              <div style={{
                borderTop: '1px solid rgba(160, 137, 43, 0.2)',
                paddingTop: '1rem',
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'rgba(236, 236, 236, 0.6)' }}>
                  Cliente: {item.client}
                </span>
                <button
                  onClick={onOpenBrief}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-accent)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <span>Ver Proceso</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Galería Rápida de Identidades Visuales */}
      <div className="card-blueprint" style={{
        padding: '2.5rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--color-surface-light)' }}>
            Galería Rápida de Identidades Visuales
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'rgba(236, 236, 236, 0.75)' }}>
            Logotipos en código SVG puro optimizado con soporte currentColor dinámico.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <div className="card-blueprint" style={{ padding: '1.8rem', textAlign: 'center' }}>
            <KalpaLogoHorizontal style={{ width: '33%', height: 'auto', color: 'var(--color-accent)', margin: '0 auto 1rem', display: 'block' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-surface-light)', display: 'block' }}>Logo Horizontal</span>
            <span style={{ fontSize: '0.75rem', color: '#e5cd6c' }}>Versión Completa (1/3)</span>
          </div>

          <div className="card-blueprint" style={{ padding: '1.8rem', textAlign: 'center' }}>
            <KalpaLogoIcon style={{ height: '28px', width: 'auto', color: 'var(--color-accent)', margin: '0 auto 1rem', display: 'block' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-surface-light)', display: 'block' }}>Icono Reducido</span>
            <span style={{ fontSize: '0.75rem', color: '#e5cd6c' }}>Símbolo Emblema (1/3)</span>
          </div>

          <div className="card-blueprint" style={{ padding: '1.8rem', textAlign: 'center' }}>
            <KalpaLogoHorizontal style={{ width: '33%', height: 'auto', color: '#e5cd6c', margin: '0 auto 1rem', display: 'block' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-surface-light)', display: 'block' }}>Logo Gold Matte</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)' }}>Edición Premium (1/3)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
