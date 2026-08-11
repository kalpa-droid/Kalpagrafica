import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Plus, ZoomIn, Download, Layers } from 'lucide-react';
import PhotoAlbum from 'react-photo-album';
import 'react-photo-album/rows.css';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

// Muestras iniciales de álbumes de diseño y fotografía de estudio
const INITIAL_PHOTOS = [
  {
    src: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
    width: 1200,
    height: 800,
    title: 'Diseño Editorial y Encuadernación',
    category: 'editorial'
  },
  {
    src: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1000&q=80',
    width: 1000,
    height: 1200,
    title: 'Identidad Visual & Marcas',
    category: 'identidad'
  },
  {
    src: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
    width: 1200,
    height: 900,
    title: 'Packaging & Maquetación Gráfica',
    category: 'packaging'
  },
  {
    src: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1000&q=80',
    width: 1000,
    height: 1400,
    title: 'Papelería Corporativa & Print',
    category: 'packaging'
  },
  {
    src: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80',
    width: 1200,
    height: 800,
    title: 'Abstract Geometric Composition',
    category: 'identidad'
  },
  {
    src: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80',
    width: 1000,
    height: 1250,
    title: 'Arte Tipográfico & Pósters',
    category: 'editorial'
  }
];

export default function AlbumSection() {
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);
  const [filter, setFilter] = useState('todos');
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [layoutMode, setLayoutMode] = useState('rows'); // 'rows' | 'masonry'

  const handleUploadPhotos = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newUploaded = files.map((file) => {
      const url = URL.createObjectURL(file);
      return {
        src: url,
        width: 1200,
        height: 800,
        title: file.name,
        category: 'usuario'
      };
    });

    setPhotos((prev) => [...newUploaded, ...prev]);
    setFilter('todos');
  };

  const filteredPhotos = filter === 'todos' 
    ? photos 
    : photos.filter((p) => p.category === filter);

  return (
    <section className="section-container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto 3rem' }}>
        <div className="font-caps" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)',
          backgroundColor: 'var(--accent-muted)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)',
          marginBottom: '1rem', border: '1px solid rgba(186,253,193,0.3)'
        }}>
          <Camera size={15} />
          <span>Álbumes & Galerías</span>
        </div>

        <h2 className="font-headline" style={{
          fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 700, letterSpacing: '-0.02em',
          color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '1.2rem'
        }}>
          Álbumes & Galerías de Fotos
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Disposición interactiva tipo mosaico/masonry para mostrar portfolios de diseño, fotografía y proyectos. Hacé clic en cualquier imagen para abrir el visor Lightbox con zoom en alta resolución.
        </p>
      </div>

      {/* Barra de Controles y Filtros */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Categorías */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'todos', label: 'Todas las fotos' },
            { id: 'editorial', label: 'Editorial & Libros' },
            { id: 'identidad', label: 'Identidad & Logos' },
            { id: 'packaging', label: 'Packaging' },
            { id: 'usuario', label: 'Mis Fotos Subidas' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className="btn btn-sm"
              style={{
                backgroundColor: filter === cat.id ? 'var(--accent)' : 'var(--bg-surface)',
                color: filter === cat.id ? '#08080A' : 'var(--text-secondary)',
                border: filter === cat.id ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                fontWeight: filter === cat.id ? 700 : 500
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Cargar Fotos Propias */}
        <div>
          <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} />
            <span>Subir Fotos al Álbum</span>
            <input type="file" accept="image/*" multiple onChange={handleUploadPhotos} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* Grid del Álbum usando react-photo-album */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
        {filteredPhotos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
            <ImageIcon size={40} color="var(--accent)" style={{ marginBottom: '1rem' }} />
            <p>No hay fotos en esta categoría. Subí tus propias imágenes con el botón superior.</p>
          </div>
        ) : (
          <PhotoAlbum
            photos={filteredPhotos}
            layout="rows"
            targetRowHeight={260}
            onClick={({ index }) => setLightboxIndex(index)}
          />
        )}
      </div>

      {/* Lightbox Modal con yet-another-react-lightbox */}
      <Lightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex}
        close={() => setLightboxIndex(-1)}
        slides={filteredPhotos.map((p) => ({ src: p.src, title: p.title }))}
      />
    </section>
  );
}
