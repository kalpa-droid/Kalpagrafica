import React from 'react';
import { Users, Mail, Radio, Mic, ArrowRight } from 'lucide-react';
import { InstagramIcon, LinkedinIcon, YoutubeIcon } from '../components/SocialIcons';

export default function CommunitySection() {
  return (
    <section id="comunidad" style={{
      padding: '5rem 1.5rem',
      maxWidth: 'var(--max-width)',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span className="badge badge-mint" style={{ marginBottom: '0.6rem' }}>
          <Users size={12} /> Comunidad & Contenido
        </span>
        <h2 style={{ color: 'var(--text-primary)', fontSize: '2.4rem', marginBottom: '0.8rem' }}>
          Ecosistema de Contenidos Centralizado
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto' }}>
          Accede a nuestras entrevistas, charlas sobre branding e ingeniería pedagógica, boletín técnico y redes sociales.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', marginBottom: '4rem' }}>
        {/* Box 1: Newsletter */}
        <div className="card-blueprint card-blueprint-active" style={{ padding: '2.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
            <Mail size={24} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>Boletín "Legado & Diseño"</h3>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Recibe semanalmente análisis técnicos de branding, micro-tutoriales de manufactura didáctica y novedades exclusivas antes que nadie.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <input
              type="email"
              placeholder="Ingresa tu correo profesional..."
              className="input"
            />
            <button className="btn btn-primary" style={{ padding: '0.85rem' }}>
              <span>Suscribirme Gratis</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Box 2: Podcast & Entrevistas */}
        <div className="card-blueprint" style={{ padding: '2.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
            <Mic size={24} style={{ color: 'var(--luxury)' }} />
            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>Podcast & Entrevistas (ChittChat)</h3>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
            Conversaciones en video sobre el proceso creativo, la superación del error de arrastre mecánico y la filosofía de marcas duraderas.
          </p>
          <div style={{
            backgroundColor: 'var(--bg-surface-2)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--bg-base)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
              <Radio size={22} />
            </div>
            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>
                Episodio 12: El Tercer Maestro en el Aula
              </strong>
              <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-disabled)' }}>45 min • Entrevista con Ramiro Burgos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Hub Grid */}
      <div className="card-blueprint" style={{
        padding: '2.5rem 2rem',
        textAlign: 'center'
      }}>
        <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Redes Sociales Centralizadas
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Sigue nuestro contenido técnico y de micro-demostraciones en tus plataformas favoritas:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="card-blueprint" style={{ padding: '1.5rem', textAlign: 'center', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
            <InstagramIcon size={32} color="#BAFDC1" />
            <strong style={{ color: 'var(--text-primary)' }}>Instagram Reels</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Micro-tutoriales 80/20</span>
          </a>

          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="card-blueprint" style={{ padding: '1.5rem', textAlign: 'center', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
            <LinkedinIcon size={32} color="#BAFDC1" />
            <strong style={{ color: 'var(--text-primary)' }}>LinkedIn B2B</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Casos de Estudio & EEAT</span>
          </a>

          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="card-blueprint" style={{ padding: '1.5rem', textAlign: 'center', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
            <YoutubeIcon size={32} color="#BAFDC1" />
            <strong style={{ color: 'var(--text-primary)' }}>YouTube Channel</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Demostraciones extensas</span>
          </a>
        </div>
      </div>
    </section>
  );
}
