import React, { useState } from 'react';
import { ShoppingBag, Eye } from 'lucide-react';
import { KalpaLogoHorizontal, KalpaLogoIcon } from '../components/KalpaLogos';

export default function StoreSection({ onSelectProduct }) {
  const [activeCategory, setActiveCategory] = useState('mindy');

  const products = [
    {
      id: 'mindy-pack-premium',
      category: 'mindy',
      title: 'Pack Premium Colección Mindy (5 Pilares)',
      price: '$35.000 ARS',
      oldPrice: '$45.000 ARS',
      image: '/assets/mindy/baraja-asociacion.jpg',
      description: 'Plataforma completa de infraestructura educativa digital Montessori. Incluye los 5 pilares estructurales + PDF Guía de Ingeniería de Manufactura.',
      specs: [
        'Llavero Manos Silábicas (Técnica Fold-Over)',
        'Murales Mosaico A4 (Doble Corte invisible)',
        'Baraja de Asociación (Patrón Infinito anti-desalineación)',
        'Murales Gigantes A3 + Libro Encuadernado',
        'Guía técnica de termodinámica del plastificado a 125 micras'
      ],
      isPopular: true
    },
    {
      id: 'mindy-llavero',
      category: 'mindy',
      title: 'Llavero Manos Silábicas',
      price: '$8.500 ARS',
      image: '/assets/mindy/llavero-manos-silabicas.png',
      description: 'Recurso didáctico manipulativo diseñado bajo el sistema de plegado espejo Fold-Over para una alineación milimétrica perfecta entre el anverso y el reverso.',
      specs: [
        'Plegado espejo Fold-Over pre-calculado',
        'Código de Color Montessori (Consonantes Rojas / Vocales Azules)',
        'Formato PDF vectorial descargable en alta definición',
        'Cero margen de error de arrastre mecánico'
      ]
    },
    {
      id: 'mindy-mosaico-a4',
      category: 'mindy',
      title: 'Murales Mosaico A4 Modular',
      price: '$9.500 ARS',
      image: '/assets/mindy/mural-mosaico-a4.png',
      description: 'Planos modulares para imprimir en impresora casera A4 y ensamblar murales gigantes con uniones de panelización invisibles al ojo y al tacto.',
      specs: [
        'Instrucciones de la técnica Doble Corte con bisturí',
        'Sistema de Solapamiento Inteligente de márgenes',
        'Fotografías reales sobre fondo blanco puro',
        'Ideal para aulas y rincones de lectura'
      ]
    },
    {
      id: 'mindy-baraja',
      category: 'mindy',
      title: 'Baraja de Asociación Autocorrectiva',
      price: '$11.000 ARS',
      image: '/assets/mindy/baraja-asociacion.jpg',
      description: 'Tarjetas didácticas equipadas con tecnología de Patrón Infinito de sangrado continuo en el reverso, absorbiendo cualquier fallo de alineación de impresora.',
      specs: [
        'Tecnología de Patrón Infinito en el reverso',
        'Resistencia a la desinfección con alcohol al 70%',
        'Fotografía 100% real sin dibujos animados sobrecargados',
        'Promueve la discriminación gramatical autónoma'
      ]
    },
    {
      id: 'mindy-libro',
      category: 'mindy',
      title: 'Libro Manos Silábicas (Encuadernado)',
      price: '$12.000 ARS',
      image: '/assets/mindy/libro-manos-silabicas.png',
      description: 'Cuaderno manipulativo con guías de perforación exactas y diseño de doble grosor para respetar la Cognición Corporizada y la memoria muscular del niño.',
      specs: [
        'Guías de perforación y encuadernado helicoidal',
        'Doble grosor para estimulación háptica',
        'Diseño autocorrectivo autónomo',
        'Sustrato recomendado: Opalina 200g+'
      ]
    },
    {
      id: 'mindy-mural-a3',
      category: 'mindy',
      title: 'Murales Gigantes A3 de Lectoescritura',
      price: '$7.500 ARS',
      image: '/assets/mindy/murales-gigantes-a3.jpg',
      description: 'Láminas de gran formato concebidas para propiciar una inmersión letrada masiva en el espacio del aula o del hogar.',
      specs: [
        'Formato A3 de alta resolución gráfica',
        'Cero ruido visual o distracción gráfica',
        'Crea un Tercer Maestro en la pared'
      ]
    },
    {
      id: 'plantilla-brand-guidelines',
      category: 'plantillas',
      title: 'Plantilla Presentación de Marca & Brand Manual',
      price: '$15.000 ARS',
      isSvgLogo: true,
      description: 'Plantilla digital profesional en Figma y Illustrator para presentar sistemas de identidad de marca a clientes con storytelling claro.',
      specs: [
        'Formato editable en Illustrator y Figma',
        'Estructura de 35 diapositivas ejecutivas',
        'Secciones de arquetipos, voz y sistema visual'
      ]
    },
    {
      id: 'presets-illustrator',
      category: 'recursos',
      title: 'Kit Presets & Paletas de Color Kalpagráfica',
      price: '$9.000 ARS',
      isSvgIcon: true,
      description: 'Colección de paletas HSL armonizadas, pinceles vectoriales y mockups de alta definición para diseñadores.',
      specs: [
        'Muestras de color .ASE y .CLR',
        'Mockups vectoriales libres de marca',
        'Guía de aplicación cromática'
      ]
    },
    {
      id: 'merch-poster',
      category: 'merch',
      title: 'Poster Manifiesto Kalpa (Formato Físico / Digital)',
      price: '$14.000 ARS',
      isSvgLogo: true,
      description: 'Poster editorial con el manifiesto "Forjamos Legados Visuales". Tipografía Space Grotesk en papel especial.',
      specs: [
        'Impresión en papel de 250g con textura',
        'Diseño minimalista editorial',
        'Edición numerada'
      ]
    }
  ];

  const filteredProducts = activeCategory === 'todos' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <section id="tienda" style={{
      padding: '5rem 1.5rem',
      maxWidth: 'var(--max-width)',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span className="badge badge-mint" style={{ marginBottom: '0.6rem' }}>
          <ShoppingBag size={12} /> Tienda Digital & Recursos
        </span>
        <h2 style={{ color: 'var(--text-primary)', fontSize: '2.4rem', marginBottom: '0.8rem' }}>
          Infraestructura Educativa Digital & Recursos de Diseño
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto' }}>
          Planos técnicos en PDF base de la <strong>Colección Mindy</strong> para construir materiales Montessori indestructibles en casa, junto a plantillas y presets digitales.
        </p>
      </div>

      {/* Categories Filter */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
        {[
          { id: 'mindy', label: 'Colección Mindy (Montessori)' },
          { id: 'plantillas', label: 'Plantillas Digitales' },
          { id: 'recursos', label: 'Presets & Recursos' },
          { id: 'merch', label: 'Merch de Estudio' },
          { id: 'todos', label: 'Ver Todo' }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className="font-caps"
            style={{
              padding: '0.65rem 1.4rem',
              borderRadius: 'var(--radius-md)',
              border: activeCategory === cat.id ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
              backgroundColor: activeCategory === cat.id ? 'var(--accent)' : 'var(--bg-surface-2)',
              color: activeCategory === cat.id ? '#08080A' : 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {filteredProducts.map((prod) => (
          <div key={prod.id} className="card-blueprint" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
            {prod.isPopular && (
              <span className="badge badge-gold font-mono" style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
                ⭐ Más Elegido
              </span>
            )}

            <div style={{
              height: '220px',
              backgroundColor: 'var(--bg-base)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              padding: '1.5rem',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              {prod.isSvgLogo ? (
                <KalpaLogoHorizontal style={{ width: '28%', height: 'auto', color: 'var(--accent)' }} />
              ) : prod.isSvgIcon ? (
                <KalpaLogoIcon style={{ height: '34px', width: 'auto', color: 'var(--accent)' }} />
              ) : (
                <img
                  src={prod.image}
                  alt={prod.title}
                  style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain' }}
                />
              )}
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                  {prod.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem', minHeight: '40px' }}>
                  {prod.description}
                </p>

                {/* Precios con JetBrains Mono (font-mono) */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '1.2rem' }}>
                  <span className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--accent)' }}>
                    {prod.price}
                  </span>
                  {prod.oldPrice && (
                    <span className="font-mono" style={{ fontSize: '0.95rem', color: 'var(--text-disabled)', textDecoration: 'line-through' }}>
                      {prod.oldPrice}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onSelectProduct(prod)}
                  style={{ flex: 1 }}
                >
                  <Eye size={16} />
                  <span>Ficha Técnica</span>
                </button>
                <a
                  href="https://link.mercadopago.com.ar/kalpagrafica"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  Comprar
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
