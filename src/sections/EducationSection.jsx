import React, { useState } from 'react';
import { BookOpen, UserCheck, FileText, Download, ArrowUpRight } from 'lucide-react';

export default function EducationSection() {
  const [activeTab, setActiveTab] = useState('cursos');

  const courses = [
    {
      title: "Diseño de Infraestructura Didáctica Montessori",
      type: "Curso Grabado",
      duration: "6 Módulos (12 Horas)",
      description: "Aprende los principios de la Cognición Corporizada, fotografía sobre fondos blancos puros y la termodinámica del plastificado a 125 micras para crear materiales educativos indestructibles.",
      price: "$18.000 ARS"
    },
    {
      title: "El Ritual Kalpa: Branding Estratégico para Fundadores",
      type: "Curso Grabado",
      duration: "8 Módulos (16 Horas)",
      description: "Metodología práctica para descifrar el ADN de una marca, estructurar la voz corporativa y diseñar sistemas de identidad visual que perduren en el tiempo.",
      price: "$24.000 ARS"
    }
  ];

  const articles = [
    {
      title: "Por qué la cola blanca acuosa arruina tus imprimibles (Reología del Cockling)",
      category: "Ingeniería de Materiales",
      readTime: "6 min de lectura",
      snippet: "Análisis técnico de cómo la alta higroscopicidad de los adhesivos PVA dilata las fibras de celulosa del papel y por qué el adhesivo en spray garantiza una rigidez compuesta."
    },
    {
      title: "Reduciendo la Carga Cognitiva Extraña en el Aula Montessori",
      category: "Neuroeducación",
      readTime: "8 min de lectura",
      snippet: "Estudio sobre cómo los dibujos animados saturados dispersan la atención del niño y el impacto positivo del aislamiento de dificultad mediante fotografía real."
    },
    {
      title: "Más allá del Isologotipo: La Coherencia Estratégica como Legado",
      category: "Branding",
      readTime: "10 min de lectura",
      snippet: "Reflexión inspirada en Norberto Chaves sobre la diferencia entre la simple moda gráfica y la construcción de infraestructura comunicacional duradera."
    }
  ];

  const freeResources = [
    {
      title: "Checklist de Manufactura Cero Errores (PDF)",
      description: "Guía rápida con los 7 pasos obligatorios para imprimir, hendir (scoring) y plastificar tarjetas sin burbujas ni deslineación.",
      format: "PDF Gratuito"
    },
    {
      title: "Guía de Selección de Sustratos (Papel 200g+ vs Bond)",
      description: "Manual comparativo de opacidad, rigidez a la flexión y gramajes ideales para aulas y uso intensivo.",
      format: "PDF Gratuito"
    }
  ];

  return (
    <section id="educacion" style={{
      padding: '5rem 1.5rem',
      maxWidth: 'var(--max-width)',
      margin: '0 auto'
    }}>
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span className="badge badge-gold" style={{ marginBottom: '0.6rem' }}>
          <BookOpen size={12} /> Educación & Conocimiento
        </span>
        <h2 style={{ color: 'var(--text-primary)', fontSize: '2.4rem', marginBottom: '0.8rem' }}>
          Escuela de Diseño & Artículos Técnicos
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto' }}>
          Formación propia, mentorías 1:1, artículos de análisis estratégico sobre branding y recursos técnicos gratuitos para la comunidad.
        </p>
      </div>

      {/* Tabs Header */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
        {[
          { id: 'cursos', label: 'Cursos Propios', icon: BookOpen },
          { id: 'mentoria', label: 'Mentoría 1:1', icon: UserCheck },
          { id: 'blog', label: 'Blog & Opinión', icon: FileText },
          { id: 'gratuitos', label: 'Recursos Gratuitos', icon: Download }
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="font-caps"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.4rem',
                borderRadius: 'var(--radius-md)',
                border: activeTab === t.id ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                backgroundColor: activeTab === t.id ? 'var(--accent)' : 'var(--bg-surface-2)',
                color: activeTab === t.id ? '#08080A' : 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={16} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Cursos Grabados */}
      {activeTab === 'cursos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {courses.map((c, i) => (
            <div key={i} className="card-blueprint" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span className="badge badge-mint font-mono" style={{ marginBottom: '0.8rem' }}>{c.type} • {c.duration}</span>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.8rem' }}>{c.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{c.description}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <span className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 500, color: 'var(--accent)' }}>{c.price}</span>
                <button className="btn btn-primary btn-sm">
                  Inscribirme
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Mentoría 1:1 */}
      {activeTab === 'mentoria' && (
        <div className="card-blueprint card-blueprint-active" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <UserCheck size={48} style={{ color: 'var(--accent)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Mentoría Privada 1:1 con José Ramiro Burgos
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            Sesiones personalizadas dirigidas a diseñadores independientes y fundadores. Revisión de portfolio, optimización de procesos en Illustrator/Figma y estructuración de proyectos de branding estratégico.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div>
              <strong className="font-mono" style={{ display: 'block', fontSize: '1.4rem', color: 'var(--luxury)' }}>60 Minutos</strong>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Diagnóstico Focalizado</span>
            </div>
            <div>
              <strong className="font-mono" style={{ display: 'block', fontSize: '1.4rem', color: 'var(--accent)' }}>Feedback en Vivo</strong>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Revisión de Archivos Vectoriales</span>
            </div>
          </div>
          <a href="https://paypal.me/JoseRamiroBurgos" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            Agendar Sesión de Mentoría
          </a>
        </div>
      )}

      {/* Tab 3: Blog / Artículos */}
      {activeTab === 'blog' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {articles.map((art, i) => (
            <div key={i} className="card-blueprint" style={{ padding: '1.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                <span className="badge badge-gold">{art.category}</span>
                <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-disabled)' }}>{art.readTime}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.6rem' }}>{art.title}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>{art.snippet}</p>
              <button className="btn btn-ghost btn-sm" style={{ paddingLeft: 0, color: 'var(--accent)' }}>
                <span>Leer Artículo Completo</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Recursos Gratuitos */}
      {activeTab === 'gratuitos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {freeResources.map((res, i) => (
            <div key={i} className="card-blueprint" style={{ padding: '2rem', borderLeft: '4px solid var(--luxury)' }}>
              <span className="badge badge-mint font-mono" style={{ marginBottom: '0.8rem' }}>{res.format}</span>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '0.6rem' }}>{res.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{res.description}</p>
              <button className="btn btn-secondary" style={{ width: '100%' }}>
                <Download size={16} />
                <span>Descargar Gratis en PDF</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
