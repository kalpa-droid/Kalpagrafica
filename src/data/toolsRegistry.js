import { 
  Palette, 
  Ruler, 
  ScanEye, 
  Code, 
  Crop, 
  FileImage, 
  Terminal, 
  BookOpen, 
  CreditCard,
  Wrench
} from 'lucide-react';

/**
 * REGISTRO DINÁMICO DE HERRAMIENTAS DE KALPAGRÁFICA
 * Cualquier nueva herramienta que se agregue a este arreglo aparecerá
 * automáticamente en el Panel Lateral de Herramientas (Drawer Derecho) 
 * y en los menúes navegables del sitio.
 */
export const TOOLS_REGISTRY = [
  {
    id: 'impresion-libro',
    sectionId: 'impresion',
    title: 'Maquetador PDF & Tapas A5',
    category: 'Tools Impresión',
    icon: BookOpen,
    description: 'Creación de PDF fotocopia, tapas/contratapas A5 y recorte personalizado.'
  },
  {
    id: 'editor-tarjetas',
    sectionId: 'editor-tarjetas',
    title: 'Tools de Edición (Tarjetas & Credenciales)',
    category: 'Tools de Edición',
    icon: CreditCard,
    description: 'Maquetador interactivo 2D para tarjetas de presentación, credenciales y publicidad.'
  },
  {
    id: 'colour',
    sectionId: 'herramientas',
    title: 'Color OKLCH & Pantone® PMS',
    category: 'Tools Diseño',
    icon: Palette,
    description: 'Conversión OKLCH, coincidencia Pantone Coated/Uncoated y armonías cromáticas.'
  },
  {
    id: 'type',
    sectionId: 'herramientas',
    title: 'Escala Tipográfica & Papel',
    category: 'Tools Diseño',
    icon: Ruler,
    description: '15 presets de escalas tipográficas reales y cálculo de pliegos A4/A5.'
  },
  {
    id: 'analysis',
    sectionId: 'herramientas',
    title: 'Paletas & Visión Daltonismo',
    category: 'Tools Diseño',
    icon: ScanEye,
    description: 'Extracción de paletas desde imágenes y simulación diagnóstica de daltonismo.'
  },
  {
    id: 'svg',
    sectionId: 'herramientas',
    title: 'Optimizador SVG & Marcas de Agua',
    category: 'Tools Diseño',
    icon: Code,
    description: 'Limpieza de código vectorial SVG y aplicación de marcas de agua.'
  },
  {
    id: 'social',
    sectionId: 'herramientas',
    title: 'Social Cropper WebP',
    category: 'Tools Diseño',
    icon: Crop,
    description: 'Recorte con proporciones oficiales para redes sociales y exportación WebP.'
  },
  {
    id: 'assets',
    sectionId: 'herramientas',
    title: 'Generador de Favicon & Assets',
    category: 'Tools Diseño',
    icon: FileImage,
    description: 'Exportación de paquetes de favicons web, app icons e identidades visuales.'
  },
  {
    id: 'cli',
    sectionId: 'herramientas',
    title: 'Comandos CLI @kalpa-droid',
    category: 'Tools Diseño',
    icon: Terminal,
    description: 'Suite utilitaria ejecutable standalone directamente en la consola de comandos.'
  }
];
