import React, { useState } from 'react';
import { Briefcase, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export default function ServicesSection({ onOpenBrief }) {
  const [openFaq, setOpenFaq] = useState(null);

  const ritualPhases = [
    {
      phase: "Fase 1",
      name: "Descubrimiento (El Infinito)",
      description: "Una inmersión profunda orientada a descifrar la verdadera historia, la visión a largo plazo y el propósito del fundador."
    },
    {
      phase: "Fase 2",
      name: "Estrategia (La Ascendencia)",
      description: "Definición del ADN de la marca, estructurando su arquetipo de personalidad, propuesta única de posicionamiento y narrativa bajo el concepto de Legado."
    },
    {
      phase: "Fase 3",
      name: "Identidad (La Realización)",
      description: "Diseño del universo visual completo (logotipo, paleta cromática, sistema tipográfico y manual de marca) concebido como la consecuencia de la estrategia previa."
    }
  ];

  const packages = [
    {
      name: "Identidad Esencial",
      level: "Nivel 1",
      price: "$450 USD",
      features: [
        "Fase de Descubrimiento & Diagnóstico",
        "Diseño de Logotipo Vectorial Modular",
        "Paleta Cromática & Sistema Tipográfico",
        "Entregables en SVG, PDF y PNG HD",
        "Licencia Comercial Completa"
      ],
      isPopular: false
    },
    {
      name: "Sistema de Marca Completo",
      level: "Nivel 2 (Recomendado)",
      price: "$850 USD",
      features: [
        "Ritual Kalpa Completo (3 Fases)",
        "Logotipo Principal + Variantes Secundarias",
        "Manual de Normas de Marca (35+ págs)",
        "Plantillas para Redes Sociales & Presentación",
        "Diseño de Tarjetas & Papelería",
        "Soporte Estratégico por 30 Días"
      ],
      isPopular: true
    },
    {
      name: "Rebranding & Experiencia Web",
      level: "Nivel 3",
      price: "$1.400 USD",
      features: [
        "Todo lo incluido en el Nivel 2",
        "Rediseño Estratégico de Posicionamiento",
        "Diseño & Desarrollo de Sitio Web SPA / Landing",
        "Optimización SEO & Velocidad de Carga",
        "Capacitación 1:1 para Autogestión",
        "Acompañamiento en Lanzamiento"
      ],
      isPopular: false
    }
  ];

  const faqs = [
    {
      q: "¿Cuánto tiempo toma completar un proyecto de branding con El Ritual Kalpa?",
      a: "Un proyecto típico de Nivel 1 o Nivel 2 toma entre 3 y 5 semanas. El Nivel 3 con desarrollo web suele extenderse entre 6 y 8 semanas, asegurando una fase de estrategia sólida."
    },
    {
      q: "¿Qué sucede si no tengo claro el arquetipo o la voz de mi marca?",
      a: "Para eso diseñamos la Fase 1: Descubrimiento (El Infinito). Te guiamos a través de dinámicas estratégicas para extraer la esencia de tu proyecto sin que necesites conocimientos previos."
    },
    {
      q: "¿Cómo recibo mis archivos y qué licencias incluyen?",
      a: "Recibes una carpeta digital organizada con archivos editables vectoriales (SVG, AI, PDF) y formatos listos para web (PNG transparente, JPG HD). Incluye la cesión total de derechos comerciales."
    },
    {
      q: "¿Cuáles son las modalidades de pago aceptadas?",
      a: "Trabajamos con transferencia en Mercado Pago (Alias: Kalpa.mp) para Argentina y PayPal para clientes internacionales, en esquema de 50% al iniciar y 50% contra entrega final."
    }
  ];

  return (
    <section id="servicios" style={{
      padding: '5rem 1.5rem',
      maxWidth: 'var(--max-width)',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <span className="badge badge-navy" style={{ marginBottom: '0.6rem' }}>
          <Briefcase size={12} /> Servicios de Consultoría
        </span>
        <h2 style={{ color: 'var(--text-primary)', fontSize: '2.4rem', marginBottom: '0.8rem' }}>
          Consultoría de Branding Estratégico: "El Ritual Kalpa"
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto' }}>
          Diseñado para emprendedores y fundadores ("Arquitectos de Mundos") que buscan transformar la energía de sus ideas en marcas duraderas.
        </p>
      </div>

      {/* Methodology Section (El Ritual Kalpa) */}
      <div className="card-blueprint card-blueprint-active" style={{
        padding: '3rem 2rem',
        marginBottom: '4rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="font-caps" style={{ color: 'var(--luxury)' }}>
            Metodología Central
          </span>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginTop: '0.3rem' }}>
            Las 3 Fases Consecutivas del Ritual Kalpa
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {ritualPhases.map((phase, idx) => (
            <div key={idx} className="card-blueprint" style={{
              padding: '1.8rem',
              position: 'relative'
            }}>
              <span className="font-caps" style={{ color: 'var(--accent)' }}>
                {phase.phase}
              </span>
              <h4 style={{ fontSize: '1.25rem', color: 'var(--luxury)', margin: '0.4rem 0 0.8rem' }}>
                {phase.name}
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {phase.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Packages Pricing Grid */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>
          Paquetes Claros de Inversión
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Selecciona el nivel que mejor se adapte a la etapa de tu emprendimiento.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        {packages.map((pkg, idx) => (
          <div key={idx} className={`card-blueprint ${pkg.isPopular ? 'card-blueprint-active' : ''}`} style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between'
          }}>
            <div>
              <span className="badge badge-gold font-mono" style={{ marginBottom: '0.5rem' }}>{pkg.level}</span>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{pkg.name}</h3>
              {/* Precio con JetBrains Mono (font-mono) */}
              <div className="font-mono" style={{ fontSize: '2rem', fontWeight: 500, color: 'var(--accent)', marginBottom: '1.5rem' }}>
                {pkg.price}
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                {pkg.features.map((feat, fIdx) => (
                  <li key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button className="btn btn-primary" onClick={onOpenBrief} style={{ width: '100%' }}>
              <span>Solicitar Propuesta</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* FAQ Accordion */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="badge badge-navy" style={{ marginBottom: '0.5rem' }}>
            <HelpCircle size={12} /> Preguntas Frecuentes
          </span>
          <h3 style={{ fontSize: '1.6rem', color: 'var(--text-primary)' }}>
            Dudas Comunes sobre Tiempos & Entregables
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, i) => (
            <div key={i} className="card-blueprint" style={{ padding: '1.2rem 1.5rem', cursor: 'pointer' }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: '0.98rem', color: 'var(--text-primary)' }}>{faq.q}</strong>
                {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
              {openFaq === i && (
                <p style={{ marginTop: '0.8rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
