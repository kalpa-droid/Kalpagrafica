import React from 'react';
import { Sparkles, ShieldCheck, Layers } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="estudio" style={{
      padding: '5rem 1.5rem',
      maxWidth: 'var(--max-width)',
      margin: '0 auto'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
        {/* Photo Column */}
        <div style={{ position: 'relative' }}>
          <div style={{
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--border-luxury)',
            position: 'relative'
          }}>
            <img
              src="/assets/brand/ramiro.jpg"
              alt="José Ramiro Burgos - Fundador de Kalpagráfica"
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
            />
          </div>
          <div style={{
            position: 'absolute',
            bottom: '-1.5rem',
            right: '1rem',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--accent)',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--border-luxury)'
          }}>
            <strong style={{ display: 'block', fontSize: '1rem', fontFamily: 'var(--font-headline)' }}>
              José Ramiro Burgos
            </strong>
            <span style={{ fontSize: '0.78rem', color: 'var(--luxury)' }}>
              Fundador & Diseñador Estratégico
            </span>
          </div>
        </div>

        {/* Content Column */}
        <div>
          <span className="badge badge-gold" style={{ marginBottom: '0.8rem' }}>
            <Sparkles size={12} /> Sobre mí & Filosofía del Estudio
          </span>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '2.4rem', marginBottom: '1.2rem', lineHeight: 1.2 }}>
            La Búsqueda de la Inmortalidad Visual & el Rigor Técnico
          </h2>

          <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', marginBottom: '1.2rem', lineHeight: 1.6 }}>
            Kalpagráfica nace de la convicción de que el diseño gráfico no debe ser la simple confección de tendencias pasajeras. El término sánscrito <strong>"Kalpa"</strong> representa un ciclo cósmico de creación y evolución, dictando nuestra premisa: <em>el diseño y el aprendizaje son procesos indisolubles y vivos</em>.
          </p>

          <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', marginBottom: '1.8rem', lineHeight: 1.6 }}>
            Tanto al trazar la identidad visual para un emprendedor visionario como al diseñar planos técnicos para la <strong>Colección Mindy</strong>, aplicamos una <strong>Ingeniería Cero Errores</strong>. Diseñamos para eliminar el ruido visual y proveer un <em>Andamiaje Silencioso</em> que opera como un verdadero Tercer Maestro.
          </p>

          {/* Pillars Checklist */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <ShieldCheck size={20} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>Calidad de Herencia</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Recursos diseñados para perdurar intergeneracionalmente.</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <Layers size={20} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>Cognición Corporizada</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Materiales manipulativos que respetan la memoria muscular.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
