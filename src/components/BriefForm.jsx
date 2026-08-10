import React, { useState } from 'react';
import { X, Send, CheckCircle2, Sparkles } from 'lucide-react';

export default function BriefForm({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'branding-completo',
    budget: '$500 - $1500 USD',
    vision: '',
    timeline: '1-2 meses'
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
        maxWidth: '600px',
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

        {!submitted ? (
          <div>
            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
                <Sparkles size={12} /> Brief Inicial — El Ritual Kalpa
              </span>
              <h3 style={{ marginTop: '0.5rem', fontSize: '1.6rem', color: 'var(--text-primary)' }}>
                Hablemos de tu Proyecto
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Completa este breve formulario guiado para evaluar la viabilidad estratégica y diseñar tu propuesta personalizada.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                  Nombre Completo / Estudio
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sofía Martínez"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                  Correo Electrónico de Contacto
                </label>
                <input
                  type="email"
                  required
                  placeholder="sofia@tuproyecto.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                    Tipo de Proyecto
                  </label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    className="input"
                  >
                    <option value="branding-completo">Identidad de Marca Completa</option>
                    <option value="rebranding">Rebranding Estratégico</option>
                    <option value="consultoria">Consultoría 1:1 de Posicionamiento</option>
                    <option value="editorial">Diseño Editorial / Presentación</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                    Plazo Estimado
                  </label>
                  <select
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    className="input"
                  >
                    <option value="inmediato">Urgente (&lt; 1 mes)</option>
                    <option value="1-2 meses">1 a 2 Meses</option>
                    <option value="planificado">Planificado (3+ meses)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                  Resumen de la Historia o Propósito de tu Marca
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Cuéntanos brevemente de qué trata tu emprendimiento y qué problema principal buscas resolver visualmente."
                  value={formData.vision}
                  onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                  className="input"
                  style={{ resize: 'none' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                <span>Enviar Brief Inicial</span>
                <Send size={16} />
              </button>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle2 size={56} style={{ color: 'var(--accent)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              ¡Brief Recibido con Éxito!
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Gracias por compartir la visión de tu proyecto, <strong>{formData.name}</strong>. Evaluaremos el alcance estratégico del Ritual Kalpa y te contactaremos en un plazo máximo de 24 a 48 horas hábiles.
            </p>
            <button onClick={onClose} className="btn btn-secondary">
              Cerrar y Continuar Explorando
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
